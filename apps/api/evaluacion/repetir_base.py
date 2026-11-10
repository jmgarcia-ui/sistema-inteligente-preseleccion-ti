#KPI 7 (control): vuelve a analizar los mismos CV base sin cambiar nada, para separar la variabilidad propia de la IA
#del efecto de los datos personales. Si un CV idéntico cambia de recomendación, el cambio no se debe a los datos personales.
#uso (desde apps/api): python evaluacion/repetir_base.py
import json
import time

from _prod import RUTA_API
from datos_cv import CVS, VARIANTES
from evaluar_lote import _vacantes, procesar

SALIDA = RUTA_API.parent.parent / "docs" / "kpis" / "datos" / "repeticion_base.json"
REPETICIONES = 2


def main() -> None:
  vacantes = _vacantes()
  por_id = {cv["id"]: cv for cv in CVS}
  resultados = []
  for variante in VARIANTES:
    cv = por_id[variante["base"]]
    for repeticion in range(1, REPETICIONES + 1):
      resultado = procesar(cv["id"], cv["vacante"], cv["persona"]["nombre"], vacantes[cv["vacante"]])
      resultados.append({"id": cv["id"], "repeticion": repeticion, "recomendacion": resultado.get("recomendacion"), "resultados": [e["resultado"] for e in resultado.get("evidencias", [])]})
      print(cv["id"], repeticion, resultado.get("recomendacion"), flush=True)
  SALIDA.write_text(json.dumps({"ejecutado_en": time.strftime("%Y-%m-%d %H:%M:%S"), "repeticiones": resultados}, ensure_ascii=False, indent=2), encoding="utf-8")
  print(f"Guardado en {SALIDA}")


if __name__ == "__main__":
  main()
