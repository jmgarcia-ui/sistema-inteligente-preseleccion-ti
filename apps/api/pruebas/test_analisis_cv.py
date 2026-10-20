from app.modelos.analisis_cv import Recomendacion
from app.servicios import analisis_cv
from app.servicios.analisis_cv import ParrafoCv, RequisitoAnalisis, analizar, ubicar_cita
from app.servicios.azure_openai import RespuestaIa

PARRAFOS = [
  ParrafoCv(1, "Desarrolladora backend - Fintech Andina (2023 - actualidad)"),
  ParrafoCv(1, "\\- Diseño y mantengo APIs REST con Python y FastAPI para pagos."),
  ParrafoCv(2, "Python, FastAPI, SQL Server, Git, Docker. Inglés intermedio (B1)."),
]

REQUISITOS = [
  RequisitoAnalisis(1, "Python y FastAPI", True),
  RequisitoAnalisis(2, "Kubernetes", True),
  RequisitoAnalisis(3, "Inglés intermedio", False),
]


def test_ubica_la_cita_aunque_cambien_tildes_mayusculas_y_escapes():
  assert ubicar_cita("diseno y mantengo APIs REST con python", PARRAFOS) == 1
  assert ubicar_cita("Ingles intermedio (B1)", PARRAFOS) == 2


def test_acepta_citas_cortadas_con_puntos_suspensivos():
  assert ubicar_cita("Diseño y mantengo APIs... para pagos", PARRAFOS) == 1


def test_no_encuentra_lo_que_no_esta_en_el_cv():
  assert ubicar_cita("Lideré un equipo de 10 personas", PARRAFOS) is None


def _simular_ia(monkeypatch, datos):
  respuesta = RespuestaIa(datos=datos, modelo="gpt-4o-mini", tokens_entrada=900, tokens_salida=300)
  monkeypatch.setattr(analisis_cv, "completar_json", lambda *argumentos, **opciones: respuesta)


def _datos(evidencias, recomendacion="no_pasa"):
  return {
    "evidencias": evidencias,
    "recomendacion": recomendacion,
    "motivo": "motivo",
    "correo": {"asunto": "Asunto", "cuerpo": "Cuerpo"},
  }


def test_una_cita_inventada_se_descarta_y_deja_un_aviso(monkeypatch):
  _simular_ia(
    monkeypatch,
    _datos(
      [
        {"numero": 1, "resultado": "cumple", "cita": "Diseño y mantengo APIs REST con Python y FastAPI", "explicacion": "Lo hace hoy."},
        {"numero": 2, "resultado": "cumple", "cita": "Administré clústeres de Kubernetes", "explicacion": "Inventado."},
        {"numero": 3, "resultado": "cumple", "cita": "Inglés intermedio (B1)", "explicacion": "Lo declara."},
      ],
      recomendacion="pasa",
    ),
  )
  resultado = analizar("Backend", "Descripción", REQUISITOS, "Ana", PARRAFOS)
  kubernetes = resultado.evidencias[1]
  assert (kubernetes.resultado, kubernetes.cita, kubernetes.pagina) == ("sin_evidencia", None, None)
  assert resultado.evidencias[0].pagina == 1 and resultado.evidencias[2].pagina == 2
  #la recomendación sigue siendo de la IA, pero el equipo recibe el aviso para revisarla
  assert resultado.recomendacion == Recomendacion.PASA
  assert any("no aparece en el CV" in aviso for aviso in resultado.avisos)
  assert any("imprescindibles sin evidencia" in aviso for aviso in resultado.avisos)


def test_avisa_si_falta_evaluar_un_requisito_o_paginas_sin_leer(monkeypatch):
  _simular_ia(monkeypatch, _datos([{"numero": 1, "resultado": "sin_evidencia", "cita": None, "explicacion": "No aparece."}]))
  resultado = analizar("Backend", "Descripción", REQUISITOS, "Ana", PARRAFOS, paginas_documento=3, paginas_leidas=2)
  assert len(resultado.evidencias) == 3
  assert any("no evaluó el requisito 2" in aviso for aviso in resultado.avisos)
  assert any("2 de 3 páginas" in aviso for aviso in resultado.avisos)
