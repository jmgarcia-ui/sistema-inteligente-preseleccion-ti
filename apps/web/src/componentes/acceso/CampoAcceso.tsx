import { useState, type ChangeEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type PropiedadesCampoAcceso = {
  id: string
  etiqueta: string
  tipo: 'email' | 'password'
  autocompletar: string
  ejemplo?: string
  //opcionales: para validar mientras se escribe (crear contraseña)
  valor?: string
  alCambiar?: (valor: string) => void
  describe?: string
}

export default function CampoAcceso({ id, etiqueta, tipo, autocompletar, ejemplo, valor, alCambiar, describe }: PropiedadesCampoAcceso) {
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
          {...(alCambiar ? { value: valor ?? '', onChange: (evento: ChangeEvent<HTMLInputElement>) => alCambiar(evento.target.value) } : {})}
          aria-describedby={describe}
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
