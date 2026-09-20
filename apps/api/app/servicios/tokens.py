#herramientas para trabajar con fechas y horas
from datetime import datetime, timedelta, timezone
#libreria que crea tokens jwt
import jwt
#error comun para tokens invalidos o vencidos
from jwt.exceptions import InvalidTokenError
#importar la configuracion privada del backend
from app.configuracion import obtener_configuracion


#cargamos la configuracion del sistema
configuracion = obtener_configuracion()

def generar_token_acceso(id_usuario:int) -> str:
  #obtener fecha y hora universal
  ahora = datetime.now(timezone.utc)

  #calcular cuando dejara de ser valido el token (30 min)
  expiracion = ahora + timedelta(minutes=configuracion.minutos_expiracion_token)

  #definir informacion que viajara dentro del token
  contenido = {
    "sub": str(id_usuario), #propietarion del token
    "iat": ahora, #momento en que se creo
    "exp": expiracion, #expiracion del token
  }

  #firmar el contenido y devolver el token como texto
  return jwt.encode(contenido, configuracion.clave_secreta_jwt.get_secret_value(), algorithm=configuracion.algoritmo_jwt)

def obtener_id_usuario_desde_token(token:str) -> int:
  #comprueba firma, algoritmo y expiracion
  contenido = jwt.decode(
    token,
    configuracion.clave_secreta_jwt.get_secret_value(),
    algorithms=[configuracion.algoritmo_jwt],
  )
  #obtiene el identificador guardado en sub
  sujeto = contenido.get("sub")

  #rechazar tokens que no identifiquen a un usuario
  if sujeto is None:
    raise InvalidTokenError("El token no contiene un usuario")

  try:
    #convertir identificador de texto a numero
    return int(sujeto)
  except (TypeError, ValueError) as error:
    #convertir un identificador incorrecto en un error de token
    raise InvalidTokenError("El identificador del token no es válido") from error
  