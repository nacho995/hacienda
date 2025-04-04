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
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return { success: false, data: [], message: 'Error al obtener usuarios' };
    }
  },
  
  /**
   * Obtener un usuario por ID (solo para administradores)
   * @param {string} id - ID del usuario
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  getSingleUser: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
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
      const response = await apiClient.get('/users/me');
      return response.data;
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
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error actualizando usuario ${id}:`, error);
      return { success: false, message: 'Error al actualizar usuario' };
    }
  },
  
  /**
   * Eliminar un usuario (solo para administradores)
   * @param {string} id - ID del usuario
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error eliminando usuario ${id}:`, error);
      return { success: false, message: 'Error al eliminar usuario' };
    }
  }
};

export default userService; 