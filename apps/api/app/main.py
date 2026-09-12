from fastapi import FastAPI
from app.routers.salud import router as router_salud

app = FastAPI(
  title="API del sistema inteligente de preseleccion TI",
  version="0.1.0"
)

app.include_router(router_salud)