from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modelos.postulacion import Postulacion
from app.modelos.registro_accion import RegistroAccion, TipoAccion
from app.modelos.usuario import Usuario
from app.modelos.vacante import Vacante


#anota una acción; no hace commit: se guarda junto con el cambio que la originó (o no se guarda nada)
def registrar(
  sesion: Session,
  tipo: TipoAccion,
  descripcion: str,
  *,
  vacante: Vacante,
  postulacion: Postulacion | None = None,
  usuario: Usuario | None = None,
  detalle: str | None = None,
) -> None:
  sesion.add(
    RegistroAccion(
      tipo=tipo.value,
      descripcion=descripcion[:500],
      detalle=detalle[:500] if detalle else None,
      vacante=vacante,
      postulacion=postulacion,
      usuario=usuario,
    )
  )


def nombre_de(postulacion: Postulacion) -> str:
  return f"{postulacion.candidato.nombres} {postulacion.candidato.apellidos}"


#las acciones de las vacantes del usuario (todas, si es administrador), de la más nueva a la más vieja
def listar_acciones(
  sesion: Session,
  usuario: Usuario,
  *,
  id_postulacion: int | None = None,
  tipos: list[str] | None = None,
  antes_de: int | None = None,
  limite: int = 50,
) -> list[RegistroAccion]:
  consulta = select(RegistroAccion).join(RegistroAccion.vacante)
  if usuario.rol.nombre != "administrador":
    consulta = consulta.where(Vacante.id_creador == usuario.id)
  if id_postulacion is not None:
    consulta = consulta.where(RegistroAccion.id_postulacion == id_postulacion)
  if tipos:
    consulta = consulta.where(RegistroAccion.tipo.in_(tipos))
  #paginación: "antes_de" es el id de la última acción ya mostrada
  if antes_de is not None:
    consulta = consulta.where(RegistroAccion.id < antes_de)
  return list(sesion.scalars(consulta.order_by(RegistroAccion.id.desc()).limit(limite)))
