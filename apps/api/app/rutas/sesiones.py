#permite describir dependencias junto al tipo de dato
from typing import Annotated
#herramientas para rutas, errores y codigos http
from fastapi import APIRouter, Depends, HTTPException, status
#tipo de sesion de sqlalchemy
from sqlalchemy.orm import Session
#funcion que entrega una sesion temporal
from app.base_datos import obtener_sesion
from app.esquemas.credenciales import(CredencialesInicioSesion, RespuestaToken, RespuestaUsuarioActual)
from app.servicios.tokens import generar_token_acceso
from app.servicios.usuarios import autenticar_usuario
from app.modelos import Usuario
from app.autorizacion import obtener_usuario_actual
#creamos la ruta
router = APIRouter(prefix="/autenticacion", tags=["autenticacion"])

@router.post("/iniciar-sesion", response_model=RespuestaToken)
def iniciar_sesion(
  credenciales: CredencialesInicioSesion,
  sesion:Annotated[Session, Depends(obtener_sesion)]) -> RespuestaToken:

  usuario = autenticar_usuario(sesion=sesion, correo=credenciales.correo, contrasena=credenciales.contrasena)

  if not usuario:
    raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

  token = generar_token_acceso(usuario.id)

  return RespuestaToken(token_acceso=token)

@router.get("/yo", response_model= RespuestaUsuarioActual)
def obtener_yo(usuario: Annotated[Usuario, Depends(obtener_usuario_actual)]) -> RespuestaUsuarioActual:
  return RespuestaUsuarioActual(id=usuario.id, nombres=usuario.nombres, apellidos=usuario.apellidos, correo=usuario.correo, activo=usuario.activo)
