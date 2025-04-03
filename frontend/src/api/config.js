// Configuración base para la API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Timeout para peticiones fetch (en milisegundos)
export const FETCH_TIMEOUT = 10000; // 10 segundos

// Estructura de endpoints
export const ENDPOINTS = {
  // Autenticación
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    CONFIRM: '/auth/confirm',
    ME: '/auth/me',
    REGISTER_ADMIN: '/auth/register-admin',
  },
  // Usuarios
  USERS: {
    ALL: '/users',
    SINGLE: (id) => `/users/${id}`,
    ME: '/users/me',
  },
  // Reservas de Habitaciones
  RESERVAS_HABITACIONES: {
    ALL: '/reservas/habitaciones',
    SINGLE: (id) => `/reservas/habitaciones/${id}`,
    DISPONIBILIDAD: '/reservas/habitaciones/disponibilidad',
  },
  // Reservas de Eventos
  RESERVAS_EVENTOS: {
    ALL: '/reservas/eventos',
    SINGLE: (id) => `/reservas/eventos/${id}`,
    DISPONIBILIDAD: '/reservas/eventos/disponibilidad',
  },
  // Reservas de Masajes
  RESERVAS_MASAJES: {
    ALL: '/reservas/masajes',
    SINGLE: (id) => `/reservas/masajes/${id}`,
    DISPONIBILIDAD: '/reservas/masajes/disponibilidad',
  },
};

// Opciones por defecto para fetch
export const DEFAULT_OPTIONS = {
  headers: {
    'Content-Type': 'application/json',
  },
}; 