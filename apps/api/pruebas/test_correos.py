import sys
import types

import pytest

from app.servicios import correos
from app.servicios.correos import CorreoError, _html, enviar_correo


def test_el_html_escapa_el_texto_y_separa_parrafos():
  resultado = _html("Hola Ana,\n\n<script>alert(1)</script>\nSaludos")
  assert "<script>" not in resultado
  assert "&lt;script&gt;" in resultado
  assert resultado.count('<p style="margin:0 0 14px">') == 2


def _simular_azure(monkeypatch, estado="Succeeded"):
  #reemplaza el paquete de Azure por uno falso que registra lo que se le pide enviar
  enviados = []

  class Operacion:
    def result(self, timeout):
      return {"id": "op-123", "status": estado, "error": None}

  class ClienteFalso:
    @classmethod
    def from_connection_string(cls, cadena):
      return cls()

    def begin_send(self, mensaje):
      enviados.append(mensaje)
      return Operacion()

  modulo = types.ModuleType("azure.communication.email")
  modulo.EmailClient = ClienteFalso
  monkeypatch.setitem(sys.modules, "azure.communication.email", modulo)
  return enviados


def test_envia_texto_y_html_sin_seguimiento(monkeypatch):
  enviados = _simular_azure(monkeypatch)
  assert enviar_correo("ana@correo.com", "Ana Torres", "Asunto", "Hola Ana") == "op-123"
  mensaje = enviados[0]
  assert mensaje["recipients"]["to"][0]["address"] == "ana@correo.com"
  assert mensaje["content"]["plainText"] == "Hola Ana"
  assert mensaje["userEngagementTrackingDisabled"] is True


def test_avisa_si_azure_no_confirma(monkeypatch):
  _simular_azure(monkeypatch, estado="Failed")
  with pytest.raises(CorreoError, match="no confirmó"):
    enviar_correo("ana@correo.com", "Ana Torres", "Asunto", "Hola")


def test_avisa_si_no_esta_configurado(monkeypatch):
  configuracion = correos.obtener_configuracion().model_copy(update={"correo_remitente": None})
  monkeypatch.setattr(correos, "obtener_configuracion", lambda: configuracion)
  with pytest.raises(CorreoError, match="no está configurado"):
    enviar_correo("ana@correo.com", "Ana", "Asunto", "Hola")
