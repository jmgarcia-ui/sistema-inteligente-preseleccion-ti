import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Brand, Icon } from './pages/Inicio'

const enlaces = [
  { to: '/resumen', texto: 'Resumen', icono: 'brand' },
  { to: '/vacantes', texto: 'Vacantes', icono: 'document' },
  { to: '/candidatos', texto: 'Candidatos', icono: 'people' },
  { to: '/actividad', texto: 'Actividad', icono: 'bars' },
]

export default function DemoLayout() {
  const navegar = useNavigate()
  const correo = window.sessionStorage.getItem('ri_correo')
  const nombre = correo?.split('@')[0].replace(/[._-]/g, ' ') || 'Equipo demo'

  function salir() {
    window.sessionStorage.removeItem('ri_access_token')
    window.sessionStorage.removeItem('ri_correo')
    navegar('/login')
  }

  return (
    <div className="demo-app">
      <header className="demo-nav">
        <Brand inverse />
        <nav className="demo-links" aria-label="Navegación del reclutador">
          {enlaces.map(enlace => <NavLink key={enlace.to} to={enlace.to} className={({ isActive }) => `demo-nav-link ${isActive ? 'active' : ''}`}><Icon name={enlace.icono} size={19} />{enlace.texto}</NavLink>)}
        </nav>
        <div className="demo-user">
          <span className="demo-user-avatar">{nombre.slice(0, 1).toUpperCase()}</span>
          <span className="demo-user-text"><b>{nombre}</b><small>{correo ? 'Sesión iniciada' : 'Modo de prueba'}</small></span>
          {correo ? <button type="button" className="demo-signout" onClick={salir} title="Cerrar sesión">Salir</button> : <Link className="demo-signout" to="/login">Acceder</Link>}
        </div>
      </header>
      <main className="demo-main"><Outlet /></main>
    </div>
  )
}
