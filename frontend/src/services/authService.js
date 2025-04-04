import apiClient from './apiClient';

class AuthService {
  // Iniciar sesión
  async login(email, password) {
    // --- INICIO LÓGICA SIMPLIFICADA (Solo API) ---
    console.log('Intentando login con API:', { email });
    try {
      const response = await apiClient.post('/auth/login', { email, password });

      if (response.success && response.token) {
        // Limpiar cualquier sesión anterior antes de guardar la nueva
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        // Guardar el token y los datos del usuario recibidos del backend
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        console.log('Token JWT real del backend guardado en localStorage');

        // Devolver solo los datos relevantes para el AuthContext
        return {
          success: true,
          data: response.user // Devolver el objeto user recibido
        };
      } else {
        console.log('Login API fallido:', response.message);
        return { success: false, message: response.message || 'Credenciales incorrectas desde API' };
      }
    } catch (error) {
      console.error('Error en llamada API login:', error);
      // El interceptor de apiClient ya maneja el log y evento de error 401
      return {
        success: false,
        // Usar el mensaje del error rechazado por apiClient si existe
        message: error.message || 'Error de conexión al intentar iniciar sesión'
      };
    }
    // --- FIN LÓGICA SIMPLIFICADA ---
  }
  
  // Registrar nuevo usuario
  async register(userData) {
    try {
      // En este momento, simulamos el registro
      // Esto será reemplazado por una llamada a la API cuando esté listo
      
      console.log('Datos de registro recibidos:', userData);
      
      // Simular éxito del registro tras verificar datos básicos
      if (!userData.email || !userData.password || !userData.nombre) {
        return {
          success: false,
          message: 'Faltan datos obligatorios'
        };
      }
      
      // Simular demora de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Solicitud de registro enviada correctamente. Un administrador revisará tu cuenta pronto.'
      };
      
      // Cuando el backend esté listo, usar esto:
      // const response = await apiClient.post('/auth/register', userData);
      // return response.data;
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: error.message || 'Error al registrar usuario'
      };
    }
  }
  
  // Cerrar sesión
  async logout() {
    try {
      // Eliminar token y datos del usuario de localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return {
        success: true
      };
      
      // Cuando el backend esté listo, usar esto:
      // try {
      //   await apiClient.post('/auth/logout');
      // } catch (error) {
      //   console.warn('Error al cerrar sesión en el servidor', error);
      // } finally {
      //   localStorage.removeItem('authToken');
      //   localStorage.removeItem('user');
      //   return { success: true };
      // }
    } catch (error) {
      console.error('Error en logout:', error);
      // Asegurar que se limpie el localStorage incluso si hay error
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return {
        success: false,
        message: error.message || 'Error al cerrar sesión'
      };
    }
  }
  
  // Decodificar un token Base64 de forma segura
  decodeToken(token) {
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
  }
  
  // Obtener usuario actual (VALIDA SIEMPRE CONTRA BACKEND /auth/me)
  async getCurrentUser() {
    console.log('getCurrentUser: Verificando token local...');
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('getCurrentUser: No hay token almacenado.');
      return null;
    }

    // Verificar token localmente (formato y expiración)
    const tokenData = this.decodeToken(token);
    if (!tokenData) {
      console.error('getCurrentUser: Token local inválido, limpiando.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }
    if (tokenData.exp && tokenData.exp < Math.floor(Date.now() / 1000)) {
      console.log('getCurrentUser: Token local expirado, limpiando.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }

    // Si el token local es válido, SIEMPRE intentar validar con el backend
    console.log('getCurrentUser: Token local válido, intentando validar con API /auth/me...');
    try {
      const response = await apiClient.get('/auth/me');
      if (response.success && response.data) {
         // Si el backend confirma, actualizar datos en localStorage y devolverlos
         localStorage.setItem('user', JSON.stringify(response.data)); // Actualizar con datos frescos
         console.log('getCurrentUser: Validación API exitosa. Usuario:', response.data.email);
         return response.data;
      } else {
         // Si /auth/me falla o no devuelve datos (incluso con token localmente válido)
         console.warn('getCurrentUser: API /auth/me no validó la sesión, limpiando local.');
         localStorage.removeItem('authToken');
         localStorage.removeItem('user');
         return null;
      }
    } catch (error) {
      // Si apiClient.get('/auth/me') falla (ej. 401), el interceptor ya limpiará localStorage.
      // Solo necesitamos asegurarnos de devolver null.
      console.error('getCurrentUser: Error llamando a /auth/me:', error.message || error);
      // No necesitamos limpiar aquí, el interceptor lo hace. Devolvemos null.
      return null;
    }
  }
}

export default new AuthService(); 