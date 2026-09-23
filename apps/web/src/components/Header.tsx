import { NavLink } from 'react-router-dom'
import Logo from './Logo'

export default function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className="main-nav" aria-label="Navegación principal">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/vacantes">Vacantes</NavLink>
          <a href="/#como-funciona">¿Cómo funciona?</a>
        </nav>
        <NavLink className="header-cta" to="/login">Acceso reclutador</NavLink>
      </div>
    </header>
  )
}
