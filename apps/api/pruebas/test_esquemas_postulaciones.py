from app.esquemas.postulaciones import PostulacionCrear, CandidatoPostulacion
import pytest
from pydantic import ValidationError

#datos validos de un candidato para reutilizar en las pruebas
CANDIDATO = {
  "nombres": "Laura",
  "apellidos": "Méndez",
  "correo": "laura.mendez@ejemplo.com",
  "linkedin_url": "https://www.linkedin.com/in/laura-mendez",
}
#mismo candidato pero sin ningun enlace profesional
CANDIDATO_SIN_ENLACES = {"nombres": "Laura", "apellidos": "Méndez", "correo": "laura.mendez@ejemplo.com"}

def test_postulacion_acepta_con_consentimiento():
  postulacion = PostulacionCrear(id_vacante=1, candidato=CANDIDATO, acepta_tratamiento_datos=True)
  assert postulacion.acepta_tratamiento_datos is True

def test_postulacion_rechaza_sin_consentimiento():
  with pytest.raises(ValidationError):
    PostulacionCrear(id_vacante=1, candidato=CANDIDATO, acepta_tratamiento_datos=False)

def test_postulacion_rechaza_si_falta_consentimiento():
  with pytest.raises(ValidationError):
    PostulacionCrear(id_vacante=1, candidato=CANDIDATO)

@pytest.mark.parametrize("enlace", ["linkedin_url", "github_url", "portafolio_url"])
def test_postulacion_acepta_con_cualquier_enlace(enlace):
  candidato = {**CANDIDATO_SIN_ENLACES, enlace: "https://ejemplo.com/laura"}
  postulacion = PostulacionCrear(id_vacante=1, candidato=candidato, acepta_tratamiento_datos=True)
  assert getattr(postulacion.candidato, enlace) == "https://ejemplo.com/laura"

def test_postulacion_rechaza_sin_enlaces():
  with pytest.raises(ValidationError):
    PostulacionCrear(id_vacante=1, candidato=CANDIDATO_SIN_ENLACES, acepta_tratamiento_datos=True)

def test_postulacion_rechaza_enlaces_vacios():
  #un formulario web envia "" cuando el campo queda vacio
  candidato = {**CANDIDATO_SIN_ENLACES, "linkedin_url": "", "github_url": "   "}
  with pytest.raises(ValidationError):
    PostulacionCrear(id_vacante=1, candidato=candidato, acepta_tratamiento_datos=True)

def test_respuesta_acepta_candidato_antiguo_sin_enlaces():
  #la regla solo aplica al postular; los candidatos ya guardados se siguen mostrando
  candidato = CandidatoPostulacion(**CANDIDATO_SIN_ENLACES)
  assert candidato.linkedin_url is None
