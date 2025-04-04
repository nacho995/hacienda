// Configuración base para la API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Timeout para peticiones fetch (en milisegundos)
export const FETCH_TIMEOUT = 10000; // 10 segundos

// Estructura de endpoints
export const ENDPOINTS = {
  // Autenticación
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CONFIRM: '/api/auth/confirm',
    ME: '/api/auth/me',
    REGISTER_ADMIN: '/api/auth/register-admin',
  },
  // Usuarios
  USERS: {
    ALL: '/api/users',
    SINGLE: (id) => `/api/users/${id}`,
    ME: '/api/users/me',
  },
  // Reservas de Habitaciones
  RESERVAS_HABITACIONES: {
    ALL: '/api/reservas/habitaciones',
    SINGLE: (id) => `/api/reservas/habitaciones/${id}`,
    DISPONIBILIDAD: '/api/reservas/habitaciones/disponibilidad',
  },
  // Reservas de Eventos
  RESERVAS_EVENTOS: {
    ALL: '/api/reservas/eventos',
    SINGLE: (id) => `/api/reservas/eventos/${id}`,
    DISPONIBILIDAD: '/api/reservas/eventos/disponibilidad',
    ASIGNAR: (id) => `/api/reservas/eventos/${id}/asignar`,
    DESASIGNAR: (id) => `/api/reservas/eventos/${id}/desasignar`,
  },
  // Reservas de Masajes
  RESERVAS_MASAJES: {
    ALL: '/api/reservas/masajes',
    SINGLE: (id) => `/api/reservas/masajes/${id}`,
    DISPONIBILIDAD: '/api/reservas/masajes/disponibilidad',
  },
};

// Opciones por defecto para fetch
export const DEFAULT_OPTIONS = {
  headers: {
    'Content-Type': 'application/json',
  },
}; 