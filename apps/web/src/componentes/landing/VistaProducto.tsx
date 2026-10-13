import BarraLateralProducto from "./BarraLateralProducto";
import DetallesVacanteVista from "./DetallesVacanteVista";
import PublicacionListaVista from "./PublicacionListaVista";

export default function VistaProducto() {
  return (
    <figure className="portada__visual">
      <div className="portada__captura" aria-hidden="true">
        <div className="navegador-producto__barra">
          <div className="navegador-producto__controles">
            <span className="navegador-producto__punto navegador-producto__punto--rojo" />
            <span className="navegador-producto__punto navegador-producto__punto--amarillo" />
            <span className="navegador-producto__punto navegador-producto__punto--verde" />
          </div>
          <div className="navegador-producto__direccion" />
        </div>
        <div className="navegador-producto__pantalla">
          <BarraLateralProducto />

          <div className="vista-producto__contenido">
            <p className="vista-producto__ruta">Vacantes / Desarrollador Backend</p>

            <div className="vista-producto__encabezado">
              <div>
                <h2>Revisa detalles de la publicación.</h2>
                <p>Completa la información y publica la vacante en pocos pasos.</p>
              </div>
              <div className="vista-producto__acciones">
                <span className="vista-producto__estado">Borrador</span>
                <span className="vista-producto__boton-vista">Vista previa</span>
                <span className="vista-producto__boton-publicar">Publicar vacante</span>
              </div>
            </div>

            <div className="vista-producto__columnas">
              <DetallesVacanteVista />
              <PublicacionListaVista />
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
