'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import authService from '@/services/authService';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Escuchar eventos de error de autenticación
  useEffect(() => {
    const handleAuthError = (event) => {
      console.log('Evento de error de autenticación recibido:', event.detail);
      
      // Limpiar sesión
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Actualizar estado
      setUser(null);
      setAuthError(event.detail);
      
      // Mostrar notificación
      toast.error(event.detail.message || 'Sesión expirada. Por favor inicie sesión nuevamente.');
    };

    window.addEventListener('auth-error', handleAuthError);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  // Comprobar si hay un usuario autenticado al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Verificando sesión activa...');
        setLoading(true);
        
        // Limpiar cualquier error previo
        setAuthError(null);
        
        // Obtener token del localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('No se encontró token en localStorage');
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Intentar obtener el usuario actual del servicio
        const userData = await authService.getCurrentUser();
        
        if (userData) {
          console.log('Sesión activa encontrada:', userData.email);
          setUser(userData);
        } else {
          console.log('No se encontró una sesión activa o el token expiró');
          // Asegurarse de que no hay datos antiguos
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        
        // Limpiar cualquier dato de sesión
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        
        // Si el error tiene un código específico, establecer el authError
        if (error.status) {
          setAuthError({
            status: error.status,
            message: error.message || 'Error de autenticación'
          });
        } else {
          setAuthError({
            status: 500,
            message: 'Error inesperado al verificar sesión'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Funciones de autenticación
  const login = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // Limpiar cualquier sesión anterior
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        setUser(response.data);
        // Guardar el token en localStorage
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        return { success: true };
      } else {
        setAuthError({
          status: 401,
          message: response.message || 'Credenciales inválidas'
        });
        return { success: false, message: response.message || 'Credenciales inválidas' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      setAuthError({
        status: error.status || 500,
        message: error.message || 'Error al iniciar sesión'
      });
      return { success: false, message: 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const response = await authService.register(userData);
      
      return response;
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, message: 'Error al registrar usuario' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      await authService.logout();
      
      // Limpiar estado
      setUser(null);
      setAuthError(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      
      // Intentar limpiar de todas formas
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      
      return { success: false, message: 'Error al cerrar sesión' };
    } finally {
      setLoading(false);
    }
  };

  // Propiedades calculadas
  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && ['admin', 'admin_confirmado'].includes(user?.role);

  // Valor del contexto
  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    authError,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext; 