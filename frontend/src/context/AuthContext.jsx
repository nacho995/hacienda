'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
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

  // Comprobar si hay un usuario autenticado al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Intentar obtener el usuario actual del servicio
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
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
      const response = await authService.login(email, password);
      
      if (response.success) {
        setUser(response.data);
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Credenciales inválidas' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
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
      await authService.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { success: false, message: 'Error al cerrar sesión' };
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
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext; 