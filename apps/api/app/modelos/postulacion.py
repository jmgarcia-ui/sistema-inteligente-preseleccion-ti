from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.base_datos import Base
from app.modelos.vacante import Vacante
from app.modelos.candidato import Candidato

from sqlalchemy import DateTime, String, Text, text, func, ForeignKey, Enum as EnumSQLAlchemy, UniqueConstraint
from enum import Enum

class EstadoPostulacion(str, Enum):
  RECIBIDA = "recibida"
  EN_REVISION = "en_revision"
  PRESELECCIONADA = "preseleccionada"
  DESCARTADA = "descartada"
  RETIRADA = "retirada"


class Postulacion(Base):
  __tablename__="postulaciones"
  __table_args__ = (UniqueConstraint("id_candidato", "id_vacante"),)

  id: Mapped[int] = mapped_column(primary_key=True)
  id_vacante: Mapped[int] = mapped_column(
    ForeignKey("vacantes.id"),
    nullable=False,
    index=True
  )

  vacante: Mapped[Vacante] = relationship()

  id_candidato: Mapped[int] = mapped_column(
    ForeignKey("candidatos.id"),
    nullable=False,
    index=True
  )

  candidato: Mapped[Candidato] = relationship()

  estado: Mapped[EstadoPostulacion] = mapped_column(
      EnumSQLAlchemy(
      EstadoPostulacion,
      values_callable=lambda opciones: [
        opcion.value for opcion in opciones
        ],
      native_enum=False,
      create_constraint=True,
      name="estado_postulacion",
    ),
    nullable=False,
    default=EstadoPostulacion.RECIBIDA,
    server_default=text("'recibida'"),
  )

  postulado_en: Mapped[datetime] = mapped_column(
    DateTime,
    nullable=False,
    server_default=func.sysutcdatetime(),
  )
