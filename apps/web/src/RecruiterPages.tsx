import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Icon } from './pages/Inicio'
import { enlaceCandidato, tiempoRelativo, useDemo } from './demoData'
import type { ActividadDemo, EstadoCandidato, EstadoVacante, NuevaVacante, VacanteDemo } from './demoData'

const fechaLarga = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
const normalizar = (texto: string) => texto.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

function Titulo({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children?: ReactNode }) {
  return <div className="demo-page-title"><div><h1>{titulo}</h1><p>{subtitulo}</p></div><div className="demo-heading-actions">{children}</div></div>
}
function Busqueda({ valor, cambiar, placeholder }: { valor: string; cambiar: (valor: string) => void; placeholder: string }) {
  return <label className="demo-search"><span aria-hidden="true">⌕</span><input value={valor} onChange={evento => cambiar(evento.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>
}
function TarjetaMetrica({ etiqueta, valor, detalle, icono, link }: { etiqueta: string; valor: number; detalle?: string; icono: string; link?: string }) {
  return <div className="demo-metric"><span className="demo-metric-icon"><Icon name={icono} size={25} /></span><div><p>{etiqueta}</p><strong>{valor}</strong>{detalle && <small>{detalle}</small>}{link && <Link to={link}>Ver detalle <span>→</span></Link>}</div></div>
}
function Estado({ valor }: { valor: EstadoVacante | EstadoCandidato }) {
  const clase = valor.toLowerCase().replace(/\s/g, '-')
  return <span className={`demo-status ${clase}`}><i />{valor}</span>
}
function EnlaceActividad({ item }: { item: ActividadDemo }) {
  if (item.candidatoId) return `/candidatos?id=${item.candidatoId}`
  if (item.vacanteId) return `/vacantes/${item.vacanteId}`
  return '/actividad'
}

export function Resumen() {
  const { vacantes, candidatos, actividad } = useDemo()
  const [consulta, setConsulta] = useState('')
  const activas = vacantes.filter(item => item.estado === 'Activa')
  const pendientes = vacantes.reduce((total, item) => total + item.porRevisar, 0)
  const evaluados = candidatos.filter(item => item.puntaje !== null).length
  const visibles = [...vacantes].sort((a, b) => b.porRevisar - a.porRevisar).filter(item => normalizar(item.titulo).includes(normalizar(consulta))).slice(0, 3)
  const movimientos = actividad.filter(item => normalizar(`${item.titulo} ${item.detalle}`).includes(normalizar(consulta))).slice(0, 3)

  return <>
    <Titulo titulo="Resumen" subtitulo={`${fechaLarga.charAt(0).toUpperCase()}${fechaLarga.slice(1)} · Datos de prueba`}><Busqueda valor={consulta} cambiar={setConsulta} placeholder="Buscar candidatos o vacantes" /><Link className="demo-primary" to="/vacantes/nueva">＋ Crear vacante</Link></Titulo>
    <div className="demo-overview-grid">
      <section className="demo-dark-card demo-pending"><div><p className="demo-overline">REVISIÓN PENDIENTE</p><strong>{pendientes}</strong><h2>candidatos por revisar</h2><Link className="demo-primary" to="/candidatos?estado=Por%20revisar">Revisar ahora</Link></div><div className="demo-pending-breakdown">{activas.slice(0, 4).map(item => <Link key={item.id} to={`/vacantes/${item.id}`}><span>{item.titulo}</span><b>{item.porRevisar}</b></Link>)}</div></section>
      <div className="demo-overview-side"><div className="demo-two-metrics"><TarjetaMetrica etiqueta="Vacantes activas" valor={activas.length} link="/vacantes" icono="document" /><TarjetaMetrica etiqueta="Postulaciones" valor={vacantes.reduce((total, item) => total + item.postulaciones, 0)} detalle="Total recibido" icono="people" /></div><TarjetaMetrica etiqueta="Candidatos evaluados" valor={evaluados} link="/candidatos" icono="check" /></div>
    </div>
    <div className="demo-bottom-grid"><section className="demo-panel"><div className="demo-panel-heading"><h2>Vacantes prioritarias</h2><Link to="/vacantes">Ver todas →</Link></div>{visibles.length ? visibles.map(item => <Link className="demo-priority-row" key={item.id} to={`/vacantes/${item.id}`}><span className="demo-square-icon"><Icon name="code" size={20} /></span><span className="demo-priority-name"><b>{item.titulo}</b><small>{item.competencias.join(' · ')}</small></span><span><b>{item.postulaciones}</b><small>postulaciones</small></span><span><b>{item.porRevisar}</b><small>por revisar</small></span><span className="demo-row-arrow">→</span></Link>) : <p className="demo-empty">No hay vacantes que coincidan con la búsqueda.</p>}</section><section className="demo-panel"><div className="demo-panel-heading"><h2>Actividad reciente</h2><Link to="/actividad">Ver actividad →</Link></div>{movimientos.length ? movimientos.map(item => <Link className="demo-activity-short" key={item.id} to={EnlaceActividad({ item })}><span className="demo-activity-icon"><Icon name={item.tipo === 'Postulación' ? 'people' : item.tipo === 'Vacante' ? 'document' : 'check'} size={18} /></span><span><b>{item.titulo}</b><small>{item.detalle} · {tiempoRelativo(item.fecha)}</small></span></Link>) : <p className="demo-empty">No hay actividad para esta búsqueda.</p>}</section></div>
  </>
}

export function Vacantes() {
  const { vacantes } = useDemo()
  const [params] = useSearchParams()
  const [consulta, setConsulta] = useState(params.get('q') ?? '')
  const [filtro, setFiltro] = useState<'Todas' | EstadoVacante>('Todas')
  const [pagina, setPagina] = useState(1)
  const activas = vacantes.filter(item => item.estado === 'Activa')
  const borradores = vacantes.filter(item => item.estado === 'Borrador')
  const cerradas = vacantes.filter(item => item.estado === 'Cerrada')
  const filtradas = vacantes.filter(item => (filtro === 'Todas' || item.estado === filtro) && normalizar(`${item.titulo} ${item.ubicacion}`).includes(normalizar(consulta)))
  const porPagina = 5
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtradas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina)
  const filtros: { nombre: 'Todas' | EstadoVacante; numero: number }[] = [{ nombre: 'Todas', numero: vacantes.length }, { nombre: 'Activa', numero: activas.length }, { nombre: 'Borrador', numero: borradores.length }, { nombre: 'Cerrada', numero: cerradas.length }]

  return <>
    <Titulo titulo="Vacantes" subtitulo={`${vacantes.length} vacantes en total · Datos de prueba`}><Busqueda valor={consulta} cambiar={valor => { setConsulta(valor); setPagina(1) }} placeholder="Buscar por nombre de vacante" /><Link className="demo-primary" to="/vacantes/nueva">＋ Crear vacante</Link></Titulo>
    <div className="demo-vacancy-summary"><section className="demo-dark-card"><p className="demo-overline">VACANTES ACTIVAS</p><strong>{activas.length}</strong><h2>procesos en curso</h2><Link className="demo-primary" to="/candidatos">Revisar candidatos</Link></section><TarjetaMetrica etiqueta="Borradores" valor={borradores.length} link="/vacantes" icono="document" /><TarjetaMetrica etiqueta="Cerradas" valor={cerradas.length} icono="check" /></div>
    <section className="demo-panel demo-list-panel"><div className="demo-panel-heading"><h2>Todas las vacantes</h2><div className="demo-tabs" role="group" aria-label="Filtrar vacantes">{filtros.map(item => <button type="button" key={item.nombre} className={filtro === item.nombre ? 'selected' : ''} onClick={() => { setFiltro(item.nombre); setPagina(1) }}>{item.nombre === 'Activa' ? 'Activas' : item.nombre === 'Borrador' ? 'Borradores' : item.nombre === 'Cerrada' ? 'Cerradas' : item.nombre}<b>{item.numero}</b></button>)}</div></div><div className="demo-vacancy-list">{visibles.length ? visibles.map(item => <Link className="demo-vacancy-row" to={`/vacantes/${item.id}`} key={item.id}><span className="demo-square-icon"><Icon name={item.area === 'Datos' ? 'bars' : 'code'} size={21} /></span><span className="demo-vacancy-name"><b>{item.titulo}</b><small>{item.modalidad} · {item.ubicacion}</small></span><span><b>{item.postulaciones}</b><small>postulaciones</small></span><span><b>{item.porRevisar}</b><small>por revisar</small></span><Estado valor={item.estado} /><span className="demo-row-arrow">→</span></Link>) : <p className="demo-empty">No hay vacantes con este filtro.</p>}</div><div className="demo-list-footer"><span>Mostrando {visibles.length} de {filtradas.length} vacantes</span><div><button type="button" onClick={() => setPagina(Math.max(1, paginaActual - 1))} disabled={paginaActual === 1}>‹</button><span>{paginaActual} / {totalPaginas}</span><button type="button" onClick={() => setPagina(Math.min(totalPaginas, paginaActual + 1))} disabled={paginaActual === totalPaginas}>›</button></div></div></section>
  </>
}

export function CrearVacante() {
  const { crearVacante } = useDemo()
  const [creada, setCreada] = useState<VacanteDemo | null>(null)
  const [copiada, setCopiada] = useState(false)
  const [error, setError] = useState('')
  async function copiar() {
    if (!creada) return
    try { await navigator.clipboard.writeText(enlaceCandidato(creada)); setCopiada(true) } catch { setError('Selecciona y copia el enlace manualmente.') }
  }
  function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const texto = (clave: string) => String(datos.get(clave) ?? '').trim()
    if (!texto('titulo') || !texto('descripcion') || !texto('ubicacion')) { setError('Completa el puesto, la descripción y la ubicación.'); return }
    const lineas = (valor: string) => valor.split('\n').map(item => item.trim()).filter(Boolean)
    const entrada: NuevaVacante = { titulo: texto('titulo'), area: texto('area') || 'Tecnología', modalidad: texto('modalidad') || 'Remoto', ubicacion: texto('ubicacion'), jornada: texto('jornada') || 'Tiempo completo', descripcion: texto('descripcion'), responsabilidades: lineas(texto('responsabilidades')), requisitos: lineas(texto('requisitos')), competencias: texto('competencias').split(',').map(item => item.trim()).filter(Boolean), estado: texto('estado') as EstadoVacante }
    setCreada(crearVacante(entrada))
    setError('')
  }
  return <>
    <Titulo titulo="Crear vacante" subtitulo="Prepara una oportunidad de prueba y genera su enlace público"><Link className="demo-secondary" to="/vacantes">← Volver a vacantes</Link></Titulo>
    {creada ? <div className="demo-created-grid"><section className="demo-panel demo-created"><span className="demo-success-mark"><Icon name="check" size={29} /></span><h2>{creada.estado === 'Activa' ? 'Vacante publicada' : 'Borrador guardado'}</h2><p>{creada.titulo} está disponible en esta demo. El enlace abre la pantalla pública del candidato; no se escribió en la base de datos.</p><label htmlFor="enlace-publico">Enlace de postulación</label><div className="demo-link-field"><input id="enlace-publico" readOnly value={enlaceCandidato(creada)} onFocus={evento => evento.target.select()} /><button type="button" onClick={copiar}>{copiada ? 'Copiado' : 'Copiar'}</button></div>{error && <p className="demo-form-error">{error}</p>}<div className="demo-inline-actions"><a className="demo-primary" href={enlaceCandidato(creada)}>Abrir como candidato ↗</a><Link className="demo-secondary" to={`/vacantes/${creada.id}`}>Ver vacante</Link></div></section><aside className="demo-panel demo-side-note"><h3>Cómo probar el flujo</h3><p>Abre el enlace para ver el puesto, pulsa “Postular” y completa el formulario con datos ficticios. La solicitud se refleja solo en este navegador.</p></aside></div> : <form className="demo-create-form" onSubmit={guardar}><section className="demo-panel"><h2>Información general</h2><p className="demo-form-subtitle">Estos datos aparecerán en el enlace público.</p><div className="demo-form-grid"><label>Puesto <input name="titulo" placeholder="Ej. Desarrollador Backend" required /></label><label>Área <input name="area" placeholder="Ej. Tecnología" defaultValue="Tecnología" /></label><label>Modalidad <select name="modalidad" defaultValue="Remoto"><option>Remoto</option><option>Híbrido</option><option>Presencial</option></select></label><label>Ubicación <input name="ubicacion" placeholder="Ej. Lima, Perú" required /></label><label>Jornada <select name="jornada" defaultValue="Tiempo completo"><option>Tiempo completo</option><option>Medio tiempo</option><option>Contrato</option></select></label><label>Estado inicial <select name="estado" defaultValue="Activa"><option>Activa</option><option>Borrador</option></select></label></div><label className="demo-full-field">Sobre el puesto <textarea name="descripcion" rows={4} placeholder="Describe brevemente el objetivo de la posición" required /></label></section><section className="demo-panel"><h2>Perfil y publicación</h2><p className="demo-form-subtitle">Escribe una responsabilidad o requisito por línea.</p><div className="demo-form-grid"><label>Responsabilidades <textarea name="responsabilidades" rows={5} placeholder={'Crear y mantener APIs REST.\nColaborar con el equipo.'} /></label><label>Requisitos <textarea name="requisitos" rows={5} placeholder={'Experiencia en desarrollo.\nConocimientos de TypeScript.'} /></label></div><label className="demo-full-field">Competencias <input name="competencias" placeholder="Node.js, TypeScript, Azure" /><small>Separa cada competencia con una coma.</small></label></section>{error && <p className="demo-form-error">{error}</p>}<div className="demo-form-actions"><Link className="demo-secondary" to="/vacantes">Cancelar</Link><button className="demo-primary" type="submit">Generar enlace de postulación →</button></div></form>}
  </>
}

