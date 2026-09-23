import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth()
  const location = useLocation()

  if (cargando) return <div className="route-loading"><div className="spinner"/><span>Validando sesión...</span></div>
  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
