import apiClient from './apiClient';

// Servicios para reservas de habitaciones
export const getHabitacionReservations = async () => {
  try {
    console.log('Obteniendo reservas de habitaciones...');
    
    // Obtener habitaciones independientes y habitaciones dentro de eventos
    const [habitacionesResponse, eventosResponse] = await Promise.all([
      apiClient.get('/reservas/habitaciones'),
      apiClient.get('/reservas/eventos')
    ]);
    
    console.log('Respuesta de habitaciones independientes:', habitacionesResponse);
    console.log('Respuesta de eventos con habitaciones:', eventosResponse);

    let habitaciones = [];

    // Procesar habitaciones independientes
    if (habitacionesResponse) {
      console.log('Procesando habitaciones independientes...');
      // La respuesta ya viene transformada por el interceptor
      const habitacionesData = Array.isArray(habitacionesResponse) 
        ? habitacionesResponse 
        : (habitacionesResponse.data && Array.isArray(habitacionesResponse.data) 
            ? habitacionesResponse.data 
            : []);
      
      console.log('Datos de habitaciones independientes:', habitacionesData);
      
      habitaciones = habitacionesData.map(h => ({
        ...h,
        _id: h._id || h.id, // Asegurar que siempre hay un ID
        tipo: 'habitacion',
        tipoDisplay: 'Habitación Independiente',
        fechaDisplay: `${new Date(h.fechaEntrada).toLocaleDateString()} - ${new Date(h.fechaSalida).toLocaleDateString()}`,
        tituloDisplay: h.habitacion || h.tipoHabitacion || 'Habitación',
        clienteDisplay: `${h.nombreContacto || ''} ${h.apellidosContacto || ''}`,
        detallesUrl: `/admin/reservaciones/habitacion/${h._id || h.id}`,
        estado: h.estadoReserva || h.estado || 'Pendiente',
        esIndependiente: true
      }));
    }

    // Procesar habitaciones de eventos
    if (eventosResponse) {
      console.log('Procesando habitaciones de eventos...');
      
      const eventosData = Array.isArray(eventosResponse) 
        ? eventosResponse 
        : (eventosResponse.data && Array.isArray(eventosResponse.data) 
            ? eventosResponse.data 
            : []);
      
      let habitacionCounter = 0;
      
      const habitacionesDeEventos = eventosData
        .filter(evento => evento.serviciosAdicionales && Array.isArray(evento.serviciosAdicionales.habitaciones))
        .flatMap(evento => {
          console.log('Evento con habitaciones:', evento.nombreEvento, 'Habitaciones:', evento.serviciosAdicionales.habitaciones);
          
          return evento.serviciosAdicionales.habitaciones.map(habitacion => {
            habitacionCounter++;
            
            // Si la habitación ya tiene un ID, lo usamos, si no, generamos uno sintético
            const habitacionId = habitacion._id || 
              (habitacion.reservaHabitacionId) || 
              `evento-habitacion-${evento._id}-${habitacionCounter}`;
            
            console.log(`Procesando habitación ${habitacionCounter} del evento ${evento.nombreEvento || evento.nombre}`, {
              habitacionId, 
              fechaEvento: evento.fecha, 
              tipoHabitacion: habitacion.tipoHabitacion
            });
            
            // Para cada habitación, calculamos fechas en caso de que no tenga
            // Por defecto, asumimos que la fecha de entrada es la del evento
            // y la salida es un día después
            const fechaEvento = new Date(evento.fecha);
            const fechaEntrada = habitacion.fechaEntrada 
              ? new Date(habitacion.fechaEntrada) 
              : fechaEvento;
            
            const fechaSalida = habitacion.fechaSalida 
              ? new Date(habitacion.fechaSalida) 
              : new Date(fechaEvento.getTime() + 24 * 60 * 60 * 1000); // Un día después
            
            return {
              _id: habitacionId,
              tipo: 'habitacion',
              tipoDisplay: 'Habitación de Evento',
              eventoAsociado: {
                _id: evento._id,
                nombre: evento.nombreEvento || evento.tipoEvento || 'Evento',
                fecha: evento.fecha,
                numeroInvitados: evento.numeroInvitados
              },
              fechaDisplay: `${fechaEntrada.toLocaleDateString()} - ${fechaSalida.toLocaleDateString()}`,
              tituloDisplay: habitacion.tipoHabitacion || 'Habitación',
              clienteDisplay: `${evento.nombreContacto || ''} ${evento.apellidosContacto || ''}`,
              detallesUrl: `/admin/reservaciones/evento/${evento._id}`,
              estado: evento.estadoReserva || evento.estado || 'Pendiente',
              esIndependiente: false,
              fechaEntrada: fechaEntrada.toISOString(),
              fechaSalida: fechaSalida.toISOString(),
              tipoHabitacion: habitacion.tipoHabitacion,
              habitacion: habitacion.nombreHabitacion || habitacion.habitacion,
              numHuespedes: habitacion.numHuespedes || 2,
              numeroHabitaciones: habitacion.numeroHabitaciones || 1,
              reservaEvento: evento._id,
              nombreContacto: evento.nombreContacto || 'Cliente',
              apellidosContacto: evento.apellidosContacto || '',
              emailContacto: evento.emailContacto || '',
              telefonoContacto: evento.telefonoContacto || '',
              precio: habitacion.precio || 0
            };
          });
        });

      // Eliminar duplicados usando un Map con _id como clave
      const habitacionesMap = new Map();
      [...habitaciones, ...habitacionesDeEventos].forEach(habitacion => {
        if (habitacion._id) {
          habitacionesMap.set(habitacion._id, habitacion);
        }
      });
      
      habitaciones = Array.from(habitacionesMap.values());
      
      console.log('Total de habitaciones después de eliminar duplicados:', habitaciones.length);
    }
    
    console.log('Total de habitaciones procesadas:', habitaciones.length);
    
    return {
      success: true,
      data: habitaciones
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
    console.log('Iniciando creación de reserva de evento');
    console.log('Datos recibidos:', JSON.stringify(reservationData, null, 2));
    
    // Log específico para depurar masajes
    if (reservationData.serviciosAdicionales && reservationData.serviciosAdicionales.masajes) {
      console.log('Detalle de masajes a enviar:', 
        reservationData.serviciosAdicionales.masajes.map(m => ({
          tipoMasaje: m.tipoMasaje,
          precio: m.precio,
          duracion: m.duracion
        }))
      );
    }
    
    // Validaciones previas
    const camposRequeridos = [
      'nombreEvento',
      'tipoEvento',
      'fecha',
      'nombreContacto',
      'apellidosContacto',
      'emailContacto',
      'telefonoContacto'
    ];
    
    const camposFaltantes = camposRequeridos.filter(campo => !reservationData[campo]);
    
    if (camposFaltantes.length > 0) {
      console.error('Campos requeridos faltantes:', camposFaltantes);
      throw new Error(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`);
    }
    
    // Validar el formato del ID del tipo de evento
    if (typeof reservationData.tipoEvento !== 'string' || !reservationData.tipoEvento.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('ID de tipo de evento inválido:', reservationData.tipoEvento);
      throw new Error('El ID del tipo de evento no es válido');
    }
    
    // Validar masajes si están presentes
    if (reservationData.serviciosAdicionales?.masajes?.length > 0) {
      for (const masaje of reservationData.serviciosAdicionales.masajes) {
        if (!masaje.tipoMasaje) {
          console.error('Masaje sin tipoMasaje:', masaje);
          throw new Error('Un masaje no tiene tipo válido');
        }

        if (typeof masaje.precio !== 'number' || isNaN(masaje.precio) || masaje.precio <= 0) {
          console.error('Precio de masaje inválido:', {
            precio: masaje.precio,
            tipo: typeof masaje.precio,
            masaje
          });
          throw new Error(`Un masaje tiene precio inválido: ${JSON.stringify(masaje.precio)}`);
        }
      }
    }
    
    console.log('Validaciones previas completadas');
    
    // Intentar la petición con un manejador de timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout en la petición')), 15000)
    );
    
    console.log('Enviando petición al servidor...');
    const fetchPromise = apiClient.post('/reservas/eventos', reservationData);
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    console.log('Respuesta recibida del servidor:', response);
    
    if (!response) {
      throw new Error('No se recibió respuesta del servidor');
    }
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response;
  } catch (error) {
    console.error('Error detallado en createEventoReservation:', {
      mensaje: error.message,
      tipo: error.name,
      stack: error.stack,
      respuesta: error.response?.data,
      estado: error.response?.status
    });
    
    // Crear un objeto de error más informativo
    const errorInfo = {
      success: false,
      message: error.message || 'Error al crear la reserva',
      status: error.response?.status || 500,
      details: error.response?.data || error.message
    };
    
    throw errorInfo;
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
    
    // 1. Asignar el evento
    const response = await apiClient.put(`/reservas/eventos/${id}/asignar`, data);
    console.log('Respuesta de asignación de evento:', response);
    
    // 2. Obtener el evento completo para encontrar habitaciones y masajes asociados
    const eventoResponse = await apiClient.get(`/reservas/eventos/${id}`);
    const evento = eventoResponse?.data || {};
    const serviciosAdicionales = evento.serviciosAdicionales || {};
    
    // Variables para almacenar resultados
    const resultados = {
      evento: response,
      habitacionesAsignadas: [],
      masajesAsignados: []
    };
    
    // 3. Verificar si hay habitaciones y masajes asociados
    const tieneHabitaciones = serviciosAdicionales.habitaciones && serviciosAdicionales.habitaciones.length > 0;
    const tieneMasajes = serviciosAdicionales.masajes && serviciosAdicionales.masajes.length > 0;
    
    if (!tieneHabitaciones && !tieneMasajes) {
      console.log('No hay servicios adicionales para asignar con este evento');
      return {
        ...response,
        resultadosAdicionales: {
          habitaciones: 0,
          masajes: 0,
          totalAsignados: 0,
          habitacionesOmitidas: 0,
          masajesOmitidos: 0
        }
      };
    }
    
    // Optimización: Obtener listas completas de habitaciones y masajes existentes
    const [todasHabitaciones, todosMasajes] = await Promise.all([
      tieneHabitaciones ? apiClient.get('/reservas/habitaciones') : { data: [] },
      tieneMasajes ? apiClient.get('/reservas/masajes') : { data: [] }
    ]);
    
    // Crear conjuntos de IDs para búsqueda eficiente
    const habitacionesExistentesMap = new Map();
    const masajesExistentesMap = new Map();
    
    if (tieneHabitaciones && todasHabitaciones?.data) {
      const habitacionesArray = Array.isArray(todasHabitaciones.data) ? todasHabitaciones.data : [];
      habitacionesArray.forEach(h => {
        if (h._id) habitacionesExistentesMap.set(h._id, h);
      });
    }
    
    if (tieneMasajes && todosMasajes?.data) {
      const masajesArray = Array.isArray(todosMasajes.data) ? todosMasajes.data : [];
      masajesArray.forEach(m => {
        if (m._id) masajesExistentesMap.set(m._id, m);
      });
    }
    
    // 3. Asignar habitaciones asociadas
    if (tieneHabitaciones) {
      console.log(`Encontradas ${serviciosAdicionales.habitaciones.length} habitaciones asociadas al evento`);
      
      for (const habitacion of serviciosAdicionales.habitaciones) {
        // Solo asignar si la habitación tiene ID
        if (habitacion._id || habitacion.reservaHabitacionId) {
          const habitacionId = habitacion._id || habitacion.reservaHabitacionId;
          
          // Verificar si la habitación existe en nuestro mapa local (sin hacer petición)
          if (!habitacionesExistentesMap.has(habitacionId)) {
            console.log(`Habitación ${habitacionId} no encontrada en la base de datos, omitiendo asignación`);
            resultados.habitacionesAsignadas.push({ 
              id: habitacionId, 
              error: 'Habitación no encontrada en la base de datos',
              omitida: true
            });
            continue;
          }
          
          try {
            console.log(`Asignando habitación ${habitacionId} asociada al evento ${id}`);
            const respHabitacion = await apiClient.put(`/reservas/habitaciones/${habitacionId}/asignar`, data);
            resultados.habitacionesAsignadas.push({ id: habitacionId, resultado: respHabitacion });
          } catch (err) {
            // Si es un error 404, manejar de forma silenciosa
            if (err.status === 404) {
              console.log(`Error 404 al asignar habitación ${habitacionId}, recurso no encontrado`);
              resultados.habitacionesAsignadas.push({ 
                id: habitacionId, 
                error: 'Recurso no encontrado', 
                omitida: true
              });
            } else {
              console.error(`Error al asignar habitación ${habitacionId}:`, err.message || err);
              resultados.habitacionesAsignadas.push({ id: habitacionId, error: err.message });
            }
          }
        }
      }
    }
    
    // 4. Asignar masajes asociados
    if (tieneMasajes) {
      console.log(`Encontrados ${serviciosAdicionales.masajes.length} masajes asociados al evento`);
      
      for (const masaje of serviciosAdicionales.masajes) {
        // Solo asignar si el masaje tiene ID
        if (masaje._id || masaje.reservaMasajeId) {
          const masajeId = masaje._id || masaje.reservaMasajeId;
          
          // Verificar si el masaje existe en nuestro mapa local (sin hacer petición)
          if (!masajesExistentesMap.has(masajeId)) {
            console.log(`Masaje ${masajeId} no encontrado en la base de datos, omitiendo asignación`);
            resultados.masajesAsignados.push({ 
              id: masajeId, 
              error: 'Masaje no encontrado en la base de datos',
              omitida: true
            });
            continue;
          }
          
          try {
            console.log(`Asignando masaje ${masajeId} asociado al evento ${id}`);
            const respMasaje = await apiClient.put(`/reservas/masajes/${masajeId}/asignar`, data);
            resultados.masajesAsignados.push({ id: masajeId, resultado: respMasaje });
          } catch (err) {
            // Si es un error 404, manejar de forma silenciosa
            if (err.status === 404) {
              console.log(`Error 404 al asignar masaje ${masajeId}, recurso no encontrado`);
              resultados.masajesAsignados.push({ 
                id: masajeId, 
                error: 'Recurso no encontrado', 
                omitida: true
              });
            } else {
              console.error(`Error al asignar masaje ${masajeId}:`, err.message || err);
              resultados.masajesAsignados.push({ id: masajeId, error: err.message });
            }
          }
        }
      }
    }
    
    console.log('Resultados completos de asignación:', resultados);
    
    // Calcular solo los servicios que se asignaron correctamente (sin errores)
    const habitacionesExitosas = resultados.habitacionesAsignadas.filter(h => !h.error && !h.omitida).length;
    const masajesExitosos = resultados.masajesAsignados.filter(m => !m.error && !m.omitida).length;
    
    // Devolver el resultado del evento con información adicional
    return {
      ...response,
      resultadosAdicionales: {
        habitaciones: habitacionesExitosas,
        masajes: masajesExitosos,
        totalAsignados: habitacionesExitosas + masajesExitosos,
        habitacionesOmitidas: resultados.habitacionesAsignadas.filter(h => h.omitida).length,
        masajesOmitidos: resultados.masajesAsignados.filter(m => m.omitida).length
      }
    };
  } catch (error) {
    console.error(`Error al asignar reserva de evento ${id}:`, error);
    throw error;
  }
};

// Servicios para reservas de masajes
export const getMasajeReservations = async () => {
  try {
    // Obtener reservas de masajes independientes
    console.log('Solicitando reservas de masajes al servidor...');
    
    const masajesResponse = await apiClient.get('/reservas/masajes');
    
    console.log('Respuesta de masajes:', masajesResponse);

    let masajes = [];
    let masajesIds = new Set(); // Conjunto para almacenar IDs y evitar duplicados

    // Procesar masajes
    if (masajesResponse) {
      console.log('Procesando masajes...');
      // La respuesta ya viene transformada por el interceptor
      const masajesData = Array.isArray(masajesResponse) 
        ? masajesResponse 
        : (masajesResponse.data && Array.isArray(masajesResponse.data) 
            ? masajesResponse.data 
            : []);
      
      console.log('Datos de masajes:', masajesData);
      
      // Filtrar y procesar masajes únicos
      const masajesUnicos = masajesData
        .filter(m => {
          // Si no tiene ID, lo ignoramos
          if (!m._id && !m.id) return false;
          
          const masajeId = m._id || m.id;
          // Si ya hemos procesado este ID, lo ignoramos
          if (masajesIds.has(masajeId)) return false;
          
          // Almacenar el ID en el Set para evitar duplicados
          masajesIds.add(masajeId);
          return true;
        })
        .map(m => ({
          ...m,
          _id: m._id || m.id, // Asegurar que siempre hay un ID
          tipo: 'masaje',
          tipoDisplay: 'Masaje',
          fechaDisplay: new Date(m.fecha).toLocaleDateString(),
          tituloDisplay: getTipoMasajeDisplay(m.tipoMasaje), // Usar función helper
          clienteDisplay: `${m.nombreContacto || ''} ${m.apellidosContacto || ''}`,
          detallesUrl: `/admin/reservaciones/masaje/${m._id || m.id}`,
          estado: m.estadoReserva || 'Pendiente',
          esIndependiente: !m.reservaEvento,
          // Campos necesarios para el renderizado en la vista de masajes
          nombreEvento: getTipoMasajeDisplay(m.tipoMasaje), // Usar función helper
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
        
      masajes = masajesUnicos;
    }
    
    // Ordenar por fecha (más recientes primero)
    masajes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    console.log('Total de masajes procesados sin duplicados:', masajes.length);
    return { data: masajes };
  } catch (error) {
    console.error('Error al obtener reservas de masajes:', error);
    throw error;
  }
};

// Función helper para obtener un nombre descriptivo para el tipo de masaje
const getTipoMasajeDisplay = (tipoMasaje) => {
  if (!tipoMasaje) return 'Masaje';
  
  // Si es un objeto
  if (typeof tipoMasaje === 'object' && tipoMasaje?.titulo) {
    return tipoMasaje.titulo;
  }
  
  // Si es una cadena
  if (typeof tipoMasaje === 'string') {
    // Comprobar si es un ID de MongoDB
    if (tipoMasaje.length === 24 && /^[0-9a-f]{24}$/i.test(tipoMasaje)) {
      // Ya no asumimos que es "Masaje de Piedras Calientes"
      return 'Masaje'; // Valor genérico hasta que se cargue el tipo real
    }
    return tipoMasaje;
  }
  
  return 'Masaje';
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
    // Validar que todos los campos requeridos estén presentes
    const camposRequeridos = ['tipoHabitacion', 'habitacion', 'fechaEntrada', 'fechaSalida', 'numeroHabitaciones'];
    const camposFaltantes = camposRequeridos.filter(campo => !availabilityData[campo]);

    if (camposFaltantes.length > 0) {
      console.error('Faltan campos requeridos:', camposFaltantes);
      return {
        disponible: false,
        mensaje: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`,
        habitacionesRestantes: 0
      };
    }

    // Validar fechas
    const fechaEntrada = new Date(availabilityData.fechaEntrada);
    const fechaSalida = new Date(availabilityData.fechaSalida);

    if (isNaN(fechaEntrada.getTime()) || isNaN(fechaSalida.getTime())) {
      console.error('Fechas inválidas:', { fechaEntrada, fechaSalida });
      return {
        disponible: false,
        mensaje: 'Las fechas proporcionadas no son válidas',
        habitacionesRestantes: 0
      };
    }

    const requestData = {
      tipoHabitacion: availabilityData.tipoHabitacion,
      habitacion: availabilityData.habitacion,
      fechaEntrada: availabilityData.fechaEntrada,
      fechaSalida: availabilityData.fechaSalida,
      numeroHabitaciones: availabilityData.numeroHabitaciones
    };

    console.log('Enviando solicitud de disponibilidad:', requestData);

    const response = await apiClient.post('/reservas/habitaciones/disponibilidad', requestData);
    console.log('Respuesta completa del servidor:', response);

    if (!response || typeof response !== 'object') {
      console.error('Respuesta inválida del servidor (no es un objeto):', response);
      return {
        disponible: false,
        mensaje: 'Error al verificar disponibilidad: respuesta inválida del servidor',
        habitacionesRestantes: 0
      };
    }

    // Si la respuesta está en response.data
    const data = response.data || response;
    console.log('Datos procesados de la respuesta:', data);

    if (!data || typeof data !== 'object') {
      console.error('Datos inválidos en la respuesta:', data);
      return {
        disponible: false,
        mensaje: 'Error al verificar disponibilidad: datos inválidos en la respuesta',
        habitacionesRestantes: 0
      };
    }

    return {
      disponible: data.disponible || false,
      mensaje: data.mensaje || 'No hay información de disponibilidad',
      habitacionesRestantes: data.habitacionesRestantes || 0
    };

  } catch (error) {
    console.error('Error al verificar disponibilidad:', {
      mensaje: error.message,
      estado: error.response?.status,
      datos: error.response?.data
    });
    
    return {
      disponible: false,
      mensaje: error.response?.data?.mensaje || error.message || 'Error al verificar disponibilidad',
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

    // Usaremos un Map para evitar duplicados
    const habitacionesMap = new Map();
    const masajesMap = new Map(); // Añadimos un Map para masajes para evitar duplicados también

    // Procesar eventos primero para tener la referencia
    const eventosProcessed = eventosResponse?.success && Array.isArray(eventosResponse.data) 
      ? eventosResponse.data.map(e => ({
          ...e,
          tipo: 'evento',
          tipoDisplay: 'Evento',
          fechaDisplay: new Date(e.fecha).toLocaleDateString(),
          tituloDisplay: `${e.tipoEvento} - ${e.nombreEvento || ''}`,
          clienteDisplay: `${e.nombreContacto || ''} ${e.apellidosContacto || ''}`,
          detallesUrl: `/admin/reservaciones/evento/${e._id}`,
          estado: e.estadoReserva || 'Pendiente'
        }))
      : [];

    // Procesar habitaciones asociadas a eventos
    if (eventosResponse?.success && Array.isArray(eventosResponse.data)) {
      eventosResponse.data
        .filter(e => e.serviciosAdicionales?.habitaciones?.length > 0)
        .forEach(evento => {
          evento.serviciosAdicionales.habitaciones.forEach(habitacion => {
            // Determinar un nombre significativo para la habitación
            let nombreHabitacion = 'Habitación';
            if (habitacion.nombre) {
              nombreHabitacion = habitacion.nombre;
            } else if (habitacion.habitacion) {
              nombreHabitacion = habitacion.habitacion;
            } else if (habitacion.tipoHabitacion) {
              nombreHabitacion = typeof habitacion.tipoHabitacion === 'string' ? habitacion.tipoHabitacion : 'Habitación';
            }

            const fechaEntrada = habitacion.fechaEntrada || evento.fecha;
            const fechaSalida = habitacion.fechaSalida || evento.fecha;

            // Si tiene un ID de habitación real, usarlo como clave
            // Si la habitación tiene _id, usamos ese, sino intentamos con el de reservaEvento (que podría ser de reservahabitacion)
            const habitacionId = habitacion._id || 
                                habitacion.reservaHabitacionId || 
                                (habitacion.reservaEvento && habitacion.reservaEvento === evento._id ? 
                                  `${evento._id}_habitacion_${Math.random().toString(36).substring(2, 15)}` : 
                                  undefined);

            // Solo procesar si tenemos un ID válido o un evento válido
            if (habitacionId || (habitacion.tipoHabitacion && evento._id)) {
              const habitacionObj = {
                ...habitacion,
                _id: habitacionId,
                tipo: 'habitacion',
                tipoDisplay: 'Habitación (Evento)',
                fechaDisplay: `${new Date(fechaEntrada).toLocaleDateString()} - ${new Date(fechaSalida).toLocaleDateString()}`,
                tituloDisplay: `${nombreHabitacion} - ${habitacion.numeroHabitaciones || 1} hab.`,
                clienteDisplay: `${evento.nombreContacto || ''} ${evento.apellidosContacto || ''}`,
                detallesUrl: `/admin/reservaciones/evento/${evento._id}`,
                estado: evento.estadoReserva || evento.estado || 'Pendiente',
                // Importante: Asignar tanto el usuario del evento como el ID del evento a la habitación
                asignadoA: evento.asignadoA,
                eventoAsociado: {
                  id: evento._id,
                  nombre: evento.nombreEvento,
                  tipo: evento.tipoEvento,
                  fecha: evento.fecha,
                  numeroInvitados: evento.numInvitados
                },
                fechaEntrada,
                fechaSalida,
                nombreEvento: evento.nombreEvento,
                eventoId: evento._id
              };

              // Si tiene un ID, usarlo como clave; si no, usar el tipo y fecha (menos fiable)
              const mapKey = habitacionId || `${evento._id}_${habitacion.tipoHabitacion}_${fechaEntrada}`;
              habitacionesMap.set(mapKey, habitacionObj);
            }
          });
        });
    }

    // Procesar masajes asociados a eventos
    if (eventosResponse?.success && Array.isArray(eventosResponse.data)) {
      eventosResponse.data
        .filter(e => e.serviciosAdicionales?.masajes?.length > 0)
        .forEach(evento => {
          evento.serviciosAdicionales.masajes.forEach(masaje => {
            // Determinar un nombre significativo para el masaje
            let nombreMasaje = 'Masaje';
            if (masaje.tipoMasaje) {
              if (typeof masaje.tipoMasaje === 'string') {
                nombreMasaje = masaje.tipoMasaje;
              } else if (typeof masaje.tipoMasaje === 'object' && masaje.tipoMasaje.titulo) {
                nombreMasaje = masaje.tipoMasaje.titulo;
              }
            }

            const masajeId = masaje._id || 
                            masaje.reservaMasajeId || 
                            (masaje.reservaEvento && masaje.reservaEvento === evento._id ? 
                              `${evento._id}_masaje_${Math.random().toString(36).substring(2, 15)}` : 
                              undefined);

            // Solo procesar si tenemos un ID válido o un evento válido
            if (masajeId || (masaje.tipoMasaje && evento._id)) {
              const masajeObj = {
                ...masaje,
                _id: masajeId,
                tipo: 'masaje',
                tipoDisplay: 'Masaje (Evento)',
                fechaDisplay: new Date(masaje.fecha || evento.fecha).toLocaleDateString(),
                tituloDisplay: nombreMasaje,
                clienteDisplay: `${evento.nombreContacto || ''} ${evento.apellidosContacto || ''}`,
                detallesUrl: `/admin/reservaciones/evento/${evento._id}`,
                estado: evento.estadoReserva || evento.estado || 'Pendiente',
                // Importante: Asignar tanto el usuario del evento como el ID del evento al masaje
                asignadoA: evento.asignadoA,
                eventoAsociado: {
                  id: evento._id,
                  nombre: evento.nombreEvento,
                  tipo: evento.tipoEvento,
                  fecha: evento.fecha,
                  numeroInvitados: evento.numInvitados
                },
                fecha: masaje.fecha || evento.fecha,
                eventoId: evento._id
              };

              // Si tiene un ID, usarlo como clave; si no, usar el tipo y fecha
              const mapKey = masajeId || `${evento._id}_${masaje.tipoMasaje}_${masaje.fecha || evento.fecha}`;
              masajesMap.set(mapKey, masajeObj);
            }
          });
        });
    }

    // Convertir los Maps a arrays
    const habitaciones = Array.from(habitacionesMap.values());
    const masajesFromEventos = Array.from(masajesMap.values());
    
    console.log(`Dashboard: Total de habitaciones después de eliminar duplicados: ${habitaciones.length}`);
    console.log(`Dashboard: Total de masajes desde eventos: ${masajesFromEventos.length}`);

    // Procesar masajes independientes (que no están asociados a eventos)
    let masajesIndependientes = [];
    if (masajesResponse?.success && Array.isArray(masajesResponse.data)) {
      masajesIndependientes = masajesResponse.data
        // Filtrar solo los masajes que no están ya procesados como parte de un evento
        .filter(m => !masajesMap.has(m._id))
        .map(m => {
          // Determinar un nombre significativo para el masaje
          let nombreMasaje = 'Masaje';
          
          // Verificar si tenemos un nombre de masaje válido
          if (m.tipoMasaje && typeof m.tipoMasaje === 'string') {
            nombreMasaje = m.tipoMasaje;
          } else if (m.tipoMasaje && typeof m.tipoMasaje === 'object' && m.tipoMasaje.titulo) {
            nombreMasaje = m.tipoMasaje.titulo;
          } else if (m.tipoMasaje && m.tipoMasaje.length === 24 && /^[0-9a-f]{24}$/i.test(m.tipoMasaje)) {
            // Si el tipoMasaje es un ID de MongoDB, guardarlo para que se resuelva en el componente
            // que lo consume usando los tipos de masaje cargados
            nombreMasaje = "Masaje";
            m.tipoMasajeId = m.tipoMasaje; // Guardar el ID para resolver posteriormente
          } else if (m.tituloDisplay) {
            nombreMasaje = m.tituloDisplay;
          } else if (m.titulo) {
            nombreMasaje = m.titulo;
          } else if (m.nombre) {
            nombreMasaje = m.nombre;
          }
          
          // Asegurar que hay información de contacto válida
          const nombre = m.nombreContacto || m.nombre || '';
          const apellidos = m.apellidosContacto || m.apellidos || '';
          
          // Si este masaje tiene reservaEvento, buscar el evento correspondiente y establecer eventoId
          let eventoId = null;
          if (m.reservaEvento) {
            eventoId = m.reservaEvento;
            // Buscar si existe el evento para obtener más información
            const eventoRelacionado = eventosProcessed.find(e => e._id === m.reservaEvento);
            if (eventoRelacionado) {
              // Asignar el mismo usuario que tiene asignado el evento
              m.asignadoA = eventoRelacionado.asignadoA;
            }
          }
          
          return {
            ...m,
            tipo: 'masaje',
            tipoDisplay: 'Masaje',
            fechaDisplay: new Date(m.fecha).toLocaleDateString(),
            tituloDisplay: nombreMasaje,
            clienteDisplay: `${nombre} ${apellidos}`.trim() || 'Cliente',
            detallesUrl: `/admin/reservaciones/masaje/${m._id}`,
            estado: m.estadoReserva || m.estado || 'Pendiente',
            tipoMasaje: m.tipoMasaje, // Preservar el valor original de tipoMasaje
            tipoMasajeId: m.tipoMasajeId || (m.tipoMasaje && typeof m.tipoMasaje === 'string' && 
                        m.tipoMasaje.length === 24 && /^[0-9a-f]{24}$/i.test(m.tipoMasaje) 
                        ? m.tipoMasaje : null), // Guardar el ID si es un ID de MongoDB
            eventoId: eventoId // Añadir el ID del evento si existe
          };
        });
    }

    // Combinar los masajes de eventos con los independientes
    const masajes = [...masajesFromEventos, ...masajesIndependientes];
    console.log(`Dashboard: Total de masajes después de procesar: ${masajes.length}`);

    // Incluir eventos en el resultado final
    const eventos = eventosProcessed;

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
    // Validar que el ID tenga un formato correcto
    if (!id || typeof id !== 'string') {
      console.error('ID de habitación no válido:', id);
      throw new Error('ID de habitación no válido');
    }
    
    // Caso especial: si el ID contiene "_habitacion_", estamos tratando de eliminar una habitación
    // que es parte de un evento, no un registro independiente en la colección reservahabitacions
    if (id.includes('_habitacion_')) {
      console.log('Detectada habitación dentro de evento. ID:', id);
      const eventId = id.split('_habitacion_')[0];
      
      if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
        console.error('ID de evento no válido:', eventId);
        throw new Error('ID de evento no válido');
      }
      
      // Obtener el evento primero
      const evento = await apiClient.get(`/reservas/eventos/${eventId}`);
      
      if (!evento || !evento.data) {
        console.error('Evento no encontrado:', eventId);
        throw new Error('Evento no encontrado');
      }
      
      console.log('Evento encontrado:', evento.data);
      
      // Verificar que tenga habitaciones
      if (!evento.data.serviciosAdicionales?.habitaciones || 
          !Array.isArray(evento.data.serviciosAdicionales.habitaciones) || 
          evento.data.serviciosAdicionales.habitaciones.length === 0) {
        console.error('El evento no tiene habitaciones:', evento.data);
        throw new Error('El evento no tiene habitaciones');
      }
      
      // Crear una copia del evento para modificarlo
      const eventoActualizado = {
        ...evento.data,
        serviciosAdicionales: {
          ...evento.data.serviciosAdicionales,
          habitaciones: evento.data.serviciosAdicionales.habitaciones.filter((_, index) => {
            // El índice de la habitación está en el ID después de "_habitacion_"
            const habitacionIndex = parseInt(id.split('_habitacion_')[1]) - 1;
            return index !== habitacionIndex;
          })
        },
        // Bandera para indicar que es una operación de eliminación de habitación
        _operacion_eliminacion_habitacion: true
      };
      
      console.log('Evento con habitación eliminada:', eventoActualizado);
      
      // Actualizar el evento con la habitación eliminada
      const response = await apiClient.put(`/reservas/eventos/${eventId}`, eventoActualizado);
      
      if (response && response.success) {
        return {
          success: true,
          message: 'Habitación eliminada correctamente del evento',
          data: response.data
        };
      } else {
        throw new Error('Error al actualizar el evento');
      }
    } else {
      // Caso normal: eliminar una reserva de habitación independiente
      const cleanId = id;
      const response = await apiClient.delete(`/reservas/habitaciones/${cleanId}`);
      return response;
    }
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
    
    // 1. Obtener el evento completo para encontrar habitaciones y masajes asociados
    const eventoResponse = await apiClient.get(`/reservas/eventos/${id}`);
    const evento = eventoResponse?.data || {};
    const serviciosAdicionales = evento.serviciosAdicionales || {};
    
    // Variables para almacenar resultados
    const resultados = {
      evento: null,
      habitacionesDesasignadas: [],
      masajesDesasignados: []
    };
    
    // 2. Verificar si hay habitaciones y masajes asociados
    const tieneHabitaciones = serviciosAdicionales.habitaciones && serviciosAdicionales.habitaciones.length > 0;
    const tieneMasajes = serviciosAdicionales.masajes && serviciosAdicionales.masajes.length > 0;
    
    if (!tieneHabitaciones && !tieneMasajes) {
      console.log('No hay servicios adicionales para desasignar con este evento');
      const response = await apiClient.put(`/reservas/eventos/${id}/desasignar`);
      resultados.evento = response;
      
      return {
        ...response,
        resultadosAdicionales: {
          habitaciones: 0,
          masajes: 0,
          totalDesasignados: 0,
          habitacionesOmitidas: 0,
          masajesOmitidos: 0
        }
      };
    }
    
    // Optimización: Obtener listas completas de habitaciones y masajes existentes
    const [todasHabitaciones, todosMasajes] = await Promise.all([
      tieneHabitaciones ? apiClient.get('/reservas/habitaciones') : { data: [] },
      tieneMasajes ? apiClient.get('/reservas/masajes') : { data: [] }
    ]);
    
    // Crear conjuntos de IDs para búsqueda eficiente
    const habitacionesExistentesMap = new Map();
    const masajesExistentesMap = new Map();
    
    if (tieneHabitaciones && todasHabitaciones?.data) {
      const habitacionesArray = Array.isArray(todasHabitaciones.data) ? todasHabitaciones.data : [];
      habitacionesArray.forEach(h => {
        if (h._id) habitacionesExistentesMap.set(h._id, h);
      });
    }
    
    if (tieneMasajes && todosMasajes?.data) {
      const masajesArray = Array.isArray(todosMasajes.data) ? todosMasajes.data : [];
      masajesArray.forEach(m => {
        if (m._id) masajesExistentesMap.set(m._id, m);
      });
    }
    
    // 2. Desasignar habitaciones asociadas
    if (tieneHabitaciones) {
      console.log(`Encontradas ${serviciosAdicionales.habitaciones.length} habitaciones asociadas al evento`);
      
      for (const habitacion of serviciosAdicionales.habitaciones) {
        // Solo desasignar si la habitación tiene ID
        if (habitacion._id || habitacion.reservaHabitacionId) {
          const habitacionId = habitacion._id || habitacion.reservaHabitacionId;
          
          // Verificar si la habitación existe en nuestro mapa local (sin hacer petición)
          if (!habitacionesExistentesMap.has(habitacionId)) {
            console.log(`Habitación ${habitacionId} no encontrada en la base de datos, omitiendo desasignación`);
            resultados.habitacionesDesasignadas.push({ 
              id: habitacionId, 
              error: 'Habitación no encontrada en la base de datos',
              omitida: true
            });
            continue;
          }
          
          try {
            console.log(`Desasignando habitación ${habitacionId} asociada al evento ${id}`);
            const respHabitacion = await apiClient.put(`/reservas/habitaciones/${habitacionId}/desasignar`);
            resultados.habitacionesDesasignadas.push({ id: habitacionId, resultado: respHabitacion });
          } catch (err) {
            // Si es un error 404, manejar de forma silenciosa
            if (err.status === 404) {
              console.log(`Error 404 al desasignar habitación ${habitacionId}, recurso no encontrado`);
              resultados.habitacionesDesasignadas.push({ 
                id: habitacionId, 
                error: 'Recurso no encontrado', 
                omitida: true
              });
            } else {
              console.error(`Error al desasignar habitación ${habitacionId}:`, err.message || err);
              resultados.habitacionesDesasignadas.push({ id: habitacionId, error: err.message });
            }
          }
        }
      }
    }
    
    // 3. Desasignar masajes asociados
    if (tieneMasajes) {
      console.log(`Encontrados ${serviciosAdicionales.masajes.length} masajes asociados al evento`);
      
      for (const masaje of serviciosAdicionales.masajes) {
        // Solo desasignar si el masaje tiene ID
        if (masaje._id || masaje.reservaMasajeId) {
          const masajeId = masaje._id || masaje.reservaMasajeId;
          
          // Verificar si el masaje existe en nuestro mapa local (sin hacer petición)
          if (!masajesExistentesMap.has(masajeId)) {
            console.log(`Masaje ${masajeId} no encontrado en la base de datos, omitiendo desasignación`);
            resultados.masajesDesasignados.push({ 
              id: masajeId, 
              error: 'Masaje no encontrado en la base de datos',
              omitida: true
            });
            continue;
          }
          
          try {
            console.log(`Desasignando masaje ${masajeId} asociado al evento ${id}`);
            const respMasaje = await apiClient.put(`/reservas/masajes/${masajeId}/desasignar`);
            resultados.masajesDesasignados.push({ id: masajeId, resultado: respMasaje });
          } catch (err) {
            // Si es un error 404, manejar de forma silenciosa
            if (err.status === 404) {
              console.log(`Error 404 al desasignar masaje ${masajeId}, recurso no encontrado`);
              resultados.masajesDesasignados.push({ 
                id: masajeId, 
                error: 'Recurso no encontrado', 
                omitida: true
              });
            } else {
              console.error(`Error al desasignar masaje ${masajeId}:`, err.message || err);
              resultados.masajesDesasignados.push({ id: masajeId, error: err.message });
            }
          }
        }
      }
    }
    
    // 4. Desasignar el evento después de desasignar los servicios
    const response = await apiClient.put(`/reservas/eventos/${id}/desasignar`);
    resultados.evento = response;
    
    console.log('Resultados completos de desasignación:', resultados);
    console.log('Respuesta de desasignación de evento:', response);
    
    // Calcular solo los servicios que se desasignaron correctamente (sin errores)
    const habitacionesExitosas = resultados.habitacionesDesasignadas.filter(h => !h.error && !h.omitida).length;
    const masajesExitosos = resultados.masajesDesasignados.filter(m => !m.error && !m.omitida).length;
    
    // Devolver el resultado del evento con información adicional
    return {
      ...response,
      resultadosAdicionales: {
        habitaciones: habitacionesExitosas,
        masajes: masajesExitosos,
        totalDesasignados: habitacionesExitosas + masajesExitosos,
        habitacionesOmitidas: resultados.habitacionesDesasignadas.filter(h => h.omitida).length,
        masajesOmitidos: resultados.masajesDesasignados.filter(m => m.omitida).length
      }
    };
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