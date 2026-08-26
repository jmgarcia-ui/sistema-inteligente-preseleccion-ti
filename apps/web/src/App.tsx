import {Link, Route, Routes} from 'react-router-dom'
import Inicio from './pages/Inicio'
import NoEncontrada from './pages/NoEncontrada'
import Postulacion from './pages/Postulacion'
import Vacantes from './pages/Vacantes'

function App() {

  return (
    <>
      <header>
        <Link to="/">Preseleccion TI</Link>
        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/vacantes">Vacantes</Link>
          <Link to="/xdd">Postulacion</Link>

        </nav>
      </header>

      <main>
        <Routes>
          <Route path='/' element={<Inicio/>}/>
          <Route path='/vacantes' element={<Vacantes/>}/>
          <Route path='/postular/:vacantePublicaId' element={<Postulacion/>}/>
          <Route path='*' element={<NoEncontrada/>}/>
        </Routes>
      </main>
    </>
  )
}

export default App
