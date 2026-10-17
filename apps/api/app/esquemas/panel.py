from datetime import date, datetime
from pydantic import BaseModel, ConfigDict
from app.modelos.vacante import EstadoVacante, ModalidadVacante

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
