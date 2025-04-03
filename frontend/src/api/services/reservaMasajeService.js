import apiClient from '../client';
import { ENDPOINTS } from '../config';

const reservaMasajeService = {
  /**
   * Crear una nueva reserva de masaje
   * @param {Object} reservaData - Datos de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  crearReserva: async (reservaData) => {
    return apiClient.post(ENDPOINTS.RESERVAS_MASAJES.ALL, reservaData);
  },
  
  /**
   * Obtener todas las reservas de masajes (admin) o las del usuario actual
   * @param {Object} query - Parámetros de consulta (opcionales)
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  obtenerReservas: async (query = {}) => {
    const queryString = new URLSearchParams(query).toString();
    const endpoint = queryString ? `${ENDPOINTS.RESERVAS_MASAJES.ALL}?${queryString}` : ENDPOINTS.RESERVAS_MASAJES.ALL;
    
    return apiClient.get(endpoint);
  },
  
  /**
   * Obtener una reserva de masaje por ID
   * @param {string} id - ID de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  obtenerReserva: async (id) => {
    return apiClient.get(ENDPOINTS.RESERVAS_MASAJES.SINGLE(id));
  },
  
  /**
   * Actualizar una reserva de masaje
   * @param {string} id - ID de la reserva
   * @param {Object} reservaData - Datos actualizados de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  actualizarReserva: async (id, reservaData) => {
    return apiClient.put(ENDPOINTS.RESERVAS_MASAJES.SINGLE(id), reservaData);
  },
  
  /**
   * Eliminar una reserva de masaje
   * @param {string} id - ID de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  eliminarReserva: async (id) => {
    return apiClient.delete(ENDPOINTS.RESERVAS_MASAJES.SINGLE(id));
  },
  
  /**
   * Comprobar disponibilidad para masajes
   * @param {Object} params - Parámetros para comprobar disponibilidad
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  comprobarDisponibilidad: async (params) => {
    return apiClient.post(ENDPOINTS.RESERVAS_MASAJES.DISPONIBILIDAD, params);
  }
};

export default reservaMasajeService; 