import FormularioAcceso from "./FormularioAcceso";

type Propiedades = {
  manejarEnvio: (datos: FormData) => Promise<void>;
  mensajeError: string;
};

export default function PanelAcceso({ manejarEnvio, mensajeError }: Propiedades) {
  return (
    <section className="acceso__panel" aria-labelledby="titulo-formulario">
      <h2 id="titulo-formulario">Iniciar sesión</h2>
      <p className="acceso__subtitulo">Ingresa con el correo de tu equipo de selección.</p>
      <FormularioAcceso manejarEnvio={manejarEnvio} mensajeError={mensajeError} />
    </section>
  );
}
