import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ChevronDown, ChevronUp, Plus, Send, X } from "lucide-react";
import type { EstadoVacante, VacanteDatos } from "../../tipos/panel";
import { NOMBRES_MODALIDAD, type Modalidad } from "../../tipos/vacantes";
import { describirCierre, hoyIso } from "../../utilidades/vacantes";

type Propiedades = {
  //datos con los que arranca el formulario: vacíos al crear, los de la vacante al editar
  inicial: VacanteDatos;
  //estado actual de la vacante; no existe al crear
  estado?: EstadoVacante;
  //id de la vacante para la vista previa de su dirección; no existe al crear
  idVacante?: number;
  //la página decide qué hacer con los datos (crear o editar); si falla, lanza el error de axios
  alGuardar: (datos: VacanteDatos, publicar: boolean) => Promise<void>;
};

type Errores = {
  titulo?: string;
  descripcion?: string;
  requisitos?: string;
  fecha_limite?: string;
  ubicacion?: string;
};

//cada fila de requisitos lleva una "clave" propia para que React no confunda filas al moverlas o quitarlas
type FilaRequisito = { clave: string; descripcion: string; obligatorio: boolean };

const MODALIDADES: Modalidad[] = ["remoto", "hibrido", "presencial"];

const nuevaFila = (descripcion = "", obligatorio = true): FilaRequisito => ({ clave: crypto.randomUUID(), descripcion, obligatorio });

