import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { iniciarSesion } from '../api/autenticacion'
import { Brand, Icon } from './Inicio'

type Estado = 'inicial' | 'cargando' | 'error' | 'exitoso'

export default function InicioSesion() {
  const navegar = useNavigate()
  const [correo, setCorreo] = useState(() => window.localStorage.getItem('correoRecordado') ?? '')
  const [contrasena, setContrasena] = useState('')
  const [recordarCorreo, setRecordarCorreo] = useState(true)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [estado, setEstado] = useState<Estado>('inicial')
  const [mensaje, setMensaje] = useState('')

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!correo.trim() || !contrasena) {
      setEstado('error')
      setMensaje('Ingresa tu correo y contraseña para continuar.')
      return
    }

    setEstado('cargando')
    setMensaje('')
    try {
      const respuesta = await iniciarSesion({ correo: correo.trim(), contrasena })
      window.sessionStorage.setItem('ri_access_token', respuesta.token_acceso)
      window.sessionStorage.setItem('ri_correo', correo.trim())
      if (recordarCorreo) window.localStorage.setItem('correoRecordado', correo.trim())
      else window.localStorage.removeItem('correoRecordado')
      setEstado('exitoso')
      setMensaje('Inicio de sesión correcto.')
      setContrasena('')
      navegar('/resumen')
    } catch (error) {
      setEstado('error')
      setMensaje(error instanceof Error ? error.message : 'No se pudo iniciar sesión.')
    }
  }

  return (
    <main className="login-page">
      <aside className="login-aside">
        <Brand inverse />
        <div className="aside-content">
          <span className="aside-label">TU EQUIPO, EN UN SOLO LUGAR</span>
          <h1>El talento correcto<br />empieza aquí.</h1>
          <p>Todo el proceso de selección, organizado para que puedas enfocarte en las personas.</p>
          <div className="aside-points">
            <div><span className="aside-point-icon"><Icon name="document" /></span><p><b>Postulación sencilla</b><small>Publica vacantes y recibe currículums en un mismo lugar.</small></p></div>
            <div><span className="aside-point-icon"><Icon name="bars" /></span><p><b>Seguimiento transparente</b><small>Conoce el estado de tus procesos en todo momento.</small></p></div>
            <div><span className="aside-point-icon"><Icon name="shield" /></span><p><b>Evaluación con evidencia</b><small>Compara competencias y revisa cada perfil con claridad.</small></p></div>
          </div>
        </div>
        <div className="aside-footer">© 2026 Reclutamiento Inteligente</div>
      </aside>

      <section className="login-main">
        <div className="mobile-brand"><Brand /></div>
        <div className="login-card">
          <a href="/" className="back-link">← <span>Volver al inicio</span></a>
          <div className="login-heading">
            <span className="login-mark"><Icon name="brand" size={24} /></span>
            <p className="eyebrow">RECLUTAMIENTO INTELIGENTE</p>
            <h2>Inicia sesión</h2>
            <p>Ingresa con tu cuenta para continuar.</p>
          </div>

          <form className="login-form" onSubmit={manejarEnvio}>
            <label htmlFor="correo">Correo electrónico</label>
            <div className="input-wrap"><Icon name="mail" size={19} /><input id="correo" type="email" value={correo} onChange={(evento) => setCorreo(evento.target.value)} placeholder="tu.correo@empresa.com" autoComplete="username" required /></div>
            <div className="password-label"><label htmlFor="contrasena">Contraseña</label><a href="#recuperar" onClick={(evento) => { evento.preventDefault(); setMensaje('Contacta al equipo administrador para recuperar tu acceso.') }}>¿Olvidaste tu contraseña?</a></div>
            <div className="input-wrap"><Icon name="lock" size={19} /><input id="contrasena" type={mostrarContrasena ? 'text' : 'password'} value={contrasena} onChange={(evento) => setContrasena(evento.target.value)} placeholder="Ingresa tu contraseña" autoComplete="current-password" required /><button className="icon-button" type="button" onClick={() => setMostrarContrasena(!mostrarContrasena)} aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}><Icon name={mostrarContrasena ? 'eyeOff' : 'eye'} size={19} /></button></div>
            <div className="login-options"><label className="remember"><input type="checkbox" checked={recordarCorreo} onChange={(evento) => setRecordarCorreo(evento.target.checked)} /><span>Recordar correo</span></label><span className="secure-note"><Icon name="shield" size={15} /> Acceso seguro</span></div>
            <button className="button login-submit" type="submit" disabled={estado === 'cargando'}>{estado === 'cargando' ? 'Conectando…' : 'Iniciar sesión'}<Icon name="arrow" size={17} /></button>
            {mensaje && <p className={`login-message ${estado}`} role="status">{mensaje}</p>}
          </form>
          <div className="login-divider"><span>o</span></div>
          <button className="microsoft-button" type="button" onClick={() => setMensaje('El acceso con Microsoft estará disponible próximamente.')}><span className="ms-logo" aria-hidden="true"><i /><i /><i /><i /></span> Continuar con Microsoft</button>
          <p className="create-account">¿Aún no tienes una cuenta? <a href="/#contacto">Solicitar una demo</a></p>
        </div>
      </section>
    </main>
  )
}
