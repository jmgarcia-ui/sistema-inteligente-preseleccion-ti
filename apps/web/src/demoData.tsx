import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type EstadoVacante = 'Activa' | 'Borrador' | 'Cerrada'
export type EstadoCandidato = 'Por revisar' | 'En revisión' | 'Finalista' | 'Descartado'
export type VacanteDemo = {
  id: string
  titulo: string
  area: string
  modalidad: string
  ubicacion: string
  jornada: string
  descripcion: string
  responsabilidades: string[]
  requisitos: string[]
  competencias: string[]
  estado: EstadoVacante
  postulaciones: number
  porRevisar: number
  creada: string
}
export type CandidatoDemo = {
  id: string
  nombre: string
  vacanteId: string
  puntaje: number | null
  estado: EstadoCandidato
  experiencia: string
  ubicacion: string
  competencias: { nombre: string; valor: number }[]
  fortalezas: string[]
  brechas: string[]
  evidencias: string[]
}
export type ActividadDemo = {
  id: string
  titulo: string
  detalle: string
  tipo: 'Postulación' | 'Evaluación' | 'Decisión' | 'Vacante'
  fecha: string
  vacanteId?: string
  candidatoId?: string
}
type DemoState = { vacantes: VacanteDemo[]; candidatos: CandidatoDemo[]; actividad: ActividadDemo[] }
export type NuevaVacante = Omit<VacanteDemo, 'id' | 'postulaciones' | 'porRevisar' | 'creada'>

