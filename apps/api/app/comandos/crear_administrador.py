#funcion que permite escribir contraseñas sin mostrarlas
from getpass import getpass
#importar nuestra fabrica de sesiones SQLAlchemy
from app.base_datos import FabricaSesiones
#logica reutilizable para crear usuarios
from app.servicios.usuarios import crear_usuario_interno

def main() -> None:
  #solicitar datos del admin+
  nombres = input("Nombres: ")
  apellidos = input("Apellidos: ")
  correo = input("Correo: ")

  #solicitar contraseña sin mostrarla en pantalla
  contrasena = getpass("Contraseña: ")

  #solicitar confirmacion de contrasena
  confirmacion = getpass("Confirma la contraseña:")

  #detener si ambas contraseñas son distinas
  if contrasena != confirmacion:
    print("Las contraseñas no coinciden")
    return

  #abrir sesion temporal con la bd
  with FabricaSesiones() as sesion:
    try:
      #crear el usuario usando rol ya registrado
      usuario = crear_usuario_interno(
        sesion=sesion,
        nombres= nombres,
        apellidos = apellidos,
        correo = correo ,
        contrasena = contrasena,
        nombre_rol="administrador",
      )
    except ValueError as error:
      print(f"No se pudo crear el administrador: {error}")
      return
  print(f"Administrador creado: {usuario.correo}")


#ejecutar solo main al llamar directamente a este módulo.
if __name__ == "__main__":
  main()
