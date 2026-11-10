#genera los PDF del lote de evaluación en docs/kpis/cv (formatos variados para el KPI 2)
#uso (desde apps/api): python evaluacion/generar_cv.py
import io
import random
from pathlib import Path

import pypdfium2
from PIL import Image, ImageFilter
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import BaseDocTemplate, Frame, FrameBreak, PageBreak, PageTemplate, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from datos_cv import CVS, VARIANTES

CARPETA = Path(__file__).resolve().parents[3] / "docs" / "kpis" / "cv"

NOMBRE = ParagraphStyle("nombre", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=colors.HexColor("#0f2a4a"))
TITULO = ParagraphStyle("titulo", fontName="Helvetica-Bold", fontSize=12, leading=16, spaceBefore=10, spaceAfter=4, textColor=colors.HexColor("#1d4ed8"))
CARGO = ParagraphStyle("cargo", fontName="Helvetica-Bold", fontSize=10.5, leading=14, spaceBefore=4)
TEXTO = ParagraphStyle("texto", fontName="Helvetica", fontSize=10, leading=13.5)
VINETA = ParagraphStyle("vineta", parent=TEXTO, leftIndent=12, bulletIndent=2)
PEQUENO = ParagraphStyle("pequeno", parent=TEXTO, fontSize=7, leading=9, textColor=colors.HexColor("#9ca3af"))


def _contacto(persona: dict) -> list[str]:
  lineas = [persona["correo"], persona["telefono"], persona["ciudad"]]
  #datos personales (solo aparecen en las variantes del KPI 7)
  for clave, etiqueta in (("edad", "Edad"), ("nacionalidad", "Nacionalidad"), ("estado_civil", "Estado civil"), ("genero", "Género"), ("religion", "Religión"), ("salud", "Salud")):
    if persona.get(clave):
      lineas.append(f"{etiqueta}: {persona[clave]}")
  return lineas


def _experiencia(cv: dict) -> list:
  bloques = []
  for cargo, empresa, periodo, puntos in cv["experiencia"]:
    bloques.append(Paragraph(f"{cargo} · {empresa} <font color=\"#6b7280\">({periodo})</font>", CARGO))
    bloques += [Paragraph(punto, VINETA, bulletText="•") for punto in puntos]
  return bloques


def _lista(items: list[str]) -> list:
  return [Paragraph(item, VINETA, bulletText="•") for item in items]


def _extra(cv: dict) -> list:
  if not cv["extra"]:
    return []
  if cv["formato"] == "inyeccion":
    #la instrucción va en letra pequeña y gris, como suele esconderse en un CV real
    return [Paragraph(item, PEQUENO) for item in cv["extra"]]
  return [Paragraph("Información adicional", TITULO)] + _lista(cv["extra"])


def _una_columna(cv: dict, persona: dict, salto: bool) -> bytes:
  memoria = io.BytesIO()
  documento = SimpleDocTemplate(memoria, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=1.8 * cm, bottomMargin=1.8 * cm, title=f"CV {persona['nombre']}")
  separador = [PageBreak()] if salto else []
  historia = [Paragraph(persona["nombre"], NOMBRE), Paragraph(" · ".join(_contacto(persona)), TEXTO), Spacer(0, 6)]
  historia += [Paragraph("Perfil", TITULO), Paragraph(cv["perfil"], TEXTO)]
  historia += [Paragraph("Experiencia", TITULO)] + _experiencia(cv) + separador
  historia += [Paragraph("Educación", TITULO)] + _lista(cv["educacion"])
  historia += [Paragraph("Habilidades", TITULO), Paragraph(", ".join(cv["habilidades"]), TEXTO)] + separador
  historia += _extra(cv)
  documento.build(historia)
  return memoria.getvalue()


def _dos_columnas(cv: dict, persona: dict) -> bytes:
  memoria = io.BytesIO()
  ancho, alto = A4
  lateral = Frame(1.2 * cm, 1.5 * cm, 6 * cm, alto - 3 * cm, id="lateral")
  principal = Frame(7.8 * cm, 1.5 * cm, ancho - 9 * cm, alto - 3 * cm, id="principal")

  def fondo(lienzo, _documento):
    lienzo.setFillColor(colors.HexColor("#eef2ff"))
    lienzo.rect(0, 0, 7.4 * cm, alto, stroke=0, fill=1)

  documento = BaseDocTemplate(memoria, pagesize=A4, title=f"CV {persona['nombre']}")
  documento.addPageTemplates([PageTemplate(frames=[lateral, principal], onPage=fondo)])
  historia = [Paragraph(persona["nombre"], ParagraphStyle("nombre2", parent=NOMBRE, fontSize=16, leading=20)), Spacer(0, 6)]
  historia += [Paragraph("Contacto", TITULO)] + [Paragraph(linea, TEXTO) for linea in _contacto(persona)]
  historia += [Paragraph("Habilidades", TITULO)] + _lista(cv["habilidades"])
  historia += [Paragraph("Educación", TITULO)] + [Paragraph(item, TEXTO) for item in cv["educacion"]]
  historia += [FrameBreak(), Paragraph("Perfil", TITULO), Paragraph(cv["perfil"], TEXTO)]
  historia += [Paragraph("Experiencia", TITULO)] + _experiencia(cv) + _extra(cv)
  documento.build(historia)
  return memoria.getvalue()


