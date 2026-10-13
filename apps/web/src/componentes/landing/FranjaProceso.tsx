const etapasProceso = [
  {
    nombre: "Vacante",
    descripcion: "Define el perfil",
  },
  {
    nombre: "Publicación",
    descripcion: "Organiza el contenido",
  },
  {
    nombre: "Postulación",
    descripcion: "Recibe candidatos.",
  },
  {
    nombre: "Evidencias",
    descripcion: "Relaciona información.",
  },
  {
    nombre: "Decisión",
    descripcion: "Tu equipo aprueba.",
  },
];

export default function FranjaProceso() {
  return (
    <section className="franja-proceso" id="flujo" aria-labelledby="titulo-franja-proceso">
      <h2 className="franja-proceso__titulo-accesible" id="titulo-franja-proceso">
        Etapas del proceso de selección
      </h2>
      <ol className="franja-proceso__lista">
        {etapasProceso.map((etapa) => (
          <li className="franja-proceso__etapa" key={etapa.nombre}>
            <span className="franja-proceso__punto" aria-hidden="true" />
            <h3>{etapa.nombre}</h3>
            <p>{etapa.descripcion}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
