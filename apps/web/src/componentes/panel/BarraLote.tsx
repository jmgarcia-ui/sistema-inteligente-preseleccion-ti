import { useContext, useEffect, useRef, useState } from "react";
import { LoaderCircle, Send, Star, X } from "lucide-react";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import { decidirLote, enviarCorreosLote } from "../../servicios/candidatos";
import type { CandidatoFila, Decision, ResultadoLote } from "../../tipos/candidatos";

//el backend envía como máximo 25 correos por pedido (cada uno espera la confirmación de Azure)
const MAXIMO_CORREOS = 25;

type Propiedades = {
  seleccion: CandidatoFila[];
  totalVisibles: number;
  alMarcarTodos: (marcar: boolean) => void;
  alLimpiar: () => void;
  alDecidir: (hechos: number[], estado: Decision) => void;
  alEnviar: () => void;
};

type Resultado = { titulo: string; omitidos: ResultadoLote["omitidos"]; paraCorreo?: number[] };

//arriba de la lista: marcar a varios y decidir o enviar sus correos de una vez
export default function BarraLote({ seleccion, totalVisibles, alMarcarTodos, alLimpiar, alDecidir, alEnviar }: Propiedades) {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error("BarraLote debe estar dentro de UsuarioProvider");
  const { token } = contexto;

  const [modo, setModo] = useState<"nada" | "descartar" | "enviar">("nada");
  const [motivo, setMotivo] = useState("");
  //a quiénes se enviará: la selección o los recién decididos
  const [idsEnvio, setIdsEnvio] = useState<number[]>([]);
  const [trabajando, setTrabajando] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState("");
  const casilla = useRef<HTMLInputElement>(null);

  const cantidad = seleccion.length;
  const todos = cantidad > 0 && cantidad === totalVisibles;

  //"algunos marcados": la casilla muestra un guion
  useEffect(() => {
    if (casilla.current) casilla.current.indeterminate = cantidad > 0 && !todos;
  }, [cantidad, todos]);

  async function decidir(estado: Decision, motivoDescarte?: string) {
    if (!token) return;
    setTrabajando(estado === "preseleccionada" ? "Preseleccionando…" : "Descartando…");
    setError("");
    try {
      const datos = await decidirLote(token, seleccion.map((c) => c.id), estado, motivoDescarte);
      alDecidir(datos.hechos, estado);
      const verbo = estado === "preseleccionada" ? "Preseleccionaste" : "Descartaste";
      setResultado({
        titulo: datos.hechos.length ? `${verbo} a ${personas(datos.hechos.length)}.` : "No se cambió a nadie.",
        omitidos: datos.omitidos,
        paraCorreo: datos.hechos.length ? datos.hechos : undefined,
      });
      setModo("nada");
      setMotivo("");
    } catch {
      setError("No pudimos guardar las decisiones. Inténtalo de nuevo.");
    } finally {
      setTrabajando("");
    }
  }

  async function enviar() {
    if (!token) return;
    setTrabajando(`Enviando ${correos(idsEnvio.length)}…`);
    setError("");
    try {
      const datos = await enviarCorreosLote(token, idsEnvio);
      alEnviar();
      setResultado({ titulo: datos.hechos.length ? `Se ${datos.hechos.length === 1 ? "envió" : "enviaron"} ${correos(datos.hechos.length)}.` : "No se envió ningún correo.", omitidos: datos.omitidos });
      setModo("nada");
    } catch {
      setError("No pudimos enviar los correos. Revisa el historial de cada candidato antes de reintentar.");
    } finally {
      setTrabajando("");
    }
  }

  function abrirEnvio(ids: number[]) {
    setIdsEnvio(ids);
    setResultado(null);
    setModo("enviar");
  }

  return (
    <div className="lote">
      <div className="lote__fila">
        <label className="lote__todos">
          <input type="checkbox" ref={casilla} checked={todos} disabled={totalVisibles === 0} onChange={(evento) => alMarcarTodos(evento.target.checked)} />
          {cantidad === 0 ? "Seleccionar" : `${cantidad} ${cantidad === 1 ? "seleccionado" : "seleccionados"}`}
        </label>
        {cantidad > 0 && (
          <button className="lote__limpiar" type="button" onClick={alLimpiar} aria-label="Quitar la selección">
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {cantidad > 0 && modo === "nada" && !trabajando && (
        <div className="lote__acciones">
          <button className="boton boton--secundario boton--chico" type="button" onClick={() => decidir("preseleccionada")}>
            <Star size={15} aria-hidden="true" />
            Preseleccionar
          </button>
          <button className="boton boton--secundario boton--chico" type="button" onClick={() => setModo("descartar")}>
            Descartar
          </button>
          <button className="boton boton--secundario boton--chico" type="button" onClick={() => abrirEnvio(seleccion.map((c) => c.id))}>
            <Send size={15} aria-hidden="true" />
            Enviar correos
          </button>
        </div>
      )}

      {modo === "descartar" && !trabajando && (
        <div className="lote__panel">
          <label htmlFor="motivo-lote">
            Motivo del descarte <span>(el mismo para {personas(cantidad)}; el candidato no lo ve)</span>
          </label>
          <textarea id="motivo-lote" rows={3} maxLength={500} value={motivo} onChange={(evento) => setMotivo(evento.target.value)} autoFocus />
          <div className="lote__botones">
            <button className="boton boton--fantasma boton--chico" type="button" onClick={() => setModo("nada")}>
              Cancelar
            </button>
            <button className="boton boton--primario boton--chico" type="button" disabled={!motivo.trim()} onClick={() => decidir("descartada", motivo.trim())}>
              Descartar a {cantidad}
            </button>
          </div>
        </div>
      )}

      {modo === "enviar" && !trabajando && (
        <div className="lote__panel">
          <p>
            Cada persona recibirá el borrador que ya está en su ficha (felicitación o feedback, según tu decisión). <b>Revisa los borradores antes: un correo enviado no se puede retirar.</b>
          </p>
          <p className="lote__nota">Se omite a quien no tenga decisión, no tenga un borrador que coincida o ya haya recibido su correo.</p>
          {idsEnvio.length > MAXIMO_CORREOS && <p className="lote__error">Puedes enviar hasta {MAXIMO_CORREOS} correos a la vez. Quita algunos de la selección.</p>}
          <div className="lote__botones">
            <button className="boton boton--fantasma boton--chico" type="button" onClick={() => setModo("nada")}>
              Cancelar
            </button>
            <button className="boton boton--primario boton--chico" type="button" disabled={idsEnvio.length > MAXIMO_CORREOS} onClick={enviar}>
              <Send size={15} aria-hidden="true" />
              Enviar {correos(idsEnvio.length)}
            </button>
          </div>
        </div>
      )}

      {trabajando && (
        <p className="lote__trabajando" role="status">
          <LoaderCircle size={16} aria-hidden="true" />
          {trabajando}
        </p>
      )}
      {error && (
        <p className="lote__error" role="alert">
          {error}
        </p>
      )}

      {resultado && !trabajando && (
        <div className="lote__resultado" role="status">
          <div className="lote__fila">
            <b>{resultado.titulo}</b>
            <button className="lote__limpiar" type="button" onClick={() => setResultado(null)} aria-label="Cerrar el resultado">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          {resultado.omitidos.length > 0 && (
            <ul>
              {resultado.omitidos.map((omitido) => (
                <li key={omitido.id}>
                  {omitido.nombre}: <span>{omitido.motivo}</span>
                </li>
              ))}
            </ul>
          )}
          {resultado.paraCorreo && (
            <button className="boton boton--primario boton--chico" type="button" onClick={() => abrirEnvio(resultado.paraCorreo ?? [])}>
              <Send size={15} aria-hidden="true" />
              Enviarles su correo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function personas(cantidad: number) {
  return cantidad === 1 ? "1 persona" : `${cantidad} personas`;
}

function correos(cantidad: number) {
  return cantidad === 1 ? "1 correo" : `${cantidad} correos`;
}
