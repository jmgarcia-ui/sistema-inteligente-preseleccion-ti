#arma docs/kpis/kpis-plan-calidad.xlsx con los datos de evidencia; cada resultado es una fórmula sobre los datos
#uso (desde apps/api): python evaluacion/armar_excel.py
import json
import xml.etree.ElementTree as ElementTree
from datetime import datetime
from pathlib import Path

from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

import _prod  # noqa: F401
from _prod import RUTA_API
from datos_cv import CVS, VARIANTES

DOCS = RUTA_API.parent.parent / "docs" / "kpis"
DATOS = DOCS / "datos"
SALIDA = DOCS / "kpis-plan-calidad.xlsx"

FUENTE = "Arial"
AZUL = "1E3A8A"
ENCABEZADO = PatternFill("solid", fgColor=AZUL)
ENTRADA = PatternFill("solid", fgColor="FFF59D")
EJEMPLO = PatternFill("solid", fgColor="EEEEEE")
RESALTE = PatternFill("solid", fgColor="E0E7FF")
BORDE = Border(*(Side(style="thin", color="CBD5E1"),) * 4)
NOTA_CITA = "(Cita no encontrada en el CV.)"


def _leer(nombre: str) -> dict:
  ruta = DATOS / nombre
  return json.loads(ruta.read_text(encoding="utf-8")) if ruta.exists() else {}


def _segundos(inicio: str, fin: str) -> float:
  return round((datetime.fromisoformat(fin) - datetime.fromisoformat(inicio)).total_seconds(), 2)


def _hoja(libro: Workbook, titulo: str, encabezados: list[str], anchos: list[int]):
  hoja = libro.create_sheet(titulo)
  for columna, (texto, ancho) in enumerate(zip(encabezados, anchos), start=1):
    celda = hoja.cell(row=1, column=columna, value=texto)
    celda.font = Font(name=FUENTE, bold=True, color="FFFFFF")
    celda.fill = ENCABEZADO
    celda.alignment = Alignment(wrap_text=True, vertical="center")
    hoja.column_dimensions[get_column_letter(columna)].width = ancho
  hoja.freeze_panes = "A2"
  hoja.row_dimensions[1].height = 30
  return hoja


def _fila(hoja, fila: int, valores: list) -> None:
  for columna, valor in enumerate(valores, start=1):
    celda = hoja.cell(row=fila, column=columna, value=valor)
    celda.font = Font(name=FUENTE, size=10)
    celda.border = BORDE
    celda.alignment = Alignment(wrap_text=True, vertical="top")


def _resumen_lateral(hoja, columna: int, filas: list[tuple[str, str, str | None]]) -> dict[str, str]:
  #bloque de indicadores a la derecha de los datos: etiqueta | fórmula; devuelve la celda de cada etiqueta
  letra_etiqueta, letra_valor = get_column_letter(columna), get_column_letter(columna + 1)
  hoja.column_dimensions[letra_etiqueta].width = 34
  hoja.column_dimensions[letra_valor].width = 16
  celdas = {}
  for indice, (etiqueta, formula, formato) in enumerate(filas, start=2):
    hoja[f"{letra_etiqueta}{indice}"] = etiqueta
    hoja[f"{letra_etiqueta}{indice}"].font = Font(name=FUENTE, bold=True, size=10)
    hoja[f"{letra_valor}{indice}"] = formula
    hoja[f"{letra_valor}{indice}"].font = Font(name=FUENTE, size=10)
    hoja[f"{letra_valor}{indice}"].fill = RESALTE
    if formato:
      hoja[f"{letra_valor}{indice}"].number_format = formato
    celdas[etiqueta] = f"${letra_valor}${indice}"
  return celdas


