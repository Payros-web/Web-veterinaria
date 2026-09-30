# Bitácora de Desarrollo - Veterinaria Cuatro Patas

## Integrantes
- Pareja 1: Base de Datos y Configuración
- Pareja 2: Módulo Clientes y Mascotas
- Pareja 3: Módulo Inventario y Ventas

---

## Registros Semanales

### Semana 1
- Se creó el proyecto en Supabase con la base de datos PostgreSQL.
- Se crearon las 5 tablas principales: `clientes`, `mascotas`, `productos`, `ventas` y `detalle_ventas`.
- Se configuraron las políticas de seguridad RLS para permitir lectura e inserción pública de datos.

### Semana 2
- Se armó la estructura de carpetas local del proyecto frontend (HTML/CSS/JS).
- Se configuró la conexión centralizada con la API de Supabase en `js/supabaseClient.js`.
- Se creó la pantalla principal de navegación (`index.html`).

### Semana 3
- Se completó el Módulo de Inventario con visualización de stock y alta de productos.
- Se implementó el Módulo de Ventas vinculando clientes y productos con cálculo de total.
- Se programó la lógica relacional: inserción en `ventas`, `detalle_ventas` y actualización automática de stock en `productos`.