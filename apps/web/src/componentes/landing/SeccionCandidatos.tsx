import { MoreHorizontal, Search } from "lucide-react";

const candidatos = [
  { iniciales: "LM", nombre: "Laura Méndez", fecha: "2 ene. 2024", estado: "En revisión", tipo: "revision", actividad: "Hoy" },
  { iniciales: "CR", nombre: "Carlos Rodríguez", fecha: "26 dic. 2023", estado: "Pendiente", tipo: "pendiente", actividad: "Ayer" },
  { iniciales: "AT", nombre: "Ana Torres", fecha: "26 dic. 2023", estado: "Revisado", tipo: "revisado", actividad: "22 dic. 2023" },
  { iniciales: "DS", nombre: "Diego Sánchez", fecha: "20 dic. 2023", estado: "Pendiente", tipo: "pendiente", actividad: "20 dic. 2023" },
];

export default function SeccionCandidatos() {
  return (
    <section className="seccion-candidatos seccion-editorial" id="candidatos" aria-labelledby="titulo-candidatos">
      <figure className="muestra-candidatos" aria-hidden="true">
        <div className="muestra-candidatos__cabecera">
          <div>
            <strong>Candidatos</strong>
            <div className="muestra-candidatos__filtros">
              <span className="muestra-candidatos__filtro muestra-candidatos__filtro--activo">Todos <b>12</b></span>
              <span className="muestra-candidatos__filtro">En revisión <b>4</b></span>
              <span className="muestra-candidatos__filtro">Pendientes <b>4</b></span>
              <span className="muestra-candidatos__filtro">Revisados <b>3</b></span>
            </div>
          </div>
          <span className="muestra-candidatos__busqueda">Buscar candidatos… <Search size={14} strokeWidth={2} /></span>
        </div>
        <div className="muestra-candidatos__tabla">
          <div className="muestra-candidatos__fila muestra-candidatos__fila--titulos">
            <span>Candidato</span><span>Postulación</span><span>Estado</span><span>Última actividad</span><span />
          </div>
          {candidatos.map((candidato) => (
            <div className="muestra-candidatos__fila" key={candidato.nombre}>
              <span className="muestra-candidatos__persona"><b>{candidato.iniciales}</b>{candidato.nombre}</span>
              <span>{candidato.fecha}</span>
              <span><i className={`muestra-candidatos__estado muestra-candidatos__estado--${candidato.tipo}`}>{candidato.estado}</i></span>
              <span>{candidato.actividad}</span>
              <MoreHorizontal size={15} strokeWidth={2} />
            </div>
          ))}
        </div>
      </figure>

      <div className="seccion-editorial__mensaje">
        <span className="seccion-editorial__numero" aria-hidden="true">02</span>
        <div>
          <h2 id="titulo-candidatos">Las postulaciones permanecen en contexto.</h2>
          <p className="seccion-candidatos__cifra"><strong>12</strong> postulaciones</p>
          <p>Consulta el estado, evidencia disponible y actividad reciente sin perder el contexto del proceso.</p>
        </div>
      </div>
    </section>
  );
}
