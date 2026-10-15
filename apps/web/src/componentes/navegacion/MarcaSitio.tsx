import { Link } from "react-router-dom";

type Propiedades = {
  alPulsar?: () => void;
};

export default function MarcaSitio({ alPulsar }: Propiedades) {
  return (
    <Link className="marca-sitio" to="/" aria-label="Reclutamiento Inteligente, ir al inicio" onClick={alPulsar}>
      <span className="marca-sitio__signo" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </span>
      Reclutamiento Inteligente
    </Link>
  );
}
