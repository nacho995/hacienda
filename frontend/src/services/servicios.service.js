import apiClient from './apiClient';

/**
 * Obtiene todos los servicios disponibles
 * @returns {Promise<Array>} Lista de servicios
 */
export const getAllServicios = async () => {
  try {
    const response = await apiClient.get('/servicios');
    return response.data || [];
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
    return response.data || null;
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
    return response.data || [];
  } catch (error) {
    console.error(`Error al obtener servicios para evento ${tipoEvento}:`, error);
    throw error;
  }
};
