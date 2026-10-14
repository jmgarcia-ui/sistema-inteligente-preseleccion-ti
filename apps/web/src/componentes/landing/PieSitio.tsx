import { Link } from "react-router-dom";

export default function PieSitio() {
  return (
    <footer className="pie-sitio">
      <div className="envoltura pie-sitio__fila">
        <span>Reclutamiento Inteligente</span>
        <nav aria-label="Pie de página">
          <Link to="/vacantes">Vacantes</Link>
          <Link to="/#como-funciona">Cómo funciona</Link>
          <Link to="/#control">Control humano</Link>
          <Link to="/iniciar-sesion">Iniciar sesión</Link>
        </nav>
      </div>
    </footer>
  );
}
