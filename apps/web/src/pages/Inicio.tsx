import type { ReactNode } from "react";

const steps = [
  { number: "01", icon: "document", title: "Define el puesto", copy: "Requisitos y competencias." },
  { number: "02", icon: "megaphone", title: "Comparte la vacante", copy: "Genera el texto y publícalo en tus canales." },
  { number: "03", icon: "people", title: "Recibe postulaciones", copy: "Un formulario para datos y currículum." },
  { number: "04", icon: "check", title: "Revisa y decide", copy: "Compara perfiles con evidencias." },
];

export function Icon({ name, size = 22, className = "" }: { name: string; size?: number; className?: string }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, className };
  const drawings: Record<string, ReactNode> = {
    brand: <><rect x="2.5" y="2.5" width="19" height="19" rx="6" /><circle cx="9" cy="9" r="2" /><circle cx="16" cy="9" r="2" /><path d="M5.8 17c.4-2.1 1.5-3.1 3.2-3.1 1.3 0 2.3.6 2.8 1.7.5-1.1 1.5-1.7 2.8-1.7 1.8 0 2.9 1.1 3.3 3.1" /></>,
    document: <><path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5v5h5M8.5 13h7M8.5 16.5h7"/></>,
    megaphone: <><path d="m4 11 14-6v14L4 13v-2Z"/><path d="M4 13l2 6h4l-2.3-5M18 9a3 3 0 0 1 0 6"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19M16 5.4a3 3 0 0 1 0 5.8M17 13.2a4.7 4.7 0 0 1 3.5 4.6V19"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.6L16.5 9"/></>,
    code: <><path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M14 5l-4 14"/></>,
    bars: <><path d="M4 19V5M4 19h16"/><rect x="7" y="12" width="3" height="4" rx="1"/><rect x="12" y="9" width="3" height="7" rx="1"/><rect x="17" y="6" width="3" height="10" rx="1"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    arrow: <><path d="M4 12h15M13 6l6 6-6 6"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    eye: <><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    eyeOff: <><path d="m3 3 18 18M10.6 6.2A9.7 9.7 0 0 1 12 6c6.2 0 9.5 6 9.5 6a15.7 15.7 0 0 1-3 3.6M6.2 6.2C3.8 7.8 2.5 12 2.5 12s3.3 6 9.5 6c1 0 1.9-.2 2.8-.5"/></>,
  };
  return <svg {...common}>{drawings[name] || drawings.document}</svg>;
}

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return <a className={`brand ${inverse ? "brand-inverse" : ""}`} href="/" aria-label="Reclutamiento Inteligente, inicio"><span className="brand-mark"><Icon name="brand" size={22} /></span><span>Reclutamiento <b>Inteligente</b></span></a>;
}

