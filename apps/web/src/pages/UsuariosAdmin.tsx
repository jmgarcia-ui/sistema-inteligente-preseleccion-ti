import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, Check, Copy, KeyRound, LoaderCircle, RefreshCw, Send, ShieldCheck, UserCheck, UserPlus, UserRound, UserX, X } from "lucide-react";
import "../style/usuarios.css";
import { UsuarioContext } from "../contexto/UsuarioContext";
import MasAcciones from "../componentes/panel/MasAcciones";
import { actualizarCuenta, enviarEnlace, invitarCuenta, listarCuentas, mensajeDeError } from "../servicios/usuarios";
import type { Rol } from "../tipos/sesion";
import type { CambiosCuenta, CuentaEquipo, ResultadoEnlace } from "../tipos/usuarios";
import { describirEspera, fechaDeCreacion } from "../utilidades/panel";

type Filtro = "todas" | "activas" | "pendientes" | "desactivadas";

const PESTANAS: { valor: Filtro; nombre: string; incluye: (cuenta: CuentaEquipo) => boolean }[] = [
  { valor: "todas", nombre: "Todas", incluye: () => true },
  { valor: "activas", nombre: "Activas", incluye: (c) => c.activo && !c.invitacion_pendiente },
  { valor: "pendientes", nombre: "Invitaciones pendientes", incluye: (c) => c.activo && c.invitacion_pendiente },
  { valor: "desactivadas", nombre: "Desactivadas", incluye: (c) => !c.activo },
];

const ROLES: { valor: Rol; nombre: string; descripcion: string; Icono: typeof UserRound }[] = [
  { valor: "reclutador", nombre: "Reclutador", descripcion: "Crea vacantes y decide sobre sus candidatos.", Icono: UserRound },
  { valor: "administrador", nombre: "Administrador", descripcion: "Además ve todas las vacantes y gestiona las cuentas del equipo.", Icono: ShieldCheck },
];

const NOMBRE_ROL: Record<Rol, string> = { administrador: "Administrador", reclutador: "Reclutador" };

