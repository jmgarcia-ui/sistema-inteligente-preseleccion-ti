import pytest

from app.servicios.limites import limite_postulaciones


#cada prueba empieza sin intentos acumulados: el límite por IP es en memoria y se compartiría entre pruebas
@pytest.fixture(autouse=True)
def limpiar_limite_postulaciones():
  limite_postulaciones.intentos.clear()
  yield
  limite_postulaciones.intentos.clear()
