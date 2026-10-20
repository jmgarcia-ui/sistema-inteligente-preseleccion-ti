import { useContext, useEffect, useRef, useState, type RefObject } from "react";
import { AlertTriangle, ArrowLeft, Copy, ExternalLink, FileText, LoaderCircle, RefreshCw, Search, Send, Sparkles, Star } from "lucide-react";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import { abrirCv, decidir, enviarCorreo, guardarCorreo, obtenerFicha, redactarCorreo, reintentarAnalisis, reintentarLectura } from "../../servicios/candidatos";
import type { Decision, EvidenciaRequisito, FichaCandidato as Ficha, Recomendacion } from "../../tipos/candidatos";
import type { EstadoPostulacion } from "../../tipos/panel";
import type { RespuestaToken } from "../../tipos/sesion";
import { obtenerActividad } from "../../servicios/panel";
import type { Accion } from "../../tipos/panel";
import ListaAcciones from "./ListaAcciones";
import { NOMBRES_ESTADO_POSTULACION, describirEspera, fechaDeCreacion } from "../../utilidades/panel";

type Propiedades = {
  idPostulacion: number;
  alVolver: () => void;
  alCambiarEstado: (estado: EstadoPostulacion) => void;
};

const NOMBRES_RESULTADO = { cumple: "Cumple", parcial: "Parcial", sin_evidencia: "Sin evidencia" };

//mientras el CV se lee o se analiza, la ficha se vuelve a pedir cada pocos segundos
const ESPERA_CONSULTA_MS = 4000;

function enProceso(ficha: Ficha) {
  const lectura = ficha.lectura?.estado;
  const analisis = ficha.analisis?.estado;
  return lectura === "pendiente" || lectura === "leyendo" || analisis === "pendiente" || analisis === "analizando" || (lectura === "leido" && !ficha.analisis);
}

