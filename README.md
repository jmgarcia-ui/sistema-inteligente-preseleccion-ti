# Sistema inteligente de preselección TI

Sistema para la **primera etapa de un proceso de selección de TI: el filtrado de CVs**.

El candidato postula con su CV, la IA lo lee y relaciona cada requisito de la vacante con la evidencia que encuentra, propone si pasa o no y redacta el correo. **Una persona del equipo revisa y decide**; recién entonces se envía el correo al candidato (felicitación, o el motivo y un feedback útil). Todo queda registrado.

**Sitio en línea:** https://blue-plant-017ce3910.4.azurestaticapps.net

## Cómo funciona

1. El reclutador crea una vacante con sus requisitos y la publica.
2. Comparte el enlace de la vacante (LinkedIn, Computrabajo…).
3. El candidato postula sin crear cuenta: datos de contacto, enlaces y CV en PDF (hasta 5 MB).
4. **Azure AI Document Intelligence** lee el CV.
5. **Azure OpenAI** relaciona cada requisito con una cita del CV, propone *pasa / no pasa* y redacta el correo. Las citas se comprueban contra el texto del CV.
6. El reclutador revisa la evidencia, decide (una por una o en lote) y edita el correo si hace falta.
7. **Azure Communication Services** envía el correo.
8. Cada acción queda en la sección **Actividad** y en el historial del candidato.

La IA nunca descarta ni envía nada por su cuenta.

## Tecnologías

| Parte | Tecnologías |
| --- | --- |
| Frontend (`apps/web`) | React 19, Vite, TypeScript, React Router, TipTap (editor de texto) |
| Backend (`apps/api`) | FastAPI, SQLAlchemy, Alembic, SQL Server |
| Azure | Blob Storage, AI Document Intelligence, OpenAI (gpt-4o-mini), Communication Services (Email), App Service, Static Web Apps, Azure SQL |

## Estructura

```
apps/
  api/                FastAPI
    app/
      modelos/        tablas (SQLAlchemy)
      esquemas/       validación de entrada y salida (Pydantic)
      rutas/          endpoints
      servicios/      lógica: vacantes, CV, IA, correos, registro…
    migraciones/      Alembic
    pruebas/          pytest
    crear_usuario.py  crea cuentas del equipo desde la terminal
  web/                React
    src/
      pages/          páginas
      componentes/    componentes por sección
      servicios/      llamadas a la API
      style/          estilos por página
docs/                 modelo de datos
PRODUCT.md            propósito y reglas del producto
DESIGN.md             sistema de diseño
```

## Ejecutarlo en local

**Requisitos:** Python 3.13, Node 24, SQL Server y el *ODBC Driver 18 for SQL Server*.

### Backend

```bash
cd apps/api
python -m venv .venv
.venv/Scripts/activate          # en Linux o macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # y completa los valores
python -m alembic upgrade head  # crea las tablas
python crear_usuario.py         # crea tu cuenta (la contraseña no se muestra)
python -m uvicorn app.main:app --reload
```

La API queda en http://localhost:8000 (documentación en `/docs`).

Sin las variables de Azure el sistema funciona igual: los CV se guardan en disco y la lectura, el análisis y el envío de correos quedan desactivados.

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

El sitio queda en http://localhost:5173. Usa `VITE_API_URL` si la API está en otra dirección.

### Pruebas

```bash
cd apps/api && python -m pytest -q
cd apps/web && npm run lint
```

## Despliegue

Cada cambio que llega a `main` se publica solo con GitHub Actions:

- **Publicar web** (`.github/workflows/web.yml`): compila el frontend y lo sube a Azure Static Web Apps.
- **Publicar API** (`.github/workflows/api.yml`): corre las pruebas y sube el backend a Azure App Service. Las migraciones se aplican al arrancar.

Forma de trabajo: se programa en `dev` y se une con `main` para publicar.

Secretos del repositorio: `AZURE_STATIC_WEB_APPS_API_TOKEN` y `AZURE_WEBAPP_PUBLISH_PROFILE`.

Las cuentas de producción se crean con `python crear_usuario.py --produccion`, que lee la conexión de `apps/api/.env.produccion` (no se sube al repositorio).

> En el plan gratis, el servidor y la base de datos se duermen tras un rato sin uso: la primera carga puede tardar hasta un minuto.
