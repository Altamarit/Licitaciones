"""Router de configuración (CU-04)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, Field

from app.database import get_db
from app.models import Config
from app.schemas import ConfigResponse

router = APIRouter()


class ConfigUpdate(BaseModel):
    empresa_descripcion: Optional[str] = None
    scraping_auto: Optional[bool] = None
    dias_scraping_antiguo: Optional[int] = Field(None, ge=1, le=365)
    scrapes_concurrentes: Optional[int] = Field(None, ge=1, le=10)
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
    gemini_model_extraction: Optional[str] = None


@router.get("", response_model=ConfigResponse)
def get_config(db: Session = Depends(get_db)):
    """Obtener configuración actual."""
    cfg = db.query(Config).first()
    if not cfg:
        cfg = Config()
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return ConfigResponse.model_validate(cfg)


@router.put("", response_model=ConfigResponse)
def update_config(data: ConfigUpdate, db: Session = Depends(get_db)):
    """Actualizar configuración."""
    cfg = db.query(Config).first()
    if not cfg:
        cfg = Config()
        db.add(cfg)
        db.commit()
        db.refresh(cfg)

    if data.empresa_descripcion is not None:
        if not data.empresa_descripcion.strip():
            raise HTTPException(400, "La descripción de la empresa es obligatoria para el matching")
        cfg.empresa_descripcion = data.empresa_descripcion
    if data.scraping_auto is not None:
        cfg.scraping_auto = data.scraping_auto
    if data.dias_scraping_antiguo is not None:
        if data.dias_scraping_antiguo < 1:
            raise HTTPException(400, "El número mínimo de días es 1")
        cfg.dias_scraping_antiguo = data.dias_scraping_antiguo
    if data.scrapes_concurrentes is not None:
        cfg.scrapes_concurrentes = data.scrapes_concurrentes
    if data.gemini_api_key is not None:
        cfg.gemini_api_key = data.gemini_api_key
    if data.gemini_model is not None:
        cfg.gemini_model = data.gemini_model
    if data.gemini_model_extraction is not None:
        cfg.gemini_model_extraction = data.gemini_model_extraction

    db.commit()
    db.refresh(cfg)
    return ConfigResponse.model_validate(cfg)


@router.post("/reset")
def reset_config(db: Session = Depends(get_db)):
    """Restablecer valores por defecto (CU-04 V1)."""
    cfg = db.query(Config).first()
    if not cfg:
        cfg = Config()
        db.add(cfg)
    cfg.scraping_auto = False
    cfg.dias_scraping_antiguo = 7
    cfg.scrapes_concurrentes = 3
    cfg.gemini_model = "gemini-1.5-flash"
    cfg.gemini_model_extraction = "gemini-1.5-pro"
    db.commit()
    db.refresh(cfg)
    return {"status": "ok"}
