import { useRef, useState, type CSSProperties, type DragEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Check, FileText, FileUp, Link2, LoaderCircle, X } from "lucide-react";
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
  cv?: string;
};

const MENSAJES: Required<Errores> = {
  nombres: "Escribe tus nombres.",
  apellidos: "Escribe tus apellidos.",
  correo: "Revisa tu correo: debe ser como nombre@correo.com.",
  enlaces: "Agrega al menos un enlace: LinkedIn, GitHub o portafolio.",
  cv: "Adjunta tu CV en PDF.",
};

//el mismo límite que la API
const TAMANO_MAXIMO_CV = 5 * 1024 * 1024;

//revisa el archivo elegido; devuelve el mensaje de error o null si está bien
function revisarCv(archivo: File | null): string | null {
  if (archivo === null) return MENSAJES.cv;
  if (!archivo.name.toLowerCase().endsWith(".pdf")) return "Tu CV tiene que ser un archivo PDF.";
  if (archivo.size > TAMANO_MAXIMO_CV) return "Tu CV pesa más de 5 MB. Sube una versión más liviana.";
  return null;
}

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FormularioPostulacion({ idVacante, tituloVacante }: Propiedades) {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portafolio, setPortafolio] = useState("");
  const [github, setGithub] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  //campo trampa contra robots: está oculto y una persona nunca lo llena
  const [sitioWeb, setSitioWeb] = useState("");
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
    const errorCv = revisarCv(cv);
    if (errorCv) nuevos.cv = errorCv;
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

    crearPostulacion(postulacion_data, cv!, sitioWeb)
      .then(() => {
        setEnviado(true);
      })
      .catch((error) => {
        if (error.response?.status === 409) setMensajeError("Ya postulaste a esta vacante con este correo.");
        else if (error.response?.status === 429) setMensajeError(error.response.data.detail);
        else if (error.response?.status === 422) setErrores(erroresDeLaApi(error.response.data.detail));
        else setMensajeError("No pudimos enviar tu postulación. Inténtalo de nuevo.");
      })
      .finally(() => setEnviando(false));
  }

  //el CV elegido (o soltado) se revisa al momento, para avisar sin esperar al envío
  function elegirCv(archivo: File | null) {
    setCv(archivo);
    setErrores((anteriores) => ({ ...anteriores, cv: archivo ? (revisarCv(archivo) ?? undefined) : undefined }));
  }

  //avance de la barra: cuántos de los 5 obligatorios ya están completos
  const completos = [
    nombres.trim(),
    apellidos.trim(),
    FORMATO_CORREO.test(correo.trim()),
    revisarCv(cv) === null,
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
      <div className={`postular__progreso ${completos === 5 ? "postular__progreso--completo" : ""}`}>
        <div className="postular__progreso-texto">
          <span>Campos obligatorios</span>
          <b>{completos} de 5</b>
        </div>
        <div className="postular__barra">
          <i style={{ "--avance": completos / 5 } as CSSProperties} />
        </div>
      </div>
      <form className="postular__formulario" onSubmit={enviar} noValidate>
        {/* trampa para robots: fuera de la vista, sin foco con Tab y oculto para lectores de pantalla */}
        <div className="postular__trampa" aria-hidden="true">
          <label htmlFor="sitio-web">Sitio web</label>
          <input id="sitio-web" name="sitio_web" tabIndex={-1} autoComplete="off" value={sitioWeb} onChange={(evento) => setSitioWeb(evento.target.value)} />
        </div>
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
        <fieldset className={`postular__grupo ${errores.cv || errores.enlaces ? "postular__grupo--error" : ""}`}>
          <legend className="postular__leyenda">
            Tu CV y enlaces <small>CV en PDF de hasta 5 MB · al menos un enlace</small>
          </legend>
          <CampoCv archivo={cv} error={errores.cv} alElegir={elegirCv} />
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

type PropiedadesCv = {
  archivo: File | null;
  error?: string;
  alElegir: (archivo: File | null) => void;
};

//zona para elegir o soltar el CV; una vez elegido muestra el nombre y el peso
function CampoCv({ archivo, error, alElegir }: PropiedadesCv) {
  const entrada = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  function soltar(evento: DragEvent<HTMLLabelElement>) {
    evento.preventDefault();
    setArrastrando(false);
    alElegir(evento.dataTransfer.files[0] ?? null);
  }

  function quitar() {
    alElegir(null);
    //se limpia el input para poder volver a elegir el mismo archivo
    if (entrada.current) entrada.current.value = "";
  }

  return (
    <div className={`postular__campo ${error ? "postular__campo--error" : ""}`}>
      {archivo && !error ? (
        <div className="postular__cv postular__cv--listo">
          <FileText size={20} aria-hidden="true" />
          <span className="postular__cv-texto">
            <b>{archivo.name}</b>
            <small>{pesoLegible(archivo.size)} · listo para enviar</small>
          </span>
          <button className="postular__cv-quitar" type="button" aria-label="Quitar el CV" onClick={quitar}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          className={`postular__cv ${arrastrando ? "postular__cv--arrastrando" : ""}`}
          htmlFor="cv"
          onDragOver={(evento) => {
            evento.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={soltar}>
          <FileUp size={20} aria-hidden="true" />
          <span className="postular__cv-texto">
            <b>Elige tu CV</b>
            <small>o arrástralo aquí</small>
          </span>
          <span className="postular__cv-boton">Buscar archivo</span>
        </label>
      )}
      <input
        ref={entrada}
        className="solo-lectores"
        id="cv"
        type="file"
        accept="application/pdf,.pdf"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "cv-error" : undefined}
        onChange={(evento) => alElegir(evento.target.files?.[0] ?? null)}
      />
      {error && <ErrorCampo id="cv-error" texto={error} />}
    </div>
  );
}

//"1,2 MB" o "340 KB"
function pesoLegible(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toLocaleString("es", { maximumFractionDigits: 1 })} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

//traduce la lista "detail" de un 422 a mensajes por campo
//loc termina en el nombre del campo; solo ["body"] es el error de enlaces; el del CV trae su propio mensaje
function erroresDeLaApi(detalle: { loc: string[]; msg: string }[]): Errores {
  const nuevos: Errores = {};
  for (const item of detalle) {
    const campo = item.loc[item.loc.length - 1];
    if (campo === "nombres" || campo === "apellidos" || campo === "correo") nuevos[campo] = MENSAJES[campo];
    else if (campo === "cv") nuevos.cv = item.msg;
    else if (campo === "body") nuevos.enlaces = MENSAJES.enlaces;
  }
  return nuevos;
}

export default FormularioPostulacion;
