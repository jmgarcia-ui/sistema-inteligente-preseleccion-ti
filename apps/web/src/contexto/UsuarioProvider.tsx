import type { JSX } from "react/jsx-runtime";
import { UsuarioContext } from "./UsuarioContext";
import { autenticar, obtenerUsuarioActual } from "../servicios/autenticacion";
import { useCallback, useEffect, useState } from "react";
import type { Credenciales, RespuestaToken, UsuarioAutenticado } from "../tipos/sesion";

type props = {
  children: JSX.Element | JSX.Element[];
};

const CLAVE_TOKEN = "sesion";

function leerToken(): RespuestaToken | null {
  const texto = localStorage.getItem(CLAVE_TOKEN);
  if (texto === null) return null;

  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

function UsuarioProvider({ children }: props) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [token, setToken] = useState<RespuestaToken | null>(() => leerToken());
  const [cargando, setCargando] = useState(token !== null);

  async function iniciarSesion(credenciales: Credenciales) {
    const respuesta = await autenticar(credenciales);
    setUsuario(respuesta.usuario);
    setToken(respuesta.token);
    localStorage.setItem(CLAVE_TOKEN, JSON.stringify(respuesta.token));
  }

  //useCallback mantiene la misma función entre renders: así puede ir en las dependencias de un useEffect
  const cerrarSesion = useCallback(() => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem(CLAVE_TOKEN);
  }, []);

  useEffect(() => {
    const guardado = leerToken()
    if (guardado === null) return;
    obtenerUsuarioActual(guardado)
      .then((datos) => {
        setUsuario(datos);
      })
      .catch(() => {
        localStorage.removeItem(CLAVE_TOKEN);
        setToken(null);
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  return (
    <UsuarioContext.Provider value={{ usuario, token, iniciarSesion, cargando, cerrarSesion }}>{children}</UsuarioContext.Provider>
  );
}

export default UsuarioProvider;
