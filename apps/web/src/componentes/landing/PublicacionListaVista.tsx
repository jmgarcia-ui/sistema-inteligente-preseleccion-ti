import { Check } from "lucide-react";

export default function PublicacionListaVista() {
  return (
    <div className="vista-producto__publicacion">
      <h3>Publicación lista</h3>

      <ul className="vista-producto__lista">
        <li>
          <span className="vista-producto__verificacion"><Check size={10} strokeWidth={3} /></span>
          <div className="vista-producto__detalle">
            <strong>Sobre el rol</strong>
            <span>Desarrollar y mantener servicios backend escalables.</span>
          </div>
        </li>

        <li>
          <span className="vista-producto__verificacion"><Check size={10} strokeWidth={3} /></span>
          <div className="vista-producto__detalle">
            <strong>Requisitos principales</strong>
            <span>Experiencia con APIs, bases de datos y arquitectura de servicios.</span>
          </div>
        </li>

        <li>
          <span className="vista-producto__verificacion"><Check size={10} strokeWidth={3} /></span>
          <div className="vista-producto__detalle">
            <strong>Beneficios</strong>
            <span>Trabajo remoto, horario flexible y equipo colaborativo.</span>
          </div>
        </li>
      </ul>
    </div>
  );
}
