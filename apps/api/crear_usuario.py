#crea una cuenta del equipo (administrador o reclutador) desde la terminal
#uso:  python crear_usuario.py               -> base local (.env)
#      python crear_usuario.py --produccion  -> base de producción (.env.produccion)
#la contraseña se escribe sin mostrarse y nunca sale de este equipo: solo se guarda su hash
import getpass
import os
import sys

from dotenv import dotenv_values

if "--produccion" in sys.argv:
  #debe cargarse antes de importar la app: la configuración se lee una sola vez
  os.environ.update({clave: valor for clave, valor in dotenv_values(".env.produccion").items() if valor})

from sqlalchemy import select  # noqa: E402

import app.modelos  # noqa: E402,F401  (registra todos los modelos)
from app.base_datos import FabricaSesiones  # noqa: E402
from app.modelos.rol import Rol  # noqa: E402
from app.modelos.usuario import Usuario  # noqa: E402
from app.servicios.contrasenas import generar_hash  # noqa: E402

MINIMO_CONTRASENA = 10


def preguntar(texto: str) -> str:
  while not (valor := input(texto).strip()):
    print("  No puede quedar vacío.")
  return valor


def main() -> None:
  destino = "PRODUCCIÓN" if "--produccion" in sys.argv else "local"
  print(f"Nueva cuenta en la base {destino}\n")
  nombres = preguntar("Nombres: ")
  apellidos = preguntar("Apellidos: ")
  correo = preguntar("Correo: ").lower()
  rol_nombre = ""
  while rol_nombre not in ("administrador", "reclutador"):
    rol_nombre = preguntar("Rol (administrador / reclutador): ").lower()
  while True:
    contrasena = getpass.getpass(f"Contraseña (mínimo {MINIMO_CONTRASENA} caracteres, no se muestra): ")
    if len(contrasena) < MINIMO_CONTRASENA:
      print("  Muy corta.")
    elif contrasena != getpass.getpass("Repítela: "):
      print("  No coinciden.")
    else:
      break

  with FabricaSesiones() as sesion:
    if sesion.scalar(select(Usuario).where(Usuario.correo == correo)):
      sys.exit(f"Ya existe una cuenta con {correo}.")
    rol = sesion.scalar(select(Rol).where(Rol.nombre == rol_nombre))
    if rol is None:
      sys.exit(f"No existe el rol {rol_nombre}: ¿corriste las migraciones?")
    sesion.add(Usuario(id_rol=rol.id, nombres=nombres, apellidos=apellidos, correo=correo, contrasena_hash=generar_hash(contrasena)))
    sesion.commit()
  print(f"\nListo: {nombres} {apellidos} ({rol_nombre}) ya puede iniciar sesión con {correo}.")


if __name__ == "__main__":
  main()