export function DetalleVacante() {
  const { id } = useParams()
  const { vacantes, cambiarEstadoVacante } = useDemo()
  const vacante = vacantes.find(item => item.id === id)
  const [copiada, setCopiada] = useState(false)
  if (!vacante) return <div className="demo-panel demo-empty-page"><h1>Vacante no encontrada</h1><Link to="/vacantes">Volver a vacantes</Link></div>
  async function copiar() {
    if (!vacante) return
    try { await navigator.clipboard.writeText(enlaceCandidato(vacante)); setCopiada(true) } catch { setCopiada(false) }
  }
  return <><Titulo titulo={vacante.titulo} subtitulo={`${vacante.area} · ${vacante.modalidad} · ${vacante.ubicacion}`}><Link className="demo-secondary" to="/vacantes">← Volver</Link></Titulo><div className="demo-detail-grid"><section className="demo-panel"><div className="demo-detail-top"><Estado valor={vacante.estado} /><span>Creada {tiempoRelativo(vacante.creada).toLowerCase()}</span></div><h2>Sobre el puesto</h2><p>{vacante.descripcion}</p><h3>Responsabilidades</h3><ul>{vacante.responsabilidades.map((item, indice) => <li key={indice}>{item}</li>)}</ul><h3>Lo que buscamos</h3><ul>{vacante.requisitos.map((item, indice) => <li key={indice}>{item}</li>)}</ul><h3>Competencias</h3><div className="demo-chips">{vacante.competencias.map(item => <span key={item}>{item}</span>)}</div></section><aside className="demo-detail-side"><section className="demo-panel"><h3>Resumen</h3><p><b>{vacante.postulaciones}</b> postulaciones</p><p><b>{vacante.porRevisar}</b> por revisar</p><Link className="demo-primary" to={`/candidatos?vacante=${vacante.id}`}>Ver candidatos →</Link></section><section className="demo-panel"><h3>Publicación de prueba</h3><p>Cambia el estado local de la vacante y comparte el enlace para abrir la pantalla del candidato.</p><select aria-label="Estado de la vacante" value={vacante.estado} onChange={evento => cambiarEstadoVacante(vacante.id, evento.target.value as EstadoVacante)}><option>Activa</option><option>Borrador</option><option>Cerrada</option></select><label htmlFor="enlace-detalle">Enlace público</label><input id="enlace-detalle" value={enlaceCandidato(vacante)} readOnly onFocus={evento => evento.target.select()} /><div className="demo-inline-actions"><button className="demo-secondary" type="button" onClick={copiar}>{copiada ? 'Copiado' : 'Copiar'}</button><a className="demo-primary" href={enlaceCandidato(vacante)}>Abrir ↗</a></div></section></aside></div></>
}

