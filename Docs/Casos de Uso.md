# Casos de Uso – App Licitaciones

**Proyecto:** Aplicación de análisis y scraping de licitaciones públicas  
**Usuario:** Único (empresa IT/software)  
**Fecha:** 02/03/2026  

---

## CU-01: Procesar Excel y Ver Lista Filtrada

**Actor:**  
- Usuario (empresa IT).

**Objetivo:**  
- Cargar un Excel de licitaciones, evaluar idoneidad inicial con IA, permitir revisión manual (alta/muy alta/baja/muy baja) y mostrar una lista filtrable/ordenable con estados de revisión.

**Precondiciones:**  
- Aplicación ejecutándose en local (Docker).  
- Perfil de empresa configurado (texto descriptivo).  
- Excel con formato fijo (importe, descripción, lugar geográfico, URL).

**Flujo principal:**  
1. El usuario accede al dashboard y pulsa el botón **“Cargar Excel”**.  
2. Sube el archivo Excel; el sistema lo parsea y crea una licitación por fila.  
3. Para cada licitación, el sistema calcula similitud semántica con el perfil de empresa (IA → puntaje 0–100) y la mapea a una categoría de idoneidad: **muy alta / alta / baja / muy baja**.  
4. Se guarda cada licitación en SQLite con: datos básicos, categoría de idoneidad inicial y estado **“pendiente revisión idoneidad”**.  
5. Se muestra una lista con columnas: descripción breve, importe, lugar, categoría de idoneidad, estado.  
6. El usuario puede filtrar por categoría, importe mínimo, lugar y estado, y ordenar por categoría, puntaje o importe.  
7. Al seleccionar una fila, el usuario puede cambiar la categoría de idoneidad; al cambiarla, el estado pasa automáticamente a **“idoneidad revisada”**.

**Variantes/Errores:**  
- V1: El usuario selecciona varias licitaciones y cambia la categoría de idoneidad en lote (actualización masiva).  
- E1: El Excel no cumple el formato esperado → se muestra mensaje de error indicando que verifique columnas.  
- E2: El cálculo de IA es lento para muchos registros → se muestra barra de progreso “Evaluando... X/Y”.  

---

## CU-02: Ver Detalle y Scrapear Licitación

**Actor:**  
- Usuario.

**Objetivo:**  
- Consultar el detalle de una licitación específica y lanzar scraping (automático o manual) para extraer datos económicos y riesgos.

**Precondiciones:**  
- Licitaciones cargadas y visibles en la lista (CU-01).  
- Estado “pendiente revisión idoneidad” o “idoneidad revisada”.  
- Perfil de empresa configurado.  
- Parámetro de configuración **“scraping automático”** definido (sí/no).  

**Flujo principal:**  
1. El usuario, desde la lista, hace clic en una licitación para ver el **detalle**.  
2. La vista detalle muestra: importe, descripción, lugar, URL, categoría de idoneidad y estado y tambien la URL
2b. La URL es editable. Si la URL se deja en blanco o es un valor invalido entonces NO ejecutes los pasos 3 al 8 y el boton **"Scrapear ahora"** estara deshabilitado   
3. Si la configuración está en **“scraping automático = sí”** y la licitación aún no está scraped, el sistema inicia automáticamente el proceso async al entrar en el detalle, mostrando progreso (“Extrayendo docs…”).  
4. Si **“scraping automático = no”**, la vista muestra un botón **“Scrapear ahora”**; al pulsarlo, se lanza el scraping async.  
5. El sistema accede a la URL, descarga el documento y lo guarda en el campo Pliego de la bbdd. Interpreta el documento y extrae: obligaciones, entregables, importe total detallado, lotes, garantías y elementos necesarios para inferir riesgos (plazos, complejidad, etc.) tambien recalcula el campo de Ideonidad  
6. Los datos extraídos se guardan en SQLite junto con el estado **“scraped”** y la fecha/hora del scraping.  
7. La vista detalle se actualiza mostrando los datos económicos y un resumen de las obligaciones de entrega y un resumen de riesgos generado por IA.
8. El usuario puede acceder al documento que se ha guadado en el campo Pliego (es un PDF)


