import { createContext } from "react";
import type { Credenciales, RespuestaToken, UsuarioAutenticado } from "../tipos/sesion";

export type ContextoProp ={
  usuario: UsuarioAutenticado | null;
  token: RespuestaToken | null;
  cargando: boolean
  iniciarSesion: (credenciales: Credenciales) => Promise<void>
  //tras crear la contraseña con un enlace, la API ya entrega el token: se entra sin pedir los datos otra vez
  entrarConToken: (token: RespuestaToken) => Promise<void>
  cerrarSesion: () => void
}

export const UsuarioContext = createContext<ContextoProp | null>(null);