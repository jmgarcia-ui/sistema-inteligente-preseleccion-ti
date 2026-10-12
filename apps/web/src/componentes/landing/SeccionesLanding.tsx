import SeccionCandidatos from "./SeccionCandidatos";
import SeccionEvidencias from "./SeccionEvidencias";
import SeccionAprobacion from "./SeccionAprobacion";
import SeccionPrincipios from "./SeccionPrincipios";
import PieLanding from "./PieLanding";

export default function SeccionesLanding() {
  return (
    <>
      <SeccionCandidatos />
      <SeccionEvidencias />
      <SeccionAprobacion />
      <SeccionPrincipios />
      <PieLanding />
    </>
  );
}