function FormularioVacante({ inicial, estado, idVacante, alGuardar }: Propiedades) {
  const esNueva = estado === undefined;
  const [titulo, setTitulo] = useState(inicial.titulo);
  const [descripcion, setDescripcion] = useState(inicial.descripcion);
  //al crear arranca con una fila vacía para que se vea dónde escribir
  const [requisitos, setRequisitos] = useState<FilaRequisito[]>(() =>
    inicial.requisitos.length > 0 ? inicial.requisitos.map((r) => nuevaFila(r.descripcion, r.obligatorio)) : [nuevaFila()],
  );
  const [modalidad, setModalidad] = useState<Modalidad>(inicial.modalidad);
  const [ubicacion, setUbicacion] = useState(inicial.ubicacion ?? "");
  const [fechaLimite, setFechaLimite] = useState(inicial.fecha_limite);
  const [errores, setErrores] = useState<Errores>({});
  const [mensajeError, setMensajeError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // ---- requisitos: cambiar, agregar, quitar y mover ----
  function cambiarRequisito(clave: string, cambio: Partial<FilaRequisito>) {
    setRequisitos((filas) => filas.map((fila) => (fila.clave === clave ? { ...fila, ...cambio } : fila)));
  }

  function quitarRequisito(clave: string) {
    setRequisitos((filas) => filas.filter((fila) => fila.clave !== clave));
  }

  //intercambia la fila con la de arriba (-1) o la de abajo (+1)
  function moverRequisito(indice: number, direccion: -1 | 1) {
    setRequisitos((filas) => {
      const destino = indice + direccion;
      if (destino < 0 || destino >= filas.length) return filas;
      const copia = [...filas];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  }

  // ---- validación: las mismas reglas que la API, para avisar antes de enviar ----
  function validar(publicar: boolean): Errores {
    const nuevos: Errores = {};
    const hoy = hoyIso();
    if (titulo.trim().length < 3) nuevos.titulo = "El título necesita al menos 3 caracteres.";
    if (descripcion.trim().length < 20) nuevos.descripcion = "Cuenta un poco más: la descripción necesita al menos 20 caracteres.";
    if (!requisitos.some((fila) => fila.descripcion.trim())) nuevos.requisitos = "Escribe al menos un requisito.";
    if (!fechaLimite) nuevos.fecha_limite = "Elige la fecha límite.";
    //una fecha nueva (al crear o si la cambiaste) tiene que ser futura
    else if ((esNueva || fechaLimite !== inicial.fecha_limite) && fechaLimite <= hoy) nuevos.fecha_limite = "Elige una fecha a partir de mañana.";
    //publicar con la fecha que ya tenía, si ya pasó, tampoco se puede
    else if (publicar && fechaLimite < hoy) nuevos.fecha_limite = "La fecha límite ya pasó. Elige una nueva fecha para publicarla.";
    return nuevos;
  }

  function guardar(publicar: boolean) {
    const nuevos = validar(publicar);
    setErrores(nuevos);
    setMensajeError("");
    if (Object.keys(nuevos).length > 0) return;

    const datos: VacanteDatos = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      //las filas vacías no se envían; el orden es la posición en la lista
      requisitos: requisitos
        .filter((fila) => fila.descripcion.trim())
        .map((fila) => ({ descripcion: fila.descripcion.trim(), obligatorio: fila.obligatorio })),
      modalidad,
      ubicacion: ubicacion.trim() || null,
      fecha_limite: fechaLimite,
    };

    setEnviando(true);
    alGuardar(datos, publicar)
      .catch((error) => {
        const respuesta = error.response;
        if (respuesta?.status === 422 && Array.isArray(respuesta.data?.detail)) setErrores(erroresDeLaApi(respuesta.data.detail));
        else if (respuesta?.status === 400) setMensajeError(respuesta.data.detail);
        else setMensajeError("No pudimos guardar la vacante. Inténtalo de nuevo.");
      })
      .finally(() => setEnviando(false));
  }

  //"Publicar" envía el mismo formulario y además publica; una cerrada se "reabre"
  const puedePublicar = estado !== "publicada";
  const cantidadErrores = Object.keys(errores).length;
  //lo que se ve en la vista previa: solo los requisitos escritos
  const requisitosEscritos = requisitos.filter((fila) => fila.descripcion.trim());

  return (
    <form
      className="form-vacante"
      onSubmit={(evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        guardar(false);
      }}
      noValidate>
      <div className="form-vacante__campos">
        {cantidadErrores > 0 && (
          <p className="form-vacante__resumen-error" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            {cantidadErrores === 1 ? "Falta 1 cosa para guardar. Está marcada abajo." : `Faltan ${cantidadErrores} cosas para guardar. Están marcadas abajo.`}
          </p>
        )}

        <fieldset className="form-vacante__bloque">
          <legend>El puesto</legend>

          <div className={`form-vacante__campo ${errores.titulo ? "form-vacante__campo--error" : ""}`}>
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              value={titulo}
              maxLength={150}
              placeholder="Por ejemplo: Desarrolladora backend Python"
              aria-invalid={Boolean(errores.titulo)}
              aria-describedby={errores.titulo ? "titulo-error" : undefined}
              onChange={(evento) => setTitulo(evento.target.value)}
            />
            {errores.titulo && <ErrorCampo id="titulo-error" texto={errores.titulo} />}
            <div className="form-vacante__pie-campo">
              <span>Usa el nombre que buscaría un candidato.</span>
              <span>{titulo.length} / 150</span>
            </div>
          </div>

          <div className={`form-vacante__campo ${errores.descripcion ? "form-vacante__campo--error" : ""}`}>
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              rows={6}
              value={descripcion}
              placeholder="Qué hará la persona, con quién y con qué herramientas."
              aria-invalid={Boolean(errores.descripcion)}
              aria-describedby={errores.descripcion ? "descripcion-error" : undefined}
              onChange={(evento) => setDescripcion(evento.target.value)}
            />
            {errores.descripcion && <ErrorCampo id="descripcion-error" texto={errores.descripcion} />}
            <div className="form-vacante__pie-campo">
              <span>Qué hará, con quién y con qué herramientas.</span>
              <span>{descripcion.trim().length} caracteres</span>
            </div>
          </div>
        </fieldset>

        <fieldset className="form-vacante__bloque">
          <legend>
            Requisitos <small>de más a menos importante · al menos uno</small>
          </legend>
          <ol className="form-vacante__requisitos">
            {requisitos.map((fila, indice) => (
              <li className="requisito-editable" key={fila.clave}>
                <span className="requisito-editable__n" aria-hidden="true">
                  {indice + 1}
                </span>
                <input
                  aria-label={`Requisito ${indice + 1}`}
                  value={fila.descripcion}
                  maxLength={500}
                  placeholder="Por ejemplo: Experiencia con Python"
                  onChange={(evento) => cambiarRequisito(fila.clave, { descripcion: evento.target.value })}
                />
                <span className="requisito-editable__tipo" role="group" aria-label={`Tipo del requisito ${indice + 1}`}>
                  <button type="button" aria-pressed={fila.obligatorio} onClick={() => cambiarRequisito(fila.clave, { obligatorio: true })}>
                    Imprescindible
                  </button>
                  <button type="button" aria-pressed={!fila.obligatorio} onClick={() => cambiarRequisito(fila.clave, { obligatorio: false })}>
                    Deseable
                  </button>
                </span>
                <span className="requisito-editable__mover">
                  <button type="button" aria-label={`Subir el requisito ${indice + 1}`} disabled={indice === 0} onClick={() => moverRequisito(indice, -1)}>
                    <ChevronUp size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Bajar el requisito ${indice + 1}`}
                    disabled={indice === requisitos.length - 1}
                    onClick={() => moverRequisito(indice, 1)}>
                    <ChevronDown size={15} aria-hidden="true" />
                  </button>
                  <button type="button" aria-label={`Quitar el requisito ${indice + 1}`} disabled={requisitos.length === 1} onClick={() => quitarRequisito(fila.clave)}>
                    <X size={15} aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ol>
          {errores.requisitos && <ErrorCampo texto={errores.requisitos} />}
          <button className="form-vacante__agregar" type="button" onClick={() => setRequisitos((filas) => [...filas, nuevaFila()])}>
            <Plus size={16} aria-hidden="true" />
            Agregar requisito
          </button>
        </fieldset>

        <fieldset className="form-vacante__bloque">
          <legend>Dónde y hasta cuándo</legend>

          <div className="form-vacante__campo">
            <p className="form-vacante__etiqueta" id="etiqueta-modalidad">
              Modalidad
            </p>
            <div className="form-vacante__segmentado" role="radiogroup" aria-labelledby="etiqueta-modalidad">
              {MODALIDADES.map((opcion) => (
                <label key={opcion}>
                  <input type="radio" name="modalidad" checked={modalidad === opcion} onChange={() => setModalidad(opcion)} />
                  {NOMBRES_MODALIDAD[opcion]}
                </label>
              ))}
            </div>
          </div>

          <div className="form-vacante__fila">
            <div className={`form-vacante__campo ${errores.ubicacion ? "form-vacante__campo--error" : ""}`}>
              <label htmlFor="ubicacion">
                Ubicación <span>(opcional si es remoto)</span>
              </label>
              <input id="ubicacion" value={ubicacion} maxLength={150} placeholder="Ciudad - distrito" onChange={(evento) => setUbicacion(evento.target.value)} />
              {errores.ubicacion && <ErrorCampo texto={errores.ubicacion} />}
            </div>

            <div className={`form-vacante__campo ${errores.fecha_limite ? "form-vacante__campo--error" : ""}`}>
              <label htmlFor="fecha-limite">Fecha límite</label>
              <input
                id="fecha-limite"
                type="date"
                value={fechaLimite}
                aria-invalid={Boolean(errores.fecha_limite)}
                aria-describedby={errores.fecha_limite ? "fecha-error" : undefined}
                onChange={(evento) => setFechaLimite(evento.target.value)}
              />
              {errores.fecha_limite && <ErrorCampo id="fecha-error" texto={errores.fecha_limite} />}
              <div className="form-vacante__pie-campo">
                <span>Después de esta fecha deja de recibir postulaciones.</span>
              </div>
            </div>
          </div>
        </fieldset>

        {mensajeError && (
          <p className="form-vacante__mensaje" role="alert">
            {mensajeError}
          </p>
        )}

        <div className="form-vacante__pie">
          <p>
            {esNueva
              ? "Publicar la muestra en la lista pública y te da su enlace para compartir."
              : estado === "publicada"
                ? "Guardar cambios no cambia su estado: sigue publicada."
                : estado === "cerrada"
                  ? "Para reabrirla, elige una fecha límite futura y pulsa Reabrir."
                  : "Sigue como borrador hasta que la publiques."}
          </p>
          <div className="form-vacante__botones">
            <Link className="boton boton--fantasma boton--chico" to="/reclutador/vacantes">
              Cancelar
            </Link>
            <button className={`boton boton--chico ${puedePublicar ? "boton--secundario" : "boton--primario"}`} type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : esNueva ? "Guardar borrador" : "Guardar cambios"}
            </button>
            {puedePublicar && (
              <button className="boton boton--primario boton--chico" type="button" disabled={enviando} onClick={() => guardar(true)}>
                <Send size={15} aria-hidden="true" />
                {estado === "cerrada" ? "Reabrir" : "Publicar"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* se actualiza mientras escribes: así queda la página pública */}
      <aside className="previa-vacante" aria-label="Vista previa">
        <div className="previa-vacante__titulo">
          Así la verá el candidato<small>se actualiza al escribir</small>
        </div>
        <div className="previa-vacante__marco" aria-hidden="true">
          <div className="previa-vacante__ruta">
            <i />
            /vacantes/{idVacante ?? "…"}
          </div>
          <div className="previa-vacante__cuerpo">
            <h3 className={titulo.trim() ? undefined : "previa-vacante__vacio"}>{titulo.trim() || "Título de la vacante"}</h3>
            <div className="previa-vacante__datos">
              <span>{NOMBRES_MODALIDAD[modalidad]}</span>
              {ubicacion.trim() && <span>{ubicacion.trim()}</span>}
              {fechaLimite && <span>{describirCierre(fechaLimite).texto}</span>}
            </div>
            <h4>Sobre el puesto</h4>
            <p className={descripcion.trim() ? undefined : "previa-vacante__vacio"}>{descripcion.trim() || "La descripción aparecerá aquí."}</p>
            <h4>Requisitos</h4>
            {requisitosEscritos.length === 0 ? (
              <p className="previa-vacante__vacio">Los requisitos aparecerán aquí.</p>
            ) : (
              <ol>
                {requisitosEscritos.map((fila, indice) => (
                  <li key={fila.clave}>
                    <i>{indice + 1}</i>
                    <span>{fila.descripcion}</span>
                    {fila.obligatorio ? <span /> : <small>Deseable</small>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <p className="previa-vacante__nota">El formulario para postular aparece al lado, como en la página real.</p>
      </aside>
    </form>
  );
}

function ErrorCampo({ id, texto }: { id?: string; texto: string }) {
  return (
    <p className="form-vacante__error" id={id}>
      <AlertCircle size={15} aria-hidden="true" />
      {texto}
    </p>
  );
}

//traduce la lista "detail" de un 422 a mensajes por campo; loc es ["body", "campo", ...]
function erroresDeLaApi(detalle: { loc: (string | number)[] }[]): Errores {
  const nuevos: Errores = {};
  for (const item of detalle) {
    const campo = item.loc[1];
    if (campo === "titulo") nuevos.titulo = "Revisa el título: entre 3 y 150 caracteres.";
    else if (campo === "descripcion") nuevos.descripcion = "La descripción necesita al menos 20 caracteres.";
    else if (campo === "requisitos") nuevos.requisitos = "Revisa los requisitos: al menos uno, de hasta 500 caracteres.";
    else if (campo === "fecha_limite") nuevos.fecha_limite = "Elige una fecha a partir de mañana.";
    else if (campo === "ubicacion") nuevos.ubicacion = "La ubicación puede tener hasta 150 caracteres.";
  }
  return nuevos;
}

export default FormularioVacante;
