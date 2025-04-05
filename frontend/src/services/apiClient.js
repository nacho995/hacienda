import axios from 'axios';

// Determinar la URL base según el entorno
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', BASE_URL);

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000 // 10 segundos de timeout
});

// Función para decodificar un token Base64 de forma segura
const safelyDecodeToken = (token) => {
  try {
    // Dividir el token en sus partes (en caso de JWT real)
    const parts = token.split('.');
    if (parts.length === 3) {
      // Si es un JWT real, decodificar la parte de payload (segunda parte)
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } else {
      // Si no es un JWT estándar (como nuestro token simulado)
      return JSON.parse(atob(token));
    }
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

// Rutas que son públicas y no necesitan token
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/confirm',
  '/auth/password/forgot',
  '/auth/password/reset',
  '/public',
  '/reservas/habitaciones/disponibilidad',
  '/habitaciones',
  '/reservas/habitaciones/fechas-ocupadas'
];

// Función para verificar si una ruta es pública
const isPublicRoute = (url) => {
  return publicRoutes.some(route => url.includes(route));
};

// Interceptor para manejar tokens en las peticiones
apiClient.interceptors.request.use(
  (config) => {
    console.log('Realizando petición a:', config.url);
    console.log('URL completa:', `${config.baseURL}${config.url}`);
    console.log('Método:', config.method?.toUpperCase());
    
    // Si es una ruta pública, no es necesario el token
    if (isPublicRoute(config.url)) {
      console.log('Ruta pública, no se requiere token');
      return config;
    }
    
    // Obtener token JWT desde localStorage
    const token = localStorage.getItem('authToken');
    console.log('Token encontrado:', token ? 'Sí' : 'No');
    
    if (token) {
      // Verificar si el token es válido decodificándolo
      const tokenData = safelyDecodeToken(token);
      console.log('Token decodificado:', tokenData ? 'Válido' : 'Inválido');
      
      if (!tokenData) {
        console.log('Token inválido, limpiando localStorage');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (!isPublicRoute(config.url)) {
          const authErrorEvent = new CustomEvent('auth-error', { 
            detail: { status: 401, message: 'Token inválido' } 
          });
          window.dispatchEvent(authErrorEvent);
        }
      } else if (tokenData.exp && tokenData.exp < Math.floor(Date.now() / 1000)) {
        console.log('Token expirado, limpiando localStorage');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (!isPublicRoute(config.url)) {
          const authErrorEvent = new CustomEvent('auth-error', { 
            detail: { status: 401, message: 'Sesión expirada' } 
          });
          window.dispatchEvent(authErrorEvent);
        }
      } else {
        console.log('Token válido, añadiendo a headers');
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (!isPublicRoute(config.url)) {
      console.warn('Intentando acceder a ruta protegida sin token:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Error en interceptor de petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    console.log('Respuesta exitosa de:', response.config.url);
    console.log('Datos:', response.data);
    return response.data;
  },
  (error) => {
    const errorResponse = {
      success: false,
      message: 'Error de conexión con el servidor',
      status: 500,
      data: null
    };
    
    if (error.response) {
      errorResponse.status = error.response.status;
      errorResponse.message = error.response.data?.message || 'Error en la petición';
      errorResponse.data = error.response.data;
      
      console.error(`Error ${error.response.status} en petición a: ${error.config?.url}`);
      console.error('Detalles del error:', error.response.data);
      
      // Log adicional para errores 401 en login
      if (error.response.status === 401 && error.config?.url.includes('/auth/login')) {
        console.error('Error 401 en login. Datos enviados:', error.config.data);
        try {
          const sentData = JSON.parse(error.config.data);
          console.log('Email utilizado:', sentData.email);
        } catch (e) {
          console.error('No se pudo parsear los datos enviados:', e);
        }
      }
      
      if (error.response.status === 401) {
        if (!error.config?.url || !isPublicRoute(error.config.url)) {
          console.log('Error de autenticación, limpiando localStorage');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          
          const authErrorEvent = new CustomEvent('auth-error', { 
            detail: { 
              status: 401, 
              message: error.response.data?.message || 'Sesión expirada o no autorizada'
            } 
          });
          window.dispatchEvent(authErrorEvent);
        }
      }
    } else if (error.code === 'ECONNABORTED') {
      errorResponse.message = 'La petición ha tardado demasiado tiempo. Por favor, inténtelo de nuevo.';
      console.error('Timeout en la petición:', error);
    } else {
      console.error('Error de red:', error.message);
    }
    
    return Promise.reject(errorResponse);
  }
);

export default apiClient; 