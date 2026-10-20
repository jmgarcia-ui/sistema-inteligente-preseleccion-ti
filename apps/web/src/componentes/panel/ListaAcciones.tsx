import { Link } from "react-router-dom";
import type { Accion } from "../../tipos/panel";
import { momentoCorto } from "../../utilidades/panel";

type Propiedades = {
  acciones: Accion[];
  //compacta: para la bitácora del resumen y el historial de una ficha (sin enlaces)
  compacta?: boolean;
  //cuando la lista ya está agrupada por día, basta la hora
  soloHora?: boolean;
};

//el color de la marca dice qué clase de acción fue; el texto siempre lo explica
function claseDe(accion: Accion) {
  if (accion.tipo === "decision") {
    if (accion.descripcion.startsWith("Preseleccionó")) return "accion--verde";
    if (accion.descripcion.startsWith("Descartó")) return "accion--gris";
    return "accion--ambar";
  }
  if (accion.tipo === "correo_enviado") return "accion--verde";
  if (accion.tipo === "correo_fallido" || accion.tipo === "analisis_error") return "accion--ambar";
  if (accion.tipo.startsWith("vacante_")) return "accion--tinta";
  return "accion--sistema";
}

//una lista de acciones del registro: cuándo, qué pasó, quién y el detalle (motivo, asunto...)
export default function ListaAcciones({ acciones, compacta = false, soloHora = false }: Propiedades) {
  return (
    <ol className={`acciones ${compacta ? "acciones--compacta" : ""}`}>
      {acciones.map((accion) => (
        <li className={`accion ${claseDe(accion)}`} key={accion.id}>
          <time dateTime={accion.creado_en}>{momentoCorto(accion.creado_en, soloHora)}</time>
          <span className="accion__marca" aria-hidden="true" />
          <div className="accion__cuerpo">
            <p className="accion__texto">{accion.descripcion}</p>
            {accion.detalle && <p className="accion__detalle">“{accion.detalle}”</p>}
            <p className="accion__pie">
              {accion.autor}
              {!compacta &&
                (accion.id_postulacion ? (
                  <Link to={`/reclutador/candidatos?postulacion=${accion.id_postulacion}`}>Ver candidato</Link>
                ) : (
                  <Link to={`/reclutador/vacantes/${accion.id_vacante}/editar`}>Ver vacante</Link>
                ))}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
