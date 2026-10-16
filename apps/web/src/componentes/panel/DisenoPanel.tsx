import { useContext } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { UsuarioContext } from "../../contexto/UsuarioContext";

function DisenoPanel() {
  const contexto = useContext(UsuarioContext);

  return (
    <div>
      <header>
        <div>
          <p>{contexto?.usuario?.nombres}</p>
          <p>{contexto?.usuario?.correo}</p>
        </div>

        {/* NavLink agrega la clase "active" solo al enlace de la página actual */}
        <nav>
          <NavLink to="/reclutador/resumen">Resumen</NavLink>
          <NavLink to="/reclutador/vacantes">Mis vacantes</NavLink>
          <NavLink to="/reclutador/candidatos">Candidatos</NavLink>
          <NavLink to="/reclutador/actividad">Actividad</NavLink>
        </nav>

        <div>
          <button type="button" onClick={contexto?.cerrarSesion}>Cerrar sesión</button>
        </div>
      </header>

      {/* aquí se dibuja la página del panel que corresponde a la ruta */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default DisenoPanel;
