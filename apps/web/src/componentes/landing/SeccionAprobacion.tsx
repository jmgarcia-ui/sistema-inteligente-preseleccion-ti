export default function SeccionAprobacion() {
  return (
    <section className="seccion-aprobacion seccion-editorial" id="decision" aria-labelledby="titulo-aprobacion">
      <div className="seccion-editorial__mensaje">
        <span className="seccion-editorial__numero" aria-hidden="true">04</span>
        <div>
          <h2 id="titulo-aprobacion">Aprobar también significa comunicar.</h2>
          <p>Antes de confirmar, revisa el destinatario y el mensaje. El sistema envía el correo y registra la acción.</p>
        </div>
      </div>

      <figure className="muestra-correo" aria-hidden="true">
        <h3>Aprobar a Laura Méndez</h3>
        <div className="muestra-correo__fila"><span>Para</span><strong className="muestra-correo__destinatario">laura.mendez@ejemplo.com <b>✓</b></strong></div>
        <div className="muestra-correo__fila"><span>Asunto</span><strong>Avance en el proceso – Desarrollador Backend</strong></div>
        <div className="muestra-correo__fila muestra-correo__fila--mensaje">
          <span>Mensaje</span>
          <p>Hola Laura,<br />Queremos contarte que tu postulación avanza en el proceso.<br />Pronto estaremos en contacto.</p>
        </div>
        <span className="muestra-correo__accion">Aprobar y enviar correo</span>
      </figure>
    </section>
  );
}
