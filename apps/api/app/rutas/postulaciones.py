from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, UploadFile, status, HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.esquemas.postulaciones import PostulacionRespuestaReclutador, PostulacionRespuestaCandidato
from app.servicios.postulaciones import VacanteNoDisponibleError, PostulacionDuplicadaError, CvInvalidoError, TAMANO_MAXIMO_CV
from app.servicios.postulaciones import crear_postulacion, listar_postulaciones_por_vacante, validar_cv
from app.servicios.vacantes import obtener_vacante_por_id, puede_editar_vacante
from app.esquemas.postulaciones import PostulacionCrear
from app.autorizacion import obtener_gestor_vacantes
from app.base_datos import obtener_sesion
from app.modelos import Usuario

router = APIRouter(
  prefix="/postulaciones",
  tags=["postulaciones"]
)

#llega como multipart/form-data: "datos" es el JSON de PostulacionCrear y "cv" es el PDF
@router.post("", response_model=PostulacionRespuestaCandidato,status_code=status.HTTP_201_CREATED)
def crear(
  datos: Annotated[str, Form(description="JSON con id_vacante, candidato y acepta_tratamiento_datos")],
  cv: Annotated[UploadFile, File(description="CV en PDF, hasta 5 MB")],
  sesion: Annotated[Session, Depends(obtener_sesion)],
) -> PostulacionRespuestaCandidato:
  #1. los datos se validan con el mismo esquema de antes; los errores salen con la forma de siempre ("loc" empieza en "body")
  try:
    postulacion_datos = PostulacionCrear.model_validate_json(datos)
  except ValidationError as error:
    detalle = [{"loc": ["body", *item["loc"]], "msg": item["msg"], "type": item["type"]} for item in error.errors()]
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=detalle)

  #2. el CV: se lee un byte más del máximo para saber si se pasa, sin cargar archivos enormes
  contenido = cv.file.read(TAMANO_MAXIMO_CV + 1)
  try:
    validar_cv(contenido, cv.filename)
  except CvInvalidoError as error:
    raise HTTPException(
      status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
      detail=[{"loc": ["body", "cv"], "msg": str(error), "type": "cv_invalido"}],
    )

  try:
    postulacion = crear_postulacion(sesion, postulacion_datos, contenido, cv.filename or "cv.pdf")
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
