import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseIcon, CalendarIcon, EyeIcon, PlusIcon } from '../../components/Icons'
import type { Vacante } from '../../components/VacanteCard'
import { apiRequest } from '../../lib/api'

export default function VacantesAdmin() {
  const [vacantes, setVacantes] = useState<Vacante[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<Vacante[]>('/vacantes').then(setVacantes).catch(e => setError(e instanceof Error ? e.message : 'Error al cargar vacantes')).finally(() => setCargando(false))
  }, [])

  return (
    <div className="panel-page">
      <div className="panel-heading heading-with-action">
        <div><span className="panel-eyebrow">Gestión</span><h1>Vacantes</h1><p>Administra las oportunidades visibles en el portal público.</p></div>
        <Link className="button button-primary" to="/panel/vacantes/nueva"><PlusIcon/> Crear vacante</Link>
      </div>

      <div className="panel-notice"><BriefcaseIcon/><div><strong>Conectado con FastAPI</strong><span>Esta vista lee <code>GET /vacantes</code>. Por ahora el backend devuelve únicamente vacantes publicadas y vigentes.</span></div></div>

      <section className="panel-card">
        {cargando && <div className="table-empty">Cargando vacantes...</div>}
        {error && <div className="alert alert-error">{error}</div>}
        {!cargando && !error && vacantes.length === 0 && <div className="table-empty"><BriefcaseIcon size={30}/><strong>No hay vacantes publicadas</strong><span>Crea la primera desde el botón superior.</span></div>}
        {vacantes.length > 0 && (
          <div className="data-table-wrap"><table className="data-table">
            <thead><tr><th>Vacante</th><th>Modalidad</th><th>Ubicación</th><th>Fecha límite</th><th></th></tr></thead>
            <tbody>{vacantes.map(v => <tr key={v.id}>
              <td><div className="table-title"><span className="table-icon"><BriefcaseIcon size={17}/></span><div><strong>{v.titulo}</strong><small>ID #{v.id}</small></div></div></td>
              <td><span className={`status-chip mode-${v.modalidad}`}>{v.modalidad}</span></td>
              <td>{v.ubicacion || 'Por coordinar'}</td>
              <td><span className="cell-icon"><CalendarIcon size={15}/>{new Intl.DateTimeFormat('es-PE').format(new Date(`${v.fecha_limite}T12:00:00`))}</span></td>
              <td><Link className="icon-action" to={`/postular/${v.id}`} target="_blank" title="Ver en portal"><EyeIcon size={18}/></Link></td>
            </tr>)}</tbody>
          </table></div>
        )}
      </section>
    </div>
  )
}
