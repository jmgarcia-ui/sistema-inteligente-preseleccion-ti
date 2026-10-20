import { useCallback, useSyncExternalStore } from "react";

const CLAVE_TEMA = "tema-visual";

//la única fuente de verdad es el atributo data-tema de <html> (index.html lo pone antes del primer pintado);
//todo componente que use este hook se entera cuando cambia, aunque lo haya cambiado otro
function suscribir(avisar: () => void) {
  const observador = new MutationObserver(avisar);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  return () => observador.disconnect();
}

function leerTemaOscuro() {
  return document.documentElement.dataset.tema === "oscuro";
}

export default function useTema() {
  const temaOscuro = useSyncExternalStore(suscribir, leerTemaOscuro);

  const alternarTema = useCallback(() => {
    const siguiente = leerTemaOscuro() ? "claro" : "oscuro";
    document.documentElement.dataset.tema = siguiente;
    try {
      localStorage.setItem(CLAVE_TEMA, siguiente);
    } catch {
      /* El cambio sigue disponible si el navegador bloquea el almacenamiento. */
    }
  }, []);

  return { temaOscuro, alternarTema };
}
