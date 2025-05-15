import apiClient from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const configService = {
  // Obtener la configuración actual
  getConfig: async () => {
    try {
      const response = await apiClient.get('/api/config');
      console.log('Respuesta original de API para getConfig:', response);
      
      return {
        success: true,
        data: response.data || {}
      };
    } catch (error) {
      console.error('Error al obtener la configuración (configService):', error.message || error);
      
      return {
        success: false,
        message: error.message || 'Error en la petición de getConfig',
        data: {} // Asegurar que siempre haya un objeto data aunque sea vacío
      };
    }
  },

  // Actualizar la configuración
  updateConfig: async (configData) => {
    try {
      const response = await apiClient.put('/api/config', configData);
      return {
        success: true,
        data: response.data || {}
      };
    } catch (error) {
      console.error('Error al actualizar la configuración (configService):', error.message || error);
      return {
        success: false,
        message: error.message || 'Error en la petición de updateConfig',
        data: {}
      };
    }
  },

  // Restaurar la configuración por defecto
  resetConfig: async () => {
    try {
      const response = await apiClient.post('/api/config/reset');
      return {
        success: true,
        data: response.data || {}
      };
    } catch (error) {
      console.error('Error al restaurar la configuración (configService):', error.message || error);
      return {
        success: false,
        message: error.message || 'Error en la petición de resetConfig',
        data: {}
      };
    }
  }
};

export default configService; 