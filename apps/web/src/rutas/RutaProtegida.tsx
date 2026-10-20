import { useContext } from "react";
import { UsuarioContext } from "../contexto/UsuarioContext";
import { Navigate, Outlet } from "react-router-dom";

//envuelve las rutas del panel: solo deja pasar si hay una sesión válida
function RutaProtegida() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error("RutaProtegida debe estar dentro de UsuarioProvider");

  //mientras /yo responde, no se decide nada
  if (contexto.cargando) return <p>Verificando tu sesión…</p>;

  if (!contexto.usuario) return <Navigate to="/iniciar-sesion" replace />;

  return <Outlet />;
}

export default RutaProtegida;
