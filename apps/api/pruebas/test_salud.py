from fastapi.testclient import TestClient
from app.main import app

cliente = TestClient(app)

def test_salud() -> None:
  respuesta = cliente.get("/health")
  assert respuesta.status_code == 200
  assert respuesta.json() == {"status":"ok"}