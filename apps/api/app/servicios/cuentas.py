import hashlib
import html
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.configuracion import obtener_configuracion
from app.modelos import Rol, Usuario, Vacante
from app.modelos.enlace_acceso import EnlaceAcceso, TipoEnlace
from app.servicios.contrasenas import generar_hash
from app.servicios.correos import CorreoError, enviar_correo

ROLES = ("administrador", "reclutador")
MINIMO_CONTRASENA = 15
#cuánto dura cada enlace: la invitación da tiempo a que la persona la vea; el de restablecer es más corto
DURACION = {TipoEnlace.INVITACION: timedelta(days=7), TipoEnlace.RESTABLECER: timedelta(hours=24)}


class ReglaCuenta(ValueError):
  #una acción que no se permite (el mensaje se muestra tal cual al administrador)
  pass


class EnlaceInvalido(ValueError):
  pass


def ahora() -> datetime:
  #la base guarda las fechas en UTC sin zona
  return datetime.now(timezone.utc).replace(tzinfo=None)


def _hash(token: str) -> str:
  return hashlib.sha256(token.encode()).hexdigest()


def url_del_enlace(token: str) -> str:
  #el token va después de "#": el navegador no lo envía a ningún servidor ni queda en registros de acceso
  return f"{obtener_configuracion().frontend_url.rstrip('/')}/crear-contrasena#{token}"


# ---- consultas ----

def listar_usuarios(sesion: Session) -> list[tuple[Usuario, int]]:
  vacantes = select(Vacante.id_creador, func.count().label("total")).group_by(Vacante.id_creador).subquery()
  consulta = (
    select(Usuario, func.coalesce(vacantes.c.total, 0))
    .outerjoin(vacantes, vacantes.c.id_creador == Usuario.id)
    .order_by(Usuario.activo.desc(), Usuario.nombres, Usuario.apellidos)
  )
  return [(usuario, total) for usuario, total in sesion.execute(consulta).all()]


def contar_vacantes(sesion: Session, usuario: Usuario) -> int:
  return sesion.scalar(select(func.count()).select_from(Vacante).where(Vacante.id_creador == usuario.id)) or 0


def _administradores_activos(sesion: Session) -> int:
  return sesion.scalar(select(func.count()).select_from(Usuario).join(Usuario.rol).where(Rol.nombre == "administrador", Usuario.activo.is_(True))) or 0


def _rol(sesion: Session, nombre: str) -> Rol:
  rol = sesion.scalar(select(Rol).where(Rol.nombre == nombre))
  if rol is None:
    raise ReglaCuenta(f"No existe el rol {nombre}.")
  return rol


# ---- acciones del administrador ----

def invitar(sesion: Session, administrador: Usuario, nombres: str, apellidos: str, correo: str, rol: str) -> tuple[Usuario, str, datetime]:
  correo = correo.strip().lower()
  if sesion.scalar(select(Usuario).where(Usuario.correo == correo)):
    raise ReglaCuenta("Ya existe una cuenta con ese correo.")
  usuario = Usuario(
    rol=_rol(sesion, rol),
    nombres=nombres.strip(),
    apellidos=apellidos.strip(),
    correo=correo,
    #contraseña aleatoria que nadie conoce: hasta usar la invitación no se puede entrar
    contrasena_hash=generar_hash(secrets.token_urlsafe(32)),
    invitacion_pendiente=True,
  )
  sesion.add(usuario)
  sesion.flush()
  token, expira = _nuevo_enlace(sesion, usuario, TipoEnlace.INVITACION, administrador)
  sesion.commit()
  sesion.refresh(usuario)
  return usuario, token, expira


def actualizar(sesion: Session, administrador: Usuario, usuario: Usuario, *, nombres: str | None, apellidos: str | None, rol: str | None, activo: bool | None) -> Usuario:
  es_uno_mismo = usuario.id == administrador.id
  if rol is not None and rol != usuario.rol.nombre:
    if es_uno_mismo:
      raise ReglaCuenta("No puedes cambiar tu propio rol. Pídeselo a otro administrador.")
    if usuario.rol.nombre == "administrador" and usuario.activo and _administradores_activos(sesion) <= 1:
      raise ReglaCuenta("Debe quedar al menos un administrador activo.")
    usuario.rol = _rol(sesion, rol)
  if activo is not None and activo != usuario.activo:
    if es_uno_mismo:
      raise ReglaCuenta("No puedes desactivar tu propia cuenta.")
    if not activo and usuario.rol.nombre == "administrador" and _administradores_activos(sesion) <= 1:
      raise ReglaCuenta("Debe quedar al menos un administrador activo.")
    usuario.activo = activo
    if not activo:
      #una cuenta desactivada no puede seguir usando enlaces pendientes
      _anular_enlaces(sesion, usuario)
  if nombres is not None:
    usuario.nombres = nombres.strip()
  if apellidos is not None:
    usuario.apellidos = apellidos.strip()
  sesion.commit()
  sesion.refresh(usuario)
  return usuario


