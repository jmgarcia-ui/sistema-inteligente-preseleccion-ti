import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { ArrowIcon, LockIcon, MailIcon, SparklesIcon } from '../components/Icons'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { iniciarSesion, usuario } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { from?: string } | null)?.from || '/panel'

  useEffect(() => {
    if (usuario) navigate(destino, { replace: true })
  }, [usuario, navigate, destino])

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await iniciarSesion(correo, contrasena)
      navigate(destino, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand"><Logo /></div>
      <section className="login-visual">
        <div className="login-visual-content">
          <span className="login-kicker"><SparklesIcon size={17}/> Selección basada en evidencia</span>
          <h1>Transforma postulaciones en decisiones explicables.</h1>
          <p>Gestiona vacantes, candidatos, competencias y evaluaciones desde un solo panel.</p>
          <div className="login-feature-grid">
            <div><strong>01</strong><span>Centraliza candidatos</span></div>
            <div><strong>02</strong><span>Compara competencias</span></div>
            <div><strong>03</strong><span>Explica cada puntaje</span></div>
          </div>
        </div>
      </section>

      <section className="login-form-wrap">
        <form className="login-card" onSubmit={enviar}>
          <span className="section-label">Acceso privado</span>
          <h2>Bienvenido de nuevo</h2>
          <p>Ingresa con la cuenta de administrador o reclutador creada en FastAPI.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <label>Correo electrónico
            <div className="auth-input"><MailIcon/><input required type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="admin@empresa.com" /></div>
          </label>
          <label>Contraseña
            <div className="auth-input"><LockIcon/><input required type="password" value={contrasena} onChange={e => setContrasena(e.target.value)} placeholder="••••••••" /></div>
          </label>

          <button className="button button-primary login-button" disabled={enviando} type="submit">
            {enviando ? 'Validando...' : 'Ingresar al panel'} {!enviando && <ArrowIcon/>}
          </button>
          <div className="login-help">
            <span>¿Aún no creaste el administrador?</span>
            <code>python -m app.comandos.crear_administrador</code>
          </div>
          <Link className="back-public" to="/">← Volver al portal público</Link>
        </form>
      </section>
    </div>
  )
}