def kpi1(libro, funcionales: dict) -> dict:
  hoja = _hoja(libro, "KPI1 Funcional", ["Código", "Tipo de prueba", "Rol", "Módulo", "Caso de prueba", "Resultado esperado", "Resultado obtenido", "Resultado"], [9, 16, 13, 16, 46, 22, 26, 11])
  fila = 2
  for caso in funcionales.get("casos", []):
    _fila(hoja, fila, [caso["codigo"], "Funcional (API)", caso["rol"], caso["modulo"], caso["descripcion"], caso["esperado"], caso["obtenido"], caso["resultado"]])
    fila += 1
  raiz = ElementTree.parse(DATOS / "pytest.xml").getroot()
  for numero, prueba in enumerate(raiz.iter("testcase"), start=1):
    fallo = prueba.find("failure") is not None or prueba.find("error") is not None
    modulo = prueba.get("classname", "").split(".")[-1].replace("test_", "")
    _fila(hoja, fila, [f"U{numero:02d}", "Unitaria (pytest)", "Backend", modulo, prueba.get("name"), "pasa", "falla" if fallo else "pasa", "fallido" if fallo else "aprobado"])
    fila += 1
  ultima = fila - 1
  rango = f"$H$2:$H${ultima}"
  return _resumen_lateral(hoja, 10, [
    ("Casos ejecutados", f"=COUNTA({rango})", None),
    ("Casos aprobados", f'=COUNTIF({rango},"aprobado")', None),
    ("% de casos aprobados", f"=K3/K2", "0.0%"),
    ("Aprobados rol Candidato", f'=COUNTIFS($C$2:$C${ultima},"Candidato",{rango},"aprobado")&" de "&COUNTIF($C$2:$C${ultima},"Candidato")', None),
    ("Aprobados rol Reclutador", f'=COUNTIFS($C$2:$C${ultima},"Reclutador",{rango},"aprobado")&" de "&COUNTIF($C$2:$C${ultima},"Reclutador")', None),
    ("Aprobados rol Administrador", f'=COUNTIFS($C$2:$C${ultima},"Administrador",{rango},"aprobado")&" de "&COUNTIF($C$2:$C${ultima},"Administrador")', None),
    ("Aprobados Seguridad", f'=COUNTIFS($C$2:$C${ultima},"Seguridad",{rango},"aprobado")&" de "&COUNTIF($C$2:$C${ultima},"Seguridad")', None),
    ("Aprobados unitarias (pytest)", f'=COUNTIFS($B$2:$B${ultima},"Unitaria (pytest)",{rango},"aprobado")&" de "&COUNTIF($B$2:$B${ultima},"Unitaria (pytest)")', None),
  ]) | {"valor": "'KPI1 Funcional'!$K$4", "n": "'KPI1 Funcional'!$K$2"}


def kpi2(libro, lote: list[dict], produccion: dict) -> dict:
  hoja = _hoja(libro, "KPI2 Procesamiento", ["Origen", "CV", "Formato", "Páginas del PDF", "Páginas leídas", "Estado lectura", "Estado análisis", "Procesado correctamente", "Lectura completa", "Observación"], [16, 9, 15, 10, 10, 12, 12, 13, 11, 40])
  formatos = {cv["id"]: cv["formato"] for cv in CVS} | {v["id"]: next(cv["formato"] for cv in CVS if cv["id"] == v["base"]) for v in VARIANTES}
  fila = 2
  filas = [("Producción", f"P{p['id']}", "real (candidato)", p["paginas_documento"], p["paginas_leidas"], p["estado_lectura"], p["estado_analisis"], "") for p in produccion.get("postulaciones", [])]
  filas += [("Lote de evaluación", r["id"], formatos[r["id"]], r.get("paginas_documento"), r.get("paginas_leidas"), r.get("estado_lectura"), r.get("estado_analisis", "-"), "; ".join(a for a in r.get("avisos", []) if "páginas" in a) or r.get("error", "")) for r in lote]
  for origen, identificador, formato, paginas, leidas, lectura, analisis, observacion in filas:
    _fila(hoja, fila, [origen, identificador, formato, paginas, leidas, lectura, analisis, f'=IF(AND(F{fila}="leido",G{fila}="listo"),"sí","no")', f'=IF(E{fila}>=D{fila},"sí","no")', observacion])
    fila += 1
  ultima = fila - 1
  return _resumen_lateral(hoja, 12, [
    ("CV procesados (total)", f"=COUNTA($B$2:$B${ultima})", None),
    ("Procesados correctamente", f'=COUNTIF($H$2:$H${ultima},"sí")', None),
    ("% procesados correctamente", "=M3/M2", "0.0%"),
    ("CV con lectura completa", f'=COUNTIF($I$2:$I${ultima},"sí")', None),
    ("% con lectura completa", "=M5/M2", "0.0%"),
    ("Escaneados procesados", f'=COUNTIFS($C$2:$C${ultima},"escaneado",$H$2:$H${ultima},"sí")&" de "&COUNTIF($C$2:$C${ultima},"escaneado")', None),
  ]) | {"valor": "'KPI2 Procesamiento'!$M$4", "n": "'KPI2 Procesamiento'!$M$2"}


