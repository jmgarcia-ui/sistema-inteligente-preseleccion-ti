from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

from app.base_datos import obtener_sesion
from app.modelos import Usuario
from app.servicios.tokens import obtener_id_usuario_desde_token
from app.servicios.usuarios import obtener_usuario_por_id

#crea herramienta que lee la Authorizacion
esquema_bearer = HTTPBearer(auto_error=False)

def obtener_usuario_actual(credenciales:Annotated[HTTPAuthorizationCredentials | None, Depends(esquema_bearer)], sesion: Annotated[Session, Depends(obtener_sesion)]) -> Usuario:
  #si no hay credenciales
  if credenciales is None:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No se puede validar la sesión.")

  #obtener id de usuario
  try:
    id_usuario = obtener_id_usuario_desde_token(credenciales.credentials)
  except InvalidTokenError:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No se pudo validar la sesión.")

  #obtener usuario mediante id
  usuario = obtener_usuario_por_id(sesion,id_usuario)
  #validar si el usuario existo o si no esta activo
  if not usuario or not usuario.activo:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No se pudo validar la sesión")

  return usuario

def obtener_gestor_vacantes(
    usuario: Annotated[Usuario, Depends(obtener_usuario_actual)]
  ) -> Usuario:
  if usuario.rol.nombre not in {"administrador", "reclutador"}:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="No tienes permiso para gestionar vacantes")

  return usuario