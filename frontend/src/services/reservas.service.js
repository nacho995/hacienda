// Servicio para gestionar las reservas
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Obtiene las fechas que ya están reservadas
 * @returns {Promise<Array<string>>} Array de fechas en formato YYYY-MM-DD
 */
export const obtenerFechasReservadas = async () => {
  try {
    const response = await axios.get(`${API_URL}/reservas/fechas-reservadas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener fechas reservadas:', error);
    return [];
  }
};

/**
 * Verifica si una fecha específica está disponible
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<boolean>} true si está disponible, false si ya está reservada
 */
export const verificarDisponibilidadFecha = async (fecha) => {
  try {
    const response = await axios.get(`${API_URL}/reservas/verificar-disponibilidad`, {
      params: { fecha }
    });
    return response.data.disponible;
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    // En caso de error, asumimos que no está disponible por precaución
    return false;
  }
};
