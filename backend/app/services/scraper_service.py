"""Servicio de scraping: descarga de URLs y extracción de texto de PDFs."""
import io
import re
import requests
from typing import Optional, Tuple
from urllib.parse import urlparse

import pdfplumber
from bs4 import BeautifulSoup


USER_AGENT = "Mozilla/5.0 (compatible; LicitacionesBot/1.0; +https://github.com/licitaciones-app)"


def _is_pdf_url(url: str) -> bool:
    return url.lower().endswith(".pdf") or ".pdf?" in url.lower()


def _get_content_type(resp: requests.Response) -> str:
    return (resp.headers.get("Content-Type") or "").lower()


def download_document(url: str, timeout: int = 60) -> Tuple[Optional[bytes], Optional[str], Optional[str]]:
    """
    Descarga documento desde URL.
    Returns: (content_bytes, content_type, error_message)
    """
    if not url or not url.strip().startswith(("http://", "https://")):
        return None, None, "URL inválida"

    try:
        resp = requests.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=timeout,
            allow_redirects=True,
        )
        resp.raise_for_status()
        ct = _get_content_type(resp)
        return resp.content, ct, None
    except requests.exceptions.Timeout:
        return None, None, "Timeout al acceder a la URL"
    except requests.exceptions.ConnectionError:
        return None, None, "Error de conexión"
    except requests.exceptions.HTTPError as e:
        return None, None, f"Error HTTP {e.response.status_code}"
    except Exception as e:
        return None, None, str(e)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extrae texto de un PDF."""
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            text_parts = []
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
            return "\n\n".join(text_parts) or ""
    except Exception:
        return ""


def extract_text_from_html(html_bytes: bytes, url: str = "") -> str:
    """Extrae texto de HTML."""
    try:
        soup = BeautifulSoup(html_bytes, "html.parser")
        for tag in soup(["script", "style"]):
            tag.decompose()
        text = soup.get_text(separator="\n")
        return re.sub(r"\n{3,}", "\n\n", text).strip()
    except Exception:
        return ""


def fetch_and_extract_text(url: str, max_retries: int = 3) -> Tuple[Optional[str], Optional[bytes], Optional[str]]:
    """
    Descarga documento y extrae texto.
    Returns: (texto_extraido, contenido_binario, error)
    """
    last_error = None
    for attempt in range(max_retries):
        content, content_type, err = download_document(url, timeout=30 + attempt * 10)
        if err:
            last_error = err
            continue
        if not content:
            last_error = "No se obtuvo contenido"
            continue

        if "pdf" in content_type or _is_pdf_url(url):
            text = extract_text_from_pdf(content)
            return (text if text else None, content, last_error if not text else None)
        else:
            text = extract_text_from_html(content, url)
            return (text if text else None, content, last_error if not text else None)

    return None, None, last_error or "Error desconocido"