def kpi3(libro, lote: list[dict]) -> dict:
  hoja = _hoja(libro, "KPI3 Extraccion", ["CV", "Vacante", "N.º", "Requisito", "Tipo", "Etiqueta manual", "Resultado del sistema", "Acierto"], [8, 8, 6, 46, 14, 16, 18, 8])
  resultados = {r["id"]: r for r in lote}
  fila = 2
  for cv in CVS:
    resultado = resultados.get(cv["id"], {})
    for evidencia in resultado.get("evidencias", []):
      _fila(hoja, fila, [cv["id"], cv["vacante"], evidencia["numero"], evidencia["requisito"], "Imprescindible" if evidencia["obligatorio"] else "Deseable", cv["etiquetas"][evidencia["numero"]], evidencia["resultado"], f"=IF(F{fila}=G{fila},1,0)"])
      fila += 1
  ultima = fila - 1
  etiqueta, sistema = f"$F$2:$F${ultima}", f"$G$2:$G${ultima}"
  clases = ["cumple", "parcial", "sin_evidencia"]
  #matriz de confusión: filas = etiqueta manual, columnas = resultado del sistema
  hoja["J1"], hoja["J1"].font = "Matriz de confusión (filas: etiqueta manual; columnas: sistema)", Font(name=FUENTE, bold=True)
  for indice, clase in enumerate(clases):
    hoja.cell(row=2, column=11 + indice, value=clase).font = Font(name=FUENTE, bold=True)
    hoja.cell(row=3 + indice, column=10, value=clase).font = Font(name=FUENTE, bold=True)
    for columna, otra in enumerate(clases):
      celda = hoja.cell(row=3 + indice, column=11 + columna, value=f'=COUNTIFS({etiqueta},"{clase}",{sistema},"{otra}")')
      celda.border = BORDE
      celda.font = Font(name=FUENTE)
  hoja.cell(row=2, column=14, value="Total").font = Font(name=FUENTE, bold=True)
  for indice in range(3):
    hoja.cell(row=3 + indice, column=14, value=f"=SUM(K{3 + indice}:M{3 + indice})")
  hoja.cell(row=6, column=10, value="Total").font = Font(name=FUENTE, bold=True)
  for columna in "KLM":
    hoja[f"{columna}6"] = f"=SUM({columna}3:{columna}5)"
  #métricas por clase
  for columna, texto in zip("JKLMN", ["Clase", "Precisión", "Exhaustividad", "F1", "Soporte"]):
    hoja[f"{columna}8"] = texto
    hoja[f"{columna}8"].font = Font(name=FUENTE, bold=True, color="FFFFFF")
    hoja[f"{columna}8"].fill = ENCABEZADO
  for indice, (clase, diagonal, columna_total) in enumerate(zip(clases, ["K3", "L4", "M5"], ["K6", "L6", "M6"])):
    fila_m = 9 + indice
    hoja[f"J{fila_m}"] = clase
    hoja[f"K{fila_m}"] = f"=IFERROR({diagonal}/{columna_total},0)"
    hoja[f"L{fila_m}"] = f"=IFERROR({diagonal}/N{3 + indice},0)"
    hoja[f"M{fila_m}"] = f"=IFERROR(2*K{fila_m}*L{fila_m}/(K{fila_m}+L{fila_m}),0)"
    hoja[f"N{fila_m}"] = f"=N{3 + indice}"
    for columna in "KLM":
      hoja[f"{columna}{fila_m}"].number_format = "0.00"
  hoja.column_dimensions["J"].width = 34
  for columna in "KLMN":
    hoja.column_dimensions[columna].width = 14
  filas = [
    ("F1 macro (3 clases) — KPI", "=AVERAGE(M9:M11)", "0.00"),
    ("F1 ponderado por soporte", "=SUMPRODUCT(M9:M11,N9:N11)/SUM(N9:N11)", "0.00"),
    ("Exactitud (aciertos / pares)", f"=SUM($H$2:$H${ultima})/COUNT($H$2:$H${ultima})", "0.0%"),
    ("Pares CV-requisito evaluados", f"=COUNT($H$2:$H${ultima})", None),
    ("F1 binario (hay evidencia vs. no)", "=IFERROR(2*(K3+L3+K4+L4)/(2*(K3+L3+K4+L4)+(M3+M4)+(K5+L5)),0)", "0.00"),
  ]
  for indice, (texto, formula, formato) in enumerate(filas, start=13):
    hoja[f"J{indice}"], hoja[f"J{indice}"].font = texto, Font(name=FUENTE, bold=True)
    hoja[f"K{indice}"] = formula
    hoja[f"K{indice}"].fill = RESALTE
    if formato:
      hoja[f"K{indice}"].number_format = formato
  hoja["J19"] = "Las etiquetas manuales se fijaron al redactar cada CV ficticio, antes de pasarlo por el sistema (evaluacion/datos_cv.py)."
  hoja["J19"].font = Font(name=FUENTE, italic=True, size=9)
  return {"valor": "'KPI3 Extraccion'!$K$13", "n": "'KPI3 Extraccion'!$K$16"}


