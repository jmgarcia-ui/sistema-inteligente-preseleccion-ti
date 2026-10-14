import { useParams, Link } from "react-router-dom";
import { obtenerVacantePublica } from "../servicios/vacantes";
import { useEffect, useState } from "react";
import { NOMBRES_MODALIDAD, type VacantePublica } from "../tipos/vacantes";
import { describirCierre } from "../utilidades/vacantes";
import FormularioPostulacion from "../componentes/postulacion/FormularioPostulacion";

export default function Postulacion() {
  const [vacante, setVacante] = useState<VacantePublica | null>(null);
  const [noDisponible, setNoDisponible] = useState(false);
  const [hayError, setHayError] = useState(false);
  const { idVacante } = useParams();
  const id = Number(idVacante);

  useEffect(() => {
    obtenerVacantePublica(id)
      .then((datos) => setVacante(datos))
      .catch((error) => {
        if (error.response?.status === 404) setNoDisponible(true);
        else setHayError(true);
      });
  }, [id]);

  if (noDisponible)
    return (
      <div>
        <p>Vacante no disponible</p>
        <Link to="/vacantes">Ver todas las vacantes</Link>
      </div>
    );

  if (hayError)
    return <p>Error al cargar la vacante</p>
  

  if (vacante === null) return <p>Cargando...</p>;

  return (
    <div>
      <h1>{vacante.titulo}</h1>
      <div>
        <h2>Detalles de la vacante</h2>
        <p>{NOMBRES_MODALIDAD[vacante.modalidad]}</p>
        {vacante.ubicacion && <p>{vacante.ubicacion}</p>}
        <p>{describirCierre(vacante.fecha_limite).texto}</p>
        <p>{vacante.descripcion}</p>
        <div>
          <ul>
            {vacante.requisitos.map((requisito)=>(
              <li key={requisito.id}>
                {requisito.descripcion}
                {!requisito.obligatorio && <p>Deseable</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <FormularioPostulacion idVacante={vacante.id}/>
    </div>
  );
}
