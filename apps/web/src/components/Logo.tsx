import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link className="brand" to="/" aria-label="SmartRecruit TI - Inicio">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 28 28" role="img">
          <path d="M7 5.5h8.4a5.1 5.1 0 0 1 0 10.2H11" />
          <path d="M7 10.6h7.2a5.9 5.9 0 0 1 0 11.8H7z" />
          <path d="M5 5.5h2v16.9H5z" />
        </svg>
      </span>
      <span>SmartRecruit <strong>TI</strong></span>
    </Link>
  )
}
