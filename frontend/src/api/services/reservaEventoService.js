import apiClient from '../client';
import { ENDPOINTS } from '../config';

const reservaEventoService = {
  /**
   * Crear una nueva reserva de evento
   * @param {Object} reservaData - Datos de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  crearReserva: async (reservaData) => {
    return apiClient.post(ENDPOINTS.RESERVAS_EVENTOS.ALL, reservaData);
  },
  
  /**
   * Obtener todas las reservas de eventos (admin) o las del usuario actual
   * @param {Object} query - Parámetros de consulta (opcionales)
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  obtenerReservas: async (query = {}) => {
    const queryString = new URLSearchParams(query).toString();
    const endpoint = queryString ? `${ENDPOINTS.RESERVAS_EVENTOS.ALL}?${queryString}` : ENDPOINTS.RESERVAS_EVENTOS.ALL;
    
    return apiClient.get(endpoint);
  },
  
  /**
   * Obtener una reserva de evento por ID
   * @param {string} id - ID de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  obtenerReserva: async (id) => {
    return apiClient.get(ENDPOINTS.RESERVAS_EVENTOS.SINGLE(id));
  },
  
  /**
   * Actualizar una reserva de evento
   * @param {string} id - ID de la reserva
   * @param {Object} reservaData - Datos actualizados de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  actualizarReserva: async (id, reservaData) => {
    return apiClient.put(ENDPOINTS.RESERVAS_EVENTOS.SINGLE(id), reservaData);
  },
  
  /**
   * Eliminar una reserva de evento
   * @param {string} id - ID de la reserva
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  eliminarReserva: async (id) => {
    return apiClient.delete(ENDPOINTS.RESERVAS_EVENTOS.SINGLE(id));
  },
  
  /**
   * Comprobar disponibilidad para eventos
   * @param {Object} params - Parámetros para comprobar disponibilidad
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  comprobarDisponibilidad: async (params) => {
    return apiClient.post(ENDPOINTS.RESERVAS_EVENTOS.DISPONIBILIDAD, params);
  }
};

export default reservaEventoService; 