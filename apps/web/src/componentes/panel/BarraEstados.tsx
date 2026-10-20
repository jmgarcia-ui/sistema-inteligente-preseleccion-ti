import type { EstadoPostulacion } from "../../tipos/panel";
import { SEGMENTOS } from "../../utilidades/panel";

type Propiedades = {
  //{ recibida: 5, en_revision: 3 }; los estados que faltan cuentan como 0
  conteos: Partial<Record<EstadoPostulacion, number>>;
};

//una barra con un segmento por estado, del ancho de su cantidad; sin postulaciones queda punteada
function BarraEstados({ conteos }: Propiedades) {
  const cantidades = SEGMENTOS.map((segmento) => conteos[segmento.clave] ?? 0);
  if (cantidades.every((cantidad) => cantidad === 0)) return <span className="barra-estados barra-estados--vacia" aria-hidden="true" />;
  return (
    <span className="barra-estados" aria-hidden="true">
      {SEGMENTOS.map((segmento, indice) =>
        cantidades[indice] > 0 ? <i style={{ flexGrow: cantidades[indice], background: segmento.color }} key={segmento.clave} /> : null,
      )}
    </span>
  );
}

export default BarraEstados;
