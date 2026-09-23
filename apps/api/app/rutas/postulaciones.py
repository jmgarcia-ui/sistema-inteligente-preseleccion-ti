from typing import Annotated
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.esquemas.postulaciones import PostulacionRespuestaReclutador, PostulacionRespuestaCandidato
from app.servicios.postulaciones import VacanteNoDisponibleError, PostulacionDuplicadaError
from app.servicios.postulaciones import crear_postulacion
from app.esquemas.postulaciones import PostulacionCrear
from app.base_datos import obtener_sesion

router = APIRouter(
  prefix="/postulaciones",
  tags=["postulaciones"]
)

@router.post("", response_model=PostulacionRespuestaCandidato,status_code=status.HTTP_201_CREATED)
def crear(datos: PostulacionCrear, sesion: Annotated[Session, Depends(obtener_sesion)]) -> PostulacionRespuestaCandidato:
  try:
    postulacion = crear_postulacion(sesion, datos)
  except VacanteNoDisponibleError as error:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
  except PostulacionDuplicadaError as error:
      raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))
  
  return PostulacionRespuestaCandidato.model_validate(postulacion)
