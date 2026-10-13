from typing import Annotated
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.esquemas.postulaciones import PostulacionRespuestaReclutador, PostulacionRespuestaCandidato
from app.servicios.postulaciones import VacanteNoDisponibleError, PostulacionDuplicadaError
from app.servicios.postulaciones import crear_postulacion, listar_postulaciones_por_vacante
from app.servicios.vacantes import obtener_vacante_por_id, puede_editar_vacante
from app.esquemas.postulaciones import PostulacionCrear
from app.autorizacion import obtener_gestor_vacantes
from app.base_datos import obtener_sesion
from app.modelos import Usuario

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


@router.get("/vacante/{id_vacante}", response_model=list[PostulacionRespuestaReclutador])
def listar_postulaciones(id_vacante: int, sesion: Annotated[Session, Depends(obtener_sesion)], usuario: Annotated[Usuario, Depends(obtener_gestor_vacantes)]) -> list[PostulacionRespuestaReclutador]:
  #buscar la vacante sin importar su estado (el reclutador revisa tambien las cerradas)
  vacante = obtener_vacante_por_id(sesion, id_vacante)
  if vacante is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vacante no encontrada")
  #solo el creador de la vacante o un administrador ve sus postulaciones
  if not puede_editar_vacante(usuario, vacante):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver estas postulaciones")

  postulaciones = listar_postulaciones_por_vacante(sesion, id_vacante)
  return [PostulacionRespuestaReclutador.model_validate(postulacion) for postulacion in postulaciones]
