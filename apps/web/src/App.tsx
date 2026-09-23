import { Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Inicio from './pages/Inicio'
import NoEncontrada from './pages/NoEncontrada'
import Postulacion from './pages/Postulacion'
import Vacantes from './pages/Vacantes'
import Login from './pages/Login'
import PanelInicio from './pages/panel/PanelInicio'
import VacantesAdmin from './pages/panel/VacantesAdmin'
import NuevaVacante from './pages/panel/NuevaVacante'
import Candidatos from './pages/panel/Candidatos'
import CandidatoDetalle from './pages/panel/CandidatoDetalle'
import PostulacionesAdmin from './pages/panel/PostulacionesAdmin'
import Evaluaciones from './pages/panel/Evaluaciones'
import Competencias from './pages/panel/Competencias'
import ConfiguracionPanel from './pages/panel/ConfiguracionPanel'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/vacantes" element={<Vacantes />} />
        <Route path="/postular/:vacantePublicaId" element={<Postulacion />} />
      </Route>

      <Route path="/login" element={<Login />} />

      <Route path="/panel" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<PanelInicio />} />
        <Route path="vacantes" element={<VacantesAdmin />} />
        <Route path="vacantes/nueva" element={<NuevaVacante />} />
        <Route path="candidatos" element={<Candidatos />} />
        <Route path="candidatos/:id" element={<CandidatoDetalle />} />
        <Route path="postulaciones" element={<PostulacionesAdmin />} />
        <Route path="evaluaciones" element={<Evaluaciones />} />
        <Route path="competencias" element={<Competencias />} />
        <Route path="configuracion" element={<ConfiguracionPanel />} />
      </Route>

      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  )
}

export default App
