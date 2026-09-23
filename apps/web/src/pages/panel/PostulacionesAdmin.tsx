import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileIcon, SearchIcon } from '../../components/Icons'
import { candidatosDemo } from '../../data/demo'

export default function PostulacionesAdmin() {
  const [busqueda,setBusqueda] = useState('')
  const lista = candidatosDemo.filter(c => [c.nombre,c.vacante,c.estado].some(x=>x.toLowerCase().includes(busqueda.toLowerCase())))
  return <div className="panel-page">
    <div className="panel-heading"><span className="panel-eyebrow">Proceso</span><h1>Postulaciones</h1><p>Seguimiento de solicitudes recibidas para cada vacante.</p></div>
    <div className="panel-toolbar"><div className="toolbar-search"><SearchIcon/><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar postulación..."/></div><span className="demo-badge">Datos demo</span></div>
    <section className="panel-card">
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Candidato</th><th>Vacante</th><th>Fecha</th><th>CV</th><th>Estado</th><th></th></tr></thead><tbody>
        {lista.map(c=><tr key={c.id}><td><div className="person-cell"><span className="candidate-avatar">{c.iniciales}</span><div><strong>{c.nombre}</strong><small>{c.correo}</small></div></div></td><td>{c.vacante}</td><td>{new Intl.DateTimeFormat('es-PE').format(new Date(`${c.fecha}T12:00:00`))}</td><td><span className="cv-chip"><FileIcon size={15}/> CV registrado</span></td><td><span className={`candidate-status status-${c.estado.toLowerCase().replaceAll(' ','-').replace('ó','o')}`}>{c.estado}</span></td><td><Link className="text-link small-link" to={`/panel/candidatos/${c.id}`}>Ver perfil</Link></td></tr>)}
      </tbody></table></div>
    </section>
    <div className="panel-notice"><FileIcon/><div><strong>Pendiente de backend</strong><span>El formulario público ya está construido, pero todavía falta el endpoint para guardar postulaciones y archivos PDF.</span></div></div>
  </div>
}