const hace = (minutos: number) => new Date(Date.now() - minutos * 60_000).toISOString()
const semilla: DemoState = {
  vacantes: [
    { id: 'backend', titulo: 'Desarrollador Backend', area: 'Tecnología', modalidad: 'Remoto', ubicacion: 'Lima, Perú', jornada: 'Tiempo completo', descripcion: 'Desarrolla APIs y contribuye al mantenimiento de nuestros servicios backend.', responsabilidades: ['Crear y mantener APIs REST.', 'Colaborar con el equipo de producto.', 'Asegurar la calidad del código.'], requisitos: ['3 años de experiencia en desarrollo backend.', 'Node.js y TypeScript a nivel intermedio.', 'Conocimientos de Azure deseables.'], competencias: ['Node.js', 'TypeScript', 'Azure', 'SQL Server'], estado: 'Activa', postulaciones: 48, porRevisar: 10, creada: hace(60 * 24 * 12) },
    { id: 'devops', titulo: 'Ingeniero DevOps', area: 'Tecnología', modalidad: 'Remoto', ubicacion: 'Bogotá, Colombia', jornada: 'Tiempo completo', descripcion: 'Ayuda a automatizar despliegues y a mejorar la confiabilidad de la plataforma.', responsabilidades: ['Mantener pipelines de CI/CD.', 'Automatizar infraestructura.', 'Colaborar en la observabilidad de servicios.'], requisitos: ['Experiencia con Azure y Docker.', 'Conocimientos de Terraform.', 'Buenas prácticas de seguridad.'], competencias: ['Azure', 'Docker', 'Terraform'], estado: 'Activa', postulaciones: 29, porRevisar: 6, creada: hace(60 * 24 * 9) },
    { id: 'datos', titulo: 'Analista de Datos', area: 'Datos', modalidad: 'Híbrido', ubicacion: 'Lima, Perú', jornada: 'Tiempo completo', descripcion: 'Convierte datos en información clara para los equipos de negocio.', responsabilidades: ['Preparar reportes y tableros.', 'Analizar tendencias.', 'Documentar hallazgos.'], requisitos: ['SQL intermedio.', 'Experiencia con Power BI.', 'Python deseable.'], competencias: ['SQL', 'Power BI', 'Python'], estado: 'Activa', postulaciones: 34, porRevisar: 8, creada: hace(60 * 24 * 7) },
    { id: 'producto', titulo: 'Diseñador de Producto', area: 'Diseño', modalidad: 'Híbrido', ubicacion: 'Lima, Perú', jornada: 'Tiempo completo', descripcion: 'Diseña experiencias útiles y accesibles para nuestros productos digitales.', responsabilidades: ['Crear flujos y prototipos.', 'Colaborar con producto e ingeniería.'], requisitos: ['Experiencia con Figma.', 'Conocimiento de diseño de interacción.'], competencias: ['Figma', 'UX', 'Investigación'], estado: 'Borrador', postulaciones: 0, porRevisar: 0, creada: hace(60 * 24 * 2) },
    { id: 'ciberseguridad', titulo: 'Especialista en Ciberseguridad', area: 'Seguridad', modalidad: 'Presencial', ubicacion: 'Bogotá, Colombia', jornada: 'Tiempo completo', descripcion: 'Acompaña la protección de los sistemas y la gestión de riesgos.', responsabilidades: ['Revisar controles de seguridad.', 'Documentar riesgos.'], requisitos: ['Experiencia en seguridad de aplicaciones.', 'Conocimientos de nube.'], competencias: ['Seguridad', 'Azure'], estado: 'Cerrada', postulaciones: 16, porRevisar: 0, creada: hace(60 * 24 * 30) },
    { id: 'frontend', titulo: 'Desarrollador Frontend', area: 'Tecnología', modalidad: 'Remoto', ubicacion: 'Lima, Perú', jornada: 'Tiempo completo', descripcion: 'Construye interfaces accesibles y fáciles de usar.', responsabilidades: ['Implementar pantallas en React.', 'Trabajar con diseño y backend.'], requisitos: ['React y TypeScript.', 'Conocimientos de accesibilidad web.'], competencias: ['React', 'TypeScript', 'CSS'], estado: 'Borrador', postulaciones: 0, porRevisar: 0, creada: hace(60 * 24) },
  ],
  candidatos: [
    { id: 'andres', nombre: 'Andrés Salamanca', vacanteId: 'backend', puntaje: 94, estado: 'Por revisar', experiencia: '6 años de experiencia', ubicacion: 'Lima, Perú', competencias: [{ nombre: 'Node.js', valor: 96 }, { nombre: 'TypeScript', valor: 92 }, { nombre: 'Azure', valor: 85 }, { nombre: 'SQL Server', valor: 80 }], fortalezas: ['APIs REST', 'Microservicios'], brechas: ['CI/CD avanzado', 'Pruebas automatizadas'], evidencias: ['Proyecto de servicios', 'Plataforma de pagos'] },
    { id: 'camila', nombre: 'Camila Rojas', vacanteId: 'backend', puntaje: 90, estado: 'En revisión', experiencia: '5 años de experiencia', ubicacion: 'Lima, Perú', competencias: [{ nombre: 'Node.js', valor: 91 }, { nombre: 'TypeScript', valor: 89 }, { nombre: 'Azure', valor: 82 }], fortalezas: ['Arquitectura de APIs', 'Trabajo en equipo'], brechas: ['SQL Server avanzado'], evidencias: ['API de inventario', 'Integración en Azure'] },
    { id: 'david', nombre: 'David Muñoz', vacanteId: 'devops', puntaje: 88, estado: 'Por revisar', experiencia: '7 años de experiencia', ubicacion: 'Bogotá, Colombia', competencias: [{ nombre: 'Azure', valor: 92 }, { nombre: 'Docker', valor: 90 }, { nombre: 'Terraform', valor: 81 }], fortalezas: ['Automatización', 'Contenedores'], brechas: ['Documentación de procesos'], evidencias: ['Pipeline de despliegue'] },
    { id: 'laura', nombre: 'Laura Méndez', vacanteId: 'datos', puntaje: 85, estado: 'Finalista', experiencia: '4 años de experiencia', ubicacion: 'Lima, Perú', competencias: [{ nombre: 'SQL', valor: 90 }, { nombre: 'Power BI', valor: 88 }, { nombre: 'Python', valor: 76 }], fortalezas: ['Visualización', 'Modelado de datos'], brechas: ['Automatización avanzada'], evidencias: ['Tablero comercial'] },
    { id: 'juan', nombre: 'Juan Pablo Ortiz', vacanteId: 'backend', puntaje: 82, estado: 'En revisión', experiencia: '4 años de experiencia', ubicacion: 'Arequipa, Perú', competencias: [{ nombre: 'Node.js', valor: 86 }, { nombre: 'TypeScript', valor: 84 }, { nombre: 'Azure', valor: 69 }], fortalezas: ['APIs REST'], brechas: ['Azure avanzado'], evidencias: ['Servicio de reservas'] },
    { id: 'sofia', nombre: 'Sofía Ramírez', vacanteId: 'backend', puntaje: 78, estado: 'Descartado', experiencia: '3 años de experiencia', ubicacion: 'Trujillo, Perú', competencias: [{ nombre: 'Node.js', valor: 81 }, { nombre: 'TypeScript', valor: 77 }, { nombre: 'Azure', valor: 65 }], fortalezas: ['Backend'], brechas: ['Experiencia en nube'], evidencias: ['API de catálogo'] },
  ],
  actividad: [
    { id: 'a1', titulo: 'Nueva postulación recibida', detalle: 'Camila Rojas · Desarrollador Backend', tipo: 'Postulación', fecha: hace(12), vacanteId: 'backend', candidatoId: 'camila' },
    { id: 'a2', titulo: 'Evaluación completada', detalle: 'Andrés Salamanca · Desarrollador Backend', tipo: 'Evaluación', fecha: hace(45), vacanteId: 'backend', candidatoId: 'andres' },
    { id: 'a3', titulo: 'Decisión registrada: Finalista', detalle: 'Laura Méndez · Analista de Datos', tipo: 'Decisión', fecha: hace(120), vacanteId: 'datos', candidatoId: 'laura' },
    { id: 'a4', titulo: 'Vacante publicada', detalle: 'Ingeniero DevOps', tipo: 'Vacante', fecha: hace(240), vacanteId: 'devops' },
    { id: 'a5', titulo: 'Decisión registrada: No continúa', detalle: 'Sofía Ramírez · Desarrollador Backend', tipo: 'Decisión', fecha: hace(60 * 24 + 20), vacanteId: 'backend', candidatoId: 'sofia' },
    { id: 'a6', titulo: 'Descripción generada', detalle: 'Analista de Datos', tipo: 'Vacante', fecha: hace(60 * 24 + 240), vacanteId: 'datos' },
  ],
}

