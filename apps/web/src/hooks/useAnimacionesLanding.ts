import { useEffect } from "react";

export function useAnimacionesLanding() {
  useEffect(() => {
    const franja = document.querySelector<HTMLElement>(".franja-proceso");
    if (!franja || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let enPantalla = false;
    const actualizarMovimiento = () => franja.classList.toggle("franja-proceso--activa", enPantalla && !document.hidden);
    const observador = new IntersectionObserver(([entrada]) => {
      enPantalla = Boolean(entrada?.isIntersecting);
      actualizarMovimiento();
    }, { threshold: 0.05 });

    observador.observe(franja);
    document.addEventListener("visibilitychange", actualizarMovimiento);
    return () => {
      observador.disconnect();
      document.removeEventListener("visibilitychange", actualizarMovimiento);
    };
  }, []);
  useEffect(() => {
    const landing = document.querySelector<HTMLElement>(".atlas-landing");
    if (!landing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const actualizarMovimiento = () => landing.classList.toggle("atlas-landing--activa", !document.hidden);
    actualizarMovimiento();
    document.addEventListener("visibilitychange", actualizarMovimiento);
    return () => document.removeEventListener("visibilitychange", actualizarMovimiento);
  }, []);
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const secciones = document.querySelectorAll<HTMLElement>(
      ".seccion-publicacion, .seccion-candidatos, .seccion-evidencias, .seccion-aprobacion, .seccion-principios",
    );
    let posicionAnterior = window.scrollY;
    let bajando = true;
    const registrarDireccion = () => {
      const posicionActual = window.scrollY;
      if (Math.abs(posicionActual - posicionAnterior) > 2) bajando = posicionActual > posicionAnterior;
      posicionAnterior = posicionActual;
    };

    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) {
          entrada.target.classList.remove("animacion-seccion--visible");
          return;
        }
        if (bajando) entrada.target.classList.add("animacion-seccion--visible");
      });
    }, { threshold: 0.12 });

    window.addEventListener("scroll", registrarDireccion, { passive: true });
    secciones.forEach((seccion) => observador.observe(seccion));
    return () => {
      observador.disconnect();
      window.removeEventListener("scroll", registrarDireccion);
    };
  }, []);
}