def kpi4(libro, funcionales: dict, produccion: dict) -> dict:
  hoja = _hoja(libro, "KPI4 Proteccion", ["Origen", "Control", "Elemento revisado", "Evidencia", "Conforme"], [16, 26, 48, 34, 11])
  fila = 2
  for postulacion in produccion.get("postulaciones", []):
    _fila(hoja, fila, ["Producción", "Consentimiento registrado", f"Postulación {postulacion['id']}", f"acepto_tratamiento_datos_en = {postulacion['acepto_tratamiento_datos_en'][:19]}", "sí" if postulacion["acepto_tratamiento_datos_en"] else "no"])
    fila += 1
  for caso in funcionales.get("casos", []):
    if "4" in caso["kpi"]:
      _fila(hoja, fila, ["Prueba funcional", "Consentimiento" if "consentimiento" in caso["descripcion"].lower() or caso["modulo"] == "Consentimiento" else "Acceso restringido", f"{caso['codigo']}: {caso['descripcion']}", f"esperado {caso['esperado']}; obtenido {caso['obtenido']}", "sí" if caso["resultado"] == "aprobado" else "no"])
      fila += 1
  ultima = fila - 1
  _fila(hoja, fila + 1, ["Diseño", "Instrucciones a la IA", "El prompt prohíbe usar edad, género, estado civil, nacionalidad, origen, religión, salud o foto (app/servicios/analisis_cv.py)", "Complementa el KPI 7 (estabilidad)", "referencia"])
  _fila(hoja, fila + 2, ["Diseño", "Inyección de instrucciones", "El CV06 trae una instrucción oculta pidiendo que lo aprueben", "Ver KPI 5: el sistema propuso no_pasa", "referencia"])
  return _resumen_lateral(hoja, 7, [
    ("Controles revisados", f"=COUNTA($E$2:$E${ultima})", None),
    ("Controles conformes", f'=COUNTIF($E$2:$E${ultima},"sí")', None),
    ("% conformes", "=H3/H2", "0.0%"),
  ]) | {"valor": "'KPI4 Proteccion'!$H$4", "n": "'KPI4 Proteccion'!$H$2"}


def kpi5(libro, lote: list[dict], produccion: dict) -> dict:
  hoja = _hoja(libro, "KPI5 Concordancia", ["Origen", "CV / postulación", "Vacante", "Propuesta de la IA", "Decisión del reclutador", "Coincide", "Nota"], [16, 14, 8, 14, 18, 9, 50])
  esperados = {cv["id"]: cv["esperado"] for cv in CVS}
  fila = 2
  for postulacion in produccion.get("postulaciones", []):
    _fila(hoja, fila, ["Producción", f"P{postulacion['id']}", postulacion["id_vacante"], postulacion["recomendacion"], postulacion["estado"], f'=IF(OR(AND(D{fila}="pasa",E{fila}="preseleccionada"),AND(D{fila}="no_pasa",E{fila}="descartada")),1,0)', "Decisión real tomada en el panel"])
    fila += 1
  for resultado in lote:
    if resultado["id"] in esperados and resultado.get("recomendacion"):
      decision = "preseleccionada" if esperados[resultado["id"]] == "pasa" else "descartada"
      nota = "Decisión de referencia fijada al diseñar el CV (rol de reclutador)"
      if resultado["id"] == "CV06":
        nota += "; CV con instrucción oculta a la IA"
      _fila(hoja, fila, ["Lote de evaluación", resultado["id"], resultado["vacante"], resultado["recomendacion"], decision, f'=IF(OR(AND(D{fila}="pasa",E{fila}="preseleccionada"),AND(D{fila}="no_pasa",E{fila}="descartada")),1,0)', nota])
      fila += 1
  ultima = fila - 1
  return _resumen_lateral(hoja, 9, [
    ("Casos comparados", f"=COUNT($F$2:$F${ultima})", None),
    ("Coincidencias", f"=SUM($F$2:$F${ultima})", None),
    ("% de concordancia", "=J3/J2", "0.0%"),
    ("IA pasa / reclutador preselecciona", f'=COUNTIFS($D$2:$D${ultima},"pasa",$E$2:$E${ultima},"preseleccionada")', None),
    ("IA pasa / reclutador descarta", f'=COUNTIFS($D$2:$D${ultima},"pasa",$E$2:$E${ultima},"descartada")', None),
    ("IA no pasa / reclutador preselecciona", f'=COUNTIFS($D$2:$D${ultima},"no_pasa",$E$2:$E${ultima},"preseleccionada")', None),
    ("IA no pasa / reclutador descarta", f'=COUNTIFS($D$2:$D${ultima},"no_pasa",$E$2:$E${ultima},"descartada")', None),
    ("Concordancia solo producción", f'=IFERROR(SUMIFS($F$2:$F${ultima},$A$2:$A${ultima},"Producción")/COUNTIF($A$2:$A${ultima},"Producción"),"")', "0.0%"),
  ]) | {"valor": "'KPI5 Concordancia'!$J$4", "n": "'KPI5 Concordancia'!$J$2"}


