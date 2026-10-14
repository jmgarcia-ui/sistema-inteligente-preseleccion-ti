import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link2 } from "lucide-react";
import { prefiereMenosMovimiento, useEnPantalla } from "../../hooks/useEnPantalla";

const CICLO_MS = 6000;

const ETAPAS = [
  { clave: "publicar", nombre: "Publicar", detalle: "Requisitos claros, uno por uno", ruta: "Publicar · Desarrollador Backend" },
  { clave: "recibir", nombre: "Recibir", detalle: "Postulación sin cuenta", ruta: "Recibir · Desarrollador Backend" },
  { clave: "relacionar", nombre: "Relacionar", detalle: "Evidencia con su origen", ruta: "Relacionar · Desarrollador Backend" },
  { clave: "decidir", nombre: "Decidir", detalle: "Una persona aprueba", ruta: "Decidir · Laura Méndez" },
] as const;

export default function PanelEtapas() {
  const [activa, setActiva] = useState(2);
  const [automatico, setAutomatico] = useState(() => !prefiereMenosMovimiento());
  const [pausa, setPausa] = useState(false);
  const [pestanaOculta, setPestanaOculta] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const pestanas = useRef<(HTMLButtonElement | null)[]>([]);
  const enPantalla = useEnPantalla(panel);
  //solo avanza solo cuando el visitante lo ve y no lo esta usando
  const corre = automatico && enPantalla && !pausa && !pestanaOculta;

  useEffect(() => {
    const actualizar = () => setPestanaOculta(document.hidden);
    document.addEventListener("visibilitychange", actualizar);
    return () => document.removeEventListener("visibilitychange", actualizar);
  }, []);

  useEffect(() => {
    if (!corre) return;
    const temporizador = window.setTimeout(() => setActiva((actual) => (actual + 1) % ETAPAS.length), CICLO_MS);
    return () => window.clearTimeout(temporizador);
  }, [corre, activa]);

  function elegir(indice: number) {
    setAutomatico(false);
    setActiva(indice);
  }

  function moverConTeclado(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[evento.key];
    if (!paso) return;
    evento.preventDefault();
    const siguiente = (indice + paso + ETAPAS.length) % ETAPAS.length;
    elegir(siguiente);
    pestanas.current[siguiente]?.focus();
  }

  const etapa = ETAPAS[activa];

  return (
    <div
      className={`etapas ${automatico ? "etapas--automatico" : ""} ${corre ? "" : "etapas--detenido"}`}
      ref={panel}
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}>
      <div className="etapas__lista" role="tablist" aria-label="Etapas del proceso">
        {ETAPAS.map((item, indice) => (
          <button
            key={item.clave}
            ref={(boton) => {
              pestanas.current[indice] = boton;
            }}
            className={`etapa ${indice === activa ? "etapa--activa" : ""}`}
            role="tab"
            id={`pestana-${item.clave}`}
            aria-controls={`vista-${item.clave}`}
            aria-selected={indice === activa}
            tabIndex={indice === activa ? 0 : -1}
            onClick={() => elegir(indice)}
            onKeyDown={(evento) => moverConTeclado(evento, indice)}>
            <b>{item.nombre}</b>
            <span>{item.detalle}</span>
            {/* la clave reinicia la barra en cada cambio de etapa */}
            <span className="etapa__barra" aria-hidden="true">
              <i key={`${activa}-${corre}`} style={{ animationDuration: `${CICLO_MS}ms` }} />
            </span>
          </button>
        ))}
      </div>

      <div className="captura etapas__escenario">
        <div className="captura__barra">
          <span className="captura__ruta">{etapa.ruta}</span>
          <span className="etiqueta-ejemplo">Datos de ejemplo</span>
        </div>
        <div className="etapas__vista" role="tabpanel" id={`vista-${etapa.clave}`} aria-labelledby={`pestana-${etapa.clave}`} key={etapa.clave}>
          {etapa.clave === "publicar" && <VistaPublicar />}
          {etapa.clave === "recibir" && <VistaRecibir />}
          {etapa.clave === "relacionar" && <VistaRelacionar />}
          {etapa.clave === "decidir" && <VistaDecidir />}
        </div>
      </div>
    </div>
  );
}

function VistaPublicar() {
  const [publicada, setPublicada] = useState(() => prefiereMenosMovimiento());

  useEffect(() => {
    if (publicada) return;
    const temporizador = window.setTimeout(() => setPublicada(true), 1400);
    return () => window.clearTimeout(temporizador);
  }, [publicada]);

  return (
    <div className="vista-publicar">
      <div className="vista-publicar__cabecera">
        <div>
          <b>Desarrollador Backend</b>
          <span>Remoto · cierra el 24 oct.</span>
        </div>
        <span className="estado-publicacion" data-publicada={publicada}>
          <span aria-hidden={publicada}>Borrador</span>
          <span aria-hidden={!publicada}>Publicada</span>
        </span>
      </div>
      <ol className="vista-publicar__requisitos">
        <li><span className="vista-publicar__numero">1</span><b>Python y SQL</b><span>Obligatorio</span></li>
        <li><span className="vista-publicar__numero">2</span><b>APIs REST</b><span>Obligatorio</span></li>
        <li><span className="vista-publicar__numero">3</span><b>Docker</b><span className="vista-publicar__deseable">Deseable</span></li>
      </ol>
      <div className="vista-publicar__pie">
        <span>Los mismos tres requisitos se usarán para revisar la evidencia.</span>
        <span className="boton boton--primario boton--chico" aria-hidden="true">Publicar vacante</span>
      </div>
    </div>
  );
}

