from datetime import date, timedelta
from app.esquemas.vacantes import VacanteCrear
import pytest
from pydantic import ValidationError

def test_vacante_crear_valida():
  #crear la fecha limite dentro de 7 dias
  fecha_limite = date.today() + timedelta(days=7)
  #crear el objeto vacante
  vacante = VacanteCrear(
    titulo="Desarrollador backend Python",
    descripcion="Desarrollará serviciso API con python y FastAPI",
    requisitos="Conocimientos Python, SQL y control de versiones",
    modalidad="presencial",
    fecha_limite=fecha_limite,
  )
  #comprobaciones
  assert vacante.fecha_limite == fecha_limite
  assert vacante.ubicacion is None
  assert vacante.modalidad.value == "presencial"

def test_vacante_rechaza_fecha_pasada():
  fecha_pasada = date.today() - timedelta(days=1)
  with pytest.raises(ValidationError):
    VacanteCrear(
      titulo="Desarrollador backend Python",
      descripcion="Desarrollará serviciso API con python y FastAPI",
      requisitos="Conocimientos Python, SQL y control de versiones",
      modalidad="presencial",
      fecha_limite=fecha_pasada,
    )