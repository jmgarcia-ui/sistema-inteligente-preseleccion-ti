export type Modalidad = "remoto" | "hibrido" | "presencial";

export const NOMBRES_MODALIDAD: Record<Modalidad, string> = {
  remoto: "Remoto",
  hibrido: "Híbrido",
  presencial: "Presencial",
};

export type Requisito = {
  id: number;
  descripcion: string;
  obligatorio: boolean;
  orden: number;
};

//respuesta de GET /vacantes (VacantePublicaRespuesta en la API)
export type VacantePublica = {
  id: number;
  titulo: string;
  descripcion: string;
  requisitos: Requisito[];
  modalidad: Modalidad;
  ubicacion: string | null;
  fecha_limite: string;
  creado_en: string;
};
