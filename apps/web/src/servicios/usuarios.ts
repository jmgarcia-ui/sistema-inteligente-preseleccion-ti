import axios from "axios";
import type { RespuestaToken } from "../tipos/sesion";
import type { CambiosCuenta, CuentaEquipo, DatosInvitacion, InfoEnlace, ResultadoEnlace } from "../tipos/usuarios";

const urlApi = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const cabeceras = (token: RespuestaToken) => ({ Authorization: `${token.tipo_token} ${token.token_acceso}` });

export async function listarCuentas(token: RespuestaToken) {
  const { data } = await axios.get<CuentaEquipo[]>(`${urlApi}/admin/usuarios`, { headers: cabeceras(token) });
  return data;
}

export async function invitarCuenta(token: RespuestaToken, datos: DatosInvitacion) {
  const { data } = await axios.post<ResultadoEnlace>(`${urlApi}/admin/usuarios`, datos, { headers: cabeceras(token) });
  return data;
}

export async function actualizarCuenta(token: RespuestaToken, id: number, cambios: CambiosCuenta) {
  const { data } = await axios.patch<CuentaEquipo>(`${urlApi}/admin/usuarios/${id}`, cambios, { headers: cabeceras(token) });
  return data;
}

//reenvía la invitación o, si ya tiene contraseña, un enlace para restablecerla
export async function enviarEnlace(token: RespuestaToken, id: number) {
  const { data } = await axios.post<ResultadoEnlace>(`${urlApi}/admin/usuarios/${id}/enlace`, null, { headers: cabeceras(token) });
  return data;
}

//---- públicos: quien abre su enlace ----
export async function consultarEnlace(tokenEnlace: string) {
  const { data } = await axios.post<InfoEnlace>(`${urlApi}/cuentas/enlace`, { token: tokenEnlace });
  return data;
}

export async function crearContrasena(tokenEnlace: string, contrasena: string) {
  const { data } = await axios.post<RespuestaToken>(`${urlApi}/cuentas/contrasena`, { token: tokenEnlace, contrasena });
  return data;
}

//el mensaje de la API ("detail") si es un texto; si no, el que se indique
export function mensajeDeError(error: unknown, porDefecto: string) {
  const detalle = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
  return typeof detalle === "string" ? detalle : porDefecto;
}
