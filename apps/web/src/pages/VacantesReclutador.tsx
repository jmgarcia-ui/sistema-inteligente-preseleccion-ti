import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Eye, Link2, Lock, MoreVertical, Pencil, Plus, RefreshCw, Search, Send, Users } from "lucide-react";
import "../style/mis-vacantes.css";
import { UsuarioContext } from "../contexto/UsuarioContext";
import BarraEstados from "../componentes/panel/BarraEstados";
import { cambiarEstadoVacante, listarMisVacantes } from "../servicios/panel";
import type { EstadoVacante, VacanteGestion } from "../tipos/panel";
import { NOMBRES_MODALIDAD } from "../tipos/vacantes";
import { describirCierre, fechaCorta, hoyIso } from "../utilidades/vacantes";
import { fechaDeCreacion, textoPostulaciones, totalDeVacante } from "../utilidades/panel";

const NOMBRES_ESTADO = { borrador: "Borrador", publicada: "Publicada", cerrada: "Cerrada" };

const PESTANAS: { valor: "todas" | EstadoVacante; nombre: string }[] = [
  { valor: "todas", nombre: "Todas" },
  { valor: "publicada", nombre: "Publicadas" },
  { valor: "borrador", nombre: "Borradores" },
  { valor: "cerrada", nombre: "Cerradas" },
];

//aviso tras una acción: "ok" sale como mensaje flotante; "error" queda arriba de la lista
type Aviso = { tipo: "ok" | "error"; texto: string };

