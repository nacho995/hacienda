import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const configService = {
  // Obtener la configuración actual
  getConfig: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/config`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener la configuración:', error);
      throw error;
    }
  },

  // Actualizar la configuración
  updateConfig: async (configData) => {
    try {
      const response = await axios.put(`${API_URL}/api/config`, configData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la configuración:', error);
      throw error;
    }
  },

  // Restaurar la configuración por defecto
  resetConfig: async () => {
    try {
      const response = await axios.post(`${API_URL}/api/config/reset`);
      return response.data;
    } catch (error) {
      console.error('Error al restaurar la configuración:', error);
      throw error;
    }
  }
};

export default configService; 