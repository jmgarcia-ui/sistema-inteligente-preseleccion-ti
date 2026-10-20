from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, String, Unicode, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.base_datos import Base
from app.modelos.postulacion import Postulacion
from app.modelos.usuario import Usuario
from app.modelos.vacante import Vacante


class TipoAccion(str, Enum):
  VACANTE_CREADA = "vacante_creada"
  VACANTE_EDITADA = "vacante_editada"
  VACANTE_PUBLICADA = "vacante_publicada"
  VACANTE_CERRADA = "vacante_cerrada"
  POSTULACION_RECIBIDA = "postulacion_recibida"
  ANALISIS_LISTO = "analisis_listo"
  ANALISIS_ERROR = "analisis_error"
  DECISION = "decision"
  CORREO_ENVIADO = "correo_enviado"
  CORREO_FALLIDO = "correo_fallido"


#qué pasó, quién lo hizo y cuándo: la trazabilidad del proceso (no se edita ni se borra)
class RegistroAccion(Base):
  __tablename__ = "registro_acciones"

  id: Mapped[int] = mapped_column(primary_key=True)
  #se guarda como texto (no como enum de base de datos) para poder sumar tipos sin migraciones
  tipo: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
  descripcion: Mapped[str] = mapped_column(Unicode(500), nullable=False)
  #el motivo de un descarte, el asunto de un correo...
  detalle: Mapped[str | None] = mapped_column(Unicode(500), nullable=True)
  #None = lo hizo el sistema (recepción, lectura, análisis)
  id_usuario: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True)
  usuario: Mapped[Usuario | None] = relationship()
  id_vacante: Mapped[int] = mapped_column(ForeignKey("vacantes.id"), nullable=False, index=True)
  vacante: Mapped[Vacante] = relationship()
  id_postulacion: Mapped[int | None] = mapped_column(ForeignKey("postulaciones.id"), nullable=True, index=True)
  postulacion: Mapped[Postulacion | None] = relationship()
  creado_en: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.sysutcdatetime(), index=True)