function VacantesReclutador() {
  const contexto = useContext(UsuarioContext);

  if (!contexto) throw new Error("Vacantes reclutador debe estar dentro de UsuarioProvider");

  const { token, cerrarSesion } = contexto;

  //null = todavía cargando; [] = cargó y no hay vacantes
  const [vacantes, setVacantes] = useState<VacanteGestion[] | null>(null);
  const [hayError, setHayError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [filtro, setFiltro] = useState<"todas" | EstadoVacante>("todas");
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (token === null) return;

    listarMisVacantes(token)
      .then((datos) => setVacantes(datos))
      .catch((error) => {
        if (error.response?.status === 401) cerrarSesion();
        else setHayError(true);
      });
  }, [token, intento, cerrarSesion]);

  //si la página se cierra antes, se cancela el temporizador del aviso flotante
  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  function reintentar() {
    setHayError(false);
    setIntento((anterior) => anterior + 1);
  }

  function avisar(nuevo: Aviso) {
    setAviso(nuevo);
    window.clearTimeout(temporizador.current);
    //los avisos de éxito se van solos; los errores se quedan hasta la siguiente acción
    if (nuevo.tipo === "ok") temporizador.current = window.setTimeout(() => setAviso(null), 2600);
  }

  //publicar y cerrar son el mismo cambio: solo cambia el estado
  function cambiarEstado(vacante: VacanteGestion, estado: EstadoVacante) {
    if (token === null) return;
    setAviso(null);
    cambiarEstadoVacante(token, vacante.id, estado)
      .then(() => {
        //se cambia solo esa vacante en la lista, sin volver a pedirla entera
        setVacantes((anteriores) => anteriores!.map((v) => (v.id === vacante.id ? { ...v, estado } : v)));
        avisar({ tipo: "ok", texto: estado === "publicada" ? `"${vacante.titulo}" ya está publicada.` : `"${vacante.titulo}" quedó cerrada.` });
      })
      .catch((error) => {
        if (error.response?.status === 401) cerrarSesion();
        //400: la regla de la API (fecha vencida); se muestra su mensaje
        else if (error.response?.status === 400) avisar({ tipo: "error", texto: error.response.data.detail });
        else avisar({ tipo: "error", texto: estado === "publicada" ? "No pudimos publicar la vacante." : "No pudimos cerrar la vacante." });
      });
  }

  //el enlace público que el reclutador pega en LinkedIn o Computrabajo
  function copiarEnlace(vacante: VacanteGestion) {
    navigator.clipboard
      .writeText(`${window.location.origin}/vacantes/${vacante.id}`)
      .then(() => avisar({ tipo: "ok", texto: "Enlace copiado. Pégalo en LinkedIn o Computrabajo." }))
      .catch(() => avisar({ tipo: "error", texto: "No pudimos copiar el enlace." }));
  }

  if (hayError)
    return (
      <div className="mis-vacantes__aviso" role="alert">
        <h1>No pudimos cargar las vacantes</h1>
        <p>Revisa tu conexión e inténtalo de nuevo. Si el problema sigue, vuelve en unos minutos.</p>
        <button className="boton boton--primario boton--chico" type="button" onClick={reintentar}>
          <RefreshCw size={16} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    );

  if (vacantes === null) return <Esqueleto />;

  if (vacantes.length === 0) return <SinVacantes />;

  const visibles = vacantes.filter(
    (vacante) => (filtro === "todas" || vacante.estado === filtro) && vacante.titulo.toLowerCase().includes(texto.trim().toLowerCase()),
  );
  const publicadas = vacantes.filter((vacante) => vacante.estado === "publicada").length;
  const totalPostulaciones = vacantes.reduce((total, vacante) => total + totalDeVacante(vacante), 0);

  return (
    <div className="mis-vacantes">
      <div className="mis-vacantes__cabecera">
        <div>
          <h1>Mis vacantes</h1>
          <p>
            <b>
              {publicadas} {publicadas === 1 ? "publicada recibe" : "publicadas reciben"}
            </b>{" "}
            postulaciones · {textoPostulaciones(totalPostulaciones)} en total
          </p>
        </div>
        <Link className="boton boton--primario boton--chico" to="/reclutador/vacantes/nueva">
          <Plus size={16} aria-hidden="true" />
          Nueva vacante
        </Link>
      </div>

      <div className="mis-vacantes__filtros">
        <div className="mis-vacantes__pestanas" role="group" aria-label="Filtrar por estado">
          {PESTANAS.map((pestana) => (
            <button className="mis-vacantes__pestana" type="button" aria-pressed={filtro === pestana.valor} onClick={() => setFiltro(pestana.valor)} key={pestana.valor}>
              {pestana.nombre}
              <span>{pestana.valor === "todas" ? vacantes.length : vacantes.filter((vacante) => vacante.estado === pestana.valor).length}</span>
            </button>
          ))}
        </div>
        <label className="mis-vacantes__buscar">
          <span className="solo-lectores">Buscar vacante</span>
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Buscar por título" value={texto} onChange={(evento) => setTexto(evento.target.value)} />
        </label>
      </div>

      {aviso?.tipo === "error" && (
        <p className="mis-vacantes__error" role="alert">
          {aviso.texto}
        </p>
      )}

      {visibles.length === 0 ? (
        <p className="mis-vacantes__sin-coincidencias">Ninguna vacante coincide con la búsqueda.</p>
      ) : (
        <ul className="mis-vacantes__lista">
          {visibles.map((vacante) => (
            <FilaVacante
              vacante={vacante}
              alPublicar={() => cambiarEstado(vacante, "publicada")}
              alCerrar={() => cambiarEstado(vacante, "cerrada")}
              alCopiar={() => copiarEnlace(vacante)}
              key={vacante.id}
            />
          ))}
        </ul>
      )}

      {/* el aviso de éxito flota abajo y se va solo */}
      <div className={`mis-vacantes__toast ${aviso?.tipo === "ok" ? "mis-vacantes__toast--visible" : ""}`} role="status">
        {aviso?.tipo === "ok" && (
          <>
            <Check size={16} aria-hidden="true" />
            {aviso.texto}
          </>
        )}
      </div>
    </div>
  );
}

type PropiedadesFila = {
  vacante: VacanteGestion;
  alPublicar: () => void;
  alCerrar: () => void;
  alCopiar: () => void;
};

