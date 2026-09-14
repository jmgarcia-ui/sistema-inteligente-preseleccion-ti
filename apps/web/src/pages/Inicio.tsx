import { useEffect, useState } from "react"
import { configuracion } from "../configuracion"

type EstadoApi = 'comprobando' | 'disponible' | 'error'
export default function Inicio(){

  const[estadoApi, setEstadoApi] = useState<EstadoApi>('comprobando')
  useEffect(()=>{
    async function comprobarApi() {
      try {
        const respuesta = await fetch(`${configuracion.api_url}/health`,)

        if(!respuesta.ok)
          throw new Error('La API respondió con un error')

        setEstadoApi('disponible')
      } catch (error) {
        setEstadoApi('error')
      }
    }
    comprobarApi()
  },[])
  return (
    <main>
      <h1>Página de Inicio</h1>
      <p>Estado de la api: {estadoApi}</p>
    </main>
  )
}