import { useRef } from "react";
import { useEnPantalla } from "../../hooks/useEnPantalla";

const REGISTRO = [
  { titulo: "Postulación recibida", detalle: "2 oct. · desde LinkedIn" },
  { titulo: "Evidencia sugerida por el análisis", detalle: "3 oct. · 2 de 3 requisitos con evidencia" },
  { titulo: "Evidencia confirmada por Ana Torres", detalle: "4 oct. · reclutadora" },
  { titulo: "Preseleccionada por Ana Torres", detalle: "4 oct. · correo enviado a la candidata", hito: true },
];

const PRINCIPIOS = [
  { titulo: "Trazabilidad", descripcion: "Cada evidencia conserva su origen." },
  { titulo: "Control humano", descripcion: "La aprobación pertenece al equipo." },
  { titulo: "Protección de datos", descripcion: "La información permanece dentro del proceso." },
  { titulo: "Registro", descripcion: "Las decisiones y comunicaciones quedan documentadas." },
];

export default function SeccionControl() {
  const registro = useRef<HTMLOListElement>(null);
  //el registro se escribe una sola vez, cuando aparece en pantalla
  const visto = useEnPantalla(registro, 0.4, true);

  return (
    <section className="banda" id="control" aria-labelledby="titulo-control">
      <div className="envoltura">
        <div className="seccion__cabeza">
          <h2 id="titulo-control">La decisión es siempre de una persona.</h2>
          <p>El sistema organiza la evidencia; el equipo decide, revisa el mensaje antes de enviarlo y cada paso queda registrado.</p>
          <span className="etiqueta-ejemplo">Correo y registro: datos de ejemplo</span>
        </div>

        <div className="banda__rejilla">
          <div className="correo" aria-label="Correo de preselección de ejemplo">
            <div className="correo__cabecera">Preseleccionar a Laura Méndez</div>
            <div className="correo__campo"><span>Para</span><b>laura.mendez@ejemplo.com</b></div>
            <div className="correo__campo"><span>Asunto</span><b>Avanzas en el proceso · Desarrollador Backend</b></div>
            <p className="correo__cuerpo">
              Hola, Laura:<br />
              Revisamos tu postulación y queremos contarte que avanzas a la siguiente etapa. Te escribiremos pronto para
              coordinar una entrevista.
            </p>
            <div className="correo__acciones" aria-hidden="true">
              <span className="boton boton--secundario boton--chico">Cancelar</span>
              <span className="boton boton--primario boton--chico">Preseleccionar y enviar</span>
            </div>
          </div>

          <ol className={`registro ${visto ? "registro--visto" : ""}`} ref={registro} aria-label="Registro de la postulación de ejemplo">
            {REGISTRO.map((paso) => (
              <li key={paso.titulo} className={paso.hito ? "registro__hito" : undefined}>
                <b>{paso.titulo}</b>
                <span>{paso.detalle}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="principios">
          {PRINCIPIOS.map((principio) => (
            <div key={principio.titulo}>
              <h3>{principio.titulo}</h3>
              <p>{principio.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
