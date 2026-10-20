import pytest

from app.esquemas.vacantes import VacanteActualizar
from app.servicios.texto_rico import html_a_texto, limpiar_html, texto_a_html, validar_texto_rico


def test_limpiar_quita_scripts_atributos_y_enlaces_peligrosos():
  sucio = '<p onclick="x()">Hola <strong>mundo</strong><script>alert(1)</script> <a href="javascript:alert(1)">a</a> <a href="https://ejemplo.com">b</a></p><h1>t</h1>'
  limpio = limpiar_html(sucio)
  assert "script" not in limpio and "onclick" not in limpio and "javascript" not in limpio
  assert "<strong>mundo</strong>" in limpio
  assert 'href="https://ejemplo.com"' in limpio
  #las etiquetas que el editor no tiene se quitan, el texto se queda
  assert "<h1>" not in limpio and "t" in limpio


def test_texto_plano_pasa_a_parrafos_escapados():
  assert texto_a_html("Hola <b>\nlínea\n\nOtro") == "<p>Hola &lt;b&gt;<br>línea</p><p>Otro</p>"


def test_html_a_texto_con_listas():
  html = "<p>Hola <strong>Ana</strong>,</p><ul><li><p>Uno</p></li><li><p>Dos &amp; tres</p></li></ul><p>Saludos</p>"
  assert html_a_texto(html) == "Hola Ana,\n\n- Uno\n- Dos & tres\n\nSaludos"


def test_el_minimo_cuenta_texto_no_etiquetas():
  with pytest.raises(ValueError):
    validar_texto_rico("<p><strong>corto</strong></p>", 20)
  assert validar_texto_rico("<p>Un texto con suficiente largo</p>", 20) == "<p>Un texto con suficiente largo</p>"


def test_la_vacante_guarda_la_descripcion_limpia():
  datos = VacanteActualizar(descripcion='<p>Buscamos a alguien <em>curioso</em> para el equipo</p><img src=x onerror="x()">')
  assert datos.descripcion == "<p>Buscamos a alguien <em>curioso</em> para el equipo</p>"
