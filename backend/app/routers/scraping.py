"""Router de scraping (CU-02, CU-06, CU-07)."""
import base64
import json
import os
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Licitacion, Config
from app.services.scraper_service import fetch_and_extract_text
from app.services.ai_service import extraer_datos_pliego, recalcular_idoneidad_post_scraping

router = APIRouter()

# Cola in-memory para scraping en lote (MVP)
_scraping_queue: List[int] = []
_scraping_in_progress = False


def _get_config(db: Session) -> Config:
    cfg = db.query(Config).first()
    if not cfg:
        cfg = Config()
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg


def _do_scrape(lic_id: int, db: Session):
    """Ejecuta scraping para una licitación."""
    lic = db.query(Licitacion).filter(Licitacion.id == lic_id).first()
    if not lic:
        return
    lic.estado_scraping = "scraping_en_progreso"
    lic.scraping_intentos = (lic.scraping_intentos or 0) + 1
    db.commit()

    url = (lic.url or "").strip()
    if not url or not url.startswith(("http://", "https://")):
        lic.estado_scraping = "scraping_error"
        lic.scraping_error = "URL inválida o vacía"
        db.commit()
        return

    texto, contenido, err = fetch_and_extract_text(url)
    cfg = _get_config(db)
    api_key = cfg.gemini_api_key or os.getenv("GEMINI_API_KEY", "")

    if err or not texto:
        lic.estado_scraping = "scraping_error"
        lic.scraping_error = err or "No se pudo extraer texto del documento"
        db.commit()
        return

    # Guardar pliego como base64 solo si es PDF válido (evita "Failed to load PDF" con HTML)
    if contenido and len(contenido) < 5_000_000 and contenido[:4] == b"%PDF":
        lic.pliego_blob = base64.b64encode(contenido).decode("utf-8")

    # Extraer datos con IA
    datos = {}
    if api_key:
        datos = extraer_datos_pliego(
            texto,
            lic.titulo or "",
            api_key,
            cfg.gemini_model_extraction or "gemini-1.5-pro",
        )
        score, cat = recalcular_idoneidad_post_scraping(
            cfg.empresa_descripcion or "",
            lic.titulo or "",
            datos,
            api_key,
            cfg.gemini_model or "gemini-1.5-flash",
        )
        lic.idoneidad_score = score
        lic.idoneidad_categoria = cat

    lic.datos_economicos_json = json.dumps(datos.get("datos_economicos", {}))
    lic.entregables_json = json.dumps(datos.get("entregables", []))
    lic.riesgos_json = json.dumps(datos.get("riesgos", []))
    lic.fecha_scraping = datetime.utcnow()
    lic.scraping_error = None
    lic.estado_scraping = "scraping_ok" if datos else "scraping_parcial"
    if datos.get("fecha_inicio_servicio"):
        try:
            from datetime import date
            lic.fecha_inicio_servicio = datetime.strptime(
                str(datos["fecha_inicio_servicio"])[:10], "%Y-%m-%d"
            ).date()
        except Exception:
            pass
    if datos.get("duracion_servicio"):
        lic.duracion_servicio = str(datos["duracion_servicio"])

    db.commit()


@router.post("/{licitacion_id}")
def scrape_licitacion(
    licitacion_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Scrapear una licitación (CU-02, CU-07)."""
    lic = db.query(Licitacion).filter(Licitacion.id == licitacion_id).first()
    if not lic:
        raise HTTPException(404, "Licitación no encontrada")
    url = (lic.url or "").strip()
    if not url or not url.startswith(("http://", "https://")):
        raise HTTPException(400, "URL inválida o vacía. Configure la URL para poder scrapear.")

    background_tasks.add_task(_do_scrape, licitacion_id, db)
    return {"status": "started", "licitacion_id": licitacion_id}


@router.post("/batch")
def scrape_batch(
    licitacion_ids: List[int],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Scrapear varias licitaciones en lote (CU-06)."""
    cfg = _get_config(db)
    max_concurrent = cfg.scrapes_concurrentes or 3

    # En MVP lanzamos secuencialmente en background
    for lid in licitacion_ids[:50]:  # Limitar a 50
        lic = db.query(Licitacion).filter(Licitacion.id == lid).first()
        if lic and (lic.url or "").strip().startswith(("http://", "https://")):
            background_tasks.add_task(_do_scrape, lid, db)

    return {"status": "started", "count": min(len(licitacion_ids), 50)}


class BatchScrapeRequest(BaseModel):
    licitacion_ids: List[int]


@router.post("/batch/start")
def start_batch_scrape(
    body: BatchScrapeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Iniciar scraping en lote."""
    return scrape_batch(body.licitacion_ids, background_tasks, db)


@router.get("/{licitacion_id}/pliego")
def get_pliego(licitacion_id: int, db: Session = Depends(get_db)):
    """Descargar el pliego (PDF) de una licitación."""
    from fastapi.responses import Response
    lic = db.query(Licitacion).filter(Licitacion.id == licitacion_id).first()
    if not lic:
        raise HTTPException(404, "Licitación no encontrada")
    if not lic.pliego_blob:
        raise HTTPException(404, "No hay pliego descargado")
    try:
        pdf_bytes = base64.b64decode(lic.pliego_blob)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "inline; filename=pliego.pdf",
                "Content-Length": str(len(pdf_bytes)),
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "public, max-age=3600",
            },
        )
    except Exception:
        raise HTTPException(500, "Error al recuperar el pliego")
