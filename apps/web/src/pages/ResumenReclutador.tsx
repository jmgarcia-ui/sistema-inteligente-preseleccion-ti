import { useContext } from "react";
import { UsuarioContext } from "../contexto/UsuarioContext";
import { Navigate } from "react-router-dom";

export default function ResumenReclutador() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error("Resumen reclutador debe estar dentro de UsuarioProvider");

  if (contexto.cargando) return <p>Verificando...</p>;

  if (!contexto.usuario) return <Navigate to="/iniciar-sesion" replace />;

  const usuarioLogeado = contexto.usuario;

  return (
    <div>
      <h1>Vista reclutador</h1>
      <p>
        Bienvenido, {usuarioLogeado.nombres} {usuarioLogeado.apellidos}
      </p>
      <p>Tu correo es: {usuarioLogeado?.correo}</p>
      <button type="button" onClick={contexto.cerrarSesion}>Cerrar sesión</button>
    </div>
  );
}
