import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../style/landing.css";
import Portada from "../componentes/landing/Portada";
import PanelEtapas from "../componentes/landing/PanelEtapas";
import SeccionControl from "../componentes/landing/SeccionControl";
import VacantesDestacadas from "../componentes/landing/VacantesDestacadas";
import PieSitio from "../componentes/landing/PieSitio";

export default function Landing() {
  const { hash } = useLocation();

  //los enlaces "/#control" llegan desde otras páginas; React Router no desplaza solo
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="landing">
      <Portada />

      <section className="seccion seccion--alterna" id="como-funciona" aria-labelledby="titulo-como-funciona">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <h2 id="titulo-como-funciona">De la vacante a la decisión, en un solo lugar.</h2>
            <p>Cada etapa conserva el contexto de la anterior: los requisitos que se publican son los mismos con los que se revisa la evidencia.</p>
          </div>
          <PanelEtapas />
        </div>
      </section>

      <SeccionControl />
      <VacantesDestacadas />
      <PieSitio />
    </div>
  );
}