**Variantes/Errores:**  
- V1: El usuario cambia posteriormente la configuración de “scraping automático”; este cambio sólo afecta a nuevos procesos.  
- V2: Si los datos scraped superan el número de días configurado como “antiguo”, la vista muestra un aviso y permite re-scrapear.  
- E1: Error de acceso a la URL (caída del portal, 404, etc.) → se reintenta hasta 3 veces y, si persiste, se muestra mensaje de error y sugerencia de revisar manualmente.  
- E2: PDF o documentos no legibles → se indica “Extracción parcial, revisar manualmente”.  

---

## CU-03: Marcar Licitación como Interesante y Añadir Notas

**Actor:**  
- Usuario.

**Objetivo:**  
- Marcar una licitación como interesante, registrar la fecha de decisión y añadir notas personales.

**Precondiciones:**  
- Vista detalle de licitación abierta (CU-02).  
- Scraping completado o al menos parcial.

**Flujo principal:**  
1. En la vista detalle, el usuario ve un toggle **“Me interesa”** (por defecto desactivado).  
2. Al activar el toggle, el sistema actualiza la licitación en SQLite con: estado **“interesa”** y **fecha_decision = fecha/hora actual**.  
3. El usuario introduce notas personales en un campo de texto (comentarios, próximos pasos, etc.); el sistema guarda las notas (auto o mediante botón “Guardar”).  
4. La lista de licitaciones refleja la marca de interés mediante un indicador (badge “interesa”) y puede reordenar priorizando estas licitaciones.  
5. La fecha de decisión queda registrada para futuras consultas y vistas resumen.

**Variantes/Errores:**  
- V1: El usuario desactiva el toggle → el estado pasa a **“revisada no interesa”** y se registra también fecha_decision.  
- V2: El usuario edita las notas varias veces → el sistema puede mantener un historial simple con fecha de cada modificación.  
- E1: Fallo al guardar en la base de datos → se muestra mensaje “Error al guardar datos, reintente”.  

---

## CU-04: Configurar Perfil Empresa y Parámetros

**Actor:**  
- Usuario.

**Objetivo:**  
- Configurar el perfil de la empresa y parámetros de funcionamiento (scraping, umbrales, antigüedad de datos).

**Precondiciones:**  
- Aplicación en marcha.  
- Acceso a la sección de configuración.

**Flujo principal:**  
1. El usuario accede al menú **“Configuración”**.  
2. Introduce o edita la **“Descripción de la empresa”** (texto libre) que se usará para el matching semántico.  
3. Activa o desactiva el toggle **“Scraping automático”**.  
4. Introduce el número de **“Días hasta considerar scraping antiguo”** (p.ej. 7 días), validando que el número sea ≥ 1.  
5. Opcionalmente ajusta otros parámetros, como: umbral mínimo de idoneidad IA o número máximo de scrapes concurrentes.  
6. Pulsa **“Guardar”**; el sistema valida los campos y persiste la configuración en SQLite.  

**Variantes/Errores:**  
- V1: El usuario pulsa “Restablecer valores por defecto” → se restauran parámetros de fábrica.  
- E1: Campo descripción vacío → mensaje “La descripción de la empresa es obligatoria para el matching”.  
- E2: Días de antigüedad inválidos → mensaje “El número mínimo de días es 1”.  

---

## CU-05: Vista Mis Licitaciones Interesadas (Resumen)

**Actor:**  
- Usuario.

**Objetivo:**  
- Visualizar rápidamente las licitaciones marcadas como interesantes y poder exportarlas.

**Precondiciones:**  
- Al menos una licitación marcada como “interesa” (CU-03).  
- Datos de scraping disponibles para esas licitaciones.

