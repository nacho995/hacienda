// Exportar todos los servicios desde un único punto de entrada

// Servicios de API
export { default as apiClient } from './apiClient';

// Servicios de autenticación
export { default as authService } from './authService';
export * from './authService';

// Servicios de reservas
export * from './reservationService';

// NUEVO: Servicios de disponibilidad (preferir estos para verificación de disponibilidad)
export * from './disponibilidadService';

// Servicios de habitaciones
export * from './habitaciones.service';
export { default as habitacionService } from './habitaciones.service';

// Servicios de eventos
export * from './eventos.service';

// Servicios de usuarios
export * from './userService';
export { default as userService } from './userService';

// Servicios de configuración
export * from './configService';
export { default as configService } from './configService';
