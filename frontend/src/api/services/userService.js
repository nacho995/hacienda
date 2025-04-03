import apiClient from '../client';
import { ENDPOINTS } from '../config';

const userService = {
  /**
   * Obtener todos los usuarios (solo para administradores)
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  getAllUsers: async () => {
    return apiClient.get(ENDPOINTS.USERS.ALL);
  },
  
  /**
   * Obtener un usuario por ID (solo para administradores)
   * @param {string} id - ID del usuario
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  getSingleUser: async (id) => {
    return apiClient.get(ENDPOINTS.USERS.SINGLE(id));
  },
  
  /**
   * Obtener el perfil del usuario actual
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  getMe: async () => {
    return apiClient.get(ENDPOINTS.USERS.ME);
  },
  
  /**
   * Actualizar un usuario
   * @param {string} id - ID del usuario
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  updateUser: async (id, userData) => {
    return apiClient.put(ENDPOINTS.USERS.SINGLE(id), userData);
  },
  
  /**
   * Eliminar un usuario (solo para administradores)
   * @param {string} id - ID del usuario
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  deleteUser: async (id) => {
    return apiClient.delete(ENDPOINTS.USERS.SINGLE(id));
  }
};

export default userService; 