def kpi6(libro, lote: list[dict], produccion: dict, revision: dict) -> dict:
  hoja = _hoja(libro, "KPI6 Explicaciones", ["Origen", "CV", "N.º", "Requisito", "Resultado final", "Cita propuesta por la IA", "Página", "Cita verificada en el CV", "¿La cita respalda el requisito? (revisión manual)"], [14, 8, 6, 34, 13, 56, 7, 12, 18])
  fila = 2
  fuentes = [("Producción", f"P{p['id']}", p.get("evidencias") or []) for p in produccion.get("postulaciones", [])]
  fuentes += [("Lote de evaluación", r["id"], r.get("evidencias", [])) for r in lote]
  for origen, identificador, evidencias in fuentes:
    for evidencia in evidencias:
      descartada = evidencia["explicacion"].endswith(NOTA_CITA)
      if not evidencia["cita"] and not descartada:
        continue  #sin_evidencia propuesto por la IA: no hay cita que verificar
      clave = f"{identificador}|{evidencia['numero']}"
      _fila(hoja, fila, [origen, identificador, evidencia["numero"], evidencia["requisito"], evidencia["resultado"], evidencia["cita"] or "(descartada: no aparece en el CV)", evidencia["pagina"], "no" if descartada else "sí", revision.get(clave, "")])
      if clave in revision:
        hoja.cell(row=fila, column=9).fill = ENTRADA
      fila += 1
  ultima = fila - 1
  return _resumen_lateral(hoja, 11, [
    ("Evidencias con cita propuesta", f"=COUNTA($H$2:$H${ultima})", None),
    ("Citas verificadas en el CV", f'=COUNTIF($H$2:$H${ultima},"sí")', None),
    ("% de evidencias respaldadas por cita verificada", "=L3/L2", "0.0%"),
    ("Citas revisadas a mano", f'=COUNTIF($I$2:$I${ultima},"sí")+COUNTIF($I$2:$I${ultima},"no")', None),
    ("Revisadas que sí respaldan el requisito", f'=COUNTIF($I$2:$I${ultima},"sí")', None),
    ("% respaldo en la revisión manual", '=IFERROR(L6/L5,"")', "0.0%"),
  ]) | {"valor": "'KPI6 Explicaciones'!$L$4", "n": "'KPI6 Explicaciones'!$L$2"}