**Flujo principal:**  
1. El usuario accede a la pestaña o filtro **“Mis interesadas”**.  
2. Se muestra una lista con columnas: descripción, importe, lugar, categoría de idoneidad, fecha de decisión, resumen de riesgos.  
3. El usuario puede ordenar por fecha de decisión o por idoneidad y aplicar filtros por lugar, categoría o rango de fechas.  
4. Puede seleccionar algunas o todas las licitaciones y pulsar **“Exportar seleccionadas”** para descargar un CSV/Excel con toda la información relevante (incluyendo notas y datos scraped).  

**Variantes/Errores:**  
- V1: No hay licitaciones marcadas como interesadas → se muestra mensaje orientado “Marca licitaciones como interesadas para verlas aquí”.  
- E1: Error al generar el archivo de exportación → mensaje de error y opción de reintentar.  

---

## CU-06: Scraping en Lote desde la Lista

**Actor:**  
- Usuario.

**Objetivo:**  
- Lanzar scraping en background para varias licitaciones seleccionadas desde la lista principal.

**Precondiciones:**  
- Licitaciones cargadas desde un Excel (CU-01).  
- Configuración de scraping y concurrencia definida (CU-04).

**Flujo principal:**  
1. El usuario aplica filtros en la lista (por idoneidad, estado, etc.).  
2. Selecciona varias licitaciones mediante checkboxes.  
3. Pulsa el botón **“Scrapear seleccionadas”**.  
4. El backend crea una cola de tareas y lanza el scraping respetando el número máximo de procesos concurrentes configurado.  
5. La interfaz muestra un indicador global de progreso (X de Y licitaciones procesadas) y un estado por fila (pendiente, en progreso, completada, error).  
6. Al finalizar, las licitaciones muestran los nuevos datos económicos y de riesgos tanto en la lista como en el detalle.  

**Variantes/Errores:**  
- V1: El usuario detiene el proceso de scraping en lote → las tareas aún no iniciadas se marcan como “canceladas”.  
- V2: Algunas licitaciones tienen scraping reciente (no “antiguo”) → pueden omitirse automáticamente o ser incluidas sólo si el usuario fuerza re-scrapeo.  
- E1: Errores de red o del portal → se aplican reintentos limitados, registrando el error si finalmente falla.  
- E2: Exceso de errores 4xx/5xx → el sistema reduce temporalmente la concurrencia para evitar bloqueos y lo deja registrado.  

---

## CU-07: Gestionar Errores de Scraping y Reintentos por Licitación

**Actor:**  
- Usuario.

**Objetivo:**  
- Revisar y gestionar errores específicos de scraping en una licitación, decidiendo si reintentar o dejar el error.

**Precondiciones:**  
- Al menos un intento de scraping realizado (individual o en lote).  
- La licitación tiene estado de scraping fallido.

**Flujo principal:**  
1. El usuario abre el detalle de una licitación cuyo scraping fracasó.  
2. En el detalle se muestra un bloque de **“Estado de scraping”** con el tipo de error (timeout, 403, PDF no legible, etc.) y fecha/hora del último intento.  
3. El usuario pulsa el botón **“Reintentar scraping”**.  
4. El sistema lanza un nuevo intento de scraping, posiblemente con reintentos internos limitados y tiempos de espera escalonados.  
5. Al terminar, el estado se actualiza a “correcto” con nuevos datos o a “error permanente” si vuelve a fallar.  

**Variantes/Errores:**  
- V1: Se detecta un posible bloqueo anti-bot → se sugiere al usuario abrir la URL manualmente y se marca el caso como “requiere revisión manual”.  
- V2: Solo falla la descarga de un documento (ej. un PDF concreto) → se muestra como “datos parcialmente extraídos”.  
- E1: Fallo en la cola de procesamiento o backend no disponible → se indica claramente y se sugiere reiniciar el servicio.  

---

## CU-08: Gestionar Sesiones y Últimos Ficheros Procesados

**Actor:**  
- Usuario.

**Objetivo:**  
- Acceder rápidamente a los ficheros Excel y licitaciones procesadas recientemente sin tener que reimportar.

**Precondiciones:**  
- Al menos un Excel procesado anteriormente.  
- Base de datos SQLite persistente montada correctamente.

