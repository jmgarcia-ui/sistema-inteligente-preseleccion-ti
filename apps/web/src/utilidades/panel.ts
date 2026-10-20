import type { CandidatoResumen, EstadoPostulacion, VacanteResumen } from "../tipos/panel";

//desde los 2 días de espera se marca en ámbar
export const DIAS_ESPERA_LARGA = 2;

//la API guarda la hora en UTC sin zona ("2026-10-14T23:58:08"); la "Z" evita leerla como hora local
function leerFechaUtc(fecha: string) {
  return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(fecha) ? fecha : `${fecha}Z`);
}

//cuánto lleva esperando una postulación: { cantidad: 4, unidad: "días", dias: 4 }
export function describirEspera(creadoEn: string, ahora = new Date()) {
  const minutos = Math.max(Math.floor((ahora.getTime() - leerFechaUtc(creadoEn).getTime()) / 60_000), 0);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias >= 1) return { cantidad: dias, unidad: dias === 1 ? "día" : "días", dias };
  if (horas >= 1) return { cantidad: horas, unidad: horas === 1 ? "hora" : "horas", dias };
  return { cantidad: minutos, unidad: "min", dias };
}

//solo los enlaces que el candidato dejó: "GitHub · LinkedIn"
export function describirFuentes(candidato: CandidatoResumen) {
  const fuentes = [
    candidato.github_url && "GitHub",
    candidato.linkedin_url && "LinkedIn",
    candidato.portafolio_url && "Portafolio",
  ].filter(Boolean);
  return fuentes.join(" · ");
}

//todas las postulaciones de una vacante, en cualquier estado
export function totalDeVacante(vacante: VacanteResumen) {
  return Object.values(vacante.conteos).reduce((total, cantidad) => total + (cantidad ?? 0), 0);
}

//"1 postulación", "12 postulaciones"
export function textoPostulaciones(cantidad: number) {
  return `${cantidad} ${cantidad === 1 ? "postulación" : "postulaciones"}`;
}

//los estados que se dibujan, en el orden del proceso; "color" es la variable CSS del segmento (panel.css)
export const SEGMENTOS: { clave: EstadoPostulacion; nombre: string; color: string }[] = [
  { clave: "recibida", nombre: "Recibidas", color: "var(--seg-recibida)" },
  { clave: "en_revision", nombre: "En revisión", color: "var(--seg-revision)" },
  { clave: "preseleccionada", nombre: "Preseleccionadas", color: "var(--seg-presel)" },
  { clave: "descartada", nombre: "Descartadas", color: "var(--seg-descartada)" },
];

//"2 oct": el día en que se creó algo, en la hora local de quien mira
export function fechaDeCreacion(creadoEn: string) {
  return leerFechaUtc(creadoEn).toLocaleDateString("es", { day: "numeric", month: "short" });
}

//cómo se nombra cada estado de una postulación en el panel
export const NOMBRES_ESTADO_POSTULACION: Record<EstadoPostulacion, string> = {
  recibida: "Sin revisar",
  en_revision: "En revisión",
  preseleccionada: "Preseleccionada",
  descartada: "Descartada",
  retirada: "Retirada",
};
