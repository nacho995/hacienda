import apiClient from './apiClient';

class AuthService {
  // Iniciar sesión
  async login(email, password) {
    try {
      // Ejemplo de datos de prueba para administrador
      const ADMIN_USERS = [
        {
          email: 'admin@haciendasancarlos.com',
          password: 'admin123',
          nombre: 'Admin',
          apellidos: 'Principal',
          role: 'admin',
          id: '1'
        }
      ];
      
      console.log('Intentando login con:', { email, password });
      
      // Buscar usuario en datos locales
      const user = ADMIN_USERS.find(u => 
        u.email === email && u.password === password
      );
      
      if (user) {
        console.log('Usuario encontrado:', user);
        
        // Crear objeto de sesión
        const sessionData = {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellidos: user.apellidos,
          role: user.role,
          authenticated: true,
          timestamp: new Date().getTime()
        };
        
        // Convertir a JSON string
        const sessionString = JSON.stringify(sessionData);
        
        // Establecer cookie de sesión (expira en 8 horas)
        document.cookie = `adminSession=${sessionString}; path=/; max-age=${60*60*8}`;
        
        return {
          success: true,
          data: sessionData
        };
      }
      
      console.log('Usuario no encontrado');
      return {
        success: false,
        message: 'Credenciales incorrectas'
      };
      
      // Cuando el backend esté listo, usar esto:
      // const response = await apiClient.post('/auth/login', { email, password });
      // return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión'
      };
    }
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
      // Eliminar cookie de sesión
      document.cookie = 'adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      return {
        success: true
      };
      
      // Cuando el backend esté listo, usar esto:
      // const response = await apiClient.post('/auth/logout');
      // return response.data;
    } catch (error) {
      console.error('Error en logout:', error);
      return {
        success: false,
        message: error.message || 'Error al cerrar sesión'
      };
    }
  }
  
  // Obtener usuario actual
  async getCurrentUser() {
    try {
      // Obtener cookie de sesión
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('adminSession='));
      
      if (!sessionCookie) {
        return null;
      }
      
      // Extraer valor de la cookie
      const sessionValue = sessionCookie.split('=')[1];
      
      // Intentar decodificar la cookie (puede estar codificada en URI)
      let sessionData;
      try {
        sessionData = JSON.parse(decodeURIComponent(sessionValue));
      } catch (e) {
        // Si falla el decodeURIComponent, intentar sin decodificar
        sessionData = JSON.parse(sessionValue);
      }
      
      // Verificar que la sesión sea válida
      if (!sessionData || !sessionData.authenticated) {
        return null;
      }
      
      return sessionData;
      
      // Cuando el backend esté listo, usar esto:
      // const response = await apiClient.get('/auth/me');
      // return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }
}

export default new AuthService(); 