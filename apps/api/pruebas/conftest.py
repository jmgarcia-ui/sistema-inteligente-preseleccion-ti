import os

#las pruebas nunca usan las claves reales del .env (ni existe .env en GitHub Actions): valores falsos fijos
#van antes de importar la app, porque la configuración se lee una sola vez; las variables del entorno ganan al .env
for clave, valor in {
  "DATABASE_URL": "mssql+pyodbc://prueba:prueba@localhost/prueba?driver=ODBC+Driver+18+for+SQL+Server",
  "FRONTEND_URL": "http://localhost:5173",
  "CLAVE_SECRETA_JWT": "solo-para-pruebas",
  "AZURE_DOCINT_ENDPOINT": "https://docint-falso.cognitiveservices.azure.com",
  "AZURE_DOCINT_CLAVE": "clave-falsa",
  "AZURE_OPENAI_ENDPOINT": "https://openai-falso.openai.azure.com",
  "AZURE_OPENAI_CLAVE": "clave-falsa",
  "AZURE_COMUNICACION_CONNECTION_STRING": "endpoint=https://acs-falso.communication.azure.com/;accesskey=Y2xhdmUtZmFsc2E=",
  "CORREO_REMITENTE": "DoNotReply@ejemplo.azurecomm.net",
}.items():
  os.environ[clave] = valor

import pytest  # noqa: E402

from app.servicios.limites import limite_postulaciones  # noqa: E402


#cada prueba empieza sin intentos acumulados: el límite por IP es en memoria y se compartiría entre pruebas
@pytest.fixture(autouse=True)
def limpiar_limite_postulaciones():
  limite_postulaciones.intentos.clear()
  yield
  limite_postulaciones.intentos.clear()
