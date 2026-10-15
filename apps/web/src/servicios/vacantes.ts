import axios from "axios";
import type { VacantePublica } from "../tipos/vacantes";

const urlApi = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

//vacantes publicadas y vigentes; la API ya excluye borradores, cerradas y vencidas
export async function listarVacantesPublicas() {
  const { data } = await axios.get<VacantePublica[]>(`${urlApi}/vacantes`);
  return data;
}

//obtener vacante publica
export async function obtenerVacantePublica(id_vacante: number){
  const { data } = await axios.get<VacantePublica>(`${urlApi}/vacantes/${id_vacante}`)
  return data;
}
