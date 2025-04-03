# Documentación de la API - Hacienda San Carlos Borromeo

Esta documentación proporciona información sobre los endpoints disponibles en la API de Hacienda San Carlos Borromeo.

## Autenticación

### Registro de Usuario
- **URL**: `/api/auth/register`
- **Método**: `POST`
- **Acceso**: Público
- **Parámetros del cuerpo**:
  - `nombre` (string, requerido): Nombre del usuario
  - `apellidos` (string, requerido): Apellidos del usuario
  - `email` (string, requerido): Email del usuario
  - `password` (string, requerido): Contraseña (mínimo 6 caracteres)
  - `telefono` (string, requerido): Número de teléfono
  - `direccion` (string, opcional): Dirección del usuario
- **Respuesta exitosa**:
  - Código: `201 Created`
  - Contenido: `{ success: true, data: { /* datos del usuario */ } }`

### Registro de Administrador
- **URL**: `/api/auth/register-admin`
- **Método**: `POST`
- **Acceso**: Privado/Admin
- **Parámetros del cuerpo**: *Igual que el registro de usuario*
- **Respuesta exitosa**:
  - Código: `201 Created`
  - Contenido: `{ success: true, data: { /* datos del usuario */ } }`

### Iniciar Sesión
- **URL**: `/api/auth/login`
- **Método**: `POST`
- **Acceso**: Público
- **Parámetros del cuerpo**:
  - `email` (string, requerido): Email del usuario
  - `password` (string, requerido): Contraseña del usuario
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, token: "JWT_TOKEN" }`

### Verificar Cuenta
- **URL**: `/api/auth/confirm/:token`
- **Método**: `GET`
- **Acceso**: Público
- **Parámetros de ruta**:
  - `token` (string, requerido): Token de confirmación
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, message: "Cuenta confirmada" }`

### Cerrar Sesión
- **URL**: `/api/auth/logout`
- **Método**: `GET`
- **Acceso**: Privado
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, message: "Sesión cerrada" }`

### Obtener Usuario Actual
- **URL**: `/api/auth/me`
- **Método**: `GET`
- **Acceso**: Privado
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: { /* datos del usuario */ } }`

## Usuarios

### Obtener Todos los Usuarios
- **URL**: `/api/users`
- **Método**: `GET`
- **Acceso**: Privado/Admin
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, count: X, data: [ /* array de usuarios */ ] }`

### Obtener Usuario por ID
- **URL**: `/api/users/:id`
- **Método**: `GET`
- **Acceso**: Privado/Admin
- **Parámetros de ruta**:
  - `id` (string, requerido): ID del usuario
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: { /* datos del usuario */ } }`

### Obtener Perfil Propio
- **URL**: `/api/users/me`
- **Método**: `GET`
- **Acceso**: Privado
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: { /* datos del usuario */ } }`

### Actualizar Usuario
- **URL**: `/api/users/:id`
- **Método**: `PUT`
- **Acceso**: Privado (propio perfil) o Admin
- **Parámetros de ruta**:
  - `id` (string, requerido): ID del usuario
- **Parámetros del cuerpo**:
  - `nombre` (string, opcional): Nuevo nombre
  - `apellidos` (string, opcional): Nuevos apellidos
  - `telefono` (string, opcional): Nuevo teléfono
  - `direccion` (string, opcional): Nueva dirección
  - `role` (string, opcional): Nuevo rol (solo admins)
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: { /* datos actualizados */ } }`

