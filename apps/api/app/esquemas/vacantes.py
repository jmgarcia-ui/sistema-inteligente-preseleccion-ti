from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict
from app.modelos.vacante import EstadoVacante, ModalidadVacante

#datos que debe enviar el front al crear una vacante (post)
class VacanteCrear(BaseModel):
  titulo: str = Field(min_length=3, max_length=150)
  descripcion: str = Field(min_length=20)
  requisitos: str = Field(min_length=20)
  modalidad: ModalidadVacante
  ubicacion: str | None = Field(default=None, max_length=150)
  fecha_limite: date
  @field_validator("fecha_limite")
  @classmethod
  def validar_fecha_limite(cls, fecha_limite: date) -> date:
    if fecha_limite <= date.today():
      raise ValueError("La fecha limite debe ser futura.")
    return fecha_limite

#datos que envia el backend (get)
class VacanteRespuesta(BaseModel):
  id: int
  id_creador: int
  titulo: str
  descripcion: str
  requisitos: str
  modalidad: ModalidadVacante
  ubicacion: str | None
  estado: EstadoVacante
  fecha_limite: date
  creado_en: datetime
  #permite leer atributos de un objeto
  model_config = ConfigDict(from_attributes=True)

#respuesta solo para peticiones get
class VacantePublicaRespuesta(BaseModel):
  id: int
  titulo: str
  descripcion: str
  requisitos: str
  modalidad: ModalidadVacante
  ubicacion: str | None
  fecha_limite: date
  creado_en: datetime
  #permite leer atributos de un objeto
  model_config = ConfigDict(from_attributes=True)

#respuesta solo para el candidato
class VacanteRespuestaCandidato(BaseModel):
  titulo: str
  descripcion: str
  requisitos:str
  modalidad:str
  ubicacion: str | None
 #permite leer atributos de un objeto
  model_config = ConfigDict(from_attributes=True)

# actualizar solo los campos enviados (patch)
class VacanteActualizar(BaseModel):
  titulo: str | None = Field(default=None, min_length=3, max_length=150)
  descripcion: str | None = Field(default=None, min_length=20)
  requisitos: str | None = Field(default=None, min_length=20)
  modalidad: ModalidadVacante | None = None
  ubicacion: str | None = Field(default=None, max_length=150)
  estado: EstadoVacante | None = None
  fecha_limite: date | None = None

  @field_validator("fecha_limite")
  @classmethod
  def validar_fecha_limite(cls, fecha_limite: date | None) -> date | None:
    if fecha_limite is not None and fecha_limite <= date.today():
      raise ValueError("La fecha limite debe ser futura.")
    return fecha_limite