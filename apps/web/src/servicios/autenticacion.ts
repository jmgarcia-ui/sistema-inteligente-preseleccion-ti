import axios from "axios";
import type { Credenciales, RespuestaToken, UsuarioAutenticado } from "../tipos/sesion";

const urlApi = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function autenticar(credenciales: Credenciales) {
  const { data: respuestaToken } = await axios.post<RespuestaToken>(
    `${urlApi}/autenticacion/iniciar-sesion`,
    credenciales,
  );

  const { data: usuario } = await axios.get<UsuarioAutenticado>(
    `${urlApi}/autenticacion/yo`,
    { headers: { Authorization: `${respuestaToken.tipo_token} ${respuestaToken.token_acceso}` } },
  );

  return { token: respuestaToken, usuario };
}
