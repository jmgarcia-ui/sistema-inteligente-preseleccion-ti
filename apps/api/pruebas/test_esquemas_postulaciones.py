from app.esquemas.postulaciones import PostulacionCrear
import pytest
from pydantic import ValidationError

#datos validos de un candidato para reutilizar en las pruebas
CANDIDATO = {"nombres": "Laura", "apellidos": "Méndez", "correo": "laura.mendez@ejemplo.com"}

def test_postulacion_acepta_con_consentimiento():
  postulacion = PostulacionCrear(id_vacante=1, candidato=CANDIDATO, acepta_tratamiento_datos=True)
  assert postulacion.acepta_tratamiento_datos is True

def test_postulacion_rechaza_sin_consentimiento():
  with pytest.raises(ValidationError):
    PostulacionCrear(id_vacante=1, candidato=CANDIDATO, acepta_tratamiento_datos=False)

def test_postulacion_rechaza_si_falta_consentimiento():
  with pytest.raises(ValidationError):
    PostulacionCrear(id_vacante=1, candidato=CANDIDATO)
