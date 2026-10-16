import { useContext } from "react";
import { UsuarioContext } from "../contexto/UsuarioContext";
export default function ResumenReclutador() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error("Resumen reclutador debe estar dentro de UsuarioProvider");

  const usuarioLogeado = contexto.usuario;

  return (
    <div>
      <h1>Vista reclutador</h1>
      <p>
        Bienvenido, {usuarioLogeado?.nombres} {usuarioLogeado?.apellidos}
      </p>
      <p>Tu correo es: {usuarioLogeado?.correo}</p>
    </div>
  );
}
