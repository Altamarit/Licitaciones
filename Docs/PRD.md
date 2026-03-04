# PRD – Aplicación de análisis de licitaciones

## 1. Visión y contexto

La aplicación ayuda a una empresa de servicios/IT a procesar ficheros Excel con licitaciones públicas, extraer información avanzada desde las URLs asociadas (pliegos, PDFs) y priorizar oportunidades según la idoneidad con el perfil de la empresa.

## 2. Objetivos del producto

- Reducir el tiempo dedicado a leer manualmente pliegos y anuncios de licitación.
- Priorizar rápidamente qué licitaciones revisar a fondo según la idoneidad y el riesgo.
- Centralizar en una única herramienta las decisiones (interesa / no interesa), notas y estado de análisis.
- Mantener todos los datos en local (entorno Docker + SQLite), sin dependencia cloud.

Éxito mínimo del MVP:
- Capaz de importar un Excel de 50–500 licitaciones, calcular idoneidad, mostrar lista filtrable y hacer scraping de detalle de al menos una licitación de forma fiable.

## 3. Alcance funcional (MVP)

Incluye:

- Importación de Excel con formato fijo (una licitación por fila).
- Cálculo de idoneidad con IA a partir de la descripción de la licitación y la descripción de la empresa.
- Lista principal de licitaciones con filtros y KPIs superiores.
- Pantalla de detalle con scraping de URL, extracción de datos económicos, fechas clave, entregables y riesgos.
- Marcado de interés y notas.
- Configuración básica (perfil de empresa, parámetros de scraping).
- Funciones de mantenimiento: actualizar desde nuevo Excel, backup/restore de la DB.

Queda fuera (explorable futuro):
- Multiusuario, autenticación, roles.
- Integraciones automáticas con APIs de portales públicos.
- Multi-idioma y soporte avanzado RGPD.

## 4. Usuarios y casos de uso

### Usuario objetivo

- Rol: propietario/gestor de negocio en empresa IT/servicios.
- Perfil técnico: cómodo usando apps web en local y entorno Docker.
- Necesidad: revisar diariamente/semanalmente licitaciones de BOE/DOUE y portales equivalentes, decidir rápido dónde invertir esfuerzo comercial.

### Lista de Casos de Uso (resumen)

1. **CU-01 – Procesar Excel y ver lista filtrada**  
   Importar un Excel, crear las licitaciones, calcular idoneidad inicial con IA, guardar en DB y mostrar una lista filtrable con estados de revisión.

2. **CU-02 – Ver detalle y scrapear licitación**  
   Abrir una licitación concreta, lanzar scraping (auto o manual), extraer importes, fechas clave, entregables y riesgos, y mostrar toda la información consolidada.

3. **CU-03 – Marcar licitación como interesante y añadir notas**  
   Marcar que una licitación interesa/no interesa, registrar fecha de decisión y añadir notas personales.

4. **CU-04 – Configurar perfil empresa y parámetros**  
   Configurar la descripción de la empresa, el comportamiento de scraping, umbrales de idoneidad y otros parámetros de rendimiento.

5. **CU-05 – Ver “Mis licitaciones interesadas”**  
   Filtrar rápidamente las licitaciones marcadas como interesantes y poder exportarlas.

6. **CU-06 – Scraping en lote desde la lista**  
   Seleccionar varias licitaciones y lanzar scraping masivo respetando límites de concurrencia y estados de scraping.

7. **CU-07 – Gestionar errores de scraping y reintentos**  
   Ver por qué falló un scraping para una licitación concreta y volver a intentarlo o marcarlo como error permanente.

8. **CU-08 – Gestionar sesiones y últimos ficheros procesados**  
   Abrir la app y acceder de inmediato a las licitaciones ya procesadas, sin necesidad de reimportar siempre.

9. **CU-09 – Backup y restore de la base de datos local**  
   Descargar una copia de seguridad y restaurarla en caso de fallo o migración.

10. **CU-10 – Actualizar licitaciones desde un Excel ya procesado**  
    Importar un nuevo Excel de la misma fuente actualizando licitaciones existentes y añadiendo nuevas sin perder decisiones/notes.

*(Los detalles completos de cada CU están en el documento de Casos de Uso; aquí se resumen para el PRD.)*

## 5. Pantallas / UX (resumen)

1. **Pantalla principal: Lista de licitaciones (Home)**  
   - Banda de KPIs arriba (importe máximo, licitación de mayor importe, cantidad de licitaciones filtradas).  
   - Botones “Cargar nuevo Excel”, “Scrapear seleccionadas”, “Exportar seleccionadas” y acceso a “Configuración”.  
   - Panel de filtros (idoneidad, estado decisión, estado scraping, lugar).  
   - Tabla con: selección, descripción breve, importe (en K€ sin decimales), lugar, idoneidad, estado decisión, estado scraping, fecha/hora máxima de entrega de ofertas, días hasta cierre y acción “Ver detalle”.  
   - Estilo visual tipo dashboard limpio con tarjetas KPI y tabla central.

2. **Pantalla de detalle de licitación**  
   - Botón “Volver a la lista”.  
   - Columna izquierda: descripción completa, importe (en K€ con 3 decimales), lugar, ID expediente, fecha/hora máxima entrega ofertas, fecha inicio servicio, duración servicio, idoneidad (editable), estado decisión y toggle “Me interesa”.  
   - Columna derecha: URL, estado scraping, botones “Scrapear ahora”/“Reintentar”, datos económicos extraídos (K€ con 3 decimales), riesgos detectados, caja con scroll vertical con la enumeración de entregables.  
   - Zona inferior de notas personales.

