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
    console.log('Enviando datos para crear reserva:', reservationData);
    const response = await apiClient.post('/reservas/eventos', reservationData);
    console.log('Respuesta de creación de reserva:', response);
    
    // La respuesta ya fue procesada por el interceptor
    return response;
  } catch (error) {
    console.error('Error al crear reserva de evento:', error);
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
    console.log('Asignando evento:', id, 'a usuario:', usuarioId);
    // Si no se proporciona un ID de usuario, enviar un objeto vacío para que el backend use el usuario actual
    const data = usuarioId ? { usuarioId } : {};
    const response = await apiClient.put(`/reservas/eventos/${id}/asignar`, data);
    console.log('Respuesta de asignación de evento:', response);
    return response;
  } catch (error) {
    console.error(`Error al asignar reserva de evento ${id}:`, error);
    throw error;
  }
};

// Servicios para reservas de masajes
export const getMasajeReservations = async () => {
  try {
    // Obtener tanto las reservas de masajes independientes como las asociadas a eventos
    console.log('Solicitando reservas de masajes al servidor...');
    
    const [masajesResponse, eventosResponse] = await Promise.all([
      apiClient.get('/reservas/masajes'),
      apiClient.get('/reservas/eventos')
    ]);
    
    console.log('Respuesta de masajes independientes:', masajesResponse);
    console.log('Respuesta de eventos con masajes:', eventosResponse);

    let masajes = [];

    // Procesar masajes independientes
    if (masajesResponse) {
      console.log('Procesando masajes independientes...');
      // La respuesta ya viene transformada por el interceptor
      const masajesData = Array.isArray(masajesResponse) 
        ? masajesResponse 
        : (masajesResponse.data && Array.isArray(masajesResponse.data) 
            ? masajesResponse.data 
            : []);
      
      console.log('Datos de masajes independientes:', masajesData);
      
      masajes = masajesData.map(m => ({
        ...m,
        _id: m._id || m.id, // Asegurar que siempre hay un ID
        tipo: 'masaje',
        tipoDisplay: 'Masaje',
        fechaDisplay: new Date(m.fecha).toLocaleDateString(),
        tituloDisplay: m.tipoMasaje || 'Masaje',
        clienteDisplay: `${m.nombreContacto || ''} ${m.apellidosContacto || ''}`,
        detallesUrl: `/admin/reservaciones/masaje/${m._id || m.id}`,
        estado: m.estadoReserva || 'Pendiente',
        esIndependiente: true,
        // Campos necesarios para el renderizado en la vista de masajes
        nombreEvento: m.tipoMasaje || 'Servicio de Masaje',
        numeroConfirmacion: m._id || m.id,
        fecha: m.fecha || new Date().toISOString(),
        horaInicio: m.hora || '10:00',
        horaFin: m.hora ? calcularHoraFin(m.hora, m.duracion || 60) : '11:00',
        nombreContacto: m.nombreContacto || 'Cliente',
        apellidosContacto: m.apellidosContacto || '',
        emailContacto: m.emailContacto || '',
        telefonoContacto: m.telefonoContacto || '',
        precio: m.precio || 0
      }));
    }

    // Procesar masajes asociados a eventos
    if (eventosResponse) {
      console.log('Procesando masajes asociados a eventos...');
      // La respuesta ya viene transformada por el interceptor
      const eventosData = Array.isArray(eventosResponse) 
        ? eventosResponse 
        : (eventosResponse.data && Array.isArray(eventosResponse.data) 
            ? eventosResponse.data 
            : []);
      
      console.log('Datos de eventos:', eventosData);
      console.log('Eventos con masajes:', eventosData.filter(e => e.serviciosAdicionales?.masajes?.length > 0).length);
      
      // Crear un ID único para cada masaje basado en el ID del evento y un contador
      let masajeCounter = 0;
      
      const masajesDeEventos = eventosData
        .filter(e => e.serviciosAdicionales?.masajes?.length > 0)
        .flatMap(evento => {
          console.log('Evento con masajes:', evento.nombreEvento, 'Masajes:', evento.serviciosAdicionales.masajes);
          return evento.serviciosAdicionales.masajes.map(masaje => {
            masajeCounter++;
            return {
              ...masaje,
              _id: `${evento._id || evento.id}_masaje_${masajeCounter}`,
              tipo: 'masaje',
              tipoDisplay: 'Masaje (Evento)',
              fechaDisplay: new Date(evento.fecha).toLocaleDateString(),
              tituloDisplay: masaje.titulo || masaje.tipo || 'Masaje',
              clienteDisplay: `${evento.nombreContacto || ''} ${evento.apellidosContacto || ''}`,
              detallesUrl: `/admin/reservaciones/evento/${evento._id || evento.id}`,
              estado: evento.estadoReserva || evento.estado || 'Pendiente',
              eventoAsociado: {
                id: evento._id || evento.id,
                nombre: evento.nombreEvento,
                tipo: evento.tipoEvento,
                fecha: evento.fecha,
                numeroInvitados: evento.numInvitados
              },
              esIndependiente: false,
              // Campos necesarios para el renderizado en la vista de masajes
              nombreEvento: masaje.titulo || masaje.tipo || 'Masaje en Evento',
              numeroConfirmacion: `${evento._id || evento.id}_masaje_${masajeCounter}`,
              fecha: evento.fecha || new Date().toISOString(),
              horaInicio: '10:00', // Valor predeterminado
              horaFin: '11:00',    // Valor predeterminado
              nombreContacto: evento.nombreContacto || 'Cliente',
              apellidosContacto: evento.apellidosContacto || '',
              emailContacto: evento.emailContacto || '',
              telefonoContacto: evento.telefonoContacto || '',
              precio: masaje.precio || 0
            };
          });
        });

      masajes = [...masajes, ...masajesDeEventos];
    }

    // Ordenar por fecha
    masajes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    console.log('Total de masajes procesados:', masajes.length);
    return { data: masajes };
  } catch (error) {
    console.error('Error al obtener reservas de masajes:', error);
    throw error;
  }
};

