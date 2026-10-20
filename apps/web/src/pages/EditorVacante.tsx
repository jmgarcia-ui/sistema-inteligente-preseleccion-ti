import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import "../style/mis-vacantes.css";
import { UsuarioContext } from "../contexto/UsuarioContext";
import FormularioVacante from "../componentes/panel/FormularioVacante";
import { actualizarVacante, crearVacante, obtenerMiVacante } from "../servicios/panel";
import type { VacanteCambios, VacanteDatos, VacanteDetalle } from "../tipos/panel";

const VACANTE_VACIA: VacanteDatos = {
  titulo: "",
  descripcion: "",
  requisitos: [],
  modalidad: "remoto",
  ubicacion: null,
  fecha_limite: "",
};

//una sola página para dos rutas: /reclutador/vacantes/nueva y /reclutador/vacantes/:idVacante/editar
export default function EditorVacante() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error("EditorVacante debe estar dentro de UsuarioProvider");
  const { token, cerrarSesion } = contexto;

  const { idVacante } = useParams();
  //si la ruta trae un id, se está editando; si no, se está creando
  const esEdicion = idVacante !== undefined;
  const id = Number(idVacante);
  const navegar = useNavigate();

  const [vacante, setVacante] = useState<VacanteDetalle | null>(null);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [hayError, setHayError] = useState(false);
  const [intento, setIntento] = useState(0);

  //al editar, primero se pide la vacante para llenar el formulario
  useEffect(() => {
    if (!esEdicion || token === null) return;
    obtenerMiVacante(token, id)
      .then((datos) => setVacante(datos))
      .catch((error) => {
        const codigo = error.response?.status;
        if (codigo === 401) cerrarSesion();
        //404: no existe; 403: es de otra persona. En los dos casos, para quien mira, "no está"
        else if (codigo === 404 || codigo === 403) setNoEncontrada(true);
        else setHayError(true);
      });
  }, [esEdicion, token, id, intento, cerrarSesion]);

  //el formulario llama a esta función; si algo falla, el error vuelve al formulario para mostrarlo
  async function guardar(datos: VacanteDatos, publicar: boolean) {
    if (token === null) return;

    if (!esEdicion) {
      //crear siempre deja un borrador; publicar es un segundo paso
      const creada = await crearVacante(token, datos);
      if (publicar) await actualizarVacante(token, creada.id, { estado: "publicada" });
    } else if (vacante !== null) {
      //al editar solo se envía lo que cambió
      const cambios = diferencias(vacante, datos);
      if (publicar) cambios.estado = "publicada";
      if (Object.keys(cambios).length > 0) await actualizarVacante(token, vacante.id, cambios);
    }

    navegar("/reclutador/vacantes");
  }

  if (noEncontrada)
    return (
      <div className="mis-vacantes__aviso">
        <h1>No encontramos esta vacante</h1>
        <p>Puede que no exista o que no sea tuya.</p>
        <Link className="boton boton--secundario boton--chico" to="/reclutador/vacantes">
          <ArrowLeft size={16} aria-hidden="true" />
          Volver a Mis vacantes
        </Link>
      </div>
    );

  if (hayError)
    return (
      <div className="mis-vacantes__aviso" role="alert">
        <h1>No pudimos cargar la vacante</h1>
        <p>Revisa tu conexión e inténtalo de nuevo.</p>
        <button
          className="boton boton--primario boton--chico"
          type="button"
          onClick={() => {
            setHayError(false);
            setIntento((anterior) => anterior + 1);
          }}>
          <RefreshCw size={16} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    );

  if (esEdicion && vacante === null)
    return (
      <div aria-busy="true">
        <span className="solo-lectores">Cargando la vacante…</span>
        <span className="esqueleto-panel" style={{ width: 140, height: 20 }} />
        <span className="esqueleto-panel" style={{ width: 260, height: 36, marginTop: 16 }} />
        {[1, 2, 3].map((fila) => (
          <span className="esqueleto-panel" style={{ height: 120, marginTop: 24, maxWidth: 760 }} key={fila} />
        ))}
      </div>
    );

  return (
    <div className="editor-vacante">
      <Link className="editor-vacante__volver" to="/reclutador/vacantes">
        <ArrowLeft size={16} aria-hidden="true" />
        Mis vacantes
      </Link>
      <h1>{esEdicion ? "Editar vacante" : "Nueva vacante"}</h1>
      <p className="editor-vacante__sub">{subtitulo(vacante)}</p>
      {/* key: si cambias de vacante sin salir de la página, el formulario arranca de cero con los datos nuevos */}
      <FormularioVacante
        key={vacante?.id ?? "nueva"}
        inicial={vacante ? aDatos(vacante) : VACANTE_VACIA}
        estado={vacante?.estado}
        idVacante={vacante?.id}
        alGuardar={guardar}
      />
    </div>
  );
}

function subtitulo(vacante: VacanteDetalle | null) {
  if (vacante === null) return "Se guarda como borrador hasta que la publiques. Nadie la ve antes.";
  if (vacante.estado === "publicada") return "Está publicada: los cambios se ven en la página pública al guardar.";
  if (vacante.estado === "cerrada") return "Está cerrada: no aparece en la lista pública ni recibe postulaciones.";
  return "Es un borrador: nadie la ve hasta que la publiques.";
}

//convierte la vacante de la API en los datos que usa el formulario
function aDatos(vacante: VacanteDetalle): VacanteDatos {
  return {
    titulo: vacante.titulo,
    descripcion: vacante.descripcion,
    requisitos: [...vacante.requisitos].sort((a, b) => a.orden - b.orden).map((r) => ({ descripcion: r.descripcion, obligatorio: r.obligatorio })),
    modalidad: vacante.modalidad,
    ubicacion: vacante.ubicacion,
    fecha_limite: vacante.fecha_limite,
  };
}

//compara lo guardado con lo del formulario y devuelve solo lo que cambió
//(enviar una fecha que no cambió y ya pasó haría que la API la rechace)
function diferencias(vacante: VacanteDetalle, datos: VacanteDatos): VacanteCambios {
  const antes = aDatos(vacante);
  const cambios: VacanteCambios = {};
  if (datos.titulo !== antes.titulo) cambios.titulo = datos.titulo;
  if (datos.descripcion !== antes.descripcion) cambios.descripcion = datos.descripcion;
  if (JSON.stringify(datos.requisitos) !== JSON.stringify(antes.requisitos)) cambios.requisitos = datos.requisitos;
  if (datos.modalidad !== antes.modalidad) cambios.modalidad = datos.modalidad;
  if (datos.ubicacion !== antes.ubicacion) cambios.ubicacion = datos.ubicacion;
  if (datos.fecha_limite !== antes.fecha_limite) cambios.fecha_limite = datos.fecha_limite;
  return cambios;
}