//todo lo necesario para decidir sobre una persona, sin salir de la bandeja
export default function FichaCandidato({ idPostulacion, alVolver, alCambiarEstado }: Propiedades) {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error("FichaCandidato debe estar dentro de UsuarioProvider");
  const { token, cerrarSesion } = contexto;

  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [hayError, setHayError] = useState(false);
  const [consulta, setConsulta] = useState(0);
  const [aviso, setAviso] = useState("");
  //la confirmación del envío vive aquí: la abre el botón de la sección del correo o el de la barra de decisión
  const [confirmandoEnvio, setConfirmandoEnvio] = useState(false);
  const seccionCorreo = useRef<HTMLElement>(null);

  useEffect(() => {
    if (token === null) return;
    obtenerFicha(token, idPostulacion)
      .then((datos) => setFicha(datos))
      .catch((error) => {
        if (error.response?.status === 401) cerrarSesion();
        else setHayError(true);
      });
  }, [token, idPostulacion, consulta, cerrarSesion]);

  //si el CV todavía se está procesando, se vuelve a consultar hasta que termine
  const procesando = ficha !== null && enProceso(ficha);
  useEffect(() => {
    if (!procesando) return;
    const temporizador = window.setTimeout(() => setConsulta((anterior) => anterior + 1), ESPERA_CONSULTA_MS);
    return () => window.clearTimeout(temporizador);
  }, [procesando, ficha]);

  function avisar(texto: string) {
    setAviso(texto);
    window.setTimeout(() => setAviso(""), 2400);
  }

  if (hayError)
    return (
      <article className="ficha">
        <p className="ficha__error" role="alert">
          No pudimos cargar esta postulación.{" "}
          <button type="button" onClick={() => setConsulta((anterior) => anterior + 1)}>
            Reintentar
          </button>
        </p>
      </article>
    );

  if (ficha === null)
    return (
      <article className="ficha" aria-busy="true">
        <span className="esqueleto-panel" style={{ width: 240, height: 32 }} />
        <span className="esqueleto-panel" style={{ width: "70%", height: 18, marginTop: 12 }} />
        <span className="esqueleto-panel" style={{ height: 120, marginTop: 28 }} />
        <span className="esqueleto-panel" style={{ height: 220, marginTop: 20 }} />
      </article>
    );

  const { candidato, analisis } = ficha;
  const espera = describirEspera(ficha.creado_en);
  const nombre = `${candidato.nombres} ${candidato.apellidos}`;
  //con la propuesta lista se muestran sus evidencias; antes, los requisitos a secas
  const evidencias: EvidenciaRequisito[] =
    analisis?.estado === "listo"
      ? analisis.evidencias
      : ficha.requisitos.map((r) => ({ numero: r.numero, requisito: r.descripcion, obligatorio: r.obligatorio, resultado: "sin_evidencia", cita: null, pagina: null, explicacion: "" }));

  async function accion(promesa: Promise<unknown>, textoError: string) {
    try {
      await promesa;
      setConsulta((anterior) => anterior + 1);
    } catch {
      avisar(textoError);
    }
  }

  return (
    <article className="ficha" aria-labelledby="ficha-nombre">
      <button className="ficha__volver" type="button" onClick={alVolver}>
        <ArrowLeft size={16} aria-hidden="true" />
        Candidatos
      </button>

      <header className="ficha__cabeza">
        <div>
          <h2 id="ficha-nombre">{nombre}</h2>
          <p className="ficha__sub">
            Postuló a <b>{ficha.vacante.titulo}</b> · llegó el {fechaDeCreacion(ficha.creado_en)} ({espera.cantidad} {espera.unidad})
          </p>
        </div>
        <span className={`estado-postulacion estado-postulacion--${ficha.estado}`}>{NOMBRES_ESTADO_POSTULACION[ficha.estado]}</span>
      </header>

      {/* el CV y en qué va su lectura */}
      <section className="ficha__cv" aria-label="CV">
        <FileText size={20} aria-hidden="true" />
        {ficha.cv_nombre ? (
          <>
            <span className="ficha__cv-texto">
              <b>{ficha.cv_nombre}</b>
              <EstadoLectura ficha={ficha} />
            </span>
            {ficha.lectura?.estado === "error" && token && (
              <button className="boton boton--fantasma boton--chico" type="button" onClick={() => accion(reintentarLectura(token, ficha.id), "No pudimos reintentar la lectura.")}>
                <RefreshCw size={15} aria-hidden="true" />
                Leer de nuevo
              </button>
            )}
            <button
              className="boton boton--secundario boton--chico"
              type="button"
              onClick={() => token && abrirCv(token, ficha.id).catch(() => avisar("No pudimos abrir el CV."))}>
              Ver CV
              <ExternalLink size={15} aria-hidden="true" />
            </button>
          </>
        ) : (
          <span className="ficha__cv-texto">
            <b>Sin CV</b>
            <small>Esta postulación es anterior a la subida de CV: revisa sus enlaces.</small>
          </span>
        )}
      </section>

      <Propuesta ficha={ficha} alReintentar={() => token && accion(reintentarAnalisis(token, ficha.id), "No pudimos reintentar el análisis.")} />

      <section className="ficha__seccion" aria-labelledby="titulo-evidencia">
        <h3 id="titulo-evidencia">
          Requisitos y evidencia <small>cada cita está comprobada en el CV</small>
        </h3>
        <ol className="evidencias">
          {evidencias.map((e) => (
            <li className={`evidencia evidencia--${analisis?.estado === "listo" ? e.resultado : "pendiente"}`} key={e.numero}>
              <span className="evidencia__n" aria-hidden="true">
                {e.numero}
              </span>
              <div className="evidencia__cuerpo">
                <p className="evidencia__requisito">
                  {e.requisito} <small>{e.obligatorio ? "Imprescindible" : "Deseable"}</small>
                </p>
                {e.cita && (
                  <blockquote className="evidencia__cita">
                    “{e.cita}”<cite>CV, página {e.pagina}</cite>
                  </blockquote>
                )}
                {e.explicacion && <p className="evidencia__explicacion">{e.explicacion}</p>}
              </div>
              <span className={`chip-evidencia chip-evidencia--${analisis?.estado === "listo" ? e.resultado : "pendiente"}`}>
                {analisis?.estado === "listo" ? NOMBRES_RESULTADO[e.resultado] : ficha.cv_nombre ? "Pendiente" : "Sin análisis"}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="ficha__dos">
        <section className="ficha__seccion" aria-labelledby="titulo-contacto">
          <h3 id="titulo-contacto">Contacto</h3>
          <dl className="contacto">
            <Dato etiqueta="Correo" valor={candidato.correo} alCopiar={() => copiar(candidato.correo, "Correo copiado.", avisar)} />
            <Dato etiqueta="Teléfono" valor={candidato.telefono} alCopiar={() => candidato.telefono && copiar(candidato.telefono, "Teléfono copiado.", avisar)} />
          </dl>
        </section>
        <section className="ficha__seccion" aria-labelledby="titulo-fuentes">
          <h3 id="titulo-fuentes">
            Enlaces <small>se abren en otra pestaña</small>
          </h3>
          <div className="fuentes">
            <Fuente nombre="LinkedIn" url={candidato.linkedin_url} />
            <Fuente nombre="GitHub" url={candidato.github_url} />
            <Fuente nombre="Portafolio" url={candidato.portafolio_url} />
          </div>
        </section>
      </div>

      {token && (
        <SeccionCorreo
          key={`${analisis?.actualizado_en ?? "sin-analisis"}-${analisis?.correo_tipo ?? ""}-${ficha.estado}`}
          ficha={ficha}
          seccion={seccionCorreo}
          confirmando={confirmandoEnvio}
          alConfirmar={setConfirmandoEnvio}
          alGuardar={async (asunto, cuerpo) => {
            setFicha(await guardarCorreo(token, ficha.id, asunto, cuerpo));
            avisar("Borrador guardado.");
          }}
          alRedactar={async (tipo) => {
            setFicha(await redactarCorreo(token, ficha.id, tipo));
            avisar("Borrador redactado. Revísalo antes de enviarlo.");
          }}
          alEnviar={async (reenviar) => {
            const nueva = await enviarCorreo(token, ficha.id, reenviar);
            setFicha(nueva);
            const ultimo = nueva.envios[0];
            avisar(ultimo?.estado === "enviado" ? `Correo enviado a ${ultimo.destinatario}.` : "No se pudo enviar el correo.");
          }}
        />
      )}

      {token && <Historial token={token} idPostulacion={ficha.id} version={`${ficha.estado}-${ficha.envios.length}-${analisis?.estado ?? ""}`} />}

      <BarraDecision
        ficha={ficha}
        alIrAEnviar={() => {
          //lleva a la sección del correo y abre la confirmación (o el aviso para redactarlo si no coincide)
          setConfirmandoEnvio(true);
          seccionCorreo.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        alDecidir={async (estado, motivo) => {
          if (!token) return;
          const nueva = await decidir(token, ficha.id, estado, motivo);
          setFicha(nueva);
          alCambiarEstado(nueva.estado);
          avisar(`${candidato.nombres}: ${NOMBRES_ESTADO_POSTULACION[nueva.estado].toLowerCase()}.`);
        }}
      />

      <div className={`ficha__toast ${aviso ? "ficha__toast--visible" : ""}`} role="status">
        {aviso}
      </div>
    </article>
  );
}

function EstadoLectura({ ficha }: { ficha: Ficha }) {
  const lectura = ficha.lectura;
  if (!lectura) return <small>Sin lectura</small>;
  if (lectura.estado === "error") return <small className="ficha__cv-error">No se pudo leer el CV.</small>;
  if (lectura.estado !== "leido")
    return (
      <small className="ficha__cv-proceso">
        <LoaderCircle className="girando" size={13} aria-hidden="true" />
        Leyendo el CV…
      </small>
    );
  const incompleto = lectura.paginas_documento && lectura.paginas_leidas && lectura.paginas_leidas < lectura.paginas_documento;
  return (
    <small>
      {lectura.paginas_leidas === 1 ? "1 página leída" : `${lectura.paginas_leidas} páginas leídas`}
      {incompleto ? ` de ${lectura.paginas_documento}` : ""}
    </small>
  );
}

//la propuesta de la IA: recomendación, motivo y avisos; siempre como propuesta, nunca como decisión
function Propuesta({ ficha, alReintentar }: { ficha: Ficha; alReintentar: () => void }) {
  const analisis = ficha.analisis;
  if (!ficha.cv_nombre) return null;

  if (!analisis || analisis.estado === "pendiente" || analisis.estado === "analizando")
    return (
      <section className="propuesta propuesta--proceso" aria-live="polite">
        <LoaderCircle className="girando" size={18} aria-hidden="true" />
        <p>
          <b>{ficha.lectura?.estado === "leido" ? "Analizando el CV…" : "Esperando la lectura del CV…"}</b> La IA compara el CV con cada requisito. Tarda unos segundos.
        </p>
      </section>
    );

  if (analisis.estado === "error")
    return (
      <section className="propuesta propuesta--error" role="alert">
        <AlertTriangle size={18} aria-hidden="true" />
        <p>
          <b>No se pudo analizar el CV.</b> Puedes reintentarlo o revisarlo a mano.
        </p>
        <button className="boton boton--secundario boton--chico" type="button" onClick={alReintentar}>
          <RefreshCw size={15} aria-hidden="true" />
          Analizar de nuevo
        </button>
      </section>
    );

  const pasa = analisis.recomendacion === "pasa";
  return (
    <section className={`propuesta ${pasa ? "propuesta--pasa" : "propuesta--no-pasa"}`} aria-labelledby="titulo-propuesta">
      <div className="propuesta__cabeza">
        <Sparkles size={16} aria-hidden="true" />
        <h3 id="titulo-propuesta">
          Propuesta de la IA: <span>{pasa ? "pasa a la siguiente etapa" : "no pasa"}</span>
        </h3>
        <button className="propuesta__reanalizar" type="button" onClick={alReintentar} title="Volver a analizar">
          <RefreshCw size={14} aria-hidden="true" />
          <span className="solo-lectores">Volver a analizar</span>
        </button>
      </div>
      <p className="propuesta__motivo">{analisis.motivo}</p>
      {analisis.avisos.length > 0 && (
        <ul className="propuesta__avisos">
          {analisis.avisos.map((texto) => (
            <li key={texto}>
              <AlertTriangle size={14} aria-hidden="true" />
              {texto}
            </li>
          ))}
        </ul>
      )}
      <p className="propuesta__nota">Es una propuesta: la decisión es tuya y nada se envía sin tu confirmación.</p>
    </section>
  );
}

function Dato({ etiqueta, valor, alCopiar }: { etiqueta: string; valor: string | null; alCopiar: () => void }) {
  return (
    <div>
      <dt>{etiqueta}</dt>
      <dd>{valor ?? <span className="contacto__falta">No lo dejó</span>}</dd>
      {valor ? (
        <button className="contacto__copiar" type="button" aria-label={`Copiar ${etiqueta.toLowerCase()}`} onClick={alCopiar}>
          <Copy size={14} aria-hidden="true" />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}

function Fuente({ nombre, url }: { nombre: string; url: string | null }) {
  if (!url)
    return (
      <span className="fuente fuente--falta">
        <span>{nombre}: no lo dejó</span>
      </span>
    );
  //los enlaces los escribe el candidato: se abren aparte y sin dar acceso a esta página
  const destino = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return (
    <a className="fuente" href={destino} target="_blank" rel="noopener noreferrer">
      <span>
        <b>{nombre}</b> · {url.replace(/^https?:\/\/(www\.)?/i, "")}
      </span>
      <ExternalLink size={14} aria-hidden="true" />
    </a>
  );
}

type PropiedadesCorreo = {
  ficha: Ficha;
  seccion: RefObject<HTMLElement | null>;
  confirmando: boolean;
  alConfirmar: (abierto: boolean) => void;
  alGuardar: (asunto: string, cuerpo: string) => Promise<void>;
  alRedactar: (tipo: Recomendacion) => Promise<void>;
  alEnviar: (reenviar: boolean) => Promise<void>;
};

const NOMBRE_TIPO = { pasa: "felicitación", no_pasa: "feedback" };

//el correo al candidato: borrador editable, redacción nueva si no coincide con la decisión, envío confirmado e historial
function SeccionCorreo({ ficha, seccion, confirmando: confirmacionPedida, alConfirmar: setConfirmando, alGuardar, alRedactar, alEnviar }: PropiedadesCorreo) {
  const analisis = ficha.analisis;
  const [asunto, setAsunto] = useState(analisis?.correo_asunto ?? "");
  const [cuerpo, setCuerpo] = useState(analisis?.correo_cuerpo ?? "");
  const [ocupado, setOcupado] = useState<"" | "guardando" | "redactando" | "enviando">("");
  const [error, setError] = useState("");

  //el correo comunica la decisión: preseleccionada → felicitación; descartada → feedback
  const tipoEsperado: Recomendacion | null = ficha.estado === "preseleccionada" ? "pasa" : ficha.estado === "descartada" ? "no_pasa" : null;
  const hayBorrador = Boolean(analisis?.correo_asunto && analisis?.correo_cuerpo);
  const coincide = hayBorrador && tipoEsperado !== null && analisis?.correo_tipo === tipoEsperado;
  const cambiado = asunto !== (analisis?.correo_asunto ?? "") || cuerpo !== (analisis?.correo_cuerpo ?? "");
  const enviado = ficha.envios.find((envio) => envio.estado === "enviado" && envio.tipo === tipoEsperado);
  //la confirmación solo se muestra si el borrador corresponde a la decisión
  const confirmando = confirmacionPedida && coincide;

  //sin CV y sin decisión todavía no hay nada que mostrar
  if (!hayBorrador && tipoEsperado === null) return null;

  async function ejecutar(tarea: "guardando" | "redactando" | "enviando", accion: () => Promise<void>, textoError: string) {
    setOcupado(tarea);
    setError("");
    try {
      await accion();
      setConfirmando(false);
    } catch (fallo) {
      const detalle = (fallo as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
      setError(typeof detalle === "string" ? detalle : textoError);
    } finally {
      setOcupado("");
    }
  }

  //si hay cambios sin guardar, se guardan antes de enviar: se envía exactamente lo que se ve
  async function enviar() {
    if (cambiado) await alGuardar(asunto, cuerpo);
    await alEnviar(Boolean(enviado));
  }

  return (
    <section className="ficha__seccion ficha__seccion--correo" aria-labelledby="titulo-correo" ref={seccion}>
      <h3 id="titulo-correo">
        Correo al candidato <small>{hayBorrador && analisis?.correo_tipo ? `borrador de ${NOMBRE_TIPO[analisis.correo_tipo]}` : "sin borrador"}</small>
      </h3>

      {tipoEsperado !== null && !coincide && (
        <div className="correo__aviso">
          <p>
            {hayBorrador
              ? `Tu decisión pide un correo de ${NOMBRE_TIPO[tipoEsperado]}, pero el borrador es de ${NOMBRE_TIPO[analisis!.correo_tipo ?? "pasa"]}.`
              : `Tu decisión pide un correo de ${NOMBRE_TIPO[tipoEsperado]}.`}
          </p>
          <button
            className="boton boton--primario boton--chico"
            type="button"
            disabled={ocupado !== ""}
            onClick={() => ejecutar("redactando", () => alRedactar(tipoEsperado), "No pudimos redactar el correo.")}>
            {ocupado === "redactando" ? <LoaderCircle className="girando" size={15} aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}
            {ocupado === "redactando" ? "Redactando…" : `Redactar correo de ${NOMBRE_TIPO[tipoEsperado]}`}
          </button>
        </div>
      )}

      {hayBorrador && (
        <div className="correo">
          <label htmlFor="correo-asunto">Asunto</label>
          <input id="correo-asunto" value={asunto} maxLength={200} onChange={(evento) => setAsunto(evento.target.value)} />
          <label htmlFor="correo-cuerpo">Mensaje</label>
          <textarea id="correo-cuerpo" rows={10} value={cuerpo} onChange={(evento) => setCuerpo(evento.target.value)} />
        </div>
      )}

      {error && <p className="correo__error">{error}</p>}

      {hayBorrador && (
        <div className="correo__pie">
          <p>
            {tipoEsperado === null
              ? "Preselecciona o descarta para poder enviarlo: el correo comunica tu decisión."
              : enviado
                ? `Enviado a ${enviado.destinatario} por ${enviado.enviado_por}${enviado.enviado_en ? ` el ${fechaDeCreacion(enviado.enviado_en)}` : ""}.`
                : `Se enviará a ${ficha.candidato.correo}.`}
          </p>
          <div className="correo__botones">
            <button
              className="boton boton--secundario boton--chico"
              type="button"
              disabled={!cambiado || ocupado !== ""}
              onClick={() => ejecutar("guardando", () => alGuardar(asunto, cuerpo), "No pudimos guardar el borrador. Revisa que el asunto y el texto no estén vacíos.")}>
              {ocupado === "guardando" ? "Guardando…" : "Guardar borrador"}
            </button>
            {coincide && !confirmando && (
              <button className={`boton boton--chico ${enviado ? "boton--secundario" : "boton--primario"}`} type="button" disabled={ocupado !== ""} onClick={() => setConfirmando(true)}>
                <Send size={15} aria-hidden="true" />
                {enviado ? "Reenviar" : "Enviar correo"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* enviar no se puede deshacer: se pide una confirmación explícita */}
      {confirmando && (
        <div className="correo__confirmar" role="alertdialog" aria-labelledby="confirmar-envio">
          <p id="confirmar-envio">
            {enviado ? "Este correo ya se envió. ¿Enviarlo otra vez a " : "¿Enviar ahora el correo a "}
            <b>{ficha.candidato.correo}</b>? No se puede deshacer.
          </p>
          <div className="correo__botones">
            <button className="boton boton--fantasma boton--chico" type="button" disabled={ocupado !== ""} onClick={() => setConfirmando(false)}>
              Cancelar
            </button>
            <button className="boton boton--primario boton--chico" type="button" disabled={ocupado !== ""} onClick={() => ejecutar("enviando", enviar, "No pudimos enviar el correo.")}>
              {ocupado === "enviando" ? <LoaderCircle className="girando" size={15} aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
              {ocupado === "enviando" ? "Enviando…" : "Sí, enviar"}
            </button>
          </div>
        </div>
      )}

      {ficha.envios.length > 0 && (
        <ol className="envios" aria-label="Correos enviados">
          {ficha.envios.map((envio) => (
            <li className={`envios__item envios__item--${envio.estado}`} key={envio.creado_en}>
              <b>{envio.estado === "enviado" ? "Enviado" : envio.estado === "error" ? "No se pudo enviar" : "Enviando…"}</b>
              <span>
                {NOMBRE_TIPO[envio.tipo]} · «{envio.asunto}» · {envio.enviado_por} · {fechaDeCreacion(envio.enviado_en ?? envio.creado_en)}
              </span>
              {envio.error && <small>{envio.error}</small>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

//la decisión siempre es de una persona; descartar pide un motivo, que arranca con el de la IA
function BarraDecision({ ficha, alDecidir, alIrAEnviar }: { ficha: Ficha; alDecidir: (estado: Decision, motivo?: string) => Promise<void>; alIrAEnviar: () => void }) {
  const [descartando, setDescartando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const recomendacion = ficha.analisis?.estado === "listo" ? ficha.analisis.recomendacion : null;

  async function confirmar(estado: Decision, motivoDescarte?: string) {
    setEnviando(true);
    setError("");
    try {
      await alDecidir(estado, motivoDescarte);
      setDescartando(false);
    } catch {
      setError("No pudimos guardar la decisión. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function empezarDescarte() {
    setMotivo(recomendacion === "no_pasa" ? (ficha.analisis?.motivo ?? "") : "");
    setDescartando(true);
  }

  if (ficha.estado === "retirada")
    return (
      <div className="decision">
        <p>El candidato retiró su postulación.</p>
      </div>
    );

  const decidida = ficha.estado === "preseleccionada" || ficha.estado === "descartada";
  //tras decidir falta un paso: comunicarlo al candidato
  const tipoCorreo = ficha.estado === "preseleccionada" ? "pasa" : "no_pasa";
  const correoEnviado = decidida && ficha.envios.some((envio) => envio.estado === "enviado" && envio.tipo === tipoCorreo);
  return (
    <div className="decision">
      {descartando && (
        <div className="decision__motivo">
          <label htmlFor="motivo-descarte">
            Motivo del descarte <span>(queda registrado; el candidato no lo ve)</span>
          </label>
          <textarea id="motivo-descarte" rows={3} maxLength={500} value={motivo} onChange={(evento) => setMotivo(evento.target.value)} autoFocus />
          <div className="decision__botones">
            <button className="boton boton--fantasma boton--chico" type="button" onClick={() => setDescartando(false)}>
              Cancelar
            </button>
            <button className="boton boton--primario boton--chico" type="button" disabled={!motivo.trim() || enviando} onClick={() => confirmar("descartada", motivo.trim())}>
              Confirmar descarte
            </button>
          </div>
        </div>
      )}
      {error && <p className="decision__error">{error}</p>}
      <div className="decision__fila">
        <p>
          {decidida && ficha.decidido_por
            ? `${NOMBRES_ESTADO_POSTULACION[ficha.estado]} por ${ficha.decidido_por}${ficha.decidido_en ? ` el ${fechaDeCreacion(ficha.decidido_en)}` : ""}${ficha.decision_motivo ? `: “${ficha.decision_motivo}”` : "."}`
            : "La decisión es tuya: el sistema no descarta a nadie por su cuenta."}
          {decidida && (correoEnviado ? <span className="decision__correo decision__correo--enviado"> Correo enviado.</span> : <span className="decision__correo"> Falta enviar el correo al candidato.</span>)}
        </p>
        {!descartando && (
          <div className="decision__botones">
            {decidida ? (
              <>
                <button className="boton boton--fantasma boton--chico" type="button" disabled={enviando} onClick={() => confirmar("en_revision")}>
                  Volver a revisión
                </button>
                {!correoEnviado && (
                  <button className="boton boton--primario boton--chico" type="button" onClick={alIrAEnviar}>
                    <Send size={15} aria-hidden="true" />
                    {ficha.estado === "preseleccionada" ? "Enviar correo de felicitación" : "Enviar correo de feedback"}
                  </button>
                )}
              </>
            ) : (
              <>
                <button className={`boton boton--chico ${recomendacion === "no_pasa" ? "boton--primario" : "boton--secundario"}`} type="button" disabled={enviando} onClick={empezarDescarte}>
                  Descartar
                </button>
                {ficha.estado === "recibida" && (
                  <button className="boton boton--secundario boton--chico" type="button" disabled={enviando} onClick={() => confirmar("en_revision")}>
                    <Search size={15} aria-hidden="true" />
                    Pasar a revisión
                  </button>
                )}
                <button className={`boton boton--chico ${recomendacion === "no_pasa" ? "boton--secundario" : "boton--primario"}`} type="button" disabled={enviando} onClick={() => confirmar("preseleccionada")}>
                  <Star size={15} aria-hidden="true" />
                  Preseleccionar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

//lo que pasó con esta postulación; se vuelve a pedir cuando cambia el estado, el análisis o los envíos
function Historial({ token, idPostulacion, version }: { token: RespuestaToken; idPostulacion: number; version: string }) {
  const [acciones, setAcciones] = useState<Accion[] | null>(null);

  useEffect(() => {
    obtenerActividad(token, { idPostulacion, limite: 30 })
      .then((datos) => setAcciones(datos))
      .catch(() => setAcciones([]));
  }, [token, idPostulacion, version]);

  return (
    <section className="ficha__seccion" aria-labelledby="titulo-historial">
      <h3 id="titulo-historial">Historial</h3>
      {acciones === null ? (
        <span className="esqueleto-panel" style={{ height: 40 }} />
      ) : acciones.length === 0 ? (
        <p className="ficha__nota">Sin acciones registradas todavía.</p>
      ) : (
        <ListaAcciones acciones={acciones} compacta />
      )}
    </section>
  );
}

function copiar(texto: string, mensaje: string, avisar: (texto: string) => void) {
  navigator.clipboard
    .writeText(texto)
    .then(() => avisar(mensaje))
    .catch(() => avisar("No pudimos copiar."));
}
