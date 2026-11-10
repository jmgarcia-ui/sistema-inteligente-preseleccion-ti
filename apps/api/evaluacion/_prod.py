#conexión de solo lectura a la base de producción (usa .env.produccion; nunca escribe)
import sys
from pathlib import Path

from dotenv import dotenv_values
from sqlalchemy import create_engine

RUTA_API = Path(__file__).resolve().parent.parent
#los scripts se ejecutan desde apps/api, pero viven en evaluacion/: así encuentran el paquete app
sys.path.insert(0, str(RUTA_API))


def motor_produccion():
  return create_engine(dotenv_values(RUTA_API / ".env.produccion")["DATABASE_URL"], pool_pre_ping=True)
