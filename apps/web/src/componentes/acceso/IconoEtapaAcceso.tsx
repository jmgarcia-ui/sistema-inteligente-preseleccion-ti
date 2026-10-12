type EtapaAcceso = 'vacante' | 'evidencias' | 'decision'

export default function IconoEtapaAcceso({ etapa }: { etapa: EtapaAcceso }) {
  return (
    <svg className="acceso__icono" viewBox="0 0 88 88" fill="none" aria-hidden="true" focusable="false">
      {etapa === 'vacante' && (
        <>
          <path d="M25 14h29l10 10v47a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3V17a3 3 0 0 1 3-3Z" />
          <path d="M54 14v11h10M31 31h25v11H31zM36 31v-5h14v5M31 38h25" />
          <path className="acceso__trazo-azul" d="M39 37h9M39 51h17M39 60h17M39 69h12" />
          <circle className="acceso__punto-azul" cx="33" cy="51" r="2" />
          <circle className="acceso__punto-azul" cx="33" cy="60" r="2" />
          <circle className="acceso__punto-azul" cx="33" cy="69" r="2" />
        </>
      )}
      {etapa === 'evidencias' && (
        <>
          <path d="M19 13h34l10 10v42a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4V17a4 4 0 0 1 4-4ZM53 13v12h10" />
          <circle cx="34" cy="29" r="5" />
          <path d="M24 43c1-5 5-8 10-8s9 3 10 8M24 51h20M24 59h16" />
          <path className="acceso__trazo-azul" d="M50 38h12v8h8M44 59h12v12h10" />
          <circle className="acceso__punto-azul" cx="62" cy="38" r="4" />
          <circle className="acceso__punto-azul" cx="56" cy="59" r="4" />
          <rect className="acceso__sello-azul" x="60" y="46" width="21" height="21" rx="6" />
          <path className="acceso__marca-blanca" d="m66 56 4 4 6-7" />
        </>
      )}
      {etapa === 'decision' && (
        <>
          <circle cx="38" cy="25" r="10" />
          <path d="M18 58v-5c0-11 8-18 20-18s20 7 20 18v5M17 70h45" />
          <path className="acceso__trazo-azul" d="M28 63c5-2 8-9 11-9 2 0 0 9 2 9 2 0 5-5 8-5 2 0 1 4 5 4" />
          <circle className="acceso__sello-azul" cx="67" cy="54" r="12" />
          <path className="acceso__marca-blanca" d="m61 54 4 4 8-8" />
        </>
      )}
    </svg>
  )
}
