import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import BotonTema from "./BotonTema";
import MarcaSitio from "./MarcaSitio";

type Propiedades = { temaOscuro: boolean; alternarTema: () => void };

export default function EncabezadoAcceso({ temaOscuro, alternarTema }: Propiedades) {
  return (
    <header className="encabezado-sitio encabezado-sitio--acceso">
      <div className="envoltura encabezado-sitio__fila">
        <MarcaSitio />
        <div className="encabezado-sitio__acciones">
          <BotonTema temaOscuro={temaOscuro} alCambiar={alternarTema} />
          <Link className="encabezado-sitio__regreso" to="/">
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </header>
  );
}
