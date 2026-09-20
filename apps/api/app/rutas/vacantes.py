from typing import Annotated
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.autorizacion import obtener_gestor_vacantes
from app.base_datos import obtener_sesion
from app.esquemas.vacantes import VacanteCrear, VacanteRespuesta, VacanteActualizar,VacantePublicaRespuesta
from app.modelos import Usuario
from app.servicios.vacantes import crear_vacante, actualizar_vacante, obtener_vacante_por_id,puede_editar_vacante, listar_vacantes_publicas, obtener_vacante_publica_por_id

router = APIRouter(
  prefix="/vacantes",
  tags=["vacantes"]
)

@router.post("", response_model=VacanteRespuesta, status_code=status.HTTP_201_CREATED)
def crear(datos: VacanteCrear, sesion: Annotated[Session, Depends(obtener_sesion)], usuario: Annotated[Usuario, Depends(obtener_gestor_vacantes)]) -> VacanteRespuesta:
  #obtener la vacante creada
  vacante = crear_vacante(sesion=sesion, datos=datos, id_creador=usuario.id)
  return VacanteRespuesta.model_validate(vacante)

@router.patch("/{id_vacante}", response_model=VacanteRespuesta)
def actualizar(id_vacante: int, datos: VacanteActualizar, sesion: Annotated[Session, Depends(obtener_sesion)], usuario: Annotated[Usuario, Depends(obtener_gestor_vacantes)]) -> VacanteRespuesta:

  #obtener vacante
  vacante = obtener_vacante_por_id(sesion, id_vacante)
  if vacante is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vacante no encontrada")
  #validamos permisos
  if not puede_editar_vacante(usuario, vacante):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para editar esta vacante")

  #actualizar vacante
  vacante_actualizada = actualizar_vacante(sesion, vacante, datos)
  return VacanteRespuesta.model_validate(vacante_actualizada)

@router.get("", response_model=list[VacantePublicaRespuesta])
def mostrar(sesion: Annotated[Session, Depends(obtener_sesion)]) -> list[VacantePublicaRespuesta]:

  vacantes = listar_vacantes_publicas(sesion)
  return [
    VacantePublicaRespuesta.model_validate(vacante)
    for vacante in vacantes
  ]

@router.get("/{id_vacante}", response_model=VacantePublicaRespuesta)
def mostrar_por_id(sesion: Annotated[Session, Depends(obtener_sesion)], id_vacante: int) -> VacantePublicaRespuesta:
  vacante = obtener_vacante_publica_por_id(sesion, id_vacante)
  if vacante is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vacante no encontrada")
  
  return VacantePublicaRespuesta.model_validate(vacante)
