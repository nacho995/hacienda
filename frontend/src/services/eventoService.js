import apiClient from './apiClient';

export const getTiposEvento = async () => {
  try {
    const tipos = await apiClient.get('/tipos-evento');
    if (!Array.isArray(tipos)) {
      console.error('La respuesta no es un array:', tipos);
      return [];
    }
    return tipos;
  } catch (error) {
    console.error('Error al obtener tipos de evento:', error);
    return [];
  }
}; 