from sqlalchemy import select
from sqlalchemy.orm import Session
from app.modelos.candidato import Candidato
from app.esquemas.postulaciones import CandidatoPostulacion

def obtener_candidato_por_correo(correo:str, sesion:Session)-> Candidato | None :
  #quitar espacios del correo y convertir a minuscula
  correo_normalizado = correo.strip().lower()
  #construir la consulta
  consulta = select(Candidato).where(Candidato.correo == correo_normalizado)
  #ejecutar consulta y devolver candito o none
  return sesion.scalar(consulta)

def crear_candidato(datos:CandidatoPostulacion, sesion:Session)-> Candidato:
  #creamos el objeto
  candidato = Candidato(
    nombres= datos.nombres,
    apellidos= datos.apellidos,
    correo = datos.correo.strip().lower(), #normalizar correo
    telefono = datos.telefono,
    linkedin_url= datos.linkedin_url,
    github_url= datos.github_url,
    portafolio_url= datos.portafolio_url,
  )
  #añadimos el objeto a la sesion
  sesion.add(candidato)
  return candidato