import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon, SearchIcon } from '../../components/Icons'
import ScoreBar from '../../components/ScoreBar'
import { candidatosDemo } from '../../data/demo'

export default function Candidatos() {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('todos')

  const lista = useMemo(() => candidatosDemo.filter(c => {
    const q = busqueda.trim().toLowerCase()
    const coincide = !q || [c.nombre,c.correo,c.perfil,c.vacante,...c.habilidades].some(v => v.toLowerCase().includes(q))
    const coincideEstado = estado === 'todos' || c.estado === estado
    return coincide && coincideEstado
  }), [busqueda, estado])

  return (
    <div className="panel-page">
      <div className="panel-heading"><span className="panel-eyebrow">Talento</span><h1>Candidatos</h1><p>Consulta perfiles, experiencia, habilidades y nivel de compatibilidad.</p></div>
      <div className="panel-toolbar">
        <div className="toolbar-search"><SearchIcon/><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar candidato, tecnología o vacante..."/></div>
        <select value={estado} onChange={e=>setEstado(e.target.value)}><option value="todos">Todos los estados</option><option>Preseleccionado</option><option>En revisión</option><option>No seleccionado</option></select>
        <span className="demo-badge">Datos demo</span>
      </div>

      <section className="panel-card candidate-table-card">
        <div className="data-table-wrap"><table className="data-table candidate-table">
          <thead><tr><th>Candidato</th><th>Vacante</th><th>Competencias</th><th>Compatibilidad</th><th>Estado</th><th></th></tr></thead>
          <tbody>{lista.map(c => <tr key={c.id}>
            <td><div className="person-cell"><span className="candidate-avatar">{c.iniciales}</span><div><strong>{c.nombre}</strong><small>{c.correo}</small></div></div></td>
            <td><strong className="table-normal">{c.vacante}</strong><small className="block-muted">{c.experiencia}</small></td>
            <td><div className="mini-tags">{c.habilidades.slice(0,3).map(h=><span key={h}>{h}</span>)}{c.habilidades.length>3&&<span>+{c.habilidades.length-3}</span>}</div></td>
            <td><ScoreBar score={c.score}/></td>
            <td><span className={`candidate-status status-${c.estado.toLowerCase().replaceAll(' ','-').replace('ó','o')}`}>{c.estado}</span></td>
            <td><Link className="icon-action" to={`/panel/candidatos/${c.id}`}><ChevronRightIcon size={18}/></Link></td>
          </tr>)}</tbody>
        </table></div>
        {lista.length === 0 && <div className="table-empty"><strong>No se encontraron candidatos</strong><span>Prueba con otro criterio de búsqueda.</span></div>}
      </section>
    </div>
  )
}
