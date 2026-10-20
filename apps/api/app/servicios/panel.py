from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.modelos.usuario import Usuario
from app.modelos.vacante import EstadoVacante, Vacante
from app.modelos.postulacion import EstadoPostulacion, Postulacion


def _consulta_por_estado(usuario: Usuario, estado: EstadoVacante):
  consulta = select(Vacante).where(Vacante.estado == estado)
  if usuario.rol.nombre != "administrador":
    consulta = consulta.where(Vacante.id_creador == usuario.id)
  return consulta

#traer todas las vacantes
def listar_vacantes_panel(sesion: Session, usuario: Usuario):
  vacantes_publicadas = sesion.scalars(_consulta_por_estado(usuario, EstadoVacante.PUBLICADA).order_by(Vacante.fecha_limite)).all()

  vacantes_borrador = sesion.scalars(_consulta_por_estado(usuario, EstadoVacante.BORRADOR).order_by(Vacante.creado_en.desc())).all()

  return list(vacantes_publicadas) + list(vacantes_borrador)


def contar_postulaciones(sesion: Session, ids_vacante: list[int]):
  if not ids_vacante:
    return {}

  consulta = select(Postulacion.id_vacante, Postulacion.estado, func.count(Postulacion.id)).where(Postulacion.id_vacante.in_(ids_vacante)).group_by(Postulacion.id_vacante, Postulacion.estado)

  filas = sesion.execute(consulta).all()

  resultado = {}
  for id_vacante, estado, cantidad in filas:
    cajita = resultado.setdefault(id_vacante, {})
    cajita[estado.value] = cantidad

  return resultado


def listar_por_revisar(sesion: Session, ids_vacante: list[int] ):
  if not ids_vacante:
    return []

  consulta = select(Postulacion).where(Postulacion.id_vacante.in_(ids_vacante), Postulacion.estado == EstadoPostulacion.RECIBIDA).order_by(Postulacion.creado_en).limit(5)

  return sesion.scalars(consulta).all()