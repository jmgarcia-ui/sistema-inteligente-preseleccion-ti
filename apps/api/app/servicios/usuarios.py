#herramienta para construir consultas SELECT
from sqlalchemy import select
#importar el tipo de session que trabaja con la bd
from sqlalchemy.orm import Session
#importa el modelo que representa la tabla usuarios
from app.modelos import Usuario, Rol

from app.seguridad.contrasenas import generar_hash 

def obtener_usuario_por_correo(sesion: Session, correo: str) -> Usuario | None:
  #quitar espacios del correo y convertir a minuscula
  correo_normalizado = correo.strip().lower()
  #construccion de la consulta
  consulta = select(Usuario).where(Usuario.correo == correo_normalizado)

  #ejecutar la consulta y devolver usuario o none
  return sesion.scalar(consulta)

#crear usuario interno y guardar en la bd
def crear_usuario_interno(
    sesion: Session,
    nombres: str,
    apellidos: str,
    correo: str,
    contrasena: str,
    nombre_rol: str,
  )-> Usuario:

  #normalizar el correo
  correo_normalizado = correo.strip().lower()
  #rechazar contraseñas demasiado cortas antes de hashearlas
  if len(contrasena) < 15:
    raise ValueError("La contraseña debe tener al menos 15 carácteres.")
  #comprobar si el correo ya existe
  usuario_existente = obtener_usuario_por_correo(sesion, correo_normalizado)

  #lanzamos excepcion si el usuario ya existe
  if usuario_existente is not None:
    raise ValueError("El correo ya está registrado")

  #construir consulta para buscar el rol solicitado
  consulta_rol = select(Rol).where(Rol.nombre == nombre_rol)

  #ejecutamos la consulta
  rol = sesion.scalar(consulta_rol)

  #detiene la creacion si el rol no exist
  if rol is None:
    raise ValueError("El rol no existe")

  #construir el usuario con la data obtenida
  usuario = Usuario(
    id_rol=rol.id,
    nombres = nombres.strip(),
    apellidos = apellidos.strip(),
    correo = correo_normalizado,
    contrasena_hash = generar_hash(contrasena),
  )

  #añadimos el usuario al trabajo pendiente
  sesion.add(usuario)

  #guardar en sql server
  sesion.commit()

  #traer el id generado por sql server
  sesion.refresh(usuario)

  #devolver el usuario guardado
  return usuario
  


