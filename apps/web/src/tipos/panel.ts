//respuesta de GET /panel/resumen (esquemas/panel.py en la API)

import type { Modalidad, Requisito } from "./vacantes";

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

//una acción del registro: qué pasó, quién ("Sistema" si fue automático) y cuándo
export type Accion = {
  id: number;
  tipo: string;
  descripcion: string;
  detalle: string | null;
  autor: string;
  id_vacante: number;
  id_postulacion: number | null;
  creado_en: string;
};

export type ResumenPanel = {
  vacantes: VacanteResumen[];
  por_revisar: PostulacionRevisar[];
  actividad: Accion[];
};

export type VacanteGestion = VacanteResumen & {
  modalidad: Modalidad;
  ubicacion: string | null;
  creado_en: string;
}
//vacante completa para editarla (VacanteRespuesta en la API): GET /panel/vacantes/{id}
export type VacanteDetalle = {
  id: number;
  id_creador: number;
  titulo: string;
  descripcion: string;
  requisitos: Requisito[];
  modalidad: Modalidad;
  ubicacion: string | null;
  estado: EstadoVacante;
  fecha_limite: string;
  creado_en: string;
  actualizado_en: string;
};

//lo que se envía al crear (POST /vacantes); el orden de los requisitos lo pone la API según su posición
export type VacanteDatos = {
  titulo: string;
  descripcion: string;
  requisitos: { descripcion: string; obligatorio: boolean }[];
  modalidad: Modalidad;
  ubicacion: string | null;
  fecha_limite: string;
};

//al editar (PATCH /vacantes/{id}) solo se envía lo que cambió, y también el estado
export type VacanteCambios = Partial<VacanteDatos> & { estado?: EstadoVacante };
