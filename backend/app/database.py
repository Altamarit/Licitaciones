"""Configuración de base de datos SQLite."""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATA_DIR = Path(os.getenv("DATA_DIR", "."))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_FILE = DATA_DIR / "licitaciones.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_FILE}")

# Exportar para backup
__all__ = ["DB_FILE"]

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency para obtener sesión de BD."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Crear todas las tablas y ejecutar migraciones."""
    from app import models  # noqa: F401 - registra modelos
    Base.metadata.create_all(bind=engine)

    # Migración: añadir columnas Gemini si la tabla config existe con esquema antiguo
    with engine.connect() as conn:
        from sqlalchemy import text
        try:
            r = conn.execute(text("PRAGMA table_info(config)"))
            cols = [row[1] for row in r.fetchall()]
            if cols and "gemini_api_key" not in cols:
                for col in ["gemini_api_key", "gemini_model", "gemini_model_extraction"]:
                    try:
                        conn.execute(text(f'ALTER TABLE config ADD COLUMN {col} TEXT DEFAULT ""'))
                        conn.commit()
                    except Exception:
                        conn.rollback()
        except Exception:
            pass
