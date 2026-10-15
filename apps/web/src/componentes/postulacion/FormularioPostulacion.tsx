import { useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Check, Link2, LoaderCircle } from "lucide-react";
import crearPostulacion from "../../servicios/postulaciones";
import type { CandidatoPostulacion, PostulacionCrear } from "../../tipos/postulacion";

type Propiedades = {
  idVacante: number;
  tituloVacante: string;
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

function FormularioPostulacion({ idVacante, tituloVacante }: Propiedades) {
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

  //avance de la barra: cuántos de los 4 obligatorios ya están completos
  const completos = [
    nombres.trim(),
    apellidos.trim(),
    FORMATO_CORREO.test(correo.trim()),
    linkedin.trim() || github.trim() || portafolio.trim(),
  ].filter(Boolean).length;

  if (enviado)
    return (
      <div className="postular__confirmacion" role="status">
        <span className="postular__sello">
          <Check size={26} strokeWidth={2.6} aria-hidden="true" />
        </span>
        <h2 id="titulo-postular">Recibimos tu postulación</h2>
        <p>
          Postulaste a <b>{tituloVacante}</b> con el correo <b>{correo}</b>.
        </p>
        <ol className="postular__siguientes" aria-label="Qué sigue">
          <li>
            <span className="postular__punto postular__punto--hecho" />
            <span><b>Postulación recibida.</b> Ya está en la lista del equipo.</span>
          </li>
          <li>
            <span className="postular__punto" />
            <span><b>Revisión.</b> Una persona compara tu perfil con los requisitos.</span>
          </li>
          <li>
            <span className="postular__punto" />
            <span><b>Respuesta.</b> Te escribiremos a {correo} cuando el equipo revise tu perfil.</span>
          </li>
        </ol>
        <Link className="boton boton--secundario" to="/vacantes">Ver otras vacantes</Link>
      </div>
    );

  return (
    <>
      <h2 id="titulo-postular">Postula a esta vacante</h2>
      <p className="postular__sub">Toma unos minutos. No necesitas crear una cuenta.</p>
      <div className={`postular__progreso ${completos === 4 ? "postular__progreso--completo" : ""}`}>
        <div className="postular__progreso-texto">
          <span>Campos obligatorios</span>
          <b>{completos} de 4</b>
        </div>
        <div className="postular__barra">
          <i style={{ "--avance": completos / 4 } as CSSProperties} />
        </div>
      </div>
      <form className="postular__formulario" onSubmit={enviar} noValidate>
        <fieldset className="postular__grupo">
          <legend className="postular__leyenda">Tus datos</legend>
          <div className="postular__fila">
            <div className={`postular__campo ${errores.nombres ? "postular__campo--error" : ""}`}>
              <label htmlFor="nombres">Nombres</label>
              <input
                id="nombres"
                type="text"
                autoComplete="given-name"
                value={nombres}
                aria-invalid={Boolean(errores.nombres)}
                aria-describedby={errores.nombres ? "nombres-error" : undefined}
                onChange={(evento) => setNombres(evento.target.value)}
              />
              {errores.nombres && <ErrorCampo id="nombres-error" texto={errores.nombres} />}
            </div>
            <div className={`postular__campo ${errores.apellidos ? "postular__campo--error" : ""}`}>
              <label htmlFor="apellidos">Apellidos</label>
              <input
                id="apellidos"
                type="text"
                autoComplete="family-name"
                value={apellidos}
                aria-invalid={Boolean(errores.apellidos)}
                aria-describedby={errores.apellidos ? "apellidos-error" : undefined}
                onChange={(evento) => setApellidos(evento.target.value)}
              />
              {errores.apellidos && <ErrorCampo id="apellidos-error" texto={errores.apellidos} />}
            </div>
          </div>
          <div className="postular__fila">
            <div className={`postular__campo ${errores.correo ? "postular__campo--error" : ""}`}>
              <label htmlFor="correo">Correo electrónico</label>
              <input
                id="correo"
                type="email"
                autoComplete="email"
                placeholder="nombre@correo.com"
                value={correo}
                aria-invalid={Boolean(errores.correo)}
                aria-describedby={errores.correo ? "correo-error" : undefined}
                onChange={(evento) => setCorreo(evento.target.value)}
              />
              {errores.correo && <ErrorCampo id="correo-error" texto={errores.correo} />}
            </div>
            <div className="postular__campo">
              <label htmlFor="telefono">
                Teléfono <span>(opcional)</span>
              </label>
              <input
                id="telefono"
                type="tel"
                autoComplete="tel"
                placeholder="+51 999 999 999"
                value={telefono}
                onChange={(evento) => setTelefono(evento.target.value)}
              />
            </div>
          </div>
        </fieldset>
        <fieldset className={`postular__grupo ${errores.enlaces ? "postular__grupo--error" : ""}`}>
          <legend className="postular__leyenda">
            Enlaces profesionales <small>al menos uno · nos ayudan a encontrar evidencia</small>
          </legend>
          <div className="postular__enlaces">
            <CampoEnlace id="linkedin" etiqueta="LinkedIn" ejemplo="linkedin.com/…" valor={linkedin} cambiar={setLinkedin} />
            <CampoEnlace id="github" etiqueta="GitHub" ejemplo="github.com/…" valor={github} cambiar={setGithub} />
            <CampoEnlace id="portafolio" etiqueta="Portafolio" ejemplo="tusitio.com" valor={portafolio} cambiar={setPortafolio} />
          </div>
          {errores.enlaces && <ErrorCampo texto={errores.enlaces} alerta />}
        </fieldset>
        <div className="postular__cierre">
          <label className="postular__consentimiento" htmlFor="acepta-terminos">
            <input
              id="acepta-terminos"
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(evento) => setAceptaTerminos(evento.target.checked)}
            />
            <span>Acepto que el equipo de selección use mis datos para evaluar mi postulación a este puesto.</span>
          </label>
          {mensajeError && (
            <p className="postular__mensaje" role="alert">
              <AlertCircle size={15} aria-hidden="true" />
              {mensajeError}
            </p>
          )}
          <button className="boton boton--primario postular__enviar" type="submit" disabled={!aceptaTerminos || enviando}>
            {enviando && <LoaderCircle className="postular__girando" size={18} aria-hidden="true" />}
            {enviando ? "Enviando…" : "Postular"}
          </button>
          {!aceptaTerminos && <p className="postular__pista">Marca la casilla de consentimiento para poder postular.</p>}
        </div>
      </form>
    </>
  );
}

//mensaje de error con ícono; "alerta" lo anuncia apenas aparece (el de enlaces no está ligado a un campo)
function ErrorCampo({ id, texto, alerta = false }: { id?: string; texto: string; alerta?: boolean }) {
  return (
    <p className="postular__error" id={id} role={alerta ? "alert" : undefined}>
      <AlertCircle size={15} aria-hidden="true" />
      {texto}
    </p>
  );
}

type PropiedadesEnlace = {
  id: string;
  etiqueta: string;
  ejemplo: string;
  valor: string;
  cambiar: (valor: string) => void;
};

//el ícono se pone verde cuando el enlace tiene texto
function CampoEnlace({ id, etiqueta, ejemplo, valor, cambiar }: PropiedadesEnlace) {
  return (
    <div className={`postular__campo postular__enlace ${valor.trim() ? "postular__enlace--lleno" : ""}`}>
      <label htmlFor={id}>{etiqueta}</label>
      <input id={id} type="url" placeholder={ejemplo} value={valor} onChange={(evento) => cambiar(evento.target.value)} />
      <span className="postular__icono" aria-hidden="true">
        <Link2 size={16} />
      </span>
    </div>
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
