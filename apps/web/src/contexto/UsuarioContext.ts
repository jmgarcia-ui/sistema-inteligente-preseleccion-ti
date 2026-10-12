import { createContext } from "react";
import type { Credenciales, RespuestaToken, UsuarioAutenticado } from "../tipos/sesion";

export type ContextoProp ={
  usuario: UsuarioAutenticado | null;
  token: RespuestaToken | null;
  iniciarSesion: (credenciales: Credenciales) => Promise<void>
}

export const UsuarioContext = createContext<ContextoProp | null>(null);