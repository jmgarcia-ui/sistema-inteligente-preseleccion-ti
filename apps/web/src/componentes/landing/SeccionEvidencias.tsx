import { ExternalLink, FileText, MoreHorizontal } from "lucide-react";

const requisitos = [
  { nombre: "Experiencia backend", tipo: "confirmado" },
  { nombre: "Python o Go", tipo: "confirmado" },
  { nombre: "APIs REST y SQL", tipo: "revisar" },
];

const evidencias = [
  { nombre: "Proyecto en Python", origen: "GitHub · Hace 3 meses", tipo: "confirmado" },
  { nombre: "Implementación de APIs", origen: "Documento · 12 ene. 2024", tipo: "pendiente" },
  { nombre: "Trabajo con bases de datos", origen: "GitHub · 8 dic. 2023", tipo: "revisar" },
];

export default function SeccionEvidencias() {
  return (
    <section className="seccion-evidencias seccion-editorial" id="recursos" aria-labelledby="titulo-evidencias">
      <div className="seccion-editorial__mensaje">
        <span className="seccion-editorial__numero" aria-hidden="true">03</span>
        <div>
          <h2 id="titulo-evidencias">La evidencia explica cada decisión.</h2>
          <p>El servicio organiza la evidencia encontrada y muestra su origen. El equipo revisa la información antes de decidir.</p>
        </div>
      </div>

      <figure className="muestra-evidencias" aria-hidden="true">
        <div className="muestra-evidencias__ruta">Candidatos <span>›</span> Laura Méndez</div>
        <div className="muestra-evidencias__perfil">
          <span className="muestra-evidencias__avatar">LM</span>
          <div className="muestra-evidencias__identidad"><strong>Laura Méndez</strong><span>Desarrolladora Backend</span></div>
          <span className="muestra-evidencias__estado">● &nbsp; En revisión</span>
          <span className="muestra-evidencias__accion">Aprobar candidata</span>
          <MoreHorizontal className="muestra-evidencias__mas" size={16} aria-hidden="true" />
        </div>
        <div className="muestra-evidencias__pestanas">
          <span>Resumen</span><span>Experiencia</span><span>Educación</span><span>Habilidades</span><strong>Evidencias</strong>
        </div>
        <div className="muestra-evidencias__columnas">
          <div>
            <h3>Requisitos de la vacante</h3>
            <ul>
              {requisitos.map((requisito) => (
                <li key={requisito.nombre}>
                  <span className={`muestra-evidencias__check muestra-evidencias__check--${requisito.tipo}`}>✓</span>
                  {requisito.nombre}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Evidencia encontrada</h3>
            <ul>
              {evidencias.map((evidencia) => (
                <li key={evidencia.nombre}>
                  <FileText className={`muestra-evidencias__archivo muestra-evidencias__archivo--${evidencia.tipo}`} size={17} strokeWidth={1.8} />
                  <span><strong>{evidencia.nombre}</strong><small>{evidencia.origen}</small></span>
                  <ExternalLink className="muestra-evidencias__externo" size={13} strokeWidth={2} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </figure>
    </section>
  );
}
