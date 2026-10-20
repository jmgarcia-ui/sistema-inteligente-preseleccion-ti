import { useContext, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import "../style/actividad.css";
import { UsuarioContext } from "../contexto/UsuarioContext";
import ListaAcciones from "../componentes/panel/ListaAcciones";
import { obtenerActividad } from "../servicios/panel";
import type { Accion } from "../tipos/panel";
import { diaDe } from "../utilidades/panel";

const POR_PAGINA = 40;

//los filtros agrupan los tipos del registro
const FILTROS: { valor: string; nombre: string; tipos?: string[] }[] = [
  { valor: "todo", nombre: "Todo" },
  { valor: "decisiones", nombre: "Decisiones", tipos: ["decision"] },
  { valor: "correos", nombre: "Correos", tipos: ["correo_enviado", "correo_fallido"] },
  { valor: "vacantes", nombre: "Vacantes", tipos: ["vacante_creada", "vacante_editada", "vacante_publicada", "vacante_cerrada"] },
  { valor: "sistema", nombre: "Postulaciones e IA", tipos: ["postulacion_recibida", "analisis_listo", "analisis_error"] },
];

function tiposDe(filtro: string) {
  return FILTROS.find((f) => f.valor === filtro)?.tipos;
}

//el registro completo: qué pasó, quién lo hizo y cuándo, agrupado por día
export default function ActividadReclutador() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error("ActividadReclutador debe estar dentro de UsuarioProvider");
  const { token, cerrarSesion } = contexto;

  const [filtro, setFiltro] = useState("todo");
  const [acciones, setAcciones] = useState<Accion[] | null>(null);
  const [hayMas, setHayMas] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayError, setHayError] = useState(false);
  const [intento, setIntento] = useState(0);
  const tipos = tiposDe(filtro);

  //al cambiar el filtro se pide la primera página de nuevo
  useEffect(() => {
    if (token === null) return;
    obtenerActividad(token, { tipos: tiposDe(filtro), limite: POR_PAGINA })
      .then((datos) => {
        setAcciones(datos);
        setHayMas(datos.length === POR_PAGINA);
      })
      .catch((error) => {
        if (error.response?.status === 401) cerrarSesion();
        else setHayError(true);
      });
  }, [token, filtro, intento, cerrarSesion]);

  function cambiarFiltro(valor: string) {
    setAcciones(null);
    setFiltro(valor);
  }

  async function cargarMas() {
    if (token === null || !acciones?.length) return;
    setCargandoMas(true);
    try {
      const datos = await obtenerActividad(token, { tipos, antesDe: acciones[acciones.length - 1].id, limite: POR_PAGINA });
      setAcciones([...acciones, ...datos]);
      setHayMas(datos.length === POR_PAGINA);
    } catch {
      setHayError(true);
    } finally {
      setCargandoMas(false);
    }
  }

  //agrupar por día, manteniendo el orden (más nuevo primero)
  const grupos: { dia: string; acciones: Accion[] }[] = [];
  for (const accion of acciones ?? []) {
    const dia = diaDe(accion.creado_en);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.dia === dia) ultimo.acciones.push(accion);
    else grupos.push({ dia, acciones: [accion] });
  }

  return (
    <div className="actividad">
      <h1>Actividad</h1>
      <p className="actividad__sub">Lo que hizo el equipo y el sistema en tus vacantes: decisiones, correos y cambios. Nada se borra.</p>

      <div className="actividad__filtros" role="group" aria-label="Filtrar actividad">
        {FILTROS.map((f) => (
          <button className="actividad__filtro" type="button" aria-pressed={filtro === f.valor} onClick={() => cambiarFiltro(f.valor)} key={f.valor}>
            {f.nombre}
          </button>
        ))}
      </div>

      {hayError ? (
        <div className="actividad__vacio" role="alert">
          <p>No pudimos cargar la actividad.</p>
          <button
            className="boton boton--secundario boton--chico"
            type="button"
            onClick={() => {
              setHayError(false);
              setIntento((anterior) => anterior + 1);
            }}>
            <RefreshCw size={15} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      ) : acciones === null ? (
        <div aria-busy="true">
          {[1, 2, 3, 4, 5].map((fila) => (
            <span className="esqueleto-panel" style={{ height: 48, marginTop: 12, maxWidth: 760 }} key={fila} />
          ))}
        </div>
      ) : acciones.length === 0 ? (
        <p className="actividad__vacio">Todavía no hay acciones de este tipo.</p>
      ) : (
        <>
          {grupos.map((grupo) => (
            <section className="actividad__dia" aria-label={grupo.dia} key={grupo.dia}>
              <h2>{grupo.dia}</h2>
              <ListaAcciones acciones={grupo.acciones} soloHora />
            </section>
          ))}
          {hayMas && (
            <button className="boton boton--secundario boton--chico actividad__mas" type="button" disabled={cargandoMas} onClick={cargarMas}>
              {cargandoMas ? "Cargando…" : "Ver acciones anteriores"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
