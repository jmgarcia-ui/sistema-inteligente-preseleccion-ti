import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import EncabezadoAcceso from "./EncabezadoAcceso";
import EncabezadoSitio from "./EncabezadoSitio";
import useTema from "../../hooks/useTema";

export default function Navegacion() {
  const { pathname } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  //el tema se comparte con el panel del reclutador
  const { temaOscuro, alternarTema } = useTema();
  const cerrarMenu = () => setMenuAbierto(false);
  const alternarMenu = () => setMenuAbierto((actual) => !actual);

  useEffect(() => {
    const pantallaGrande = window.matchMedia("(min-width: 901px)");
    const cerrarAlAmpliar = () => {
      if (pantallaGrande.matches) setMenuAbierto(false);
    };
    pantallaGrande.addEventListener("change", cerrarAlAmpliar);
    return () => pantallaGrande.removeEventListener("change", cerrarAlAmpliar);
  }, []);

  if (pathname.startsWith("/reclutador")) 
    return null; // el panel trae su propio encabezado
  if (pathname === "/iniciar-sesion") 
    return <EncabezadoAcceso temaOscuro={temaOscuro} alternarTema={alternarTema} />;
  
  return (
    <EncabezadoSitio
      menuAbierto={menuAbierto}
      temaOscuro={temaOscuro}
      cerrarMenu={cerrarMenu}
      alternarMenu={alternarMenu}
      alternarTema={alternarTema}
    />
  );
}
