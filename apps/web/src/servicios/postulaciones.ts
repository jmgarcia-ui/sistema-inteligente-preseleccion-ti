import axios from "axios";
import { type PostulacionCrear } from "../tipos/postulacion";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

//se envía como formulario con archivo: "datos" lleva el JSON de la postulación y "cv" el PDF
//"sitioWeb" es el campo trampa: una persona lo deja vacío; si llega lleno, la API lo rechaza
export default async function crearPostulacion(postulacion_data: PostulacionCrear, cv: File, sitioWeb = "") {
  const formulario = new FormData();
  formulario.append("sitio_web", sitioWeb);
  formulario.append("datos", JSON.stringify(postulacion_data));
  formulario.append("cv", cv);
  const { data } = await axios.post(`${apiUrl}/postulaciones`, formulario);
  return data;
}
