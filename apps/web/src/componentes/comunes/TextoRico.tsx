import { aHtml } from "../../utilidades/textoRico";

type Propiedades = {
  texto: string;
  className?: string;
};

//muestra un texto del editor (o texto plano de antes); siempre pasa por el filtro de etiquetas permitidas
export default function TextoRico({ texto, className = "" }: Propiedades) {
  return <div className={`texto-rico ${className}`} dangerouslySetInnerHTML={{ __html: aHtml(texto) }} />;
}
