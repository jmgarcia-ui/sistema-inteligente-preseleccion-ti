#pruebas funcionales por rol (KPI 1) y de control de acceso (KPI 4) contra la API completa y la base LOCAL (.env)
#crea sus propios usuarios, vacantes y postulaciones de prueba; nunca toca producción
#los CV se guardan en disco local y el envío de correos queda desactivado: no se escribe en Azure Storage ni se envían correos
#la lectura y el análisis del CV sí usan Azure (Document Intelligence y OpenAI), igual que en producción
#uso (desde apps/api): python evaluacion/pruebas_funcionales.py
import json
import secrets
import time
from datetime import date, timedelta

import _prod  # noqa: F401  (agrega apps/api al path)
from _prod import RUTA_API

from fastapi.testclient import TestClient

from app.base_datos import FabricaSesiones
from app.configuracion import obtener_configuracion
from app.main import app
from app.modelos.postulacion import Postulacion
from app.servicios.limites import limite_postulaciones
from app.servicios.usuarios import crear_usuario_interno

CARPETA_CV = RUTA_API.parent.parent / "docs" / "kpis" / "cv"
SALIDA = RUTA_API.parent.parent / "docs" / "kpis" / "datos" / "pruebas_funcionales.json"

configuracion = obtener_configuracion()
configuracion.azure_storage_connection_string = None
configuracion.azure_comunicacion_connection_string = None

cliente = TestClient(app)
casos: list[dict] = []
SUFIJO = time.strftime("%m%d%H%M%S")


def caso(codigo: str, rol: str, modulo: str, descripcion: str, esperado: str, condicion: bool, obtenido: str, kpi: str = "1") -> None:
  casos.append({"codigo": codigo, "kpi": kpi, "rol": rol, "modulo": modulo, "descripcion": descripcion, "esperado": esperado, "obtenido": obtenido, "resultado": "aprobado" if condicion else "fallido"})
  print(f"{codigo} {'OK ' if condicion else 'FALLA'} {descripcion} -> {obtenido}", flush=True)


def _usuario(rol: str, etiqueta: str) -> tuple[str, str]:
  correo, contrasena = f"kpi.{etiqueta}.{SUFIJO}@kpi-preseleccion.pe", secrets.token_urlsafe(18)
  with FabricaSesiones() as sesion:
    crear_usuario_interno(sesion, "Prueba", etiqueta.capitalize(), correo, contrasena, rol)
  return correo, contrasena


def _token(correo: str, contrasena: str) -> dict:
  respuesta = cliente.post("/autenticacion/iniciar-sesion", json={"correo": correo, "contrasena": contrasena})
  return {"Authorization": f"Bearer {respuesta.json()['token_acceso']}"}


def _postular(id_vacante: int, archivo: str, correo: str, consentimiento=True, nombre_archivo: str | None = None, contenido: bytes | None = None, trampa: str = "", enlaces=True):
  candidato = {"nombres": "Candidato", "apellidos": f"Prueba {archivo}", "correo": correo, "telefono": "+51 900 000 000"}
  if enlaces:
    candidato["linkedin_url"] = "https://www.linkedin.com/in/candidato-prueba"
  datos = {"id_vacante": id_vacante, "candidato": candidato, "acepta_tratamiento_datos": consentimiento}
  contenido = contenido if contenido is not None else (CARPETA_CV / f"{archivo}.pdf").read_bytes()
  return cliente.post(
    "/postulaciones",
    data={"datos": json.dumps(datos), "sitio_web": trampa},
    files={"cv": (nombre_archivo or f"{archivo}.pdf", contenido, "application/pdf")},
  )


