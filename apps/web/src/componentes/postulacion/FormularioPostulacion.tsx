import { useState, type FormEvent } from "react";
import crearPostulacion from "../../servicios/postulaciones";
import type { CandidatoPostulacion, PostulacionCrear } from "../../tipos/postulacion";

type Propiedades = {
  idVacante: number;
};

//un mensaje por campo; "enlaces" es el error de grupo (falta al menos uno)
type Errores = {
  nombres?: string;
  apellidos?: string;
  correo?: string;
  enlaces?: string;
};

const MENSAJES: Required<Errores> = {
  nombres: "Escribe tus nombres.",
  apellidos: "Escribe tus apellidos.",
  correo: "Revisa tu correo: debe ser como nombre@correo.com.",
  enlaces: "Agrega al menos un enlace: LinkedIn, GitHub o portafolio.",
};

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FormularioPostulacion({ idVacante }: Propiedades) {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portafolio, setPortafolio] = useState("");
  const [github, setGithub] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  //¿hay un envío en curso? evita el doble clic
  const [enviando, setEnviando] = useState(false);
  //¿la postulación ya se recibió? reemplaza el formulario por la confirmación
  const [enviado, setEnviado] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [errores, setErrores] = useState<Errores>({});

  //revisa el formulario antes de enviarlo; la API vuelve a validar por seguridad
  function validar(): Errores {
    const nuevos: Errores = {};
    if (!nombres.trim()) nuevos.nombres = MENSAJES.nombres;
    if (!apellidos.trim()) nuevos.apellidos = MENSAJES.apellidos;
    if (!correo.trim()) nuevos.correo = "Escribe tu correo.";
    else if (!FORMATO_CORREO.test(correo.trim())) nuevos.correo = MENSAJES.correo;
    if (!linkedin.trim() && !github.trim() && !portafolio.trim()) nuevos.enlaces = MENSAJES.enlaces;
    return nuevos;
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const nuevos = validar();
    setErrores(nuevos);
    //si hay errores no se envía; lo escrito se conserva
    if (Object.keys(nuevos).length > 0) return;

    const datos_formulario: CandidatoPostulacion = {
      nombres: nombres,
      apellidos: apellidos,
      correo: correo,
      telefono: telefono || null,
      linkedin_url: linkedin || null,
      portafolio_url: portafolio || null,
      github_url: github || null,
    };

    const postulacion_data: PostulacionCrear = {
      id_vacante: idVacante,
      candidato: datos_formulario,
      acepta_tratamiento_datos: aceptaTerminos,
    };

    setEnviando(true);
    setMensajeError("");

    crearPostulacion(postulacion_data)
      .then(() => {
        setEnviado(true);
      })
      .catch((error) => {
        if (error.response?.status === 409) setMensajeError("Ya postulaste a esta vacante con este correo.");
        else if (error.response?.status === 422) setErrores(erroresDeLaApi(error.response.data.detail));
        else setMensajeError("No pudimos enviar tu postulación. Inténtalo de nuevo.");
      })
      .finally(() => setEnviando(false));
  }

  if (enviado)
    return (
      <div>
        <h2>Recibimos tu postulación</h2>
        <p>Te escribiremos a {correo} cuando el equipo revise tu perfil.</p>
      </div>
    );

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="nombres">Nombres completos:</label>
      <input id="nombres" type="text" value={nombres} aria-invalid={Boolean(errores.nombres)} aria-describedby={errores.nombres ? "nombres-error" : undefined} onChange={(evento) => setNombres(evento.target.value)} /> <br />
      {errores.nombres && <p id="nombres-error">{errores.nombres}</p>}
      <label htmlFor="apellidos">Apellidos completos:</label>
      <input
        id="apellidos"
        type="text"
        value={apellidos}
        aria-invalid={Boolean(errores.apellidos)}
        aria-describedby={errores.apellidos ? "apellidos-error" : undefined}
        onChange={(evento) => setApellidos(evento.target.value)}
      />{" "}
      <br />
      {errores.apellidos && <p id="apellidos-error">{errores.apellidos}</p>}
      <label htmlFor="correo">Correo:</label>
      <input id="correo" type="email" value={correo} aria-invalid={Boolean(errores.correo)} aria-describedby={errores.correo ? "correo-error" : undefined} onChange={(evento) => setCorreo(evento.target.value)} />
      <br />
      {errores.correo && <p id="correo-error">{errores.correo}</p>}
      <label htmlFor="telefono">Teléfono:</label>
      <input id="telefono" type="tel" value={telefono} onChange={(evento) => setTelefono(evento.target.value)} />
      <br />
      <label htmlFor="linkedin">LinkedIn:</label>
      <input id="linkedin" type="url" value={linkedin} onChange={(evento) => setLinkedin(evento.target.value)} />
      <br />
      <label htmlFor="portafolio">Portafolio (opcional)</label>
      <input id="portafolio" type="url" value={portafolio} onChange={(evento) => setPortafolio(evento.target.value)} />
      <br />
      <label htmlFor="github">gitHub (opcional)</label>
      <input id="github" type="url" value={github} onChange={(evento) => setGithub(evento.target.value)} />
      <br />
      {errores.enlaces && <p role="alert">{errores.enlaces}</p>}
      <label htmlFor="acepta-terminos">Acepto los términos y condiciones</label>
      <input
        id="acepta-terminos"
        type="checkbox"
        checked={aceptaTerminos}
        onChange={(evento) => setAceptaTerminos(evento.target.checked)}
      />{" "}
      <br />
      {mensajeError && <p>{mensajeError}</p>}
      <button disabled={!aceptaTerminos || enviando}>{enviando ? "Enviando…" : "Postular"}</button>
    </form>
  );
}

//traduce la lista "detail" de un 422 a mensajes por campo
//loc termina en el nombre del campo; solo ["body"] es el error de enlaces
function erroresDeLaApi(detalle: { loc: string[] }[]): Errores {
  const nuevos: Errores = {};
  for (const item of detalle) {
    const campo = item.loc[item.loc.length - 1];
    if (campo === "nombres" || campo === "apellidos" || campo === "correo") nuevos[campo] = MENSAJES[campo];
    else if (campo === "body") nuevos.enlaces = MENSAJES.enlaces;
  }
  return nuevos;
}

export default FormularioPostulacion;
