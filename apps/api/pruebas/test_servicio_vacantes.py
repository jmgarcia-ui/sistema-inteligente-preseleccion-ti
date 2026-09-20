from datetime import date, timedelta
from unittest.mock import Mock
from app.esquemas.vacantes import VacanteCrear
from app.servicios.vacantes import crear_vacante

def test_crear_vacante_guardar_datos():
  sesion = Mock() #sesion falsa
  #creamos el objeto
  datos = VacanteCrear(
    titulo="Desarrollador Backend Python",
    descripcion="Desarrollará servicios API con Python y FastAPI.",
    requisitos="Conocimiento de Python, SQL y control de versiones.",
    modalidad="remoto",
    fecha_limite=date.today() + timedelta(days=7),
  )
  #llamar al servicio
  vacante = crear_vacante(sesion=sesion, datos=datos, id_creador=1)

  #comprobaciones
  assert vacante.id_creador == 1
  assert vacante.titulo == "Desarrollador Backend Python"
  assert vacante.modalidad.value == "remoto"

  #comprobaciones de la sesion
  sesion.add.assert_called_once_with(vacante)
  sesion.commit.assert_called_once()
  sesion.refresh.assert_called_once_with(vacante)

  
  