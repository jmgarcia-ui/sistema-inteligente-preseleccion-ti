from  app.base_datos import Base
from sqlalchemy import ForeignKey, UniqueConstraint, String, Boolean, text
from sqlalchemy.orm import Mapped, mapped_column, relationship


class RequisitoVacante(Base):
  __tablename__= "requisitos_vacante"
  __table_args__= (UniqueConstraint("id_vacante", "orden"),)


  id: Mapped[int] = mapped_column(primary_key = True)

  id_vacante: Mapped[int] = mapped_column(
    ForeignKey("vacantes.id"), 
    nullable=False, 
  )

  vacante: Mapped["Vacante"] = relationship(
    back_populates="requisitos"
  )
  
  descripcion: Mapped[str] = mapped_column(
    String(500), 
    nullable=False
  )

  obligatorio: Mapped[bool] = mapped_column(
    Boolean, 
    default=True, 
    server_default=text("1"),
    nullable=False
  )

  orden: Mapped[int] = mapped_column(nullable=False)

