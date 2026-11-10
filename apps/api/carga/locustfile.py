#prueba de carga y estrés con locust
#uso (desde apps/api, con la API corriendo):
#  locust -f carga/locustfile.py --host http://127.0.0.1:8000
#y abrir http://localhost:8089 para elegir usuarios y ritmo
#
#solo toca endpoints de lectura: no postula CVs, no llama a la IA ni envía correos
#la cuenta del equipo se pasa por variables de entorno, nunca en el código:
#  CARGA_CORREO y CARGA_CONTRASENA
import os
import random

from locust import HttpUser, between, task


#visitante sin sesión: mira la lista de vacantes y abre alguna
class Candidato(HttpUser):
  weight = 3
  wait_time = between(1, 4)

  def on_start(self) -> None:
    self.ids_vacante: list[int] = []

  @task(3)
  def ver_vacantes(self) -> None:
    with self.client.get("/vacantes", name="/vacantes", catch_response=True) as respuesta:
      if respuesta.status_code == 200:
        self.ids_vacante = [vacante["id"] for vacante in respuesta.json()]
        respuesta.success()
      else:
        respuesta.failure(f"estado {respuesta.status_code}")

  @task(2)
  def ver_vacante(self) -> None:
    if self.ids_vacante:
      self.client.get(f"/vacantes/{random.choice(self.ids_vacante)}", name="/vacantes/[id]")

  @task(1)
  def salud(self) -> None:
    self.client.get("/health", name="/health")


#persona del equipo: inicia sesión una vez y recorre el panel
class Reclutador(HttpUser):
  weight = 1
  wait_time = between(2, 6)

  def on_start(self) -> None:
    self.ids_postulacion: list[int] = []
    correo = os.environ.get("CARGA_CORREO")
    contrasena = os.environ.get("CARGA_CONTRASENA")
    if not correo or not contrasena:
      raise RuntimeError("Faltan CARGA_CORREO y CARGA_CONTRASENA")

    #el inicio de sesión calcula un hash argon2: es caro a propósito, por eso va una sola vez por usuario
    respuesta = self.client.post("/autenticacion/iniciar-sesion", json={"correo": correo, "contrasena": contrasena}, name="/autenticacion/iniciar-sesion")
    if respuesta.status_code != 200:
      raise RuntimeError(f"No se pudo iniciar sesión: {respuesta.status_code}")
    self.client.headers["Authorization"] = f"Bearer {respuesta.json()['token_acceso']}"

  @task(3)
  def resumen(self) -> None:
    self.client.get("/panel/resumen", name="/panel/resumen")

  @task(2)
  def vacantes_panel(self) -> None:
    self.client.get("/panel/vacantes", name="/panel/vacantes")

  @task(3)
  def bandeja(self) -> None:
    respuesta = self.client.get("/panel/candidatos", name="/panel/candidatos")
    if respuesta.status_code == 200:
      self.ids_postulacion = [fila["id"] for fila in respuesta.json()]

  @task(2)
  def ficha(self) -> None:
    if self.ids_postulacion:
      self.client.get(f"/panel/candidatos/{random.choice(self.ids_postulacion)}", name="/panel/candidatos/[id]")

  @task(1)
  def actividad(self) -> None:
    self.client.get("/panel/actividad", name="/panel/actividad")
