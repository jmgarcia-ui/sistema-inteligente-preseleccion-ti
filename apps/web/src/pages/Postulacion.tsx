import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Brand, Icon } from './Inicio'
import { useDemo, vacanteDelEnlace } from '../demoData'

export default function Postulacion() {
  const { vacantePublicaId = '' } = useParams()
  const ubicacion = useLocation()
  const { vacantes, registrarPostulacion } = useDemo()
  const vacante = vacantes.find(item => item.id === vacantePublicaId) ?? vacanteDelEnlace(vacantePublicaId, ubicacion.search)
  const [paso, setPaso] = useState<'detalle' | 'formulario' | 'confirmacion'>('detalle')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [codigo, setCodigo] = useState('')

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!vacante) return
    const datos = new FormData(evento.currentTarget)
    const nombre = String(datos.get('nombre') ?? '').trim()
    const correo = String(datos.get('correo') ?? '').trim()
    if (!nombre || !correo || !archivo || !datos.get('consentimiento')) {
      setError('Completa tus datos, adjunta tu currículum y acepta el tratamiento de datos.')
      return
    }
    if (archivo.size > 8 * 1024 * 1024) { setError('El currículum debe pesar menos de 8 MB.'); return }
    setCodigo(registrarPostulacion(vacante.id, nombre))
    setError('')
    setPaso('confirmacion')
  }

  return <div className="candidate-page">
    <header className="candidate-header"><Brand inverse /><Link to="/">Oportunidades</Link></header>
    {!vacante ? <main className="candidate-main"><section className="candidate-card"><h1>Enlace no disponible</h1><p>Esta vacante de prueba no está disponible en este navegador.</p><Link className="demo-primary" to="/">Volver al inicio</Link></section></main> : paso === 'confirmacion' ? <main className="candidate-main candidate-confirmation"><section className="candidate-card"><span className="demo-success-mark"><Icon name="check" size={33} /></span><h1>¡Postulación enviada!</h1><p>Registramos una postulación de prueba para <b>{vacante.titulo}</b>. El currículum no se subió a ningún servidor ni se guardó en una base de datos.</p><div className="candidate-code">Código de prueba: <b>{codigo}</b></div><Link className="demo-primary" to="/">Volver al inicio</Link></section></main> : paso === 'formulario' ? <main className="candidate-main"><button className="candidate-back" type="button" onClick={() => setPaso('detalle')}>← Volver a la vacante</button><h1>Postular a {vacante.titulo}</h1><div className="candidate-progress"><span className="active">1 &nbsp; Tu postulación</span><i /><span>2 &nbsp; Confirmación</span></div><div className="candidate-form-grid"><form className="candidate-card candidate-form" onSubmit={enviar}><label>Nombre completo <input name="nombre" autoComplete="name" placeholder="Nombre y apellido de prueba" required /></label><label>Correo electrónico <input name="correo" type="email" autoComplete="email" placeholder="correo@ejemplo.com" required /></label><label>Teléfono <small>(opcional)</small><input name="telefono" autoComplete="tel" placeholder="+51 999 999 999" /></label><label>Currículum</label><label className="candidate-file"><Icon name="document" size={28} /><span>Adjunta un archivo para continuar</span><strong>{archivo ? archivo.name : 'Seleccionar archivo'}</strong><input type="file" accept=".pdf,.doc,.docx" onChange={evento => setArchivo(evento.target.files?.[0] ?? null)} required /></label><p className="candidate-file-note">El archivo se valida en esta pantalla y no se sube al backend.</p><label className="candidate-consent"><input type="checkbox" name="consentimiento" required /><span>Acepto el tratamiento de mis datos para esta demostración local.</span></label>{error && <p className="demo-form-error" role="alert">{error}</p>}<div className="demo-inline-actions"><button type="submit" className="demo-primary">Enviar postulación de prueba</button><button type="button" className="demo-text-button" onClick={() => setPaso('detalle')}>Cancelar</button></div></form><aside className="candidate-side"><section className="demo-dark-card"><span className="demo-square-icon"><Icon name="code" size={25} /></span><h2>{vacante.titulo}</h2><p>{vacante.modalidad} · {vacante.ubicacion}</p><p>{vacante.jornada}</p></section><section className="candidate-card"><h3>Antes de enviar</h3><p>✓ Revisa tu correo de contacto.</p><p>✓ Adjunta un currículum actualizado.</p><p>✓ Usa datos ficticios en esta demo.</p></section></aside></div></main> : <main className="candidate-main"><div className="candidate-breadcrumb"><Link to="/">Oportunidades</Link><span>/</span>{vacante.area}</div><h1>{vacante.titulo}</h1><p className="candidate-subtitle">{vacante.area}</p><div className="candidate-banner"><span className="demo-square-icon"><Icon name="code" size={28} /></span><h2>{vacante.titulo}</h2><span>{vacante.modalidad}</span><span>{vacante.ubicacion}</span><span>{vacante.jornada}</span></div><div className="candidate-detail-grid"><section className="candidate-card"><h2>Sobre el puesto</h2><p>{vacante.descripcion}</p><hr /><h2>Tus responsabilidades</h2><ul>{vacante.responsabilidades.map((item, indice) => <li key={indice}>{item}</li>)}</ul><hr /><h2>Lo que buscamos</h2><ul>{vacante.requisitos.map((item, indice) => <li key={indice}>{item}</li>)}</ul></section><aside className="candidate-side"><section className="candidate-card"><h2>¿Te interesa esta vacante?</h2><p>Envía tus datos y tu currículum.</p><button type="button" className="demo-primary" onClick={() => setPaso('formulario')}>Postular a esta vacante</button><small>No necesitas crear una cuenta</small></section><section className="candidate-card"><span className="demo-metric-icon"><Icon name="shield" size={22} /></span><h3>Tus datos están protegidos</h3><p>Este recorrido es una demostración local. Ningún archivo se envía al servidor.</p></section></aside></div></main>}
  </div>
}
