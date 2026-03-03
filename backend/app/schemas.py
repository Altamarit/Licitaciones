"""Esquemas Pydantic para validación y serialización."""
from datetime import datetime, date
from typing import Optional, List, Any
from pydantic import BaseModel, Field


# Config
class ConfigBase(BaseModel):
    empresa_descripcion: str = ""
    scraping_auto: bool = False
    dias_scraping_antiguo: int = Field(ge=1, le=365, default=7)
    scrapes_concurrentes: int = Field(ge=1, le=10, default=3)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    gemini_model_extraction: str = "gemini-1.5-pro"


class ConfigResponse(ConfigBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# FicheroExcel
class FicheroExcelBase(BaseModel):
    nombre_fichero: str
    total_licitaciones: int = 0


class FicheroExcelResponse(FicheroExcelBase):
    id: int
    fecha_carga: Optional[datetime] = None

    class Config:
        from_attributes = True


# Licitacion
class LicitacionBase(BaseModel):
    tipo: Optional[str] = None
    lugar: Optional[str] = None
    organismo: Optional[str] = None
    titulo: Optional[str] = None
    abreviado: Optional[str] = None
    expediente: Optional[str] = None
    fecha_licitacion: Optional[date] = None
    fecha_limite: Optional[datetime] = None
    hora_limite: Optional[str] = None
    importe: float = 0.0
    url: Optional[str] = None
    estado_decision: Optional[str] = None
    estado_scraping: Optional[str] = None
    idoneidad_categoria: Optional[str] = None
    idoneidad_score: Optional[float] = None
    interesa: Optional[bool] = None
    notas: Optional[str] = None


class LicitacionCreate(LicitacionBase):
    fichero_id: Optional[int] = None


class LicitacionUpdate(BaseModel):
    idoneidad_categoria: Optional[str] = None
    interesa: Optional[bool] = None
    notas: Optional[str] = None
    url: Optional[str] = None
    estado_decision: Optional[str] = None


class LicitacionResponse(LicitacionBase):
    id: int
    fichero_id: Optional[int] = None
    fecha_decision: Optional[datetime] = None
    datos_economicos_json: Optional[str] = "{}"
    entregables_json: Optional[str] = "[]"
    riesgos_json: Optional[str] = "[]"
    has_pliego: bool = False
    fecha_scraping: Optional[datetime] = None
    scraping_error: Optional[str] = None
    fecha_inicio_servicio: Optional[date] = None
    duracion_servicio: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LicitacionListResponse(BaseModel):
    items: List[LicitacionResponse]
    total: int
    page: int
    page_size: int
    pages: int


# KPIs
class KPIsResponse(BaseModel):
    importe_maximo: float
    licitacion_mayor_importe: Optional[dict] = None
    total_licitaciones: int
    total_filtradas: int


# Filtros
class LicitacionFilters(BaseModel):
    idoneidad: Optional[str] = None
    estado_decision: Optional[str] = None
    estado_scraping: Optional[str] = None
    lugar: Optional[str] = None
    importe_min: Optional[float] = None
    interesa: Optional[bool] = None
    search: Optional[str] = None
    page: int = 1
    page_size: int = 12
    sort_by: Optional[str] = None
    sort_order: str = "desc"
