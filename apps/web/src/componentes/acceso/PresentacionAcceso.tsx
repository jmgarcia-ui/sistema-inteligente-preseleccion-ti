import IconoEtapaAcceso from "./IconoEtapaAcceso";

const etapas = [
  { clave: 'vacante', nombre: 'Vacante', descripcion: 'Define el perfil y centraliza las postulaciones.' },
  { clave: 'evidencias', nombre: 'Evidencias', descripcion: 'Evalúa con criterios objetivos y en un solo lugar.' },
  { clave: 'decision', nombre: 'Decisión', descripcion: 'Toma decisiones informadas y documentadas.' },
] as const

export default function PresentacionAcceso() {
  return (
    <div className="acceso__presentacion">
      <div className="acceso__mensaje">
        <p className="acceso__etiqueta">Personas / procesos / mejores decisiones</p>
        <h1 id="titulo-acceso">Un proceso claro<br />empieza aquí<span>.</span></h1>
        <p className="acceso__descripcion">Organiza la información. Conserva la decisión.</p>
      </div>
      <div className="acceso__recorrido">
        <div className="acceso__recorrido-cabecera">
          <span>Del perfil a la decisión</span>
          <span aria-hidden="true">01 — 03</span>
        </div>
        <ol className="acceso__etapas" aria-label="Etapas del proceso de selección">
          {etapas.map((etapa) => (
            <li className="acceso__etapa" key={etapa.clave}>
              <div className="acceso__icono-fondo"><IconoEtapaAcceso etapa={etapa.clave} /></div>
              <strong>{etapa.nombre}</strong>
              <p>{etapa.descripcion}</p>
            </li>
          ))}
        </ol>
        <p className="acceso__recorrido-pie"><span aria-hidden="true" />La decisión permanece en manos del equipo.</p>
      </div>
    </div>
  );
}
