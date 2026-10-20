import html
import re

import nh3

#lo único que permite el editor: párrafos, negrita, cursiva, subrayado, listas y enlaces
ETIQUETAS = {"p", "br", "strong", "em", "u", "ul", "ol", "li", "a"}
ATRIBUTOS = {"a": {"href"}}


def es_html(texto: str) -> bool:
  #los textos de antes del editor son texto plano; los nuevos siempre empiezan con una etiqueta
  return texto.lstrip().startswith("<")


#quita todo lo que no sea del editor (scripts, estilos, atributos, enlaces javascript:)
def limpiar_html(texto: str) -> str:
  return nh3.clean(texto, tags=ETIQUETAS, attributes=ATRIBUTOS, url_schemes={"http", "https", "mailto"}).strip()


#texto plano (de la IA o de antes del editor) → HTML: cada bloque separado por una línea en blanco es un párrafo
def texto_a_html(texto: str) -> str:
  if es_html(texto):
    return limpiar_html(texto)
  parrafos = [html.escape(parrafo.strip()).replace("\n", "<br>") for parrafo in texto.strip().split("\n\n") if parrafo.strip()]
  return "".join(f"<p>{parrafo}</p>" for parrafo in parrafos)


#HTML → texto plano: para la versión sin formato del correo, el prompt de la IA y contar caracteres
def html_a_texto(texto: str) -> str:
  if not es_html(texto):
    return texto.strip()
  #el editor envuelve cada punto de una lista en un párrafo: se quita para no dejar líneas en blanco entre puntos
  texto = re.sub(r"<li[^>]*>\s*<p[^>]*>", "<li>", texto)
  texto = re.sub(r"</p>\s*</li>", "</li>", texto)
  texto = re.sub(r"<br\s*/?>", "\n", texto)
  texto = re.sub(r"<li[^>]*>", "\n- ", texto)
  texto = re.sub(r"</(p|ul|ol)>", "\n\n", texto)
  texto = html.unescape(re.sub(r"<[^>]+>", "", texto))
  #sin espacios al final de cada línea ni más de una línea en blanco seguida
  texto = "\n".join(linea.rstrip() for linea in texto.splitlines())
  return re.sub(r"\n{3,}", "\n\n", texto).strip()


#para los esquemas: limpia el HTML y exige un mínimo de texto real (sin contar etiquetas)
def validar_texto_rico(valor: str, minimo: int) -> str:
  limpio = texto_a_html(valor)
  if len(html_a_texto(limpio)) < minimo:
    raise ValueError(f"Escribe al menos {minimo} caracteres.")
  return limpio