function VistaRecibir() {
  return (
    <>
      <table className="tabla-simple">
        <thead>
          <tr><th scope="col">Candidato</th><th scope="col">Enlaces</th><th scope="col">Postuló</th></tr>
        </thead>
        <tbody>
          <tr className="aparece"><td>Laura Méndez</td><td>LinkedIn · GitHub</td><td>2 oct.</td></tr>
          <tr className="aparece"><td>Carlos Rodríguez</td><td>LinkedIn · Portafolio</td><td>2 oct.</td></tr>
          <tr className="aparece"><td>Diego Sánchez</td><td>GitHub</td><td>1 oct.</td></tr>
        </tbody>
      </table>
      <p className="etapas__nota">Cada candidato postula una sola vez por vacante y acepta el tratamiento de sus datos.</p>
    </>
  );
}

const RELACIONES = [
  { requisito: "Python y SQL", tipo: "Obligatorio", evidencia: "API de inventario", detalle: "Python · SQL Server", origen: "GitHub", enlace: "github.com/laura-mendez · hace 3 meses" },
  { requisito: "APIs REST", tipo: "Obligatorio", evidencia: "Servicios de pagos", detalle: "Documentación REST", origen: "Portafolio", enlace: "laura.dev/proyectos" },
  { requisito: "Docker", tipo: "Deseable", evidencia: null, detalle: "Se consulta en la entrevista", origen: null, enlace: null },
];

function VistaRelacionar() {
  const [enfocado, setEnfocado] = useState<number | null>(null);
  //sin interaccion se muestra encendida la primera relacion
  const encendido = enfocado ?? 0;
  const clase = (indice: number) => `relacion ${indice === encendido ? "relacion--encendida" : enfocado !== null ? "relacion--atenuada" : ""}`;

  return (
    <>
      <div className="relaciones" onMouseLeave={() => setEnfocado(null)}>
        <div className="relaciones__columna">
          <h3>Requisitos de la vacante</h3>
          {RELACIONES.map((relacion, indice) => (
            <button
              key={relacion.requisito}
              type="button"
              className={clase(indice)}
              onMouseEnter={() => setEnfocado(indice)}
              onFocus={() => setEnfocado(indice)}
              onBlur={() => setEnfocado(null)}>
              <b>{relacion.requisito}</b>
              <span>{relacion.tipo}</span>
            </button>
          ))}
        </div>
        <div className="relaciones__columna">
          <h3>Evidencia del candidato</h3>
          {RELACIONES.map((relacion, indice) => (
            <div key={relacion.requisito} className={`${clase(indice)} ${relacion.evidencia ? "" : "relacion--vacia"}`}>
              <b>{relacion.evidencia ?? "Sin evidencia"}</b>
              <span>{relacion.detalle}</span>
            </div>
          ))}
        </div>
        <div className="relaciones__columna">
          <h3>Origen</h3>
          {RELACIONES.filter((relacion) => relacion.origen).map((relacion, indice) => (
            <div key={relacion.requisito} className={clase(indice)}>
              <b>{relacion.origen}</b>
              <span>{relacion.enlace}</span>
            </div>
          ))}
        </div>
      </div>
      {/* en celular cada requisito muestra su evidencia y su origen juntos */}
      <ul className="relaciones-movil">
        {RELACIONES.map((relacion) => (
          <li key={relacion.requisito}>
            <b>{relacion.requisito} <em>· {relacion.tipo}</em></b>
            <span>{relacion.evidencia ?? "Sin evidencia todavía"}</span>
            <small>{relacion.origen ? `${relacion.origen} · ${relacion.enlace}` : relacion.detalle}</small>
          </li>
        ))}
      </ul>
      <p className="etapas__nota">
        <Link2 size={16} strokeWidth={2.2} aria-hidden="true" />
        <span className="solo-cursor">Pasa el cursor por un requisito para ver su evidencia y de dónde salió.</span>
        <span className="solo-tactil">Cada requisito queda enlazado a su evidencia y al lugar de donde salió.</span>
      </p>
    </>
  );
}

function VistaDecidir() {
  return (
    <div className="vista-decidir">
      <b>2 de 3 requisitos con evidencia confirmada</b>
      <div className="vista-decidir__barras" aria-hidden="true">
        <i className="vista-decidir__lleno" />
        <i className="vista-decidir__lleno" />
        <i />
      </div>
      <span>Docker queda para la entrevista.</span>
      <div className="vista-decidir__acciones" aria-hidden="true">
        <span className="boton boton--secundario boton--chico">Descartar</span>
        <span className="boton boton--primario boton--chico">Preseleccionar</span>
      </div>
      <p className="etapas__nota">El sistema no puntúa ni descarta: la decisión la toma Ana Torres, reclutadora.</p>
    </div>
  );
}
