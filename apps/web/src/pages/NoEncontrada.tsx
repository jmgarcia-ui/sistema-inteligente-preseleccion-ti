import { Link } from 'react-router-dom'

export default function NoEncontrada() {
  return (
    <section className="shell not-found">
      <span>404</span>
      <h1>Página no encontrada</h1>
      <p>La ruta que intentas abrir no existe o fue movida.</p>
      <Link className="button button-primary" to="/">Volver al inicio</Link>
    </section>
  )
}