def kpi7(libro, lote: list[dict], repeticion: list[dict]) -> dict:
  hoja = _hoja(libro, "KPI7 Estabilidad", ["Par", "CV base", "Variante", "Qué datos personales cambiaron", "Recomendación base", "Recomendación variante", "Misma recomendación", "Requisitos con resultado distinto"], [6, 9, 10, 44, 14, 14, 12, 16])
  resultados = {r["id"]: r for r in lote}
  fila = 2
  for numero, variante in enumerate(VARIANTES, start=1):
    base, otra = resultados.get(variante["base"], {}), resultados.get(variante["id"], {})
    distintos = sum(a["resultado"] != b["resultado"] for a, b in zip(base.get("evidencias", []), otra.get("evidencias", [])))
    _fila(hoja, fila, [numero, variante["base"], variante["id"], variante["cambio"], base.get("recomendacion"), otra.get("recomendacion"), f"=IF(E{fila}=F{fila},1,0)", distintos])
    fila += 1
  ultima = fila - 1
  #control: el mismo CV base analizado otra vez, sin cambios; si cambia, la causa es la variabilidad de la IA y no los datos personales
  repeticiones: dict[str, list[str]] = {}
  for item in repeticion:
    repeticiones.setdefault(item["id"], []).append(item["recomendacion"])
  if repeticiones:
    inicio = fila + 2
    hoja.cell(row=inicio, column=1, value="Control: el mismo CV base, sin ningún cambio, analizado otra vez").font = Font(name=FUENTE, bold=True)
    for columna, texto in enumerate(["#", "CV", "Análisis 1 (lote)", "Repetición 1", "Repetición 2", "Siempre igual"], start=1):
      celda = hoja.cell(row=inicio + 1, column=columna, value=texto)
      celda.font = Font(name=FUENTE, bold=True, color="FFFFFF")
      celda.fill = ENCABEZADO
    fila_control = inicio + 2
    #los CV base y, si se repitieron, también las variantes que cambiaron de recomendación
    controlados = [variante["base"] for variante in VARIANTES] + [variante["id"] for variante in VARIANTES if variante["id"] in repeticiones]
    for numero, identificador in enumerate(controlados, start=1):
      otras = (repeticiones.get(identificador, []) + ["", ""])[:2]
      _fila(hoja, fila_control, [numero, identificador, resultados.get(identificador, {}).get("recomendacion"), otras[0], otras[1], f'=IF(AND(C{fila_control}=D{fila_control},D{fila_control}=E{fila_control}),1,0)'])
      fila_control += 1
    control = f"$F${inicio + 2}:$F${fila_control - 1}"
  return _resumen_lateral(hoja, 10, [
    ("Pares evaluados", f"=COUNT($G$2:$G${ultima})", None),
    ("Pares con la misma recomendación", f"=SUM($G$2:$G${ultima})", None),
    ("% de recomendaciones sin cambio", "=K3/K2", "0.0%"),
    ("Requisitos que cambiaron (total)", f"=SUM($H$2:$H${ultima})", None),
  ] + ([("CV estables al repetirlos sin cambios", f'=SUM({control})&" de "&COUNT({control})', None)] if repeticiones else [])) | {"valor": "'KPI7 Estabilidad'!$K$4", "n": "'KPI7 Estabilidad'!$K$2"}


def kpi8(libro, lote: list[dict], produccion: dict) -> dict:
  hoja = _hoja(libro, "KPI8 Rendimiento", ["Origen", "CV", "Lectura (s)", "Análisis IA (s)", "Total (s)", "≤ 120 s", "Nota"], [16, 9, 11, 13, 10, 8, 50])
  fila = 2
  for p in produccion.get("postulaciones", []):
    if p.get("analisis_listo"):
      _fila(hoja, fila, ["Producción", f"P{p['id']}", _segundos(p["lectura_creada"], p["lectura_lista"]), _segundos(p["analisis_creado"], p["analisis_listo"]), _segundos(p["creado_en"], p["analisis_listo"]), f"=IF(E{fila}<=120,1,0)", "Desde que se recibe la postulación hasta que el análisis queda listo (fechas de la base de datos)"])
      fila += 1
  for r in lote:
    if r.get("segundos_total") is not None:
      _fila(hoja, fila, ["Lote de evaluación", r["id"], r["segundos_lectura"], r["segundos_analisis"], r["segundos_total"], f"=IF(E{fila}<=120,1,0)", r.get("nota_tiempo", "")])
      fila += 1
  ultima = fila - 1
  rango = f"$E$2:$E${ultima}"
  return _resumen_lateral(hoja, 9, [
    ("CV medidos", f"=COUNT({rango})", None),
    ("CV en ≤ 120 s", f"=SUM($F$2:$F${ultima})", None),
    ("% de CV en ≤ 2 minutos", "=J3/J2", "0.0%"),
    ("Mediana (s)", f"=MEDIAN({rango})", "0.0"),
    ("Percentil 90 (s)", f"=PERCENTILE({rango},0.9)", "0.0"),
    ("Máximo (s)", f"=MAX({rango})", "0.0"),
    ("Promedio lectura (s)", f"=AVERAGE($C$2:$C${ultima})", "0.0"),
    ("Promedio análisis IA (s)", f"=AVERAGE($D$2:$D${ultima})", "0.0"),
  ]) | {"valor": "'KPI8 Rendimiento'!$J$4", "n": "'KPI8 Rendimiento'!$J$2"}


