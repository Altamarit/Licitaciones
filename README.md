# App Licitaciones

Aplicación web para análisis y scraping de licitaciones públicas. Importa Excel, calcula idoneidad con IA, extrae datos de pliegos y gestiona decisiones de interés.

## Requisitos

- Docker y Docker Compose
- (Opcional) Gemini API Key para cálculo de idoneidad y extracción de pliegos (gratis en aistudio.google.com)

## Ejecución con Docker

```bash
# Copiar variables de entorno
cp .env.example .env
# Editar .env y añadir GEMINI_API_KEY si se desea usar IA

# Levantar servicios
docker compose up -d

# La app estará en http://localhost
# El backend API en http://localhost:8000
```

## Desarrollo local

### Backend
```bash
cd backend
pip install -r requirements.txt
export DATA_DIR=.
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

El frontend usa proxy a `http://localhost:8000` para las llamadas `/api`.

## Formato Excel

El Excel debe incluir columnas:
- TIPO
- ÁMBITO GEOGRÁFICO (Lugar)
- ORGANISMO
- TÍTULO
- N EXPEDIENTE
- FECHA LICITACIÓN/ANUNCIO
- FECHA LÍMITE OFERTAS
- HORA LÍMITE OFERTAS
- IMPORTE
- PCAT (URL del pliego)

## Casos de uso implementados

- CU-01: Procesar Excel y ver lista filtrada
- CU-02: Ver detalle y scrapear licitación
- CU-03: Marcar licitación como interesante y añadir notas
- CU-04: Configurar perfil empresa y parámetros
- CU-05: Ver "Mis licitaciones interesadas" y exportar
- CU-06: Scraping en lote desde la lista
- CU-07: Gestionar errores de scraping y reintentos
- CU-08: Gestionar sesiones y últimos ficheros procesados
- CU-09: Backup y restore de la base de datos
- CU-10: Actualizar licitaciones desde Excel ya procesado
