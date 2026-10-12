const principios = [
  { titulo: "Trazabilidad", descripcion: "Cada evidencia conserva su origen." },
  { titulo: "Control humano", descripcion: "La aprobación pertenece al equipo." },
  { titulo: "Protección de datos", descripcion: "La información permanece dentro del proceso." },
  { titulo: "Registro", descripcion: "Las decisiones y comunicaciones quedan documentadas." },
];

export default function SeccionPrincipios() {
  return (
    <section className="seccion-principios" id="principios" aria-label="Principios del sistema">
      <div className="seccion-principios__contenido">
        {principios.map((principio) => (
          <div className="seccion-principios__item" key={principio.titulo}>
            <h2>{principio.titulo}</h2>
            <p>{principio.descripcion}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
