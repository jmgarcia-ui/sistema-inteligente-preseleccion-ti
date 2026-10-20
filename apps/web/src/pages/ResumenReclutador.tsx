import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import "../style/resumen.css";
import { UsuarioContext } from "../contexto/UsuarioContext";
import BarraEstados from "../componentes/panel/BarraEstados";
import { obtenerResumen } from "../servicios/panel";
import type { EstadoPostulacion, ResumenPanel, VacanteResumen } from "../tipos/panel";
import { SEGMENTOS, DIAS_ESPERA_LARGA, describirEspera, describirFuentes, textoPostulaciones, totalDeVacante } from "../utilidades/panel";
import { describirCierre } from "../utilidades/vacantes";

//columnas de la tabla: los mismos estados y colores que la barra
const ESTADOS = SEGMENTOS;

const NOMBRES_ESTADO_VACANTE = { borrador: "Borrador", publicada: "Publicada", cerrada: "Cerrada" };

export default function ResumenReclutador() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error("Resumen reclutador debe estar dentro de UsuarioProvider");
  const { token, cerrarSesion } = contexto;

  const [resumen, setResumen] = useState<ResumenPanel | null>(null);
  const [hayError, setHayError] = useState(false);
  //cambiar este número vuelve a pedir el resumen
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (token === null) return;
    obtenerResumen(token)
      .then((datos) => setResumen(datos))
      .catch((error) => {
        //el token venció: al cerrar sesión, RutaProtegida lleva al login
        if (error.response?.status === 401) cerrarSesion();
        else setHayError(true);
      });
  }, [token, intento, cerrarSesion]);

  function reintentar() {
    setHayError(false);
    setIntento((anterior) => anterior + 1);
  }

  if (hayError)
    return (
      <div className="resumen__aviso" role="alert">
        <h1>No pudimos cargar el resumen</h1>
        <p>Revisa tu conexión e inténtalo de nuevo. Si el problema sigue, vuelve en unos minutos.</p>
        <button className="boton boton--primario boton--chico" type="button" onClick={reintentar}>
          <RefreshCw size={16} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    );

  if (resumen === null) return <Esqueleto />;

  //el titular se calcula con lo que ya llegó: no hace falta otra consulta
  const totalPorRevisar = sumar(resumen.vacantes, "recibida");
  const masAntigua = resumen.por_revisar[0];
  const esperaMasAntigua = masAntigua ? describirEspera(masAntigua.creado_en) : null;

  return (
    <div className="resumen">
      <p className="resumen__fecha">{hoy()}</p>

      {/* el titular es una frase con la situación del día, no un saludo */}
      {totalPorRevisar === 0 ? (
        <h1 className="resumen__situacion">Nadie espera una primera lectura.</h1>
      ) : (
        <h1 className="resumen__situacion">
          <em>
            {totalPorRevisar} {totalPorRevisar === 1 ? "postulación" : "postulaciones"}
          </em>{" "}
          {totalPorRevisar === 1 ? "espera" : "esperan"} una primera lectura.
        </h1>
      )}
      {masAntigua && esperaMasAntigua && (
        <p className="resumen__detalle">
          La más antigua llegó hace{" "}
          <b>
            {esperaMasAntigua.cantidad} {esperaMasAntigua.unidad}
          </b>
          , para {masAntigua.vacante.titulo}.
        </p>
      )}

      <div className="resumen__dos">
        <section aria-labelledby="titulo-cola">
          <div className="resumen__titulo">
            <h2 id="titulo-cola">
              Cola de lectura<span>{totalPorRevisar}</span>
            </h2>
            <p>Ordenada por tiempo de espera</p>
          </div>
          {resumen.por_revisar.length === 0 ? (
            <p className="resumen__vacio">Cuando alguien postule a tus vacantes, aparecerá aquí en orden de llegada.</p>
          ) : (
            <ul className="cola">
              {resumen.por_revisar.map((postulacion) => {
                const espera = describirEspera(postulacion.creado_en);
                const fuentes = describirFuentes(postulacion.candidato);
                return (
                  <li className="cola__fila" key={postulacion.id}>
                    <span className={`cola__espera ${espera.dias >= DIAS_ESPERA_LARGA ? "cola__espera--larga" : ""}`}>
                      <b>{espera.cantidad}</b>
                      <span>{espera.unidad}</span>
                    </span>
                    <span className="cola__quien">
                      <b>
                        {postulacion.candidato.nombres} {postulacion.candidato.apellidos}
                      </b>
                      <span>{postulacion.vacante.titulo}</span>
                      <small>{fuentes || "Sin enlaces"}</small>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {totalPorRevisar > resumen.por_revisar.length && (
            <Link className="resumen__mas" to="/reclutador/candidatos">
              Ver las {totalPorRevisar} en Candidatos
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </section>

        <section className="matriz" aria-labelledby="titulo-matriz">
          <div className="resumen__titulo">
            <h2 id="titulo-matriz">Tus vacantes, estado por estado</h2>
            <p>{textoPostulaciones(sumarTodo(resumen.vacantes))} en total</p>
          </div>
          {resumen.vacantes.length === 0 ? (
            <p className="resumen__vacio">Todavía no tienes vacantes publicadas ni borradores.</p>
          ) : (
            <table className="matriz__tabla">
              <thead>
                <tr>
                  <th scope="col">Vacante</th>
                  {ESTADOS.map((estado) => (
                    <th scope="col" key={estado.clave}>
                      <i style={{ background: estado.color }} aria-hidden="true" />
                      {estado.nombre}
                    </th>
                  ))}
                  <th scope="col" className="matriz__avance">
                    Avance
                  </th>
                </tr>
              </thead>
              <tbody>
                {resumen.vacantes.map((vacante) => (
                  <tr className={vacante.estado === "borrador" ? "matriz__borrador" : undefined} key={vacante.id}>
                    <td className="matriz__vacante">
                      <b>
                        {vacante.titulo}
                        <span className={`matriz__estado etiqueta-estado etiqueta-estado--${vacante.estado}`}>{NOMBRES_ESTADO_VACANTE[vacante.estado]}</span>
                      </b>
                      <span>
                        <Cierre vacante={vacante} /> · {textoPostulaciones(totalDeVacante(vacante))}
                      </span>
                    </td>
                    {ESTADOS.map((estado) => (
                      <Conteo cantidad={vacante.conteos[estado.clave] ?? 0} etiqueta={estado.nombre} key={estado.clave} />
                    ))}
                    <td className="matriz__avance">
                      <BarraEstados conteos={vacante.conteos} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="matriz__vacante">
                    <b>Total</b>
                  </td>
                  {ESTADOS.map((estado) => (
                    <Conteo cantidad={sumar(resumen.vacantes, estado.clave)} etiqueta={estado.nombre} key={estado.clave} />
                  ))}
                  <td className="matriz__avance">
                    <BarraEstados conteos={Object.fromEntries(ESTADOS.map((estado) => [estado.clave, sumar(resumen.vacantes, estado.clave)]))} />
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

//un cero se muestra como "—" para que lo importante resalte
function Conteo({ cantidad, etiqueta }: { cantidad: number; etiqueta: string }) {
  return (
    <td className={cantidad === 0 ? "matriz__cero" : undefined} data-etiqueta={etiqueta}>
      {cantidad === 0 ? "—" : cantidad}
    </td>
  );
}


function Cierre({ vacante }: { vacante: VacanteResumen }) {
  if (vacante.estado === "borrador") return <>Sin publicar</>;
  const cierre = describirCierre(vacante.fecha_limite);
  return <span className={cierre.proximo ? "matriz__pronto" : undefined}>{cierre.texto}</span>;
}

//mientras llega el resumen: la forma de la página, sin datos
function Esqueleto() {
  return (
    <div className="resumen" aria-busy="true">
      <span className="solo-lectores">Cargando el resumen…</span>
      <span className="esqueleto-panel" style={{ width: 160, height: 18 }} />
      <span className="esqueleto-panel" style={{ width: "min(560px, 90%)", height: 40, marginTop: 20 }} />
      <span className="esqueleto-panel" style={{ width: "min(420px, 70%)", height: 18, marginTop: 14 }} />
      <div className="resumen__dos">
        <div>
          {[1, 2, 3, 4].map((fila) => (
            <span className="esqueleto-panel" style={{ height: 52, marginTop: 14 }} key={fila} />
          ))}
        </div>
        <div>
          {[1, 2, 3].map((fila) => (
            <span className="esqueleto-panel" style={{ height: 52, marginTop: 14 }} key={fila} />
          ))}
        </div>
      </div>
    </div>
  );
}

//"Viernes 17 de octubre"
function hoy() {
  const texto = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }).replace(",", "");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}


//suma una columna de la tabla: cuántas postulaciones hay en ese estado entre todas las vacantes
function sumar(vacantes: VacanteResumen[], estado: EstadoPostulacion) {
  return vacantes.reduce((total, vacante) => total + (vacante.conteos[estado] ?? 0), 0);
}


function sumarTodo(vacantes: VacanteResumen[]) {
  return vacantes.reduce((total, vacante) => total + totalDeVacante(vacante), 0);
}
