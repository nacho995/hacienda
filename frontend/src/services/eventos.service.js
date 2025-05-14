import apiClient from './apiClient';

// Obtener todos los tipos de eventos
export const obtenerTiposEventos = async () => {
  try {
    const response = await apiClient.get('/api/tipos-evento');
    return response;
  } catch (error) {
    console.error('Error al obtener tipos de eventos:', error);
    throw error;
  }
};

// Obtener detalles de un tipo de evento específico
export const obtenerDetallesTipoEvento = async (tipoId) => {
  try {
    const response = await apiClient.get(`/api/tipos-evento/${tipoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles del tipo de evento:', error);
    throw error;
  }
};

// Obtener eventos por fecha
export const obtenerEventosPorFecha = async (fecha) => {
  try {
    const response = await apiClient.get(`/api/reservas/fecha/${fecha}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener eventos por fecha:', error);
    throw error;
  }
};
