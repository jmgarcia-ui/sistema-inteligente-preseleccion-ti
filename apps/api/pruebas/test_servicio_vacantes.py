from datetime import date, timedelta
from unittest.mock import Mock
from app.esquemas.vacantes import VacanteCrear, VacanteActualizar, RequisitoCrear
from app.modelos.vacante import Vacante
from app.modelos.requisito_vacante import RequisitoVacante
from app.servicios.vacantes import crear_vacante, actualizar_vacante, construir_requisitos

def test_crear_vacante_guardar_datos():
  sesion = Mock() #sesion falsa
  #creamos el objeto
  datos = VacanteCrear(
    titulo="Desarrollador Backend Python",
    descripcion="Desarrollará servicios API con Python y FastAPI.",
    requisitos=[{"descripcion": "Python"}, {"descripcion": "SQL", "obligatorio": False}],
    modalidad="remoto",
    fecha_limite=date.today() + timedelta(days=7),
  )
  #llamar al servicio
  vacante = crear_vacante(sesion=sesion, datos=datos, id_creador=1)

  #comprobaciones
  assert vacante.id_creador == 1
  assert vacante.titulo == "Desarrollador Backend Python"
  assert vacante.modalidad.value == "remoto"
  #los requisitos se guardan con la vacante y el orden sale de su posicion
  assert [requisito.descripcion for requisito in vacante.requisitos] == ["Python", "SQL"]
  assert [requisito.orden for requisito in vacante.requisitos] == [1, 2]

  #comprobaciones de la sesion
  sesion.add.assert_called_once_with(vacante)
  sesion.commit.assert_called_once()
  sesion.refresh.assert_called_once_with(vacante)

def test_construir_requisitos_devuelve_modelos_ordenados():
  requisitos = construir_requisitos([
    RequisitoCrear(descripcion="Python"),
    RequisitoCrear(descripcion="Go", obligatorio=False),
  ])

  #deben ser modelos de SQLAlchemy, no esquemas de Pydantic
  assert all(isinstance(requisito, RequisitoVacante) for requisito in requisitos)
  assert [requisito.orden for requisito in requisitos] == [1, 2]
  assert requisitos[1].obligatorio is False

def test_actualizar_sin_requisitos_no_toca_requisitos():
  sesion = Mock()
  vacante = Vacante(titulo="Titulo anterior", requisitos=[RequisitoVacante(descripcion="Python", obligatorio=True, orden=1)])

  actualizar_vacante(sesion, vacante, VacanteActualizar(titulo="Titulo nuevo"))

  assert vacante.titulo == "Titulo nuevo"
  assert [requisito.descripcion for requisito in vacante.requisitos] == ["Python"]
  #sin requisitos nuevos no hay nada que borrar antes
  sesion.flush.assert_not_called()
  sesion.commit.assert_called_once()

def test_actualizar_requisitos_hace_flush():
  sesion = Mock()
  vacante = Vacante(titulo="Titulo", requisitos=[RequisitoVacante(descripcion="Python", obligatorio=True, orden=1)])

  actualizar_vacante(sesion, vacante, VacanteActualizar(requisitos=[{"descripcion": "Go"}, {"descripcion": "Docker"}]))

  assert [requisito.descripcion for requisito in vacante.requisitos] == ["Go", "Docker"]
  assert [requisito.orden for requisito in vacante.requisitos] == [1, 2]
  #el flush borra los requisitos viejos antes de insertar los nuevos (indice unico id_vacante, orden)
  sesion.flush.assert_called_once()
  sesion.commit.assert_called_once()
