import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type PropiedadesCampoAcceso = {
  id: string
  etiqueta: string
  tipo: 'email' | 'password'
  autocompletar: string
  ejemplo?: string
}

export default function CampoAcceso({ id, etiqueta, tipo, autocompletar, ejemplo }: PropiedadesCampoAcceso) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const esContrasena = tipo === 'password'

  return (
    <div className="acceso__campo">
      <label htmlFor={id}>{etiqueta}</label>
      <div className="acceso__entrada">
        <input
          id={id}
          name={id}
          type={esContrasena && mostrarContrasena ? 'text' : tipo}
          placeholder={ejemplo}
          autoComplete={autocompletar}
          required
        />
        {esContrasena && (
          <button
            className="acceso__mostrar-contrasena"
            type="button"
            onClick={() => setMostrarContrasena((visible) => !visible)}
            aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={mostrarContrasena}
          >
            {mostrarContrasena ? <EyeOff size={21} strokeWidth={1.8} aria-hidden="true" /> : <Eye size={21} strokeWidth={1.8} aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  )
}
