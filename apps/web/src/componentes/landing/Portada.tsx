import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AnalisisEvidencia from "./AnalisisEvidencia";

export default function Portada() {
  return (
    <section className="portada" aria-labelledby="titulo-portada">
      <div className="envoltura portada__rejilla">
        <div className="portada__texto">
          <h1 id="titulo-portada">Preselección de talento TI con evidencia en cada requisito</h1>
          <p className="portada__bajada">
            Publicamos vacantes, recibimos postulaciones y relacionamos cada requisito con la evidencia del candidato.
            Una persona del equipo decide.
          </p>
          <div className="portada__acciones">
            <Link className="boton boton--primario" to="/vacantes">
              Ver vacantes abiertas
              <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
            </Link>
            <Link className="boton boton--secundario" to="/iniciar-sesion">
              Iniciar sesión
            </Link>
          </div>
          <p className="portada__nota">
            <b>¿Buscas trabajo?</b> Postula en minutos, sin crear una cuenta. <b>¿Eres del equipo?</b> Ingresa con tu
            correo.
          </p>
        </div>
        <AnalisisEvidencia />
      </div>
    </section>
  );
}
