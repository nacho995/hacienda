// Servicio para gestionar las reservas
import axios from 'axios';
import apiClient from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Obtiene las fechas que ya están reservadas
 * @returns {Promise<Array<string>>} Array de fechas en formato YYYY-MM-DD
 */
export const obtenerFechasReservadas = async () => {
  try {
    const response = await axios.get(`${API_URL}/reservas/fechas-reservadas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener fechas reservadas:', error);
    return [];
  }
};

/**
 * Verifica si una fecha específica está disponible
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<boolean>} true si está disponible, false si ya está reservada
 */
export const verificarDisponibilidadFecha = async (fecha) => {
  try {
    const response = await axios.get(`${API_URL}/reservas/verificar-disponibilidad`, {
      params: { fecha }
    });
    return response.data.disponible;
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    // En caso de error, asumimos que no está disponible por precaución
    return false;
  }
};

/**
 * Crea una nueva reserva de evento
 * @param {Object} reservaData - Datos de la reserva
 * @returns {Promise<Object>} Datos de la reserva creada
 */
export const crearReservaEvento = async (reservaData) => {
  try {
    const response = await axios.post(`${API_URL}/reservas/eventos`, reservaData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al crear la reserva'
    };
  }
};

/**
 * Obtiene todas las reservas de eventos
 * @returns {Promise<Array>} Lista de reservas
 */
export const obtenerReservasEvento = async () => {
  try {
    const response = await apiClient.get('/reservas/eventos');
    return response;
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    throw error;
  }
};

/**
 * Obtiene una reserva específica por su ID
 * @param {string} id - ID de la reserva
 * @returns {Promise<Object>} Datos de la reserva
 */
export const obtenerReservaEvento = async (id) => {
  try {
    const response = await apiClient.get(`/reservas/eventos/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al obtener la reserva:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener los detalles de la reserva'
    };
  }
};

/**
 * Actualiza una reserva de evento existente por su ID
 * @param {string} id - ID de la reserva de evento
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Respuesta de la API
 */
export const actualizarReservaEvento = async (id, updateData) => {
  try {
    const response = await apiClient.put(`/reservas/eventos/${id}`, updateData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al actualizar la reserva de evento:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al actualizar la reserva de evento'
    };
  }
};

/**
 * Actualiza una reserva de habitación específica por su ID
 * @param {string} habitacionId - ID de la reserva de habitación
 * @param {Object} updateData - Datos a actualizar (ej: { fechaEntrada, fechaSalida, numHuespedes, nombreHuespedes })
 * @returns {Promise<Object>} Respuesta de la API
 */
export const actualizarReservaHabitacion = async (habitacionId, updateData) => {
  try {
    // Asegurarse de que solo enviamos los campos permitidos y necesarios
    const validUpdateData = {};
    if (updateData.hasOwnProperty('fechaEntrada')) validUpdateData.fechaEntrada = updateData.fechaEntrada;
    if (updateData.hasOwnProperty('fechaSalida')) validUpdateData.fechaSalida = updateData.fechaSalida;
    if (updateData.hasOwnProperty('numHuespedes')) validUpdateData.numHuespedes = updateData.numHuespedes;
    if (updateData.hasOwnProperty('nombreHuespedes')) validUpdateData.nombreHuespedes = updateData.nombreHuespedes;
    // Añadir otros campos si fueran editables desde aquí

    const response = await apiClient.put(`/reservas/habitaciones/${habitacionId}`, validUpdateData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al actualizar la reserva de habitación:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al actualizar la habitación'
    };
  }
};

/**
 * Obtiene los datos públicos de una reserva (evento o habitación) por su ID
 * @param {string} id - ID de la reserva
 * @returns {Promise<Object>} Datos públicos de la reserva
 */
export const obtenerReservaPublica = async (id) => {
  try {
    // Llama al endpoint público usando apiClient
    const response = await apiClient.get(`/public/reserva/${id}`);
    // apiClient ya debería devolver { success: true, data: ... } o lanzar un error
    return response;
  } catch (error) {
    console.error(`Error al obtener la reserva pública ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener los detalles de la reserva'
    };
  }
};
