"""Aplicación FastAPI principal."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import licitaciones, excel_import, scraping, config, backup


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicializar BD al arrancar."""
    init_db()
    yield
    # Cleanup si necesario


app = FastAPI(
    title="App Licitaciones",
    description="Análisis y scraping de licitaciones públicas",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(licitaciones.router, prefix="/api/licitaciones", tags=["licitaciones"])
app.include_router(excel_import.router, prefix="/api/excel", tags=["excel"])
app.include_router(scraping.router, prefix="/api/scraping", tags=["scraping"])
app.include_router(config.router, prefix="/api/config", tags=["config"])
app.include_router(backup.router, prefix="/api/backup", tags=["backup"])


@app.get("/api/health")
def health_check():
    """Health check para Docker."""
    return {"status": "ok", "message": "App Licitaciones running"}
