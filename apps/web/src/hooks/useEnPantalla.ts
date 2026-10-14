import { useEffect, useState, type RefObject } from "react";

//indica si un elemento esta en pantalla; con "unaVez" deja de observar al aparecer
export function useEnPantalla(referencia: RefObject<Element | null>, umbral = 0.35, unaVez = false) {
  const [enPantalla, setEnPantalla] = useState(false);

  useEffect(() => {
    const elemento = referencia.current;
    if (!elemento) return;
    const observador = new IntersectionObserver(([entrada]) => {
      setEnPantalla(entrada.isIntersecting);
      if (unaVez && entrada.isIntersecting) observador.disconnect();
    }, { threshold: umbral });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [referencia, umbral, unaVez]);

  return enPantalla;
}

export function prefiereMenosMovimiento() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
