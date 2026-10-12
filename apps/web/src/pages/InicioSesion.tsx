import { useContext, useState } from "react";
import PresentacionAcceso from "../componentes/acceso/PresentacionAcceso";
import PanelAcceso from "../componentes/acceso/PanelAcceso";
import { useAnimacionAcceso } from "../hooks/useAnimacionAcceso";
import { UsuarioContext } from "../contexto/UsuarioContext";
import type { Credenciales } from "../tipos/sesion";
import { useNavigate } from "react-router-dom";

export default function InicioSesion() {

  const [mensajeError, setMensajeError] = useState("");
  useAnimacionAcceso();
  const navegar = useNavigate();

  const contexto = useContext(UsuarioContext)
  if (!contexto) 
    throw new Error("No hay contexto")

  async function manejarEnvio(datos: FormData) {
    const data: Credenciales = {
      correo: String(datos.get("correo")?? "").trim(),
      contrasena: String(datos.get("contrasena")??"")
    }

    setMensajeError("")
    try {
      await contexto?.iniciarSesion(data)      
      navegar("/reclutador/resumen", { replace:true });

    } catch {
      setMensajeError("No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.")
    }

    
  }

  return (
    <section className="acceso" aria-labelledby="titulo-acceso">
      <div className="acceso__interior">
        <PresentacionAcceso />
        <PanelAcceso manejarEnvio={manejarEnvio} mensajeError={mensajeError} />
      </div>
    </section>
  );
}