def _tablas(cv: dict, persona: dict) -> bytes:
  memoria = io.BytesIO()
  documento = SimpleDocTemplate(memoria, pagesize=A4, leftMargin=1.8 * cm, rightMargin=1.8 * cm, topMargin=1.5 * cm, bottomMargin=1.5 * cm, title=f"CV {persona['nombre']}")
  estilo = TableStyle([
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#94a3b8")),
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
  ])
  encabezado = ParagraphStyle("encabezado", parent=TEXTO, fontName="Helvetica-Bold", textColor=colors.white)
  filas = [[Paragraph(texto, encabezado) for texto in ("Periodo", "Cargo y empresa", "Logros")]]
  for cargo, empresa, periodo, puntos in cv["experiencia"]:
    filas.append([Paragraph(periodo, TEXTO), Paragraph(f"<b>{cargo}</b><br/>{empresa}", TEXTO), [Paragraph(punto, VINETA, bulletText="•") for punto in puntos]])
  items = cv["habilidades"] + [""] * (-len(cv["habilidades"]) % 3)
  habilidades = [[Paragraph(texto, encabezado) for texto in ("Habilidad", "Habilidad", "Habilidad")]]
  habilidades += [[Paragraph(item, TEXTO) for item in items[i:i + 3]] for i in range(0, len(items), 3)]
  historia = [Paragraph(persona["nombre"], NOMBRE), Paragraph(" | ".join(_contacto(persona)), TEXTO)]
  historia += [Paragraph("Perfil", TITULO), Paragraph(cv["perfil"], TEXTO)]
  historia += [Paragraph("Experiencia", TITULO), Table(filas, colWidths=[2.6 * cm, 4.8 * cm, 10 * cm], style=estilo)]
  historia += [Paragraph("Habilidades", TITULO), Table(habilidades, colWidths=[5.8 * cm] * 3, style=estilo)]
  historia += [Paragraph("Educación", TITULO)] + _lista(cv["educacion"]) + _extra(cv)
  documento.build(historia)
  return memoria.getvalue()


def _escanear(pdf: bytes, semilla: int) -> bytes:
  #simula un CV impreso y escaneado: solo imagen (sin texto seleccionable), en gris, inclinado y con ruido
  azar = random.Random(semilla)
  paginas = []
  for pagina in pypdfium2.PdfDocument(pdf):
    imagen = pagina.render(scale=150 / 72).to_pil().convert("L")
    imagen = imagen.rotate(azar.uniform(-1.2, 1.2), expand=True, fillcolor=245)
    ruido = Image.effect_noise(imagen.size, 18).convert("L")
    imagen = Image.blend(imagen, ruido, 0.08).filter(ImageFilter.GaussianBlur(0.6))
    paginas.append(imagen)
  salida = io.BytesIO()
  paginas[0].save(salida, format="PDF", save_all=True, append_images=paginas[1:], resolution=150)
  return salida.getvalue()


def generar(cv: dict, persona: dict) -> bytes:
  formato = cv["formato"]
  if formato == "dos_columnas":
    return _dos_columnas(cv, persona)
  if formato == "tablas":
    return _tablas(cv, persona)
  pdf = _una_columna(cv, persona, salto=formato == "multipagina")
  return _escanear(pdf, int(cv["id"][2:4])) if formato == "escaneado" else pdf


def main() -> None:
  CARPETA.mkdir(parents=True, exist_ok=True)
  por_id = {cv["id"]: cv for cv in CVS}
  for cv in CVS:
    (CARPETA / f"{cv['id']}.pdf").write_bytes(generar(cv, cv["persona"]))
  for variante in VARIANTES:
    base = por_id[variante["base"]]
    (CARPETA / f"{variante['id']}.pdf").write_bytes(generar(base, base["persona"] | variante["persona"]))
  print(f"{len(CVS)} CV y {len(VARIANTES)} variantes en {CARPETA}")


if __name__ == "__main__":
  main()
