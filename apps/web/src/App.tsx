import { Route, Routes } from 'react-router-dom'
import Inicio from './pages/Inicio'
import InicioSesion from './pages/InicioSesion'
import Postulacion from './pages/Postulacion'
import NoEncontrada from './pages/NoEncontrada'
import Vacantes from './pages/Vacantes'
import DemoLayout from './DemoLayout'
import { Actividad, Candidatos, CrearVacante, DetalleVacante, Resumen } from './RecruiterPages'
import { DemoProvider } from './demoData'
import './demo.css'

export default function App() {
  return <DemoProvider><Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<InicioSesion />} />
      <Route path="/postular/:vacantePublicaId" element={<Postulacion />} />
      <Route element={<DemoLayout />}>
        <Route path="/resumen" element={<Resumen />} />
        <Route path="/vacantes" element={<Vacantes />} />
        <Route path="/vacantes/nueva" element={<CrearVacante />} />
        <Route path="/vacantes/:id" element={<DetalleVacante />} />
        <Route path="/candidatos" element={<Candidatos />} />
        <Route path="/actividad" element={<Actividad />} />
      </Route>
      <Route path="*" element={<NoEncontrada />} />
    </Routes></DemoProvider>
}