PREGUNTAS_SUS = [
  "Creo que me gustaría usar este sistema con frecuencia.",
  "Encontré el sistema innecesariamente complejo.",
  "Pensé que el sistema era fácil de usar.",
  "Creo que necesitaría el apoyo de un técnico para poder usar este sistema.",
  "Encontré que las funciones de este sistema estaban bien integradas.",
  "Pensé que había demasiada inconsistencia en este sistema.",
  "Imagino que la mayoría de las personas aprendería a usar este sistema muy rápidamente.",
  "Encontré el sistema muy difícil de usar.",
  "Me sentí muy seguro(a) usando el sistema.",
  "Necesité aprender muchas cosas antes de poder empezar a usar este sistema.",
]


def kpi9(libro) -> dict:
  hoja = _hoja(libro, "KPI9 SUS", ["Participante", "Perfil"] + [f"P{n}" for n in range(1, 11)] + ["Puntaje SUS (0-100)"], [14, 13] + [6] * 10 + [14])
  def puntaje(fila: int) -> str:
    impares = "+".join(f"{c}{fila}" for c in "CEGIK")
    pares = "+".join(f"{c}{fila}" for c in "DFHJL")
    return f'=IF(COUNT(C{fila}:L{fila})=10,(({impares})-5+(25-({pares})))*2.5,"")'
  #fila de ejemplo (gris): muestra el formato y NO entra en el promedio
  _fila(hoja, 2, ["Ejemplo", "Reclutador", 4, 2, 5, 1, 4, 2, 5, 1, 4, 2, puntaje(2)])
  for columna in range(1, 14):
    hoja.cell(row=2, column=columna).fill = EJEMPLO
  hoja["A2"].comment = Comment("Fila de ejemplo: muestra cómo llenar las respuestas. No se cuenta en el promedio.", "Evaluación")
  for fila in range(3, 23):
    _fila(hoja, fila, [f"Participante {fila - 2}", "", "", "", "", "", "", "", "", "", "", "", puntaje(fila)])
    for columna in range(2, 13):
      hoja.cell(row=fila, column=columna).fill = ENTRADA
  hoja["O1"], hoja["O1"].font = "Cómo llenar", Font(name=FUENTE, bold=True)
  hoja["O2"] = "Celdas amarillas: perfil (Candidato o Reclutador) y respuestas de 1 (muy en desacuerdo) a 5 (muy de acuerdo)."
  hoja["O3"] = "El puntaje se calcula solo: impares (respuesta − 1), pares (5 − respuesta), suma × 2,5."
  for numero, pregunta in enumerate(PREGUNTAS_SUS, start=1):
    hoja[f"O{4 + numero}"] = f"P{numero}. {pregunta}"
  hoja.column_dimensions["O"].width = 80
  celdas = _resumen_lateral(hoja, 17, [
    ("Participantes con encuesta completa", "=COUNT($M$3:$M$22)", None),
    ("Puntaje SUS promedio", '=IF(R2=0,"",AVERAGE($M$3:$M$22))', "0.0"),
    ("Promedio candidatos", '=IFERROR(AVERAGEIF($B$3:$B$22,"Candidato",$M$3:$M$22),"")', "0.0"),
    ("Promedio reclutadores", '=IFERROR(AVERAGEIF($B$3:$B$22,"Reclutador",$M$3:$M$22),"")', "0.0"),
  ])
  return celdas | {"valor": "'KPI9 SUS'!$R$3", "n": "'KPI9 SUS'!$R$2"}