//cada fila responde: qué es, cuándo cierra, cómo va y qué puedo hacer
function FilaVacante({ vacante, alPublicar, alCerrar, alCopiar }: PropiedadesFila) {
  const total = totalDeVacante(vacante);
  const sinRevisar = vacante.conteos.recibida ?? 0;
  //publicada pero con la fecha pasada: ya no aparece en la lista pública
  const vencida = vacante.estado === "publicada" && vacante.fecha_limite < hoyIso();
  const rutaEditar = `/reclutador/vacantes/${vacante.id}/editar`;

  return (
    <li className={`fila-vacante fila-vacante--${vacante.estado}`}>
      <div className="fila-vacante__principal">
        <div className="fila-vacante__titulo">
          <Link to={rutaEditar}>{vacante.titulo}</Link>
          <span className={`etiqueta-estado etiqueta-estado--${vacante.estado}`}>{NOMBRES_ESTADO[vacante.estado]}</span>
        </div>
        <p className="fila-vacante__meta">
          {NOMBRES_MODALIDAD[vacante.modalidad]}
          {vacante.ubicacion && ` · ${vacante.ubicacion}`} · creada el {fechaDeCreacion(vacante.creado_en)}
        </p>
      </div>

      <Cierre vacante={vacante} vencida={vencida} />

      <div className="fila-vacante__avance">
        {total === 0 ? (
          <span className="fila-vacante__sin-postulaciones">{vacante.estado === "borrador" ? "Recibirá postulaciones al publicarla" : "Todavía sin postulaciones"}</span>
        ) : (
          <>
            <div className="fila-vacante__cifras">
              <Link className="fila-vacante__total" to={`/reclutador/candidatos?vacante=${vacante.id}`}>
                {total}
                <span>{total === 1 ? "postulación" : "postulaciones"}</span>
              </Link>
              {sinRevisar > 0 ? <small>{sinRevisar} sin revisar</small> : <small className="fila-vacante__al-dia">Todo revisado</small>}
            </div>
            <BarraEstados conteos={vacante.conteos} />
          </>
        )}
      </div>

      <div className="fila-vacante__acciones">
        {/* la acción principal cambia según el estado */}
        {vacante.estado === "borrador" && (
          <button className="boton boton--primario boton--chico" type="button" onClick={alPublicar}>
            <Send size={15} aria-hidden="true" />
            Publicar
          </button>
        )}
        {vacante.estado === "publicada" && (
          <button className="boton boton--secundario boton--chico" type="button" onClick={alCopiar}>
            <Link2 size={15} aria-hidden="true" />
            Copiar enlace
          </button>
        )}
        {vacante.estado === "cerrada" && (
          <Link className="boton boton--secundario boton--chico" to={rutaEditar}>
            <Pencil size={15} aria-hidden="true" />
            Editar
          </Link>
        )}
        <MasAcciones titulo={vacante.titulo}>
          {total > 0 && (
            <Link to={`/reclutador/candidatos?vacante=${vacante.id}`} role="menuitem">
              <Users size={16} aria-hidden="true" />
              Ver postulaciones
            </Link>
          )}
          {vacante.estado !== "cerrada" && (
            <Link to={rutaEditar} role="menuitem">
              <Pencil size={16} aria-hidden="true" />
              Editar
            </Link>
          )}
          {vacante.estado === "publicada" && !vencida && (
            <a href={`/vacantes/${vacante.id}`} target="_blank" rel="noreferrer" role="menuitem">
              <Eye size={16} aria-hidden="true" />
              Ver como candidato
            </a>
          )}
          {vacante.estado === "publicada" && (
            <button type="button" role="menuitem" onClick={alCerrar}>
              <Lock size={16} aria-hidden="true" />
              Cerrar vacante
            </button>
          )}
          {vacante.estado === "cerrada" && (
            <Link to={rutaEditar} role="menuitem">
              <Send size={16} aria-hidden="true" />
              Reabrir con nueva fecha
            </Link>
          )}
        </MasAcciones>
      </div>

      {vencida && (
        <div className="fila-vacante__alerta">
          <span>Su fecha límite ya pasó: no aparece en la lista pública ni recibe postulaciones.</span>
          <span>
            <button type="button" onClick={alCerrar}>
              Cerrarla
            </button>{" "}
            o <Link to={rutaEditar}>extender la fecha</Link>
          </span>
        </div>
      )}
    </li>
  );
}

