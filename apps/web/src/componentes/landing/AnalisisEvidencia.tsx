import { useEffect, useState } from "react";
import { prefiereMenosMovimiento } from "../../hooks/useEnPantalla";

type EstadoEvidencia = "analiza" | "sugerida" | "confirmada" | "pendiente";

const NOMBRES: Record<EstadoEvidencia, string> = {
  analiza: "Analizando",
  sugerida: "Sugerida",
  confirmada: "Confirmada",
  pendiente: "Pendiente",
};

//datos de ejemplo: la secuencia muestra que la IA sugiere y una persona confirma
const FILAS = [
  { requisito: "Python y SQL", evidencia: "API de inventario en Python con SQL Server", fuente: "github.com/laura-mendez · hace 3 meses", pasos: ["sugerida", "confirmada"] },
  { requisito: "APIs REST", evidencia: "Documentación de servicios de pagos", fuente: "Portafolio · laura.dev/proyectos", pasos: ["sugerida"] },
  { requisito: "Docker", evidencia: "Sin evidencia todavía", fuente: "Se puede consultar en la entrevista", pasos: ["pendiente"] },
] satisfies { requisito: string; evidencia: string; fuente: string; pasos: EstadoEvidencia[] }[];

const INICIO_MS = 1100;
const ENTRE_FILAS_MS = 520;
const CONFIRMACION_MS = 1500;

function estadosFinales() {
  return FILAS.map((fila) => fila.pasos[fila.pasos.length - 1]);
}

export default function AnalisisEvidencia() {
  const [estados, setEstados] = useState<EstadoEvidencia[]>(() =>
    prefiereMenosMovimiento() ? estadosFinales() : FILAS.map(() => "analiza"),
  );

  useEffect(() => {
    if (prefiereMenosMovimiento()) return;
    const cambiar = (indice: number, estado: EstadoEvidencia) =>
      setEstados((actuales) => actuales.map((actual, i) => (i === indice ? estado : actual)));
    const temporizadores = FILAS.flatMap((fila, indice) =>
      fila.pasos.map((paso, n) =>
        window.setTimeout(() => cambiar(indice, paso), INICIO_MS + indice * ENTRE_FILAS_MS + n * CONFIRMACION_MS),
      ),
    );
    return () => temporizadores.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <figure className="captura analisis" aria-label="Vista de evidencia de una candidata de ejemplo">
      <div className="captura__barra">
        <span className="captura__ruta">Desarrollador Backend · Postulaciones</span>
        <span className="etiqueta-ejemplo">Datos de ejemplo</span>
      </div>
      <div className="analisis__persona">
        <span className="analisis__avatar" aria-hidden="true">LM</span>
        <div>
          <b>Laura Méndez</b>
          <span>Postuló el 2 oct. · LinkedIn y GitHub</span>
        </div>
        <span className="analisis__estado">En revisión</span>
      </div>
      <table className="analisis__tabla">
        <thead>
          <tr>
            <th scope="col">Requisito</th>
            <th scope="col">Evidencia encontrada</th>
            <th scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          {FILAS.map((fila, indice) => {
            const estado = estados[indice];
            return (
              <tr key={fila.requisito} className={estado === "analiza" ? "" : "analisis__fila--resuelta"}>
                <td>{fila.requisito}</td>
                <td>
                  <span className="analisis__hallazgo">
                    {fila.evidencia}
                    <span className="analisis__fuente">{fila.fuente}</span>
                  </span>
                </td>
                <td>
                  <span className="chip-evidencia" data-estado={estado}>
                    {(Object.keys(NOMBRES) as EstadoEvidencia[]).map((clave) => (
                      <span key={clave} aria-hidden={clave !== estado}>{NOMBRES[clave]}</span>
                    ))}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="captura__pie">
        <span>La IA sugiere; el equipo confirma cada evidencia.</span>
        <span className="boton boton--primario boton--chico" aria-hidden="true">Revisar</span>
      </div>
    </figure>
  );
}
