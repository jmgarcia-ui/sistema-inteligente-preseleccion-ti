from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict
from app.modelos.vacante import EstadoVacante, ModalidadVacante
from app.servicios.texto_rico import validar_texto_rico


#datos que envia el front al crear un requisito (post)
class RequisitoCrear(BaseModel):
  descripcion: str = Field(min_length=1, max_length=500)
  obligatorio: bool = Field(default=True)
  model_config = ConfigDict(str_strip_whitespace=True)


class RequisitoRespuesta(BaseModel):
  id: int
  descripcion: str
  obligatorio: bool
  orden: int
  #permite leer atributos de un objeto
  model_config = ConfigDict(from_attributes=True)

#datos que debe enviar el front al crear una vacante (post)
class VacanteCrear(BaseModel):
  titulo: str = Field(min_length=3, max_length=150)
  #HTML del editor (negrita, listas, enlaces); se limpia al validar
  descripcion: str = Field(min_length=20, max_length=20000)
  requisitos: list[RequisitoCrear] = Field(min_length=1)
  modalidad: ModalidadVacante
  ubicacion: str | None = Field(default=None, max_length=150)
  fecha_limite: date
  model_config = ConfigDict(str_strip_whitespace=True)

  @field_validator("descripcion")
  @classmethod
  def limpiar_descripcion(cls, descripcion: str) -> str:
    return validar_texto_rico(descripcion, 20)

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
  requisitos: list[RequisitoRespuesta]
  modalidad: ModalidadVacante
  ubicacion: str | None
  estado: EstadoVacante
  fecha_limite: date
  creado_en: datetime
  actualizado_en: datetime
  #permite leer atributos de un objeto
  model_config = ConfigDict(from_attributes=True)

#respuesta solo para peticiones get
class VacantePublicaRespuesta(BaseModel):
  id: int
  titulo: str
  descripcion: str
  requisitos: list[RequisitoRespuesta]
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
  requisitos:list[RequisitoRespuesta]
  modalidad:str
  ubicacion: str | None
 #permite leer atributos de un objeto
  model_config = ConfigDict(from_attributes=True)

# actualizar solo los campos enviados (patch)
class VacanteActualizar(BaseModel):
  titulo: str | None = Field(default=None, min_length=3, max_length=150)
  descripcion: str | None = Field(default=None, min_length=20, max_length=20000)
  requisitos: list[RequisitoCrear] | None = Field(default=None, min_length=1)
  modalidad: ModalidadVacante | None = None
  ubicacion: str | None = Field(default=None, max_length=150)
  estado: EstadoVacante | None = None
  fecha_limite: date | None = None
  model_config = ConfigDict(str_strip_whitespace=True)

  @field_validator("descripcion")
  @classmethod
  def limpiar_descripcion(cls, descripcion: str | None) -> str | None:
    return None if descripcion is None else validar_texto_rico(descripcion, 20)

  @field_validator("fecha_limite")
  @classmethod
  def validar_fecha_limite(cls, fecha_limite: date | None) -> date | None:
    if fecha_limite is not None and fecha_limite <= date.today():
      raise ValueError("La fecha limite debe ser futura.")
    return fecha_limite

