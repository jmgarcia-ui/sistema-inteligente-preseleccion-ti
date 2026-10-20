import json
from dataclasses import dataclass

import httpx

from app.configuracion import obtener_configuracion

VERSION_API = "2024-10-21"


class IaError(Exception):
  pass


@dataclass
class RespuestaIa:
  datos: dict
  modelo: str
  tokens_entrada: int
  tokens_salida: int


#pide una respuesta en JSON que cumpla exactamente el esquema ("structured outputs")
def completar_json(mensajes: list[dict], nombre_esquema: str, esquema: dict, max_tokens: int = 2500) -> RespuestaIa:
  configuracion = obtener_configuracion()
  if not configuracion.azure_openai_endpoint or configuracion.azure_openai_clave is None:
    raise IaError("Azure OpenAI no está configurado (AZURE_OPENAI_ENDPOINT y AZURE_OPENAI_CLAVE).")

  url = f"{configuracion.azure_openai_endpoint.rstrip('/')}/openai/deployments/{configuracion.azure_openai_despliegue}/chat/completions"
  cuerpo = {
    "messages": mensajes,
    #poca creatividad: se busca evidencia, no inventiva
    "temperature": 0.1,
    "max_tokens": max_tokens,
    "response_format": {"type": "json_schema", "json_schema": {"name": nombre_esquema, "strict": True, "schema": esquema}},
  }
  try:
    respuesta = httpx.post(
      url,
      params={"api-version": VERSION_API},
      headers={"api-key": configuracion.azure_openai_clave.get_secret_value()},
      json=cuerpo,
      timeout=90,
    )
  except httpx.HTTPError as error:
    raise IaError(f"No se pudo conectar con Azure OpenAI: {error}") from error

  if respuesta.status_code != 200:
    raise IaError(f"Azure OpenAI respondió {respuesta.status_code}: {respuesta.text[:300]}")

  datos = respuesta.json()
  eleccion = datos["choices"][0]
  if eleccion.get("finish_reason") != "stop":
    #"length": se cortó por max_tokens; "content_filter": el filtro de contenido lo bloqueó
    raise IaError(f"La respuesta de la IA quedó incompleta ({eleccion.get('finish_reason')}).")
  try:
    contenido = json.loads(eleccion["message"]["content"])
  except (TypeError, json.JSONDecodeError) as error:
    raise IaError("La IA no devolvió un JSON válido.") from error

  return RespuestaIa(
    datos=contenido,
    modelo=datos.get("model", configuracion.azure_openai_despliegue),
    tokens_entrada=datos.get("usage", {}).get("prompt_tokens", 0),
    tokens_salida=datos.get("usage", {}).get("completion_tokens", 0),
  )
