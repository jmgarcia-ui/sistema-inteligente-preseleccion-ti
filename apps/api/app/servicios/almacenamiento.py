from pathlib import Path
from uuid import uuid4

from app.configuracion import obtener_configuracion

#guarda y lee los CV de los candidatos
#con AZURE_STORAGE_CONNECTION_STRING en .env usa Azure Blob Storage; si no, una carpeta local (desarrollo)

def _usa_azure() -> bool:
  return obtener_configuracion().azure_storage_connection_string is not None


def _contenedor_azure():
  #se importa aquí para que el paquete solo haga falta cuando se usa Azure (pip install azure-storage-blob)
  from azure.storage.blob import BlobServiceClient

  configuracion = obtener_configuracion()
  servicio = BlobServiceClient.from_connection_string(configuracion.azure_storage_connection_string.get_secret_value())
  contenedor = servicio.get_container_client(configuracion.azure_storage_contenedor)
  if not contenedor.exists():
    contenedor.create_container()
  return contenedor


def _carpeta_local() -> Path:
  carpeta = obtener_configuracion().carpeta_almacenamiento_local / "cvs"
  carpeta.mkdir(parents=True, exist_ok=True)
  return carpeta


def guardar_cv(contenido: bytes) -> str:
  #el nombre del archivo nunca es el que mandó el candidato: así no se pisan ni se cuelan rutas raras
  clave = f"{uuid4().hex}.pdf"
  if _usa_azure():
    from azure.storage.blob import ContentSettings

    _contenedor_azure().upload_blob(clave, contenido, content_settings=ContentSettings(content_type="application/pdf"))
  else:
    (_carpeta_local() / clave).write_bytes(contenido)
  return clave


def leer_cv(clave: str) -> bytes:
  if _usa_azure():
    return _contenedor_azure().download_blob(clave).readall()
  return (_carpeta_local() / clave).read_bytes()


def borrar_cv(clave: str) -> None:
  #se usa si la postulación no se pudo guardar, para no dejar archivos huérfanos
  if _usa_azure():
    _contenedor_azure().delete_blob(clave)
  else:
    (_carpeta_local() / clave).unlink(missing_ok=True)
