import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import EncabezadoAcceso from "./EncabezadoAcceso";
import EncabezadoSitio from "./EncabezadoSitio";

export default function Navegacion() {
  const { pathname } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [temaOscuro, setTemaOscuro] = useState(() => document.documentElement.dataset.tema === "oscuro");
  const cerrarMenu = () => setMenuAbierto(false);
  const alternarMenu = () => setMenuAbierto((actual) => !actual);
  const alternarTema = () => setTemaOscuro((actual) => !actual);

  useEffect(() => {
    document.documentElement.dataset.tema = temaOscuro ? "oscuro" : "claro";
    try {
      window.localStorage.setItem("tema-visual", temaOscuro ? "oscuro" : "claro");
    } catch {
      /* El cambio sigue disponible si el navegador bloquea el almacenamiento. */
    }
  }, [temaOscuro]);

  useEffect(() => {
    const pantallaGrande = window.matchMedia("(min-width: 1101px)");
    const cerrarAlAmpliar = () => {
      if (pantallaGrande.matches) setMenuAbierto(false);
    };
    pantallaGrande.addEventListener("change", cerrarAlAmpliar);
    return () => pantallaGrande.removeEventListener("change", cerrarAlAmpliar);
  }, []);

  return pathname === "/iniciar-sesion" ? (
    <EncabezadoAcceso temaOscuro={temaOscuro} alternarTema={alternarTema} />
  ) : (
    <EncabezadoSitio
      menuAbierto={menuAbierto}
      temaOscuro={temaOscuro}
      cerrarMenu={cerrarMenu}
      alternarMenu={alternarMenu}
      alternarTema={alternarTema}
    />
  );
}
