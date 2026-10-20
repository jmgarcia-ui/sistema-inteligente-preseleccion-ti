import axios from "axios";
import { type PostulacionCrear } from "../tipos/postulacion";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

//se envía como formulario con archivo: "datos" lleva el JSON de la postulación y "cv" el PDF
export default async function crearPostulacion(postulacion_data: PostulacionCrear, cv: File) {
  const formulario = new FormData();
  formulario.append("datos", JSON.stringify(postulacion_data));
  formulario.append("cv", cv);
  const { data } = await axios.post(`${apiUrl}/postulaciones`, formulario);
  return data;
}
