from sqlalchemy.orm import Session
from app.modelos.registro_accion import TipoAccion
from app.servicios.registro import registrar
from app.esquemas.vacantes import VacanteCrear, VacanteActualizar
from app.modelos.vacante import EstadoVacante, Vacante
from app.esquemas.vacantes import RequisitoCrear
from app.modelos.requisito_vacante import RequisitoVacante
from app.modelos.usuario import Usuario
from sqlalchemy import select
from datetime import date

#se lanza cuando alguien intenta publicar una vacante cuya fecha límite ya pasó
class VacanteVencidaError(Exception):
  pass

def construir_requisitos(requisitos: list[RequisitoCrear]) -> list[RequisitoVacante]:
  datos_requisitos = []
  for posicion, req in enumerate(requisitos, start=1):
    requisito = RequisitoVacante(
      descripcion=req.descripcion,
      obligatorio= req.obligatorio,
      orden= posicion
    )
    datos_requisitos.append(requisito)
  return datos_requisitos


def crear_vacante(sesion:Session, datos: VacanteCrear, id_creador: int) -> Vacante:
  #creamos el objeto
  vacante = Vacante(
    id_creador=id_creador,
    titulo=datos.titulo,
    descripcion=datos.descripcion,
    requisitos=construir_requisitos(datos.requisitos),
    modalidad=datos.modalidad,
    ubicacion=datos.ubicacion,
    fecha_limite=datos.fecha_limite,
  )
  #añadimos el objeto a la sesion (no se guarda aún)
  sesion.add(vacante)
  registrar(sesion, TipoAccion.VACANTE_CREADA, f'Creó la vacante "{vacante.titulo}"', vacante=vacante, usuario=sesion.get(Usuario, id_creador))
  #se guarda en la bd el objeto
  sesion.commit()
  #vacante recibe el id generado por sql server y el enum "borrador"
  sesion.refresh(vacante)
  return vacante

def obtener_vacante_por_id(sesion: Session, id_vacante: int) -> Vacante | None:
  #buscar directamente por llave primaria
  return sesion.get(Vacante, id_vacante)

def puede_editar_vacante(usuario: Usuario, vacante: Vacante) -> bool:
  return(usuario.rol.nombre == "administrador" or vacante.id_creador == usuario.id)

def actualizar_vacante(sesion: Session, vacante:Vacante, datos:VacanteActualizar) -> Vacante:
  cambios = datos.model_dump(exclude_unset=True)
  la_publican = cambios.get("estado") == EstadoVacante.PUBLICADA
  fecha_final = cambios.get("fecha_limite", vacante.fecha_limite)

  if la_publican and fecha_final < date.today():
    raise  VacanteVencidaError("La fecha límite ya pasó. Elige una nueva fecha para publicarla.")

  requisitos_enviados = cambios.pop("requisitos", None)

  for campo, valor in cambios.items():
    setattr(vacante, campo, valor)

  if requisitos_enviados is not None:
    vacante.requisitos.clear()
    sesion.flush()
    vacante.requisitos = construir_requisitos(datos.requisitos)

  sesion.commit()
  sesion.refresh(vacante)
  return vacante

def listar_vacantes_publicas(sesion: Session) -> list[Vacante]:
  #creamos la consulta
  consulta = select(Vacante).where(Vacante.estado == EstadoVacante.PUBLICADA, Vacante.fecha_limite >= date.today())

  #ejecutar consulta
  #.all() los convierte en una lista
  return sesion.scalars(consulta).all()


def listar_vacantes(sesion: Session, usuario: Usuario) -> list[Vacante]:
  consulta = select(Vacante).order_by(Vacante.creado_en.desc())
  if usuario.rol.nombre != "administrador":
    consulta = consulta.where(Vacante.id_creador == usuario.id)

  return sesion.scalars(consulta).all()

def obtener_vacante_publica_por_id(sesion: Session, id_vacante: int) -> Vacante | None:
  #crear la consulta
  consulta = select(Vacante).where(
    Vacante.estado == EstadoVacante.PUBLICADA, 
    Vacante.fecha_limite >= date.today(),
    Vacante.id == id_vacante,
  ) 

  #ejecutar consulta
  return sesion.scalar(consulta)

