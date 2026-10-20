# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Reclutadores** del equipo interno de una sola empresa que contrata perfiles de TI. Su trabajo: definir una vacante, publicarla, revisar las postulaciones que llegan y decidir quién avanza, con la evidencia a la vista.
- **Administradores** de la empresa: gestionan usuarios y la operación del equipo de reclutamiento (roles existentes en el sistema: `administrador`, `reclutador`).
- **Candidatos** de TI: llegan a una vacante por el enlace directo que el reclutador adjunta al publicar el puesto en plataformas de empleo (LinkedIn, Computrabajo) o desde la lista pública de vacantes abiertas (`/vacantes`). En la página de cada vacante (`/vacantes/:id`) ven los detalles del puesto y, al lado, el formulario para postular sin crear cuenta, con sus datos de contacto, enlaces (LinkedIn, GitHub, portafolio) y su CV en PDF. Reciben por correo el resultado de esta primera etapa: felicitación si avanzan, o el motivo y un feedback si no.

## Product Purpose

Sistema para la **primera etapa de un proceso de selección de TI: el filtrado de CVs**. Convierte los detalles de una vacante en una publicación clara, recibe las postulaciones con su CV, lee cada CV con IA y relaciona cada requisito con la evidencia encontrada, mostrando su origen. La IA propone si la persona pasa o no a la siguiente etapa (entrevista técnica u otra) y redacta el correo: de felicitación, o con el motivo y un feedback útil. Una persona del equipo revisa la propuesta, la confirma o la corrige (puede hacerlo en lote) y recién entonces se envía el correo; todo queda registrado.

Éxito: el reclutador filtra CVs mucho más rápido con decisiones justificables y trazables a evidencia concreta, y cada candidato recibe una respuesta clara, incluso si no avanza.

## Positioning

La evidencia explica cada decisión: la IA lee, compara, propone y redacta, pero no descarta ni comunica nada por su cuenta; vincula requisito ↔ evidencia ↔ origen, y la decisión y el envío del correo siempre los confirma una persona del equipo.

## Operating Context

- Herramienta interna de una sola empresa; no es un SaaS ni hay múltiples organizaciones.
- La landing pública (`/`) existe para dar una presentación más profesional al sistema y servir de entrada (inicio de sesión, vacantes); no es una página de venta ni de captación de clientes.
- Flujo: definir perfil → publicar vacante → compartir su enlace en plataformas de empleo → recibir postulaciones con CV → la IA lee el CV y relaciona evidencia con requisitos → la IA propone "pasa / no pasa" y el borrador del correo → el equipo confirma o corrige → se envía el correo (felicitación, o motivo + feedback) y se registra.
- Alcance: solo la primera etapa (filtrado de CVs). Las etapas siguientes (entrevista técnica, etc.) ocurren fuera del sistema; el correo de quien avanza le avisa que será contactado.
- Estados de vacante: `borrador`, `publicada`, `cerrada`. Modalidad: `remoto`, `hibrido`, `presencial`; con fecha límite.
- Estados de postulación: `recibida`, `en_revision`, `preseleccionada`, `descartada`, `retirada`. Un candidato postula una sola vez por vacante.
- Fuentes de evidencia del candidato: CV/documentos, GitHub, LinkedIn, portafolio.

## Capabilities and Constraints

- Stack: frontend React + Vite + TypeScript (`apps/web`), API FastAPI + SQLAlchemy + Alembic sobre SQL Server (`apps/api`), `apps/worker` reservado para procesamiento en segundo plano.
- Implementado: autenticación de usuarios con roles, gestión de vacantes (crear, editar, publicar, cerrar), postulaciones de candidatos, panel del reclutador (resumen y mis vacantes).
- Servicios de Azure previstos (cuenta con saldo limitado, ~60 USD; vigilar costos con un presupuesto): **Blob Storage** para guardar los CV, **AI Document Intelligence** para leerlos, **Azure OpenAI** para comparar CV ↔ requisitos y redactar el feedback (verificar disponibilidad en la suscripción), **Communication Services (Email)** para los correos.
- La IA propone evidencia con su fuente, una recomendación y el borrador del correo; no aprueba, no descarta y no envía.
- CV: solo PDF, hasta 5 MB. En desarrollo se guarda en disco local; con la cadena de conexión de Azure configurada, en Blob Storage.
- Idioma del producto: español.
- **Abierto:** cómo se presenta el nivel de confianza de la evidencia.
- **Abierto:** envío de correos (felicitación y feedback), aún no implementado.
- **Abierto:** registro de acciones (historial de cada postulación, motivo de descarte, bitácora y sección Actividad).
- **Abierto:** vacantes confidenciales que no aparezcan en la lista pública; registrar la plataforma de origen de cada postulación (`?origen=linkedin`).

## Brand Commitments

- Nombre del producto: **sin definir**. "Atlas" aparece en el código (`LandingAtlas`) como nombre provisional; no tratarlo como marca confirmada.
- Voz ya presente en la landing: sobria, directa, en español, frases cortas; habla de contexto, claridad y control humano, no de automatización mágica.
- Dirección visual elegida para la landing (oct. 2026): el estándar de la categoría ejecutado con cuidado, sin rarezas; nivel de calidad de referencia: Ashby y Stripe.

## Evidence on Hand

- No hay clientes, testimonios, métricas, precios ni casos reales, y el producto no se vende. No inventarlos ni añadir precios o llamados a contratar.
- Los ejemplos de la landing (p. ej. "Laura Méndez", "Desarrolladora Backend") son datos de muestra ficticios y deben seguir presentándose como ilustración.

## Product Principles

1. **Control humano.** La aprobación pertenece al equipo; la IA asiste, nunca decide.
2. **Trazabilidad.** Cada evidencia conserva su origen y cada decisión o comunicación queda registrada.
3. **Contexto antes que puntaje.** Mostrar por qué un candidato cumple un requisito, no solo un número.
4. **Protección de datos.** La información de los candidatos permanece dentro del proceso de la empresa.
5. **Justo con el candidato.** Postular debe ser simple y la comunicación del resultado, clara; quien no avanza recibe el motivo y un feedback útil, nunca un rechazo sin explicación.
