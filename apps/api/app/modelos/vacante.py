from enum import Enum
from app.base_datos import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Date, DateTime, ForeignKey, String, Enum as EnumSQLAlchemy, Text, text
from datetime import date, datetime

class ModalidadVacante(str, Enum):
  REMOTO = "remoto"
  HIBRIDO = "hibrido"
  PRESENCIAL = "presencial"

class EstadoVacante(str, Enum):
  BORRADOR = "borrador"
  PUBLICADA = "publicada"
  CERRADA = "cerrada"

class Vacante(Base):
  __tablename__="vacantes"
  id: Mapped[int] = mapped_column(primary_key=True)

  titulo: Mapped[str]=mapped_column(
    String(150),nullable=False
  )

  descripcion: Mapped[str]=mapped_column(
      Text,nullable=False
  )

  requisitos: Mapped[str]=mapped_column(
      Text,nullable=False
  )

  modalidad: Mapped[ModalidadVacante] = mapped_column(
    EnumSQLAlchemy(
      ModalidadVacante,
      values_callable =lambda opciones: [opcion.value for opcion in opciones],
      native_enum = False,
      create_constraint = True,
      name = "modalidad_vacante"
    ),
    nullable=False,
  )
  
  ubicacion: Mapped[str | None] = mapped_column(String(150), nullable=True)

  estado: Mapped[EstadoVacante] = mapped_column(
    EnumSQLAlchemy(
        EstadoVacante,
        values_callable=lambda opciones: [opcion.value for opcion in opciones],
        native_enum=False,
        create_constraint=True,
        name="estado_vacante",
    ),
    nullable=False,
    default=EstadoVacante.BORRADOR,
    server_default=text("'borrador'"),
  )

  fecha_limite: Mapped[date] = mapped_column(Date, nullable=False)

  creado_en: Mapped[datetime] = mapped_column(
    DateTime,
    nullable=False,
    server_default=text("sysutcdatetime()"),
  )

  id_creador: Mapped[int] = mapped_column(
    ForeignKey("usuarios.id"),
    nullable=False,
    #sql server crea indice para buscar mas rapido las vacantes de un usuario
    index = True, 
  )