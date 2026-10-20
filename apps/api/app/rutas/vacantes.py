from typing import Annotated
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.modelos.registro_accion import TipoAccion
from app.modelos.vacante import EstadoVacante
from app.servicios.registro import registrar
from app.autorizacion import obtener_gestor_vacantes
from app.base_datos import obtener_sesion
from app.esquemas.vacantes import VacanteCrear, VacanteRespuesta, VacanteActualizar,VacantePublicaRespuesta
from app.modelos import Usuario
from app.servicios.vacantes import crear_vacante, actualizar_vacante, obtener_vacante_por_id,puede_editar_vacante, listar_vacantes_publicas, obtener_vacante_publica_por_id, VacanteVencidaError

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
  estado_antes = vacante.estado
  try:
    vacante_actualizada = actualizar_vacante(sesion, vacante, datos)
  except VacanteVencidaError as error:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))

  #se registra qué cambió: publicarla y cerrarla se distinguen de una edición
  if vacante_actualizada.estado != estado_antes and vacante_actualizada.estado in (EstadoVacante.PUBLICADA, EstadoVacante.CERRADA):
    publicada = vacante_actualizada.estado == EstadoVacante.PUBLICADA
    tipo = TipoAccion.VACANTE_PUBLICADA if publicada else TipoAccion.VACANTE_CERRADA
    descripcion = f'{"Publicó" if publicada else "Cerró"} la vacante "{vacante_actualizada.titulo}"'
  else:
    tipo, descripcion = TipoAccion.VACANTE_EDITADA, f'Editó la vacante "{vacante_actualizada.titulo}"'
  if datos.model_dump(exclude_unset=True):
    registrar(sesion, tipo, descripcion, vacante=vacante_actualizada, usuario=usuario)
    sesion.commit()
  
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
