import axios from 'axios';

// Determinar la URL base según el entorno
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
];

// Función para verificar si una ruta es pública
const isPublicRoute = (url) => {
  return publicRoutes.some(route => url.includes(route));
};

// Interceptor para manejar tokens en las peticiones
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Preparando petición a: ${config.url}`);
    
    // Si es una ruta pública, no es necesario el token
    if (isPublicRoute(config.url)) {
      console.log('Enviando petición a ruta pública sin token:', config.url);
      return config;
    }
    
    // Obtener token JWT desde localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Verificar si el token es válido decodificándolo
      const tokenData = safelyDecodeToken(token);
      
      if (!tokenData) {
        // Token inválido, no agregarlo y limpiar localStorage
        console.log('Token inválido detectado, limpiando localStorage');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Disparar evento de error de autenticación sólo si no es una ruta pública
        if (!isPublicRoute(config.url)) {
          const authErrorEvent = new CustomEvent('auth-error', { 
            detail: { status: 401, message: 'Token inválido' } 
          });
          window.dispatchEvent(authErrorEvent);
        }
      } else if (tokenData.exp && tokenData.exp < Math.floor(Date.now() / 1000)) {
        // Token expirado, no agregarlo y limpiar localStorage
        console.log('Token expirado detectado, limpiando localStorage');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Disparar evento de error de autenticación sólo si no es una ruta pública
        if (!isPublicRoute(config.url)) {
          const authErrorEvent = new CustomEvent('auth-error', { 
            detail: { status: 401, message: 'Sesión expirada' } 
          });
          window.dispatchEvent(authErrorEvent);
        }
      } else {
        // Token válido, agregarlo a la petición
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Enviando petición con token válido:', config.url);
      }
    } else {
      console.log('Enviando petición sin token:', config.url);
      // Si no hay token y la ruta no es pública, posiblemente tengamos un problema
      if (!isPublicRoute(config.url)) {
        console.warn('Intentando acceder a ruta protegida sin token:', config.url);
      }
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
    // Procesar respuestas exitosas
    console.log(`Respuesta exitosa de: ${response.config.url}`);
    return response.data; // Devolver directamente los datos para simplificar
  },
  (error) => {
    // Procesar errores
    const errorResponse = {
      success: false,
      message: 'Error de conexión con el servidor',
      status: 500,
      data: null
    };
    
    if (error.response) {
      // El servidor respondió con un código de error
      errorResponse.status = error.response.status;
      errorResponse.message = error.response.data?.message || 'Error en la petición';
      errorResponse.data = error.response.data;
      
      console.error(`Error ${error.response.status} en petición a: ${error.config?.url}`);
      
      // Manejar errores específicos
      if (error.response.status === 401) {
        // Comprobar si la petición fue a una ruta pública
        if (!error.config?.url || !isPublicRoute(error.config.url)) {
          // Sesión caducada o no autenticada, limpiar el localStorage
          console.error('Error 401: Token no válido o expirado');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          
          // Disparar un evento para notificar a la aplicación sobre el error de autenticación
          const authErrorEvent = new CustomEvent('auth-error', { 
            detail: { status: 401, message: 'Sesión expirada o no autorizada' } 
          });
          window.dispatchEvent(authErrorEvent);
        }
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error(`No se recibió respuesta del servidor para: ${error.config?.url}`);
      errorResponse.message = 'No se recibió respuesta del servidor';
    } else {
      // Error al configurar la petición
      console.error('Error al configurar la petición:', error.message);
    }
    
    return Promise.reject(errorResponse);
  }
);

export default apiClient; 