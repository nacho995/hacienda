import apiClient from './apiClient';

export const getTiposMasaje = async () => {
  try {
    const tipos = await apiClient.get('/tipos-masaje');
    if (!Array.isArray(tipos)) {
      console.error('La respuesta no es un array:', tipos);
      return [];
    }
    return tipos;
  } catch (error) {
    console.error('Error al obtener tipos de masaje:', error);
    return [];
  }
}; 