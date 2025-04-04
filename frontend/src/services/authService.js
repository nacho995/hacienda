import apiClient from './apiClient';

class AuthService {
  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });

      if (response.success && response.token) {
        // Limpiar cualquier sesión anterior antes de guardar la nueva
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        // Guardar el token y los datos del usuario recibidos del backend
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Devolver solo los datos relevantes para el AuthContext
        return {
          success: true,
          data: response.user
        };
      } else {
        return { 
          success: false, 
          message: response.message || 'Credenciales incorrectas' 
        };
      }
    } catch (error) {
      console.error('Error de autenticación:', error.message || error);
      return {
        success: false,
        message: error.message || 'Error de conexión al intentar iniciar sesión'
      };
    }
  }
  
  // Registrar nuevo usuario
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Error al registrar usuario:', error.message || error);
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
      
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.error('Error al cerrar sesión en el servidor:', error.message || error);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message || error);
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
      console.error('Error al decodificar token:', error.message || error);
      return null;
    }
  }
  
  // Obtener usuario actual (VALIDA SIEMPRE CONTRA BACKEND /auth/me)
  async getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }

    // Verificar token localmente (formato y expiración)
    const tokenData = this.decodeToken(token);
    if (!tokenData) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }
    if (tokenData.exp && tokenData.exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }

    // Si el token local es válido, SIEMPRE intentar validar con el backend
    try {
      const response = await apiClient.get('/auth/me');
      if (response.success && response.data) {
         // Si el backend confirma, actualizar datos en localStorage y devolverlos
         localStorage.setItem('user', JSON.stringify(response.data));
         return response.data;
      } else {
         // Si /auth/me falla o no devuelve datos (incluso con token localmente válido)
         localStorage.removeItem('authToken');
         localStorage.removeItem('user');
         return null;
      }
    } catch (error) {
      console.error('Error al validar sesión:', error.message || error);
      return null;
    }
  }
}

export default new AuthService(); 