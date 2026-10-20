from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.esquemas.panel import AnalisisCvRespuesta
from app.modelos.analisis_cv import EstadoAnalisis, Recomendacion
from app.modelos.lectura_cv import EstadoLectura
from app.modelos.envio_correo import EstadoEnvio
from app.modelos.postulacion import EstadoPostulacion
from app.servicios.texto_rico import validar_texto_rico


class VacanteBreve(BaseModel):
  id: int
  titulo: str


#una fila de la bandeja
class CandidatoFila(BaseModel):
  id: int  #id de la postulación
  nombres: str
  apellidos: str
  correo: str
  vacante: VacanteBreve
  estado: EstadoPostulacion
  creado_en: datetime
  tiene_cv: bool
  estado_lectura: EstadoLectura | None
  estado_analisis: EstadoAnalisis | None
  recomendacion: Recomendacion | None


class RequisitoFicha(BaseModel):
  numero: int
  descripcion: str
  obligatorio: bool


class ContactoCandidato(BaseModel):
  nombres: str
  apellidos: str
  correo: str
  telefono: str | None
  linkedin_url: str | None
  github_url: str | None
  portafolio_url: str | None
  model_config = ConfigDict(from_attributes=True)


class LecturaBreve(BaseModel):
  estado: EstadoLectura
  paginas_documento: int | None
  paginas_leidas: int | None
  error: str | None


#un correo enviado (o intentado) al candidato
class EnvioResumen(BaseModel):
  tipo: Recomendacion
  destinatario: str
  asunto: str
  estado: EstadoEnvio
  error: str | None
  enviado_por: str
  creado_en: datetime
  enviado_en: datetime | None


#todo lo necesario para decidir sobre una postulación
class FichaCandidato(BaseModel):
  id: int
  candidato: ContactoCandidato
  vacante: VacanteBreve
  requisitos: list[RequisitoFicha]
  estado: EstadoPostulacion
  creado_en: datetime
  cv_nombre: str | None
  cv_tamano: int | None
  lectura: LecturaBreve | None
  analisis: AnalisisCvRespuesta | None
  decision_motivo: str | None
  decidido_por: str | None
  decidido_en: datetime | None
  envios: list[EnvioResumen]


#la decisión siempre la toma una persona; descartar exige un motivo (queda registrado, el candidato no lo ve)
class DecisionCrear(BaseModel):
  estado: Literal["recibida", "en_revision", "preseleccionada", "descartada"]
  motivo: str | None = Field(default=None, max_length=500)
  model_config = ConfigDict(str_strip_whitespace=True)

  @model_validator(mode="after")
  def exigir_motivo_al_descartar(self):
    if self.estado == "descartada" and not self.motivo:
      raise ValueError("Escribe el motivo del descarte.")
    return self


#el borrador del correo, editado por el equipo antes de enviarlo
class CorreoBorrador(BaseModel):
  asunto: str = Field(min_length=3, max_length=200)
  #HTML del editor; se limpia al validar
  cuerpo: str = Field(min_length=20, max_length=20000)
  model_config = ConfigDict(str_strip_whitespace=True)

  @field_validator("cuerpo")
  @classmethod
  def limpiar_cuerpo(cls, cuerpo: str) -> str:
    return validar_texto_rico(cuerpo, 20)


#pide a la IA un borrador nuevo del tipo indicado (por ejemplo, si el equipo decidió distinto a la propuesta)
class RedactarCorreo(BaseModel):
  tipo: Recomendacion


#confirma el envío; "reenviar" es necesario si ya se envió un correo de ese tipo
class EnviarCorreo(BaseModel):
  reenviar: bool = False


#lote: la misma decisión para varias postulaciones (el motivo, si se descarta, es común a todas)
class DecisionLote(DecisionCrear):
  ids: list[int] = Field(min_length=1, max_length=100)


#lote: enviar el borrador ya revisado de varias postulaciones; cada envío espera la confirmación de Azure, por eso el tope es menor
class EnvioLote(BaseModel):
  ids: list[int] = Field(min_length=1, max_length=25)


class Omitido(BaseModel):
  id: int
  nombre: str
  motivo: str


#qué se hizo y qué no (con el porqué), para informarlo al equipo
class ResultadoLote(BaseModel):
  hechos: list[int]
  omitidos: list[Omitido]

