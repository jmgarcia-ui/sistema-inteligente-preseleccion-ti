from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modelos.analisis_cv import AnalisisCv
from app.modelos.lectura_cv import LecturaCv
from app.modelos.postulacion import EstadoPostulacion, Postulacion
from app.modelos.usuario import Usuario
from app.modelos.vacante import Vacante

#orden de la bandeja: primero lo que falta decidir y, dentro de cada grupo, quien lleva más tiempo esperando
PRIORIDAD = {
  EstadoPostulacion.RECIBIDA: 0,
  EstadoPostulacion.EN_REVISION: 1,
  EstadoPostulacion.PRESELECCIONADA: 2,
  EstadoPostulacion.DESCARTADA: 3,
  EstadoPostulacion.RETIRADA: 4,
}


def listar_candidatos(sesion: Session, usuario: Usuario, id_vacante: int | None = None) -> list[tuple[Postulacion, LecturaCv | None, AnalisisCv | None]]:
  consulta = (
    select(Postulacion, LecturaCv, AnalisisCv)
    .join(Postulacion.vacante)
    #outer join: las postulaciones antiguas no tienen lectura ni análisis
    .outerjoin(LecturaCv, LecturaCv.id_postulacion == Postulacion.id)
    .outerjoin(AnalisisCv, AnalisisCv.id_postulacion == Postulacion.id)
  )
  if usuario.rol.nombre != "administrador":
    consulta = consulta.where(Vacante.id_creador == usuario.id)
  if id_vacante is not None:
    consulta = consulta.where(Postulacion.id_vacante == id_vacante)
  filas = sesion.execute(consulta).all()
  return sorted(((p, l, a) for p, l, a in filas), key=lambda fila: (PRIORIDAD[fila[0].estado], fila[0].creado_en))


def decidir(sesion: Session, postulacion: Postulacion, usuario: Usuario, estado: EstadoPostulacion, motivo: str | None) -> Postulacion:
  postulacion.estado = estado
  #el motivo solo se guarda al descartar; volver atrás lo limpia
  postulacion.decision_motivo = motivo if estado == EstadoPostulacion.DESCARTADA else None
  postulacion.decidido_por_id = usuario.id
  postulacion.decidido_en = func.sysutcdatetime()
  sesion.commit()
  sesion.refresh(postulacion)
  return postulacion