// Función auxiliar para calcular la hora de fin basada en la duración
const calcularHoraFin = (horaInicio, duracionMinutos) => {
  const [horas, minutos] = horaInicio.split(':').map(Number);
  const fechaHora = new Date();
  fechaHora.setHours(horas, minutos);
  fechaHora.setMinutes(fechaHora.getMinutes() + duracionMinutos);
  
  const horaFin = `${String(fechaHora.getHours()).padStart(2, '0')}:${String(fechaHora.getMinutes()).padStart(2, '0')}`;
  return horaFin;
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
    console.log('Asignando masaje:', id, 'a usuario:', usuarioId);
    // Si no se proporciona un ID de usuario, se asigna al usuario actual
    const data = usuarioId ? { usuarioId } : {};
    const response = await apiClient.put(`/reservas/masajes/${id}/asignar`, data);
    console.log('Respuesta de asignación de masaje:', response);
    return response;
  } catch (error) {
    console.error(`Error al asignar reserva de masaje ${id}:`, error);
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
    console.log('Enviando datos de disponibilidad:', availabilityData);
    
    // Asegurarnos de que los campos esperados estén correctamente definidos
    const dataToSend = {
      fecha: availabilityData.fecha,
      espacio: availabilityData.espacio,
      horaInicio: availabilityData.horaInicio || "09:00",
      horaFin: availabilityData.horaFin || "21:00"
    };
    
    console.log('Datos formateados a enviar:', dataToSend);
    
    // La respuesta ya viene procesada por el interceptor de apiClient
    const response = await apiClient.post('/reservas/eventos/disponibilidad', dataToSend);
    
    console.log('Respuesta del servidor (después del interceptor):', response);
    
    // Si la respuesta es directamente undefined o null
    if (!response) {
      console.error('No se recibió respuesta del servidor');
      return {
        success: false,
        disponible: false,
        mensaje: 'No se recibió respuesta del servidor'
      };
    }
    
    // Ya que la estructura de la respuesta debe ser uniforme desde el backend,
    // podemos retornarla directamente
    return response;

  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    return {
      success: false,
      disponible: false,
      mensaje: error.message || 'Error al verificar disponibilidad'
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
    if (habitacionesResponse?.success && Array.isArray(habitacionesResponse.data)) {
      habitaciones = habitacionesResponse.data.map(h => ({
        ...h,
        tipo: 'habitacion',
        tipoDisplay: 'Habitación',
        fechaDisplay: new Date(h.fechaEntrada).toLocaleDateString(),
        tituloDisplay: `${h.tipoHabitacion} - ${h.numeroHabitaciones || 1} hab.`,
        clienteDisplay: `${h.nombre} ${h.apellidos || ''}`,
        detallesUrl: `/admin/reservaciones/habitacion/${h._id}`,
        estado: h.estado || 'Pendiente'
      }));
    }

    let eventos = [];
    if (eventosResponse?.success && Array.isArray(eventosResponse.data)) {
      eventos = eventosResponse.data.map(e => ({
        ...e,
        tipo: 'evento',
        tipoDisplay: 'Evento',
        fechaDisplay: new Date(e.fecha).toLocaleDateString(),
        tituloDisplay: `${e.tipoEvento} - ${e.nombreEvento || ''}`,
        clienteDisplay: `${e.nombreContacto} ${e.apellidosContacto || ''}`,
        detallesUrl: `/admin/reservaciones/evento/${e._id}`,
        estado: e.estadoReserva || 'Pendiente'
      }));
    }

    let masajes = [];
    if (masajesResponse?.success && Array.isArray(masajesResponse.data)) {
      masajes = masajesResponse.data.map(m => ({
        ...m,
        tipo: 'masaje',
        tipoDisplay: 'Masaje',
        fechaDisplay: new Date(m.fecha).toLocaleDateString(),
        tituloDisplay: `${m.tipoMasaje || 'Masaje'}`,
        clienteDisplay: `${m.nombreContacto} ${m.apellidosContacto || ''}`,
        detallesUrl: `/admin/reservaciones/masaje/${m._id}`,
        estado: m.estadoReserva || 'Pendiente'
      }));
    }

    const todasLasReservas = [...habitaciones, ...eventos, ...masajes];
    
    todasLasReservas.sort((a, b) => {
      const fechaA = a.fechaEntrada || a.fecha;
      const fechaB = b.fechaEntrada || b.fecha;
      return new Date(fechaB) - new Date(fechaA);
    });

    console.log('Todas las reservas:', todasLasReservas);
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
    console.log('Desasignando evento:', id);
    const response = await apiClient.put(`/reservas/eventos/${id}/desasignar`);
    console.log('Respuesta de desasignación de evento:', response);
    return response;
  } catch (error) {
    console.error(`Error al desasignar reserva de evento ${id}:`, error);
    throw error;
  }
};

export const unassignMasajeReservation = async (id) => {
  try {
    console.log('Desasignando masaje:', id);
    const response = await apiClient.put(`/reservas/masajes/${id}/desasignar`);
    console.log('Respuesta de desasignación de masaje:', response);
    return response;
  } catch (error) {
    console.error(`Error al desasignar reserva de masaje ${id}:`, error);
    throw error;
  }
}; 