import { Route, Routes } from "react-router-dom";
import LandingAtlas from "../pages/LandingAtlas";
import Vacantes from "../pages/Vacantes";
import Postulacion from "../pages/Postulacion";
import InicioSesion from "../pages/InicioSesion";
import ResumenReclutador from "../pages/ResumenReclutador";
import NoEncontrada from "../pages/NoEncontrada";

export default function RutasApp() {
  return (
    <Routes>
      <Route path="/" element={<LandingAtlas />} />
      <Route path="/vacantes" element={<Vacantes />} />
      <Route path="/postular/:vacantePublicaId" element={<Postulacion />} />
      <Route path="/iniciar-sesion" element={<InicioSesion />} />
      <Route path="/reclutador/resumen" element={<ResumenReclutador />} />
      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  );
}
