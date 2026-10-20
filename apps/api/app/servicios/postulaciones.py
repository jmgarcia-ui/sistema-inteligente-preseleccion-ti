from sqlalchemy.orm import Session
from app.modelos.postulacion import Postulacion
from app.modelos.lectura_cv import LecturaCv
from app.esquemas.postulaciones import PostulacionCrear
from app.servicios.candidatos import obtener_candidato_por_correo, crear_candidato
from app.servicios.vacantes import obtener_vacante_publica_por_id
from app.servicios.almacenamiento import borrar_cv, guardar_cv
from sqlalchemy import select, func

#el CV es un PDF de hasta 5 MB
TAMANO_MAXIMO_CV = 5 * 1024 * 1024

class VacanteNoDisponibleError(Exception):
  pass

class PostulacionDuplicadaError(Exception):
  pass

class CvInvalidoError(Exception):
  pass


#revisa el archivo antes de guardar nada; el mensaje se muestra tal cual al candidato
def validar_cv(contenido: bytes, nombre: str | None) -> None:
  if len(contenido) == 0:
    raise CvInvalidoError("Adjunta tu CV en PDF.")
  if len(contenido) > TAMANO_MAXIMO_CV:
    raise CvInvalidoError("Tu CV pesa más de 5 MB. Sube una versión más liviana.")
  #un PDF real empieza con "%PDF-"; no basta con que el nombre termine en .pdf
  if not contenido.startswith(b"%PDF-") or not (nombre or "").lower().endswith(".pdf"):
    raise CvInvalidoError("Tu CV tiene que ser un archivo PDF.")


#verificar si esta postulacion ya existe, asi evitar duplicados
def obtener_postulacion_existente(sesion: Session, id_candidato: int, id_vacante: int) -> Postulacion | None:
  #buscar y retornar respuesta
  consulta = select(Postulacion).where(Postulacion.id_vacante == id_vacante, Postulacion.id_candidato == id_candidato)
  #ejecuto la consulta
  return sesion.scalar(consulta)

def crear_postulacion(sesion: Session, datos: PostulacionCrear, cv: bytes, cv_nombre: str) -> Postulacion:
  #buscar vacante publica y vigente
  vacante = obtener_vacante_publica_por_id(sesion, datos.id_vacante)
  if vacante is None:
    raise VacanteNoDisponibleError("La vacante no disponible")
  #buscamos si el candidato existe
  candidato= obtener_candidato_por_correo(datos.candidato.correo, sesion)

  if candidato is None:
    candidato = crear_candidato(datos.candidato, sesion)
  else:
    #buscar si existe una postulacion
    postulacion_ex = obtener_postulacion_existente(sesion, candidato.id, vacante.id)
    if postulacion_ex is not None:
      raise PostulacionDuplicadaError("Ya postulaste a esta vacante")
    
  #el CV se guarda recién cuando ya se sabe que la postulación es válida
  cv_clave = guardar_cv(cv)

  #crear postulacion
  postulacion = Postulacion(
    vacante = vacante,
    candidato = candidato,
    acepto_tratamiento_datos_en = func.sysutcdatetime(),
    cv_nombre = cv_nombre[:255],
    cv_clave = cv_clave,
    cv_tamano = len(cv),
  )
  sesion.add(postulacion)
  #la lectura del CV nace pendiente; se procesa en segundo plano después de responder
  sesion.add(LecturaCv(postulacion=postulacion))
  try:
    sesion.commit()
  except Exception:
    #si la base de datos falla, el archivo no debe quedar huérfano
    sesion.rollback()
    borrar_cv(cv_clave)
    raise
  sesion.refresh(candidato)
  sesion.refresh(postulacion)
  return postulacion

def listar_postulaciones_por_vacante(sesion:Session, id:int) -> list[Postulacion]:
  #construimos la consulta
  consulta = select(Postulacion).where(Postulacion.id_vacante == id)
  #ejecutar consulta
  #.all() los convierte en una lista
  return sesion.scalars(consulta).all()