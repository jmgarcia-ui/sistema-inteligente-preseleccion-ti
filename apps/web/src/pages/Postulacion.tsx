import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Briefcase, CalendarDays, MapPin, RefreshCw, UserCheck } from "lucide-react";
import "../style/postulacion.css";
import { obtenerVacantePublica } from "../servicios/vacantes";
import { useEffect, useState, type ReactNode } from "react";
import { NOMBRES_MODALIDAD, type VacantePublica } from "../tipos/vacantes";
import { describirCierre } from "../utilidades/vacantes";
import FormularioPostulacion from "../componentes/postulacion/FormularioPostulacion";

export default function Postulacion() {
  const [vacante, setVacante] = useState<VacantePublica | null>(null);
  const [noDisponible, setNoDisponible] = useState(false);
  const [hayError, setHayError] = useState(false);
  const [intento, setIntento] = useState(0);
  const { idVacante } = useParams();
  const id = Number(idVacante);

  useEffect(() => {
    obtenerVacantePublica(id)
      .then((datos) => setVacante(datos))
      .catch((error) => {
        if (error.response?.status === 404) setNoDisponible(true);
        else setHayError(true);
      });
  }, [id, intento]);

  function reintentar(){
    setHayError(false);
    setIntento((anterior)=> anterior + 1);
  }

  if(hayError){
    return (
      <Pagina>
        <EnlaceVolver />
        <div className="pagina-vacante__aviso" role="alert">
          <h1>No pudimos cargar la vacante</h1>
          <p>Revisa tu conexión e inténtalo de nuevo. Si el problema sigue, vuelve en unos minutos.</p>
          <button className="boton boton--primario" type="button" onClick={reintentar}>
            <RefreshCw size={16} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      </Pagina>
    );
  }

  if (noDisponible)
    return (
      <Pagina>
        <EnlaceVolver />
        <div className="pagina-vacante__aviso">
          <h1>Esta vacante ya no está disponible</h1>
          <p>Puede que ya haya cerrado o que el enlace esté incompleto. Revisa las vacantes que siguen abiertas.</p>
          <Link className="boton boton--primario" to="/vacantes">
            Ver vacantes abiertas
            <ArrowRight className="flecha" size={16} aria-hidden="true" />
          </Link>
        </div>
      </Pagina>
    );

  if (vacante === null)
    return (
      <Pagina>
        <div aria-busy="true">
          <span className="solo-lectores">Cargando la vacante…</span>
          <span className="esqueleto esqueleto--volver" />
          <div className="pagina-vacante__rejilla">
            <div>
              <span className="esqueleto esqueleto--titulo" />
              <span className="esqueleto esqueleto--titulo" />
              <span className="esqueleto esqueleto--datos" />
              <span className="esqueleto esqueleto--subtitulo" />
              <span className="esqueleto esqueleto--linea" />
              <span className="esqueleto esqueleto--linea" />
            </div>
            <div className="postular">
              <span className="esqueleto esqueleto--titulo" />
              <span className="esqueleto esqueleto--linea" />
              <span className="esqueleto esqueleto--campo" />
              <span className="esqueleto esqueleto--campo" />
              <span className="esqueleto esqueleto--campo" />
            </div>
          </div>
        </div>
      </Pagina>
    );

  const cierre = describirCierre(vacante.fecha_limite);

  return (
    <Pagina>
      <div className="pagina-vacante__rejilla">
        <article className="vacante">
          <EnlaceVolver />
          <h1 className="vacante__titulo">{vacante.titulo}</h1>
          <ul className="vacante__datos" aria-label="Detalles de la vacante">
            <li className="vacante__dato">
              <Briefcase size={15} aria-hidden="true" />
              {NOMBRES_MODALIDAD[vacante.modalidad]}
            </li>
            {vacante.ubicacion && (
              <li className="vacante__dato">
                <MapPin size={15} aria-hidden="true" />
                {vacante.ubicacion}
              </li>
            )}
            <li className={`vacante__dato ${cierre.proximo ? "vacante__dato--proximo" : ""}`}>
              <CalendarDays size={15} aria-hidden="true" />
              {cierre.texto}
            </li>
          </ul>
          <section className="vacante__bloque">
            <h2>Sobre el puesto</h2>
            <p className="vacante__descripcion">{vacante.descripcion}</p>
          </section>
          <section className="vacante__bloque">
            <h2>Requisitos</h2>
            <ol className="vacante__requisitos">
              {vacante.requisitos.map((requisito, indice)=>(
                <li className="vacante__requisito" key={requisito.id}>
                  <span className="vacante__numero" aria-hidden="true">{indice + 1}</span>
                  <span>{requisito.descripcion}</span>
                  {!requisito.obligatorio && <span className="vacante__deseable">Deseable</span>}
                </li>
              ))}
            </ol>
            <div className="vacante__nota">
              <UserCheck size={18} aria-hidden="true" />
              <span>
                Una persona del equipo revisa cada postulación y compara tu experiencia con estos requisitos. El sistema no descarta a nadie por su cuenta.
              </span>
            </div>
          </section>
        </article>
        <aside className="postular" id="postular" aria-labelledby="titulo-postular">
          <FormularioPostulacion idVacante={vacante.id} tituloVacante={vacante.titulo} />
        </aside>
      </div>
      {/* en celular el formulario queda abajo: esta barra lleva hasta él */}
      <div className="barra-postular">
        <span>
          {vacante.titulo}
          <br />
          <b>{cierre.texto}</b>
        </span>
        <a className="boton boton--primario boton--chico" href="#postular">Postular</a>
      </div>
    </Pagina>
  );
}

//fondo y margen comunes a todos los estados de la página
function Pagina({ children }: { children: ReactNode }) {
  return (
    <div className="pagina-vacante">
      <div className="pagina-vacante__fondo" aria-hidden="true" />
      <div className="envoltura">{children}</div>
    </div>
  );
}

function EnlaceVolver() {
  return (
    <Link className="pagina-vacante__volver" to="/vacantes">
      <ArrowLeft size={16} aria-hidden="true" />
      Vacantes abiertas
    </Link>
  );
}
