import type { CandidatoResumen } from "../tipos/panel";

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
