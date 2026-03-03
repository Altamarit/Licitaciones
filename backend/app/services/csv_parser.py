"""Parser de CSV según mapeoexcel.md. Separador ';', columnas en fila 1."""
import csv
import re
from datetime import datetime, date
from io import StringIO
from typing import List, Dict, Any, Optional

# Mismo mapeo que Excel
COLUMN_MAPPING = {
    "tipo": ["TIPO", "Tipo", "tipo"],
    "lugar": ["ÁMBITO GEOGRÁFICO", "AMBITO GEOGRAFICO", "Lugar", "lugar"],
    "organismo": ["ORGANISMO", "Organismo", "organismo"],
    "titulo": ["TÍTULO", "TITULO", "Título", "titulo"],
    "expediente": ["N EXPEDIENTE", "N EXPEDIENTE", "Expediente", "expediente", "EXPEDIENTE"],
    "fecha_licitacion": ["FECHA LICITACIÓN", "FECHA LICITACION", "FECHA ANUNCIO", "Fecha Licitación"],
    "fecha_limite": ["FECHA LÍMITE OFERTAS", "FECHA LIMITE OFERTAS", "Fecha Límite"],
    "hora_limite": ["HORA LÍMITE OFERTAS", "HORA LIMITE OFERTAS", "Hora Límite"],
    "importe": ["IMPORTE", "Importe", "importe"],
    "url": ["PCAT", "URL", "url", "Pcat"],
}


def _find_column(header_row: list, keys: List[str]) -> Optional[int]:
    for i, cell in enumerate(header_row):
        val = str(cell).strip() if cell else ""
        for k in keys:
            if k.upper() in val.upper() or val.upper() in k.upper():
                return i
    return None


def _parse_float(val) -> float:
    if val is None or val == "":
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).replace(",", ".").replace(" ", "")
    s = re.sub(r"[^\d.]", "", s)
    try:
        return float(s) if s else 0.0
    except ValueError:
        return 0.0


def _parse_date(val) -> Optional[date]:
    if val is None or val == "":
        return None
    if isinstance(val, date):
        return val
    if isinstance(val, datetime):
        return val.date()
    s = str(val).strip()
    for fmt in ["%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y"]:
        try:
            return datetime.strptime(s[:10], fmt).date()
        except ValueError:
            continue
    return None


def _parse_datetime(val) -> Optional[datetime]:
    if val is None or val == "":
        return None
    if isinstance(val, datetime):
        return val
    if isinstance(val, date):
        return datetime.combine(val, datetime.min.time())
    s = str(val).strip()
    for fmt in ["%d/%m/%Y %H:%M", "%Y-%m-%d %H:%M", "%d-%m-%Y %H:%M", "%d/%m/%Y", "%Y-%m-%d"]:
        try:
            return datetime.strptime(s[:16], fmt)
        except ValueError:
            continue
    d = _parse_date(val)
    return datetime.combine(d, datetime.min.time()) if d else None


def parse_csv(content: str | bytes, delimiter: str = ";") -> List[Dict[str, Any]]:
    """
    Parsea CSV con separador ';'. Primera fila = cabeceras.
    """
    if isinstance(content, bytes):
        content = content.decode("utf-8-sig")
    reader = csv.reader(StringIO(content), delimiter=delimiter)
    rows = list(reader)
    if not rows:
        return []

    header = [str(c).strip() if c else "" for c in rows[0]]
    col_map = {}
    for field, keys in COLUMN_MAPPING.items():
        idx = _find_column(header, keys)
        if idx is not None:
            col_map[field] = idx

    if "titulo" not in col_map and "expediente" not in col_map:
        raise ValueError("El CSV no tiene el formato esperado. Debe incluir columnas TÍTULO o N EXPEDIENTE.")

    result = []
    for row in rows[1:]:
        if not row or not any(row):
            continue
        # Extender fila si tiene menos columnas que el header
        while len(row) < len(header):
            row.append("")
        titulo = row[col_map["titulo"]] if "titulo" in col_map else ""
        if not titulo and "expediente" in col_map:
            titulo = str(row[col_map["expediente"]] or "")
        if not titulo:
            continue

        importe_val = row[col_map["importe"]] if "importe" in col_map else 0
        fecha_limite_val = row[col_map["fecha_limite"]] if "fecha_limite" in col_map else None

        item = {
            "tipo": str(row[col_map["tipo"]] or "").strip() if "tipo" in col_map else "",
            "lugar": str(row[col_map["lugar"]] or "").strip() if "lugar" in col_map else "",
            "organismo": str(row[col_map["organismo"]] or "").strip() if "organismo" in col_map else "",
            "titulo": str(titulo).strip(),
            "abreviado": "",
            "expediente": str(row[col_map["expediente"]] or "").strip() if "expediente" in col_map else "",
            "fecha_licitacion": _parse_date(row[col_map["fecha_licitacion"]] if "fecha_licitacion" in col_map else None),
            "fecha_limite": _parse_datetime(fecha_limite_val),
            "hora_limite": str(row[col_map["hora_limite"]] or "").strip() if "hora_limite" in col_map else "",
            "importe": _parse_float(importe_val),
            "url": str(row[col_map["url"]] or "").strip() if "url" in col_map else "",
        }
        result.append(item)

    return result
