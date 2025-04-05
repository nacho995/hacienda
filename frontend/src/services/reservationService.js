import apiClient from './apiClient';

// Servicios para reservas de habitaciones
export const getHabitacionReservations = async () => {
  try {
    const response = await apiClient.get('/reservas/habitaciones');
    console.log('Respuesta del servidor (habitaciones):', response);
    
    // Verificar si la respuesta tiene la estructura correcta
    if (response?.data?.success && Array.isArray(response.data.data)) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    // Si la respuesta es un array directamente
    if (Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data
      };
    }
    
    console.error('Estructura de respuesta inesperada:', response);
    return {
      success: false,
      data: [],
      message: 'Formato de respuesta inválido del servidor'
    };
  } catch (error) {
    console.error('Error al obtener reservas de habitaciones:', error.response || error);
    return { 
      success: false, 
      data: [], 
      message: error.response?.data?.message || 'Error al obtener las reservas de habitaciones'
    };
  }
};

export const getHabitacionReservation = async (id) => {
  try {
    const response = await apiClient.get(`/reservas/habitaciones/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener reserva de habitación ${id}:`, error.message || error);
    return { success: false, data: null, message: error.message };
  }
};

export const createHabitacionReservation = async (reservationData) => {
  try {
    const response = await apiClient.post('/reservas/habitaciones', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva de habitación:', error.message || error);
    throw error;
  }
};

export const updateHabitacionReservation = async (id, data) => {
  try {
    const response = await apiClient.put(`/reservas/habitaciones/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Error al actualizar reserva de habitación ${id}:`, error.message || error);
    throw error;
  }
};

export const assignHabitacionReservation = async (id, usuarioId) => {
  try {
    const response = await apiClient.put(`/reservas/habitaciones/${id}/asignar`, { usuarioId });
    return response;
  } catch (error) {
    console.error(`Error al asignar reserva de habitación ${id}:`, error.message || error);
    throw error;
  }
};

// Servicios para reservas de eventos
export const getEventoReservations = async () => {
  try {
    const response = await apiClient.get('/reservas/eventos');
    console.log('Respuesta del servidor (eventos):', response);
    
    // Verificar si la respuesta tiene la estructura correcta
    if (response?.data?.success && Array.isArray(response.data.data)) {
      // Asegurarse de que cada reserva tenga un precio
      const reservasConPrecio = response.data.data.map(reserva => ({
        ...reserva,
        precio: reserva.precio || reserva.presupuestoEstimado || 0
      }));
      return {
        success: true,
        data: reservasConPrecio
      };
    }
    
    // Si la respuesta es un array directamente
    if (Array.isArray(response.data)) {
      // Asegurarse de que cada reserva tenga un precio
      const reservasConPrecio = response.data.map(reserva => ({
        ...reserva,
        precio: reserva.precio || reserva.presupuestoEstimado || 0
      }));
      return {
        success: true,
        data: reservasConPrecio
      };
    }
    
    console.error('Estructura de respuesta inesperada:', response);
    return {
      success: false,
      data: [],
      message: 'Formato de respuesta inválido del servidor'
    };
  } catch (error) {
    console.error('Error al obtener reservas de eventos:', error.response || error);
    return { 
      success: false, 
      data: [], 
      message: error.response?.data?.message || 'Error al obtener las reservas de eventos'
    };
  }
};

export const getEventoReservation = async (id) => {
  try {
    const response = await apiClient.get(`/reservas/eventos/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener reserva de evento ${id}:`, error.message || error);
    return { success: false, data: null, message: error.message };
  }
};

export const createEventoReservation = async (reservationData) => {
  try {
    const response = await apiClient.post('/reservas/eventos', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva de evento:', error.message || error);
    throw error;
  }
};

export const updateEventoReservation = async (id, data) => {
  try {
    const response = await apiClient.put(`/reservas/eventos/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Error al actualizar reserva de evento ${id}:`, error.message || error);
    throw error;
  }
};

export const assignEventoReservation = async (id, usuarioId) => {
  try {
    const response = await apiClient.put(`/reservas/eventos/${id}/asignar`, { usuarioId });
    return response;
  } catch (error) {
    console.error(`Error al asignar reserva de evento ${id}:`, error.message || error);
    throw error;
  }
};

// Servicios para reservas de masajes
export const getMasajeReservations = async () => {
  try {
    const response = await apiClient.get('/reservas/masajes');
    return response;
  } catch (error) {
    console.error('Error al obtener reservas de masajes:', error.message || error);
    return { success: false, data: [], message: error.message };
  }
};

export const getMasajeReservation = async (id) => {
  try {
    const response = await apiClient.get(`/reservas/masajes/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener reserva de masaje ${id}:`, error.message || error);
    return { success: false, data: null, message: error.message };
  }
};

export const createMasajeReservation = async (reservationData) => {
  try {
    const response = await apiClient.post('/reservas/masajes', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva de masaje:', error.message || error);
    throw error;
  }
};

export const updateMasajeReservation = async (id, data) => {
  try {
    const response = await apiClient.put(`/reservas/masajes/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Error al actualizar reserva de masaje ${id}:`, error.message || error);
    throw error;
  }
};

export const assignMasajeReservation = async (id, usuarioId) => {
  try {
    const response = await apiClient.put(`/reservas/masajes/${id}/asignar`, { usuarioId });
    return response;
  } catch (error) {
    console.error(`Error al asignar reserva de masaje ${id}:`, error.message || error);
    throw error;
  }
};

// Verificar disponibilidad
export const checkHabitacionAvailability = async (availabilityData) => {
  try {
    // Obtener la información de la habitación
    const habitacionResponse = await apiClient.get(`/habitaciones/${availabilityData.habitacion}`);
    if (!habitacionResponse || !habitacionResponse.data) {
      throw new Error('No se pudo obtener la información de la habitación');
    }

    const habitacion = habitacionResponse.data;
    
    // Añadir el tipo de habitación a los datos de disponibilidad
    const dataToSend = {
      ...availabilityData,
      tipoHabitacion: habitacion.tipo,
      habitacion: habitacion.nombre
    };

    const response = await apiClient.post('/reservas/habitaciones/disponibilidad', dataToSend);
    
    // Si la respuesta es exitosa pero no tiene la estructura esperada
    if (!response || typeof response.disponible === 'undefined') {
      console.error('Respuesta inesperada del servidor:', response);
      return {
        disponible: false,
        mensaje: 'Error al verificar disponibilidad: respuesta inválida del servidor',
        habitacionesRestantes: 0
      };
    }

    return {
      disponible: response.disponible,
      mensaje: response.mensaje,
      habitacionesRestantes: response.habitacionesRestantes || 0
    };
  } catch (error) {
    console.error('Error al verificar disponibilidad de habitación:', error);
    return {
      disponible: false,
      mensaje: error.message || 'Error al verificar disponibilidad',
      habitacionesRestantes: 0
    };
  }
};

export const checkEventoAvailability = async (availabilityData) => {
  try {
    const response = await apiClient.post('/reservas/eventos/disponibilidad', availabilityData);
    
    if (response && response.success === true) {
      if (!response.disponible) {
        return {
          success: false,
          disponible: {
            disponible: false,
            mensaje: 'Formato de respuesta incorrecto del servidor'
          }
        };
      }
      return response;
    } 
    
    return {
      success: false,
      disponible: {
        disponible: false,
        mensaje: response?.message || 'Error al verificar disponibilidad'
      }
    };
  } catch (error) {
    console.error('Error al verificar disponibilidad de evento:', error.message || error);
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
    console.error('Error al verificar disponibilidad de masaje:', error.message || error);
    throw error;
  }
};

// Obtener todas las reservas para el dashboard
export const getAllReservationsForDashboard = async () => {
  try {
    const [habitacionesResponse, eventosResponse, masajesResponse] = await Promise.all([
      apiClient.get('/reservas/habitaciones'),
      apiClient.get('/reservas/eventos'),
      apiClient.get('/reservas/masajes')
    ]);

    let habitaciones = [];
    if (habitacionesResponse && habitacionesResponse.data) {
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
        estado: h.estadoReserva || 'Pendiente'
      }));
    }

    let eventos = [];
    if (eventosResponse && eventosResponse.data) {
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
        estado: e.estado || 'Pendiente'
      }));
    }

    let masajes = [];
    if (masajesResponse && masajesResponse.data) {
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
        tituloDisplay: `${m.tipoMasaje || 'Masaje'}`,
        clienteDisplay: `${m.nombre} ${m.apellidos || ''}`,
        detallesUrl: `/admin/reservaciones/masaje/${m._id}`,
        estado: m.estado || 'Pendiente'
      }));
    }

    const todasLasReservas = [...habitaciones, ...eventos, ...masajes];
    
    todasLasReservas.sort((a, b) => {
      const fechaA = a.fechaEntrada || a.fecha;
      const fechaB = b.fechaEntrada || b.fecha;
      return new Date(fechaB) - new Date(fechaA);
    });

    return todasLasReservas;
  } catch (error) {
    console.error('Error al obtener reservas para el dashboard:', error.message || error);
    return [];
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

// Eliminar reservas
export const deleteHabitacionReservation = async (id) => {
  try {
    const response = await apiClient.delete(`/reservas/habitaciones/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al eliminar reserva de habitación ${id}:`, error.message || error);
    throw error;
  }
};

export const deleteEventoReservation = async (id) => {
  try {
    const response = await apiClient.delete(`/reservas/eventos/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al eliminar reserva de evento ${id}:`, error.message || error);
    throw error;
  }
};

export const deleteMasajeReservation = async (id) => {
  try {
    const response = await apiClient.delete(`/reservas/masajes/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al eliminar reserva de masaje ${id}:`, error.message || error);
    throw error;
  }
};

// Desasignar reservas
export const unassignHabitacionReservation = async (id) => {
  try {
    const response = await apiClient.put(`/reservas/habitaciones/${id}/desasignar`);
    return response;
  } catch (error) {
    console.error(`Error al desasignar reserva de habitación ${id}:`, error.message || error);
    throw error;
  }
};

export const unassignEventoReservation = async (id) => {
  try {
    const response = await apiClient.put(`/reservas/eventos/${id}/desasignar`);
    return response;
  } catch (error) {
    console.error(`Error al desasignar reserva de evento ${id}:`, error.message || error);
    throw error;
  }
};

export const unassignMasajeReservation = async (id) => {
  try {
    const response = await apiClient.put(`/reservas/masajes/${id}/desasignar`);
    return response;
  } catch (error) {
    console.error(`Error al desasignar reserva de masaje ${id}:`, error.message || error);
    throw error;
  }
}; 