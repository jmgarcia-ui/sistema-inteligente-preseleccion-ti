from datetime import date, timedelta
from app.esquemas.vacantes import VacanteCrear, RequisitoCrear
import pytest
from pydantic import ValidationError

def test_vacante_crear_valida():
  #crear la fecha limite dentro de 7 dias
  fecha_limite = date.today() + timedelta(days=7)
  #crear el objeto vacante
  vacante = VacanteCrear(
    titulo="Desarrollador backend Python",
    descripcion="Desarrollará serviciso API con python y FastAPI",
    requisitos=[{"descripcion": "Python"}, {"descripcion": "SQL", "obligatorio": False}],
    modalidad="presencial",
    fecha_limite=fecha_limite,
  )
  #comprobaciones
  assert vacante.fecha_limite == fecha_limite
  assert vacante.ubicacion is None
  assert vacante.modalidad.value == "presencial"
  assert len(vacante.requisitos) == 2
  #obligatorio es True si no se envia
  assert vacante.requisitos[0].obligatorio is True
  assert vacante.requisitos[1].obligatorio is False

def test_vacante_rechaza_fecha_pasada():
  fecha_pasada = date.today() - timedelta(days=1)
  #todo es valido excepto la fecha, asi el error solo puede venir de ella
  with pytest.raises(ValidationError):
    VacanteCrear(
      titulo="Desarrollador backend Python",
      descripcion="Desarrollará serviciso API con python y FastAPI",
      requisitos=[{"descripcion": "Python"}],
      modalidad="presencial",
      fecha_limite=fecha_pasada,
    )

def test_vacante_rechaza_lista_de_requisitos_vacia():
  with pytest.raises(ValidationError):
    VacanteCrear(
      titulo="Desarrollador backend Python",
      descripcion="Desarrollará serviciso API con python y FastAPI",
      requisitos=[],
      modalidad="presencial",
      fecha_limite=date.today() + timedelta(days=7),
    )

def test_requisito_quita_espacios():
  requisito = RequisitoCrear(descripcion="  Python  ")
  assert requisito.descripcion == "Python"

def test_requisito_rechaza_solo_espacios():
  with pytest.raises(ValidationError):
    RequisitoCrear(descripcion="   ")

def test_requisito_acepta_nombres_cortos():
  #lenguajes como Go o C son requisitos validos
  assert RequisitoCrear(descripcion="Go").descripcion == "Go"
  assert RequisitoCrear(descripcion="C").descripcion == "C"
