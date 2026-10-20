import axios from "axios";
import type { EstadoVacante, ResumenPanel, VacanteCambios, VacanteDatos, VacanteDetalle, VacanteGestion } from "../tipos/panel";
import type { RespuestaToken } from "../tipos/sesion";

const urlApi = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

//ruta protegida: se envía el token igual que en obtenerUsuarioActual
export async function obtenerResumen(token: RespuestaToken) {
  const { data } = await axios.get<ResumenPanel>(`${urlApi}/panel/resumen`, {
    headers: { Authorization: `${token.tipo_token} ${token.token_acceso}` },
  });
  return data;
}

export async function listarMisVacantes(token: RespuestaToken){
  const { data } = await axios.get<VacanteGestion[]>(`${urlApi}/panel/vacantes`, {
    headers: {Authorization: `${token.tipo_token} ${token.token_acceso}`},
  });
  return data;
}

export async function cambiarEstadoVacante(token: RespuestaToken, idVacante: number, estado: EstadoVacante){
  const { data } = await axios.patch(`${urlApi}/vacantes/${idVacante}`, {estado}, {
    headers: {Authorization: `${token.tipo_token} ${token.token_acceso}`}
  });

  return data;
}
//una vacante completa, en cualquier estado, para el formulario de editar
export async function obtenerMiVacante(token: RespuestaToken, idVacante: number) {
  const { data } = await axios.get<VacanteDetalle>(`${urlApi}/panel/vacantes/${idVacante}`, {
    headers: { Authorization: `${token.tipo_token} ${token.token_acceso}` },
  });
  return data;
}

//la vacante nace como borrador
export async function crearVacante(token: RespuestaToken, datos: VacanteDatos) {
  const { data } = await axios.post<VacanteDetalle>(`${urlApi}/vacantes`, datos, {
    headers: { Authorization: `${token.tipo_token} ${token.token_acceso}` },
  });
  return data;
}

//solo se envían los campos que cambiaron; la API deja el resto igual
export async function actualizarVacante(token: RespuestaToken, idVacante: number, cambios: VacanteCambios) {
  const { data } = await axios.patch<VacanteDetalle>(`${urlApi}/vacantes/${idVacante}`, cambios, {
    headers: { Authorization: `${token.tipo_token} ${token.token_acceso}` },
  });
  return data;
}
