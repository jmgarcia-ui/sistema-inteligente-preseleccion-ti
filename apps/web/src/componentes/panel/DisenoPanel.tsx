import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AlignLeft, Briefcase, ChevronUp, ExternalLink, History, LogOut, Menu, Moon, Sun, Users, X, type LucideIcon } from "lucide-react";
import "../../style/panel.css";
import { UsuarioContext } from "../../contexto/UsuarioContext";
import useTema from "../../hooks/useTema";

type Seccion = { ruta: string; nombre: string; Icono: LucideIcon };

const SECCIONES: Seccion[] = [
  { ruta: "/reclutador/resumen", nombre: "Resumen", Icono: AlignLeft },
  { ruta: "/reclutador/vacantes", nombre: "Mis vacantes", Icono: Briefcase },
  { ruta: "/reclutador/candidatos", nombre: "Candidatos", Icono: Users },
  { ruta: "/reclutador/actividad", nombre: "Actividad", Icono: History },
];

function DisenoPanel() {
  const contexto = useContext(UsuarioContext);
  const { pathname } = useLocation();
  const { temaOscuro, alternarTema } = useTema();
  const [menuAbierto, setMenuAbierto] = useState(false);

  //en celular la barra superior dice en qué sección estás
  const seccionActual = SECCIONES.find((seccion) => pathname.startsWith(seccion.ruta))?.nombre ?? "Panel";

  return (
    <div className="panel">
      {/* el índice vive sobre el gris, como el margen de un cuaderno */}
      <aside className="panel__indice" aria-label="Panel">
        <Marca detalle="Panel del equipo" />
        <nav className="panel__nav" aria-label="Secciones del panel">
          <Secciones />
        </nav>
        <div className="panel__pie">
          <a className="panel__util" href="/vacantes" target="_blank" rel="noreferrer">
            <ExternalLink size={16} aria-hidden="true" />
            Ver sitio público
          </a>
          <button className="panel__util" type="button" aria-pressed={temaOscuro} onClick={alternarTema}>
            {temaOscuro ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            {temaOscuro ? "Modo claro" : "Modo oscuro"}
          </button>
          <Cuenta
            nombres={contexto?.usuario?.nombres ?? ""}
            apellidos={contexto?.usuario?.apellidos ?? ""}
            correo={contexto?.usuario?.correo ?? ""}
            cerrarSesion={() => contexto?.cerrarSesion()}
          />
        </div>
      </aside>

      {/* la hoja: el trabajo se lee sobre blanco, como un documento */}
      <div className="panel__hoja">
        <header className="panel__barra">
          <Marca detalle={seccionActual} />
          <div className="panel__barra-acciones">
            <button className="panel__icono" type="button" aria-label={temaOscuro ? "Activar modo claro" : "Activar modo oscuro"} aria-pressed={temaOscuro} onClick={alternarTema}>
              {temaOscuro ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <button
              className="panel__icono"
              type="button"
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuAbierto}
              aria-controls="panel-menu-movil"
              onClick={() => setMenuAbierto((actual) => !actual)}>
              {menuAbierto ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
          {menuAbierto && (
            <nav className="panel__menu-movil" id="panel-menu-movil" aria-label="Secciones del panel">
              <Secciones alElegir={() => setMenuAbierto(false)} />
              <button className="panel__enlace" type="button" onClick={() => contexto?.cerrarSesion()}>
                <LogOut size={17} aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </nav>
          )}
        </header>

        {/* aquí se dibuja la página del panel que corresponde a la ruta */}
        <div className="panel__contenido">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function Marca({ detalle }: { detalle: string }) {
  return (
    <Link className="panel__marca" to="/reclutador/resumen">
      <span className="panel__signo" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </span>
      <span>
        <b>Reclutamiento</b>
        <small>{detalle}</small>
      </span>
    </Link>
  );
}

//NavLink marca la sección actual con aria-current="page"; el CSS la resalta con eso
function Secciones({ alElegir }: { alElegir?: () => void }) {
  return SECCIONES.map(({ ruta, nombre, Icono }) => (
    <NavLink className="panel__enlace" to={ruta} key={ruta} onClick={alElegir}>
      <Icono size={17} aria-hidden="true" />
      <span>{nombre}</span>
    </NavLink>
  ));
}

type PropiedadesCuenta = { nombres: string; apellidos: string; correo: string; cerrarSesion: () => void };

//nombre y correo; el menú guarda "Cerrar sesión"
function Cuenta({ nombres, apellidos, correo, cerrarSesion }: PropiedadesCuenta) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const iniciales = `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();

  //se cierra al hacer clic fuera o al pulsar Escape
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
    <div className="panel__cuenta" ref={contenedor}>
      <button className="panel__cuenta-boton" type="button" aria-expanded={abierto} aria-controls="panel-menu-cuenta" onClick={() => setAbierto((actual) => !actual)}>
        <span className="panel__iniciales" aria-hidden="true">{iniciales}</span>
        <span className="panel__quien">
          <b>
            {nombres} {apellidos}
          </b>
          <span>{correo}</span>
        </span>
        <ChevronUp size={16} aria-hidden="true" />
      </button>
      <div className={`panel__menu ${abierto ? "panel__menu--abierto" : ""}`} id="panel-menu-cuenta">
        <button type="button" onClick={cerrarSesion} tabIndex={abierto ? 0 : -1}>
          <LogOut size={16} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default DisenoPanel;