const CLAVE = 'reclutamiento-demo-v1'
function cargar(): DemoState {
  try {
    const guardado = window.localStorage.getItem(CLAVE)
    if (guardado) {
      const datos = JSON.parse(guardado) as DemoState
      if (Array.isArray(datos.vacantes) && Array.isArray(datos.candidatos) && Array.isArray(datos.actividad)) return datos
    }
  } catch { /* Usa la semilla cuando el navegador no permite almacenamiento. */ }
  return semilla
}

type DemoContextValue = DemoState & {
  crearVacante: (datos: NuevaVacante) => VacanteDemo
  cambiarEstadoVacante: (id: string, estado: EstadoVacante) => void
  cambiarEstadoCandidato: (id: string, estado: EstadoCandidato) => void
  registrarPostulacion: (idVacante: string, nombre: string) => string
}
const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<DemoState>(cargar)
  useEffect(() => {
    try { window.localStorage.setItem(CLAVE, JSON.stringify(datos)) } catch { /* La demo sigue funcionando en esta pestaña. */ }
  }, [datos])

  function crearVacante(entrada: NuevaVacante): VacanteDemo {
    const vacante: VacanteDemo = { ...entrada, id: `demo-${crypto.randomUUID()}`, postulaciones: 0, porRevisar: 0, creada: new Date().toISOString() }
    const actividad: ActividadDemo = { id: crypto.randomUUID(), titulo: entrada.estado === 'Activa' ? 'Vacante publicada' : 'Borrador creado', detalle: vacante.titulo, tipo: 'Vacante', fecha: new Date().toISOString(), vacanteId: vacante.id }
    setDatos(actual => ({ ...actual, vacantes: [vacante, ...actual.vacantes], actividad: [actividad, ...actual.actividad] }))
    return vacante
  }
  function cambiarEstadoVacante(id: string, estado: EstadoVacante) {
    setDatos(actual => {
      const vacante = actual.vacantes.find(item => item.id === id)
      if (!vacante || vacante.estado === estado) return actual
      const actividad: ActividadDemo = { id: crypto.randomUUID(), titulo: `Vacante ${estado.toLowerCase()}`, detalle: vacante.titulo, tipo: 'Vacante', fecha: new Date().toISOString(), vacanteId: id }
      return { ...actual, vacantes: actual.vacantes.map(item => item.id === id ? { ...item, estado } : item), actividad: [actividad, ...actual.actividad] }
    })
  }
  function cambiarEstadoCandidato(id: string, estado: EstadoCandidato) {
    setDatos(actual => {
      const candidato = actual.candidatos.find(item => item.id === id)
      if (!candidato || candidato.estado === estado) return actual
      const actividad: ActividadDemo = { id: crypto.randomUUID(), titulo: `Decisión registrada: ${estado}`, detalle: candidato.nombre, tipo: 'Decisión', fecha: new Date().toISOString(), vacanteId: candidato.vacanteId, candidatoId: id }
      return { ...actual, candidatos: actual.candidatos.map(item => item.id === id ? { ...item, estado } : item), actividad: [actividad, ...actual.actividad] }
    })
  }
  function registrarPostulacion(idVacante: string, nombre: string): string {
    const id = `post-${crypto.randomUUID().slice(0, 8)}`
    const candidato: CandidatoDemo = { id, nombre, vacanteId: idVacante, puntaje: null, estado: 'Por revisar', experiencia: 'Pendiente de evaluación', ubicacion: 'No indicada', competencias: [], fortalezas: [], brechas: [], evidencias: ['Currículum recibido en esta demo'] }
    const actividad: ActividadDemo = { id: crypto.randomUUID(), titulo: 'Nueva postulación recibida', detalle: nombre, tipo: 'Postulación', fecha: new Date().toISOString(), vacanteId: idVacante, candidatoId: id }
    setDatos(actual => ({ vacantes: actual.vacantes.map(item => item.id === idVacante ? { ...item, postulaciones: item.postulaciones + 1, porRevisar: item.porRevisar + 1 } : item), candidatos: [candidato, ...actual.candidatos], actividad: [actividad, ...actual.actividad] }))
    return id
  }
  return <DemoContext.Provider value={{ ...datos, crearVacante, cambiarEstadoVacante, cambiarEstadoCandidato, registrarPostulacion }}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const contexto = useContext(DemoContext)
  if (!contexto) throw new Error('La demo no está disponible')
  return contexto
}
export function tiempoRelativo(fecha: string) {
  const minutos = Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 60_000))
  if (minutos < 60) return `Hace ${minutos} min`
  if (minutos < 1440) return `Hace ${Math.floor(minutos / 60)} h`
  return `Hace ${Math.floor(minutos / 1440)} d`
}
export function enlaceCandidato(vacante: VacanteDemo) {
  const publicos = { titulo: vacante.titulo, area: vacante.area, modalidad: vacante.modalidad, ubicacion: vacante.ubicacion, jornada: vacante.jornada, descripcion: vacante.descripcion, responsabilidades: vacante.responsabilidades, requisitos: vacante.requisitos, competencias: vacante.competencias }
  return `${window.location.origin}/postular/${vacante.id}?demo=${encodeURIComponent(JSON.stringify(publicos))}`
}
export function vacanteDelEnlace(id: string, busqueda: string): VacanteDemo | null {
  try {
    const crudo = new URLSearchParams(busqueda).get('demo')
    if (!crudo) return null
    const datos = JSON.parse(crudo) as Partial<VacanteDemo>
    if (typeof datos.titulo !== 'string' || typeof datos.descripcion !== 'string') return null
    return { id, titulo: datos.titulo, area: datos.area || 'Tecnología', modalidad: datos.modalidad || 'Remoto', ubicacion: datos.ubicacion || 'Lima, Perú', jornada: datos.jornada || 'Tiempo completo', descripcion: datos.descripcion, responsabilidades: Array.isArray(datos.responsabilidades) ? datos.responsabilidades : [], requisitos: Array.isArray(datos.requisitos) ? datos.requisitos : [], competencias: Array.isArray(datos.competencias) ? datos.competencias : [], estado: 'Activa', postulaciones: 0, porRevisar: 0, creada: new Date().toISOString() }
  } catch { return null }
}
