from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict
from app.modelos.vacante import EstadoVacante, ModalidadVacante
from app.modelos.lectura_cv import EstadoLectura
from app.modelos.analisis_cv import EstadoAnalisis, Recomendacion

#una fila de la tabla "Tus vacantes, estado por estado"
#se llena a mano en la ruta: "conteos" no existe en el modelo Vacante
class VacanteResumen(BaseModel):
  id: int
  titulo: str
  estado: EstadoVacante
  fecha_limite: date
  #{"recibida": 5, "en_revision": 3}; los estados sin postulaciones no aparecen
  conteos: dict[str, int]

#de la vacante, la cola solo necesita el título
class VacanteTitulo(BaseModel):
  titulo: str
  #permite leer atributos de un objeto
  model_config = ConfigDict(from_attributes=True)

class VacanteGestion(VacanteResumen):
  modalidad: ModalidadVacante
  ubicacion: str | None
  creado_en: datetime


#datos del candidato que se ven en la cola
#los nombres de los campos deben ser iguales a los del modelo Candidato
class CandidatoResumen(BaseModel):
  nombres: str
  apellidos: str
  linkedin_url: str | None
  github_url: str | None
  portafolio_url: str | None
  model_config = ConfigDict(from_attributes=True)

#una persona de la cola de lectura
class PostulacionRevisar(BaseModel):
  #para el botón "Abrir"
  id: int
  #para calcular "hace 4 días"
  creado_en: datetime
  #pydantic sigue las relaciones postulacion.vacante y postulacion.candidato
  vacante: VacanteTitulo
  candidato: CandidatoResumen
  model_config = ConfigDict(from_attributes=True)

#todo lo que devuelve GET /panel/resumen
class ResumenPanel(BaseModel):
  vacantes: list[VacanteResumen]
  por_revisar: list[PostulacionRevisar]


#un párrafo del CV con la página donde está: así cada evidencia podrá citar su origen
class ParrafoCv(BaseModel):
  pagina: int
  rol: str | None
  texto: str


#lo que Document Intelligence leyó del CV de una postulación
class LecturaCvRespuesta(BaseModel):
  estado: EstadoLectura
  modelo: str | None
  paginas_documento: int | None
  paginas_leidas: int | None
  contenido: str | None
  parrafos: list[ParrafoCv]
  error: str | None
  actualizado_en: datetime


#la evidencia de un requisito: solo trae cita si se comprobó que existe en el CV
class EvidenciaRequisito(BaseModel):
  numero: int
  requisito: str
  obligatorio: bool
  resultado: Literal["cumple", "parcial", "sin_evidencia"]
  cita: str | None
  pagina: int | None
  explicacion: str


#la propuesta de la IA: nada de esto se aplica ni se envía sin la confirmación de una persona
class AnalisisCvRespuesta(BaseModel):
  estado: EstadoAnalisis
  modelo: str | None
  recomendacion: Recomendacion | None
  motivo: str | None
  evidencias: list[EvidenciaRequisito]
  avisos: list[str]
  correo_tipo: Recomendacion | None
  correo_asunto: str | None
  correo_cuerpo: str | None
  error: str | None
  actualizado_en: datetime

