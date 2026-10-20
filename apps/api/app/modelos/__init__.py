from app.modelos.rol import Rol
from app.modelos.usuario import Usuario
from app.modelos.vacante import Vacante
from app.modelos.candidato import Candidato
from app.modelos.postulacion import Postulacion
from app.modelos.requisito_vacante import RequisitoVacante
from app.modelos.lectura_cv import LecturaCv, EstadoLectura
from app.modelos.analisis_cv import AnalisisCv, EstadoAnalisis, Recomendacion
from app.modelos.envio_correo import EnvioCorreo, EstadoEnvio
from app.modelos.registro_accion import RegistroAccion, TipoAccion

__all__ = ["Rol", "Usuario", "Vacante", "Candidato", "Postulacion", "RequisitoVacante", "LecturaCv", "EstadoLectura", "AnalisisCv", "EstadoAnalisis", "Recomendacion", "EnvioCorreo", "EstadoEnvio", "RegistroAccion", "TipoAccion"]