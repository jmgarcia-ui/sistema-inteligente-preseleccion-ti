import { useState, type FormEvent } from "react";
import crearPostulacion from "../../servicios/postulaciones";
import type { CandidatoPostulacion, PostulacionCrear } from "../../tipos/postulacion";

type Propiedades = {
  idVacante: number;
};

function FormularioPostulacion({ idVacante }: Propiedades) {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portafolio, setPortafolio] = useState("");
  const [github, setGithub] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  //¿hay un envío en curso? evita el doble clic
  const [enviando, setEnviando] = useState(false);
  //¿la postulación ya se recibió? reemplaza el formulario por la confirmación
  const [enviado, setEnviado] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const datos_formulario: CandidatoPostulacion = {
      nombres: nombres,
      apellidos: apellidos,
      correo: correo,
      telefono: telefono || null,
      linkedin_url: linkedin || null,
      portafolio_url: portafolio || null,
      github_url: github || null,
    };

    const postulacion_data: PostulacionCrear = {
      id_vacante: idVacante,
      candidato: datos_formulario,
      acepta_tratamiento_datos: aceptaTerminos,
    };

    setEnviando(true);
    setMensajeError("");

    crearPostulacion(postulacion_data)
      .then(() => {
        setEnviado(true);
      })
      .catch((error) => {
        if (error.response?.status === 409) setMensajeError("Ya postulaste a esta vacante con este correo.");
        else setMensajeError("No pudimos enviar tu postulación. Inténtalo de nuevo.");
      })
      .finally(() => setEnviando(false));
  }

  if (enviado)
    return (
      <div>
        <h2>Recibimos tu postulación</h2>
        <p>Te escribiremos a {correo} cuando el equipo revise tu perfil.</p>
      </div>
    );

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="nombres">Nombres completos:</label>
      <input id="nombres" type="text" value={nombres} onChange={(evento) => setNombres(evento.target.value)} /> <br />
      <label htmlFor="apellidos">Apellidos completos:</label>
      <input
        id="apellidos"
        type="text"
        value={apellidos}
        onChange={(evento) => setApellidos(evento.target.value)}
      />{" "}
      <br />
      <label htmlFor="correo">Correo:</label>
      <input id="correo" type="email" value={correo} onChange={(evento) => setCorreo(evento.target.value)} />
      <br />
      <label htmlFor="telefono">Teléfono:</label>
      <input id="telefono" type="tel" value={telefono} onChange={(evento) => setTelefono(evento.target.value)} />
      <br />
      <label htmlFor="linkedin">LinkedIn:</label>
      <input id="linkedin" type="url" value={linkedin} onChange={(evento) => setLinkedin(evento.target.value)} />
      <br />
      <label htmlFor="portafolio">Portafolio (opcional)</label>
      <input id="portafolio" type="url" value={portafolio} onChange={(evento) => setPortafolio(evento.target.value)} />
      <br />
      <label htmlFor="github">gitHub (opcional)</label>
      <input id="github" type="url" value={github} onChange={(evento) => setGithub(evento.target.value)} />
      <br />
      <label htmlFor="acepta-terminos">Acepto los términos y condiciones</label>
      <input
        id="acepta-terminos"
        type="checkbox"
        checked={aceptaTerminos}
        onChange={(evento) => setAceptaTerminos(evento.target.checked)}
      />{" "}
      <br />
      {mensajeError && <p>{mensajeError}</p>}
      <button disabled={!aceptaTerminos || enviando}>{enviando ? "Enviando…" : "Postular"}</button>
    </form>
  );
}

export default FormularioPostulacion;
