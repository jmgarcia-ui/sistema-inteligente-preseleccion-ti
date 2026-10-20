import httpx
import pytest

from app.servicios import document_intelligence
from app.servicios.document_intelligence import LecturaError, contar_paginas_pdf, leer_documento

OPERACION = "https://azure.ejemplo/operaciones/1"


def test_cuenta_las_paginas_y_no_el_catalogo_de_paginas():
  pdf = b"%PDF-1.4 << /Type /Pages /Count 2 >> << /Type /Page >> << /Type/Page >>"
  assert contar_paginas_pdf(pdf) == 2


def _simular_azure(monkeypatch, estados):
  #reemplaza a Azure: primero acepta el documento y luego responde los estados indicados, en orden
  respuestas = iter(estados)

  def responder(peticion: httpx.Request) -> httpx.Response:
    if peticion.method == "POST":
      return httpx.Response(202, headers={"Operation-Location": OPERACION, "Retry-After": "0"})
    return httpx.Response(200, json=next(respuestas))

  cliente_real = httpx.Client
  monkeypatch.setattr(document_intelligence.httpx, "Client", lambda **opciones: cliente_real(transport=httpx.MockTransport(responder)))
  monkeypatch.setattr(document_intelligence.time, "sleep", lambda segundos: None)


def test_devuelve_el_texto_y_los_parrafos_con_su_pagina(monkeypatch):
  _simular_azure(
    monkeypatch,
    [
      {"status": "running"},
      {
        "status": "succeeded",
        "analyzeResult": {
          "content": "# Experiencia\nPython y FastAPI",
          "pages": [{}, {}],
          "paragraphs": [
            {"content": "Experiencia", "role": "sectionHeading", "boundingRegions": [{"pageNumber": 1}]},
            {"content": "Python y FastAPI", "boundingRegions": [{"pageNumber": 2}]},
            {"content": "2", "role": "pageNumber", "boundingRegions": [{"pageNumber": 2}]},
          ],
        },
      },
    ],
  )
  resultado = leer_documento(b"%PDF-1.4")
  assert resultado.paginas_leidas == 2
  assert resultado.contenido.startswith("# Experiencia")
  #el número de página no es evidencia: se descarta
  assert [(p.pagina, p.rol, p.texto) for p in resultado.parrafos] == [
    (1, "sectionHeading", "Experiencia"),
    (2, None, "Python y FastAPI"),
  ]


def test_avisa_si_azure_no_pudo_leer(monkeypatch):
  _simular_azure(monkeypatch, [{"status": "failed", "error": {"message": "archivo dañado"}}])
  with pytest.raises(LecturaError, match="archivo dañado"):
    leer_documento(b"%PDF-1.4")
