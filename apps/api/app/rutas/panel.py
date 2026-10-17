from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.autorizacion import obtener_gestor_vacantes
from app.base_datos import obtener_sesion
from app.esquemas.panel import PostulacionRevisar, ResumenPanel, VacanteResumen
from app.modelos import Usuario
from app.servicios.panel import contar_postulaciones, listar_por_revisar, listar_vacantes_panel

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
