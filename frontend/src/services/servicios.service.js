import apiClient from './apiClient';

/**
 * Obtiene todos los servicios disponibles
 * @returns {Promise<{success: boolean, data: Array, message?: string}>} 
 */
export const getAllServicios = async () => {
  try {
    const response = await apiClient.get('/api/servicios');
    console.log('Respuesta API /api/servicios:', response); // Log para depurar

    // El interceptor de apiClient usualmente ya devuelve { success, data } o lanza error
    // Si la respuesta directa del interceptor es lo que necesitamos:
    if (response && typeof response.success === 'boolean') {
       // Asegurarse de que data sea un array
       if (!Array.isArray(response.data)) {
          console.warn('La propiedad data no es un array en la respuesta de /api/servicios:', response);
          return { success: false, data: [], message: 'Formato de datos inesperado.' };
       }
       return response; // Devolver el objeto { success, data } directamente
    }
    
    // Fallback por si la respuesta no viene formateada por el interceptor
    if (Array.isArray(response)) {
      console.log('Respuesta de /api/servicios es un array, envolviendo...');
      return { success: true, data: response };
    }

    console.warn('Formato de respuesta inesperado de /api/servicios:', response);
    return { success: false, data: [], message: 'Formato de respuesta inesperado.' };

  } catch (error) {
    console.error('Error en getAllServicios:', error.response || error);
    // Devolver un objeto de error consistente
    return { 
      success: false, 
      data: [],
      message: error.response?.data?.message || error.message || 'Error al obtener los servicios'
    };
  }
};

/**
 * Obtiene un servicio específico por su ID
 * @param {string} id - ID del servicio
 * @returns {Promise<{success: boolean, data: Object | null, message?: string}>}
 */
export const getServicioById = async (id) => {
  try {
    const response = await apiClient.get(`/api/servicios/${id}`);
    if (response && typeof response.success === 'boolean') {
      return response; // Asumiendo que apiClient devuelve { success, data: objeto }
    }
     console.warn(`Formato de respuesta inesperado para /api/servicios/${id}:`, response);
     return { success: false, data: null, message: 'Formato de respuesta inesperado.' };
  } catch (error) {
    console.error(`Error en getServicioById ${id}:`, error.response || error);
    return { 
      success: false, 
      data: null,
      message: error.response?.data?.message || error.message || 'Error al obtener el servicio'
    };
  }
};

/**
 * Obtiene servicios recomendados para un tipo de evento específico
 * @param {string} tipoEvento - Tipo de evento
 * @returns {Promise<{success: boolean, data: Array, message?: string}>}
 */
export const getServiciosPorEvento = async (tipoEvento) => {
  try {
    const response = await apiClient.get(`/api/servicios/por-evento/${tipoEvento}`);
     if (response && typeof response.success === 'boolean') {
        if (!Array.isArray(response.data)) {
          console.warn('La propiedad data no es un array en la respuesta de /api/servicios/por-evento:', response);
          return { success: false, data: [], message: 'Formato de datos inesperado.' };
       }
       return response;
    }
     if (Array.isArray(response)) {
      return { success: true, data: response };
    }
    console.warn(`Formato de respuesta inesperado para /api/servicios/por-evento/${tipoEvento}:`, response);
    return { success: false, data: [], message: 'Formato de respuesta inesperado.' };
  } catch (error) {
    console.error(`Error en getServiciosPorEvento ${tipoEvento}:`, error.response || error);
    return { 
      success: false, 
      data: [],
      message: error.response?.data?.message || error.message || 'Error al obtener servicios recomendados'
    };
  }
};
