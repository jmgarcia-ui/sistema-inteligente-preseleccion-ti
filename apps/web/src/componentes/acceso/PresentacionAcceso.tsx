const ETAPAS = [
  { nombre: "Vacante", descripcion: "Define el perfil con requisitos claros y recibe las postulaciones en un solo lugar." },
  { nombre: "Evidencia", descripcion: "Revisa cada requisito junto a la evidencia del candidato y su origen." },
  { nombre: "Decisión", descripcion: "Decide tú: el sistema sugiere y registra, nunca aprueba ni descarta." },
];

export default function PresentacionAcceso() {
  return (
    <div className="acceso__presentacion">
      <h1 id="titulo-acceso">Tu espacio de selección</h1>
      <p className="acceso__descripcion">Publica vacantes, revisa postulaciones con su evidencia y deja registrada cada decisión.</p>
      <ol className="acceso__etapas" aria-label="Qué puedes hacer en tu espacio">
        {ETAPAS.map(({ nombre, descripcion }) => (
          <li className="acceso__etapa" key={nombre}>
            <strong>{nombre}</strong>
            <p>{descripcion}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
