from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as EnumSQLAlchemy, ForeignKey, Integer, String, Text, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.base_datos import Base
from app.modelos.postulacion import Postulacion


class EstadoLectura(str, Enum):
  PENDIENTE = "pendiente"  #el CV llegó y espera su turno
  LEYENDO = "leyendo"  #Document Intelligence lo está procesando
  LEIDO = "leido"  #ya hay texto para buscar evidencia
  ERROR = "error"  #no se pudo leer; se puede reintentar


#lo que Document Intelligence sacó de un CV; una lectura por postulación
class LecturaCv(Base):
  __tablename__ = "lecturas_cv"

  id: Mapped[int] = mapped_column(primary_key=True)
  id_postulacion: Mapped[int] = mapped_column(ForeignKey("postulaciones.id"), nullable=False, unique=True, index=True)
  postulacion: Mapped[Postulacion] = relationship()

  estado: Mapped[EstadoLectura] = mapped_column(
    EnumSQLAlchemy(
      EstadoLectura,
      values_callable=lambda opciones: [opcion.value for opcion in opciones],
      native_enum=False,
      create_constraint=True,
      name="estado_lectura_cv",
    ),
    nullable=False,
    default=EstadoLectura.PENDIENTE,
    server_default=text("'pendiente'"),
  )

  #modelo de Document Intelligence usado, para saber cómo se leyó
  modelo: Mapped[str | None] = mapped_column(String(100), nullable=True)
  #páginas que tiene el PDF y páginas que se leyeron (el plan gratuito lee solo las 2 primeras)
  paginas_documento: Mapped[int | None] = mapped_column(Integer, nullable=True)
  paginas_leidas: Mapped[int | None] = mapped_column(Integer, nullable=True)
  #el CV como markdown (títulos, listas, tablas): es lo que leerá la IA para buscar evidencia
  contenido: Mapped[str | None] = mapped_column(Text, nullable=True)
  #párrafos con su página, en JSON: [{"pagina": 1, "rol": "sectionHeading", "texto": "..."}]; sirven para citar el origen
  parrafos: Mapped[str | None] = mapped_column(Text, nullable=True)
  #motivo del error, para el equipo (no se muestra al candidato)
  error: Mapped[str | None] = mapped_column(String(500), nullable=True)

  creado_en: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.sysutcdatetime())
  actualizado_en: Mapped[datetime] = mapped_column(
    DateTime, nullable=False, server_default=func.sysutcdatetime(), onupdate=func.sysutcdatetime()
  )
