import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiRequest, TOKEN_KEY } from '../lib/api'

export type UsuarioActual = {
  id: number
  nombres: string
  apellidos: string
  correo: string
  activo: boolean
}

type AuthContextValue = {
  usuario: UsuarioActual | null
  cargando: boolean
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>
  cerrarSesion: () => void
  recargarUsuario: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null)
  const [cargando, setCargando] = useState(true)

  async function recargarUsuario() {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setUsuario(null)
      setCargando(false)
      return
    }

    try {
      const actual = await apiRequest<UsuarioActual>('/autenticacion/yo', { auth: true })
      setUsuario(actual)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setUsuario(null)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void recargarUsuario()
  }, [])

  async function iniciarSesion(correo: string, contrasena: string) {
    const respuesta = await apiRequest<{ token_acceso: string; tipo_token: string }>('/autenticacion/iniciar-sesion', {
      method: 'POST',
      body: JSON.stringify({ correo, contrasena }),
    })
    localStorage.setItem(TOKEN_KEY, respuesta.token_acceso)
    setCargando(true)
    await recargarUsuario()
  }

  function cerrarSesion() {
    localStorage.removeItem(TOKEN_KEY)
    setUsuario(null)
  }

  const value = useMemo(() => ({ usuario, cargando, iniciarSesion, cerrarSesion, recargarUsuario }), [usuario, cargando])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return value
}