export function Candidatos() {
  const { vacantes, candidatos, cambiarEstadoCandidato } = useDemo()
  const [params] = useSearchParams()
  const [consulta, setConsulta] = useState('')
  const [estado, setEstado] = useState(params.get('estado') ?? 'Todos los estados')
  const [vacanteId, setVacanteId] = useState(params.get('vacante') ?? 'todas')
  const [seleccionado, setSeleccionado] = useState(params.get('id') ?? '')
  const [mensaje, setMensaje] = useState('')
  const visibles = [...candidatos].filter(item => normalizar(item.nombre).includes(normalizar(consulta)) && (estado === 'Todos los estados' || item.estado === estado) && (vacanteId === 'todas' || item.vacanteId === vacanteId)).sort((a, b) => (b.puntaje ?? -1) - (a.puntaje ?? -1))
  const candidato = visibles.find(item => item.id === seleccionado) ?? visibles[0]
  const puesto = candidato ? vacantes.find(item => item.id === candidato.vacanteId) : null
  function decidir(nuevo: EstadoCandidato) {
    if (!candidato) return
    cambiarEstadoCandidato(candidato.id, nuevo)
    setMensaje(`Estado de ${candidato.nombre}: ${nuevo}. Cambio guardado solo en este navegador.`)
  }
  return <>
    <Titulo titulo="Candidatos" subtitulo={`${candidatos.length} perfiles de prueba · La decisión final es humana`}><Busqueda valor={consulta} cambiar={setConsulta} placeholder="Buscar candidato" /><select className="demo-filter" value={estado} onChange={evento => setEstado(evento.target.value)} aria-label="Filtrar por estado"><option>Todos los estados</option><option>Por revisar</option><option>En revisión</option><option>Finalista</option><option>Descartado</option></select><select className="demo-filter" value={vacanteId} onChange={evento => setVacanteId(evento.target.value)} aria-label="Filtrar por vacante"><option value="todas">Todas las vacantes</option>{vacantes.map(item => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select></Titulo>
    <div className="demo-candidates-grid"><section className="demo-panel demo-ranking"><div className="demo-panel-heading"><h2>Ranking</h2><span>{visibles.length} perfiles</span></div>{visibles.length ? visibles.map((item, indice) => <button type="button" key={item.id} className={`demo-candidate-row ${candidato?.id === item.id ? 'selected' : ''}`} onClick={() => { setSeleccionado(item.id); setMensaje('') }}><span className="demo-rank-number">{indice + 1}</span><span className="demo-candidate-avatar">{item.nombre.split(' ').map(parte => parte[0]).slice(0, 2).join('')}</span><span className="demo-candidate-name"><b>{item.nombre}</b><small>{vacantes.find(vacante => vacante.id === item.vacanteId)?.titulo ?? 'Vacante de prueba'}</small></span><strong>{item.puntaje ?? '—'}</strong><span>›</span></button>) : <p className="demo-empty">No hay candidatos para estos filtros.</p>}</section>{candidato && <div className="demo-candidate-detail"><section className="demo-dark-card demo-candidate-hero"><span className="demo-candidate-avatar large">{candidato.nombre.split(' ').map(parte => parte[0]).slice(0, 2).join('')}</span><div><h2>{candidato.nombre}</h2><p>{puesto?.titulo ?? 'Postulación de prueba'}</p><div className="demo-hero-chips"><span>{candidato.experiencia}</span><span>{candidato.ubicacion}</span><Estado valor={candidato.estado} /></div></div><div className="demo-score"><strong>{candidato.puntaje ?? '—'}</strong><span>{candidato.puntaje !== null ? '/100' : 'Pendiente'}</span></div></section><section className="demo-panel demo-skills"><h3>Coincidencia por competencias</h3>{candidato.competencias.length ? candidato.competencias.map(item => <div className="demo-skill-row" key={item.nombre}><span>{item.nombre}</span><i><b style={{ width: `${item.valor}%` }} /></i><strong>{item.valor}%</strong></div>) : <p>Este perfil está pendiente de evaluación.</p>}<p className="demo-info">ⓘ La puntuación orienta; la decisión final es humana.</p></section><section className="demo-panel demo-evidence-grid"><div><h3>Fortalezas</h3>{candidato.fortalezas.length ? candidato.fortalezas.map(item => <p key={item}>✓ {item}</p>) : <p>En revisión</p>}</div><div><h3>Brechas</h3>{candidato.brechas.length ? candidato.brechas.map(item => <p key={item}>• {item}</p>) : <p>En revisión</p>}</div><div><h3>Evidencias</h3>{candidato.evidencias.map(item => <p key={item}>▤ {item}</p>)}</div></section><div className="demo-decision-actions"><button type="button" className="demo-secondary" onClick={() => decidir('En revisión')}>Mantener en revisión</button><button type="button" className="demo-primary" onClick={() => decidir('Finalista')}>☆ Marcar finalista</button><button type="button" className="demo-text-button" onClick={() => decidir('Descartado')}>Descartar</button></div>{mensaje && <p className="demo-action-message" role="status">{mensaje}</p>}</div>}</div>
  </>
}

export function Actividad() {
  const { vacantes, candidatos, actividad } = useDemo()
  const [consulta, setConsulta] = useState('')
  const [tipo, setTipo] = useState('Todos los movimientos')
  const [vacanteId, setVacanteId] = useState('todas')
  const [periodo, setPeriodo] = useState('30')
  const [limite, setLimite] = useState(5)
  const visibles = actividad.filter(item => normalizar(`${item.titulo} ${item.detalle}`).includes(normalizar(consulta)) && (tipo === 'Todos los movimientos' || item.tipo === tipo) && (vacanteId === 'todas' || item.vacanteId === vacanteId) && (periodo === 'todos' || Date.now() - new Date(item.fecha).getTime() <= Number(periodo) * 86400000)).sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
  const pendientes = vacantes.reduce((total, item) => total + item.porRevisar, 0)
  const hoy = actividad.filter(item => Date.now() - new Date(item.fecha).getTime() < 86400000)
  return <>
    <Titulo titulo="Actividad" subtitulo="Movimientos de prueba del proceso de selección"><Busqueda valor={consulta} cambiar={setConsulta} placeholder="Buscar candidato o vacante" /><select className="demo-filter" value={tipo} onChange={evento => { setTipo(evento.target.value); setLimite(5) }} aria-label="Filtrar movimiento"><option>Todos los movimientos</option><option>Postulación</option><option>Evaluación</option><option>Decisión</option><option>Vacante</option></select></Titulo>
    <div className="demo-activity-summary"><section className="demo-dark-card"><p className="demo-overline">HOY</p><strong>{hoy.filter(item => item.tipo === 'Postulación').length}</strong><h2>nuevas postulaciones</h2><div className="demo-dark-mini"><span><b>{hoy.filter(item => item.tipo === 'Evaluación').length}</b> Evaluaciones</span><span><b>{hoy.filter(item => item.tipo === 'Decisión').length}</b> Decisiones</span></div><Link to="/candidatos">Ver candidatos nuevos →</Link></section><TarjetaMetrica etiqueta="Pendientes de revisión" valor={pendientes} detalle="Prioriza las vacantes con más perfiles pendientes" icono="check" link="/candidatos?estado=Por%20revisar" /></div>
    <div className="demo-bottom-grid activity-grid"><section className="demo-panel"><div className="demo-panel-heading"><h2>Actividad reciente</h2><div className="demo-small-filters"><select aria-label="Filtrar vacante" value={vacanteId} onChange={evento => { setVacanteId(evento.target.value); setLimite(5) }}><option value="todas">Todas las vacantes</option>{vacantes.map(item => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select><select aria-label="Filtrar periodo" value={periodo} onChange={evento => { setPeriodo(evento.target.value); setLimite(5) }}><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="todos">Todo</option></select></div></div>{visibles.slice(0, limite).map(item => <Link className="demo-activity-row" key={item.id} to={EnlaceActividad({ item })}><span className="demo-activity-icon"><Icon name={item.tipo === 'Postulación' ? 'people' : item.tipo === 'Vacante' ? 'document' : 'check'} size={18} /></span><span><b>{item.titulo}</b><small>{item.detalle}</small></span><time>{tiempoRelativo(item.fecha)}</time><span className="demo-activity-link">Ver detalle →</span></Link>)}{!visibles.length && <p className="demo-empty">No hay movimientos para estos filtros.</p>}{limite < visibles.length && <button type="button" className="demo-load-more" onClick={() => setLimite(limite + 5)}>Cargar más actividad ↓</button>}</section><section className="demo-panel"><div className="demo-panel-heading"><h2>Vacantes con actividad</h2></div>{[...vacantes].sort((a, b) => b.porRevisar - a.porRevisar).slice(0, 4).map(item => <Link className="demo-activity-vacancy" key={item.id} to={`/vacantes/${item.id}`}><span className="demo-square-icon"><Icon name="code" size={19} /></span><b>{item.titulo}</b><span><strong>{item.porRevisar}</strong><small>pendientes</small></span><span>›</span></Link>)}<Link className="demo-panel-bottom-link" to="/vacantes">Ver todas las vacantes →</Link><p className="demo-panel-note">{candidatos.length} candidatos de prueba en el navegador.</p></section></div>
  </>
}
