# Bitácora de Desarrollo - Veterinaria Cuatro Patas

## Integrantes
- Pareja 1: Base de Datos y Configuración
- Pareja 2: Módulo Clientes y Mascotas
- Pareja 3: Módulo Inventario y Ventas

---

## Registros Semanales

### Semana 1
- Se creó el proyecto en Supabase con la base de datos PostgreSQL.
- Se crearon las tablas principales: `clientes`, `mascotas`, `productos`, `ventas` y `detalle_ventas`.
- Se configuraron las políticas de seguridad RLS (Row Level Security) para permitir la lectura e inserción pública de datos.

### Semana 2
- Se armó la estructura de carpetas local del proyecto frontend (HTML5, CSS3, Vanilla JS ESM).
- Se configuró la conexión centralizada con la API de Supabase en `Js/supabaseClient.js`.
- Se creó la pantalla principal de navegación (`index.html`) con diseño responsivo basado en Bootstrap 5.

### Semana 3
- Se completó el Módulo de Inventario (`inventario.html` y `Js/inventario.js`) con visualización de stock y alta de productos.
- Se implementó el Módulo de Ventas (`ventas.html` y `Js/ventas.js`) vinculando clientes y productos con cálculo de total.
- Se programó la lógica relacional: inserción en `ventas`, `detalle_ventas` y actualización automática de stock en `productos`.

### Semana 4
- Se implementó el Módulo de Gestión de Mascotas y Pacientes (`mascotas.html` y `Js/mascotas.js`).
- Se actualizó la tabla `mascotas` en Supabase incorporando el campo de observaciones/síntomas del paciente y la relación de clave foránea con `clientes`.
- Se aplicó la identidad visual personalizada en `css/estilos.css` con degradado cálido y patrón de huellas de fondo (`patitas-fondo.jfif`).
- Se unificó la barra de navegación (`navbar`) en todas las vistas de la aplicación.

### Semana 5
- Se incorporó la tabla `turnos` en Supabase relacionalmente vinculada a `clientes` y `mascotas`.
- Se desarrolló el Módulo de Agenda y Gestión de Turnos (`turnos.html` y `Js/turnos.js`), permitiendo programar citas por fecha, hora y motivo de consulta, además de actualizar el estado del turno (Pendiente / Atendido).
- Se agregaron accesos directos y atajos entre módulos (Clientes → Mascotas → Turnos) para optimizar el flujo de uso.
- Se preparó el repositorio público en GitHub y se desplegó la aplicación en Vercel con integración continua (CI/CD).