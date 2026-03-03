# Tipografía y colores (ingeniería inversa aproximada)

---

## Tipografía

### Fuente principal
- **Familia sugerida:** `Inter`, `SF Pro Text` o similar sans-serif moderna.
- **Uso general:** textos de interfaz, tablas, botones.

### Jerarquía de tamaños

- **Título principal / números grandes (cards KPI):**
  - Tamaño: **24–32 px**
  - Peso: **700** (bold)
- **Subtítulos / labels de tarjeta:**
  - Tamaño: **12–14 px**
  - Peso: **500–600** (medium/semibold)
- **Texto normal (celdas de tabla, labels form):**
  - Tamaño: **14–16 px**
  - Peso: **400–500** (regular/medium)
- **Texto secundario / ayuda / “vs last week”:**
  - Tamaño: **12–13 px**
  - Peso: **400** (regular)

### Estilo general

- Alto interlineado (line-height ~1.4–1.6).
- Mayúsculas solo en labels muy concretos; predominan textos en “Title Case” o frase normal.
- Alineación:
  - Textos descriptivos: izquierda.
  - Números: derecha o centro según columna.

---

## Paleta de colores (aproximada)

### Fondos y superficies

- **Fondo general app:**  
  - `#F5F5F7` – gris muy claro.
- **Tarjetas y contenedores (cards, tabla):**  
  - `#FFFFFF` – blanco.
- **Bordes suaves / divisores:**  
  - `#E4E4E7` – gris claro muy sutil.

### Texto

- **Texto principal (títulos, datos importantes):**  
  - `#111827` – casi negro.
- **Texto secundario (descripciones, subtítulos):**  
  - `#4B5563` – gris medio.  
- **Texto desactivado / placeholder:**  
  - `#9CA3AF` – gris claro.

### Acciones principales

- **Botón primario (ej. “Add New Doctor”):**  
  - Fondo: `#2563EB` – azul medio.  
  - Texto: `#FFFFFF`.  
  - Hover sugerido: `#1D4ED8`.

- **Botones de filtro segmentado / chips neutros:**  
  - Fondo activo: `#E5E7EB`.  
  - Texto activo: `#111827`.  
  - Inactivos: texto `#6B7280`, fondo transparente o blanco.

### Estados y métricas

- **Positivo (incrementos, estados OK):**
  - Texto / iconos: `#16A34A` – verde.
  - Fondos suaves (badges): `#DCFCE7`.

- **Negativo (decrementos, overbooked, errores):**
  - Texto / iconos: `#DC2626` – rojo.  
  - Fondos suaves (badges): `#FEE2E2`.

- **Estado neutro/informativo (On Duty, On Leave):**
  - Azul suave:
    - Texto: `#1D4ED8`.  
    - Fondo chip: `#DBEAFE`.
  - Gris para estados neutros:
    - Texto: `#4B5563`.  
    - Fondo chip: `#E5E7EB`.

### Rating (estrellas)

- **Color estrella:**  
  - `#FACC15` – amarillo dorado.
- **Texto rating numérico:**  
  - `#111827` o `#4B5563`.

---

## Bordes, radios y sombras

- **Radio de bordes (cards, inputs, botones):**
  - Tarjetas y contenedores: `12–16 px`.
  - Botones y chips: `9999 px` (forma píldora).

- **Sombras (apr.):**
  - Cards: `0 10px 25px rgba(15, 23, 42, 0.05)`.

---
```

