from fastapi import FastAPI
from app.rutas.salud import router as router_salud
from app.configuracion import obtener_configuracion
from fastapi.middleware.cors import CORSMiddleware
from app.rutas.sesiones import router as router_sesiones
from app.rutas.vacantes import router as router_vacantes
from app.rutas.postulaciones import router as router_postulaciones

app = FastAPI(
  title="API del sistema inteligente de preseleccion TI",
  version="0.1.0"
)

configuracion = obtener_configuracion()
app.add_middleware(
  CORSMiddleware,
  allow_origins=[configuracion.frontend_url],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(router_salud)
app.include_router(router_sesiones)
app.include_router(router_vacantes)
app.include_router(router_postulaciones)

