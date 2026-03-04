"""Modelos ORM para SQLite."""
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Config(Base):
    """Configuración de la aplicación."""
    __tablename__ = "config"

    id = Column(Integer, primary_key=True, index=True)
    empresa_descripcion = Column(Text, default="")
    scraping_auto = Column(Boolean, default=False)
    dias_scraping_antiguo = Column(Integer, default=7)
    scrapes_concurrentes = Column(Integer, default=3)
    gemini_api_key = Column(String(255), default="")
    gemini_model = Column(String(100), default="gemini-2.5-flash-lite")
    gemini_model_extraction = Column(String(100), default="gemini-2.5-flash")
    calcular_idoneidad_import = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FicheroExcel(Base):
    """Registro de ficheros Excel importados."""
    __tablename__ = "fichero_excel"

    id = Column(Integer, primary_key=True, index=True)
    nombre_fichero = Column(String(500), nullable=False)
    fecha_carga = Column(DateTime, default=datetime.utcnow)
    total_licitaciones = Column(Integer, default=0)
    licitaciones = relationship("Licitacion", back_populates="fichero")


class Licitacion(Base):
    """Licitación pública."""
    __tablename__ = "licitacion"

    id = Column(Integer, primary_key=True, index=True)
    fichero_id = Column(Integer, ForeignKey("fichero_excel.id"), nullable=True)
    tipo = Column(String(100), default="")
    lugar = Column(String(255), default="")
    organismo = Column(String(500), default="")
    titulo = Column(Text, default="")
    abreviado = Column(String(500), default="")
    expediente = Column(String(255), index=True, default="")
    fecha_licitacion = Column(Date, nullable=True)
    fecha_limite = Column(DateTime, nullable=True)
    hora_limite = Column(String(20), default="")
    importe = Column(Float, default=0.0)
    url = Column(Text, default="")
    pliego = Column(Text, nullable=True)  # Path o referencia al PDF almacenado
    pliego_blob = Column(Text, nullable=True)  # Base64 del PDF para almacenar en SQLite

    # Estados
    estado_decision = Column(String(50), default="pendiente revisión idoneidad")
    estado_scraping = Column(String(50), default="scraping_pendiente")

    # Idoneidad IA
    idoneidad_categoria = Column(String(50), default="")  # muy alta, alta, baja, muy baja
    idoneidad_score = Column(Float, nullable=True)

    # Decisión usuario
    interesa = Column(Boolean, default=False)
    fecha_decision = Column(DateTime, nullable=True)
    notas = Column(Text, default="")

    # Datos extraídos por scraping
    datos_economicos_json = Column(Text, default="{}")
    entregables_json = Column(Text, default="[]")
    riesgos_json = Column(Text, default="[]")
    fecha_scraping = Column(DateTime, nullable=True)
    scraping_error = Column(Text, nullable=True)
    scraping_intentos = Column(Integer, default=0)

    # Campos adicionales del pliego
    fecha_inicio_servicio = Column(Date, nullable=True)
    duracion_servicio = Column(String(100), default="")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fichero = relationship("FicheroExcel", back_populates="licitaciones")
