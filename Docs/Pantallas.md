# Lista de pantallas de la aplicación

## Pantallas principales

1. **Lista de licitaciones (Home)**
   - Banda superior de KPIs:
     - Importe máximo (K€, sin decimales).
     - Licitación de mayor importe (nombre + importe).
     - Cantidad de licitaciones (filtradas / totales).
   - Panel de filtros:
     - Idoneidad (muy alta / alta / baja / muy baja).
     - Estado decisión (pendiente revisión / idoneidad revisada / interesa / revisada no interesa).
     - Estado scraping (pendiente / en progreso / ok / parcial / error / antiguo).
     - Lugar.
   - Tabla:
     - [ ] Selección.
     - Descripción breve.
     - Importe (K€, sin decimales).
     - Lugar.
     - Idoneidad.
     - Estado decisión.
     - Estado scraping.
     - Fecha y hora máxima para entrega de ofertas.
     - Días hasta cierre (fecha máxima – hoy).
     - Acción “Ver detalle”.
   - Acciones:
     - Botón “Cargar nuevo Excel”.
     - Botón “Scrapear seleccionadas”.
     - Botón “Exportar seleccionadas”.
     - Link “Configuración”.

2. **Detalle de licitación**
   - Zona superior:
     - Botón “← Volver a la lista”.
   - Columna izquierda (datos de negocio y decisión):
     - Descripción completa.
     - Importe (K€, con 3 decimales).
     - Lugar.
     - Identificador de expediente.
     - Fecha y hora máxima para entrega de ofertas.
     - Fecha de inicio del servicio.
     - Duración del servicio.
     - Idoneidad (dropdown).
     - Estado decisión + toggle “Me interesa”.
   - Columna derecha (scraping y análisis):
     - URL (link).
     - Estado scraping + última fecha.
     - Botones “Scrapear ahora” / “Reintentar” según caso.
     - Datos económicos extraídos (K€, 3 decimales).
     - Riesgos detectados (lista).
     - Caja de texto con scroll vertical:
       - Enumeración de entregables exigidos.
   - Zona inferior:
     - Textarea “Notas personales”.

---

## Pantallas secundarias

3. **Selección / Importación de fichero Excel**
   - Título “Importar licitaciones desde Excel”.
   - Selector de archivo.
   - Descripción del formato requerido.
   - Botón “Importar”.
   - Botón “Cancelar” (vuelve a la lista).

4. **Actualización desde Excel existente**
   - Similar a importación:
     - Selector de archivo para actualización.
     - Explicación de que se actualizarán licitaciones existentes y se añadirán nuevas.
     - Botón “Actualizar”.
     - Botón “Cancelar”.

5. **Configuración**
   - Secciones:
     - **Perfil e IA**
       - Descripción de la empresa.
       - Umbral mínimo de idoneidad IA.
     - **Scraping**
       - Toggle “Scraping automático al abrir detalle”.
       - Días hasta considerar scraping antiguo.
       - Scrapes concurrentes máximos.
     - **Datos / Mantenimiento**
       - Información de la base de datos local.
       - Botón “Descargar copia de seguridad”.
       - Bloque “Restaurar copia de seguridad” (subida de archivo).
       - Opciones de limpieza de datos antiguos.

6. **Mantenimiento / Backup & Restore**  
   (Puede ser tab dentro de Configuración o pantalla separada, según implementación)
   - Backup:
     - Botón “Descargar copia de seguridad”.
   - Restore:
     - Selector de archivo de backup.
     - Botón “Restaurar” + confirmación fuerte.

```

