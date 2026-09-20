from fastapi.testclient import TestClient
from app.main import app
from types import SimpleNamespace
from unittest.mock import patch
from app.autorizacion import obtener_usuario_actual

cliente = TestClient(app) #objeto cliente conectado a mi app

def test_iniciar_sesion_correcto():

  #simular autenticacion de usuario
  with patch("app.rutas.sesiones.autenticar_usuario") as simular_autenticacion:
    simular_autenticacion.return_value = SimpleNamespace(id=7)
    #simular el token
    with patch("app.rutas.sesiones.generar_token_acceso") as simular_token:
      simular_token.return_value = "token-de-prueba"
      respuesta = cliente.post(
        "/autenticacion/iniciar-sesion",
        json={
          "correo": "reclutador@ejemplo.com",
          "contrasena": "contrasena-de-prueba",
        },
      )
  
  assert respuesta.status_code == 200
  assert respuesta.json() == {
    "token_acceso": "token-de-prueba",
    "tipo_token": "bearer"
  }

def test_iniciar_sesion_incorrecto():
  #simular autenticacion usuario
  with patch("app.rutas.sesiones.autenticar_usuario") as simular_autenticacion:
    simular_autenticacion.return_value = None
    respuesta = cliente.post("/autenticacion/iniciar-sesion", 
      json= {
        "correo": "reclutador@ejemplo.com",
        "contrasena": "contrasena-de-prueba",
    })
  assert respuesta.status_code == 401
  assert respuesta.json() == {
    "detail": "Correo o contraseña incorrectos",
  }

#probar que reciba un usuario y devuelva un usuario correcto y seguro
def test_obtener_usuario_actual():
  usuario = SimpleNamespace(
    id = 7,
    nombres = "Marco",
    apellidos = "Garcia",
    correo = "marco@ejemplo.com",
    activo = True,
  )
  def simular_usuario_actual() -> SimpleNamespace:
    return usuario

  app.dependency_overrides[obtener_usuario_actual] = simular_usuario_actual

  try:
    respuesta = cliente.get("/autenticacion/yo")
  finally:
    app.dependency_overrides.pop(obtener_usuario_actual, None)

  assert respuesta.status_code == 200

  assert respuesta.json() == {
    "id": 7,
    "nombres": "Marco",
    "apellidos": "Garcia",
    "correo": "marco@ejemplo.com",
    "activo": True,
  }

def test_obtener_usuario_actual_sin_token():
  respuesta = cliente.get("/autenticacion/yo")
  assert respuesta.status_code == 401
