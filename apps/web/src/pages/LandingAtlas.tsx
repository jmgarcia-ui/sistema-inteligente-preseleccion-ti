import "../landing-atlas.css";
import "../secciones-landing.css";
import { useAnimacionesLanding } from "../hooks/useAnimacionesLanding";
import Portada from "../componentes/landing/Portada";
import FranjaProceso from "../componentes/landing/FranjaProceso";
import SeccionPublicacion from "../componentes/landing/SeccionPublicacion";
import SeccionesLanding from "../componentes/landing/SeccionesLanding";

export default function LandingAtlas() {
  useAnimacionesLanding();

  return (
    <div className="atlas-landing">
      <Portada />
      <FranjaProceso />
      <SeccionPublicacion />
      <SeccionesLanding />
    </div>
  );
}
