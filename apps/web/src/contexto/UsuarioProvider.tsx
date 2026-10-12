import type { JSX } from "react/jsx-runtime"
import { UsuarioContext } from "./UsuarioContext"
import { autenticar } from "../servicios/autenticacion"
import { useState } from "react"
import type { Credenciales, RespuestaToken, UsuarioAutenticado } from "../tipos/sesion"

type props = {
  children: JSX.Element | JSX.Element[]
}

function UsuarioProvider({children} : props) {

  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null)
  const [token, setToken] = useState<RespuestaToken | null>(null)

  async function iniciarSesion(credenciales: Credenciales){
    const respuesta = await autenticar(credenciales)
    setUsuario(respuesta.usuario)
    setToken(respuesta.token)
  }
 
  return (
    <UsuarioContext.Provider value={{ usuario, token, iniciarSesion}}>
      { children }
    </UsuarioContext.Provider>
  )
}

export default UsuarioProvider
