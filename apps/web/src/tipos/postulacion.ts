
export type CandidatoPostulacion = {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portafolio_url: string | null;
}



export type PostulacionCrear = {
  id_vacante: number;
  candidato: CandidatoPostulacion;
  acepta_tratamiento_datos: boolean;
}