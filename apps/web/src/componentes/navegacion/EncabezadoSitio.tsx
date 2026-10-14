import { Link, NavLink } from "react-router-dom";
import BotonTema from "./BotonTema";
import MarcaSitio from "./MarcaSitio";

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
      <div className="envoltura encabezado-sitio__fila">
        <MarcaSitio alPulsar={cerrarMenu} />

        <nav
          id="navegacion-principal"
          className={`navegacion-principal ${menuAbierto ? "navegacion-principal--abierta" : ""}`}
          aria-label="Navegación principal">
          <NavLink to="/vacantes" onClick={cerrarMenu}>
            Vacantes
          </NavLink>
          <Link to="/#como-funciona" onClick={cerrarMenu}>
            Cómo funciona
          </Link>
          <Link to="/#control" onClick={cerrarMenu}>
            Control humano
          </Link>
        </nav>

        <div className="encabezado-sitio__acciones">
          <BotonTema temaOscuro={temaOscuro} alCambiar={alternarTema} />
          <Link className="boton boton--secundario boton--chico" to="/iniciar-sesion" onClick={cerrarMenu}>
            Iniciar sesión
          </Link>
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
        </div>
      </div>
    </header>
  );
}
