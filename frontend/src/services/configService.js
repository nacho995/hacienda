import apiClient from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const configService = {
  // Obtener la configuración actual
  getConfig: async () => {
    try {
      const response = await apiClient.get('/api/config');
      return response;
    } catch (error) {
      console.error('Error al obtener la configuración:', error.message || error);
      throw error;
    }
  },

  // Actualizar la configuración
  updateConfig: async (configData) => {
    try {
      const response = await apiClient.put('/api/config', configData);
      return response;
    } catch (error) {
      console.error('Error al actualizar la configuración:', error.message || error);
      throw error;
    }
  },

  // Restaurar la configuración por defecto
  resetConfig: async () => {
    try {
      const response = await apiClient.post('/api/config/reset');
      return response;
    } catch (error) {
      console.error('Error al restaurar la configuración:', error.message || error);
      throw error;
    }
  }
};

export default configService; 