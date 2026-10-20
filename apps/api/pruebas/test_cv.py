import json

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.servicios.postulaciones import TAMANO_MAXIMO_CV, CvInvalidoError, validar_cv

PDF_MINIMO = b"%PDF-1.4\n%prueba\n"

DATOS_VALIDOS = {
  "id_vacante": 1,
  "candidato": {
    "nombres": "Ana",
    "apellidos": "Torres",
    "correo": "ana.torres@correo.com",
    "linkedin_url": "https://linkedin.com/in/ana",
  },
  "acepta_tratamiento_datos": True,
}


def test_acepta_un_pdf():
  validar_cv(PDF_MINIMO, "mi-cv.PDF")


@pytest.mark.parametrize(
  ("contenido", "nombre", "mensaje"),
  [
    (b"", "cv.pdf", "Adjunta tu CV"),
    (b"%PDF-" + b"0" * TAMANO_MAXIMO_CV, "cv.pdf", "más de 5 MB"),
    (b"PK\x03\x04 esto es un docx", "cv.pdf", "PDF"),
    (PDF_MINIMO, "cv.docx", "PDF"),
  ],
  ids=["vacio", "muy-pesado", "no-es-pdf", "nombre-no-pdf"],
)
def test_rechaza_lo_que_no_es_un_pdf_valido(contenido, nombre, mensaje):
  with pytest.raises(CvInvalidoError, match=mensaje):
    validar_cv(contenido, nombre)


def test_la_ruta_rechaza_un_cv_que_no_es_pdf():
  cliente = TestClient(app)
  respuesta = cliente.post(
    "/postulaciones",
    data={"datos": json.dumps(DATOS_VALIDOS)},
    files={"cv": ("cv.pdf", b"no soy un pdf", "application/pdf")},
  )
  assert respuesta.status_code == 422
  assert respuesta.json()["detail"][0]["loc"] == ["body", "cv"]


def test_la_ruta_devuelve_los_errores_de_datos_con_la_forma_de_siempre():
  cliente = TestClient(app)
  datos = {**DATOS_VALIDOS, "candidato": {**DATOS_VALIDOS["candidato"], "nombres": ""}}
  respuesta = cliente.post(
    "/postulaciones",
    data={"datos": json.dumps(datos)},
    files={"cv": ("cv.pdf", PDF_MINIMO, "application/pdf")},
  )
  assert respuesta.status_code == 422
  assert respuesta.json()["detail"][0]["loc"] == ["body", "candidato", "nombres"]


def test_la_ruta_exige_el_cv():
  cliente = TestClient(app)
  respuesta = cliente.post("/postulaciones", data={"datos": json.dumps(DATOS_VALIDOS)})
  assert respuesta.status_code == 422
