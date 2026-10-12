import { Moon, Sun } from "lucide-react";

type Propiedades = {
  temaOscuro: boolean;
  alCambiar: () => void;
};

export default function BotonTema({ temaOscuro, alCambiar }: Propiedades) {
  return (
    <button
      className="boton-tema"
      type="button"
      aria-label={temaOscuro ? "Activar modo claro" : "Activar modo oscuro"}
      title={temaOscuro ? "Modo claro" : "Modo oscuro"}
      aria-pressed={temaOscuro}
      onClick={alCambiar}>
      {temaOscuro ? (
        <Sun size={18} strokeWidth={1.8} aria-hidden="true" />
      ) : (
        <Moon size={18} strokeWidth={1.8} aria-hidden="true" />
      )}
    </button>
  );
}
