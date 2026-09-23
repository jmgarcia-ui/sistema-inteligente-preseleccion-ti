# Frontend SmartRecruit TI — versión ampliada

Frontend construido con React + TypeScript + Vite y conectado a la API FastAPI existente.

## Rutas públicas

- `/` — Landing / inicio
- `/vacantes` — Listado y filtros de vacantes
- `/postular/:vacantePublicaId` — Formulario de postulación
- `/login` — Acceso de administrador/reclutador

## Panel privado

Requiere un token válido emitido por `POST /autenticacion/iniciar-sesion`.

- `/panel` — Dashboard general
- `/panel/vacantes` — Vacantes publicadas
- `/panel/vacantes/nueva` — Crear y publicar vacante real en FastAPI
- `/panel/candidatos` — Catálogo visual de candidatos (datos demo)
- `/panel/candidatos/:id` — Perfil y explicación del candidato (datos demo)
- `/panel/postulaciones` — Seguimiento de postulaciones (datos demo)
- `/panel/evaluaciones` — Ranking y evaluación explicable (datos demo)
- `/panel/competencias` — Catálogo de competencias (prototipo local)
- `/panel/configuracion` — Estado de API, sesión y roadmap de endpoints

## Integraciones reales ya conectadas

- `GET /health`
- `GET /vacantes`
- `GET /vacantes/:id`
- `POST /autenticacion/iniciar-sesion`
- `GET /autenticacion/yo`
- `POST /vacantes`
- `PATCH /vacantes/:id`

La creación de una vacante desde el panel hace primero `POST /vacantes` y luego `PATCH` con `estado: publicada`.

## Funciones todavía demostrativas

El backend original aún no expone endpoints para candidatos, postulaciones, competencias ni evaluaciones. Por eso esas pantallas usan datos demo claramente marcados, pero ya tienen la estructura visual necesaria para conectarlas después.

## Ejecutar

### Backend

```powershell
cd .\apps\api
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

API: `http://127.0.0.1:8000`
Swagger: `http://127.0.0.1:8000/docs`

### Frontend

```powershell
cd .\apps\web
npm install
npm run dev
```

Frontend: `http://localhost:5173`

`src/configuracion.ts` ahora usa `http://127.0.0.1:8000` como valor predeterminado si no existe `.env`, por lo que la pantalla ya no queda en blanco solo por faltar `VITE_API_URL`.

Si deseas usar `.env`, crea `apps/web/.env` con:

```env
VITE_API_URL=http://127.0.0.1:8000
```