### Eliminar Usuario
- **URL**: `/api/users/:id`
- **Método**: `DELETE`
- **Acceso**: Privado/Admin
- **Parámetros de ruta**:
  - `id` (string, requerido): ID del usuario
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: {} }`

## Reservas de Habitaciones

### Crear Reserva de Habitación
- **URL**: `/api/reservas/habitaciones`
- **Método**: `POST`
- **Acceso**: Privado
- **Parámetros del cuerpo**:
  - `fechaEntrada` (string, requerido): Fecha de entrada (YYYY-MM-DD)
  - `fechaSalida` (string, requerido): Fecha de salida (YYYY-MM-DD)
  - `numHabitaciones` (number, requerido): Número de habitaciones
  - `numAdultos` (number, requerido): Número de adultos
  - `numNinos` (number, opcional): Número de niños
  - `tipoHabitacion` (string, requerido): Tipo de habitación
  - `serviciosAdicionales` (array, opcional): Servicios adicionales
  - `comentarios` (string, opcional): Comentarios adicionales
- **Respuesta exitosa**:
  - Código: `201 Created`
  - Contenido: `{ success: true, data: { /* datos de la reserva */ } }`

### Obtener Todas las Reservas de Habitaciones
- **URL**: `/api/reservas/habitaciones`
- **Método**: `GET`
- **Acceso**: Privado
- **Parámetros de consulta**:
  - `fecha` (string, opcional): Filtrar por fecha específica
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, count: X, data: [ /* array de reservas */ ] }`

### Obtener Reserva de Habitación por ID
- **URL**: `/api/reservas/habitaciones/:id`
- **Método**: `GET`
- **Acceso**: Privado
- **Parámetros de ruta**:
  - `id` (string, requerido): ID de la reserva
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: { /* datos de la reserva */ } }`

### Actualizar Reserva de Habitación
- **URL**: `/api/reservas/habitaciones/:id`
- **Método**: `PUT`
- **Acceso**: Privado
- **Parámetros de ruta**:
  - `id` (string, requerido): ID de la reserva
- **Parámetros del cuerpo**: *Cualquiera de los campos de creación*
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: { /* datos actualizados */ } }`

### Eliminar Reserva de Habitación
- **URL**: `/api/reservas/habitaciones/:id`
- **Método**: `DELETE`
- **Acceso**: Privado
- **Parámetros de ruta**:
  - `id` (string, requerido): ID de la reserva
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: {} }`

### Comprobar Disponibilidad de Habitaciones
- **URL**: `/api/reservas/habitaciones/disponibilidad`
- **Método**: `POST`
- **Acceso**: Público
- **Parámetros del cuerpo**:
  - `fechaEntrada` (string, requerido): Fecha de entrada (YYYY-MM-DD)
  - `fechaSalida` (string, requerido): Fecha de salida (YYYY-MM-DD)
  - `numHabitaciones` (number, requerido): Número de habitaciones
  - `tipoHabitacion` (string, opcional): Tipo de habitación
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, disponible: true|false }`

## Reservas de Eventos

### Crear Reserva de Evento
- **URL**: `/api/reservas/eventos`
- **Método**: `POST`
- **Acceso**: Privado
- **Parámetros del cuerpo**:
  - `fechaEvento` (string, requerido): Fecha del evento (YYYY-MM-DD)
  - `horaInicio` (string, requerido): Hora de inicio (HH:MM)
  - `horaFin` (string, requerido): Hora de fin (HH:MM)
  - `tipoEvento` (string, requerido): Tipo de evento
  - `numPersonas` (number, requerido): Número de personas
  - `serviciosAdicionales` (array, opcional): Servicios adicionales
  - `comentarios` (string, opcional): Comentarios adicionales
- **Respuesta exitosa**:
  - Código: `201 Created`
  - Contenido: `{ success: true, data: { /* datos de la reserva */ } }`

### Obtener Todas las Reservas de Eventos
- **URL**: `/api/reservas/eventos`
- **Método**: `GET`
- **Acceso**: Privado
- **Parámetros de consulta**:
  - `fecha` (string, opcional): Filtrar por fecha específica
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, count: X, data: [ /* array de reservas */ ] }`

### Obtener Reserva de Evento por ID
- **URL**: `/api/reservas/eventos/:id`
- **Método**: `GET`
- **Acceso**: Privado
- **Parámetros de ruta**:
  - `id` (string, requerido): ID de la reserva
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: { /* datos de la reserva */ } }`

