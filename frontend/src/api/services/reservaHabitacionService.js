import apiClient from '../client';
import { ENDPOINTS } from '../config';

const reservaHabitacionService = {
  /**
   * Crear una nueva reserva de habitación
   * @param {Object} reservaData - Datos de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  crearReserva: async (reservaData) => {
    return apiClient.post(ENDPOINTS.RESERVAS_HABITACIONES.ALL, reservaData);
  },
  
  /**
   * Obtener todas las reservas de habitaciones (admin) o las del usuario actual
   * @param {Object} query - Parámetros de consulta (opcionales)
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  obtenerReservas: async (query = {}) => {
    const queryString = new URLSearchParams(query).toString();
    const endpoint = queryString ? `${ENDPOINTS.RESERVAS_HABITACIONES.ALL}?${queryString}` : ENDPOINTS.RESERVAS_HABITACIONES.ALL;
    
    return apiClient.get(endpoint);
  },
  
  /**
   * Obtener una reserva de habitación por ID
   * @param {string} id - ID de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  obtenerReserva: async (id) => {
    return apiClient.get(ENDPOINTS.RESERVAS_HABITACIONES.SINGLE(id));
  },
  
  /**
   * Actualizar una reserva de habitación
   * @param {string} id - ID de la reserva
   * @param {Object} reservaData - Datos actualizados de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  actualizarReserva: async (id, reservaData) => {
    return apiClient.put(ENDPOINTS.RESERVAS_HABITACIONES.SINGLE(id), reservaData);
  },
  
  /**
   * Eliminar una reserva de habitación
   * @param {string} id - ID de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  eliminarReserva: async (id) => {
    return apiClient.delete(ENDPOINTS.RESERVAS_HABITACIONES.SINGLE(id));
  },
  
  /**
   * Comprobar disponibilidad de habitaciones
   * @param {Object} params - Parámetros para comprobar disponibilidad
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  comprobarDisponibilidad: async (params) => {
    return apiClient.post(ENDPOINTS.RESERVAS_HABITACIONES.DISPONIBILIDAD, params);
  }
};

export default reservaHabitacionService; 