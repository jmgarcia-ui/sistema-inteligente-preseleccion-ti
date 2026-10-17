import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UsuarioContext } from "../contexto/UsuarioContext";
import { obtenerResumen } from "../servicios/panel";
import type { EstadoPostulacion, ResumenPanel, VacanteResumen } from "../tipos/panel";
import { DIAS_ESPERA_LARGA, describirEspera, describirFuentes } from "../utilidades/panel";
import { describirCierre } from "../utilidades/vacantes";

//columnas de la tabla, en el orden del proceso
const ESTADOS: { clave: EstadoPostulacion; nombre: string }[] = [
  { clave: "recibida", nombre: "Recibidas" },
  { clave: "en_revision", nombre: "En revisión" },
  { clave: "preseleccionada", nombre: "Preseleccionadas" },
  { clave: "descartada", nombre: "Descartadas" },
];

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
      <div>
        <p>No pudimos cargar el resumen.</p>
        <button type="button" onClick={reintentar}>Reintentar</button>
      </div>
    );

  if (resumen === null) return <p>Cargando el resumen…</p>;

  //el titular se calcula con lo que ya llegó: no hace falta otra consulta
  const totalPorRevisar = sumar(resumen.vacantes, "recibida");
  const masAntigua = resumen.por_revisar[0];

  return (
    <div>
      <p>{new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}</p>

      {totalPorRevisar === 0 ? (
        <h1>No hay postulaciones esperando una primera lectura.</h1>
      ) : (
        <>
          <h1>
            {totalPorRevisar} {totalPorRevisar === 1 ? "postulación espera" : "postulaciones esperan"} una primera lectura.
          </h1>
          <p>
            La más antigua llegó hace {describirEspera(masAntigua.creado_en).cantidad} {describirEspera(masAntigua.creado_en).unidad}, para{" "}
            {masAntigua.vacante.titulo}.
          </p>
        </>
      )}

      <section aria-labelledby="titulo-cola">
        <h2 id="titulo-cola">Cola de lectura ({totalPorRevisar})</h2>
        <p>Ordenada por tiempo de espera</p>
        {resumen.por_revisar.length === 0 ? (
          <p>Nadie espera revisión por ahora.</p>
        ) : (
          <ul>
            {resumen.por_revisar.map((postulacion) => {
              const espera = describirEspera(postulacion.creado_en);
              return (
                <li key={postulacion.id}>
                  <strong>
                    {espera.cantidad} {espera.unidad}
                  </strong>
                  {espera.dias >= DIAS_ESPERA_LARGA && " (espera larga)"} — {postulacion.candidato.nombres} {postulacion.candidato.apellidos} ·{" "}
                  {postulacion.vacante.titulo}
                  {describirFuentes(postulacion.candidato) && ` · ${describirFuentes(postulacion.candidato)}`}
                </li>
              );
            })}
          </ul>
        )}
        {totalPorRevisar > resumen.por_revisar.length && <Link to="/reclutador/candidatos">Ver las {totalPorRevisar} en Candidatos</Link>}
      </section>

      <section aria-labelledby="titulo-vacantes">
        <h2 id="titulo-vacantes">Tus vacantes, estado por estado</h2>
        {resumen.vacantes.length === 0 ? (
          <p>Todavía no tienes vacantes publicadas ni borradores.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">Vacante</th>
                {ESTADOS.map((estado) => (
                  <th scope="col" key={estado.clave}>{estado.nombre}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resumen.vacantes.map((vacante) => (
                <tr key={vacante.id}>
                  <td>
                    {vacante.titulo} ({NOMBRES_ESTADO_VACANTE[vacante.estado]})
                    <br />
                    {vacante.estado === "borrador" ? "Sin publicar" : describirCierre(vacante.fecha_limite).texto} · {totalDeVacante(vacante)}{" "}
                    {totalDeVacante(vacante) === 1 ? "postulación" : "postulaciones"}
                  </td>
                  {ESTADOS.map((estado) => (
                    <td key={estado.clave}>{vacante.conteos[estado.clave] ?? "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                {ESTADOS.map((estado) => (
                  <td key={estado.clave}>{sumar(resumen.vacantes, estado.clave) || "—"}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        )}
      </section>
    </div>
  );
}

//suma una columna de la tabla: cuántas postulaciones hay en ese estado entre todas las vacantes
function sumar(vacantes: VacanteResumen[], estado: EstadoPostulacion) {
  return vacantes.reduce((total, vacante) => total + (vacante.conteos[estado] ?? 0), 0);
}

//todas las postulaciones de una vacante, en cualquier estado
function totalDeVacante(vacante: VacanteResumen) {
  return Object.values(vacante.conteos).reduce((total, cantidad) => total + (cantidad ?? 0), 0);
}
