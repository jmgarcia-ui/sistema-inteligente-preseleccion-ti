from pydantic import BaseModel, Field, EmailStr, ConfigDict
from app.esquemas.vacantes import VacanteRespuesta
from app.esquemas.vacantes import VacanteRespuestaCandidato
from app.modelos.postulacion import EstadoPostulacion
from datetime import datetime

#datos que envia el candidato desde el front al backend (post)
class CandidatoPostulacion(BaseModel):
  nombres: str = Field(min_length=1, max_length=100)
  apellidos: str = Field(min_length=1, max_length=100)
  correo: EmailStr
  telefono: str | None = Field(default=None, min_length=1, max_length=30)
  linkedin_url: str | None = Field(default=None, max_length=500)
  github_url: str | None = Field(default=None, max_length=500)
  portafolio_url: str | None = Field(default=None, max_length=500)
  model_config = ConfigDict(from_attributes=True)

#datos del formulario del front (post)
class PostulacionCrear(BaseModel):
  id_vacante: int = Field(gt=0)
  candidato: CandidatoPostulacion

#datos que envia el backend
class PostulacionRespuestaReclutador(BaseModel):
  vacante: VacanteRespuesta
  candidato: CandidatoPostulacion
  estado:EstadoPostulacion
  postulado_en: datetime
  #permite leer atributos de un objeto
  model_config = ConfigDict(from_attributes=True)

class PostulacionRespuestaCandidato(BaseModel):
  vacante:VacanteRespuestaCandidato
  candidato: CandidatoPostulacion
  estado:EstadoPostulacion
  postulado_en: datetime
  #permite leer atributos de un objeto
  model_config = ConfigDict(from_attributes=True)