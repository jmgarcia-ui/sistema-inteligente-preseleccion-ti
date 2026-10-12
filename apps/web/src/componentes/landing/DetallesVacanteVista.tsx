import { Check } from "lucide-react";

export default function DetallesVacanteVista() {
  return (
    <div className="vista-producto__formulario">
      <h3>Detalles de la vacante</h3>

      <div className="vista-producto__campo">
        <span className="vista-producto__etiqueta">Nombre del puesto</span>
        <strong className="vista-producto__valor">Desarrollador Backend</strong>
        <span className="vista-producto__verificacion vista-producto__verificacion--campo">
            <Check size={10} strokeWidth={3} />
        </span>
      </div>

      <div className="vista-producto__campos-cortos">
        <div className="vista-producto__campo">
          <span className="vista-producto__etiqueta">Área</span>
          <strong className="vista-producto__valor">Producto</strong>
          <span className="vista-producto__verificacion vista-producto__verificacion--campo">
            <Check size={10} strokeWidth={3} />
          </span>
        </div>

        <div className="vista-producto__campo">
          <span className="vista-producto__etiqueta">Nivel</span>
          <strong className="vista-producto__valor">Semi Senior</strong>
          <span className="vista-producto__verificacion vista-producto__verificacion--campo">
            <Check size={10} strokeWidth={3} />
          </span>
        </div>

        <div className="vista-producto__campo">
          <span className="vista-producto__etiqueta">Modalidad</span>
          <strong className="vista-producto__valor">Remoto</strong>
          <span className="vista-producto__verificacion vista-producto__verificacion--campo">
            <Check size={10} strokeWidth={3} />
          </span>
        </div>
      </div>

      <div className="vista-producto__campo">
        <span className="vista-producto__etiqueta">Descripción</span>
        <strong className="vista-producto__valor">
          Desarrollar y mantener servicios backend escalables, colaborando con el equipo de producto.
        </strong>
        <span className="vista-producto__verificacion vista-producto__verificacion--campo">
            <Check size={10} strokeWidth={3} />
        </span>
      </div>
    </div>
  );
}