3. **Pantalla secundaria: Selección / importación de fichero Excel**  
   - Se abre desde “Cargar nuevo Excel”.  
   - Selector de archivo, descripción de formato, botón “Importar” y botón “Cancelar”.

4. **Pantalla secundaria: Actualización desde Excel existente**  
   - Similar a importación, pero orientada a actualizar licitaciones ya existentes por ID de expediente.

5. **Pantalla de Configuración**  
   - Secciones de: Perfil e IA (descripción empresa, umbral idoneidad), Scraping (auto sí/no, días hasta scraping antiguo, scrapes concurrentes) y Datos/Mantenimiento (backup/restore, limpieza de datos antiguos).

6. **Pantalla de Backup & Restore**  
   - Puede ser tab dentro de Configuración: permite descargar backup y subir un backup para restaurar.

## 6. Reglas de negocio clave

- **Formato económico:**
  - Lista y KPIs: importes en miles de euros sin decimales (`1235 K€`).  
  - Pantalla de detalle: importes en miles de euros con 3 decimales (`1234,567 K€`).

- **Estados de decisión:**
  - `pendiente revisión idoneidad` (por defecto tras importación).  
  - `idoneidad revisada` (cuando el usuario revisa/ajusta la categoría).  
  - `interesa` (toggle activado, con fecha_decision).  
  - `revisada no interesa` (toggle desactivado explícitamente, con fecha_decision).

- **Estados de scraping (independientes de decisión):**
  - `scraping_pendiente`.  
  - `scraping_en_progreso`.  
  - `scraping_ok`.  
  - `scraping_parcial`.  
  - `scraping_error`.  
  - `scraping_antiguo` (cuando fecha_scraping + N días < hoy, N definido en configuración).

- **Idoneidad IA:**
  - Se calcula a partir de similitud semántica (perfil empresa vs descripción licitación).  
  - Se mapea a categorías: muy alta, alta, baja, muy baja.  
  - El usuario puede sobrescribir la categoría en cualquier momento.

- **Reglas de scraping:**
  - O bien se lanza automáticamente al abrir el detalle (si param “auto” = sí), o sólo bajo acción manual.  
  - Scraping en lote respeta número máximo de scrapes concurrentes.  
  - Si los datos tienen más días que el parámetro de antigüedad, se considera “scraping_antiguo” y se sugiere re-scrapear.

## 7. Requisitos no funcionales

### Rendimiento

- Importación de 100 licitaciones:  
  - Parseo Excel + cálculo de idoneidad IA en < 2 minutos en máquina de desarrollo estándar.  
- Renderizado de lista (con filtros aplicados):  
  - < 1 segundo para hasta 500 registros en memoria.  
- Scraping de una licitación individual:  
  - Primera respuesta visible (estado en progreso) inmediata; resultado final en < 1 minuto en condiciones normales de red.

### Plataforma y arquitectura

- **Frontend:**  
  - Web SPA (React/Next.js) con diseño orientado a desktop.

- **Backend:**  
  - Python (FastAPI o similar).  
  - Módulo de scraping con Playwright / requests + parsers de PDF/HTML.  
  - Cola de tareas ligera (puede ser in-process para MVP).

- **Base de datos:**  
  - SQLite en volumen Docker persistente, adecuada para un solo usuario local.

- **Despliegue:**  
  - Stack docker-compose para frontend, backend y volumen de datos, ejecutado en local.

### Seguridad y privacidad

- Datos locales; el único envío externo es a la API de Google Gemini para idoneidad y extracción (tier gratuito disponible).  
- Configuración y backups bajo control del usuario.  
- Scraping únicamente de fuentes públicas de licitaciones; respetar robots.txt y limitaciones razonables.

## 8. Dependencias y riesgos

### Dependencias

- Librerías de parsing de Excel, PDF y HTML.  
- **Google Gemini API** para cálculo de idoneidad, resúmenes y extracción de datos de pliegos (tier gratuito disponible en [Google AI Studio](https://aistudio.google.com)).  
- Navegador headless o similar para scraping (Playwright / Puppeteer).

### Riesgos

- Cambios de estructura en las webs de licitaciones o en los PDFs pueden romper reglas de extracción.  
- Posibles bloqueos anti-scraping (CAPTCHAs, rate limits).  
- Rendimiento limitado de SQLite si el producto evoluciona a multiusuario (no contemplado en este MVP).  
- Necesidad de mantener modelos IA actualizados para que la idoneidad siga siendo relevante.

## 9. Métricas de éxito (orientativas)

- % de licitaciones donde la categoría de idoneidad IA coincide con la valoración manual (objetivo ≥ 70–80 %).  
- Reducción del tiempo medio diario dedicado a revisión de licitaciones (a definir una vez en uso).  
- Número de licitaciones “interesa” gestionadas en un periodo vs proceso manual previo.

## 10. Proveedor de IA

La aplicación utiliza **Google Gemini** como proveedor de IA para:
- Cálculo de idoneidad (similitud semántica entre perfil de empresa y descripción de licitación).
- Generación de resúmenes semánticos de títulos.
- Extracción de datos de pliegos (obligaciones, entregables, importes, riesgos).

### Modelos utilizados

| Función | Modelo | Justificación |
|---------|--------|---------------|
| Idoneidad y resúmenes | `gemini-2.5-flash-lite` | Rápido, económico, 1000 req/día en tier gratuito |
| Extracción de pliegos | `gemini-2.5-flash` | Mayor capacidad de análisis para documentos largos |

### Configuración

- **API key:** Se obtiene gratuitamente en [Google AI Studio](https://aistudio.google.com).
- **Librería:** `google-genai` (la librería `google-generativeai` está deprecada desde 2025).
- **Tier gratuito:** ~15 req/min para flash-lite, ~10 req/min para flash, cuota diaria según modelo.

---

