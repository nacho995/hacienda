import apiClient from './apiClient';

// Servicios para reservas de habitaciones
export const getHabitacionReservations = async () => {
  try {
    const response = await apiClient.get('/reservas/habitaciones');
    return response.data;
  } catch (error) {
    console.error('Error fetching habitacion reservations:', error);
    return []; // Devolver array vacío en caso de error
  }
};

export const getHabitacionReservation = async (id) => {
  try {
    const response = await apiClient.get(`/reservas/habitaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching habitacion reservation ${id}:`, error);
    throw error;
  }
};

export const createHabitacionReservation = async (reservationData) => {
  try {
    const response = await apiClient.post('/reservas/habitaciones', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error creating habitacion reservation:', error);
    throw error;
  }
};

export const updateHabitacionReservation = async (id, updateData) => {
  try {
    const response = await apiClient.put(`/reservas/habitaciones/${id}`, updateData);
    return response;
  } catch (error) {
    console.error('Error updating habitacion reservation:', error);
    throw error;
  }
};

export const asignarHabitacionReservation = async (id, usuarioId) => {
  try {
    const response = await apiClient.put(`/reservas/habitaciones/${id}/asignar`, { usuarioId });
    return response.data;
  } catch (error) {
    console.error(`Error asignando habitacion reservation ${id}:`, error);
    throw error;
  }
};

// Servicios para reservas de eventos
export const getEventoReservations = async () => {
  try {
    const response = await apiClient.get('/reservas/eventos');
    return response.data;
  } catch (error) {
    console.error('Error fetching evento reservations:', error);
    return []; // Devolver array vacío en caso de error
  }
};

export const getEventoReservation = async (id) => {
  try {
    const response = await apiClient.get(`/reservas/eventos/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching evento reservation ${id}:`, error);
    // Devolver el objeto de error para que la UI pueda manejarlo
    return error;
  }
};

export const createEventoReservation = async (reservationData) => {
  try {
    const response = await apiClient.post('/reservas/eventos', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error creating evento reservation:', error);
    throw error;
  }
};

export const updateEventoReservation = async (id, updateData) => {
  try {
    const response = await apiClient.put(`/reservas/eventos/${id}`, updateData);
    return response;
  } catch (error) {
    console.error('Error updating evento reservation:', error);
    // Devolver el objeto de error para que la UI pueda manejarlo
    return error;
  }
};

export const asignarEventoReservation = async (id, usuarioId) => {
  try {
    const response = await apiClient.put(`/reservas/eventos/${id}/asignar`, { usuarioId });
    return response.data;
  } catch (error) {
    console.error(`Error asignando evento reservation ${id}:`, error);
    throw error;
  }
};

// Obtener reservas sin asignar (visualización general)
export const getUnassignedEventoReservations = async () => {
  try {
    const response = await apiClient.get('/reservas/eventos?sinAsignar=true');
    return response.data;
  } catch (error) {
    console.error('Error fetching unassigned evento reservations:', error);
    return []; // Devolver array vacío en caso de error
  }
};

// Asignar una reserva de evento al usuario actual
export const assignEventoReservation = async (id) => {
  try {
    const response = await apiClient.put(`/reservas/eventos/${id}/asignar`);
    return response.data;
  } catch (error) {
    console.error(`Error assigning evento reservation ${id}:`, error);
    throw error;
  }
};

// Desasignar una reserva de evento
export const unassignEventoReservation = async (id) => {
  try {
    const response = await apiClient.put(`/reservas/eventos/${id}/desasignar`);
    return response.data;
  } catch (error) {
    console.error(`Error unassigning evento reservation ${id}:`, error);
    throw error;
  }
};

// Servicios para reservas de masajes
export const getMasajeReservations = async () => {
  try {
    const response = await apiClient.get('/reservas/masajes');
    return response.data;
  } catch (error) {
    console.error('Error fetching masaje reservations:', error);
    return []; // Devolver array vacío en caso de error
  }
};

export const getMasajeReservation = async (id) => {
  try {
    const response = await apiClient.get(`/reservas/masajes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching masaje reservation ${id}:`, error);
    throw error;
  }
};

export const createMasajeReservation = async (reservationData) => {
  try {
    const response = await apiClient.post('/reservas/masajes', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error creating masaje reservation:', error);
    throw error;
  }
};

export const updateMasajeReservation = async (id, updateData) => {
  try {
    const response = await apiClient.put(`/reservas/masajes/${id}`, updateData);
    return response;
  } catch (error) {
    console.error('Error updating masaje reservation:', error);
    throw error;
  }
};

export const asignarMasajeReservation = async (id, usuarioId) => {
  try {
    const response = await apiClient.put(`/reservas/masajes/${id}/asignar`, { usuarioId });
    return response.data;
  } catch (error) {
    console.error(`Error asignando masaje reservation ${id}:`, error);
    throw error;
  }
};

// Verificar disponibilidad
export const checkHabitacionAvailability = async (availabilityData) => {
  try {
    const response = await apiClient.post('/reservas/habitaciones/disponibilidad', availabilityData);
    return response.data;
  } catch (error) {
    console.error('Error checking habitacion availability:', error);
    throw error;
  }
};

export const checkEventoAvailability = async (availabilityData) => {
  try {
    const response = await apiClient.post('/reservas/eventos/disponibilidad', availabilityData);
    
    // Asegurarnos de que la respuesta tenga la estructura esperada
    if (response && response.success === true) {
      // Verificar que la respuesta contenga el campo disponible
      if (!response.disponible) {
        console.warn('La respuesta no contiene un campo disponible:', response);
        return {
          success: false,
          disponible: {
            disponible: false,
            mensaje: 'Formato de respuesta incorrecto del servidor'
          }
        };
      }
      return response; // Ya está formateado correctamente por apiClient.js
    } 
    
    // Si no tiene la estructura esperada, devolvemos un formato consistente
    return {
      success: false,
      disponible: {
        disponible: false,
        mensaje: response?.message || 'Error al verificar disponibilidad'
      }
    };
  } catch (error) {
    console.error('Error checking evento availability:', error);
    // Devolvemos un objeto con formato consistente incluso en caso de error
    return {
      success: false,
      disponible: {
        disponible: false,
        mensaje: error.message || 'Error de conexión al verificar disponibilidad'
      }
    };
  }
};

export const checkMasajeAvailability = async (availabilityData) => {
  try {
    const response = await apiClient.post('/reservas/masajes/disponibilidad', availabilityData);
    return response.data;
  } catch (error) {
    console.error('Error checking masaje availability:', error);
    throw error;
  }
};

// Obtener todas las reservas para el dashboard (todos los tipos)
export const getAllReservationsForDashboard = async () => {
  try {
    // Realizar todas las peticiones en paralelo
    const [habitacionesResponse, eventosResponse, masajesResponse] = await Promise.all([
      apiClient.get('/reservas/habitaciones'),
      apiClient.get('/reservas/eventos'),
      apiClient.get('/reservas/masajes')
    ]);

    // Procesar y transformar datos de habitaciones
    let habitaciones = [];
    if (habitacionesResponse && habitacionesResponse.data) {
      // Manejar tanto el formato {success, data} como el array directo
      const habitacionesData = Array.isArray(habitacionesResponse.data) 
        ? habitacionesResponse.data 
        : (habitacionesResponse.data.data && Array.isArray(habitacionesResponse.data.data) 
          ? habitacionesResponse.data.data 
          : []);
          
      habitaciones = habitacionesData.map(h => ({
        ...h,
        tipo: 'habitacion',
        tipoDisplay: 'Habitación',
        fechaDisplay: new Date(h.fechaEntrada).toLocaleDateString(),
        tituloDisplay: `${h.tipoHabitacion} - ${h.numeroHabitaciones || 1} hab.`,
        clienteDisplay: `${h.nombre} ${h.apellidos || ''}`,
        detallesUrl: `/admin/reservaciones/habitacion/${h._id}`,
        estado: h.estadoReserva || 'Pendiente' // Normalizar nombre del campo
      }));
    }

    // Procesar y transformar datos de eventos
    let eventos = [];
    if (eventosResponse && eventosResponse.data) {
      // Manejar tanto el formato {success, data} como el array directo
      const eventosData = Array.isArray(eventosResponse.data) 
        ? eventosResponse.data 
        : (eventosResponse.data.data && Array.isArray(eventosResponse.data.data) 
          ? eventosResponse.data.data 
          : []);
          
      eventos = eventosData.map(e => ({
        ...e,
        tipo: 'evento',
        tipoDisplay: 'Evento',
        fechaDisplay: new Date(e.fecha).toLocaleDateString(),
        tituloDisplay: `${e.tipoEvento} - ${e.nombreEvento || ''}`,
        clienteDisplay: `${e.nombreContacto} ${e.apellidosContacto || ''}`,
        detallesUrl: `/admin/reservaciones/evento/${e._id}`,
        estado: e.estadoReserva || 'Pendiente' // Normalizar nombre del campo
      }));
    }

    // Procesar y transformar datos de masajes
    let masajes = [];
    if (masajesResponse && masajesResponse.data) {
      // Manejar tanto el formato {success, data} como el array directo
      const masajesData = Array.isArray(masajesResponse.data) 
        ? masajesResponse.data 
        : (masajesResponse.data.data && Array.isArray(masajesResponse.data.data) 
          ? masajesResponse.data.data 
          : []);
          
      masajes = masajesData.map(m => ({
        ...m,
        tipo: 'masaje',
        tipoDisplay: 'Masaje',
        fechaDisplay: new Date(m.fecha).toLocaleDateString(),
        tituloDisplay: `${m.tipoMasaje} - ${m.duracion} min.`,
        clienteDisplay: `${m.nombre} ${m.apellidos || ''}`,
        detallesUrl: `/admin/reservaciones/masaje/${m._id}`,
        estado: m.estadoReserva || 'Pendiente' // Normalizar nombre del campo
      }));
    }

    // Combinar todos los tipos de reservas
    const todasLasReservas = [...habitaciones, ...eventos, ...masajes];
    
    // Ordenar por fecha (las más recientes primero)
    todasLasReservas.sort((a, b) => {
      const fechaA = a.fechaEntrada || a.fecha;
      const fechaB = b.fechaEntrada || b.fecha;
      return new Date(fechaB) - new Date(fechaA);
    });

    console.log('Total de reservas cargadas para el dashboard:', todasLasReservas.length);
    return todasLasReservas;
  } catch (error) {
    console.error('Error fetching all reservations for dashboard:', error);
    return []; // Devolver array vacío en caso de error
  }
};

// Obtener fechas ocupadas para eventos
export const getEventoOccupiedDates = async (params = {}) => {
  try {
    // Construir la URL con los parámetros opcionales
    let url = '/reservas/eventos/fechas-ocupadas';
    
    // Añadir parámetros a la URL si existen
    const queryParams = [];
    if (params.espacioSeleccionado) {
      queryParams.push(`espacioSeleccionado=${encodeURIComponent(params.espacioSeleccionado)}`);
    }
    if (params.fechaInicio) {
      queryParams.push(`fechaInicio=${params.fechaInicio}`);
    }
    if (params.fechaFin) {
      queryParams.push(`fechaFin=${params.fechaFin}`);
    }
    
    // Añadir parámetros a la URL
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    const response = await apiClient.get(url);
    
    // Transformar las fechas a objetos Date para facilitar su uso en el frontend
    if (response && response.success && Array.isArray(response.data)) {
      return response.data.map(item => ({
        ...item,
        fecha: new Date(item.fecha)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching occupied dates for eventos:', error);
    return []; // Devolver array vacío en caso de error
  }
};

// Obtener fechas ocupadas para habitaciones
export const getHabitacionOccupiedDates = async (params = {}) => {
  try {
    // Construir la URL con los parámetros opcionales
    let url = '/reservas/habitaciones/fechas-ocupadas';
    
    // Añadir parámetros a la URL si existen
    const queryParams = [];
    if (params.tipoHabitacion) {
      queryParams.push(`tipoHabitacion=${encodeURIComponent(params.tipoHabitacion)}`);
    }
    if (params.fechaInicio) {
      queryParams.push(`fechaInicio=${params.fechaInicio}`);
    }
    if (params.fechaFin) {
      queryParams.push(`fechaFin=${params.fechaFin}`);
    }
    
    // Añadir parámetros a la URL
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    const response = await apiClient.get(url);
    
    // Transformar las fechas a objetos Date para facilitar su uso en el frontend
    if (response && response.success && Array.isArray(response.data)) {
      return response.data.map(item => ({
        ...item,
        fechaEntrada: new Date(item.fechaEntrada),
        fechaSalida: new Date(item.fechaSalida)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching occupied dates for habitaciones:', error);
    return []; // Devolver array vacío en caso de error
  }
};

// Eliminar reserva de habitación
export const deleteHabitacionReservation = async (id) => {
  try {
    const response = await apiClient.delete(`/reservas/habitaciones/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting habitacion reservation:', error);
    throw error;
  }
};

// Eliminar reserva de evento
export const deleteEventoReservation = async (id) => {
  try {
    const response = await apiClient.delete(`/reservas/eventos/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting evento reservation:', error);
    // Devolver el objeto de error para que la UI pueda manejarlo
    return error;
  }
};

// Eliminar reserva de masaje
export const deleteMasajeReservation = async (id) => {
  try {
    const response = await apiClient.delete(`/reservas/masajes/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting masaje reservation:', error);
    throw error;
  }
}; 