from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

Rol = Literal["administrador", "reclutador"]


#una cuenta del equipo, como la ve el administrador
class UsuarioAdmin(BaseModel):
  id: int
  nombres: str
  apellidos: str
  correo: str
  rol: str
  activo: bool
  invitacion_pendiente: bool
  ultimo_acceso_en: datetime | None
  creado_en: datetime
  #vacantes que creó (para saber qué deja a cargo si se desactiva)
  vacantes: int


class InvitarUsuario(BaseModel):
  nombres: str = Field(min_length=1, max_length=100)
  apellidos: str = Field(min_length=1, max_length=100)
  correo: EmailStr = Field(max_length=254)
  rol: Rol
  model_config = ConfigDict(str_strip_whitespace=True)


#solo los campos enviados cambian
class ActualizarUsuario(BaseModel):
  nombres: str | None = Field(default=None, min_length=1, max_length=100)
  apellidos: str | None = Field(default=None, min_length=1, max_length=100)
  rol: Rol | None = None
  activo: bool | None = None
  model_config = ConfigDict(str_strip_whitespace=True)


#al invitar o enviar un enlace: el enlace se devuelve para copiarlo si el correo no llegó
class ResultadoEnlace(BaseModel):
  usuario: UsuarioAdmin
  tipo: Literal["invitacion", "restablecer"]
  enlace: str
  expira_en: datetime
  correo_enviado: bool


#---- públicos: la persona que abre su enlace ----
class TokenEnlace(BaseModel):
  token: str = Field(min_length=20, max_length=200)


class InfoEnlace(BaseModel):
  nombres: str
  correo: str
  tipo: Literal["invitacion", "restablecer"]


class CrearContrasena(TokenEnlace):
  contrasena: str = Field(min_length=15, max_length=128)
