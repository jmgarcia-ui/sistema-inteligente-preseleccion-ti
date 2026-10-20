import math
import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

#protege el formulario público: cada postulación guarda un CV en Azure y gasta lectura e IA
#reglas por dirección IP: (cantidad máxima, ventana en segundos)
REGLAS_POSTULACION = [(5, 10 * 60), (20, 24 * 60 * 60)]


class LimiteIntentos:
  #cuenta intentos recientes por clave en memoria; se reinicia si la API se reinicia (suficiente para un solo servidor)
  def __init__(self, reglas: list[tuple[int, int]]):
    self.reglas = reglas
    self.ventana_mayor = max(segundos for _, segundos in reglas)
    self.intentos: dict[str, deque[float]] = defaultdict(deque)
    self.candado = threading.Lock()

  #registra un intento; si supera alguna regla devuelve cuántos segundos esperar (y no lo registra)
  def intentar(self, clave: str, ahora: float | None = None) -> int | None:
    ahora = time.monotonic() if ahora is None else ahora
    with self.candado:
      cola = self.intentos[clave]
      while cola and ahora - cola[0] > self.ventana_mayor:
        cola.popleft()
      for maximo, segundos in self.reglas:
        recientes = [momento for momento in cola if ahora - momento <= segundos]
        if len(recientes) >= maximo:
          return max(1, math.ceil(segundos - (ahora - recientes[0])))
      cola.append(ahora)
      return None


limite_postulaciones = LimiteIntentos(REGLAS_POSTULACION)


#en Azure la petición llega a través de un proxy: la IP real es la última que agregó ese proxy en X-Forwarded-For
#(la última y no la primera: las anteriores las puede inventar el visitante); puede venir con puerto, que se quita
def ip_del_visitante(request: Request) -> str:
  reenviada = request.headers.get("x-forwarded-for")
  if reenviada:
    ip = reenviada.split(",")[-1].strip()
    if ip.startswith("["):
      return ip[1 : ip.find("]")]
    return ip.split(":")[0] if ip.count(":") == 1 else ip
  return request.client.host if request.client else "desconocida"


#dependencia de la ruta pública de postulación
def limitar_postulaciones(request: Request) -> None:
  ip = ip_del_visitante(request)
  espera = limite_postulaciones.intentar(ip)
  if espera is not None:
    minutos = max(1, math.ceil(espera / 60))
    raise HTTPException(
      status_code=status.HTTP_429_TOO_MANY_REQUESTS,
      detail=f"Recibimos demasiadas postulaciones desde tu conexión. Inténtalo de nuevo en {minutos} minuto{'s' if minutos != 1 else ''}.",
      headers={"Retry-After": str(espera)},
    )
