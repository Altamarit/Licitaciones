Estados de licitación que tenemos definidos hasta ahora, encadenados como flujo:

1. **Importación / evaluación inicial**
    - `pendiente revisión idoneidad`
        - Estado al crear la licitación al importar el Excel y aplicar la IA de idoneidad inicial.
2. **Revisión de idoneidad por el usuario**
    - Usuario revisa y cambia o confirma la idoneidad (muy alta/alta/baja/muy baja).
    - Al modificar/confirmar la categoría:
        - `idoneidad revisada`
3. **Interés del usuario**
Desde `idoneidad revisada` el usuario puede:
    - Activar “Me interesa” →
        - `interesa` (con fecha_decision registrada)
    - Desactivar “Me interesa” o marcar explícitamente que no interesa →
        - `revisada no interesa` (también con fecha_decision)
4. **Scraping / datos extraídos**
Independiente del interés, la licitación tiene un subestado de scraping (campo propio):
    - `scraping_pendiente` (nunca se ha hecho)
    - `scraping_en_progreso` (individual o en lote)
    - `scraping_ok` (datos extraídos, con fecha_scraping)
    - `scraping_parcial` (algún doc fallido)
    - `scraping_error` (fallo último intento, reintento posible)
    - `scraping_antiguo` (cuando fecha_scraping + N días > hoy, según parámetro de configuración)

En resumen, hay dos ejes de estado:

- Eje **decisión de negocio**: `pendiente revisión idoneidad` → `idoneidad revisada` → (`interesa` / `revisada no interesa`).
- Eje **scraping técnico**: `scraping_pendiente` → `scraping_en_progreso` → (`scraping_ok` / `scraping_parcial` / `scraping_error`), con transición a `scraping_antiguo` cuando expira el umbral de días configurado.

