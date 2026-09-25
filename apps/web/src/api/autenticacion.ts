// importar objeto que guarda la url del backend
import { configuracion } from "../configuracion";

// objeto que enviaremos al iniciar sesion
export type CredencialesInicioSesion = {
  correo: string
  contrasena: string
}

// objeto que esperamos recibir del backend (fastapi)
export type RespuestaToken = {
  token_acceso: string
  tipo_token: string
}

// export: cualquier pantalla puede usarla
// async: indica que esperara una respuesta del backend
export async function iniciarSesion(
  credenciales: CredencialesInicioSesion
): Promise<RespuestaToken>{
  let respuesta: Response
  try {
    respuesta = await fetch(`${configuracion.api_url}/autenticacion/iniciar-sesion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credenciales),
    })
  } catch {
    throw new Error('No se pudo conectar con la API. Comprueba que el backend esté iniciado.')
  }

  if (respuesta.status === 401)
    throw new Error('Correo o contraseña incorrectos')
  if (!respuesta.ok)
    throw new Error(`La API respondió con un error (${respuesta.status}).`)

  //convertir json en un objeto de ts
  const datos: RespuestaToken = await respuesta.json()

  if (!datos.token_acceso)
    throw new Error('La API no devolvió un token de acceso.')
  return datos
}