**Flujo principal:**  
1. El usuario abre la aplicación en el navegador.  
2. La pantalla inicial muestra un panel de **“Últimos ficheros procesados”** con nombre de fichero, fecha de carga y número de licitaciones.  
3. El usuario selecciona un fichero y pulsa **“Ver licitaciones”**.  
4. Se abre la lista con las licitaciones asociadas a ese fichero, con sus estados actuales (idoneidad, scraping, interés).  
5. El usuario puede limpiar datos antiguos usando una opción de “Limpiar datos antiguos” por fecha o por fichero completo.  

**Variantes/Errores:**  
- V1: No hay ficheros procesados → la pantalla inicial muestra directamente la acción principal “Cargar Excel”.  
- V2: El usuario elimina un fichero → se eliminan sus licitaciones asociadas y el sistema registra este evento de mantenimiento.  
- E1: Problema al acceder a la base de datos (volumen Docker no montado, permisos) → mensaje explicando el problema y pidiendo revisar la configuración.  

---

## CU-09: Backup y Restore de la Base de Datos Local

**Actor:**  
- Usuario.

**Objetivo:**  
- Realizar copias de seguridad de los datos (licitaciones, decisiones, notas) y restaurarlas cuando sea necesario.

**Precondiciones:**  
- Base de datos SQLite accesible en el contenedor/volumen.

**Flujo principal – Backup:**  
1. El usuario accede a la sección **“Mantenimiento / Backup”**.  
2. Pulsa **“Descargar copia de seguridad”**.  
3. El sistema genera un archivo de backup (por ejemplo, el .sqlite comprimido o un dump) y lo ofrece para descarga.

**Flujo principal – Restore:**  
1. El usuario accede a la misma sección y pulsa **“Restaurar copia de seguridad”**.  
2. Selecciona un archivo de backup local y lo sube.  
3. El sistema valida el formato del backup.  
4. Tras confirmación del usuario, el sistema reemplaza la base de datos actual por la del backup.  
5. El usuario vuelve al dashboard y ve los datos tal y como estaban en el momento del backup.  

**Variantes/Errores:**  
- V1: Restore con una versión de esquema diferente → se muestra advertencia de compatibilidad.  
- E1: Archivo de backup corrupto o incompatible → mensaje “La copia de seguridad no es válida”, sin modificar la base actual.  
- E2: Error de lectura/escritura durante el backup o restore → mensaje de error y recomendación de revisar permisos y configuración de volúmenes.  

---

## CU-10: Actualizar Licitaciones desde un Excel ya Procesado

**Actor:**  
- Usuario.

**Objetivo:**  
- Integrar un nuevo Excel de la misma fuente/boletín actualizando licitaciones existentes y añadiendo nuevas sin perder decisiones ni notas.

**Precondiciones:**  
- Al menos un Excel previo procesado de la misma fuente.  
- Definido un identificador único de licitación (ID de expediente, referencia, etc.).

**Flujo principal:**  
1. El usuario selecciona la opción **“Actualizar desde nuevo Excel”** y sube el archivo.  
2. El sistema compara cada fila con las licitaciones existentes usando el identificador único.  
3. Si una licitación no existe todavía, se crea un nuevo registro con idoneidad IA inicial y estado “pendiente revisión idoneidad”.  
4. Si la licitación ya existe, se actualizan los campos que han cambiado (importe, fechas, etc.) manteniendo notas, marca de “interés” y fecha de decisión.  
5. La lista resalta las licitaciones nuevas y las actualizadas recientemente.  

**Variantes/Errores:**  
- V1: Algunas filas del Excel carecen de identificador único → se marcan como “no identificables” y el usuario decide si importarlas como nuevas.  
- E1: El Excel no respeta el formato esperado → la importación se cancela y se muestra un mensaje detallando el problema.  
- E2: Conflictos de datos (mismo ID con cambios contradictorios) → se presenta un resumen para que el usuario elija qué valores mantener.  

---