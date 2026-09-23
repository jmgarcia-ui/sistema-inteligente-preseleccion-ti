import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowIcon, CheckIcon } from '../../components/Icons'
import { apiRequest } from '../../lib/api'

const inicial = { titulo: '', descripcion: '', requisitos: '', modalidad: 'hibrido', ubicacion: 'Lima, Perú', fecha_limite: '' }

type Creada = { id: number }

export default function NuevaVacante() {
  const [form, setForm] = useState(inicial)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const navigate = useNavigate()
  const minFecha = useMemo(() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10) }, [])

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const creada = await apiRequest<Creada>('/vacantes', { method: 'POST', auth: true, body: JSON.stringify(form) })
      await apiRequest(`/vacantes/${creada.id}`, { method: 'PATCH', auth: true, body: JSON.stringify({ estado: 'publicada' }) })
      navigate('/panel/vacantes', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la vacante.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="panel-page narrow-panel-page">
      <div className="panel-heading"><span className="panel-eyebrow">Nueva oportunidad</span><h1>Crear vacante</h1><p>Completa la información y publícala directamente en el portal.</p></div>
      <form className="panel-card vacancy-form" onSubmit={enviar}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-section-title"><span>01</span><div><strong>Información principal</strong><small>Describe el puesto de forma clara.</small></div></div>
        <div className="admin-form-grid">
          <label className="full-field">Título del puesto *<input required minLength={3} value={form.titulo} onChange={e => setForm({...form,titulo:e.target.value})} placeholder="Ej. Desarrollador Backend Python" /></label>
          <label className="full-field">Descripción *<textarea required minLength={20} rows={6} value={form.descripcion} onChange={e => setForm({...form,descripcion:e.target.value})} placeholder="Responsabilidades, contexto del equipo y objetivo del puesto..." /></label>
          <label className="full-field">Requisitos *<textarea required minLength={20} rows={6} value={form.requisitos} onChange={e => setForm({...form,requisitos:e.target.value})} placeholder="Python, FastAPI, SQL Server, Git, experiencia mínima..." /></label>
        </div>
        <div className="form-divider"/>
        <div className="form-section-title"><span>02</span><div><strong>Condiciones</strong><small>Define modalidad, ubicación y cierre.</small></div></div>
        <div className="admin-form-grid">
          <label>Modalidad *<select value={form.modalidad} onChange={e => setForm({...form,modalidad:e.target.value})}><option value="remoto">Remoto</option><option value="hibrido">Híbrido</option><option value="presencial">Presencial</option></select></label>
          <label>Ubicación<input value={form.ubicacion} onChange={e => setForm({...form,ubicacion:e.target.value})} placeholder="Lima, Perú" /></label>
          <label>Fecha límite *<input required min={minFecha} type="date" value={form.fecha_limite} onChange={e => setForm({...form,fecha_limite:e.target.value})} /></label>
        </div>
        <div className="form-actions"><Link className="button button-secondary" to="/panel/vacantes">Cancelar</Link><button className="button button-primary" disabled={guardando} type="submit">{guardando ? 'Publicando...' : 'Guardar y publicar'} {!guardando && <CheckIcon/>}</button></div>
      </form>
      <div className="panel-footnote"><ArrowIcon size={15}/> El frontend ejecuta <code>POST /vacantes</code> y luego <code>PATCH /vacantes/:id</code> para cambiar el estado a publicada.</div>
    </div>
  )
}
