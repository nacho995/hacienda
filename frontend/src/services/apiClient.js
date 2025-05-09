import axios from 'axios';
import Cookies from 'js-cookie';

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Nueva lógica para BASE_URL
const RAW_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!RAW_BACKEND_URL) {
  console.error("Error Fatal: La variable de entorno NEXT_PUBLIC_API_URL no está definida.");
  // Opcional: Lanza un error para detener la ejecución si la URL no está configurada
  // throw new Error("La variable de entorno NEXT_PUBLIC_API_URL es obligatoria y no está definida.");
}

// Asegúrate de que la URL base para Axios termine en /api
// Si RAW_BACKEND_URL es "http://dominio.com", BASE_URL será "http://dominio.com/api"
// Si RAW_BACKEND_URL es "http://dominio.com/", BASE_URL también será "http://dominio.com/api"
const BASE_URL = `${RAW_BACKEND_URL.replace(/\/$/, '')}/api`;

console.log('API Base URL configurada para Axios:', BASE_URL); // Log para verificar

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000 // 10 segundos de timeout
});

// Verificar la configuración de la instancia
// console.log('apiClient baseURL configurada:', apiClient.defaults.baseURL);

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

// Determinar si la ruta es pública (no requiere autenticación)
const isPublicRoute = (url) => {
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/password-reset',
    '/auth/verify-email',
    '/eventos/disponibilidad',
    '/reservas/eventos/disponibilidad',
    '/servicios',
    '/servicios/por-evento'
  ];
  
  return publicRoutes.some(route => url.includes(route));
};

// Interceptor para manejar tokens en las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // console.log('Realizando petición a:', config.url);
    // console.log('URL completa:', `${config.baseURL}${config.url}`);
    // console.log('Método:', config.method?.toUpperCase());
    
    // Si es una ruta pública, no es necesario el token
    if (isPublicRoute(config.url)) {
      // console.log('Ruta pública, no se requiere token');
      return config;
    }
    
    // Obtener token JWT desde localStorage
    const token = localStorage.getItem('authToken');
    // console.log('Token encontrado:', token ? 'Sí' : 'No');
    
    if (token) {
      // Verificar si el token es válido decodificándolo
      const tokenData = safelyDecodeToken(token);
      // console.log('Token decodificado:', tokenData ? 'Válido' : 'Inválido');
      
      if (!tokenData) {
        // console.log('Token inválido, limpiando localStorage');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (!isPublicRoute(config.url)) {
          const authErrorEvent = new CustomEvent('auth-error', { 
            detail: { status: 401, message: 'Token inválido' } 
          });
          window.dispatchEvent(authErrorEvent);
        }
      } else if (tokenData.exp && tokenData.exp < Math.floor(Date.now() / 1000)) {
        // console.log('Token expirado, limpiando localStorage');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (!isPublicRoute(config.url)) {
          const authErrorEvent = new CustomEvent('auth-error', { 
            detail: { status: 401, message: 'Sesión expirada' } 
          });
          window.dispatchEvent(authErrorEvent);
        }
      } else {
        // console.log('>>> INTERCEPTOR: Token válido y no expirado. Añadiendo cabecera Authorization...'); 
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

// Configurar interceptor de respuesta para manejar transformación de datos y errores
apiClient.interceptors.response.use(
  (response) => {
    // console.log('Respuesta exitosa de:', response.config.url);
    // console.log('Datos:', response.data);
    
    // Mantener la estructura original de la respuesta
    if (response.data && typeof response.data === 'object') {
      return response.data;
    }
    
    // Si la respuesta no tiene la estructura esperada, devolverla como está
    return response.data;
  },
  (error) => {
    const errorResponse = {
      success: false,
      message: 'Error de conexión con el servidor',
      status: 500,
      data: null
    };
    
    // No mostrar ciertos errores en la consola para silenciar mensajes repetitivos
    const silentPaths = [
      /\/reservas\/habitaciones\/[a-zA-Z0-9]+$/,
      /\/reservas\/masajes\/[a-zA-Z0-9]+$/
    ];
     
    // Comprobar si la URL coincide con alguno de los patrones silenciosos
    const shouldSilence = error.config && silentPaths.some(pattern => 
      pattern.test(error.config.url) && error.response && error.response.status === 404
    );
    
    if (error.response) {
      errorResponse.status = error.response.status;
      errorResponse.message = error.response.data?.message || 'Error en la petición';
      errorResponse.data = error.response.data;
      
      // Solo mostrar errores en la consola si no deben ser silenciados
      if (!shouldSilence) {
        console.error(`Error ${error.response.status} en petición a: ${error.config?.baseURL}${error.config?.url}`);
        // console.error('Detalles del error:', error.response.data);
        // console.error('Headers de la solicitud:', error.config?.headers);
        // console.error('Datos enviados:', error.config?.data);
      }
      
      // Manejo específico por código de error
      switch (error.response.status) {
        case 400:
          if (!shouldSilence) {
            console.error('Error 400 - Datos inválidos:', error.config?.data);
            // try {
            //   const sentData = JSON.parse(error.config.data);
            //   console.log('Datos enviados en detalle:', sentData);
            // } catch (e) {
            //   console.error('No se pudo parsear los datos enviados:', e);
            // }
          }
          break;
          
        case 401:
          if (!error.config?.url || !isPublicRoute(error.config.url)) {
            // console.log('Error de autenticación, limpiando localStorage');
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
          break;
          
        case 403:
          if (!shouldSilence) {
            console.error('Error 403 - No autorizado para esta acción');
          }
          errorResponse.message = 'No tienes permiso para realizar esta acción';
          break;
          
        case 404:
          if (!shouldSilence) {
            console.error('Error 404 - Recurso no encontrado:', error.config?.url);
          }
          errorResponse.message = 'El recurso solicitado no existe';
          break;
          
        case 500:
          if (!shouldSilence) {
            console.error('Error 500 - Error del servidor:', error.response?.data);
            // Mostrar detalles adicionales si están disponibles
            // if (error.response?.data?.error) {
            //   console.error('Detalles técnicos del error:', error.response.data.error);
            // }
          }
          errorResponse.message = 'Error interno del servidor. Por favor, contacte al administrador.';
          if (error.response?.data?.error) {
            errorResponse.details = error.response.data.error;
          }
          break;
          
        default:
          if (!shouldSilence) {
            console.error(`Error ${error.response.status} no manejado específicamente`);
          }
      }
    } else if (error.code === 'ECONNABORTED') {
      errorResponse.message = 'La petición ha tardado demasiado tiempo. Por favor, inténtelo de nuevo.';
      console.error(`Timeout en la petición a: ${error.config?.baseURL}${error.config?.url}`, error);
    } else {
      console.error('Error de red:', error.message);
      // console.error('Error completo:', error);
    }
    
    return Promise.reject(errorResponse);
  }
);

export default apiClient; 