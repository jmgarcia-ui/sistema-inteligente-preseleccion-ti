import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { VacantePublica } from "../../tipos/vacantes";
import { describirCierre, requisitosPrincipales } from "../../utilidades/vacantes";

const REQUISITOS_VISIBLES = 3;
//un requisito más largo que esto es una frase, no una etiqueta
const LARGO_ETIQUETA = 40;

type Propiedades = {
  vacante: VacantePublica;
};

export default function TarjetaVacante({ vacante }: Propiedades) {
  const { visibles, restantes } = requisitosPrincipales(vacante.requisitos, REQUISITOS_VISIBLES);
  const cierre = describirCierre(vacante.fecha_limite);
  const idTitulo = `vacante-${vacante.id}-titulo`;
  const idDetalle = `vacante-${vacante.id}-detalle`;

  return (
    <li className="tarjeta-vacante">
      {/* el lector de pantalla anuncia solo el puesto y el cierre, no toda la tarjeta */}
      <Link
        className="tarjeta-vacante__enlace"
        to={`/vacantes/${vacante.id}`}
        aria-labelledby={idTitulo}
        aria-describedby={idDetalle}>
        <h3 className="tarjeta-vacante__titulo" id={idTitulo}>{vacante.titulo}</h3>
        {/* la modalidad ya la dice el grupo; aqui solo va la ubicacion */}
        {vacante.ubicacion && <p className="tarjeta-vacante__lugar">{vacante.ubicacion}</p>}

        <ul className="tarjeta-vacante__requisitos" aria-label="Requisitos principales">
          {visibles.map((requisito) => (
            <li key={requisito.id} className={requisito.descripcion.length > LARGO_ETIQUETA ? "requisito-largo" : undefined}>
              {requisito.descripcion}
            </li>
          ))}
          {restantes > 0 && <li className="tarjeta-vacante__mas">+{restantes} más</li>}
        </ul>

        <div className="tarjeta-vacante__pie">
          <span
            className={`tarjeta-vacante__cierre ${cierre.proximo ? "tarjeta-vacante__cierre--proximo" : ""}`}
            id={idDetalle}>
            {cierre.texto}
          </span>
          <span className="tarjeta-vacante__accion">
            Ver y postular
            <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </li>
  );
}
