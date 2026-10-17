import axios from "axios";
import type { ResumenPanel } from "../tipos/panel";
import type { RespuestaToken } from "../tipos/sesion";

const urlApi = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

//ruta protegida: se envía el token igual que en obtenerUsuarioActual
export async function obtenerResumen(token: RespuestaToken) {
  const { data } = await axios.get<ResumenPanel>(`${urlApi}/panel/resumen`, {
    headers: { Authorization: `${token.tipo_token} ${token.token_acceso}` },
  });
  return data;
}
