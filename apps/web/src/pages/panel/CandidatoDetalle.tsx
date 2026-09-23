import { Link, useParams } from 'react-router-dom'
import { BriefcaseIcon, CheckIcon, MailIcon, PinIcon, TargetIcon } from '../../components/Icons'
import ScoreBar from '../../components/ScoreBar'
import { candidatosDemo } from '../../data/demo'

export default function CandidatoDetalle() {
  const { id } = useParams()
  const candidato = candidatosDemo.find(c => c.id === Number(id))
  if (!candidato) return <div className="panel-page"><div className="panel-card table-empty"><strong>Candidato no encontrado</strong><Link to="/panel/candidatos">Volver a candidatos</Link></div></div>

  return (
    <div className="panel-page">
      <div className="detail-breadcrumb"><Link to="/panel/candidatos">Candidatos</Link><span>/</span><span>{candidato.nombre}</span></div>
      <section className="candidate-profile-card panel-card">
        <div className="profile-main"><span className="candidate-avatar profile-avatar">{candidato.iniciales}</span><div><span className="candidate-status status-preseleccionado">{candidato.estado}</span><h1>{candidato.nombre}</h1><p>{candidato.perfil}</p></div></div>
        <div className="profile-score"><span>Compatibilidad</span><strong>{candidato.score}%</strong><ScoreBar score={candidato.score}/></div>
        <div className="profile-meta"><span><MailIcon size={16}/>{candidato.correo}</span><span><PinIcon size={16}/>{candidato.ubicacion}</span><span><BriefcaseIcon size={16}/>{candidato.experiencia} de experiencia</span></div>
      </section>

      <div className="candidate-detail-grid">
        <section className="panel-card"><div className="panel-card-heading"><div><span className="panel-eyebrow">Perfil</span><h2>Competencias detectadas</h2></div></div><div className="skills-cloud">{candidato.habilidades.map(h=><span key={h}>{h}</span>)}</div><div className="candidate-vacancy"><span>Postula a</span><strong>{candidato.vacante}</strong></div></section>
        <section className="panel-card explanation-card"><div className="panel-card-heading"><div><span className="panel-eyebrow">XAI</span><h2>Explicación del resultado</h2></div></div><div className="explanation-summary"><TargetIcon size={24}/><p>El puntaje resume coincidencias observables entre el perfil y los criterios configurados para la vacante.</p></div></section>
      </div>

      <div className="candidate-detail-grid">
        <section className="panel-card evidence-card positive"><h3><CheckIcon/> Fortalezas que aportan al puntaje</h3>{candidato.fortalezas.map(f=><div key={f}><span>+</span><p>{f}</p></div>)}</section>
        <section className="panel-card evidence-card gaps"><h3><span className="gap-symbol">!</span> Brechas identificadas</h3>{candidato.brechas.map(b=><div key={b}><span>−</span><p>{b}</p></div>)}</section>
      </div>

      <p className="panel-footnote">Los datos de este perfil son demostrativos. El siguiente paso del backend es persistir candidatos, CV, competencias y evidencias de evaluación.</p>
    </div>
  )
}
