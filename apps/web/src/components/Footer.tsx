import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Logo />
          <p className="footer-copy">
            Preselección de talento TI con evaluación basada en competencias y criterios explicables.
          </p>
        </div>
        <div className="footer-links">
          <a href="/">Inicio</a>
          <a href="/vacantes">Vacantes</a>
          <a href="mailto:contacto@smartrecruitti.local">Contacto</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} SmartRecruit TI</span>
        <span>Proyecto académico · Ingeniería de Sistemas</span>
      </div>
    </footer>
  )
}
