from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

#obtener ruta: apps/api
RUTA_API = Path(__file__).resolve().parent.parent

#objeto capaz de leer variables de entorno
class Configuracion(BaseSettings):
  entorno: str = "desarrollo"
  database_url: str

  model_config = SettingsConfigDict(
    env_file=RUTA_API / ".env", #obtner ruta de .env
    env_file_encoding="utf-8",
    extra="ignore",
  )

#reutilizar configuracion
@lru_cache
def obtener_configuracion() -> Configuracion:
  return Configuracion()