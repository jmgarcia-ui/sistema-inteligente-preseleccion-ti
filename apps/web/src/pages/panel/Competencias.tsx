import { useState } from 'react'
import { PlusIcon, SparklesIcon } from '../../components/Icons'
import { competenciasDemo } from '../../data/demo'

export default function Competencias() {
  const [items,setItems]=useState(competenciasDemo)
  const [nombre,setNombre]=useState('')
  function agregar(){ const v=nombre.trim(); if(!v)return; setItems([...items,{nombre:v,categoria:'Técnica',peso:10,nivel:'Intermedio'}]); setNombre('') }
  return <div className="panel-page">
    <div className="panel-heading"><span className="panel-eyebrow">Criterios</span><h1>Competencias</h1><p>Catálogo de habilidades utilizadas para contrastar candidatos y vacantes.</p></div>
    <div className="competency-layout">
      <section className="panel-card"><div className="panel-card-heading"><div><span className="panel-eyebrow">Catálogo</span><h2>{items.length} competencias</h2></div><span className="demo-badge">Local</span></div><div className="competency-list">{items.map((c,i)=><div className="competency-row" key={`${c.nombre}-${i}`}><div className="competency-icon"><SparklesIcon size={18}/></div><div><strong>{c.nombre}</strong><span>{c.categoria} · Nivel {c.nivel}</span></div><div className="weight-bar"><span style={{width:`${Math.min(c.peso*3,100)}%`}}/></div><strong>{c.peso}%</strong></div>)}</div></section>
      <aside className="panel-card competency-form"><span className="panel-eyebrow">Prototipo</span><h2>Agregar competencia</h2><p>Esta interacción funciona localmente para validar el diseño antes de persistir el catálogo.</p><label>Nombre<input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej. .NET / C#"/></label><button className="button button-primary" type="button" onClick={agregar}><PlusIcon/> Agregar</button><div className="form-divider"/><small>En la siguiente fase se conectará a una tabla <code>competencias</code> y a la relación por vacante.</small></aside>
    </div>
  </div>
}
