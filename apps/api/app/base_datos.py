from sqlalchemy import create_engine
from app.configuracion import obtener_configuracion
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from collections.abc import Generator
from app.configuracion import obtener_configuracion

#obtener direccion de sql server desde .env
configuracion = obtener_configuracion() 

#crete_engine -> prepara conexiones de sqlalchemy

#objeto que usara sqlalchemy para llegar a la bd
motor = create_engine(
  configuracion.database_url,
  pool_pre_ping=True,
)

FabricaSesiones = sessionmaker(
  bind=motor, 
  autoflush=False, 
  expire_on_commit=False
  )

class Base(DeclarativeBase):
  pass

#crear una sesion para una petición y garatiza su cierre
def obtener_sesion() -> Generator[Session, None, None]:
  with FabricaSesiones() as sesion:
    yield sesion