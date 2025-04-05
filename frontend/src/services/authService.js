import apiClient from './apiClient';

class AuthService {
  // Iniciar sesión
  async login(email, password) {
    try {
      console.log('Intentando iniciar sesión con:', { email });
      
      // Utilizamos la ruta sin el prefijo /api
      const response = await apiClient.post('/auth/login', { email, password });
      console.log('Respuesta de login exitosa:', response);

      if (response.success && response.token) {
        // Limpiar cualquier sesión anterior antes de guardar la nueva
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        // Guardar el token y los datos del usuario recibidos del backend
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        console.log('Token guardado y usuario almacenado en localStorage');
        
        // Devolver solo los datos relevantes para el AuthContext
        return {
          success: true,
          data: response.user,
          token: response.token
        };
      } else {
        console.warn('Login falló sin error explícito:', response);
        return { 
          success: false, 
          message: response.message || 'Credenciales incorrectas' 
        };
      }
    } catch (error) {
      console.error('Error de autenticación:', error.message || 'Error de conexión con el servidor');
      console.error('Detalles completos del error:', error);
      
      // Verificar si es un error de red (sin conexión al servidor)
      if (error.message === 'Error de conexión con el servidor') {
        return {
          success: false,
          message: 'No se pudo conectar al servidor. Verifique su conexión a internet o inténtelo más tarde.'
        };
      }
      
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
  
  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No hay token en localStorage');
        return null;
      }

      // Verificar token localmente (formato y expiración)
      const tokenData = this.decodeToken(token);
      if (!tokenData) {
        console.log('Token inválido (no se pudo decodificar)');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return null;
      }
      if (tokenData.exp && tokenData.exp < Math.floor(Date.now() / 1000)) {
        console.log('Token expirado');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return null;
      }

      // Si hay un usuario en localStorage y el token es válido localmente, devolverlo primero
      const cachedUser = localStorage.getItem('user');
      let userData = null;
      
      try {
        userData = cachedUser ? JSON.parse(cachedUser) : null;
      } catch (e) {
        console.error('Error al parsear datos de usuario en localStorage:', e);
      }

      // Intentar validar con el backend con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
      
      try {
        const response = await apiClient.get('/auth/me', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.success && response.data) {
          // Si el backend confirma, actualizar datos en localStorage y devolverlos
          localStorage.setItem('user', JSON.stringify(response.data));
          return response.data;
        } else {
          // Si /auth/me falla pero tenemos usuario en cache y token válido, usar el cache temporalmente
          if (userData && tokenData) {
            console.log('Usando datos de usuario en caché mientras se resuelven problemas de conexión');
            return userData;
          }
          
          // Si no hay datos en caché, limpiar todo
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          return null;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error al validar sesión con el backend:', error.message || error);
        
        // Si el error es de timeout o red, pero tenemos datos en caché y token válido, usar el caché
        if ((error.name === 'AbortError' || error.message.includes('network') || error.code === 'ECONNREFUSED') 
            && userData && tokenData) {
          console.log('Usando datos de usuario en caché mientras se resuelven problemas de conexión');
          return userData;
        }
        
        return null;
      }
    } catch (error) {
      console.error('Error general al validar sesión:', error.message || error);
      return null;
    }
  }

  // Solicitar restablecimiento de contraseña
  async forgotPassword(email) {
    try {
      console.log('Solicitando restablecimiento de contraseña para:', email);
      
      const response = await apiClient.post('/auth/password/forgot', { email });
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña'
        };
      } else {
        return {
          success: false,
          message: response.message || 'No se pudo procesar la solicitud de restablecimiento'
        };
      }
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      return {
        success: false,
        message: error.message || 'Error al procesar la solicitud de restablecimiento'
      };
    }
  }

  // Resetear contraseña con token
  async resetPassword(token, password) {
    try {
      console.log('Restableciendo contraseña con token');
      
      const response = await apiClient.put(`/auth/password/reset/${token}`, { password });
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Contraseña restablecida exitosamente'
        };
      } else {
        return {
          success: false,
          message: response.message || 'No se pudo restablecer la contraseña'
        };
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      return {
        success: false,
        message: error.message || 'Error al restablecer la contraseña'
      };
    }
  }
}

export default new AuthService(); 