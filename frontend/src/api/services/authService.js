import apiClient from '../client';
import { ENDPOINTS } from '../config';

const authService = {
  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  register: async (userData) => {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
  },
  
  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales (email, password)
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  login: async (credentials) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.success && response.token) {
      console.log('Token recibido en login:', response.token);
      apiClient.setToken(response.token);
      
      // Guardar información del usuario en el localStorage
      if (typeof window !== 'undefined' && response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    
    return response;
  },
  
  /**
   * Cerrar sesión
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  logout: async () => {
    const response = await apiClient.get(ENDPOINTS.AUTH.LOGOUT);
    
    // Eliminar token y datos del usuario
    apiClient.removeToken();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    
    return response;
  },
  
  /**
   * Confirmar cuenta de usuario
   * @param {string} token - Token de confirmación
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  confirmAccount: async (token) => {
    return apiClient.get(`${ENDPOINTS.AUTH.CONFIRM}/${token}`);
  },
  
  /**
   * Obtener usuario actual
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  getMe: async () => {
    return apiClient.get(ENDPOINTS.AUTH.ME);
  },
  
  /**
   * Registrar un nuevo administrador (solo para administradores)
   * @param {Object} userData - Datos del administrador a registrar
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  registerAdmin: async (userData) => {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER_ADMIN, userData);
  },
  
  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} True si está autenticado, false en caso contrario
   */
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    
    const token = apiClient.getToken();
    return !!token;
  },
  
  /**
   * Obtener datos del usuario actual desde localStorage
   * @returns {Object|null} Datos del usuario o null si no está autenticado
   */
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },
  
  /**
   * Verificar si el usuario actual es administrador
   * @returns {boolean} True si es administrador, false en caso contrario
   */
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'admin';
  }
};

export default authService; 