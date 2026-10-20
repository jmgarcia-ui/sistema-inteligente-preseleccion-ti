from typing import Annotated
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.autorizacion import obtener_gestor_vacantes
from app.base_datos import obtener_sesion
from app.esquemas.candidatos import (
  CandidatoFila,
  ContactoCandidato,
  CorreoBorrador,
  DecisionCrear,
  EnviarCorreo,
  EnvioResumen,
  FichaCandidato,
  LecturaBreve,
  RedactarCorreo,
  RequisitoFicha,
  VacanteBreve,
)
from app.modelos import Postulacion, Usuario
from sqlalchemy import func, select

from app.modelos.analisis_cv import AnalisisCv, EstadoAnalisis, Recomendacion
from app.modelos.envio_correo import EnvioCorreo, EstadoEnvio
from app.modelos.postulacion import EstadoPostulacion
from app.rutas.panel import _respuesta_analisis
from app.servicios.almacenamiento import leer_cv
from app.servicios.analisis_cv import obtener_analisis
from app.servicios.candidatos_panel import decidir, listar_candidatos
from app.servicios.correos import CorreoError, enviar_correo, redactar_correo
from app.servicios.lecturas_cv import obtener_lectura
from app.servicios.vacantes import puede_editar_vacante

router = APIRouter(prefix="/panel/candidatos", tags=["candidatos"])

Sesion = Annotated[Session, Depends(obtener_sesion)]
Gestor = Annotated[Usuario, Depends(obtener_gestor_vacantes)]


#busca la postulación y comprueba que el usuario pueda verla; 404 si no existe o es de otra persona
def _postulacion_permitida(sesion: Session, usuario: Usuario, id_postulacion: int) -> Postulacion:
  postulacion = sesion.get(Postulacion, id_postulacion)
  if postulacion is None or not puede_editar_vacante(usuario, postulacion.vacante):
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Postulación no encontrada")
  return postulacion


def _ficha(sesion: Session, postulacion: Postulacion) -> FichaCandidato:
  lectura = obtener_lectura(sesion, postulacion.id)
  analisis = obtener_analisis(sesion, postulacion.id)
  decidido_por = sesion.get(Usuario, postulacion.decidido_por_id) if postulacion.decidido_por_id else None
  vacante = postulacion.vacante
  return FichaCandidato(
    id=postulacion.id,
    candidato=ContactoCandidato.model_validate(postulacion.candidato),
    vacante=VacanteBreve(id=vacante.id, titulo=vacante.titulo),
    requisitos=[
      RequisitoFicha(numero=numero, descripcion=requisito.descripcion, obligatorio=requisito.obligatorio)
      for numero, requisito in enumerate(sorted(vacante.requisitos, key=lambda r: r.orden), start=1)
    ],
    estado=postulacion.estado,
    creado_en=postulacion.creado_en,
    cv_nombre=postulacion.cv_nombre,
    cv_tamano=postulacion.cv_tamano,
    lectura=LecturaBreve(
      estado=lectura.estado,
      paginas_documento=lectura.paginas_documento,
      paginas_leidas=lectura.paginas_leidas,
      error=lectura.error,
    )
    if lectura
    else None,
    analisis=_respuesta_analisis(analisis) if analisis else None,
    decision_motivo=postulacion.decision_motivo,
    decidido_por=f"{decidido_por.nombres} {decidido_por.apellidos}" if decidido_por else None,
    decidido_en=postulacion.decidido_en,
    envios=[_envio(sesion, envio) for envio in _envios(sesion, postulacion.id)],
  )


def _envios(sesion: Session, id_postulacion: int) -> list[EnvioCorreo]:
  return list(sesion.scalars(select(EnvioCorreo).where(EnvioCorreo.id_postulacion == id_postulacion).order_by(EnvioCorreo.creado_en.desc())))


