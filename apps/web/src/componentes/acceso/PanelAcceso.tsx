import FormularioAcceso from "./FormularioAcceso";

type Propiedades = {
  manejarEnvio: (datos: FormData) => Promise<void>;
  mensajeError: string;
};

export default function PanelAcceso({ manejarEnvio, mensajeError }: Propiedades) {
  return (
    <section className="acceso__panel" aria-labelledby="titulo-formulario">
      <div className="acceso__panel-cabecera">
        <span>Espacio de trabajo</span>
        <span>Reclutador</span>
      </div>
      <h2 id="titulo-formulario">Iniciar sesión</h2>
      <p className="acceso__subtitulo">Accede a tu espacio de trabajo.</p>

      <FormularioAcceso manejarEnvio={manejarEnvio} mensajeError={mensajeError} />
    </section>
  );
}
