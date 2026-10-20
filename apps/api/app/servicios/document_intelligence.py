import base64
import re
import time
from dataclasses import dataclass

import httpx

from app.configuracion import obtener_configuracion

#prebuilt-layout entiende la estructura del documento: títulos, párrafos, listas y tablas
MODELO = "prebuilt-layout"
VERSION_API = "2024-11-30"
#cuánto esperar como máximo a que Azure termine de leer un CV
ESPERA_MAXIMA_SEGUNDOS = 120


class LecturaError(Exception):
  pass


@dataclass
class Parrafo:
  pagina: int
  rol: str | None  #"title", "sectionHeading", "pageHeader"... o None si es texto normal
  texto: str


@dataclass
class ResultadoLectura:
  modelo: str
  paginas_leidas: int
  contenido: str  #el documento como markdown
  parrafos: list[Parrafo]


def contar_paginas_pdf(contenido: bytes) -> int | None:
  #cuenta los objetos "/Type /Page" (no "/Pages"); sirve para avisar si el plan gratuito leyó menos páginas
  cantidad = len(re.findall(rb"/Type\s*/Page(?!s)", contenido))
  return cantidad or None


def leer_documento(contenido: bytes) -> ResultadoLectura:
  configuracion = obtener_configuracion()
  if not configuracion.azure_docint_endpoint or configuracion.azure_docint_clave is None:
    raise LecturaError("Document Intelligence no está configurado (AZURE_DOCINT_ENDPOINT y AZURE_DOCINT_CLAVE).")

  cabeceras = {"Ocp-Apim-Subscription-Key": configuracion.azure_docint_clave.get_secret_value()}
  url = f"{configuracion.azure_docint_endpoint.rstrip('/')}/documentintelligence/documentModels/{MODELO}:analyze"
  parametros = {"api-version": VERSION_API, "outputContentFormat": "markdown"}

  with httpx.Client(timeout=30) as cliente:
    #1. se envía el PDF; Azure responde 202 y la dirección donde consultar el resultado
    respuesta = cliente.post(url, params=parametros, headers=cabeceras, json={"base64Source": base64.b64encode(contenido).decode()})
    if respuesta.status_code != 202:
      raise LecturaError(f"Azure rechazó el documento ({respuesta.status_code}): {_mensaje(respuesta)}")
    operacion = respuesta.headers["Operation-Location"]

    #2. se consulta hasta que termine; Azure indica cada cuánto preguntar
    limite = time.monotonic() + ESPERA_MAXIMA_SEGUNDOS
    while True:
      time.sleep(float(respuesta.headers.get("Retry-After", 2)))
      respuesta = cliente.get(operacion, headers=cabeceras)
      if respuesta.status_code != 200:
        raise LecturaError(f"No se pudo consultar la lectura ({respuesta.status_code}): {_mensaje(respuesta)}")
      datos = respuesta.json()
      if datos["status"] == "succeeded":
        break
      if datos["status"] == "failed":
        raise LecturaError(f"Azure no pudo leer el documento: {datos.get('error', {}).get('message', 'sin detalle')}")
      if time.monotonic() > limite:
        raise LecturaError("La lectura tardó demasiado.")

  resultado = datos["analyzeResult"]
  parrafos = [
    Parrafo(
      pagina=(parrafo.get("boundingRegions") or [{}])[0].get("pageNumber", 1),
      rol=parrafo.get("role"),
      texto=parrafo["content"],
    )
    for parrafo in resultado.get("paragraphs", [])
    #los números de página y pies no aportan evidencia
    if parrafo.get("role") not in ("pageNumber", "pageFooter")
  ]
  return ResultadoLectura(
    modelo=f"{MODELO}@{VERSION_API}",
    paginas_leidas=len(resultado.get("pages", [])),
    contenido=resultado.get("content", ""),
    parrafos=parrafos,
  )


def _mensaje(respuesta: httpx.Response) -> str:
  try:
    return respuesta.json().get("error", {}).get("message", respuesta.text[:200])
  except ValueError:
    return respuesta.text[:200]
