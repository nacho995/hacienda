import apiClient from './apiClient';

/**
 * Obtiene todos los servicios disponibles
 * @returns {Promise<Array>} Lista de servicios
 */
export const getAllServicios = async () => {
  try {
    const response = await apiClient.get('/servicios');
    // Verificar si la respuesta tiene la estructura esperada
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    }
    // Si la respuesta es un array directamente
    if (Array.isArray(response)) {
      return response;
    }
    console.warn('Formato de respuesta inesperado:', response);
    return [];
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    throw error;
  }
};

/**
 * Obtiene un servicio específico por su ID
 * @param {string} id - ID del servicio
 * @returns {Promise<Object>} Datos del servicio
 */
export const getServicioById = async (id) => {
  try {
    const response = await apiClient.get(`/servicios/${id}`);
    // Verificar si la respuesta tiene la estructura esperada
    if (response && response.success && response.data) {
      return response.data;
    }
    // Si la respuesta es un objeto directamente
    if (response && !response.success) {
      return response;
    }
    console.warn('Formato de respuesta inesperado:', response);
    return null;
  } catch (error) {
    console.error(`Error al obtener servicio con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene servicios recomendados para un tipo de evento específico
 * @param {string} tipoEvento - Tipo de evento (ej: 'Boda', 'Evento Corporativo')
 * @returns {Promise<Array>} Lista de servicios recomendados
 */
export const getServiciosPorEvento = async (tipoEvento) => {
  try {
    const response = await apiClient.get(`/servicios/por-evento/${tipoEvento}`);
    // Verificar si la respuesta tiene la estructura esperada
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    }
    // Si la respuesta es un array directamente
    if (Array.isArray(response)) {
      return response;
    }
    console.warn('Formato de respuesta inesperado:', response);
    return [];
  } catch (error) {
    console.error(`Error al obtener servicios para evento ${tipoEvento}:`, error);
    throw error;
  }
};
