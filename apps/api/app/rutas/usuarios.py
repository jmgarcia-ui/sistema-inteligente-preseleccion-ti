from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.autorizacion import obtener_administrador
from app.base_datos import obtener_sesion
from app.esquemas.credenciales import RespuestaToken
from app.esquemas.usuarios import ActualizarUsuario, CrearContrasena, InfoEnlace, InvitarUsuario, ResultadoEnlace, TokenEnlace, UsuarioAdmin
from app.modelos import Usuario
from app.servicios import cuentas
from app.servicios.tokens import generar_token_acceso

Sesion = Annotated[Session, Depends(obtener_sesion)]
Administrador = Annotated[Usuario, Depends(obtener_administrador)]

#gestión de cuentas del equipo: solo administradores
router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])
#la persona invitada (o que olvidó su contraseña) usa su enlace sin haber iniciado sesión
router_cuentas = APIRouter(prefix="/cuentas", tags=["cuentas"])


def _respuesta(usuario: Usuario, vacantes: int) -> UsuarioAdmin:
  return UsuarioAdmin(
    id=usuario.id,
    nombres=usuario.nombres,
    apellidos=usuario.apellidos,
    correo=usuario.correo,
    rol=usuario.rol.nombre,
    activo=usuario.activo,
    invitacion_pendiente=usuario.invitacion_pendiente,
    ultimo_acceso_en=usuario.ultimo_acceso_en,
    creado_en=usuario.creado_en,
    vacantes=vacantes,
  )


def _usuario(sesion: Session, id_usuario: int) -> Usuario:
  usuario = sesion.get(Usuario, id_usuario)
  if usuario is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cuenta no encontrada")
  return usuario


@router.get("", response_model=list[UsuarioAdmin])
def listar(sesion: Sesion, _administrador: Administrador) -> list[UsuarioAdmin]:
  return [_respuesta(usuario, vacantes) for usuario, vacantes in cuentas.listar_usuarios(sesion)]


#crea la cuenta sin contraseña y le envía la invitación por correo
@router.post("", response_model=ResultadoEnlace, status_code=status.HTTP_201_CREATED)
def invitar(datos: InvitarUsuario, sesion: Sesion, administrador: Administrador) -> ResultadoEnlace:
  try:
    usuario, token, expira = cuentas.invitar(sesion, administrador, datos.nombres, datos.apellidos, datos.correo, datos.rol)
  except cuentas.ReglaCuenta as error:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))
  enviado = cuentas.enviar_enlace(usuario, cuentas.TipoEnlace.INVITACION, token, expira, administrador)
  return ResultadoEnlace(usuario=_respuesta(usuario, 0), tipo="invitacion", enlace=cuentas.url_del_enlace(token), expira_en=expira, correo_enviado=enviado)


@router.patch("/{id_usuario}", response_model=UsuarioAdmin)
def actualizar(id_usuario: int, datos: ActualizarUsuario, sesion: Sesion, administrador: Administrador) -> UsuarioAdmin:
  usuario = _usuario(sesion, id_usuario)
  try:
    cuentas.actualizar(sesion, administrador, usuario, nombres=datos.nombres, apellidos=datos.apellidos, rol=datos.rol, activo=datos.activo)
  except cuentas.ReglaCuenta as error:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))
  return _respuesta(usuario, cuentas.contar_vacantes(sesion, usuario))


#reenvía la invitación o, si ya tiene contraseña, un enlace para restablecerla; el anterior deja de servir
@router.post("/{id_usuario}/enlace", response_model=ResultadoEnlace)
def enviar_enlace(id_usuario: int, sesion: Sesion, administrador: Administrador) -> ResultadoEnlace:
  usuario = _usuario(sesion, id_usuario)
  try:
    tipo, token, expira = cuentas.nuevo_enlace(sesion, administrador, usuario)
  except cuentas.ReglaCuenta as error:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))
  enviado = cuentas.enviar_enlace(usuario, tipo, token, expira, administrador)
  return ResultadoEnlace(
    usuario=_respuesta(usuario, cuentas.contar_vacantes(sesion, usuario)), tipo=tipo.value, enlace=cuentas.url_del_enlace(token), expira_en=expira, correo_enviado=enviado
  )


#---- públicos ----
#POST y no GET: el token viaja en el cuerpo, no en la dirección (no queda en registros)

@router_cuentas.post("/enlace", response_model=InfoEnlace)
def consultar_enlace(datos: TokenEnlace, sesion: Sesion) -> InfoEnlace:
  try:
    enlace = cuentas.enlace_valido(sesion, datos.token)
  except cuentas.EnlaceInvalido as error:
    raise HTTPException(status_code=status.HTTP_410_GONE, detail=str(error))
  return InfoEnlace(nombres=enlace.usuario.nombres, correo=enlace.usuario.correo, tipo=enlace.tipo.value)


#crea la contraseña y deja la sesión iniciada
@router_cuentas.post("/contrasena", response_model=RespuestaToken)
def crear_contrasena(datos: CrearContrasena, sesion: Sesion) -> RespuestaToken:
  try:
    usuario = cuentas.usar_enlace(sesion, datos.token, datos.contrasena)
  except cuentas.EnlaceInvalido as error:
    raise HTTPException(status_code=status.HTTP_410_GONE, detail=str(error))
  except cuentas.ReglaCuenta as error:
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(error))
  return RespuestaToken(token_acceso=generar_token_acceso(usuario.id))
