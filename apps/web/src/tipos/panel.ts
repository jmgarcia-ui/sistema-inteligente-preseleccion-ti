//respuesta de GET /panel/resumen (esquemas/panel.py en la API)

export type EstadoVacante = "borrador" | "publicada" | "cerrada";

export type EstadoPostulacion = "recibida" | "en_revision" | "preseleccionada" | "descartada" | "retirada";

//una fila de la tabla de vacantes
export type VacanteResumen = {
  id: number;
  titulo: string;
  estado: EstadoVacante;
  fecha_limite: string;
  //{ recibida: 5, en_revision: 3 }; los estados sin postulaciones no vienen
  conteos: Partial<Record<EstadoPostulacion, number>>;
};

export type VacanteTitulo = {
  titulo: string;
};

export type CandidatoResumen = {
  nombres: string;
  apellidos: string;
  linkedin_url: string | null;
  github_url: string | null;
  portafolio_url: string | null;
};

//una persona de la cola de lectura
export type PostulacionRevisar = {
  id: number;
  //fecha en UTC, sin zona horaria: "2026-10-14T23:58:08.053"
  creado_en: string;
  vacante: VacanteTitulo;
  candidato: CandidatoResumen;
};

export type ResumenPanel = {
  vacantes: VacanteResumen[];
  por_revisar: PostulacionRevisar[];
};
