import type { Requisito } from "../tipos/vacantes";

const DIAS_CIERRE_PROXIMO = 14;

//la API envia "2026-10-24"; se arma como fecha local para no correr un dia por la zona horaria
function leerFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function describirCierre(fechaLimite: string) {
  const cierre = leerFecha(fechaLimite);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dias = Math.round((cierre.getTime() - hoy.getTime()) / 86_400_000);
  const fecha = cierre.toLocaleDateString("es", { day: "numeric", month: "short" });

  //la lista pública no muestra vencidas; el panel sí
  if (dias < 0) return { texto: `Cerró el ${fecha}`, proximo: false };
  if (dias === 0) return { texto: "Cierra hoy", proximo: true };
  if (dias === 1) return { texto: "Cierra mañana", proximo: true };
  if (dias <= DIAS_CIERRE_PROXIMO) return { texto: `Cierra en ${dias} días · ${fecha}`, proximo: true };
  return { texto: `Cierra el ${fecha}`, proximo: false };
}

//primero los obligatorios; los deseables solo completan si faltan
export function requisitosPrincipales(requisitos: Requisito[], cantidad: number) {
  const ordenados = [...requisitos].sort(
    (a, b) => Number(b.obligatorio) - Number(a.obligatorio) || a.orden - b.orden,
  );
  return { visibles: ordenados.slice(0, cantidad), restantes: Math.max(ordenados.length - cantidad, 0) };
}
