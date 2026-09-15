from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.base_datos import Base

class Usuario(Base):
  __tablename__="usuarios"
  id: Mapped[int] = mapped_column(primary_key=True)
  id_rol: Mapped[int] = mapped_column(
    ForeignKey("roles.id"),
    nullable=False,
    index=True,
  )
  nombres: Mapped[str] = mapped_column(
    String(100),
    nullable=False,
  )
  apellidos: Mapped[str] = mapped_column(
    String(100),
    nullable=False,
  )
  correo: Mapped[str] = mapped_column(
    String(254),
    unique=True,
    nullable=False,
  )
  contrasena_hash: Mapped[str] = mapped_column(
    String(255),
    nullable=False,
  )
  activo: Mapped[bool] = mapped_column(
    Boolean,
    default=True,
    nullable=False,
  )
  creado_en: Mapped[datetime] = mapped_column(
    DateTime,
    server_default=func.sysutcdatetime(),
    nullable=False,
  )
