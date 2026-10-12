import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import BotonTema from "./BotonTema";

type Propiedades = { temaOscuro: boolean; alternarTema: () => void };

export default function EncabezadoAcceso({ temaOscuro, alternarTema }: Propiedades) {
  return (
    <header className="encabezado-acceso">
      <div className="encabezado-acceso__contenido">
        <Link className="marca-sitio" to="/" aria-label="Ir a la página de inicio">
          <span>Reclutamiento</span>
          <strong>Inteligente</strong>
        </Link>
        <div className="encabezado-acceso__acciones">
          <BotonTema temaOscuro={temaOscuro} alCambiar={alternarTema} />
          <Link className="encabezado-acceso__regreso" to="/">
            Volver al inicio
            <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
