import axios from "axios";
import { type PostulacionCrear } from "../tipos/postulacion";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";




export default async function crearPostulacion(postulacion_data: PostulacionCrear){
  const { data } = await axios.post(`${apiUrl}/postulaciones`, postulacion_data)
  return data;
}