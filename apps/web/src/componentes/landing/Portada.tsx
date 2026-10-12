import { Link } from "react-router-dom";
import VistaProducto from "./VistaProducto";

export default function Portada() {
  return (
    <section className="portada" id="producto" aria-labelledby="titulo-portada">
      <div className="portada__contenido">
        <p className="portada__etiqueta">Selección con contexto</p>

        <h1 className="portada__titulo" id="titulo-portada">
          Decisiones más claras, desde la primera vacante.
        </h1>

        <p className="portada__descripcion">
          Convierte los detalles de una vacante en una publicación clara, organiza sus postulaciones y muestra
          evidencia a cada requisito.
        </p>

        <div className="portada__acciones">
          <Link className="boton-portada boton-portada--primario" to="/iniciar-sesion">
            Iniciar sesión
          </Link>
          <a className="boton-portada boton-portada--secundario" href="#flujo">
            Ver cómo funciona
          </a>
        </div>
      </div>

      <VistaProducto />
    </section>
  );
}
