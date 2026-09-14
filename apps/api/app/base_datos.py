from sqlalchemy import create_engine
from app.configuracion import obtener_configuracion
from sqlalchemy.orm import DeclarativeBase, sessionmaker

#obtener direccion de sql server desde .env
configuracion = obtener_configuracion() 

#crete_engine -> prepara conexiones de sqlalchemy

#objeto que usara sqlalchemy para llegar a la bd
motor = create_engine(
  configuracion.database_url,
  pool_pre_ping=True,
)

FabricaSesiones = sessionmaker(bind=motor)

class Base(DeclarativeBase):
  pass