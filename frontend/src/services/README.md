# Servicios Frontend

Este directorio contiene los servicios que interactúan con el backend y proporcionan funcionalidades a los componentes.

## Estructura Actual

- **apiClient.js**: Cliente HTTP base para todas las peticiones.
- **authService.js**: Servicios de autenticación y gestión de usuarios.
- **disponibilidadService.js**: Servicios centralizados para verificar disponibilidad de habitaciones y eventos.
- **habitaciones.service.js**: Servicios relacionados con habitaciones.
- **reservationService.js**: Servicios para gestionar reservas (habitaciones y eventos).
- **reservas.service.js**: Funciones adicionales para reservas (en español).
- **eventos.service.js**: Servicios para gestionar eventos.
- **tiposEvento.service.js**: Servicios relacionados con tipos de eventos.
- **servicios.service.js**: Servicios para gestionar servicios adicionales.
- **userService.js**: Servicios para gestión de usuarios.
- **configService.js**: Servicios de configuración del sistema.
- **gestionHacienda.service.js**: Servicios para la administración de la hacienda.

## Funciones Deprecadas

Las siguientes funciones están marcadas como obsoletas y deberían ser reemplazadas por sus equivalentes en `disponibilidadService.js`:

- `getFechasOcupadasPorHabitacion()` → usar `obtenerFechasOcupadas()`
- `getFechasEventosEnRango()` → usar `obtenerTodasLasReservas()`
- `getFechasOcupadasGlobales()` → usar `obtenerTodasLasReservas()`
- `verificarDisponibilidadHabitaciones()` → usar `verificarDisponibilidadHabitacion()`

## Plan de Consolidación (Largo Plazo)

Para una mejor organización y mantenimiento, se recomienda consolidar los servicios en estos grupos:

1. **Autenticación y Usuarios**
   - `authService.js`
   - `userService.js`

2. **Reservas y Disponibilidad**
   - `disponibilidadService.js` (consolidar toda la lógica de verificación)
   - `reservationService.js` (consolidar ambos servicios de reservas)

3. **Habitaciones**
   - `habitaciones.service.js`

4. **Eventos**
   - `eventos.service.js`
   - `tiposEvento.service.js`

5. **Servicios Adicionales**
   - `servicios.service.js`

6. **Configuración y Administración**
   - `configService.js`
   - `gestionHacienda.service.js`

## Convenciones de Nombrado

Se recomienda estandarizar las convenciones de nombrado:

- **Archivos:** Usar el formato `nombreServicio.service.js`
- **Funciones:** Usar verbos en infinitivo en español para mantener coherencia con la UI
  - Ejemplos: `obtenerX()`, `crearX()`, `actualizarX()`, `eliminarX()`

## Notas sobre Caché

El servicio `disponibilidadService.js` implementa un sistema de caché para reducir las llamadas al backend. Considerar extender este patrón a otros servicios que puedan beneficiarse de él. 