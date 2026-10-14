import "./App.css";
import "./style/inicio-sesion.css";
import Navegacion from "./componentes/navegacion/Navegacion";
import RutasApp from "./rutas/RutasApp";
import UsuarioProvider from "./contexto/UsuarioProvider";

export default function App() {
  return (
    <UsuarioProvider>
      <>
        <Navegacion />
        <main>
          <RutasApp />
        </main>
      </>
    </UsuarioProvider>
  );
}
