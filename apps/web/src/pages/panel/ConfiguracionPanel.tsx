import { useEffect, useState } from 'react'
import { CheckIcon, GearIcon } from '../../components/Icons'
import { configuracion } from '../../configuracion'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

export default function ConfiguracionPanel(){
  const {usuario}=useAuth(); const [estado,setEstado]=useState<'cargando'|'ok'|'error'>('cargando')
  useEffect(()=>{apiRequest<{status:string}>('/health').then(()=>setEstado('ok')).catch(()=>setEstado('error'))},[])
  return <div className="panel-page">
    <div className="panel-heading"><span className="panel-eyebrow">Sistema</span><h1>Configuración</h1><p>Verifica conexión, sesión y parámetros principales del frontend.</p></div>
    <div className="settings-grid">
      <section className="panel-card setting-card"><div className="setting-icon"><GearIcon/></div><div><span className="panel-eyebrow">Backend</span><h2>Conexión API</h2><p className="mono-line">{configuracion.api_url}</p><span className={`connection-status ${estado}`}>{estado==='ok'?<><CheckIcon/> API disponible</>:estado==='error'?'API no disponible':'Comprobando...'}</span></div></section>
      <section className="panel-card setting-card"><div className="sidebar-avatar large-avatar">{usuario?.nombres?.[0]}{usuario?.apellidos?.[0]}</div><div><span className="panel-eyebrow">Sesión</span><h2>{usuario?.nombres} {usuario?.apellidos}</h2><p>{usuario?.correo}</p><span className="connection-status ok"><CheckIcon/> Cuenta activa</span></div></section>
    </div>
    <section className="panel-card roadmap-card"><span className="panel-eyebrow">Siguiente fase técnica</span><h2>Endpoints que completarán el sistema</h2><div className="roadmap-grid"><div><strong>01</strong><span>POST /postulaciones</span><small>Datos del candidato + CV PDF</small></div><div><strong>02</strong><span>GET /candidatos</span><small>Perfiles consolidados</small></div><div><strong>03</strong><span>/competencias</span><small>Catálogo y pesos por vacante</small></div><div><strong>04</strong><span>/evaluaciones</span><small>Score, evidencia y explicación</small></div></div></section>
  </div>
}
