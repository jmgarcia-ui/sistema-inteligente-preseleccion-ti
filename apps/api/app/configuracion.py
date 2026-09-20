from functools import lru_cache
from pathlib import Path
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

#obtener ruta: apps/api
RUTA_API = Path(__file__).resolve().parent.parent

#objeto capaz de leer variables de entorno
class Configuracion(BaseSettings):
  entorno: str = "desarrollo"
  database_url: str
  frontend_url: str
  clave_secreta_jwt: SecretStr #clave utilizada para firmar los tokens
  algoritmo_jwt: str="HS256" #algoritmo para crear la firma
  minutos_expiracion_token: int=30 #minutos de la duracion de cada token

  model_config = SettingsConfigDict(
    env_file=RUTA_API / ".env", #obtner ruta de .env
    env_file_encoding="utf-8",
    extra="ignore",
  )

#reutilizar configuracion
@lru_cache
def obtener_configuracion() -> Configuracion:
  return Configuracion()