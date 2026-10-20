from types import SimpleNamespace
from unittest.mock import Mock

from app.esquemas.candidatos import DecisionLote, EnvioLote
from app.modelos.envio_correo import EstadoEnvio
from app.modelos.postulacion import EstadoPostulacion
from app.rutas import candidatos


def _postulacion(id_postulacion, estado):
  return SimpleNamespace(id=id_postulacion, estado=estado, vacante=SimpleNamespace(), candidato=SimpleNamespace(nombres="Ana", apellidos=str(id_postulacion)))


def _preparar(monkeypatch, postulaciones):
  #sesión falsa: devuelve las postulaciones por id (la 99 no existe)
  sesion = Mock()
  sesion.get.side_effect = lambda _modelo, id_postulacion: postulaciones.get(id_postulacion)
  monkeypatch.setattr(candidatos, "puede_editar_vacante", lambda _usuario, _vacante: True)
  return sesion


def test_decidir_lote_omite_retiradas_repetidas_y_ajenas(monkeypatch):
  postulaciones = {
    1: _postulacion(1, EstadoPostulacion.RECIBIDA),
    2: _postulacion(2, EstadoPostulacion.RETIRADA),
    3: _postulacion(3, EstadoPostulacion.DESCARTADA),
  }
  sesion = _preparar(monkeypatch, postulaciones)
  decididas = []
  monkeypatch.setattr(candidatos, "decidir", lambda _s, postulacion, _u, estado, motivo: decididas.append((postulacion.id, estado, motivo)))

  resultado = candidatos.decidir_lote(DecisionLote(ids=[1, 1, 2, 3, 99], estado="descartada", motivo="No cumple"), sesion, Mock())

  assert resultado.hechos == [1]
  assert decididas == [(1, EstadoPostulacion.DESCARTADA, "No cumple")]
  assert [(o.id, o.motivo) for o in resultado.omitidos] == [(99, "No encontrada"), (2, "Retiró su postulación"), (3, "Ya estaba en ese estado")]


def test_enviar_lote_informa_por_que_omite(monkeypatch):
  postulaciones = {1: _postulacion(1, EstadoPostulacion.PRESELECCIONADA), 2: _postulacion(2, EstadoPostulacion.RECIBIDA), 3: _postulacion(3, EstadoPostulacion.DESCARTADA)}
  sesion = _preparar(monkeypatch, postulaciones)

  def enviar_falso(_s, postulacion, _u, reenviar):
    #un lote nunca reenvía
    assert reenviar is False
    if postulacion.id == 2:
      raise candidatos.EnvioNoPermitido("Primero preselecciona o descarta", "Sin decisión")
    return SimpleNamespace(estado=EstadoEnvio.ENVIADO if postulacion.id == 1 else EstadoEnvio.ERROR)

  monkeypatch.setattr(candidatos, "_enviar", enviar_falso)

  resultado = candidatos.enviar_lote(EnvioLote(ids=[1, 2, 3]), sesion, Mock())

  assert resultado.hechos == [1]
  assert [(o.id, o.motivo) for o in resultado.omitidos] == [(2, "Sin decisión"), (3, "Azure no pudo enviarlo")]


def test_lote_de_descarte_exige_motivo():
  try:
    DecisionLote(ids=[1], estado="descartada")
  except ValueError:
    return
  raise AssertionError("debió pedir el motivo")
