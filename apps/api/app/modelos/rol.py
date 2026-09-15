from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.base_datos import Base

class Rol(Base):
  __tablename__ = "roles"
  id: Mapped[int] = mapped_column(primary_key=True)
  nombre: Mapped[str] = mapped_column(
    String(100),
    unique=True,
    nullable=False,
  )