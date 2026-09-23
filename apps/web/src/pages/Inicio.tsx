import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroImage from '../assets/hero.png'
import { configuracion } from '../configuracion'
import { ArrowIcon, BriefcaseIcon, CheckIcon, SearchIcon } from '../components/Icons'
import VacanteCard, { type Vacante } from '../components/VacanteCard'

type EstadoApi = 'comprobando' | 'disponible' | 'error'

export default function Inicio() {
  const [estadoApi, setEstadoApi] = useState<EstadoApi>('comprobando')
  const [vacantes, setVacantes] = useState<Vacante[]>([])
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function cargar() {
      try {
        const [salud, respuestaVacantes] = await Promise.all([
          fetch(`${configuracion.api_url}/health`),
          fetch(`${configuracion.api_url}/vacantes`),
        ])
        if (!salud.ok) throw new Error('API no disponible')
        setEstadoApi('disponible')
        if (respuestaVacantes.ok) setVacantes(await respuestaVacantes.json())
      } catch {
        setEstadoApi('error')
      }
    }
    cargar()
  }, [])

  const destacadas = useMemo(() => vacantes.slice(0, 3), [vacantes])

  function buscar(e: FormEvent) {
    e.preventDefault()
    const q = busqueda.trim()
    navigate(q ? `/vacantes?q=${encodeURIComponent(q)}` : '/vacantes')
  }

  return (
    <>
      <section className="hero-section">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Talento TI mejor evaluado</div>
            <h1>Conecta tu talento con la <span>oportunidad ideal.</span></h1>
            <p>
              Encuentra vacantes de tecnología y participa en un proceso de preselección
              transparente, basado en competencias y criterios explicables.
            </p>
            <form className="hero-search" onSubmit={buscar}>
              <SearchIcon size={21} />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Busca por puesto, tecnología o palabra clave"
                aria-label="Buscar vacantes"
              />
              <button type="submit">Buscar empleo</button>
            </form>
            <div className="hero-trust">
              <span><CheckIcon /> Proceso transparente</span>
              <span><CheckIcon /> Evaluación por competencias</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Vista conceptual de evaluación inteligente">
            <div className="glow glow-one" />
            <div className="glow glow-two" />
            <div className="hero-panel hero-panel-main">
              <div className="mini-avatar">DM</div>
              <div className="mini-profile">
                <strong>Perfil analizado</strong>
                <span>Desarrollador Full Stack</span>
              </div>
              <div className="score-pill">92%</div>
              <div className="skills-row">
                <span>React</span><span>Python</span><span>SQL</span>
              </div>
              <div className="progress-line"><span /></div>
            </div>
            <div className="hero-panel hero-panel-small">
              <span className="panel-kicker">Compatibilidad</span>
              <strong>Alta coincidencia</strong>
              <div className="bars"><i /><i /><i /><i /></div>
            </div>
            <img className="hero-tech-art" src={heroImage} alt="" />
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="Indicadores">
        <div className="shell stats-grid">
          <div><strong>{vacantes.length || '—'}</strong><span>Vacantes activas</span></div>
          <div><strong>100%</strong><span>Enfoque en perfiles TI</span></div>
          <div><strong>3</strong><span>Modalidades de trabajo</span></div>
          <div className={`api-status api-${estadoApi}`}>
            <strong>{estadoApi === 'disponible' ? 'Online' : estadoApi === 'error' ? 'Offline' : '...'}</strong>
            <span>Estado de la plataforma</span>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading-row">
          <div>
            <span className="section-label">Oportunidades</span>
            <h2>Vacantes destacadas</h2>
            <p>Explora posiciones disponibles y encuentra la que mejor encaje con tu perfil.</p>
          </div>
          <Link className="text-link" to="/vacantes">Ver todas <ArrowIcon /></Link>
        </div>

        {destacadas.length > 0 ? (
          <div className="jobs-grid">{destacadas.map(v => <VacanteCard key={v.id} vacante={v} />)}</div>
        ) : (
          <div className="empty-card">
            <BriefcaseIcon size={28} />
            <div><strong>Aún no hay vacantes publicadas</strong><p>Cuando el reclutador publique una, aparecerá aquí automáticamente.</p></div>
          </div>
        )}
      </section>

      <section className="process-section" id="como-funciona">
        <div className="shell">
          <div className="section-heading centered-heading">
            <span className="section-label">Proceso simple</span>
            <h2>Tu postulación en tres pasos</h2>
            <p>El sistema organiza la información para que tu perfil pueda evaluarse de forma clara.</p>
          </div>
          <div className="process-grid">
            <div className="process-card"><span>01</span><h3>Encuentra una vacante</h3><p>Revisa requisitos, modalidad y fecha límite de cada oportunidad.</p></div>
            <div className="process-card"><span>02</span><h3>Completa tu perfil</h3><p>Ingresa tus datos y adjunta tu CV para iniciar la postulación.</p></div>
            <div className="process-card"><span>03</span><h3>Evaluación por competencias</h3><p>Tu experiencia se contrasta con las competencias requeridas por la vacante.</p></div>
          </div>
        </div>
      </section>

      <section className="cta-section shell">
        <div className="cta-card">
          <div>
            <span className="section-label light-label">Tu siguiente oportunidad</span>
            <h2>¿Listo para encontrar tu próximo reto en TI?</h2>
            <p>Explora las vacantes activas y postula con un proceso claro desde el inicio.</p>
          </div>
          <Link className="button button-light" to="/vacantes">Explorar vacantes <ArrowIcon /></Link>
        </div>
      </section>
    </>
  )
}
