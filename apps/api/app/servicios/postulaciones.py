from sqlalchemy.orm import Session
from app.modelos.postulacion import Postulacion
from app.esquemas.postulaciones import PostulacionCrear
from app.servicios.candidatos import obtener_candidato_por_correo, crear_candidato
from app.servicios.vacantes import obtener_vacante_publica_por_id
from sqlalchemy import select

class VacanteNoDisponibleError(Exception):
  pass

class PostulacionDuplicadaError(Exception):
  pass


#verificar si esta postulacion ya existe, asi evitar duplicados
def obtener_postulacion_existente(sesion: Session, id_candidato: int, id_vacante: int) -> Postulacion | None:
  #buscar y retornar respuesta
  consulta = select(Postulacion).where(Postulacion.id_vacante == id_vacante, Postulacion.id_candidato == id_candidato)
  #ejecuto la consulta
  return sesion.scalar(consulta)

def crear_postulacion(sesion: Session, datos: PostulacionCrear) -> Postulacion:
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


  #crear postulacion
  postulacion = Postulacion(
    vacante = vacante,
    candidato = candidato
  )
  sesion.add(postulacion)
  sesion.commit()
  sesion.refresh(candidato)
  sesion.refresh(postulacion)
  return postulacion