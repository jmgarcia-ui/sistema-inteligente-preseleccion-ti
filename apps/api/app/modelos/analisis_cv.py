from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as EnumSQLAlchemy, ForeignKey, Integer, String, Unicode, UnicodeText, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.base_datos import Base
from app.modelos.postulacion import Postulacion


class EstadoAnalisis(str, Enum):
  PENDIENTE = "pendiente"  #espera a que el CV esté leído
  ANALIZANDO = "analizando"  #la IA está comparando el CV con los requisitos
  LISTO = "listo"  #hay propuesta y borrador; falta que una persona decida
  ERROR = "error"  #no se pudo analizar; se puede reintentar


class Recomendacion(str, Enum):
  PASA = "pasa"
  NO_PASA = "no_pasa"


def _enum(tipo, nombre):
  return EnumSQLAlchemy(
    tipo,
    values_callable=lambda opciones: [opcion.value for opcion in opciones],
    native_enum=False,
    create_constraint=True,
    name=nombre,
  )


#la propuesta de la IA para una postulación: evidencia por requisito, recomendación y borrador del correo
#es solo una propuesta: no cambia el estado de la postulación ni envía nada
class AnalisisCv(Base):
  __tablename__ = "analisis_cv"

  id: Mapped[int] = mapped_column(primary_key=True)
  id_postulacion: Mapped[int] = mapped_column(ForeignKey("postulaciones.id"), nullable=False, unique=True, index=True)
  postulacion: Mapped[Postulacion] = relationship()

  estado: Mapped[EstadoAnalisis] = mapped_column(
    _enum(EstadoAnalisis, "estado_analisis_cv"), nullable=False, default=EstadoAnalisis.PENDIENTE, server_default=text("'pendiente'")
  )
  modelo: Mapped[str | None] = mapped_column(String(100), nullable=True)
  recomendacion: Mapped[Recomendacion | None] = mapped_column(_enum(Recomendacion, "recomendacion_analisis_cv"), nullable=True)
  #por qué recomienda eso, en una o dos frases, para el equipo
  motivo: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
  #evidencia por requisito en JSON; se guarda una copia del requisito porque la vacante puede editarse después
  evidencias: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
  #lo que el equipo debe revisar con más cuidado (citas descartadas, páginas sin leer...), en JSON
  avisos: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
  #borrador del correo para el candidato; no se envía hasta que una persona lo confirme
  correo_asunto: Mapped[str | None] = mapped_column(Unicode(200), nullable=True)
  correo_cuerpo: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
  #consumo de la llamada, para vigilar el costo
  tokens_entrada: Mapped[int | None] = mapped_column(Integer, nullable=True)
  tokens_salida: Mapped[int | None] = mapped_column(Integer, nullable=True)
  error: Mapped[str | None] = mapped_column(Unicode(500), nullable=True)

  creado_en: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.sysutcdatetime())
  actualizado_en: Mapped[datetime] = mapped_column(
    DateTime, nullable=False, server_default=func.sysutcdatetime(), onupdate=func.sysutcdatetime()
  )
