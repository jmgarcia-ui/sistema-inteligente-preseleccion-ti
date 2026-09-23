import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { configuracion } from '../configuracion'
import { ArrowIcon, BriefcaseIcon, CalendarIcon, CheckIcon, PinIcon, UploadIcon } from '../components/Icons'
import type { Vacante } from '../components/VacanteCard'

type Formulario = {
  nombres: string
  apellidos: string
  correo: string
  telefono: string
  linkedin: string
  resumen: string
}

const inicial: Formulario = { nombres: '', apellidos: '', correo: '', telefono: '', linkedin: '', resumen: '' }

export default function Postulacion() {
  const { vacantePublicaId } = useParams()
  const [vacante, setVacante] = useState<Vacante | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState(inicial)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    async function cargarVacante() {
      try {
        const respuesta = await fetch(`${configuracion.api_url}/vacantes/${vacantePublicaId}`)
        if (!respuesta.ok) throw new Error('Vacante no encontrada')
        setVacante(await respuesta.json())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cargar la vacante')
      } finally {
        setCargando(false)
      }
    }
    cargarVacante()
  }, [vacantePublicaId])

  function cambiar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormulario(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    // La API actual todavía no tiene endpoint de postulaciones.
    // Esta interacción deja el frontend listo para conectarlo cuando se implemente.
    setEnviado(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (cargando) return <section className="shell page-loading">Cargando vacante...</section>
  if (error || !vacante) return <section className="shell empty-state page-error"><h2>{error || 'Vacante no disponible'}</h2><Link className="button button-primary" to="/vacantes">Volver a vacantes</Link></section>

  if (enviado) {
    return (
      <section className="shell success-wrap">
        <div className="success-card">
          <div className="success-icon"><CheckIcon size={34}/></div>
          <span className="section-label">Formulario validado</span>
          <h1>Tu información está lista.</h1>
          <p>La interfaz completó la postulación localmente. Falta conectar el endpoint de postulaciones en FastAPI para guardar estos datos y el CV en la base de datos.</p>
          <Link className="button button-primary" to="/vacantes">Ver otras vacantes <ArrowIcon /></Link>
        </div>
      </section>
    )
  }

  return (
    <section className="application-page shell">
      <div className="application-breadcrumb"><Link to="/vacantes">Vacantes</Link><span>/</span><span>{vacante.titulo}</span></div>

      <div className="application-grid">
        <aside className="job-detail-card">
          <div className="job-icon large"><BriefcaseIcon size={25}/></div>
          <span className={`mode-badge mode-${vacante.modalidad}`}>{vacante.modalidad}</span>
          <h1>{vacante.titulo}</h1>
          <div className="job-detail-meta">
            <span><PinIcon /> {vacante.ubicacion || 'Ubicación por coordinar'}</span>
            <span><CalendarIcon /> Postula hasta {new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(`${vacante.fecha_limite}T12:00:00`))}</span>
          </div>
          <div className="detail-block"><h3>Sobre la posición</h3><p>{vacante.descripcion}</p></div>
          <div className="detail-block"><h3>Requisitos</h3><p>{vacante.requisitos}</p></div>
          <div className="privacy-note">Tus datos se usarán únicamente para el proceso de preselección asociado a esta vacante.</div>
        </aside>

        <form className="application-form-card" onSubmit={enviar}>
          <div className="form-heading">
            <span className="section-label">Postulación</span>
            <h2>Completa tus datos</h2>
            <p>Los campos marcados con * son obligatorios.</p>
          </div>

          <div className="form-grid">
            <label>Nombres *<input required name="nombres" value={formulario.nombres} onChange={cambiar} placeholder="Tus nombres" /></label>
            <label>Apellidos *<input required name="apellidos" value={formulario.apellidos} onChange={cambiar} placeholder="Tus apellidos" /></label>
            <label>Correo electrónico *<input required type="email" name="correo" value={formulario.correo} onChange={cambiar} placeholder="correo@ejemplo.com" /></label>
            <label>Teléfono *<input required name="telefono" value={formulario.telefono} onChange={cambiar} placeholder="+51 999 999 999" /></label>
            <label className="full-field">LinkedIn<input type="url" name="linkedin" value={formulario.linkedin} onChange={cambiar} placeholder="https://linkedin.com/in/tu-perfil" /></label>
            <label className="full-field">Resumen profesional<textarea name="resumen" value={formulario.resumen} onChange={cambiar} rows={5} placeholder="Cuéntanos brevemente tu experiencia y fortalezas técnicas" /></label>
          </div>

          <div className="upload-section">
            <span className="field-title">Currículum vitae *</span>
            <label className="upload-box">
              <UploadIcon size={28}/>
              <strong>{archivo ? archivo.name : 'Sube tu CV'}</strong>
              <span>{archivo ? `${(archivo.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, máximo 5 MB'}</span>
              <input required type="file" accept="application/pdf" onChange={e => setArchivo(e.target.files?.[0] || null)} />
            </label>
          </div>

          <label className="checkbox-row"><input required type="checkbox" /><span>Acepto el tratamiento de mis datos para este proceso de selección.</span></label>
          <button className="button button-primary submit-button" type="submit">Enviar postulación <ArrowIcon /></button>
          <p className="backend-note">Demo frontend: el guardado de postulaciones se habilitará al implementar su endpoint en FastAPI.</p>
        </form>
      </div>
    </section>
  )
}
