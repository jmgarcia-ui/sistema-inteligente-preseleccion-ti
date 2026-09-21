from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from app.base_datos import Base
from sqlalchemy import DateTime, String, Text, text, func

class Candidato(Base):
  __tablename__="candidatos"

  id: Mapped[int] = mapped_column(primary_key=True)
  nombres: Mapped[str] = mapped_column(
    String(100),
    nullable=False
  )
  apellidos: Mapped[str] = mapped_column(
    String(100),
    nullable=False
  )
  correo: Mapped[str] = mapped_column(
    String(254),
    unique=True,
    nullable=False
  )
  telefono: Mapped[str | None] = mapped_column(
    String(30),
    nullable=True
  )
  linkedin_url: Mapped[str | None] = mapped_column(
    String(500),
    nullable=True
  )
  github_url: Mapped[str | None] = mapped_column(
    String(500),
    nullable=True
  )
  portafolio_url: Mapped[str | None] = mapped_column(
    String(500),
    nullable=True
  )
  creado_en: Mapped[datetime] = mapped_column(
    DateTime,
    server_default=func.sysutcdatetime(),
    nullable=False
  )