def _envio(sesion: Session, envio: EnvioCorreo) -> EnvioResumen:
  usuario = sesion.get(Usuario, envio.enviado_por_id)
  return EnvioResumen(
    tipo=envio.tipo,
    destinatario=envio.destinatario,
    asunto=envio.asunto,
    estado=envio.estado,
    error=envio.error,
    enviado_por=f"{usuario.nombres} {usuario.apellidos}" if usuario else "—",
    creado_en=envio.creado_en,
    enviado_en=envio.enviado_en,
  )


#la bandeja: postulaciones de mis vacantes (todas, si es administrador)
@router.get("", response_model=list[CandidatoFila])
def listar(sesion: Sesion, usuario: Gestor, id_vacante: Annotated[int | None, Query()] = None) -> list[CandidatoFila]:
  return [
    CandidatoFila(
      id=postulacion.id,
      nombres=postulacion.candidato.nombres,
      apellidos=postulacion.candidato.apellidos,
      correo=postulacion.candidato.correo,
      vacante=VacanteBreve(id=postulacion.vacante.id, titulo=postulacion.vacante.titulo),
      estado=postulacion.estado,
      creado_en=postulacion.creado_en,
      tiene_cv=postulacion.cv_clave is not None,
      estado_lectura=lectura.estado if lectura else None,
      estado_analisis=analisis.estado if analisis else None,
      recomendacion=analisis.recomendacion if analisis else None,
    )
    for postulacion, lectura, analisis in listar_candidatos(sesion, usuario, id_vacante)
  ]


@router.get("/{id_postulacion}", response_model=FichaCandidato)
def obtener_ficha(id_postulacion: int, sesion: Sesion, usuario: Gestor) -> FichaCandidato:
  return _ficha(sesion, _postulacion_permitida(sesion, usuario, id_postulacion))


#el PDF del CV, para leerlo en el navegador
@router.get("/{id_postulacion}/cv")
def descargar_cv(id_postulacion: int, sesion: Sesion, usuario: Gestor) -> Response:
  postulacion = _postulacion_permitida(sesion, usuario, id_postulacion)
  if not postulacion.cv_clave:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Esta postulación no tiene CV")
  nombre = postulacion.cv_nombre or "cv.pdf"
  return Response(
    content=leer_cv(postulacion.cv_clave),
    media_type="application/pdf",
    #"inline": se abre en el navegador; el nombre va codificado por si trae tildes
    headers={"Content-Disposition": f"inline; filename*=UTF-8''{quote(nombre)}"},
  )


#la decisión de una persona: revisión, preselección o descarte (con motivo)
@router.put("/{id_postulacion}/decision", response_model=FichaCandidato)
def tomar_decision(id_postulacion: int, datos: DecisionCrear, sesion: Sesion, usuario: Gestor) -> FichaCandidato:
  postulacion = _postulacion_permitida(sesion, usuario, id_postulacion)
  if postulacion.estado == EstadoPostulacion.RETIRADA:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El candidato retiró su postulación")
  decidir(sesion, postulacion, usuario, EstadoPostulacion(datos.estado), datos.motivo)
  return _ficha(sesion, postulacion)


#guarda el borrador del correo editado por el equipo (todavía no se envía)
@router.put("/{id_postulacion}/correo", response_model=FichaCandidato)
def guardar_correo(id_postulacion: int, datos: CorreoBorrador, sesion: Sesion, usuario: Gestor) -> FichaCandidato:
  postulacion = _postulacion_permitida(sesion, usuario, id_postulacion)
  analisis = obtener_analisis(sesion, postulacion.id)
  if analisis is None or analisis.estado != EstadoAnalisis.LISTO:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Todavía no hay un borrador para editar")
  analisis.correo_asunto = datos.asunto
  analisis.correo_cuerpo = datos.cuerpo
  sesion.commit()
  return _ficha(sesion, postulacion)


