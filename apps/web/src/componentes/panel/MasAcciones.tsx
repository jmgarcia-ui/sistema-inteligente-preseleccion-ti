import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreVertical } from "lucide-react";

//el botón ⋮ con las acciones menos frecuentes; se cierra al elegir, al hacer clic fuera o con Escape
export default function MasAcciones({ titulo, children }: { titulo: string; children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alHacerClic = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", alHacerClic);
    document.addEventListener("keydown", alPulsar);
    return () => {
      document.removeEventListener("mousedown", alHacerClic);
      document.removeEventListener("keydown", alPulsar);
    };
  }, [abierto]);

  return (
    <div className="mas-acciones" ref={contenedor}>
      <button
        className="mas-acciones__boton"
        type="button"
        aria-label={`Más acciones para ${titulo}`}
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((actual) => !actual)}>
        <MoreVertical size={18} aria-hidden="true" />
      </button>
      {abierto && (
        <div className="mas-acciones__menu" role="menu" onClick={() => setAbierto(false)}>
          {children}
        </div>
      )}
    </div>
  );
}