export default function Inicio() {
  return (
    <main className="landing">
      <header className="topbar">
        <div className="nav-inner"><Brand />
          <nav className="main-nav" aria-label="Navegación principal"><a href="#como-funciona">Cómo funciona</a><a href="#funciones">Funciones</a></nav>
          <div className="nav-actions"><a className="login-link" href="/login">Iniciar sesión</a><a className="button button-small" href="/resumen">Explorar demo</a></div>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <span className="orbit orbit-one" aria-hidden="true" /><span className="orbit orbit-two" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">PARA EQUIPOS DE RECLUTAMIENTO</p>
          <h1 id="hero-title">Encuentra el talento.<br /><span>Decide con evidencia.</span></h1>
          <p className="hero-copy">Organiza tus vacantes, analiza currículums y compara<br className="desktop-break" /> competencias desde un solo lugar.</p>
          <div className="hero-actions"><a className="button" href="/resumen">Explorar demo <Icon name="arrow" size={17} /></a><a className="button button-outline" href="#como-funciona"><span className="play-icon">▶</span> Ver cómo funciona</a></div>
        </div>
        <div className="product-preview" aria-label="Vista ilustrativa de una plataforma de reclutamiento">
          <div className="preview-sidebar"><span className="preview-logo"><Icon name="brand" size={19} /></span><i className="selected"/><i/><i/><i/><span className="sidebar-avatar">MC</span></div>
          <div className="preview-main">
            <div className="preview-top"><span className="preview-greeting">Buenos días, María <span>✦</span><small>Este es el resumen de tu equipo.</small></span><span className="preview-user"><span className="avatar">MC</span> María C.⌄</span></div>
            <div className="preview-title">Resumen <span>Últimos 30 días⌄</span></div>
            <div className="preview-stats"><div className="stat-card"><small>Vacantes activas</small><b>12 <em>↗ 2</em></b><span>En proceso de selección</span></div><div className="stat-card"><small>Postulaciones recibidas</small><b>248 <em>↗ 18%</em></b><span>En los últimos 30 días</span></div><div className="stat-card"><small>Por revisar</small><b>36 <span className="stat-dot"/></b><span>Requieren tu atención</span></div></div>
            <div className="preview-lower"><div className="preview-table"><div className="preview-section-title">Vacantes recientes <a href="#funciones">Ver todas →</a></div><div className="table-row table-head"><span>VACANTE</span><span>POSTULACIONES</span><span>ESTADO</span></div><div className="table-row"><b><span className="mini-icon blue"><Icon name="code" size={15}/></span>Desarrollador Backend<small>Ingeniería · Remoto</small></b><span>48 recibidas</span><label>Publicada</label></div><div className="table-row"><b><span className="mini-icon purple"><Icon name="bars" size={15}/></span>Analista de Datos<small>Producto · Híbrido</small></b><span>34 recibidas</span><label>Publicada</label></div><div className="table-row"><b><span className="mini-icon green"><Icon name="people" size={15}/></span>Diseñador UX/UI<small>Diseño · Híbrido</small></b><span>21 recibidas</span><label className="draft">Borrador</label></div></div><div className="preview-activity"><div className="preview-section-title">Actividad reciente</div><div className="activity-item"><span className="activity-symbol">↗</span><p><b>Nueva postulación</b><small>Desarrollador Backend · hace 12 min</small></p></div><div className="activity-item"><span className="activity-symbol purple-symbol">✓</span><p><b>Evaluación completada</b><small>Analista de Datos · hace 45 min</small></p></div><div className="activity-item"><span className="activity-symbol amber-symbol">＋</span><p><b>Nueva vacante creada</b><small>Diseñador UX/UI · hace 2 h</small></p></div></div></div>
          </div>
        </div>
        <p className="preview-caption"><span/> Vista ilustrativa del sistema</p>
      </section>

      <section className="process section-wrap" id="como-funciona">
        <div className="section-heading"><p className="eyebrow">UN PROCESO CLARO, DE PRINCIPIO A FIN</p><h2>De la vacante a la decisión.</h2><p>Un proceso simple y organizado para tu equipo.</p></div>
        <div className="steps">{steps.map((step) => <article className="step" key={step.number}><div className="step-top"><span className="step-number">{step.number}</span><span className="step-icon"><Icon name={step.icon} size={28}/></span></div><h3>{step.title}</h3><p>{step.copy}</p></article>)}</div>
      </section>

      <section className="features section-wrap" id="funciones">
        <div className="section-heading"><p className="eyebrow">HERRAMIENTAS PARA TU EQUIPO</p><h2>Lo esencial para evaluar mejor.</h2><p>Todo lo que necesitas para tomar decisiones informadas.</p></div>
        <div className="feature-grid">
          <article className="feature-card skill-card"><span className="feature-badge">Ejemplo de evaluación</span><div className="feature-icon dark-icon"><Icon name="shield" size={20}/></div><h3>Competencias,<br/>con contexto.</h3><p>Consulta coincidencias, brechas y evidencias del currículum.</p><div className="skill-list"><div><span>Node.js</span><i><b style={{width:"85%"}}/></i><strong>85%</strong></div><div><span>TypeScript</span><i><b style={{width:"70%"}}/></i><strong>70%</strong></div><div><span>Azure</span><i><b style={{width:"45%"}}/></i><strong>45%</strong></div></div></article>
          <article className="feature-card vacancies-card"><div className="feature-title-row"><span className="feature-icon"><Icon name="code" size={20}/></span><div><h3>Vacantes en un solo lugar</h3><p>Gestiona todas tus posiciones y sigue su avance.</p></div></div><div className="vacancy-line"><span className="mini-icon blue"><Icon name="code" size={16}/></span><span><b>Desarrollador Backend</b><small>.NET · C# · SQL Server</small></span><strong>48<small>postulaciones</small></strong><span className="chevron">›</span></div><div className="vacancy-line"><span className="mini-icon purple"><Icon name="bars" size={16}/></span><span><b>Analista de Datos</b><small>SQL · Power BI · Python</small></span><strong>34<small>postulaciones</small></strong><span className="chevron">›</span></div></article>
          <article className="feature-card activity-card"><div className="feature-title-row"><span className="feature-icon"><Icon name="bars" size={20}/></span><div><h3>Actividad y trazabilidad</h3><p>Sigue cada etapa del proceso.</p></div></div><div className="timeline"><div><span className="timeline-mark"><Icon name="people" size={15}/></span><b>Postulación recibida</b><small>Hace 12 min</small></div><div><span className="timeline-mark"><Icon name="check" size={15}/></span><b>Evaluación completada</b><small>Hace 45 min</small></div><div><span className="timeline-mark"><Icon name="document" size={15}/></span><b>Decisión registrada</b><small>Hace 2 h</small></div></div></article>
        </div>
      </section>

      <section className="human-note section-wrap"><span className="human-icon"><Icon name="people" size={25}/></span><div className="human-copy"><h3>La decisión sigue siendo humana.</h3><p>La puntuación orienta la revisión. Tu equipo registra la decisión final.</p></div><div className="human-points"><span><Icon name="check" size={17}/> Criterios definidos<br/> por el reclutador</span><span><Icon name="check" size={17}/> Evidencias<br/> consultables</span><span><Icon name="check" size={17}/> Accesos por rol</span></div></section>
      <section className="final-cta section-wrap" id="contacto"><div><h2>Conoce tu próximo espacio de reclutamiento.</h2><p>Descubre cómo encaja en el trabajo de tu equipo.</p></div><a className="button" href="/resumen">Explorar demo <Icon name="arrow" size={17}/></a><div className="cta-contours" aria-hidden="true"/></section>
      <footer className="footer section-wrap"><Brand/><nav aria-label="Enlaces de pie de página"><a href="#contacto">Contacto</a><a href="/login">Iniciar sesión</a></nav></footer>
    </main>
  );
}




