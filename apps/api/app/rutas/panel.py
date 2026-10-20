from typing import Annotated
import json
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.autorizacion import obtener_gestor_vacantes
from app.base_datos import obtener_sesion
from app.esquemas.vacantes import VacanteRespuesta
from app.esquemas.panel import AccionRespuesta, AnalisisCvRespuesta, LecturaCvRespuesta, PostulacionRevisar, ResumenPanel, VacanteGestion, VacanteResumen
from app.modelos import Postulacion, Usuario
from app.modelos.lectura_cv import EstadoLectura, LecturaCv
from app.servicios.registro import listar_acciones
from app.modelos.registro_accion import RegistroAccion
from app.servicios.lecturas_cv import obtener_lectura, procesar_lectura, reiniciar_lectura
from app.servicios.analisis_cv import obtener_analisis, procesar_analisis
from app.modelos.analisis_cv import AnalisisCv, EstadoAnalisis
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
    actividad=[respuesta_accion(accion) for accion in listar_acciones(sesion, usuario, limite=6)],
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


#busca la lectura del CV de una postulación y comprueba que el usuario pueda verla
def _lectura_permitida(sesion: Session, usuario: Usuario, id_postulacion: int) -> LecturaCv:
  postulacion = sesion.get(Postulacion, id_postulacion)
  #404 tanto si no existe como si es de otra persona: no se revela qué postulaciones existen
  if postulacion is None or not puede_editar_vacante(usuario, postulacion.vacante):
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Postulación no encontrada")
  lectura = obtener_lectura(sesion, id_postulacion)
  if lectura is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Esta postulación no tiene CV")
  return lectura


def _respuesta_lectura(lectura: LecturaCv) -> LecturaCvRespuesta:
  return LecturaCvRespuesta(
    estado=lectura.estado,
    modelo=lectura.modelo,
    paginas_documento=lectura.paginas_documento,
    paginas_leidas=lectura.paginas_leidas,
    contenido=lectura.contenido,
    parrafos=json.loads(lectura.parrafos) if lectura.parrafos else [],
    error=lectura.error,
    actualizado_en=lectura.actualizado_en,
  )


#lo que Document Intelligence leyó del CV: estado, texto y párrafos con su página
@router.get("/postulaciones/{id_postulacion}/lectura-cv", response_model=LecturaCvRespuesta)
def obtener_lectura_cv(id_postulacion: int, sesion: Annotated[Session, Depends(obtener_sesion)], usuario: Annotated[Usuario, Depends(obtener_gestor_vacantes)]) -> LecturaCvRespuesta:
  return _respuesta_lectura(_lectura_permitida(sesion, usuario, id_postulacion))


#vuelve a leer el CV, por ejemplo si la lectura anterior falló
@router.post("/postulaciones/{id_postulacion}/lectura-cv", response_model=LecturaCvRespuesta, status_code=status.HTTP_202_ACCEPTED)
def reintentar_lectura_cv(
  id_postulacion: int,
  sesion: Annotated[Session, Depends(obtener_sesion)],
  usuario: Annotated[Usuario, Depends(obtener_gestor_vacantes)],
  tareas: BackgroundTasks,
) -> LecturaCvRespuesta:
  lectura = _lectura_permitida(sesion, usuario, id_postulacion)
  if lectura.estado == EstadoLectura.LEYENDO:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El CV se está leyendo en este momento")
  lectura = reiniciar_lectura(sesion, lectura)
  tareas.add_task(procesar_lectura, id_postulacion)
  return _respuesta_lectura(lectura)


def _respuesta_analisis(analisis: AnalisisCv) -> AnalisisCvRespuesta:
  return AnalisisCvRespuesta(
    estado=analisis.estado,
    modelo=analisis.modelo,
    recomendacion=analisis.recomendacion,
    motivo=analisis.motivo,
    evidencias=json.loads(analisis.evidencias) if analisis.evidencias else [],
    avisos=json.loads(analisis.avisos) if analisis.avisos else [],
    correo_tipo=analisis.correo_tipo,
    correo_asunto=analisis.correo_asunto,
    correo_cuerpo=analisis.correo_cuerpo,
    error=analisis.error,
    actualizado_en=analisis.actualizado_en,
  )


#la propuesta de la IA para una postulación: evidencia por requisito, recomendación y borrador del correo
@router.get("/postulaciones/{id_postulacion}/analisis", response_model=AnalisisCvRespuesta)
def obtener_analisis_cv(id_postulacion: int, sesion: Annotated[Session, Depends(obtener_sesion)], usuario: Annotated[Usuario, Depends(obtener_gestor_vacantes)]) -> AnalisisCvRespuesta:
  _lectura_permitida(sesion, usuario, id_postulacion)
  analisis = obtener_analisis(sesion, id_postulacion)
  if analisis is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El CV todavía no tiene análisis")
  return _respuesta_analisis(analisis)


#vuelve a analizar el CV (por ejemplo, si falló o si cambiaron los requisitos de la vacante)
@router.post("/postulaciones/{id_postulacion}/analisis", status_code=status.HTTP_202_ACCEPTED)
def reintentar_analisis_cv(
  id_postulacion: int,
  sesion: Annotated[Session, Depends(obtener_sesion)],
  usuario: Annotated[Usuario, Depends(obtener_gestor_vacantes)],
  tareas: BackgroundTasks,
) -> dict[str, str]:
  lectura = _lectura_permitida(sesion, usuario, id_postulacion)
  if lectura.estado != EstadoLectura.LEIDO:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El CV todavía no se ha leído")
  analisis = obtener_analisis(sesion, id_postulacion)
  if analisis is not None and analisis.estado == EstadoAnalisis.ANALIZANDO:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El CV se está analizando en este momento")
  tareas.add_task(procesar_analisis, id_postulacion)
  return {"detalle": "Análisis en curso"}


def respuesta_accion(accion: RegistroAccion) -> AccionRespuesta:
  return AccionRespuesta(
    id=accion.id,
    tipo=accion.tipo,
    descripcion=accion.descripcion,
    detalle=accion.detalle,
    autor=f"{accion.usuario.nombres} {accion.usuario.apellidos}" if accion.usuario else "Sistema",
    id_vacante=accion.id_vacante,
    id_postulacion=accion.id_postulacion,
    creado_en=accion.creado_en,
  )


#el registro: qué pasó, quién y cuándo, de la acción más nueva a la más vieja
#"antes_de" pide la página siguiente (el id de la última acción ya mostrada)
@router.get("/actividad", response_model=list[AccionRespuesta])
def obtener_actividad(
  sesion: Annotated[Session, Depends(obtener_sesion)],
  usuario: Annotated[Usuario, Depends(obtener_gestor_vacantes)],
  id_postulacion: Annotated[int | None, Query()] = None,
  tipo: Annotated[list[str] | None, Query()] = None,
  antes_de: Annotated[int | None, Query()] = None,
  limite: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[AccionRespuesta]:
  acciones = listar_acciones(sesion, usuario, id_postulacion=id_postulacion, tipos=tipo, antes_de=antes_de, limite=limite)
  return [respuesta_accion(accion) for accion in acciones]

