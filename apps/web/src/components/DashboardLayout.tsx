import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import { BriefcaseIcon, ChartIcon, GearIcon, HomeIcon, LogoutIcon, PeopleIcon, SparklesIcon, TargetIcon } from './Icons'

const items = [
  { to: '/panel', label: 'Resumen', icon: HomeIcon, end: true },
  { to: '/panel/vacantes', label: 'Vacantes', icon: BriefcaseIcon },
  { to: '/panel/candidatos', label: 'Candidatos', icon: PeopleIcon },
  { to: '/panel/postulaciones', label: 'Postulaciones', icon: TargetIcon },
  { to: '/panel/evaluaciones', label: 'Evaluaciones', icon: ChartIcon },
  { to: '/panel/competencias', label: 'Competencias', icon: SparklesIcon },
  { to: '/panel/configuracion', label: 'Configuración', icon: GearIcon },
]

export default function DashboardLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  function salir() {
    cerrarSesion()
    navigate('/login')
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand"><Logo /></div>
        <nav className="dashboard-nav" aria-label="Panel del reclutador">
          <span className="nav-caption">Gestión</span>
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}>
              <Icon size={19} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{usuario?.nombres?.[0]}{usuario?.apellidos?.[0]}</div>
          <div><strong>{usuario?.nombres} {usuario?.apellidos}</strong><span>Reclutador</span></div>
          <button type="button" onClick={salir} title="Cerrar sesión"><LogoutIcon size={18}/></button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span>SmartRecruit TI</span>
            <strong>Panel de preselección inteligente</strong>
          </div>
          <div className="topbar-actions">
            <a href="/" target="_blank" rel="noreferrer">Ver portal público</a>
            <div className="online-dot" title="Sesión activa"/>
          </div>
        </header>
        <main className="dashboard-content"><Outlet /></main>
      </div>
    </div>
  )
}
