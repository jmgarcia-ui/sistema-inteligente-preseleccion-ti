#pasa el lote de CV por el pipeline real (Azure Document Intelligence + Azure OpenAI) con las vacantes de producción
#no escribe en ninguna base de datos: usa las mismas funciones que la API (leer_documento y analizar) y guarda el resultado en JSON
#uso (desde apps/api): python evaluacion/evaluar_lote.py
import json
import time
from dataclasses import asdict
from pathlib import Path

from sqlalchemy import text

from _prod import RUTA_API, motor_produccion
from datos_cv import CVS, VARIANTES
from app.servicios.analisis_cv import ParrafoCv, RequisitoAnalisis, analizar
from app.servicios.document_intelligence import contar_paginas_pdf, leer_documento
from app.servicios.texto_rico import html_a_texto

CARPETA_CV = RUTA_API.parent.parent / "docs" / "kpis" / "cv"
SALIDA = RUTA_API.parent.parent / "docs" / "kpis" / "datos" / "lote_resultados.json"


def _vacantes() -> dict[int, dict]:
  #solo lectura: título, descripción y requisitos tal como están publicados
  with motor_produccion().connect() as conexion:
    vacantes = {fila.id: {"titulo": fila.titulo, "descripcion": html_a_texto(fila.descripcion), "requisitos": []} for fila in conexion.execute(text("select id, titulo, descripcion from vacantes"))}
    for fila in conexion.execute(text("select id_vacante, orden, obligatorio, descripcion from requisitos_vacante order by id_vacante, orden")):
      vacantes[fila.id_vacante]["requisitos"].append(fila)
  for vacante in vacantes.values():
    vacante["requisitos"] = [RequisitoAnalisis(numero, fila.descripcion, bool(fila.obligatorio)) for numero, fila in enumerate(vacante["requisitos"], start=1)]
  return vacantes


def _con_reintentos(funcion, *argumentos):
  #las cuotas gratuitas de Azure devuelven 429 si se llama muy seguido
  for intento in range(4):
    try:
      return funcion(*argumentos)
    except Exception as error:
      if "429" not in str(error) or intento == 3:
        raise
      time.sleep(20 * (intento + 1))


def procesar(identificador: str, id_vacante: int, nombre: str, vacante: dict) -> dict:
  contenido = (CARPETA_CV / f"{identificador}.pdf").read_bytes()
  resultado = {"id": identificador, "vacante": id_vacante, "paginas_documento": contar_paginas_pdf(contenido), "tamano_kb": round(len(contenido) / 1024, 1)}
  inicio = time.perf_counter()
  try:
    lectura = _con_reintentos(leer_documento, contenido)
  except Exception as error:
    return resultado | {"estado_lectura": "error", "error": str(error)[:300], "segundos_lectura": round(time.perf_counter() - inicio, 2)}
  fin_lectura = time.perf_counter()
  parrafos = [ParrafoCv(parrafo.pagina, parrafo.texto) for parrafo in lectura.parrafos]
  resultado |= {"estado_lectura": "leido", "paginas_leidas": lectura.paginas_leidas, "parrafos": len(parrafos), "segundos_lectura": round(fin_lectura - inicio, 2)}
  try:
    analisis = _con_reintentos(analizar, vacante["titulo"], vacante["descripcion"], vacante["requisitos"], nombre, parrafos, resultado["paginas_documento"], lectura.paginas_leidas)
  except Exception as error:
    return resultado | {"estado_analisis": "error", "error": str(error)[:300], "segundos_analisis": round(time.perf_counter() - fin_lectura, 2)}
  return resultado | {
    "estado_analisis": "listo",
    "segundos_analisis": round(time.perf_counter() - fin_lectura, 2),
    "segundos_total": round(time.perf_counter() - inicio, 2),
    "recomendacion": analisis.recomendacion.value,
    "motivo": analisis.motivo,
    "evidencias": [asdict(evidencia) for evidencia in analisis.evidencias],
    "avisos": analisis.avisos,
    "modelo": analisis.modelo,
    "tokens_entrada": analisis.tokens_entrada,
    "tokens_salida": analisis.tokens_salida,
  }


def main() -> None:
  vacantes = _vacantes()
  por_id = {cv["id"]: cv for cv in CVS}
  trabajos = [(cv["id"], cv["vacante"], cv["persona"]["nombre"]) for cv in CVS]
  trabajos += [(variante["id"], por_id[variante["base"]]["vacante"], variante["persona"]["nombre"]) for variante in VARIANTES]
  resultados = []
  for identificador, id_vacante, nombre in trabajos:
    resultado = procesar(identificador, id_vacante, nombre, vacantes[id_vacante])
    resultados.append(resultado)
    print(identificador, resultado.get("estado_lectura"), resultado.get("estado_analisis"), resultado.get("recomendacion"), resultado.get("segundos_total"), flush=True)
    #se guarda tras cada CV: si algo falla a mitad, no se pierde lo ya procesado
    SALIDA.write_text(json.dumps({"ejecutado_en": time.strftime("%Y-%m-%d %H:%M:%S"), "resultados": resultados}, ensure_ascii=False, indent=2), encoding="utf-8")
  print(f"Guardado en {SALIDA}")


if __name__ == "__main__":
  main()
