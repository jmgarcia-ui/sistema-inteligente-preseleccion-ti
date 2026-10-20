import DOMPurify from "dompurify";

//lo mismo que permite la API: párrafos, negrita, cursiva, listas y enlaces
const ETIQUETAS = ["p", "br", "strong", "em", "u", "ul", "ol", "li", "a"];

//los textos de antes del editor son texto plano; los nuevos empiezan con una etiqueta
function esHtml(texto: string) {
  return texto.trimStart().startsWith("<");
}

function escapar(texto: string) {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

//texto plano o HTML → HTML seguro para mostrar o para cargar en el editor
export function aHtml(texto: string) {
  if (!esHtml(texto)) {
    return texto
      .trim()
      .split(/\n{2,}/)
      .filter((parrafo) => parrafo.trim())
      .map((parrafo) => `<p>${escapar(parrafo.trim()).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }
  return DOMPurify.sanitize(texto, { ALLOWED_TAGS: ETIQUETAS, ALLOWED_ATTR: ["href", "target", "rel"] });
}

//solo el texto, sin etiquetas: para contar caracteres y validar
export function aTexto(texto: string) {
  if (!esHtml(texto)) return texto.trim();
  const plantilla = document.createElement("template");
  plantilla.innerHTML = aHtml(texto);
  return (plantilla.content.textContent ?? "").trim();
}

//los enlaces del texto se abren en otra pestaña
DOMPurify.addHook("afterSanitizeAttributes", (nodo) => {
  if (nodo.tagName === "A") {
    nodo.setAttribute("target", "_blank");
    nodo.setAttribute("rel", "noopener noreferrer");
  }
});
