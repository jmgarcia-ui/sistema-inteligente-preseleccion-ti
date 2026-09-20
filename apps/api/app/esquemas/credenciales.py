from pydantic import BaseModel, EmailStr, Field

#definir los datos que nos enviara react al iniciar sesion
class CredencialesInicioSesion(BaseModel):
  #comprobar que el correo tenga un formato valido
  correo: EmailStr
  #aceptar contraseña de entre 1 y 128 caracteres
  contrasena: str = Field(min_length=1, max_length=128)

#definir datos que devolvera fastapi si el acceso es valido
class RespuestaToken(BaseModel):
  #contiene token jwt firmado
  token_acceso: str
  #indica como debe enviarse el token
  tipo_token: str = "bearer"

#definir datos de usuario que devolvera fastapi mediante token
class RespuestaUsuarioActual(BaseModel):
  #id del usuario
  id: int
  nombres: str
  apellidos: str
  correo: EmailStr
  activo: bool