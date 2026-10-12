import { useEffect } from "react";

export function useAnimacionAcceso() {
  useEffect(() => {
    const acceso = document.querySelector<HTMLElement>('.acceso')
    if (!acceso || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const actualizarMovimiento = () => acceso.classList.toggle('acceso--activa', !document.hidden)
    actualizarMovimiento()
    document.addEventListener('visibilitychange', actualizarMovimiento)
    return () => document.removeEventListener('visibilitychange', actualizarMovimiento)
  }, [])
}