def main() -> None:
  limite_postulaciones.intentos.clear()
  correo_a, clave_a = _usuario("reclutador", "reclutadora")
  correo_b, clave_b = _usuario("reclutador", "reclutadorb")
  correo_admin, clave_admin = _usuario("administrador", "admin")

  # ---------------- reclutador: acceso y vacantes ----------------
  respuesta = cliente.post("/autenticacion/iniciar-sesion", json={"correo": correo_a, "contrasena": clave_a})
  caso("R01", "Reclutador", "Acceso", "Inicio de sesión con credenciales válidas", "200 y token", respuesta.status_code == 200 and "token_acceso" in respuesta.json(), str(respuesta.status_code))
  a = _token(correo_a, clave_a)
  respuesta = cliente.post("/autenticacion/iniciar-sesion", json={"correo": correo_a, "contrasena": "contrasena-incorrecta-123"})
  caso("R02", "Reclutador", "Acceso", "Inicio de sesión con contraseña incorrecta", "401", respuesta.status_code == 401, str(respuesta.status_code))
  respuesta = cliente.get("/autenticacion/yo", headers=a)
  caso("R03", "Reclutador", "Acceso", "Consulta del usuario en sesión y su rol", "200, rol reclutador", respuesta.status_code == 200 and "reclutador" in respuesta.text, str(respuesta.status_code))

  vacante = {
    "titulo": f"Desarrollador Node.js (prueba KPI {SUFIJO})",
    "descripcion": "<p>Buscamos un desarrollador backend con experiencia en Node.js y bases de datos NoSQL para servicios de alto tráfico.</p>",
    "requisitos": [{"descripcion": "Node.js", "obligatorio": True}, {"descripcion": "Base de datos NoSQL", "obligatorio": True}],
    "modalidad": "remoto", "fecha_limite": str(date.today() + timedelta(days=30)),
  }
  respuesta = cliente.post("/vacantes", json=vacante, headers=a)
  caso("R04", "Reclutador", "Vacantes", "Crear vacante con requisitos", "201", respuesta.status_code == 201, str(respuesta.status_code))
  id_vacante = respuesta.json()["id"]
  respuesta = cliente.post("/vacantes", json=vacante | {"fecha_limite": str(date.today() - timedelta(days=1))}, headers=a)
  caso("R05", "Reclutador", "Vacantes", "Rechazar vacante con fecha límite pasada", "422", respuesta.status_code == 422, str(respuesta.status_code))
  respuesta = cliente.post("/vacantes", json=vacante | {"requisitos": []}, headers=a)
  caso("R06", "Reclutador", "Vacantes", "Rechazar vacante sin requisitos", "422", respuesta.status_code == 422, str(respuesta.status_code))
  respuesta = cliente.get(f"/vacantes/{id_vacante}")
  caso("C01", "Candidato", "Vacantes", "Una vacante en borrador no es visible al público", "404", respuesta.status_code == 404, str(respuesta.status_code))
  respuesta = cliente.patch(f"/vacantes/{id_vacante}", json={"estado": "publicada"}, headers=a)
  caso("R07", "Reclutador", "Vacantes", "Publicar la vacante", "200, estado publicada", respuesta.status_code == 200 and respuesta.json()["estado"] == "publicada", str(respuesta.status_code))

  # ---------------- candidato: portal público y postulación ----------------
  respuesta = cliente.get("/health")
  caso("C02", "Candidato", "Portal", "El servicio responde (salud)", "200", respuesta.status_code == 200, str(respuesta.status_code))
  respuesta = cliente.get("/vacantes")
  caso("C03", "Candidato", "Vacantes", "Lista pública incluye la vacante publicada", "200 y vacante presente", respuesta.status_code == 200 and any(v["id"] == id_vacante for v in respuesta.json()), str(respuesta.status_code))
  respuesta = cliente.get(f"/vacantes/{id_vacante}")
  caso("C04", "Candidato", "Vacantes", "Ver el detalle y los requisitos de la vacante", "200 con 2 requisitos", respuesta.status_code == 200 and len(respuesta.json()["requisitos"]) == 2, str(respuesta.status_code))

  inicio = time.perf_counter()
  respuesta = _postular(id_vacante, "CV01", f"cand1.{SUFIJO}@kpi-preseleccion.pe")
  segundos = round(time.perf_counter() - inicio, 1)
  caso("C05", "Candidato", "Postulación", "Postular con CV en PDF y consentimiento", "201", respuesta.status_code == 201, f"{respuesta.status_code} (incluye lectura y análisis: {segundos} s)")
  respuesta = _postular(id_vacante, "CV01", f"cand1.{SUFIJO}@kpi-preseleccion.pe")
  caso("C06", "Candidato", "Postulación", "Rechazar postulación duplicada a la misma vacante", "409", respuesta.status_code == 409, str(respuesta.status_code))
  respuesta = _postular(id_vacante, "CV02", f"cand2.{SUFIJO}@kpi-preseleccion.pe", consentimiento=False)
  caso("C07", "Candidato", "Postulación", "Rechazar postulación sin aceptar el tratamiento de datos", "422", respuesta.status_code == 422, str(respuesta.status_code), kpi="1 y 4")
  respuesta = _postular(id_vacante, "CV02", f"cand2.{SUFIJO}@kpi-preseleccion.pe", nombre_archivo="cv.docx", contenido=b"PK\x03\x04 documento de Word")
  caso("C08", "Candidato", "Postulación", "Rechazar CV que no es PDF", "422", respuesta.status_code == 422, str(respuesta.status_code))
  respuesta = _postular(id_vacante, "CV02", f"cand2.{SUFIJO}@kpi-preseleccion.pe", contenido=b"%PDF-1.4\n" + b"0" * (5 * 1024 * 1024 + 10))
  caso("C09", "Candidato", "Postulación", "Rechazar CV de más de 5 MB", "422", respuesta.status_code == 422, str(respuesta.status_code))
  #el límite por conexión (5 cada 10 min) ya se alcanzó con los rechazos anteriores; se reinicia para probar cada regla por separado
  limite_postulaciones.intentos.clear()
  respuesta = _postular(id_vacante, "CV02", f"cand2.{SUFIJO}@kpi-preseleccion.pe", enlaces=False)
  caso("C10", "Candidato", "Postulación", "Exigir al menos un enlace profesional", "422", respuesta.status_code == 422, str(respuesta.status_code))
  limite_postulaciones.intentos.clear()
  respuesta = _postular(id_vacante, "CV02", f"cand2.{SUFIJO}@kpi-preseleccion.pe", trampa="https://spam.example")
  caso("C11", "Candidato", "Postulación", "Bloquear envíos automáticos (campo trampa)", "400", respuesta.status_code == 400, str(respuesta.status_code))
  respuesta = _postular(id_vacante, "CV03", f"cand3.{SUFIJO}@kpi-preseleccion.pe")
  caso("C12", "Candidato", "Postulación", "Segunda postulación válida (otro candidato)", "201", respuesta.status_code == 201, str(respuesta.status_code))
  #la respuesta al candidato no expone ids internos: se buscan en la bandeja del reclutador
  bandeja = cliente.get("/panel/candidatos", params={"id_vacante": id_vacante}, headers=a).json()
  ids = {fila["apellidos"]: fila["id"] for fila in bandeja}
  id_postulacion, id_postulacion_2 = ids.get("Prueba CV01"), ids.get("Prueba CV03")

  # ---------------- reclutador: panel, análisis, decisión y correo ----------------
  respuesta = cliente.get("/panel/resumen", headers=a)
  caso("R08", "Reclutador", "Panel", "Ver resumen del panel", "200", respuesta.status_code == 200, str(respuesta.status_code))
  respuesta = cliente.get("/panel/vacantes", headers=a)
  caso("R09", "Reclutador", "Panel", "Listar sus vacantes con conteo de postulaciones", "200 y vacante presente", respuesta.status_code == 200 and any(v["id"] == id_vacante for v in respuesta.json()), str(respuesta.status_code))
  respuesta = cliente.get("/panel/candidatos", headers=a)
  filas = respuesta.json() if respuesta.status_code == 200 else []
  caso("R10", "Reclutador", "Candidatos", "Bandeja de candidatos con estado del análisis", "200 con las 2 postulaciones", respuesta.status_code == 200 and {id_postulacion, id_postulacion_2} <= {f["id"] for f in filas}, str(respuesta.status_code))
  respuesta = cliente.get(f"/panel/candidatos/{id_postulacion}", headers=a)
  ficha = respuesta.json() if respuesta.status_code == 200 else {}
  analisis = ficha.get("analisis") or {}
  caso("R11", "Reclutador", "Análisis IA", "La ficha muestra la propuesta de la IA con evidencias por requisito", "estado listo y 2 evidencias", analisis.get("estado") == "listo" and len(analisis.get("evidencias") or []) == 2, f"estado {analisis.get('estado')}, recomendación {analisis.get('recomendacion')}")
  respuesta = cliente.get(f"/panel/candidatos/{id_postulacion}/cv", headers=a)
  caso("R12", "Reclutador", "Candidatos", "Abrir el CV en PDF", "200 application/pdf", respuesta.status_code == 200 and respuesta.headers["content-type"] == "application/pdf", str(respuesta.status_code))
  respuesta = cliente.put(f"/panel/candidatos/{id_postulacion}/decision", json={"estado": "descartada"}, headers=a)
  caso("R13", "Reclutador", "Decisión", "Exigir motivo al descartar", "422", respuesta.status_code == 422, str(respuesta.status_code))
  respuesta = cliente.post(f"/panel/candidatos/{id_postulacion}/correo/enviar", json={"reenviar": False}, headers=a)
  caso("R14", "Reclutador", "Correos", "No permitir enviar correo antes de decidir", "409", respuesta.status_code == 409, str(respuesta.status_code))
  respuesta = cliente.put(f"/panel/candidatos/{id_postulacion}/decision", json={"estado": "preseleccionada"}, headers=a)
  caso("R15", "Reclutador", "Decisión", "Preseleccionar al candidato", "200, estado preseleccionada", respuesta.status_code == 200 and respuesta.json()["estado"] == "preseleccionada", str(respuesta.status_code))
  respuesta = cliente.put(f"/panel/candidatos/{id_postulacion}/correo", json={"asunto": "Avanzas a la siguiente etapa", "cuerpo": "<p>Hola, gracias por postular. Avanzas a la siguiente etapa del proceso.</p>"}, headers=a)
  caso("R16", "Reclutador", "Correos", "Editar el borrador del correo", "200", respuesta.status_code == 200, str(respuesta.status_code))
  respuesta = cliente.post(f"/panel/candidatos/{id_postulacion_2}/correo/redactar", json={"tipo": "no_pasa"}, headers=a)
  caso("R17", "Reclutador", "Correos", "Pedir a la IA un borrador nuevo de no avance", "200", respuesta.status_code == 200, str(respuesta.status_code))
  respuesta = cliente.put("/panel/candidatos/lote/decision", json={"ids": [id_postulacion_2], "estado": "descartada", "motivo": "No acredita experiencia con bases NoSQL."}, headers=a)
  caso("R18", "Reclutador", "Decisión", "Decidir en lote", "200, 1 hecho", respuesta.status_code == 200 and respuesta.json()["hechos"] == [id_postulacion_2], str(respuesta.status_code))
  respuesta = cliente.post(f"/panel/candidatos/{id_postulacion}/correo/enviar", json={"reenviar": False}, headers=a)
  envios = respuesta.json().get("envios", []) if respuesta.status_code == 200 else []
  caso("R19", "Reclutador", "Correos", "Confirmar envío: queda registrado (envío real desactivado en la prueba)", "200 y envío registrado", respuesta.status_code == 200 and len(envios) == 1, f"{respuesta.status_code}, estado del envío: {envios[0]['estado'] if envios else '-'}")
  respuesta = cliente.get("/panel/actividad", headers=a)
  tipos = {accion.get("tipo") for accion in respuesta.json()} if respuesta.status_code == 200 else set()
  caso("R20", "Reclutador", "Actividad", "El registro de actividad guarda decisiones y análisis", "200 con decisión y análisis", respuesta.status_code == 200 and {"decision", "analisis_listo"} <= tipos, str(respuesta.status_code))

  # ---------------- administrador ----------------
  respuesta = cliente.post("/autenticacion/iniciar-sesion", json={"correo": correo_admin, "contrasena": clave_admin})
  caso("A01", "Administrador", "Acceso", "Inicio de sesión del administrador", "200", respuesta.status_code == 200, str(respuesta.status_code))
  admin = _token(correo_admin, clave_admin)
  respuesta = cliente.get("/panel/vacantes", headers=admin)
  caso("A02", "Administrador", "Vacantes", "Ve las vacantes de todos los reclutadores", "200 y vacante ajena presente", respuesta.status_code == 200 and any(v["id"] == id_vacante for v in respuesta.json()), str(respuesta.status_code))
  respuesta = cliente.get(f"/panel/candidatos/{id_postulacion}", headers=admin)
  caso("A03", "Administrador", "Candidatos", "Ve la ficha de una postulación de otro reclutador", "200", respuesta.status_code == 200, str(respuesta.status_code))
  respuesta = cliente.get(f"/postulaciones/vacante/{id_vacante}", headers=admin)
  caso("A04", "Administrador", "Candidatos", "Lista las postulaciones de cualquier vacante", "200", respuesta.status_code == 200, str(respuesta.status_code))
  respuesta = cliente.patch(f"/vacantes/{id_vacante}", json={"estado": "cerrada"}, headers=admin)
  caso("A05", "Administrador", "Vacantes", "Cierra una vacante de otro reclutador", "200, estado cerrada", respuesta.status_code == 200 and respuesta.json()["estado"] == "cerrada", str(respuesta.status_code))

  # ---------------- control de acceso (KPI 4) ----------------
  b = _token(correo_b, clave_b)
  respuesta = cliente.get(f"/panel/candidatos/{id_postulacion}", headers=b)
  caso("S01", "Seguridad", "Acceso a datos", "Otro reclutador no ve la ficha del candidato", "404", respuesta.status_code == 404, str(respuesta.status_code), kpi="1 y 4")
  respuesta = cliente.get(f"/panel/candidatos/{id_postulacion}/cv", headers=b)
  caso("S02", "Seguridad", "Acceso a datos", "Otro reclutador no descarga el CV", "404", respuesta.status_code == 404, str(respuesta.status_code), kpi="1 y 4")
  respuesta = cliente.get(f"/postulaciones/vacante/{id_vacante}", headers=b)
  caso("S03", "Seguridad", "Acceso a datos", "Otro reclutador no lista las postulaciones de la vacante", "403", respuesta.status_code == 403, str(respuesta.status_code), kpi="1 y 4")
  respuesta = cliente.get("/panel/candidatos", headers=b)
  caso("S04", "Seguridad", "Acceso a datos", "La bandeja de otro reclutador no incluye estos candidatos", "200 sin las postulaciones", respuesta.status_code == 200 and not ({id_postulacion, id_postulacion_2} & {f["id"] for f in respuesta.json()}), str(respuesta.status_code), kpi="1 y 4")
  respuesta = cliente.patch(f"/vacantes/{id_vacante}", json={"titulo": "Intento de cambio"}, headers=b)
  caso("S05", "Seguridad", "Acceso a datos", "Otro reclutador no edita la vacante", "403 o 404", respuesta.status_code in (403, 404), str(respuesta.status_code), kpi="1 y 4")
  respuesta = cliente.put(f"/panel/candidatos/{id_postulacion}/decision", json={"estado": "en_revision"}, headers=b)
  caso("S06", "Seguridad", "Acceso a datos", "Otro reclutador no decide sobre el candidato", "404", respuesta.status_code == 404, str(respuesta.status_code), kpi="1 y 4")
  respuesta = cliente.get("/panel/candidatos")
  caso("S07", "Seguridad", "Acceso a datos", "Sin sesión no se accede al panel", "401", respuesta.status_code == 401, str(respuesta.status_code), kpi="1 y 4")
  respuesta = cliente.get("/panel/candidatos", headers={"Authorization": "Bearer token-falso"})
  caso("S08", "Seguridad", "Acceso a datos", "Un token inválido es rechazado", "401", respuesta.status_code == 401, str(respuesta.status_code), kpi="1 y 4")
  with FabricaSesiones() as sesion:
    fechas = [sesion.get(Postulacion, i).acepto_tratamiento_datos_en for i in (id_postulacion, id_postulacion_2)]
  caso("S09", "Seguridad", "Consentimiento", "Cada postulación guarda la fecha de consentimiento", "fecha registrada", all(fechas), ", ".join(str(f)[:19] for f in fechas), kpi="1 y 4")
  limite_postulaciones.intentos.clear()
  estados = [_postular(999999, "CV02", f"cand9.{SUFIJO}@kpi-preseleccion.pe").status_code for _ in range(6)]
  caso("S10", "Seguridad", "Postulación", "Límite de 5 postulaciones cada 10 minutos por conexión", "el 6.º intento devuelve 429", estados[-1] == 429, ", ".join(map(str, estados)))

  aprobados = sum(c["resultado"] == "aprobado" for c in casos)
  SALIDA.write_text(json.dumps({"ejecutado_en": time.strftime("%Y-%m-%d %H:%M:%S"), "entorno": "API local (FastAPI TestClient) + SQL Server local + Azure Document Intelligence y OpenAI", "aprobados": aprobados, "total": len(casos), "casos": casos}, ensure_ascii=False, indent=2), encoding="utf-8")
  print(f"{aprobados}/{len(casos)} aprobados. Guardado en {SALIDA}")


if __name__ == "__main__":
  main()