function Cierre({ vacante, vencida }: { vacante: VacanteGestion; vencida: boolean }) {
  if (vacante.estado === "borrador")
    return (
      <div className="fila-vacante__cierre">
        <b>Cierre: {fechaCorta(vacante.fecha_limite)}</b>
        <small>al publicarla</small>
      </div>
    );
  if (vacante.estado === "cerrada")
    return (
      <div className="fila-vacante__cierre">
        <b>Cerrada</b>
        <small>límite: {fechaCorta(vacante.fecha_limite)}</small>
      </div>
    );
  const cierre = describirCierre(vacante.fecha_limite);
  return (
    <div className={`fila-vacante__cierre ${cierre.proximo || vencida ? "fila-vacante__cierre--pronto" : ""}`}>
      <b>{cierre.texto}</b>
      <small>{vencida ? "ya no recibe postulaciones" : "recibe postulaciones"}</small>
    </div>
  );
}

//el botón ⋮ con las acciones menos frecuentes; se cierra al elegir, al hacer clic fuera o con Escape
function MasAcciones({ titulo, children }: { titulo: string; children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alHacerClic = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", alHacerClic);
    document.addEventListener("keydown", alPulsar);
    return () => {
      document.removeEventListener("mousedown", alHacerClic);
      document.removeEventListener("keydown", alPulsar);
    };
  }, [abierto]);

  return (
    <div className="mas-acciones" ref={contenedor}>
      <button
        className="mas-acciones__boton"
        type="button"
        aria-label={`Más acciones para ${titulo}`}
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((actual) => !actual)}>
        <MoreVertical size={18} aria-hidden="true" />
      </button>
      {abierto && (
        <div className="mas-acciones__menu" role="menu" onClick={() => setAbierto(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

//sin vacantes: se explica cómo funciona en tres pasos
function SinVacantes() {
  return (
    <div className="mis-vacantes">
      <div className="mis-vacantes__cabecera">
        <div>
          <h1>Mis vacantes</h1>
          <p>Aquí verás cada vacante que crees, con sus postulaciones.</p>
        </div>
      </div>
      <div className="mis-vacantes__vacio">
        <h2>Todavía no tienes vacantes</h2>
        <p>Una vacante es la puerta de entrada de los candidatos. Así funciona:</p>
        <ol>
          <li>
            <span>
              <b>Créala como borrador.</b> Título, descripción, requisitos y fecha límite. Nadie la ve todavía.
            </span>
          </li>
          <li>
            <span>
              <b>Publícala.</b> Aparece en la lista pública y obtienes su enlace.
            </span>
          </li>
          <li>
            <span>
              <b>Comparte el enlace</b> en LinkedIn o Computrabajo. Las postulaciones llegan a tu Resumen.
            </span>
          </li>
        </ol>
        <Link className="boton boton--primario boton--chico" to="/reclutador/vacantes/nueva">
          <Plus size={16} aria-hidden="true" />
          Crear la primera vacante
        </Link>
      </div>
    </div>
  );
}

function Esqueleto() {
  return (
    <div className="mis-vacantes" aria-busy="true">
      <span className="solo-lectores">Cargando tus vacantes…</span>
      <span className="esqueleto-panel" style={{ width: 220, height: 36 }} />
      <span className="esqueleto-panel" style={{ width: "min(340px, 80%)", height: 18, marginTop: 12 }} />
      <span className="esqueleto-panel" style={{ height: 44, marginTop: 28 }} />
      {[1, 2, 3, 4].map((fila) => (
        <span className="esqueleto-panel" style={{ height: 64, marginTop: 14 }} key={fila} />
      ))}
    </div>
  );
}

export default VacantesReclutador;
