import axios from 'axios';

// Determinar la URL base según el entorno
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar tokens en las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token de sesión desde cookies si existe
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('adminSession='));
    
    if (sessionCookie) {
      const sessionValue = sessionCookie.split('=')[1];
      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionValue));
        // Si hay un token en la sesión, añadirlo a los headers
        if (sessionData && sessionData.token) {
          config.headers.Authorization = `Bearer ${sessionData.token}`;
        }
      } catch (e) {
        console.error('Error procesando cookie de sesión:', e);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    // Procesar respuestas exitosas
    return response;
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
      errorResponse.message = error.response.data.message || 'Error en la petición';
      errorResponse.data = error.response.data;
      
      // Manejar errores específicos
      if (error.response.status === 401) {
        // Sesión caducada o no autenticada
        document.cookie = 'adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        
        // Redirigir a login si no estamos ya en la página de login
        if (typeof window !== 'undefined' && 
            !window.location.pathname.includes('/admin/login') && 
            !window.location.pathname.includes('/admin/registro')) {
          window.location.href = '/admin/login';
        }
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      errorResponse.message = 'No se recibió respuesta del servidor';
    }
    
    return Promise.reject(errorResponse);
  }
);

export default apiClient; 