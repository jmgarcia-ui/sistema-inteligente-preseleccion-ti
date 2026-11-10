from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as EnumSQLAlchemy, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.base_datos import Base
from app.modelos.usuario import Usuario


class TipoEnlace(str, Enum):
  #para quien todavía no tiene contraseña
  INVITACION = "invitacion"
  #para quien la olvidó
  RESTABLECER = "restablecer"


#enlace de un solo uso para que una persona del equipo cree o cambie su contraseña
#solo se guarda el hash del token: con la base no se puede usar ningún enlace
class EnlaceAcceso(Base):
  __tablename__ = "enlaces_acceso"

  id: Mapped[int] = mapped_column(primary_key=True)
  id_usuario: Mapped[int] = mapped_column(ForeignKey("usuarios.id", name="fk_enlaces_acceso_usuario"), nullable=False, index=True)
  usuario: Mapped[Usuario] = relationship(foreign_keys=[id_usuario])
  tipo: Mapped[TipoEnlace] = mapped_column(
    EnumSQLAlchemy(TipoEnlace, values_callable=lambda opciones: [o.value for o in opciones], native_enum=False, create_constraint=True, name="tipo_enlace_acceso"),
    nullable=False,
  )
  token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
  expira_en: Mapped[datetime] = mapped_column(DateTime, nullable=False)
  usado_en: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
  #quién lo generó (un administrador)
  creado_por_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id", name="fk_enlaces_acceso_creado_por"), nullable=True)
  creado_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.sysutcdatetime(), nullable=False)
