import { Link } from 'react-router-dom'
import { ArrowIcon, BriefcaseIcon, CalendarIcon, PinIcon } from './Icons'

export type Vacante = {
  id: number
  titulo: string
  descripcion: string
  requisitos: string
  modalidad: 'remoto' | 'hibrido' | 'presencial' | string
  ubicacion: string | null
  fecha_limite: string
  creado_en: string
}

type Props = { vacante: Vacante }

function fechaCorta(fecha: string) {
  const valor = new Date(`${fecha}T12:00:00`)
  if (Number.isNaN(valor.getTime())) return fecha
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(valor)
}

export default function VacanteCard({ vacante }: Props) {
  return (
    <article className="job-card">
      <div className="job-card-top">
        <div className="job-icon" aria-hidden="true"><BriefcaseIcon size={21} /></div>
        <span className={`mode-badge mode-${vacante.modalidad}`}>{vacante.modalidad}</span>
      </div>
      <h3>{vacante.titulo}</h3>
      <p className="job-description">{vacante.descripcion}</p>
      <div className="job-meta">
        <span><PinIcon /> {vacante.ubicacion || 'Ubicación por coordinar'}</span>
        <span><CalendarIcon /> Hasta {fechaCorta(vacante.fecha_limite)}</span>
      </div>
      <Link className="job-link" to={`/postular/${vacante.id}`}>
        Ver vacante <ArrowIcon />
      </Link>
    </article>
  )
}
