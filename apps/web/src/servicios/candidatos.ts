import axios from "axios";
import type { CandidatoFila, Decision, FichaCandidato, Recomendacion } from "../tipos/candidatos";
import type { RespuestaToken } from "../tipos/sesion";

const urlApi = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const cabeceras = (token: RespuestaToken) => ({ Authorization: `${token.tipo_token} ${token.token_acceso}` });

//la bandeja; con idVacante, solo las postulaciones de esa vacante
export async function listarCandidatos(token: RespuestaToken, idVacante?: number) {
  const { data } = await axios.get<CandidatoFila[]>(`${urlApi}/panel/candidatos`, {
    headers: cabeceras(token),
    params: idVacante ? { id_vacante: idVacante } : undefined,
  });
  return data;
}

export async function obtenerFicha(token: RespuestaToken, idPostulacion: number) {
  const { data } = await axios.get<FichaCandidato>(`${urlApi}/panel/candidatos/${idPostulacion}`, { headers: cabeceras(token) });
  return data;
}

//el PDF necesita el token, así que no se puede abrir con un enlace normal: se descarga y se muestra como archivo local
//la pestaña se abre ANTES de esperar la descarga; si se abriera después, el navegador la bloquearía como ventana emergente
export async function abrirCv(token: RespuestaToken, idPostulacion: number) {
  const pestana = window.open("", "_blank");
  try {
    const { data } = await axios.get<Blob>(`${urlApi}/panel/candidatos/${idPostulacion}/cv`, { headers: cabeceras(token), responseType: "blob" });
    const url = URL.createObjectURL(data);
    if (pestana) pestana.location.href = url;
    //se libera la memoria cuando la pestaña ya tuvo tiempo de cargarlo
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    pestana?.close();
    throw error;
  }
}

export async function decidir(token: RespuestaToken, idPostulacion: number, estado: Decision, motivo?: string) {
  const { data } = await axios.put<FichaCandidato>(`${urlApi}/panel/candidatos/${idPostulacion}/decision`, { estado, motivo }, { headers: cabeceras(token) });
  return data;
}

export async function guardarCorreo(token: RespuestaToken, idPostulacion: number, asunto: string, cuerpo: string) {
  const { data } = await axios.put<FichaCandidato>(`${urlApi}/panel/candidatos/${idPostulacion}/correo`, { asunto, cuerpo }, { headers: cabeceras(token) });
  return data;
}

//vuelven a leer o a analizar el CV si algo falló
export async function reintentarLectura(token: RespuestaToken, idPostulacion: number) {
  await axios.post(`${urlApi}/panel/postulaciones/${idPostulacion}/lectura-cv`, null, { headers: cabeceras(token) });
}

export async function reintentarAnalisis(token: RespuestaToken, idPostulacion: number) {
  await axios.post(`${urlApi}/panel/postulaciones/${idPostulacion}/analisis`, null, { headers: cabeceras(token) });
}

//la IA redacta un borrador nuevo del tipo indicado (felicitación o feedback)
export async function redactarCorreo(token: RespuestaToken, idPostulacion: number, tipo: Recomendacion) {
  const { data } = await axios.post<FichaCandidato>(`${urlApi}/panel/candidatos/${idPostulacion}/correo/redactar`, { tipo }, { headers: cabeceras(token) });
  return data;
}

//envía el borrador al candidato; "reenviar" confirma un segundo envío del mismo tipo
export async function enviarCorreo(token: RespuestaToken, idPostulacion: number, reenviar = false) {
  const { data } = await axios.post<FichaCandidato>(`${urlApi}/panel/candidatos/${idPostulacion}/correo/enviar`, { reenviar }, { headers: cabeceras(token) });
  return data;
}
