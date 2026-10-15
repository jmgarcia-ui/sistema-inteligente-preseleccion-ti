import { ArrowRight } from "lucide-react";
import CampoAcceso from "./CampoAcceso";

type Propiedades = {
  manejarEnvio: (datos: FormData) => Promise<void>;
  mensajeError: string;
};

export default function FormularioAcceso({ manejarEnvio, mensajeError }: Propiedades) {
  return (
    <form className="acceso__formulario" action={manejarEnvio}>
      <CampoAcceso id="correo" etiqueta="Correo electrónico" tipo="email" autocompletar="username" ejemplo="nombre@empresa.com" />
      <CampoAcceso id="contrasena" etiqueta="Contraseña" tipo="password" autocompletar="current-password" />
      <p className="acceso__recuperacion">¿Olvidaste tu contraseña?</p>
      <button className="acceso__enviar" type="submit">Entrar <ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" /></button>
      {mensajeError && <p role="alert" className="acceso__error">{mensajeError}</p>}
      <p className="acceso__contacto">¿Necesitas acceso? <span>Contacta al administrador</span></p>
    </form>
  );
}
