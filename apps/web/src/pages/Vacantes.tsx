import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import "../style/vacantes.css";
import TarjetaVacante from "../componentes/vacantes/TarjetaVacante";
import { listarVacantesPublicas } from "../servicios/vacantes";
import { NOMBRES_MODALIDAD, type Modalidad, type VacantePublica } from "../tipos/vacantes";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; vacantes: VacantePublica[] };

type Filtro = "todas" | Modalidad;

const MODALIDADES: Modalidad[] = ["remoto", "hibrido", "presencial"];

export default function Vacantes() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [filtro, setFiltro] = useState<Filtro>("todas");

  //cambiar este numero vuelve a ejecutar el efecto que pide las vacantes
  const [intento, setIntento] = useState(0);
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let vigente = true;
    listarVacantesPublicas()
      .then((vacantes) => {
        //lo que cierra antes aparece primero dentro de cada grupo
        vacantes.sort((a, b) => a.fecha_limite.localeCompare(b.fecha_limite));
        if (!vigente) return;
        setEstado({ tipo: "listo", vacantes });
        //tras reintentar, el boton desaparece: el foco del teclado vuelve al titulo
        if (intento > 0) titulo.current?.focus();
      })
      .catch(() => {
        if (!vigente) return;
        setEstado({ tipo: "error" });
        //si el reintento vuelve a fallar, el foco tampoco se pierde
        if (intento > 0) titulo.current?.focus();
      });
    //si el componente se desmonta antes de la respuesta, se ignora
    return () => {
      vigente = false;
    };
  }, [intento]);

  function reintentar() {
    setEstado({ tipo: "cargando" });
    setIntento((actual) => actual + 1);
  }

  return (
    <div className="pagina-vacantes">
      <section className="vacantes" aria-labelledby="titulo-vacantes" aria-busy={estado.tipo === "cargando"}>
        <header className="vacantes__cabecera">
          <h1 className="vacantes__titulo" id="titulo-vacantes" ref={titulo} tabIndex={-1}>
            Vacantes abiertas
          </h1>
          {/* el resumen solo tiene sentido cuando hay vacantes que revisar */}
          {estado.tipo === "listo" && estado.vacantes.length > 0 && (
            <p className="vacantes__resumen">
              {estado.vacantes.length} {estado.vacantes.length === 1 ? "puesto" : "puestos"} de tecnología. Revisa los
              requisitos y postula en pocos minutos, sin crear una cuenta.
            </p>
          )}
        </header>

        {estado.tipo === "cargando" && <CuadriculaCargando />}

        {estado.tipo === "error" && (
          <div className="vacantes__aviso" role="alert">
            <h2>No pudimos cargar las vacantes</h2>
            <p>Revisa tu conexión e inténtalo de nuevo. Si el problema sigue, vuelve en unos minutos.</p>
            <button className="vacantes__reintentar" type="button" onClick={reintentar}>
              <RefreshCw size={16} strokeWidth={2} aria-hidden="true" />
              Reintentar
            </button>
          </div>
        )}

        {estado.tipo === "listo" && estado.vacantes.length === 0 && (
          <div className="vacantes__aviso">
            <h2>Por ahora no tenemos vacantes abiertas</h2>
            <p>Vuelve pronto.</p>
          </div>
        )}

        {estado.tipo === "listo" && estado.vacantes.length > 0 && (
          <ListaPorModalidad vacantes={estado.vacantes} filtro={filtro} alCambiarFiltro={setFiltro} />
        )}
      </section>
    </div>
  );
}

type PropiedadesLista = {
  vacantes: VacantePublica[];
  filtro: Filtro;
  alCambiarFiltro: (filtro: Filtro) => void;
};

function ListaPorModalidad({ vacantes, filtro, alCambiarFiltro }: PropiedadesLista) {
  const grupos = MODALIDADES.map((modalidad) => ({
    modalidad,
    vacantes: vacantes.filter((vacante) => vacante.modalidad === modalidad),
  }));
  const visibles = grupos.filter((grupo) => grupo.vacantes.length > 0 && (filtro === "todas" || grupo.modalidad === filtro));

  return (
    <>
      <div className="vacantes__filtros" role="group" aria-label="Filtrar por modalidad">
        <BotonFiltro activo={filtro === "todas"} cantidad={vacantes.length} alPulsar={() => alCambiarFiltro("todas")}>
          Todas
        </BotonFiltro>
        {grupos.map((grupo) => (
          <BotonFiltro
            key={grupo.modalidad}
            activo={filtro === grupo.modalidad}
            cantidad={grupo.vacantes.length}
            alPulsar={() => alCambiarFiltro(grupo.modalidad)}>
            {NOMBRES_MODALIDAD[grupo.modalidad]}
          </BotonFiltro>
        ))}
      </div>

      {visibles.map((grupo) => (
        <section className="vacantes__grupo" key={grupo.modalidad} aria-labelledby={`grupo-${grupo.modalidad}`}>
          <div className="vacantes__grupo-cabecera">
            <h2 id={`grupo-${grupo.modalidad}`}>{NOMBRES_MODALIDAD[grupo.modalidad]}</h2>
            <span>
              {grupo.vacantes.length} {grupo.vacantes.length === 1 ? "vacante" : "vacantes"}
            </span>
          </div>
          <ul className="vacantes__cuadricula">
            {grupo.vacantes.map((vacante) => (
              <TarjetaVacante key={vacante.id} vacante={vacante} />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

type PropiedadesFiltro = {
  activo: boolean;
  cantidad: number;
  alPulsar: () => void;
  children: string;
};

function BotonFiltro({ activo, cantidad, alPulsar, children }: PropiedadesFiltro) {
  return (
    <button
      className="vacantes__filtro"
      type="button"
      aria-pressed={activo}
      disabled={cantidad === 0}
      onClick={alPulsar}>
      {children}
      <span className="vacantes__filtro-cantidad">{cantidad}</span>
    </button>
  );
}

function CuadriculaCargando() {
  return (
    <div className="vacantes__cargando">
      <span className="vacantes__solo-lectores">Cargando vacantes…</span>
      {/* misma estructura que la lista cargada (filtros, grupo y tarjetas) para que la página no salte */}
      <div className="vacantes__esqueleto-resumen" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="vacantes__esqueleto-filtros" aria-hidden="true" />
      <div className="vacantes__esqueleto-grupo" aria-hidden="true" />
      <ul className="vacantes__cuadricula" aria-hidden="true">
        {[0, 1, 2].map((indice) => (
          <li className="tarjeta-vacante tarjeta-vacante--esqueleto" key={indice}>
            <span />
            <span />
            <span />
          </li>
        ))}
      </ul>
    </div>
  );
}
