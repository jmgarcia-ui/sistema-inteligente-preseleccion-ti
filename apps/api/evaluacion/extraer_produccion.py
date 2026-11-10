#extrae de producción (solo lectura) los datos que respaldan los KPI 2, 4, 5, 6 y 8
#uso (desde apps/api): python evaluacion/extraer_produccion.py
#no guarda datos personales del candidato (nombres, correos, teléfonos): solo ids, estados, fechas y evidencias
import json
from datetime import datetime
from pathlib import Path

from sqlalchemy import text

from _prod import RUTA_API, motor_produccion

SALIDA = RUTA_API.parent.parent / "docs" / "kpis" / "datos" / "produccion.json"


def _filas(conexion, consulta: str) -> list[dict]:
  return [dict(fila) for fila in conexion.execute(text(consulta)).mappings()]


def _serializar(valor):
  return valor.isoformat() if isinstance(valor, datetime) else str(valor)


def main() -> None:
  with motor_produccion().connect() as conexion:
    datos = {
      "extraido_en": datetime.now().isoformat(timespec="seconds"),
      "vacantes": _filas(conexion, "select id, titulo, estado, modalidad, creado_en from vacantes order by id"),
      "requisitos": _filas(conexion, "select id_vacante, orden, obligatorio, descripcion from requisitos_vacante order by id_vacante, orden"),
      "postulaciones": _filas(
        conexion,
        """select p.id, p.id_vacante, p.estado, p.creado_en, p.decidido_en, p.acepto_tratamiento_datos_en,
                  case when p.cv_clave is null then 0 else 1 end tiene_cv, p.cv_tamano,
                  l.estado estado_lectura, l.creado_en lectura_creada, l.actualizado_en lectura_lista,
                  l.paginas_documento, l.paginas_leidas, l.modelo modelo_lectura,
                  a.estado estado_analisis, a.recomendacion, a.creado_en analisis_creado, a.actualizado_en analisis_listo,
                  a.modelo modelo_ia, a.tokens_entrada, a.tokens_salida, a.evidencias, a.avisos
           from postulaciones p
           left join lecturas_cv l on l.id_postulacion = p.id
           left join analisis_cv a on a.id_postulacion = p.id
           order by p.id""",
      ),
      "usuarios_por_rol": _filas(conexion, "select r.nombre rol, count(*) cantidad from usuarios u join roles r on r.id = u.id_rol group by r.nombre"),
      "acciones": _filas(conexion, "select tipo, count(*) cantidad from registro_acciones group by tipo"),
      "correos": _filas(conexion, "select estado, count(*) cantidad from envios_correo group by estado"),
    }
  for postulacion in datos["postulaciones"]:
    for campo in ("evidencias", "avisos"):
      if postulacion[campo]:
        postulacion[campo] = json.loads(postulacion[campo])
  SALIDA.parent.mkdir(parents=True, exist_ok=True)
  SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=2, default=_serializar), encoding="utf-8")
  print(f"Guardado en {SALIDA}")


if __name__ == "__main__":
  main()
