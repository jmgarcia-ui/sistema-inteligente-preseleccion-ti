import json
import logging
from dataclasses import asdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.base_datos import FabricaSesiones
from app.modelos.lectura_cv import EstadoLectura, LecturaCv
from app.servicios.almacenamiento import leer_cv
from app.servicios.document_intelligence import contar_paginas_pdf, leer_documento

registro = logging.getLogger(__name__)


def obtener_lectura(sesion: Session, id_postulacion: int) -> LecturaCv | None:
  return sesion.scalar(select(LecturaCv).where(LecturaCv.id_postulacion == id_postulacion))


#deja la lectura lista para procesarse de nuevo (por ejemplo, tras un error)
def reiniciar_lectura(sesion: Session, lectura: LecturaCv) -> LecturaCv:
  lectura.estado = EstadoLectura.PENDIENTE
  lectura.error = None
  sesion.commit()
  sesion.refresh(lectura)
  return lectura


#se ejecuta en segundo plano, después de responder al candidato: por eso abre su propia sesión
def procesar_lectura(id_postulacion: int) -> None:
  with FabricaSesiones() as sesion:
    lectura = obtener_lectura(sesion, id_postulacion)
    #sin lectura o ya leída: no hay nada que hacer (evita leer dos veces el mismo CV)
    if lectura is None or lectura.estado in (EstadoLectura.LEYENDO, EstadoLectura.LEIDO):
      return
    clave = lectura.postulacion.cv_clave
    if not clave:
      _marcar_error(sesion, lectura, "La postulación no tiene CV.")
      return

    lectura.estado = EstadoLectura.LEYENDO
    sesion.commit()

    try:
      contenido = leer_cv(clave)
      resultado = leer_documento(contenido)
    except Exception as error:  #cualquier fallo queda registrado y la lectura se puede reintentar
      registro.exception("No se pudo leer el CV de la postulación %s", id_postulacion)
      _marcar_error(sesion, lectura, str(error))
      return

    lectura.estado = EstadoLectura.LEIDO
    lectura.modelo = resultado.modelo
    lectura.paginas_documento = contar_paginas_pdf(contenido)
    lectura.paginas_leidas = resultado.paginas_leidas
    lectura.contenido = resultado.contenido
    lectura.parrafos = json.dumps([asdict(parrafo) for parrafo in resultado.parrafos], ensure_ascii=False)
    lectura.error = None
    sesion.commit()

  #con el CV leído, la IA lo compara con los requisitos (fuera de la sesión de lectura, que ya se cerró)
  from app.servicios.analisis_cv import procesar_analisis

  procesar_analisis(id_postulacion)


def _marcar_error(sesion: Session, lectura: LecturaCv, mensaje: str) -> None:
  lectura.estado = EstadoLectura.ERROR
  lectura.error = mensaje[:500]
  sesion.commit()
