import axios from "axios";
import type { Credenciales, RespuestaToken, UsuarioAutenticado } from "../tipos/sesion";

const urlApi = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function autenticar(credenciales: Credenciales) {
  const { data: respuestaToken } = await axios.post<RespuestaToken>(
    `${urlApi}/autenticacion/iniciar-sesion`,
    credenciales,
  );

  const usuario = await obtenerUsuarioActual(respuestaToken)
  return { token: respuestaToken, usuario };
}

export async function obtenerUsuarioActual(token: RespuestaToken) {
  const { data: usuario } = await axios.get<UsuarioAutenticado>(`${urlApi}/autenticacion/yo`, {
    headers: { Authorization: `${token.tipo_token} ${token.token_acceso}` },
  });

  return usuario;
}