### Actualizar Reserva de Evento
- **URL**: `/api/reservas/eventos/:id`
- **Método**: `PUT`
- **Acceso**: Privado
- **Parámetros de ruta**:
  - `id` (string, requerido): ID de la reserva
- **Parámetros del cuerpo**: *Cualquiera de los campos de creación*
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: { /* datos actualizados */ } }`

### Eliminar Reserva de Evento
- **URL**: `/api/reservas/eventos/:id`
- **Método**: `DELETE`
- **Acceso**: Privado
- **Parámetros de ruta**:
  - `id` (string, requerido): ID de la reserva
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: {} }`

### Comprobar Disponibilidad de Espacios para Eventos
- **URL**: `/api/reservas/eventos/disponibilidad`
- **Método**: `POST`
- **Acceso**: Público
- **Parámetros del cuerpo**:
  - `fechaEvento` (string, requerido): Fecha del evento (YYYY-MM-DD)
  - `horaInicio` (string, requerido): Hora de inicio (HH:MM)
  - `horaFin` (string, requerido): Hora de fin (HH:MM)
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, disponible: true|false }`

## Reservas de Masajes

### Crear Reserva de Masaje
- **URL**: `/api/reservas/masajes`
- **Método**: `POST`
- **Acceso**: Privado
- **Parámetros del cuerpo**:
  - `fechaMasaje` (string, requerido): Fecha del masaje (YYYY-MM-DD)
  - `horaMasaje` (string, requerido): Hora del masaje (HH:MM)
  - `tipoMasaje` (string, requerido): Tipo de masaje
  - `duracion` (number, requerido): Duración en minutos
  - `terapeuta` (string, opcional): Terapeuta preferido
  - `comentarios` (string, opcional): Comentarios adicionales
- **Respuesta exitosa**:
  - Código: `201 Created`
  - Contenido: `{ success: true, data: { /* datos de la reserva */ } }`

### Obtener Todas las Reservas de Masajes
- **URL**: `/api/reservas/masajes`
- **Método**: `GET`
- **Acceso**: Privado
- **Parámetros de consulta**:
  - `fecha` (string, opcional): Filtrar por fecha específica
  - `terapeuta` (string, opcional): Filtrar por terapeuta
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, count: X, data: [ /* array de reservas */ ] }`

### Obtener Reserva de Masaje por ID
- **URL**: `/api/reservas/masajes/:id`
- **Método**: `GET`
- **Acceso**: Privado
- **Parámetros de ruta**:
  - `id` (string, requerido): ID de la reserva
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: { /* datos de la reserva */ } }`

### Actualizar Reserva de Masaje
- **URL**: `/api/reservas/masajes/:id`
- **Método**: `PUT`
- **Acceso**: Privado
- **Parámetros de ruta**:
  - `id` (string, requerido): ID de la reserva
- **Parámetros del cuerpo**: *Cualquiera de los campos de creación*
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: { /* datos actualizados */ } }`

### Eliminar Reserva de Masaje
- **URL**: `/api/reservas/masajes/:id`
- **Método**: `DELETE`
- **Acceso**: Privado
- **Parámetros de ruta**:
  - `id` (string, requerido): ID de la reserva
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, data: {} }`

### Comprobar Disponibilidad de Masajes
- **URL**: `/api/reservas/masajes/disponibilidad`
- **Método**: `POST`
- **Acceso**: Público
- **Parámetros del cuerpo**:
  - `fechaMasaje` (string, requerido): Fecha del masaje (YYYY-MM-DD)
  - `horaMasaje` (string, requerido): Hora del masaje (HH:MM)
  - `duracion` (number, requerido): Duración en minutos
  - `terapeuta` (string, opcional): Terapeuta preferido
- **Respuesta exitosa**:
  - Código: `200 OK`
  - Contenido: `{ success: true, disponible: true|false }` 