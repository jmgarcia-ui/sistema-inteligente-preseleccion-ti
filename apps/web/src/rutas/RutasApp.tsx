import { Route, Routes } from "react-router-dom";
import Landing from "../pages/Landing";
import Vacantes from "../pages/Vacantes";
import Postulacion from "../pages/Postulacion";
import InicioSesion from "../pages/InicioSesion";
import ResumenReclutador from "../pages/ResumenReclutador";
import NoEncontrada from "../pages/NoEncontrada";
import RutaProtegida from "./RutaProtegida";
import VacantesReclutador from "../pages/VacantesReclutador";
import CandidatosReclutador from "../pages/CandidatosReclutador";
import ActividadReclutador from "../pages/ActividadReclutador";
import DisenoPanel from "../componentes/panel/DisenoPanel";
import EditorVacante from "../pages/EditorVacante";

export default function RutasApp() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/vacantes" element={<Vacantes />} />
      <Route path="/vacantes/:idVacante" element={<Postulacion />} />
      <Route path="/iniciar-sesion" element={<InicioSesion />} />
      <Route element={<RutaProtegida/>}>
        <Route element={<DisenoPanel />}>
          <Route path="/reclutador/resumen" element={<ResumenReclutador />} />
          <Route path="/reclutador/vacantes" element={<VacantesReclutador />} />
          <Route path="/reclutador/vacantes/nueva" element={<EditorVacante />} />
          <Route path="/reclutador/vacantes/:idVacante/editar" element={<EditorVacante />} />
          <Route path="/reclutador/candidatos" element={<CandidatosReclutador />} />
          <Route path="/reclutador/actividad" element={<ActividadReclutador />} />
        </Route>
      </Route>
      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  );
}
