from typing import Annotated
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.modelos.registro_accion import TipoAccion
from app.servicios.registro import nombre_de, registrar
from app.autorizacion import obtener_gestor_vacantes
from app.base_datos import obtener_sesion
from app.esquemas.candidatos import (
  CandidatoFila,
  ContactoCandidato,
  CorreoBorrador,
  DecisionCrear,
  DecisionLote,
  EnviarCorreo,
  EnvioLote,
  Omitido,
  ResultadoLote,
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


#las postulaciones del lote que el usuario puede ver; las demás se informan como omitidas
def _del_lote(sesion: Session, usuario: Usuario, ids: list[int], omitidos: list[Omitido]) -> list[Postulacion]:
  permitidas = []
  #dict.fromkeys quita repetidos sin cambiar el orden
  for id_postulacion in dict.fromkeys(ids):
    postulacion = sesion.get(Postulacion, id_postulacion)
    if postulacion is None or not puede_editar_vacante(usuario, postulacion.vacante):
      omitidos.append(Omitido(id=id_postulacion, nombre="—", motivo="No encontrada"))
    else:
      permitidas.append(postulacion)
  return permitidas


#la misma decisión para varias postulaciones; cada una queda registrada por separado
#va antes de las rutas con /{id_postulacion} para que "lote" no se lea como un id
@router.put("/lote/decision", response_model=ResultadoLote)
def decidir_lote(datos: DecisionLote, sesion: Sesion, usuario: Gestor) -> ResultadoLote:
  hechos: list[int] = []
  omitidos: list[Omitido] = []
  estado = EstadoPostulacion(datos.estado)
  for postulacion in _del_lote(sesion, usuario, datos.ids, omitidos):
    if postulacion.estado == EstadoPostulacion.RETIRADA:
      omitidos.append(Omitido(id=postulacion.id, nombre=nombre_de(postulacion), motivo="Retiró su postulación"))
    elif postulacion.estado == estado:
      omitidos.append(Omitido(id=postulacion.id, nombre=nombre_de(postulacion), motivo="Ya estaba en ese estado"))
    else:
      decidir(sesion, postulacion, usuario, estado, datos.motivo)
      hechos.append(postulacion.id)
  return ResultadoLote(hechos=hechos, omitidos=omitidos)


#envía los borradores ya revisados; nunca reenvía: a quien ya recibió su correo se le omite
@router.post("/lote/correo/enviar", response_model=ResultadoLote)
def enviar_lote(datos: EnvioLote, sesion: Sesion, usuario: Gestor) -> ResultadoLote:
  hechos: list[int] = []
  omitidos: list[Omitido] = []
  for postulacion in _del_lote(sesion, usuario, datos.ids, omitidos):
    try:
      envio = _enviar(sesion, postulacion, usuario, reenviar=False)
    except EnvioNoPermitido as error:
      omitidos.append(Omitido(id=postulacion.id, nombre=nombre_de(postulacion), motivo=error.corto))
      continue
    if envio.estado == EstadoEnvio.ENVIADO:
      hechos.append(postulacion.id)
    else:
      omitidos.append(Omitido(id=postulacion.id, nombre=nombre_de(postulacion), motivo="Azure no pudo enviarlo"))
  return ResultadoLote(hechos=hechos, omitidos=omitidos)


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


#no se puede enviar (falta la decisión, el borrador o la confirmación); el texto se muestra tal cual al equipo
class EnvioNoPermitido(Exception):
  def __init__(self, mensaje: str, corto: str):
    super().__init__(mensaje)
    #versión breve, para la lista de omitidos de un lote
    self.corto = corto


#envía el borrador al candidato y deja constancia; solo con una decisión tomada y un borrador del tipo que le corresponde
def _enviar(sesion: Session, postulacion: Postulacion, usuario: Usuario, reenviar: bool) -> EnvioCorreo:
  tipo = TIPO_POR_DECISION.get(postulacion.estado)
  if tipo is None:
    raise EnvioNoPermitido("Primero preselecciona o descarta: el correo comunica esa decisión", "Sin decisión")
  analisis = obtener_analisis(sesion, postulacion.id)
  if analisis is None or not analisis.correo_asunto or not analisis.correo_cuerpo:
    raise EnvioNoPermitido("No hay borrador: redáctalo primero", "Sin borrador")
  if analisis.correo_tipo != tipo:
    raise EnvioNoPermitido("El borrador no corresponde a tu decisión: redáctalo de nuevo", "El borrador no coincide con la decisión")
  ya_enviado = sesion.scalar(
    select(func.count()).select_from(EnvioCorreo).where(
      EnvioCorreo.id_postulacion == postulacion.id, EnvioCorreo.tipo == tipo, EnvioCorreo.estado.in_([EstadoEnvio.ENVIADO, EstadoEnvio.ENVIANDO])
    )
  )
  if ya_enviado and not reenviar:
    raise EnvioNoPermitido("Este correo ya se envió. Confirma si quieres reenviarlo.", "Ya se le envió")

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
  tipo_texto = "felicitación" if tipo == Recomendacion.PASA else "feedback"
  if envio.estado == EstadoEnvio.ENVIADO:
    registrar(sesion, TipoAccion.CORREO_ENVIADO, f"Envió el correo de {tipo_texto} a {nombre_de(postulacion)}", vacante=postulacion.vacante, postulacion=postulacion, usuario=usuario, detalle=envio.asunto)
  else:
    registrar(sesion, TipoAccion.CORREO_FALLIDO, f"No se pudo enviar el correo de {tipo_texto} a {nombre_de(postulacion)}", vacante=postulacion.vacante, postulacion=postulacion, usuario=usuario, detalle=envio.error)
  sesion.commit()
  return envio


@router.post("/{id_postulacion}/correo/enviar", response_model=FichaCandidato)
def enviar_borrador(id_postulacion: int, datos: EnviarCorreo, sesion: Sesion, usuario: Gestor) -> FichaCandidato:
  postulacion = _postulacion_permitida(sesion, usuario, id_postulacion)
  try:
    _enviar(sesion, postulacion, usuario, datos.reenviar)
  except EnvioNoPermitido as error:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))
  return _ficha(sesion, postulacion)

