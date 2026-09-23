import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MetricCard from '../../components/MetricCard'
import ScoreBar from '../../components/ScoreBar'
import { BriefcaseIcon, ChartIcon, ChevronRightIcon, PeopleIcon, PlusIcon, TargetIcon } from '../../components/Icons'
import { candidatosDemo } from '../../data/demo'
import type { Vacante } from '../../components/VacanteCard'
import { apiRequest } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function PanelInicio() {
  const { usuario } = useAuth()
  const [vacantes, setVacantes] = useState<Vacante[]>([])

  useEffect(() => {
    apiRequest<Vacante[]>('/vacantes').then(setVacantes).catch(() => setVacantes([]))
  }, [])

  const preseleccionados = candidatosDemo.filter(c => c.estado === 'Preseleccionado').length
  const promedio = Math.round(candidatosDemo.reduce((a, c) => a + c.score, 0) / candidatosDemo.length)

  return (
    <div className="panel-page">
      <div className="panel-heading heading-with-action">
        <div><span className="panel-eyebrow">Resumen</span><h1>Hola, {usuario?.nombres}</h1><p>Este es el estado actual del proceso de preselección TI.</p></div>
        <Link className="button button-primary" to="/panel/vacantes/nueva"><PlusIcon/> Nueva vacante</Link>
      </div>

      <section className="metrics-grid">
        <MetricCard label="Vacantes publicadas" value={vacantes.length} helper="Disponibles en el portal" icon={<BriefcaseIcon/>} />
        <MetricCard label="Candidatos" value={candidatosDemo.length} helper="Datos demo hasta conectar API" icon={<PeopleIcon/>} tone="blue" />
        <MetricCard label="Preseleccionados" value={preseleccionados} helper="Cumplen el umbral definido" icon={<TargetIcon/>} tone="green" />
        <MetricCard label="Score promedio" value={`${promedio}%`} helper="Compatibilidad general" icon={<ChartIcon/>} tone="amber" />
      </section>

      <section className="panel-grid-main">
        <article className="panel-card">
          <div className="panel-card-heading"><div><span className="panel-eyebrow">Ranking</span><h2>Mejores coincidencias</h2></div><Link to="/panel/evaluaciones">Ver ranking</Link></div>
          <div className="candidate-list compact-list">
            {candidatosDemo.slice(0, 4).map((c, index) => (
              <Link to={`/panel/candidatos/${c.id}`} className="candidate-row" key={c.id}>
                <span className="rank-number">{index + 1}</span>
                <span className="candidate-avatar">{c.iniciales}</span>
                <span className="candidate-main"><strong>{c.nombre}</strong><small>{c.perfil} · {c.experiencia}</small></span>
                <ScoreBar score={c.score}/>
                <ChevronRightIcon size={17}/>
              </Link>
            ))}
          </div>
        </article>

        <aside className="panel-card insight-card">
          <span className="panel-eyebrow">Evaluación explicable</span>
          <h2>¿Por qué un candidato obtiene su puntaje?</h2>
          <p>La interfaz está preparada para mostrar qué competencias coinciden, cuáles faltan y cuánto aporta cada criterio al resultado final.</p>
          <div className="insight-example">
            <div><span>React / TypeScript</span><strong>+25</strong></div>
            <div><span>Experiencia relevante</span><strong>+20</strong></div>
            <div><span>Azure</span><strong className="negative">−6</strong></div>
          </div>
          <Link className="text-link" to="/panel/evaluaciones">Abrir evaluaciones <ChevronRightIcon/></Link>
        </aside>
      </section>

      <section className="panel-card activity-card">
        <div className="panel-card-heading"><div><span className="panel-eyebrow">Flujo</span><h2>Actividad reciente</h2></div></div>
        <div className="activity-list">
          <div><span className="activity-dot purple"/><p><strong>Nueva postulación:</strong> María Fernanda Ruiz · Frontend React</p><time>Hace 18 min</time></div>
          <div><span className="activity-dot green"/><p><strong>Evaluación completada:</strong> Carlos Mendoza obtuvo 89%</p><time>Hace 1 h</time></div>
          <div><span className="activity-dot blue"/><p><strong>Vacante actualizada:</strong> Backend Python / FastAPI</p><time>Hoy</time></div>
        </div>
      </section>
    </div>
  )
}
