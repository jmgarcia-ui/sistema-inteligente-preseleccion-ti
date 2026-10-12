export default function SeccionPublicacion() {
  return (
    <section className="seccion-publicacion" id="publicacion" aria-labelledby="titulo-publicacion">
      <div className="seccion-publicacion__mensaje">
        <span className="seccion-publicacion__numero" aria-hidden="true">01</span>
        <div>
          <h2 id="titulo-publicacion">De la definición a una publicación lista para compartir.</h2>
          <p>Convierte los detalles de una vacante en una publicación clara y organizada.</p>
        </div>
      </div>

      <div className="seccion-publicacion__comparacion">
        <article className="seccion-publicacion__antes">
          <h3>Antes</h3>
          <p>Detalles sin estructura</p>
          <div>
            Desarrollador Backend. Necesitamos alguien para APIs.
            Trabajo remoto.
            Nivel semi senior. Experiencia en bases de datos y arquitectura.
          </div>
        </article>

        <span className="seccion-publicacion__flecha" aria-hidden="true"/>

        <article className="seccion-publicacion__despues">
          <h3>Después</h3>
          <p>Publicación lista</p>
          <strong>Desarrollador Backend</strong>
          <div className="seccion-publicacion__datos">
            <span>Semi Senior</span>
            <span>Remoto</span>
          </div>

          <p>Desarrollar y mantener servicios backend escalables, colaborando con el equipo de producto.</p>
          <ul>
            <li>APIs</li>
            <li>Bases de datos</li>
            <li>Arquitectura</li>
          </ul>
        </article>
      </div>

    </section>
  );
}