def nuevo_enlace(sesion: Session, administrador: Usuario, usuario: Usuario) -> tuple[TipoEnlace, str, datetime]:
  if not usuario.activo:
    raise ReglaCuenta("La cuenta está desactivada. Reactívala antes de enviarle un enlace.")
  #quien no creó su contraseña recibe otra invitación; los demás, un enlace para restablecerla
  tipo = TipoEnlace.INVITACION if usuario.invitacion_pendiente else TipoEnlace.RESTABLECER
  token, expira = _nuevo_enlace(sesion, usuario, tipo, administrador)
  sesion.commit()
  return tipo, token, expira


def _nuevo_enlace(sesion: Session, usuario: Usuario, tipo: TipoEnlace, administrador: Usuario | None) -> tuple[str, datetime]:
  #solo vale el último enlace de cada persona
  _anular_enlaces(sesion, usuario)
  token = secrets.token_urlsafe(32)
  expira = ahora() + DURACION[tipo]
  sesion.add(EnlaceAcceso(usuario=usuario, tipo=tipo, token_hash=_hash(token), expira_en=expira, creado_por_id=administrador.id if administrador else None))
  return token, expira


def _anular_enlaces(sesion: Session, usuario: Usuario) -> None:
  sesion.execute(update(EnlaceAcceso).where(EnlaceAcceso.id_usuario == usuario.id, EnlaceAcceso.usado_en.is_(None)).values(usado_en=ahora()))


def enviar_enlace(usuario: Usuario, tipo: TipoEnlace, token: str, expira: datetime, administrador: Usuario) -> bool:
  #devuelve si se pudo enviar; si no, el administrador puede copiar el enlace y mandarlo por otro medio
  url = html.escape(url_del_enlace(token), quote=True)
  nombre = html.escape(usuario.nombres.split(" ")[0])
  quien = html.escape(f"{administrador.nombres} {administrador.apellidos}")
  vence = expira.strftime("%d/%m/%Y a las %H:%M (UTC)")
  if tipo == TipoEnlace.INVITACION:
    asunto = "Te invitaron al equipo de selección"
    cuerpo = (
      f"<p>Hola {nombre},</p>"
      f"<p>{quien} te invitó a unirte al sistema de preselección como <strong>{html.escape(usuario.rol.nombre)}</strong>.</p>"
      f'<p><a href="{url}">Crear mi contraseña</a></p>'
      f"<p>El enlace vence el {vence} y solo se puede usar una vez.</p>"
    )
  else:
    asunto = "Restablece tu contraseña"
    cuerpo = (
      f"<p>Hola {nombre},</p>"
      f"<p>{quien} te envió un enlace para que crees una contraseña nueva.</p>"
      f'<p><a href="{url}">Crear una contraseña nueva</a></p>'
      f"<p>El enlace vence el {vence} y solo se puede usar una vez. Si no lo pediste, avísale a tu administrador.</p>"
    )
  try:
    enviar_correo(usuario.correo, f"{usuario.nombres} {usuario.apellidos}", asunto, cuerpo)
    return True
  except CorreoError:
    return False


# ---- uso del enlace (público) ----

def enlace_valido(sesion: Session, token: str) -> EnlaceAcceso:
  enlace = sesion.scalar(select(EnlaceAcceso).where(EnlaceAcceso.token_hash == _hash(token)))
  if enlace is None:
    raise EnlaceInvalido("Este enlace no existe. Revisa que lo copiaste completo.")
  if enlace.usado_en is not None:
    raise EnlaceInvalido("Este enlace ya se usó o fue reemplazado por uno más nuevo.")
  if enlace.expira_en <= ahora():
    raise EnlaceInvalido("Este enlace venció.")
  if not enlace.usuario.activo:
    raise EnlaceInvalido("La cuenta está desactivada.")
  return enlace


def usar_enlace(sesion: Session, token: str, contrasena: str) -> Usuario:
  enlace = enlace_valido(sesion, token)
  if len(contrasena) < MINIMO_CONTRASENA:
    raise ReglaCuenta(f"La contraseña necesita al menos {MINIMO_CONTRASENA} caracteres.")
  usuario = enlace.usuario
  usuario.contrasena_hash = generar_hash(contrasena)
  usuario.invitacion_pendiente = False
  usuario.ultimo_acceso_en = ahora()
  _anular_enlaces(sesion, usuario)
  sesion.commit()
  return usuario
