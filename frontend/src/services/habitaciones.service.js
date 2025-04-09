import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Obtener todas las habitaciones
export const obtenerHabitaciones = async () => {
  try {
    const response = await axios.get(`${API_URL}/habitaciones`);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    throw error;
  }
};

// Obtener todas las habitaciones por planta
export const obtenerHabitacionesPorPlanta = async (planta) => {
  try {
    const response = await axios.get(`${API_URL}/habitaciones/planta/${planta}`);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener las habitaciones por planta:', error);
    throw error;
  }
};

// Obtener habitaciones con sus reservas
export const obtenerHabitacionesConReservas = async () => {
  try {
    // Obtener todas las habitaciones
    const habitaciones = await obtenerHabitaciones();
    
    // Verificar que tengamos exactamente 14 habitaciones
    if (habitaciones.length !== 14) {
      console.warn(`Se esperaban 14 habitaciones pero se encontraron ${habitaciones.length}`);
    }
    
    // Obtener todas las reservas activas
    const reservasResponse = await axios.get(`${API_URL}/reservas/habitaciones`);
    
    // Verificar la respuesta
    if (!reservasResponse?.success) {
      console.error('Respuesta inesperada del servidor:', reservasResponse);
      throw new Error('Error al obtener las reservas: formato de respuesta inválido');
    }
    
    const reservas = reservasResponse.data || [];

    // Fecha actual para verificar disponibilidad
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Procesar cada habitación para agregar información de disponibilidad
    const habitacionesConEstado = habitaciones.map(habitacion => {
      // Filtrar reservas activas para esta habitación específica
      const reservasHabitacion = reservas.filter(
        reserva => {
          // Verificar si esta habitación específica está reservada
          const coincideNumeroHabitacion = 
            reserva.habitacion === habitacion.numeroHabitacion ||
            reserva.habitacion === habitacion.nombre;
          
          const coincideTipoHabitacion = reserva.tipoHabitacion === habitacion.tipo;
          
          return (coincideNumeroHabitacion || coincideTipoHabitacion) && 
                 reserva.estado !== 'cancelada' &&
                 new Date(reserva.fechaSalida) >= today;
        }
      );

      const disponibles = reservasHabitacion.length > 0 ? 0 : 1;

      return {
        ...habitacion,
        disponibles,
        estado: disponibles > 0 ? 'Disponible' : 'No disponible',
        reservasActivas: reservasHabitacion
      };
    });

    console.log(`Total de habitaciones procesadas: ${habitacionesConEstado.length}`);
    console.log(`Habitaciones disponibles: ${habitacionesConEstado.filter(h => h.disponibles > 0).length}`);
    
    return habitacionesConEstado;
  } catch (error) {
    console.error('Error al obtener habitaciones con reservas:', error);
    throw new Error(error.message || 'No se pudieron obtener las habitaciones con sus reservas');
  }
};

// Obtener habitaciones disponibles para un evento
export const obtenerHabitacionesDisponibles = async (fechaInicio, fechaFin, planta) => {
  try {
    const params = {
      fechaInicio,
      fechaFin,
      planta
    };
    const response = await axios.get(`${API_URL}/habitaciones/disponibles`, { params });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener las habitaciones disponibles:', error);
    throw error;
  }
};

// Obtener una habitación por ID o letra
export const obtenerHabitacion = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/habitaciones/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener la habitación:', error);
    throw error;
  }
};

// Crear una nueva habitación (solo admin)
export const crearHabitacion = async (habitacionData) => {
  try {
    const response = await axios.post(`${API_URL}/habitaciones`, habitacionData, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al crear la habitación:', error);
    throw error;
  }
};

// Actualizar una habitación (solo admin)
export const actualizarHabitacion = async (id, habitacionData) => {
  try {
    const response = await axios.put(`${API_URL}/habitaciones/${id}`, habitacionData, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al actualizar la habitación:', error);
    throw error;
  }
};

// Eliminar una habitación (solo admin)
export const eliminarHabitacion = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/habitaciones/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la habitación:', error);
    throw error;
  }
};