//la gestión de las cuentas del equipo: invitar, cambiar rol, desactivar y enviar enlaces de contraseña
export default function UsuariosAdmin() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error("UsuariosAdmin debe estar dentro de UsuarioProvider");
  const { token, usuario, cerrarSesion } = contexto;

  const [cuentas, setCuentas] = useState<CuentaEquipo[] | null>(null);
  const [hayError, setHayError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [invitando, setInvitando] = useState(false);
  //el último enlace generado (invitación o restablecer), para mostrar si llegó el correo y poder copiarlo
  const [resultado, setResultado] = useState<ResultadoEnlace | null>(null);
  const [aviso, setAviso] = useState("");
  const temporizador = useRef<number | undefined>(undefined);
  const esAdministrador = usuario?.rol === "administrador";

  useEffect(() => {
    if (token === null || !esAdministrador) return;
    listarCuentas(token)
      .then((datos) => setCuentas(datos))
      .catch((error) => {
        if (error.response?.status === 401) cerrarSesion();
        else setHayError(true);
      });
  }, [token, intento, esAdministrador, cerrarSesion]);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  function avisar(texto: string) {
    setAviso(texto);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setAviso(""), 2600);
  }

  function reemplazar(cuenta: CuentaEquipo) {
    setCuentas((anteriores) => {
      if (!anteriores) return [cuenta];
      return anteriores.some((c) => c.id === cuenta.id) ? anteriores.map((c) => (c.id === cuenta.id ? cuenta : c)) : [...anteriores, cuenta];
    });
  }

  //el panel puede cargarse antes de saber el rol: se espera a tenerlo
  if (usuario === null) return <Esqueleto />;

  if (!esAdministrador)
    return (
      <div className="usuarios__aviso">
        <h1>Solo para administradores</h1>
        <p>Las cuentas del equipo las gestiona un administrador. Si necesitas invitar a alguien o cambiar un acceso, pídeselo a uno.</p>
      </div>
    );

  if (hayError)
    return (
      <div className="usuarios__aviso" role="alert">
        <h1>No pudimos cargar las cuentas</h1>
        <p>Revisa tu conexión e inténtalo de nuevo.</p>
        <button
          className="boton boton--primario boton--chico"
          type="button"
          onClick={() => {
            setHayError(false);
            setIntento((anterior) => anterior + 1);
          }}>
          <RefreshCw size={16} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    );

  if (cuentas === null || token === null) return <Esqueleto />;

  const pestana = PESTANAS.find((p) => p.valor === filtro) ?? PESTANAS[0];
  const visibles = cuentas.filter(pestana.incluye);
  const activas = cuentas.filter(PESTANAS[1].incluye).length;
  const pendientes = cuentas.filter(PESTANAS[2].incluye).length;

  return (
    <div className="usuarios">
      <div className="usuarios__cabecera">
        <div>
          <h1>Usuarios</h1>
          <p>
            <b>
              {activas} {activas === 1 ? "cuenta activa" : "cuentas activas"}
            </b>
            {pendientes > 0 && ` · ${pendientes} ${pendientes === 1 ? "invitación sin aceptar" : "invitaciones sin aceptar"}`}
          </p>
        </div>
        {!invitando && (
          <button className="boton boton--primario boton--chico" type="button" onClick={() => setInvitando(true)}>
            <UserPlus size={16} aria-hidden="true" />
            Invitar persona
          </button>
        )}
      </div>

      {invitando && (
        <FormularioInvitacion
          alCancelar={() => setInvitando(false)}
          alInvitar={async (datos) => {
            const nuevo = await invitarCuenta(token, datos);
            reemplazar(nuevo.usuario);
            setResultado(nuevo);
            setInvitando(false);
            setFiltro("todas");
          }}
        />
      )}

      {resultado && <AvisoEnlace resultado={resultado} alCerrar={() => setResultado(null)} key={resultado.enlace} />}

      <div className="usuarios__pestanas" role="group" aria-label="Filtrar cuentas">
        {PESTANAS.map((p) => {
          const total = cuentas.filter(p.incluye).length;
          //las pestañas vacías (salvo "Todas") no aportan: se ocultan
          if (p.valor !== "todas" && total === 0 && filtro !== p.valor) return null;
          return (
            <button className="usuarios__pestana" type="button" aria-pressed={filtro === p.valor} onClick={() => setFiltro(p.valor)} key={p.valor}>
              {p.nombre}
              <span>{total}</span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <p className="usuarios__nada">No hay cuentas en este grupo.</p>
      ) : (
        <ul className="usuarios__lista">
          {visibles.map((cuenta) => (
            <FilaCuenta
              cuenta={cuenta}
              esUnoMismo={cuenta.id === usuario.id}
              alCambiar={async (cambios, textoListo) => {
                reemplazar(await actualizarCuenta(token, cuenta.id, cambios));
                avisar(textoListo);
              }}
              alEnviarEnlace={async () => {
                const nuevo = await enviarEnlace(token, cuenta.id);
                reemplazar(nuevo.usuario);
                setResultado(nuevo);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              key={cuenta.id}
            />
          ))}
        </ul>
      )}

      {cuentas.length === 1 && (
        <p className="usuarios__solo">
          Por ahora eres la única persona del equipo. Invita a tus reclutadores: cada uno recibe un correo con un enlace para crear su propia contraseña, y nadie más la conoce.
        </p>
      )}

      <div className={`usuarios__toast ${aviso ? "usuarios__toast--visible" : ""}`} role="status">
        {aviso && (
          <>
            <Check size={16} aria-hidden="true" />
            {aviso}
          </>
        )}
      </div>
    </div>
  );
}

// ---- invitar ----

function FormularioInvitacion({ alInvitar, alCancelar }: { alInvitar: (datos: { nombres: string; apellidos: string; correo: string; rol: Rol }) => Promise<void>; alCancelar: () => void }) {
  const [rol, setRol] = useState<Rol>("reclutador");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setEnviando(true);
    setError("");
    try {
      await alInvitar({
        nombres: String(datos.get("nombres") ?? "").trim(),
        apellidos: String(datos.get("apellidos") ?? "").trim(),
        correo: String(datos.get("correo") ?? "").trim(),
        rol,
      });
    } catch (fallo) {
      setError(mensajeDeError(fallo, "No pudimos enviar la invitación. Revisa los datos e inténtalo de nuevo."));
      setEnviando(false);
    }
  }

  return (
    <form className="invitacion" onSubmit={enviar} aria-labelledby="titulo-invitacion">
      <div className="invitacion__titulo">
        <h2 id="titulo-invitacion">Invitar a una persona</h2>
        <p>Le llega un correo con un enlace para crear su contraseña. El enlace vence en 7 días.</p>
      </div>

      <div className="invitacion__campos">
        <label className="invitacion__campo">
          <span>Nombres</span>
          <input name="nombres" autoComplete="off" maxLength={100} required autoFocus />
        </label>
        <label className="invitacion__campo">
          <span>Apellidos</span>
          <input name="apellidos" autoComplete="off" maxLength={100} required />
        </label>
        <label className="invitacion__campo invitacion__campo--ancho">
          <span>Correo de trabajo</span>
          <input name="correo" type="email" autoComplete="off" maxLength={254} placeholder="nombre@empresa.com" required />
        </label>
      </div>

      <fieldset className="invitacion__roles">
        <legend>Rol</legend>
        {ROLES.map(({ valor, nombre, descripcion, Icono }) => (
          <label className="opcion-rol" key={valor}>
            <input type="radio" name="rol" value={valor} checked={rol === valor} onChange={() => setRol(valor)} />
            <Icono size={18} aria-hidden="true" />
            <span>
              <b>{nombre}</b>
              <small>{descripcion}</small>
            </span>
          </label>
        ))}
      </fieldset>

      {error && (
        <p className="invitacion__error" role="alert">
          {error}
        </p>
      )}

      <div className="invitacion__botones">
        <button className="boton boton--fantasma boton--chico" type="button" onClick={alCancelar} disabled={enviando}>
          Cancelar
        </button>
        <button className="boton boton--primario boton--chico" type="submit" disabled={enviando}>
          {enviando ? <LoaderCircle className="girando" size={16} aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
          {enviando ? "Enviando…" : "Enviar invitación"}
        </button>
      </div>
    </form>
  );
}

// ---- resultado de un enlace: si llegó el correo, y el enlace para copiarlo ----

function AvisoEnlace({ resultado, alCerrar }: { resultado: ResultadoEnlace; alCerrar: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const { usuario, correo_enviado: enviado } = resultado;
  const quien = `${usuario.nombres} ${usuario.apellidos}`;
  const vence = new Date(resultado.expira_en.endsWith("Z") ? resultado.expira_en : `${resultado.expira_en}Z`).toLocaleString("es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const que = resultado.tipo === "invitacion" ? "la invitación" : "el enlace para crear una contraseña nueva";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(resultado.enlace);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className={`aviso-enlace ${enviado ? "" : "aviso-enlace--fallo"}`} role="status">
      {enviado ? <Check className="aviso-enlace__icono" size={18} aria-hidden="true" /> : <AlertTriangle className="aviso-enlace__icono" size={18} aria-hidden="true" />}
      <div className="aviso-enlace__texto">
        <p>
          {enviado ? (
            <>
              Enviamos {que} a <b>{usuario.correo}</b>.
            </>
          ) : (
            <>
              No pudimos enviar el correo a <b>{usuario.correo}</b>. Copia el enlace y envíaselo a {quien} por otro medio.
            </>
          )}
        </p>
        <small>Vence el {vence} y sirve una sola vez. Si se genera otro, este deja de funcionar.</small>
      </div>
      <div className="aviso-enlace__acciones">
        <button className={`boton boton--chico ${enviado ? "boton--secundario" : "boton--primario"}`} type="button" onClick={copiar}>
          {copiado ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          {copiado ? "Copiado" : "Copiar enlace"}
        </button>
        <button className="aviso-enlace__cerrar" type="button" aria-label="Cerrar aviso" onClick={alCerrar}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ---- una cuenta ----

type Confirmacion = { texto: string; boton: string; peligro: boolean; cambios: CambiosCuenta; listo: string };

type PropiedadesFila = {
  cuenta: CuentaEquipo;
  esUnoMismo: boolean;
  alCambiar: (cambios: CambiosCuenta, textoListo: string) => Promise<void>;
  alEnviarEnlace: () => Promise<void>;
};

function FilaCuenta({ cuenta, esUnoMismo, alCambiar, alEnviarEnlace }: PropiedadesFila) {
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const nombre = `${cuenta.nombres} ${cuenta.apellidos}`;
  const estado = !cuenta.activo ? "desactivada" : cuenta.invitacion_pendiente ? "pendiente" : "activa";
  const nombreEstado = { activa: "Activa", pendiente: "Invitación pendiente", desactivada: "Desactivada" }[estado];
  const vacantes = cuenta.vacantes === 1 ? "su vacante" : `sus ${cuenta.vacantes} vacantes`;

  async function ejecutar(accion: () => Promise<void>, textoError: string) {
    setOcupado(true);
    setError("");
    try {
      await accion();
      setConfirmacion(null);
    } catch (fallo) {
      setError(mensajeDeError(fallo, textoError));
    } finally {
      setOcupado(false);
    }
  }

  //cambiar el rol y desactivar se confirman en la misma fila; reactivar y enviar enlaces no lo necesitan
  const pedirRol = () =>
    setConfirmacion(
      cuenta.rol === "reclutador"
        ? {
            texto: `¿Dar acceso de administrador a ${nombre}? Podrá ver todas las vacantes y gestionar las cuentas del equipo.`,
            boton: "Hacer administrador",
            peligro: false,
            cambios: { rol: "administrador" },
            listo: `${cuenta.nombres} ahora es administrador.`,
          }
        : {
            texto: `¿Quitarle el acceso de administrador a ${nombre}? Seguirá como reclutador, con sus vacantes.`,
            boton: "Hacer reclutador",
            peligro: false,
            cambios: { rol: "reclutador" },
            listo: `${cuenta.nombres} ahora es reclutador.`,
          },
    );

  const pedirDesactivar = () =>
    setConfirmacion({
      texto: `¿Desactivar la cuenta de ${nombre}? No podrá entrar y su sesión se cierra al instante.${cuenta.vacantes > 0 ? ` ${vacantes[0].toUpperCase()}${vacantes.slice(1)} se mantienen y los administradores las siguen viendo.` : ""}`,
      boton: "Desactivar cuenta",
      peligro: true,
      cambios: { activo: false },
      listo: `Desactivaste la cuenta de ${cuenta.nombres}.`,
    });

  return (
    <li className={`fila-cuenta fila-cuenta--${estado}`}>
      <div className="fila-cuenta__persona">
        <span className="fila-cuenta__iniciales" aria-hidden="true">
          {`${cuenta.nombres.charAt(0)}${cuenta.apellidos.charAt(0)}`.toUpperCase()}
        </span>
        <span className="fila-cuenta__nombre">
          <b>
            {nombre}
            {esUnoMismo && <span className="fila-cuenta__tu">Tú</span>}
          </b>
          <span>{cuenta.correo}</span>
        </span>
      </div>

      <span className="fila-cuenta__rol">
        {cuenta.rol === "administrador" ? <ShieldCheck size={15} aria-hidden="true" /> : <UserRound size={15} aria-hidden="true" />}
        {NOMBRE_ROL[cuenta.rol]}
      </span>

      <span className={`estado-cuenta estado-cuenta--${estado}`}>{nombreEstado}</span>

      <span className="fila-cuenta__dato">
        <small>{estado === "pendiente" ? "Invitada" : "Último acceso"}</small>
        {estado === "pendiente" ? fechaDeCreacion(cuenta.creado_en) : haceCuanto(cuenta.ultimo_acceso_en)}
      </span>

      <span className="fila-cuenta__dato fila-cuenta__vacantes">
        <small>Vacantes</small>
        {cuenta.vacantes === 0 ? "—" : cuenta.vacantes}
      </span>

      <div className="fila-cuenta__acciones">
        {esUnoMismo ? null : ocupado && !confirmacion ? (
          <LoaderCircle className="girando fila-cuenta__ocupado" size={18} aria-label="Guardando" />
        ) : (
          <MasAcciones titulo={nombre}>
            {cuenta.activo && (
              <button type="button" role="menuitem" onClick={() => ejecutar(alEnviarEnlace, "No pudimos generar el enlace.")}>
                {cuenta.invitacion_pendiente ? <Send size={16} aria-hidden="true" /> : <KeyRound size={16} aria-hidden="true" />}
                {cuenta.invitacion_pendiente ? "Reenviar invitación" : "Restablecer contraseña"}
              </button>
            )}
            {cuenta.activo && (
              <button type="button" role="menuitem" onClick={pedirRol}>
                {cuenta.rol === "reclutador" ? <ShieldCheck size={16} aria-hidden="true" /> : <UserRound size={16} aria-hidden="true" />}
                {cuenta.rol === "reclutador" ? "Hacer administrador" : "Hacer reclutador"}
              </button>
            )}
            {cuenta.activo ? (
              <button className="mas-acciones__peligro" type="button" role="menuitem" onClick={pedirDesactivar}>
                <UserX size={16} aria-hidden="true" />
                Desactivar cuenta
              </button>
            ) : (
              <button type="button" role="menuitem" onClick={() => ejecutar(() => alCambiar({ activo: true }, `Reactivaste la cuenta de ${cuenta.nombres}.`), "No pudimos reactivar la cuenta.")}>
                <UserCheck size={16} aria-hidden="true" />
                Reactivar cuenta
              </button>
            )}
          </MasAcciones>
        )}
      </div>

      {confirmacion && (
        <div className="fila-cuenta__confirmar" role="alertdialog" aria-label={confirmacion.boton}>
          <p>{confirmacion.texto}</p>
          <div className="fila-cuenta__botones">
            <button className="boton boton--fantasma boton--chico" type="button" disabled={ocupado} onClick={() => setConfirmacion(null)}>
              Cancelar
            </button>
            <button
              className={`boton boton--chico ${confirmacion.peligro ? "boton--rojo" : "boton--primario"}`}
              type="button"
              disabled={ocupado}
              onClick={() => ejecutar(() => alCambiar(confirmacion.cambios, confirmacion.listo), "No pudimos guardar el cambio.")}>
              {ocupado && <LoaderCircle className="girando" size={15} aria-hidden="true" />}
              {confirmacion.boton}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="fila-cuenta__error" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}

//"hace 3 días"; pasado un mes, la fecha
function haceCuanto(fecha: string | null) {
  if (!fecha) return "Nunca";
  const espera = describirEspera(fecha);
  if (espera.dias > 30) return fechaDeCreacion(fecha);
  if (espera.unidad === "min" && espera.cantidad < 2) return "Ahora";
  return `Hace ${espera.cantidad} ${espera.unidad}`;
}

function Esqueleto() {
  return (
    <div className="usuarios" aria-busy="true">
      <span className="solo-lectores">Cargando cuentas…</span>
      <span className="esqueleto-panel" style={{ width: 180, height: 36 }} />
      <span className="esqueleto-panel" style={{ width: 240, height: 18, marginTop: 12 }} />
      {[1, 2, 3].map((fila) => (
        <span className="esqueleto-panel" style={{ height: 64, marginTop: 16 }} key={fila} />
      ))}
    </div>
  );
}
