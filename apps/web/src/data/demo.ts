export type CandidatoDemo = {
  id: number
  nombre: string
  iniciales: string
  correo: string
  telefono: string
  perfil: string
  vacante: string
  ubicacion: string
  experiencia: string
  score: number
  estado: 'Preseleccionado' | 'En revisión' | 'No seleccionado'
  habilidades: string[]
  fortalezas: string[]
  brechas: string[]
  fecha: string
}

export const candidatosDemo: CandidatoDemo[] = [
  {
    id: 1,
    nombre: 'María Fernanda Ruiz',
    iniciales: 'MR',
    correo: 'maria.ruiz@demo.local',
    telefono: '+51 987 321 450',
    perfil: 'Frontend Developer',
    vacante: 'Desarrollador Frontend React',
    ubicacion: 'Lima, Perú',
    experiencia: '4 años',
    score: 94,
    estado: 'Preseleccionado',
    habilidades: ['React', 'TypeScript', 'Figma', 'Testing'],
    fortalezas: ['React y TypeScript por encima del nivel requerido', 'Experiencia comprobada construyendo interfaces responsivas', 'Buenas prácticas de testing y accesibilidad'],
    brechas: ['Experiencia limitada con Azure DevOps'],
    fecha: '2026-09-20',
  },
  {
    id: 2,
    nombre: 'Carlos Mendoza Salazar',
    iniciales: 'CM',
    correo: 'carlos.mendoza@demo.local',
    telefono: '+51 955 732 118',
    perfil: 'Backend Developer',
    vacante: 'Backend Python / FastAPI',
    ubicacion: 'Arequipa, Perú',
    experiencia: '5 años',
    score: 89,
    estado: 'Preseleccionado',
    habilidades: ['Python', 'FastAPI', 'SQL Server', 'Docker'],
    fortalezas: ['Dominio de Python y APIs REST', 'Experiencia con SQL Server', 'Buenas prácticas de seguridad de API'],
    brechas: ['Nivel intermedio en servicios de Azure'],
    fecha: '2026-09-19',
  },
  {
    id: 3,
    nombre: 'Lucía Torres Vega',
    iniciales: 'LT',
    correo: 'lucia.torres@demo.local',
    telefono: '+51 944 801 922',
    perfil: 'Data Analyst',
    vacante: 'Analista de Datos TI',
    ubicacion: 'Lima, Perú',
    experiencia: '3 años',
    score: 82,
    estado: 'En revisión',
    habilidades: ['Python', 'Power BI', 'SQL', 'Excel'],
    fortalezas: ['Buen dominio de visualización y SQL', 'Experiencia preparando indicadores de negocio'],
    brechas: ['Poca experiencia con modelos de machine learning', 'Inglés técnico en nivel intermedio'],
    fecha: '2026-09-18',
  },
  {
    id: 4,
    nombre: 'Jorge Paredes León',
    iniciales: 'JP',
    correo: 'jorge.paredes@demo.local',
    telefono: '+51 933 210 744',
    perfil: 'Full Stack Developer',
    vacante: 'Desarrollador Full Stack',
    ubicacion: 'Trujillo, Perú',
    experiencia: '2 años',
    score: 76,
    estado: 'En revisión',
    habilidades: ['React', 'Node.js', 'PostgreSQL'],
    fortalezas: ['Perfil versátil y proyectos personales relevantes', 'Buen manejo de Git'],
    brechas: ['Experiencia profesional menor a la requerida', 'Sin evidencia de despliegues en Azure'],
    fecha: '2026-09-17',
  },
  {
    id: 5,
    nombre: 'Andrea Castillo Díaz',
    iniciales: 'AC',
    correo: 'andrea.castillo@demo.local',
    telefono: '+51 922 418 305',
    perfil: 'QA Engineer',
    vacante: 'QA Automation Engineer',
    ubicacion: 'Lima, Perú',
    experiencia: '3 años',
    score: 68,
    estado: 'No seleccionado',
    habilidades: ['Selenium', 'Postman', 'Jira'],
    fortalezas: ['Experiencia sólida en pruebas funcionales', 'Conocimiento de APIs'],
    brechas: ['Automatización limitada en Playwright', 'No acredita experiencia con pipelines CI/CD'],
    fecha: '2026-09-15',
  },
]

export const competenciasDemo = [
  { nombre: 'React / Frontend', categoria: 'Técnica', peso: 25, nivel: 'Avanzado' },
  { nombre: 'Python / Backend', categoria: 'Técnica', peso: 25, nivel: 'Avanzado' },
  { nombre: 'Base de datos SQL', categoria: 'Técnica', peso: 20, nivel: 'Intermedio' },
  { nombre: 'Cloud / Azure', categoria: 'Técnica', peso: 15, nivel: 'Intermedio' },
  { nombre: 'Comunicación', categoria: 'Blanda', peso: 8, nivel: 'Intermedio' },
  { nombre: 'Trabajo en equipo', categoria: 'Blanda', peso: 7, nivel: 'Intermedio' },
]
