import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { configuracion } from '../configuracion'
import { BriefcaseIcon, SearchIcon } from '../components/Icons'
import VacanteCard, { type Vacante } from '../components/VacanteCard'

export default function Vacantes() {
  const [searchParams] = useSearchParams()
  const [vacantes, setVacantes] = useState<Vacante[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState(searchParams.get('q') || '')
  const [modalidad, setModalidad] = useState('todas')

  useEffect(() => {
    async function cargarVacantes() {
      try {
        setCargando(true)
        const respuesta = await fetch(`${configuracion.api_url}/vacantes`)
        if (!respuesta.ok) throw new Error('No se pudieron obtener las vacantes.')
        setVacantes(await respuesta.json())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ocurrió un error al cargar las vacantes.')
      } finally {
        setCargando(false)
      }
    }
    cargarVacantes()
  }, [])

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return vacantes.filter(v => {
      const coincideTexto = !texto || [v.titulo, v.descripcion, v.requisitos, v.ubicacion || '']
        .some(campo => campo.toLowerCase().includes(texto))
      const coincideModalidad = modalidad === 'todas' || v.modalidad === modalidad
      return coincideTexto && coincideModalidad
    })
  }, [vacantes, busqueda, modalidad])

  return (
    <>
      <section className="page-hero compact-hero">
        <div className="shell">
          <span className="section-label">Oportunidades TI</span>
          <h1>Encuentra una vacante para ti</h1>
          <p>Filtra las posiciones disponibles por palabra clave y modalidad de trabajo.</p>
        </div>
      </section>

      <section className="shell vacancies-layout">
        <aside className="filters-card">
          <h2>Filtros</h2>
          <label>
            Buscar
            <div className="input-with-icon"><SearchIcon /><input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Ej. React, backend..." /></div>
          </label>
          <label>
            Modalidad
            <select value={modalidad} onChange={e => setModalidad(e.target.value)}>
              <option value="todas">Todas</option>
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
              <option value="presencial">Presencial</option>
            </select>
          </label>
          <button className="link-button" type="button" onClick={() => { setBusqueda(''); setModalidad('todas') }}>Limpiar filtros</button>
        </aside>

        <div className="vacancies-results">
          <div className="results-heading">
            <div><strong>{filtradas.length}</strong> {filtradas.length === 1 ? 'vacante encontrada' : 'vacantes encontradas'}</div>
          </div>

          {cargando && <div className="loading-grid"><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div>}
          {error && <div className="alert alert-error">{error} Revisa que FastAPI esté ejecutándose en el puerto configurado.</div>}
          {!cargando && !error && filtradas.length > 0 && <div className="jobs-grid two-columns">{filtradas.map(v => <VacanteCard key={v.id} vacante={v} />)}</div>}
          {!cargando && !error && filtradas.length === 0 && (
            <div className="empty-state"><BriefcaseIcon size={34}/><h3>No encontramos vacantes</h3><p>Prueba con otra palabra o cambia la modalidad seleccionada.</p></div>
          )}
        </div>
      </section>
    </>
  )
}
