from fastapi import FastAPI
from app.rutas.salud import router as router_salud
from app.configuracion import obtener_configuracion
from fastapi.middleware.cors import CORSMiddleware

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