def resumen(hoja, referencias: list[dict]) -> None:
  hoja.title = "Resumen"
  indicadores = [
    ("Implementación funcional y técnica", "≥ 95% de casos de prueba aprobados", 0.95, "0.0%", "Pruebas funcionales por rol (API) y pruebas unitarias automatizadas"),
    ("Procesamiento de currículums", "≥ 95% de CV en PDF procesados correctamente", 0.95, "0.0%", "Lote de 28 PDF de formatos variados + postulaciones de producción"),
    ("Extracción de información profesional", "F1-score ≥ 0.80", 0.80, "0.00", "18 CV con etiquetas manuales por requisito (F1 macro de 3 clases)"),
    ("Protección de datos personales", "100% de postulaciones con consentimiento registrado y acceso restringido", 1.0, "0.0%", "Producción (consentimiento) + pruebas de acceso con otro reclutador"),
    ("Concordancia con el reclutador", "≥ 80% de recomendaciones iguales a la decisión final", 0.80, "0.0%", "Producción (decisión real) + lote (decisión de referencia)"),
    ("Calidad de las explicaciones", "≥ 90% de evidencias respaldadas por cita verificada", 0.90, "0.0%", "Verificación automática de citas + revisión manual de una muestra"),
    ("Estabilidad de la evaluación", "≥ 90% de recomendaciones sin cambio", 0.90, "0.0%", "10 pares de CV que solo cambian datos personales"),
    ("Rendimiento del pipeline", "≥ 90% de CV analizados en ≤ 2 minutos", 0.90, "0.0%", "Tiempos de lectura + análisis (lote y producción) y prueba de estrés"),
    ("Aceptación de usuarios", "SUS ≥ 70", 70, "0.0", "Encuesta SUS (pendiente de aplicar)"),
  ]
  titulos = ["N.º", "Indicador", "Meta", "Umbral", "Valor obtenido", "Muestra (n)", "¿Cumple?", "Evidencia (hoja)", "Actividad de control"]
  anchos = [5, 30, 36, 9, 13, 11, 11, 20, 52]
  hoja["A1"] = "Plan de calidad (5.14): resultados de los indicadores"
  hoja["A1"].font = Font(name=FUENTE, bold=True, size=14, color=AZUL)
  hoja["A2"] = f"Generado el {datetime.now():%d/%m/%Y %H:%M}. Cada valor se calcula con fórmulas en su hoja; las celdas amarillas son entradas manuales."
  hoja["A2"].font = Font(name=FUENTE, italic=True, size=9)
  for columna, (texto, ancho) in enumerate(zip(titulos, anchos), start=1):
    celda = hoja.cell(row=4, column=columna, value=texto)
    celda.font = Font(name=FUENTE, bold=True, color="FFFFFF")
    celda.fill = ENCABEZADO
    celda.alignment = Alignment(wrap_text=True, vertical="center")
    hoja.column_dimensions[get_column_letter(columna)].width = ancho
  for numero, ((nombre, meta, umbral, formato, actividad), referencia) in enumerate(zip(indicadores, referencias), start=1):
    fila = 4 + numero
    hoja_evidencia = referencia["valor"].split("!")[0].strip("'")
    _fila(hoja, fila, [numero, nombre, meta, umbral, f'=IF({referencia["valor"]}="","",{referencia["valor"]})', f"={referencia['n']}", f'=IF(E{fila}="","Pendiente",IF(E{fila}>=D{fila},"Sí","No"))', hoja_evidencia, actividad])
    hoja[f"D{fila}"].number_format = formato
    hoja[f"E{fila}"].number_format = formato
    hoja[f"E{fila}"].fill = RESALTE
    hoja[f"G{fila}"].font = Font(name=FUENTE, bold=True)
  hoja["A15"] = "Leyenda: «Sí» = alcanza la meta; «No» = no la alcanza; «Pendiente» = falta aplicar la actividad de control (KPI 9: llenar la hoja KPI9 SUS)."
  hoja["A15"].font = Font(name=FUENTE, size=9)
  hoja.freeze_panes = "A5"


def main() -> None:
  produccion, lote, funcionales = _leer("produccion.json"), _leer("lote_resultados.json").get("resultados", []), _leer("pruebas_funcionales.json")
  revision = _leer("revision_citas.json").get("revision", {})
  libro = Workbook()
  hoja_resumen = libro.active
  referencias = [kpi1(libro, funcionales), kpi2(libro, lote, produccion), kpi3(libro, lote), kpi4(libro, funcionales, produccion), kpi5(libro, lote, produccion), kpi6(libro, lote, produccion, revision), kpi7(libro, lote, _leer("repeticion_base.json").get("repeticiones", [])), kpi8(libro, lote, produccion), kpi9(libro)]
  resumen(hoja_resumen, referencias)
  libro.calculation.fullCalcOnLoad = True
  libro.save(SALIDA)
  print(f"Guardado en {SALIDA}")


if __name__ == "__main__":
  main()
