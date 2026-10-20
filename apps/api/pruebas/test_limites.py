import json

from fastapi.testclient import TestClient

from app.main import app
from app.servicios.limites import LimiteIntentos


def test_permite_hasta_el_maximo_y_luego_pide_esperar():
  limite = LimiteIntentos([(3, 600)])
  assert [limite.intentar("ip", ahora=t) for t in (0, 10, 20)] == [None, None, None]
  #el cuarto intento debe esperar a que el primero salga de la ventana: 600 - 30 = 570 segundos
  assert limite.intentar("ip", ahora=30) == 570
  #otra dirección no se ve afectada
  assert limite.intentar("otra-ip", ahora=30) is None


def test_la_ventana_se_libera_con_el_tiempo():
  limite = LimiteIntentos([(1, 60)])
  assert limite.intentar("ip", ahora=0) is None
  assert limite.intentar("ip", ahora=30) is not None
  assert limite.intentar("ip", ahora=61) is None


def test_la_ruta_responde_429_tras_demasiados_intentos():
  cliente = TestClient(app)
  envio = {"data": {"datos": "{}"}, "files": {"cv": ("cv.pdf", b"%PDF-1.4", "application/pdf")}}
  codigos = [cliente.post("/postulaciones", **envio).status_code for _ in range(6)]
  #los 5 primeros llegan a la validación (422 por datos vacíos); el sexto lo frena el límite
  assert codigos[:5] == [422] * 5
  assert codigos[5] == 429


def test_el_campo_trampa_lleno_se_rechaza():
  cliente = TestClient(app)
  respuesta = cliente.post(
    "/postulaciones",
    data={"datos": json.dumps({}), "sitio_web": "http://spam.example"},
    files={"cv": ("cv.pdf", b"%PDF-1.4", "application/pdf")},
  )
  assert respuesta.status_code == 400
