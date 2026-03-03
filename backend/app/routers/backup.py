"""Router de backup y restore (CU-09)."""
import os
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import DB_FILE, get_db
from app.models import Licitacion, FicheroExcel

router = APIRouter()
DB_PATH = str(DB_FILE)
BACKUP_DIR = Path(DB_FILE).parent / "backups"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/download")
def download_backup():
    """Descargar copia de seguridad de la base de datos."""
    if not os.path.exists(DB_PATH):
        raise HTTPException(500, "Base de datos no encontrada")
    return FileResponse(
        DB_PATH,
        media_type="application/x-sqlite3",
        filename="licitaciones_backup.db",
    )


@router.post("/restore")
def restore_backup(file: UploadFile):
    """Restaurar copia de seguridad."""
    if not file.filename or not file.filename.endswith(".db"):
        raise HTTPException(400, "Debe subir un archivo .db válido")

    content = file.file.read()
    if len(content) < 100:
        raise HTTPException(400, "La copia de seguridad no es válida")

    # Backup de la actual antes de reemplazar
    if os.path.exists(DB_PATH):
        backup_path = BACKUP_DIR / f"pre_restore_{os.path.basename(DB_PATH)}"
        shutil.copy(DB_PATH, backup_path)

    try:
        with open(DB_PATH, "wb") as f:
            f.write(content)
    except Exception as e:
        if os.path.exists(BACKUP_DIR / f"pre_restore_{os.path.basename(DB_PATH)}"):
            shutil.copy(
                BACKUP_DIR / f"pre_restore_{os.path.basename(DB_PATH)}",
                DB_PATH,
            )
        raise HTTPException(500, f"Error al restaurar: {e}")

    return {"status": "ok", "message": "Base de datos restaurada correctamente"}


@router.post("/clear-data")
def clear_imported_data(db: Session = Depends(get_db)):
    """Borrar todos los registros importados (licitaciones y ficheros). Mantiene la configuración."""
    db.query(Licitacion).delete()
    db.query(FicheroExcel).delete()
    db.commit()
    return {"status": "ok", "message": "Datos borrados correctamente"}
