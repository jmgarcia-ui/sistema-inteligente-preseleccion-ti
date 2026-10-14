import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { listarVacantesPublicas } from "../../servicios/vacantes";
import { NOMBRES_MODALIDAD, type VacantePublica } from "../../tipos/vacantes";
import { describirCierre, requisitosPrincipales } from "../../utilidades/vacantes";

const MAXIMO = 4;
//un requisito más largo que esto es una frase, no una etiqueta
const LARGO_ETIQUETA = 40;

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; vacantes: VacantePublica[] };

export default function VacantesDestacadas() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let vigente = true;
    listarVacantesPublicas()
      .then((vacantes) => {
        //las que cierran antes aparecen primero
        const proximas = [...vacantes].sort((a, b) => a.fecha_limite.localeCompare(b.fecha_limite)).slice(0, MAXIMO);
        if (vigente) setEstado({ tipo: "listo", vacantes: proximas });
      })
      .catch(() => {
        if (vigente) setEstado({ tipo: "error" });
      });
    return () => {
      vigente = false;
    };
  }, []);

  return (
    <section className="seccion" id="vacantes" aria-labelledby="titulo-vacantes-destacadas">
      <div className="envoltura">
        <div className="seccion__cabeza">
          <h2 id="titulo-vacantes-destacadas">¿Buscas trabajo en tecnología?</h2>
          <p>Revisa los requisitos de cada puesto y postula en pocos minutos, sin crear una cuenta. Una persona del equipo revisa cada postulación.</p>
        </div>

        {estado.tipo === "cargando" && (
          <div className="destacadas" aria-hidden="true">
            <div className="destacada destacada--esqueleto" />
            <div className="destacada destacada--esqueleto" />
          </div>
        )}

        {estado.tipo === "listo" && estado.vacantes.length === 0 && (
          <p className="destacadas__vacio">Por ahora no tenemos vacantes abiertas. Vuelve pronto.</p>
        )}

        {estado.tipo === "listo" && estado.vacantes.length > 0 && (
          <ul className="destacadas">
            {estado.vacantes.map((vacante) => (
              <VacanteDestacada key={vacante.id} vacante={vacante} />
            ))}
          </ul>
        )}

        {/* si la API no responde, el enlace a la lista sigue disponible */}
        <div className="destacadas__cierre">
          <Link className="boton boton--primario" to="/vacantes">
            Ver todas las vacantes
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function VacanteDestacada({ vacante }: { vacante: VacantePublica }) {
  const { visibles } = requisitosPrincipales(vacante.requisitos, 3);
  const cierre = describirCierre(vacante.fecha_limite);
  const idTitulo = `destacada-${vacante.id}`;

  return (
    <li>
      <Link className="destacada" to={`/vacantes/${vacante.id}`} aria-labelledby={idTitulo}>
        <div className="destacada__cabecera">
          <h3 id={idTitulo}>{vacante.titulo}</h3>
          <span className="destacada__modalidad">{NOMBRES_MODALIDAD[vacante.modalidad]}</span>
        </div>
        {vacante.ubicacion && <span className="destacada__lugar">{vacante.ubicacion}</span>}
        <ul className="destacada__requisitos" aria-label="Requisitos principales">
          {visibles.map((requisito) => (
            <li key={requisito.id} className={requisito.descripcion.length > LARGO_ETIQUETA ? "requisito-largo" : undefined}>
              {requisito.descripcion}
            </li>
          ))}
        </ul>
        <div className="destacada__pie">
          <span className={cierre.proximo ? "destacada__cierre--proximo" : undefined}>{cierre.texto}</span>
          <span className="destacada__accion">
            Ver y postular
            <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </li>
  );
}
