import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, RefreshCw, Search } from "lucide-react";
import "../style/candidatos.css";
import { UsuarioContext } from "../contexto/UsuarioContext";
import BarraLote from "../componentes/panel/BarraLote";
import FichaCandidato from "../componentes/panel/FichaCandidato";
import { listarCandidatos } from "../servicios/candidatos";
import type { CandidatoFila, Decision } from "../tipos/candidatos";
import type { EstadoPostulacion } from "../tipos/panel";
import { NOMBRES_ESTADO_POSTULACION, describirEspera, DIAS_ESPERA_LARGA } from "../utilidades/panel";

const PESTANAS: { valor: "todos" | EstadoPostulacion; nombre: string }[] = [
  { valor: "todos", nombre: "Todos" },
  { valor: "recibida", nombre: "Sin revisar" },
  { valor: "en_revision", nombre: "En revisión" },
  { valor: "preseleccionada", nombre: "Preseleccionados" },
  { valor: "descartada", nombre: "Descartados" },
];

//la bandeja: lista a la izquierda (lo que falta decidir primero) y la ficha de la persona elegida a la derecha
export default function CandidatosReclutador() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error("CandidatosReclutador debe estar dentro de UsuarioProvider");
  const { token, cerrarSesion } = contexto;

  //la vacante y la postulación elegidas viven en la URL: se pueden compartir y sobreviven a una recarga
  const [parametros, setParametros] = useSearchParams();
  const idVacante = Number(parametros.get("vacante")) || undefined;
  const idElegido = Number(parametros.get("postulacion")) || undefined;

  const [candidatos, setCandidatos] = useState<CandidatoFila[] | null>(null);
  const [hayError, setHayError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [filtro, setFiltro] = useState<"todos" | EstadoPostulacion>("todos");
  const [texto, setTexto] = useState("");
  //los marcados para decidir o enviar en lote
  const [marcados, setMarcados] = useState<Set<number>>(new Set());
  //cambiar este número vuelve a cargar la ficha abierta (tras una acción en lote)
  const [versionFicha, setVersionFicha] = useState(0);

  useEffect(() => {
    if (token === null) return;
    listarCandidatos(token)
      .then((datos) => setCandidatos(datos))
      .catch((error) => {
        if (error.response?.status === 401) cerrarSesion();
        else setHayError(true);
      });
  }, [token, intento, cerrarSesion]);

  function cambiarParametro(clave: string, valor?: number) {
    setParametros((anteriores) => {
      const nuevos = new URLSearchParams(anteriores);
      if (valor) nuevos.set(clave, String(valor));
      else nuevos.delete(clave);
      return nuevos;
    });
  }

  //tras decidir, la fila se actualiza sin volver a pedir toda la bandeja
  function alCambiarEstado(id: number, estado: EstadoPostulacion) {
    setCandidatos((anteriores) => anteriores?.map((c) => (c.id === id ? { ...c, estado } : c)) ?? null);
  }

  function marcar(ids: number[], marcar: boolean) {
    setMarcados((anteriores) => {
      const nuevos = new Set(anteriores);
      for (const id of ids) {
        if (marcar) nuevos.add(id);
        else nuevos.delete(id);
      }
      return nuevos;
    });
  }

  function alDecidirLote(hechos: number[], estado: Decision) {
    setCandidatos((anteriores) => anteriores?.map((c) => (hechos.includes(c.id) ? { ...c, estado } : c)) ?? null);
    setVersionFicha((anterior) => anterior + 1);
  }

  if (hayError)
    return (
      <div className="candidatos__aviso" role="alert">
        <h1>No pudimos cargar los candidatos</h1>
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

  if (candidatos === null)
    return (
      <div aria-busy="true">
        <span className="solo-lectores">Cargando candidatos…</span>
        <span className="esqueleto-panel" style={{ width: 200, height: 36 }} />
        <span className="esqueleto-panel" style={{ height: 44, marginTop: 28 }} />
        {[1, 2, 3, 4].map((fila) => (
          <span className="esqueleto-panel" style={{ height: 64, marginTop: 12, maxWidth: 400 }} key={fila} />
        ))}
      </div>
    );

  //las vacantes que aparecen en la bandeja, para el selector
  const vacantes = [...new Map(candidatos.map((c) => [c.vacante.id, c.vacante])).values()];
  const deLaVacante = candidatos.filter((c) => !idVacante || c.vacante.id === idVacante);
  const buscado = texto.trim().toLowerCase();
  const visibles = deLaVacante.filter(
    (c) => (filtro === "todos" || c.estado === filtro) && `${c.nombres} ${c.apellidos}`.toLowerCase().includes(buscado),
  );
  const sinRevisar = deLaVacante.filter((c) => c.estado === "recibida").length;
  //si no hay nadie elegido (o ya no está en la lista), se muestra el primero
  //solo se actúa sobre los marcados que se ven: lo que un filtro oculta no se toca
  const seleccion = visibles.filter((c) => marcados.has(c.id));
  const elegido = visibles.find((c) => c.id === idElegido)?.id ?? visibles[0]?.id;
  const conFicha = idElegido !== undefined && elegido === idElegido;

  return (
    <div className={`candidatos ${conFicha ? "candidatos--con-ficha" : ""}`}>
      <div className="candidatos__cabecera">
        <h1>Candidatos</h1>
        <p>
          {sinRevisar > 0 ? <b>{sinRevisar === 1 ? "1 espera una primera lectura" : `${sinRevisar} esperan una primera lectura`}</b> : "Nadie espera revisión"}
          {" · "}
          {deLaVacante.length === 1 ? "1 postulación" : `${deLaVacante.length} postulaciones`}
        </p>
      </div>

      {candidatos.length === 0 ? (
        <div className="candidatos__vacio">
          <h2>Todavía nadie ha postulado</h2>
          <p>Cuando alguien postule a una de tus vacantes publicadas, aparecerá aquí. Comparte el enlace de tus vacantes para recibir postulaciones.</p>
        </div>
      ) : (
        <>
          <div className="candidatos__filtros">
            <div className="candidatos__pestanas" role="group" aria-label="Filtrar por estado">
              {PESTANAS.map((pestana) => (
                <button className="candidatos__pestana" type="button" aria-pressed={filtro === pestana.valor} onClick={() => setFiltro(pestana.valor)} key={pestana.valor}>
                  {pestana.nombre}
                  <span>{pestana.valor === "todos" ? deLaVacante.length : deLaVacante.filter((c) => c.estado === pestana.valor).length}</span>
                </button>
              ))}
            </div>
            <div className="candidatos__controles">
              <label className="candidatos__select">
                <span className="solo-lectores">Vacante</span>
                <select value={idVacante ?? ""} onChange={(evento) => cambiarParametro("vacante", Number(evento.target.value) || undefined)}>
                  <option value="">Todas las vacantes</option>
                  {vacantes.map((vacante) => (
                    <option value={vacante.id} key={vacante.id}>
                      {vacante.titulo}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} aria-hidden="true" />
              </label>
              <label className="candidatos__buscar">
                <span className="solo-lectores">Buscar por nombre</span>
                <Search size={16} aria-hidden="true" />
                <input type="search" placeholder="Buscar por nombre" value={texto} onChange={(evento) => setTexto(evento.target.value)} />
              </label>
            </div>
          </div>

          <div className="bandeja">
            <div className="bandeja__columna">
              <BarraLote
                seleccion={seleccion}
                totalVisibles={visibles.length}
                alMarcarTodos={(todos) => marcar(visibles.map((c) => c.id), todos)}
                alLimpiar={() => setMarcados(new Set())}
                alDecidir={alDecidirLote}
                alEnviar={() => setVersionFicha((anterior) => anterior + 1)}
              />
              {visibles.length === 0 ? (
                <p className="bandeja__nada">Nadie coincide con estos filtros.</p>
              ) : (
                <ul className="bandeja__lista" aria-label="Postulaciones; primero lo que falta decidir">
                  {visibles.map((c) => {
                    const espera = describirEspera(c.creado_en);
                    return (
                      <li className="bandeja__fila" key={c.id}>
                        <label className="bandeja__marcar">
                          <input type="checkbox" checked={marcados.has(c.id)} onChange={(evento) => marcar([c.id], evento.target.checked)} />
                          <span className="solo-lectores">
                            Seleccionar a {c.nombres} {c.apellidos}
                          </span>
                        </label>
                        <button
                          className={`bandeja__item bandeja__item--${c.estado}`}
                          type="button"
                          aria-current={c.id === elegido}
                          onClick={() => cambiarParametro("postulacion", c.id)}>
                          <b>
                            {c.nombres} {c.apellidos}
                          </b>
                          <span className={`bandeja__espera ${c.estado === "recibida" && espera.dias >= DIAS_ESPERA_LARGA ? "bandeja__espera--larga" : ""}`}>
                            {espera.cantidad} {espera.unidad}
                          </span>
                          <span className="bandeja__vacante">{c.vacante.titulo}</span>
                          <span className={`estado-postulacion estado-postulacion--${c.estado}`}>{NOMBRES_ESTADO_POSTULACION[c.estado]}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {elegido !== undefined && (
              <FichaCandidato
                idPostulacion={elegido}
                key={`${elegido}-${versionFicha}`}
                alVolver={() => cambiarParametro("postulacion")}
                alCambiarEstado={(estado) => alCambiarEstado(elegido, estado)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
