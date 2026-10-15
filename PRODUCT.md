# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Reclutadores** del equipo interno de una sola empresa que contrata perfiles de TI. Su trabajo: definir una vacante, publicarla, revisar las postulaciones que llegan y decidir quién avanza, con la evidencia a la vista.
- **Administradores** de la empresa: gestionan usuarios y la operación del equipo de reclutamiento (roles existentes en el sistema: `administrador`, `reclutador`).
- **Candidatos** de TI: llegan a una vacante por el enlace directo que el reclutador adjunta al publicar el puesto en plataformas de empleo (LinkedIn, Computrabajo) o desde la lista pública de vacantes abiertas (`/vacantes`). En la página de cada vacante (`/vacantes/:id`) ven los detalles del puesto y, al lado, el formulario para postular sin crear cuenta, con sus datos de contacto y enlaces (LinkedIn, GitHub, portafolio).

## Product Purpose

Sistema de preselección de candidatos de TI. Convierte los detalles de una vacante en una publicación clara, organiza sus postulaciones y relaciona cada requisito con la evidencia encontrada en el material del candidato, mostrando su origen. El equipo revisa esa evidencia y decide; al aprobar, el sistema envía el correo al candidato y registra la acción.

Éxito: el reclutador llega a decisiones de preselección más rápidas y justificables, y cada decisión queda trazable a evidencia concreta.

## Positioning

La evidencia explica cada decisión: el sistema no puntúa ni descarta candidatos por su cuenta; vincula requisito ↔ evidencia ↔ origen, y la aprobación siempre pertenece a una persona del equipo.

## Operating Context

- Herramienta interna de una sola empresa; no es un SaaS ni hay múltiples organizaciones.
- La landing pública (`/`) existe para dar una presentación más profesional al sistema y servir de entrada (inicio de sesión, vacantes); no es una página de venta ni de captación de clientes.
- Flujo: definir perfil → publicar vacante → compartir su enlace en plataformas de empleo → recibir postulaciones → relacionar evidencia con requisitos → el equipo aprueba y comunica.
- Estados de vacante: `borrador`, `publicada`, `cerrada`. Modalidad: `remoto`, `hibrido`, `presencial`; con fecha límite.
- Estados de postulación: `recibida`, `en_revision`, `preseleccionada`, `descartada`, `retirada`. Un candidato postula una sola vez por vacante.
- Fuentes de evidencia del candidato: CV/documentos, GitHub, LinkedIn, portafolio.

## Capabilities and Constraints

- Stack: frontend React + Vite + TypeScript (`apps/web`), API FastAPI + SQLAlchemy + Alembic sobre SQL Server (`apps/api`), `apps/worker` reservado para procesamiento en segundo plano.
- Implementado: autenticación de usuarios con roles, gestión de vacantes, postulaciones de candidatos y su consulta por vacante.
- El análisis de evidencia se hará con servicios de inteligencia artificial de Azure. La IA propone evidencia con su fuente; no aprueba ni descarta.
- Idioma del producto: español.
- **Abierto:** qué servicios concretos de Azure AI se usarán y cómo se presenta el nivel de confianza de la evidencia.
- **Abierto:** envío de correos al aprobar (descrito en la landing, aún no implementado).
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
5. **Justo con el candidato.** Postular debe ser simple y la comunicación del resultado, clara.
