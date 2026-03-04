"""Servicio de IA con Google Gemini para idoneidad, resúmenes y extracción."""
import json
from typing import Optional, Dict, Any

from google import genai


def _get_client(api_key: Optional[str] = None) -> Optional[genai.Client]:
    """Crea un cliente de Gemini. Retorna None si no hay key válida."""
    if not api_key or not api_key.strip():
        return None
    return genai.Client(api_key=api_key.strip())


def calcular_idoneidad(
    descripcion_empresa: str,
    descripcion_licitacion: str,
    api_key: str,
    model: str = "gemini-2.5-flash-lite",
) -> tuple[float, str]:
    """
    Calcula idoneidad 0-100 y categoría (muy alta, alta, baja, muy baja).
    """
    client = _get_client(api_key)
    if not client or not descripcion_empresa:
        return 0.0, ""

    prompt = f"""Eres un experto en matching entre empresas y licitaciones públicas.

DESCRIPCIÓN DE LA EMPRESA (perfil, servicios, sectores):
{descripcion_empresa}

TÍTULO DE LA LICITACIÓN (del fichero importado):
{descripcion_licitacion}

TAREA: Valida si esta licitación representa una oportunidad para la empresa según su descripción.
- Si el título indica servicios, sectores o tipos de contrato que encajan con el perfil de la empresa → muy alta o alta.
- Si hay coincidencia parcial o el sector es afín → alta o baja según el grado.
- Solo usa "baja" o "muy baja" cuando claramente no encaja (sector distinto, servicios ajenos a la empresa).

Sé equilibrado: no defaults todo a baja. Las licitaciones de administración pública suelen ser oportunidades reales cuando hay afinidad.

Responde SOLO con un JSON válido en una línea, sin markdown:
{{"score": <número 0-100>, "categoria": "<muy alta|alta|baja|muy baja>"}}"""

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config={"temperature": 0.3},
        )
        text = (response.text or "").strip()
        print(f"[AI] Respuesta raw del modelo: {text[:500]}")
        
        if text.startswith("```"):
            text = text.split("```")[1].strip()
        if text.lower().startswith("json"):
            text = text[4:].strip()
        
        print(f"[AI] Texto limpio para parsear: {text}")
        data = json.loads(text)
        score = float(data.get("score", 50))
        cat = data.get("categoria", "baja").lower()
        
        print(f"[AI] Score: {score}, Categoría: {cat}")
        
        if cat not in ("muy alta", "alta", "baja", "muy baja"):
            print(f"[AI] Categoría '{cat}' no reconocida, usando 'baja'")
            cat = "baja"
        return score, cat
    except Exception as e:
        print(f"[AI] ERROR: {type(e).__name__}: {e}")
        return 50.0, "baja"


def generar_abreviado(titulo: str, api_key: str, model: str = "gemini-2.5-flash-lite") -> str:
    """Genera resumen semántico del título (máx 150 caracteres)."""
    client = _get_client(api_key)
    if not client or not titulo:
        return titulo[:150] if titulo else ""

    prompt = f"""Resume este título de licitación en máximo 150 caracteres, manteniendo la esencia:
"{titulo}"

Solo el resumen, sin comillas ni explicaciones."""

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config={"temperature": 0.2},
        )
        return (response.text or "").strip()[:150]
    except Exception:
        return titulo[:150]


def extraer_datos_pliego(
    texto_pliego: str,
    titulo_licitacion: str,
    api_key: str,
    model: str = "gemini-2.5-flash",
) -> Dict[str, Any]:
    """
    Extrae obligaciones, entregables, importes, lotes, garantías y riesgos.
    """
    client = _get_client(api_key)
    if not client or not texto_pliego:
        return {
            "datos_economicos": {},
            "entregables": [],
            "riesgos": [],
            "obligaciones": [],
            "lotes": [],
            "garantias": [],
        }

    prompt = f"""Analiza este pliego de licitación y extrae la información en JSON.

Título: {titulo_licitacion}

Contenido del pliego:
---
{texto_pliego[:15000]}
---

Devuelve SOLO un JSON válido con esta estructura (sin markdown):
{{
  "datos_economicos": {{"importe_total": número en euros, "lotes": [], "garantias": []}},
  "entregables": ["lista de entregables exigidos"],
  "riesgos": ["riesgos detectados: plazos, complejidad, etc."],
  "obligaciones": ["obligaciones principales"],
  "fecha_inicio_servicio": "YYYY-MM-DD o null",
  "duracion_servicio": "texto o null"
}}"""

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config={"temperature": 0.2},
        )
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.split("```")[1].strip()
        if text.lower().startswith("json"):
            text = text[4:].strip()
        return json.loads(text)
    except Exception:
        return {
            "datos_economicos": {},
            "entregables": [],
            "riesgos": [],
            "obligaciones": [],
            "lotes": [],
            "garantias": [],
        }


def recalcular_idoneidad_post_scraping(
    descripcion_empresa: str,
    titulo: str,
    datos_extraidos: Dict[str, Any],
    api_key: str,
    model: str = "gemini-2.5-flash-lite",
) -> tuple[float, str]:
    """Recalcula idoneidad con más contexto tras el scraping."""
    contexto = f"Título: {titulo}\nEntregables: {datos_extraidos.get('entregables', [])}\nRiesgos: {datos_extraidos.get('riesgos', [])}"
    return calcular_idoneidad(descripcion_empresa, contexto, api_key, model)