#qué tipo de correo corresponde a cada decisión
TIPO_POR_DECISION = {EstadoPostulacion.PRESELECCIONADA: Recomendacion.PASA, EstadoPostulacion.DESCARTADA: Recomendacion.NO_PASA}


#la IA redacta un borrador nuevo del tipo indicado; reemplaza al anterior (todavía no se envía)
@router.post("/{id_postulacion}/correo/redactar", response_model=FichaCandidato)
def redactar_borrador(id_postulacion: int, datos: RedactarCorreo, sesion: Sesion, usuario: Gestor) -> FichaCandidato:
  postulacion = _postulacion_permitida(sesion, usuario, id_postulacion)
  analisis = obtener_analisis(sesion, postulacion.id)
  if analisis is not None and analisis.estado == EstadoAnalisis.ANALIZANDO:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Espera a que termine el análisis del CV")
  try:
    asunto, cuerpo = redactar_correo(datos.tipo, postulacion.vacante.titulo, postulacion.candidato.nombres, postulacion.decision_motivo)
  except Exception as error:
    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"No se pudo redactar el correo: {error}"[:300])
  #sin CV no hay análisis: el borrador se guarda igual, en un análisis sin evidencias
  if analisis is None:
    analisis = AnalisisCv(id_postulacion=postulacion.id, estado=EstadoAnalisis.LISTO, motivo="Sin CV: no hubo análisis.", evidencias="[]", avisos="[]")
    sesion.add(analisis)
  analisis.correo_tipo = datos.tipo
  analisis.correo_asunto = asunto
  analisis.correo_cuerpo = cuerpo
  sesion.commit()
  return _ficha(sesion, postulacion)


#envía el borrador al candidato; solo con una decisión tomada y del tipo que le corresponde
@router.post("/{id_postulacion}/correo/enviar", response_model=FichaCandidato)
def enviar_borrador(id_postulacion: int, datos: EnviarCorreo, sesion: Sesion, usuario: Gestor) -> FichaCandidato:
  postulacion = _postulacion_permitida(sesion, usuario, id_postulacion)
  tipo = TIPO_POR_DECISION.get(postulacion.estado)
  if tipo is None:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Primero preselecciona o descarta: el correo comunica esa decisión")
  analisis = obtener_analisis(sesion, postulacion.id)
  if analisis is None or not analisis.correo_asunto or not analisis.correo_cuerpo:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No hay borrador: redáctalo primero")
  if analisis.correo_tipo != tipo:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El borrador no corresponde a tu decisión: redáctalo de nuevo")
  ya_enviado = sesion.scalar(
    select(func.count()).select_from(EnvioCorreo).where(
      EnvioCorreo.id_postulacion == postulacion.id, EnvioCorreo.tipo == tipo, EnvioCorreo.estado.in_([EstadoEnvio.ENVIADO, EstadoEnvio.ENVIANDO])
    )
  )
  if ya_enviado and not datos.reenviar:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Este correo ya se envió. Confirma si quieres reenviarlo.")

  #se registra antes de enviar: si algo falla, queda constancia del intento
  envio = EnvioCorreo(
    id_postulacion=postulacion.id,
    tipo=tipo,
    destinatario=postulacion.candidato.correo,
    asunto=analisis.correo_asunto,
    cuerpo=analisis.correo_cuerpo,
    estado=EstadoEnvio.ENVIANDO,
    enviado_por_id=usuario.id,
  )
  sesion.add(envio)
  sesion.commit()
  try:
    envio.id_operacion = enviar_correo(envio.destinatario, f"{postulacion.candidato.nombres} {postulacion.candidato.apellidos}", envio.asunto, envio.cuerpo)
    envio.estado = EstadoEnvio.ENVIADO
    envio.enviado_en = func.sysutcdatetime()
  except CorreoError as error:
    envio.estado = EstadoEnvio.ERROR
    envio.error = str(error)[:500]
  sesion.commit()
  return _ficha(sesion, postulacion)

