import apiClient from './apiClient';

/**
 * Obtiene todos los tipos de evento activos desde el backend.
 * @returns {Promise<{success: boolean, data: Array, message?: string}>}
 */
export const getAllTiposEvento = async () => {
  try {
    console.log("Llamando a apiClient.get('/tipos-evento')");
    const response = await apiClient.get('/tipos-evento');
    console.log("Respuesta API /tipos-evento:", response);

    // El interceptor de apiClient ya debería devolver { success, data }
    if (response && typeof response.success === 'boolean') {
      if (!Array.isArray(response.data)) {
        console.warn('La propiedad data no es un array en la respuesta de /tipos-evento:', response);
        return { success: false, data: [], message: 'Formato de datos inesperado desde tipos-evento.' };
      }
      return response; // Devuelve { success: true, data: [...] }
    }

    // Fallback si la respuesta no viene formateada
    if (Array.isArray(response)) {
      console.log('Respuesta de /tipos-evento es un array, envolviendo...');
      return { success: true, data: response };
    }

    console.warn('Formato de respuesta inesperado de /tipos-evento:', response);
    return { success: false, data: [], message: 'Formato de respuesta inesperado desde tipos-evento.' };

  } catch (error) {
    console.error('Error en getAllTiposEvento:', error.response || error);
    return { 
      success: false, 
      data: [],
      message: error.response?.data?.message || error.message || 'Error al obtener los tipos de evento'
    };
  }
};

// --- NUEVAS FUNCIONES PARA GESTIONAR SERVICIOS POR TIPO DE EVENTO ---

/**
 * Obtiene los servicios asociados a un tipo de evento específico.
 * @param {string} tipoEventoId - El ID del tipo de evento.
 * @returns {Promise<{success: boolean, data: Array, message?: string}>}
 */
export const getServiciosPorTipoEventoId = async (tipoEventoId) => {
  if (!tipoEventoId) {
    return { success: false, data: [], message: 'ID de tipo de evento no proporcionado.' };
  }
  try {
    console.log(`Llamando a apiClient.get('/tipos-evento/${tipoEventoId}/servicios')`);
    const response = await apiClient.get(`/tipos-evento/${tipoEventoId}/servicios`);
    console.log(`Respuesta API /tipos-evento/${tipoEventoId}/servicios:`, response);

    if (response && typeof response.success === 'boolean') {
       if (!Array.isArray(response.data)) {
          console.warn('La propiedad data no es un array en la respuesta de /tipos-evento/:id/servicios:', response);
          return { success: false, data: [], message: 'Formato de datos inesperado.' };
       }
      return response;
    }
    console.warn(`Formato de respuesta inesperado para /tipos-evento/${tipoEventoId}/servicios:`, response);
    return { success: false, data: [], message: 'Formato de respuesta inesperado.' };

  } catch (error) {
    console.error(`Error en getServiciosPorTipoEventoId ${tipoEventoId}:`, error.response || error);
    return { 
      success: false, 
      data: [],
      message: error.response?.data?.message || error.message || 'Error al obtener los servicios del tipo de evento'
    };
  }
};

/**
 * Añade un servicio a un tipo de evento.
 * @param {string} tipoEventoId - El ID del tipo de evento.
 * @param {string} servicioId - El ID del servicio a añadir.
 * @returns {Promise<{success: boolean, data: Array, message?: string}>}
 */
export const addServicioATipoEvento = async (tipoEventoId, servicioId) => {
   if (!tipoEventoId || !servicioId) {
    return { success: false, data: [], message: 'Faltan IDs para añadir servicio.' };
  }
  try {
    console.log(`Llamando a apiClient.post('/tipos-evento/${tipoEventoId}/servicios') con servicioId: ${servicioId}`);
    // El backend espera el servicioId en el body
    const response = await apiClient.post(`/tipos-evento/${tipoEventoId}/servicios`, { servicioId });
    console.log(`Respuesta API POST /tipos-evento/${tipoEventoId}/servicios:`, response);

    if (response && typeof response.success === 'boolean') {
       if (!Array.isArray(response.data)) {
          console.warn('La propiedad data no es un array en la respuesta POST /tipos-evento/:id/servicios:', response);
          return { success: false, data: [], message: 'Formato de datos inesperado tras añadir.' };
       }
      return response; // Devuelve la lista actualizada
    }
    console.warn(`Formato de respuesta inesperado tras añadir servicio a /tipos-evento/${tipoEventoId}/servicios:`, response);
    return { success: false, data: [], message: 'Formato de respuesta inesperado tras añadir.' };

  } catch (error) {
     console.error(`Error en addServicioATipoEvento (${tipoEventoId}, ${servicioId}):`, error.response || error);
    return { 
      success: false, 
      data: [],
      message: error.response?.data?.message || error.message || 'Error al añadir el servicio al tipo de evento'
    };
  }
};

/**
 * Elimina un servicio de un tipo de evento.
 * @param {string} tipoEventoId - El ID del tipo de evento.
 * @param {string} servicioId - El ID del servicio a eliminar.
 * @returns {Promise<{success: boolean, data: Array, message?: string}>}
 */
export const removeServicioDeTipoEvento = async (tipoEventoId, servicioId) => {
  if (!tipoEventoId || !servicioId) {
    return { success: false, data: [], message: 'Faltan IDs para eliminar servicio.' };
  }
  try {
     console.log(`Llamando a apiClient.delete('/tipos-evento/${tipoEventoId}/servicios/${servicioId}')`);
    const response = await apiClient.delete(`/tipos-evento/${tipoEventoId}/servicios/${servicioId}`);
    console.log(`Respuesta API DELETE /tipos-evento/${tipoEventoId}/servicios/${servicioId}:`, response);
    
     if (response && typeof response.success === 'boolean') {
       if (!Array.isArray(response.data)) {
          console.warn('La propiedad data no es un array en la respuesta DELETE /tipos-evento/:id/servicios/:servicioId:', response);
          return { success: false, data: [], message: 'Formato de datos inesperado tras eliminar.' };
       }
      return response; // Devuelve la lista actualizada
    }
    console.warn(`Formato de respuesta inesperado tras eliminar servicio de /tipos-evento/${tipoEventoId}/servicios/${servicioId}:`, response);
    return { success: false, data: [], message: 'Formato de respuesta inesperado tras eliminar.' };

  } catch (error) {
    console.error(`Error en removeServicioDeTipoEvento (${tipoEventoId}, ${servicioId}):`, error.response || error);
    return { 
      success: false, 
      data: [],
      message: error.response?.data?.message || error.message || 'Error al eliminar el servicio del tipo de evento'
    };
  }
};

// Podrías añadir aquí otras funciones relacionadas con tipos de evento si las necesitas
// ej: getTipoEventoById, createTipoEvento, etc. 