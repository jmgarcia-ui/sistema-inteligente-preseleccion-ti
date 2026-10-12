import { Link } from "react-router-dom";
import BotonTema from "./BotonTema";

type Propiedades = {
  menuAbierto: boolean;
  temaOscuro: boolean;
  cerrarMenu: () => void;
  alternarMenu: () => void;
  alternarTema: () => void;
};

export default function EncabezadoSitio({ menuAbierto, temaOscuro, cerrarMenu, alternarMenu, alternarTema }: Propiedades) {
  return (
    <header className="encabezado-sitio">
      <div className="encabezado-sitio__contenido">
        <Link className="marca-sitio" to="/" aria-label="Ir a la pagina de inicio" onClick={cerrarMenu}>
          <span>Reclutamiento</span>
          <strong>Inteligente</strong>
        </Link>
        <nav
          id="navegacion-principal"
          className={`navegacion-principal ${menuAbierto ? "navegacion-principal--abierta" : ""}`}
          aria-label="Navegación principal">
          <Link to="/#producto" onClick={cerrarMenu}>
            Producto
          </Link>
          <Link to="/#flujo" onClick={cerrarMenu}>
            Flujo
          </Link>
          <Link to="/#recursos" onClick={cerrarMenu}>
            Evidencias
          </Link>
          <Link to="/#principios" onClick={cerrarMenu}>
            Principios
          </Link>
          <Link to="/#contacto" onClick={cerrarMenu}>
            Contacto
          </Link>
        </nav>
        <button
          className="boton-menu"
          type="button"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          aria-controls="navegacion-principal"
          onClick={alternarMenu}>
          <span />
          <span />
          <span />
        </button>

        <div className="encabezado-sitio__acciones">
          <BotonTema temaOscuro={temaOscuro} alCambiar={alternarTema} />
          <Link className="accion-encabezado" to="/iniciar-sesion" onClick={cerrarMenu}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
