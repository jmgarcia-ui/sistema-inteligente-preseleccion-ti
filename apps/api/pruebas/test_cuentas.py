from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.modelos.enlace_acceso import TipoEnlace
from app.servicios import cuentas


def _usuario(id_usuario, rol="reclutador", activo=True, pendiente=False):
  return SimpleNamespace(id=id_usuario, rol=SimpleNamespace(nombre=rol), activo=activo, invitacion_pendiente=pendiente, nombres="Ana", apellidos="Pérez", correo="ana@ejemplo.com")


@pytest.fixture
def sesion(monkeypatch):
  monkeypatch.setattr(cuentas, "_rol", lambda _sesion, nombre: SimpleNamespace(nombre=nombre))
  monkeypatch.setattr(cuentas, "_anular_enlaces", lambda _sesion, _usuario: None)
  return Mock()


def test_nadie_cambia_su_propio_rol_ni_se_desactiva(sesion):
  admin = _usuario(1, "administrador")
  with pytest.raises(cuentas.ReglaCuenta, match="propio rol"):
    cuentas.actualizar(sesion, admin, admin, nombres=None, apellidos=None, rol="reclutador", activo=None)
  with pytest.raises(cuentas.ReglaCuenta, match="propia cuenta"):
    cuentas.actualizar(sesion, admin, admin, nombres=None, apellidos=None, rol=None, activo=False)


def test_siempre_queda_un_administrador_activo(sesion, monkeypatch):
  monkeypatch.setattr(cuentas, "_administradores_activos", lambda _sesion: 1)
  otro_admin = _usuario(2, "administrador")
  with pytest.raises(cuentas.ReglaCuenta, match="al menos un administrador"):
    cuentas.actualizar(sesion, _usuario(1, "administrador"), otro_admin, nombres=None, apellidos=None, rol=None, activo=False)
  with pytest.raises(cuentas.ReglaCuenta, match="al menos un administrador"):
    cuentas.actualizar(sesion, _usuario(1, "administrador"), otro_admin, nombres=None, apellidos=None, rol="reclutador", activo=None)


def test_con_dos_administradores_se_puede_bajar_uno(sesion, monkeypatch):
  monkeypatch.setattr(cuentas, "_administradores_activos", lambda _sesion: 2)
  otro_admin = _usuario(2, "administrador")
  cuentas.actualizar(sesion, _usuario(1, "administrador"), otro_admin, nombres=None, apellidos=None, rol="reclutador", activo=None)
  assert otro_admin.rol.nombre == "reclutador"
  sesion.commit.assert_called_once()


def test_desactivar_y_reactivar_un_reclutador(sesion):
  reclutador = _usuario(3)
  cuentas.actualizar(sesion, _usuario(1, "administrador"), reclutador, nombres=None, apellidos=None, rol=None, activo=False)
  assert reclutador.activo is False
  cuentas.actualizar(sesion, _usuario(1, "administrador"), reclutador, nombres=None, apellidos=None, rol=None, activo=True)
  assert reclutador.activo is True


def test_tipo_de_enlace_segun_la_cuenta(sesion, monkeypatch):
  monkeypatch.setattr(cuentas, "_nuevo_enlace", lambda _s, _u, tipo, _a: ("token", cuentas.ahora()))
  admin = _usuario(1, "administrador")
  assert cuentas.nuevo_enlace(sesion, admin, _usuario(3, pendiente=True))[0] == TipoEnlace.INVITACION
  assert cuentas.nuevo_enlace(sesion, admin, _usuario(4))[0] == TipoEnlace.RESTABLECER
  with pytest.raises(cuentas.ReglaCuenta, match="desactivada"):
    cuentas.nuevo_enlace(sesion, admin, _usuario(5, activo=False))


def _sesion_con_enlace(enlace):
  sesion = Mock()
  sesion.scalar.return_value = enlace
  return sesion


def test_enlaces_invalidos():
  ahora = cuentas.ahora()
  with pytest.raises(cuentas.EnlaceInvalido, match="no existe"):
    cuentas.enlace_valido(_sesion_con_enlace(None), "x" * 30)
  usado = SimpleNamespace(usado_en=ahora, expira_en=ahora + timedelta(days=1), usuario=_usuario(3))
  with pytest.raises(cuentas.EnlaceInvalido, match="ya se usó"):
    cuentas.enlace_valido(_sesion_con_enlace(usado), "x" * 30)
  vencido = SimpleNamespace(usado_en=None, expira_en=ahora - timedelta(minutes=1), usuario=_usuario(3))
  with pytest.raises(cuentas.EnlaceInvalido, match="venció"):
    cuentas.enlace_valido(_sesion_con_enlace(vencido), "x" * 30)


def test_usar_enlace_crea_la_contrasena(monkeypatch):
  persona = _usuario(3, pendiente=True)
  persona.contrasena_hash = "anterior"
  enlace = SimpleNamespace(usado_en=None, expira_en=cuentas.ahora() + timedelta(days=1), usuario=persona)
  monkeypatch.setattr(cuentas, "_anular_enlaces", lambda _sesion, _usuario: None)
  with pytest.raises(cuentas.ReglaCuenta, match="15 caracteres"):
    cuentas.usar_enlace(_sesion_con_enlace(enlace), "x" * 30, "corta")
  cuentas.usar_enlace(_sesion_con_enlace(enlace), "x" * 30, "una contraseña bien larga")
  assert persona.invitacion_pendiente is False and persona.contrasena_hash != "anterior" and persona.ultimo_acceso_en is not None


def test_el_token_viaja_despues_del_numeral():
  assert cuentas.url_del_enlace("abc") == "http://localhost:5173/crear-contrasena#abc"
