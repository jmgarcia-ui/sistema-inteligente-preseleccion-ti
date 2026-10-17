from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.autorizacion import obtener_gestor_vacantes
from app.base_datos import obtener_sesion
from app.esquemas.vacantes import VacanteRespuesta
from app.esquemas.panel import PostulacionRevisar, ResumenPanel, VacanteGestion, VacanteResumen
from app.modelos import Usuario
from app.servicios.panel import contar_postulaciones, listar_por_revisar, listar_vacantes_panel
from app.servicios.vacantes import listar_vacantes, obtener_vacante_por_id, puede_editar_vacante

router = APIRouter(
  prefix="/panel",
  tags=["panel"]
)

@router.get("/resumen", response_model=ResumenPanel)
def obtener_resumen(sesion: Annotated[Session, Depends(obtener_sesion)], usuario: Annotated[Usuario, Depends(obtener_gestor_vacantes)]) -> ResumenPanel:
  #1. vacantes del panel: publicadas y borradores (el administrador ve todas)
  vacantes = listar_vacantes_panel(sesion, usuario)
  ids_vacante = [vacante.id for vacante in vacantes]

  #2. cuántas postulaciones tiene cada vacante en cada estado
  conteos = contar_postulaciones(sesion, ids_vacante)

  #3. las 5 postulaciones que llevan más tiempo esperando
  por_revisar = listar_por_revisar(sesion, ids_vacante)

  #4. se arma la respuesta; una vacante sin postulaciones no está en "conteos" y recibe {}
  return ResumenPanel(
    vacantes=[
      VacanteResumen(
        id=vacante.id,
        titulo=vacante.titulo,
        estado=vacante.estado,
        fecha_limite=vacante.fecha_limite,
        conteos=conteos.get(vacante.id, {}),
      )
      for vacante in vacantes
    ],
    por_revisar=[PostulacionRevisar.model_validate(postulacion) for postulacion in por_revisar],
  )

@router.get("/vacantes", response_model=list[VacanteGestion])
def resumen_mis_vacantes(sesion: Annotated[Session, Depends(obtener_sesion)], usuario: Annotated[Usuario, Depends(obtener_gestor_vacantes)]) -> list[VacanteGestion ]:

  vacantes = listar_vacantes(sesion, usuario)
  ids_vacante = [vacante.id for vacante in vacantes]
  conteos = contar_postulaciones(sesion, ids_vacante)

  return [
    VacanteGestion(
      id=vacante.id,
      titulo=vacante.titulo,
      estado=vacante.estado,
      modalidad=vacante.modalidad,
      ubicacion=vacante.ubicacion,
      fecha_limite=vacante.fecha_limite,
      creado_en=vacante.creado_en,
      conteos=conteos.get(vacante.id, {}),
    )
    for vacante in vacantes
  ]


#una vacante completa para el formulario de editar, en cualquier estado (también borradores)
@router.get("/vacantes/{id_vacante}", response_model=VacanteRespuesta)
def obtener_mi_vacante(id_vacante: int, sesion: Annotated[Session, Depends(obtener_sesion)], usuario: Annotated[Usuario, Depends(obtener_gestor_vacantes)]) -> VacanteRespuesta:
  vacante = obtener_vacante_por_id(sesion, id_vacante)
  if vacante is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vacante no encontrada")
  #solo su creador o un administrador puede verla para editarla
  if not puede_editar_vacante(usuario, vacante):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver esta vacante")
  return VacanteRespuesta.model_validate(vacante)
