import { Link } from 'react-router-dom'
import ScoreBar from '../../components/ScoreBar'
import { CheckIcon, SparklesIcon } from '../../components/Icons'
import { candidatosDemo } from '../../data/demo'

export default function Evaluaciones() {
  const ordenados=[...candidatosDemo].sort((a,b)=>b.score-a.score)
  return <div className="panel-page">
    <div className="panel-heading"><span className="panel-eyebrow">Inteligencia explicable</span><h1>Evaluaciones y ranking</h1><p>Comparación de candidatos basada en competencias, evidencias y brechas.</p></div>
    <div className="xai-banner"><div><SparklesIcon size={28}/></div><div><strong>Diseñado para explicar, no solo puntuar</strong><p>Cada resultado debe poder rastrearse hasta competencias, experiencia y evidencias detectadas en el perfil.</p></div><span className="demo-badge">Prototipo XAI</span></div>
    <section className="panel-card ranking-card">
      <div className="ranking-head"><span>#</span><span>Candidato</span><span>Vacante</span><span>Score</span><span>Coincidencias clave</span><span></span></div>
      {ordenados.map((c,i)=><div className="ranking-row" key={c.id}><strong className="ranking-position">{i+1}</strong><div className="person-cell"><span className="candidate-avatar">{c.iniciales}</span><div><strong>{c.nombre}</strong><small>{c.experiencia}</small></div></div><span>{c.vacante}</span><ScoreBar score={c.score}/><div className="mini-tags">{c.habilidades.slice(0,2).map(h=><span key={h}><CheckIcon size={12}/>{h}</span>)}</div><Link className="text-link small-link" to={`/panel/candidatos/${c.id}`}>Explicar</Link></div>)}
    </section>
    <section className="panel-card methodology-card"><span className="panel-eyebrow">Modelo propuesto</span><h2>Composición del puntaje</h2><div className="methodology-grid"><div><strong>50%</strong><span>Competencias técnicas</span></div><div><strong>20%</strong><span>Experiencia relevante</span></div><div><strong>15%</strong><span>Formación / certificaciones</span></div><div><strong>15%</strong><span>Competencias blandas</span></div></div><p>Estos pesos son una propuesta visual para el frontend; luego pueden almacenarse y configurarse por vacante desde el backend.</p></section>
  </div>
}
