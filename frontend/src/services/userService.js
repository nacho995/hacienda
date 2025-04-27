import apiClient from './apiClient';

/**
 * Servicio para gestionar usuarios en la aplicación
 */
const userService = {
  /**
   * Obtener todos los usuarios (solo para administradores)
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  getAllUsers: async () => {
    try {
      // No se puede usar la cabecera Referer porque los navegadores no permiten modificarla manualmente
      const response = await apiClient.get('/api/users', {
        params: {
          from_admin: true
        }
      });
      return response;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },
  
  /**
   * Obtener un usuario por ID (solo para administradores)
   * @param {string} id - ID del usuario
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  getSingleUser: async (id) => {
    try {
      const response = await apiClient.get(`/api/users/${id}`, {
        params: {
          from_admin: true
        }
      });
      return response;
    } catch (error) {
      console.error(`Error obteniendo usuario ${id}:`, error);
      return { success: false, data: null, message: 'Error al obtener usuario' };
    }
  },
  
  /**
   * Obtener el perfil del usuario actual
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  getMe: async () => {
    try {
      const response = await apiClient.get('/api/users/me');
      return response;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return { success: false, data: null, message: 'Error al obtener perfil' };
    }
  },
  
  /**
   * Actualizar un usuario
   * @param {string} id - ID del usuario
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/api/users/${id}`, userData);
      return response;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },
  
  /**
   * Eliminar un usuario (solo para administradores)
   * @param {string} id - ID del usuario
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/api/users/${id}`, {
        params: {
          from_admin: true
        }
      });
      return response;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  },

  // Crear un nuevo usuario
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/api/users', {
        ...userData,
        from_admin: true
      });
      return response;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  // Cambiar contraseña de usuario
  updatePassword: async (userId, passwordData) => {
    try {
      const response = await apiClient.put(
        `/api/users/${userId}/password`,
        passwordData
      );
      return response;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    }
  },

  // Obtener un usuario específico
  getUser: async (userId) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}`, {
        params: {
          from_admin: true
        }
      });
      return response;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }
};

export default userService; 