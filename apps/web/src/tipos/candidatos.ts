//respuestas de /panel/candidatos (esquemas/candidatos.py en la API)
import type { EstadoPostulacion } from "./panel";

export type EstadoLectura = "pendiente" | "leyendo" | "leido" | "error";
export type EstadoAnalisis = "pendiente" | "analizando" | "listo" | "error";
export type Recomendacion = "pasa" | "no_pasa";
export type ResultadoEvidencia = "cumple" | "parcial" | "sin_evidencia";

//los estados que el equipo puede elegir (retirada la decide el candidato)
export type Decision = Exclude<EstadoPostulacion, "retirada">;

export type VacanteBreve = { id: number; titulo: string };

export type CandidatoFila = {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  vacante: VacanteBreve;
  estado: EstadoPostulacion;
  creado_en: string;
  tiene_cv: boolean;
  estado_lectura: EstadoLectura | null;
  estado_analisis: EstadoAnalisis | null;
  recomendacion: Recomendacion | null;
};

export type EvidenciaRequisito = {
  numero: number;
  requisito: string;
  obligatorio: boolean;
  resultado: ResultadoEvidencia;
  cita: string | null;
  pagina: number | null;
  explicacion: string;
};

export type Analisis = {
  estado: EstadoAnalisis;
  modelo: string | null;
  recomendacion: Recomendacion | null;
  motivo: string | null;
  evidencias: EvidenciaRequisito[];
  avisos: string[];
  correo_tipo: Recomendacion | null;
  correo_asunto: string | null;
  correo_cuerpo: string | null;
  error: string | null;
  actualizado_en: string;
};

//un correo enviado (o intentado) al candidato
export type EnvioCorreo = {
  tipo: Recomendacion;
  destinatario: string;
  asunto: string;
  estado: "enviando" | "enviado" | "error";
  error: string | null;
  enviado_por: string;
  creado_en: string;
  enviado_en: string | null;
};

export type FichaCandidato = {
  id: number;
  candidato: {
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    portafolio_url: string | null;
  };
  vacante: VacanteBreve;
  requisitos: { numero: number; descripcion: string; obligatorio: boolean }[];
  estado: EstadoPostulacion;
  creado_en: string;
  cv_nombre: string | null;
  cv_tamano: number | null;
  lectura: { estado: EstadoLectura; paginas_documento: number | null; paginas_leidas: number | null; error: string | null } | null;
  analisis: Analisis | null;
  decision_motivo: string | null;
  decidido_por: string | null;
  decidido_en: string | null;
  envios: EnvioCorreo[];
};
