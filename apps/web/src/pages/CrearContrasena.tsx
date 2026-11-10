import { useContext, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Circle, LoaderCircle } from "lucide-react";
import CampoAcceso from "../componentes/acceso/CampoAcceso";
import { UsuarioContext } from "../contexto/UsuarioContext";
import { consultarEnlace, crearContrasena, mensajeDeError } from "../servicios/usuarios";
import type { InfoEnlace } from "../tipos/usuarios";

const MINIMO = 15;

//la persona invitada (o que pidió restablecer) crea su contraseña y entra directo al panel
export default function CrearContrasena() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error("CrearContrasena debe estar dentro de UsuarioProvider");
  const { entrarConToken } = contexto;
  const navegar = useNavigate();

  //el token llega después de "#" (el navegador no lo envía a ningún servidor)
  const [token] = useState(() => window.location.hash.slice(1));
  const [info, setInfo] = useState<InfoEnlace | null>(null);
  const [problema, setProblema] = useState(token ? "" : "Este enlace está incompleto. Ábrelo desde el correo o cópialo completo.");
  const [contrasena, setContrasena] = useState("");
  const [repetida, setRepetida] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  //ya leído, se borra de la barra de direcciones y del historial
  useEffect(() => {
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
  }, []);

  useEffect(() => {
    if (!token) return;
    consultarEnlace(token)
      .then((datos) => setInfo(datos))
      .catch((fallo) => setProblema(mensajeDeError(fallo, "No pudimos comprobar el enlace. Revisa tu conexión y vuelve a abrirlo.")));
  }, [token]);

  const largoOk = contrasena.length >= MINIMO;
  const coinciden = repetida.length > 0 && repetida === contrasena;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!largoOk || !coinciden) {
      setError(!largoOk ? `La contraseña necesita al menos ${MINIMO} caracteres.` : "Las dos contraseñas no coinciden.");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      await entrarConToken(await crearContrasena(token, contrasena));
      navegar("/reclutador/resumen", { replace: true });
    } catch (fallo) {
      setError(mensajeDeError(fallo, "No pudimos guardar la contraseña. Inténtalo de nuevo."));
      setEnviando(false);
    }
  }

  const esInvitacion = info?.tipo !== "restablecer";
  const nombre = info?.nombres.split(" ")[0];

  return (
    <section className="acceso" aria-labelledby="titulo-acceso">
      <div className="acceso__interior">
        <div className="acceso__presentacion">
          <h1 id="titulo-acceso">{nombre ? `Hola, ${nombre}` : "Tu acceso al equipo"}</h1>
          <p className="acceso__descripcion">
            {esInvitacion
              ? "Te invitaron al equipo de selección. Crea tu contraseña y entrarás directo al panel."
              : "Crea una contraseña nueva para tu cuenta. La anterior deja de funcionar en cuanto guardes esta."}
          </p>
          <ul className="acceso__consejos" aria-label="Consejos para tu contraseña">
            <li>
              <strong>Una frase funciona mejor</strong>
              <p>Varias palabras que solo tú relacionas son más fáciles de recordar y más difíciles de adivinar que una palabra con símbolos.</p>
            </li>
            <li>
              <strong>Solo para esta cuenta</strong>
              <p>No reutilices la contraseña de tu correo ni de otros sistemas.</p>
            </li>
          </ul>
        </div>

        <section className="acceso__panel" aria-labelledby="titulo-formulario" aria-busy={!info && !problema}>
          {problema ? (
            <>
              <h2 id="titulo-formulario">El enlace no sirve</h2>
              <p className="acceso__subtitulo">{problema}</p>
              <p className="acceso__nota">Pídele a un administrador del equipo que te envíe un enlace nuevo. Cada enlace funciona una sola vez.</p>
              <Link className="acceso__enviar" to="/iniciar-sesion">
                Ir a iniciar sesión <ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" />
              </Link>
            </>
          ) : !info ? (
            <div className="acceso__comprobando">
              <LoaderCircle className="girando" size={20} aria-hidden="true" />
              Comprobando el enlace…
            </div>
          ) : (
            <>
              <h2 id="titulo-formulario">{esInvitacion ? "Crea tu contraseña" : "Crea una contraseña nueva"}</h2>
              <p className="acceso__subtitulo">
                Para entrar con <b>{info.correo}</b>.
              </p>
              <form className="acceso__formulario" onSubmit={enviar} noValidate>
                {/* el correo va oculto para que el gestor de contraseñas la guarde con su usuario */}
                <input type="email" name="usuario" autoComplete="username" value={info.correo} readOnly hidden />
                <CampoAcceso id="contrasena" etiqueta="Contraseña" tipo="password" autocompletar="new-password" valor={contrasena} alCambiar={setContrasena} describe="requisitos-contrasena" />
                <CampoAcceso id="repetida" etiqueta="Repítela" tipo="password" autocompletar="new-password" valor={repetida} alCambiar={setRepetida} describe="requisitos-contrasena" />
                <ul className="acceso__requisitos" id="requisitos-contrasena" aria-live="polite">
                  <li className={largoOk ? "acceso__requisito--ok" : undefined}>
                    {largoOk ? <Check size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}
                    Al menos {MINIMO} caracteres{!largoOk && contrasena.length > 0 && ` (llevas ${contrasena.length})`}
                  </li>
                  <li className={coinciden ? "acceso__requisito--ok" : undefined}>
                    {coinciden ? <Check size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}
                    Las dos coinciden
                  </li>
                </ul>
                <button className="acceso__enviar" type="submit" disabled={enviando}>
                  {enviando ? "Guardando…" : "Guardar y entrar"}
                  {enviando ? <LoaderCircle className="girando" size={17} aria-hidden="true" /> : <ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" />}
                </button>
                {error && (
                  <p role="alert" className="acceso__error">
                    {error}
                  </p>
                )}
              </form>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
