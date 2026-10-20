from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as EnumSQLAlchemy, ForeignKey, String, Unicode, UnicodeText, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.base_datos import Base
from app.modelos.analisis_cv import Recomendacion
from app.modelos.postulacion import Postulacion


class EstadoEnvio(str, Enum):
  ENVIANDO = "enviando"
  ENVIADO = "enviado"
  ERROR = "error"


#cada correo que el equipo envía a un candidato, tal como salió: queda como registro (trazabilidad)
class EnvioCorreo(Base):
  __tablename__ = "envios_correo"

  id: Mapped[int] = mapped_column(primary_key=True)
  id_postulacion: Mapped[int] = mapped_column(ForeignKey("postulaciones.id"), nullable=False, index=True)
  postulacion: Mapped[Postulacion] = relationship()

  tipo: Mapped[Recomendacion] = mapped_column(
    EnumSQLAlchemy(Recomendacion, values_callable=lambda opciones: [o.value for o in opciones], native_enum=False, create_constraint=True, name="tipo_envio_correo"),
    nullable=False,
  )
  destinatario: Mapped[str] = mapped_column(String(255), nullable=False)
  asunto: Mapped[str] = mapped_column(Unicode(200), nullable=False)
  cuerpo: Mapped[str] = mapped_column(UnicodeText, nullable=False)
  estado: Mapped[EstadoEnvio] = mapped_column(
    EnumSQLAlchemy(EstadoEnvio, values_callable=lambda opciones: [o.value for o in opciones], native_enum=False, create_constraint=True, name="estado_envio_correo"),
    nullable=False,
    default=EstadoEnvio.ENVIANDO,
  )
  #identificador que devuelve Azure, para rastrear el correo si hace falta
  id_operacion: Mapped[str | None] = mapped_column(String(100), nullable=True)
  error: Mapped[str | None] = mapped_column(Unicode(500), nullable=True)
  enviado_por_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
  creado_en: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.sysutcdatetime())
  enviado_en: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
