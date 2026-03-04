"""Router de licitaciones - CRUD, filtros, KPIs."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.database import get_db
from app.models import Licitacion, Config
from pydantic import BaseModel
from app.schemas import (
    LicitacionResponse,
    LicitacionListResponse,
    LicitacionUpdate,
    KPIsResponse,
)

router = APIRouter()


@router.get("", response_model=LicitacionListResponse)
def list_licitaciones(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    idoneidad: Optional[str] = Query(None),
    estado_decision: Optional[str] = Query(None),
    estado_scraping: Optional[str] = Query(None),
    lugar: Optional[str] = Query(None),
    importe_min: Optional[float] = Query(None),
    interesa: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    fichero_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Lista licitaciones con filtros y paginación."""
    q = db.query(Licitacion)

    if fichero_id:
        q = q.filter(Licitacion.fichero_id == fichero_id)
    if idoneidad:
        q = q.filter(Licitacion.idoneidad_categoria == idoneidad)
    if estado_decision:
        q = q.filter(Licitacion.estado_decision == estado_decision)
    if estado_scraping:
        q = q.filter(Licitacion.estado_scraping == estado_scraping)
    if lugar:
        q = q.filter(Licitacion.lugar.ilike(f"%{lugar}%"))
    if importe_min is not None:
        q = q.filter(Licitacion.importe >= importe_min)
    if interesa is not None:
        q = q.filter(Licitacion.interesa == interesa)
    if search:
        q = q.filter(
            or_(
                Licitacion.titulo.ilike(f"%{search}%"),
                Licitacion.abreviado.ilike(f"%{search}%"),
                Licitacion.expediente.ilike(f"%{search}%"),
                Licitacion.organismo.ilike(f"%{search}%"),
            )
        )

    total = q.count()

    sort_col = getattr(Licitacion, sort_by, None) if sort_by else Licitacion.updated_at
    if sort_col is not None:
        q = q.order_by(sort_col.desc() if sort_order == "desc" else sort_col.asc())

    offset = (page - 1) * page_size
    items = q.offset(offset).limit(page_size).all()
    pages = (total + page_size - 1) // page_size if total > 0 else 1

    return LicitacionListResponse(
        items=[LicitacionResponse.model_validate(i) for i in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/kpis", response_model=KPIsResponse)
def get_kpis(
    idoneidad: Optional[str] = Query(None),
    estado_decision: Optional[str] = Query(None),
    estado_scraping: Optional[str] = Query(None),
    lugar: Optional[str] = Query(None),
    importe_min: Optional[float] = Query(None),
    interesa: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    fichero_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """KPIs: importe máximo, licitación mayor, conteos."""
    q = db.query(Licitacion)
    if fichero_id:
        q = q.filter(Licitacion.fichero_id == fichero_id)
    if idoneidad:
        q = q.filter(Licitacion.idoneidad_categoria == idoneidad)
    if estado_decision:
        q = q.filter(Licitacion.estado_decision == estado_decision)
    if estado_scraping:
        q = q.filter(Licitacion.estado_scraping == estado_scraping)
    if lugar:
        q = q.filter(Licitacion.lugar.ilike(f"%{lugar}%"))
    if importe_min is not None:
        q = q.filter(Licitacion.importe >= importe_min)
    if interesa is not None:
        q = q.filter(Licitacion.interesa == interesa)
    if search:
        q = q.filter(
            or_(
                Licitacion.titulo.ilike(f"%{search}%"),
                Licitacion.abreviado.ilike(f"%{search}%"),
                Licitacion.expediente.ilike(f"%{search}%"),
            )
        )

    total_filtradas = q.count()
    total_licitaciones = db.query(Licitacion).count()

    importe_max = q.with_entities(func.max(Licitacion.importe)).scalar() or 0
    licitacion_mayor = (
        q.order_by(Licitacion.importe.desc()).first()
        if total_filtradas > 0
        else None
    )

    return KPIsResponse(
        importe_maximo=importe_max,
        licitacion_mayor_importe={
            "titulo": licitacion_mayor.abreviado or licitacion_mayor.titulo[:80] if licitacion_mayor else "",
            "importe": licitacion_mayor.importe if licitacion_mayor else 0,
        }
        if licitacion_mayor
        else None,
        total_licitaciones=total_licitaciones,
        total_filtradas=total_filtradas,
    )


@router.get("/ficheros")
def list_ficheros(db: Session = Depends(get_db)):
    """Lista últimos ficheros Excel procesados (CU-08)."""
    from app.models import FicheroExcel
    ficheros = db.query(FicheroExcel).order_by(FicheroExcel.fecha_carga.desc()).limit(20).all()
    return [
        {
            "id": f.id,
            "nombre_fichero": f.nombre_fichero,
            "fecha_carga": f.fecha_carga.isoformat() if f.fecha_carga else None,
            "total_licitaciones": f.total_licitaciones,
        }
        for f in ficheros
    ]


def _lic_to_response(lic: Licitacion) -> LicitacionResponse:
    r = LicitacionResponse.model_validate(lic)
    return r.model_copy(update={"has_pliego": bool(lic.pliego_blob)})


@router.get("/{licitacion_id}", response_model=LicitacionResponse)
def get_licitacion(licitacion_id: int, db: Session = Depends(get_db)):
    """Obtener detalle de una licitación."""
    lic = db.query(Licitacion).filter(Licitacion.id == licitacion_id).first()
    if not lic:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Licitación no encontrada")
    return _lic_to_response(lic)


@router.patch("/{licitacion_id}", response_model=LicitacionResponse)
def update_licitacion(
    licitacion_id: int,
    data: LicitacionUpdate,
    db: Session = Depends(get_db),
):
    """Actualizar licitación (idoneidad, interesa, notas)."""
    lic = db.query(Licitacion).filter(Licitacion.id == licitacion_id).first()
    if not lic:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Licitación no encontrada")

    if data.idoneidad_categoria is not None:
        lic.idoneidad_categoria = data.idoneidad_categoria
        lic.estado_decision = "idoneidad revisada"
    if data.interesa is not None:
        lic.interesa = data.interesa
        lic.fecha_decision = datetime.utcnow()
        lic.estado_decision = "interesa" if data.interesa else "revisada no interesa"
    if data.notas is not None:
        lic.notas = data.notas
    if data.url is not None:
        lic.url = data.url

    db.commit()
    db.refresh(lic)
    return _lic_to_response(lic)


class BatchIdoneidadRequest(BaseModel):
    licitacion_ids: list[int]
    idoneidad_categoria: str


class CalculoIdoneidadResponse(BaseModel):
    expediente: str
    texto_licitacion: str
    descripcion_empresa: str
    resultado_score: float
    resultado_categoria: str
    licitacion: LicitacionResponse


@router.post("/batch-idoneidad")
def update_idoneidad_batch(
    body: BatchIdoneidadRequest,
    db: Session = Depends(get_db),
):
    """Actualizar idoneidad en lote (CU-01 V1)."""
    updated = db.query(Licitacion).filter(Licitacion.id.in_(body.licitacion_ids)).update(
        {
            Licitacion.idoneidad_categoria: body.idoneidad_categoria,
            Licitacion.estado_decision: "idoneidad revisada",
        },
        synchronize_session=False,
    )
    db.commit()
    return {"updated": updated}


@router.post("/{licitacion_id}/calcular-idoneidad", response_model=CalculoIdoneidadResponse)
def calcular_idoneidad_licitacion(
    licitacion_id: int,
    db: Session = Depends(get_db),
):
    """Calcular idoneidad para una licitación individual (CU-01)."""
    import os
    from app.services.ai_service import calcular_idoneidad, generar_abreviado

    lic = db.query(Licitacion).filter(Licitacion.id == licitacion_id).first()
    if not lic:
        raise HTTPException(status_code=404, detail="Licitación no encontrada")

    cfg = db.query(Config).first()
    api_key = cfg.gemini_api_key if cfg else os.getenv("GEMINI_API_KEY", "")
    model = cfg.gemini_model if cfg else "gemini-2.5-flash-lite"
    desc_empresa = cfg.empresa_descripcion if cfg else ""

    if not api_key or not desc_empresa:
        raise HTTPException(400, "Falta API key o descripción de empresa en configuración")

    texto_licitacion = lic.titulo or ""

    try:
        score, cat = calcular_idoneidad(desc_empresa, texto_licitacion, api_key, model)
        lic.idoneidad_score = score
        lic.idoneidad_categoria = cat
    except Exception as e:
        raise HTTPException(500, f"Error al calcular idoneidad: {str(e)}")

    try:
        lic.abreviado = generar_abreviado(texto_licitacion, api_key, model)
    except Exception:
        lic.abreviado = texto_licitacion[:150]

    db.commit()
    db.refresh(lic)

    return CalculoIdoneidadResponse(
        expediente=lic.expediente or "",
        texto_licitacion=texto_licitacion,
        descripcion_empresa=desc_empresa,
        resultado_score=score,
        resultado_categoria=cat,
        licitacion=_lic_to_response(lic),
    )
