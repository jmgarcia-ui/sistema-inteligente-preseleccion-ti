import { ChartNoAxesColumnIncreasing, House, Settings, ShieldUser, SquareCheck, UserRound } from "lucide-react";

export default function BarraLateralProducto() {
  return (
    <aside className="vista-producto__lateral">
      <p className="vista-producto__marca">
        Reclutamiento <br /> Inteligente
      </p>
      <div className="vista-producto__menu">
        <span>
          <House size={15} />
          Inicio
        </span>
        <span>
          <ChartNoAxesColumnIncreasing size={15} />
          Resumen
        </span>
        <span className="vista-producto__opcion-activa">
          <SquareCheck size={15} />
          Vacantes
        </span>
        <span>
          <UserRound size={15} />
          Candidatos
        </span>
        <span>
          <ShieldUser size={15} />
          Equipo
        </span>
        <span>
          <Settings size={15} />
          Configuración
        </span>
      </div>
    </aside>
  );
}
