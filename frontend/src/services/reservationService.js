import apiClient from './apiClient';

// Servicios para reservas de habitaciones
export const getHabitacionReservations = async (filtro = {}) => {
  try {
    console.log('Obteniendo SOLO reservas de la colección ReservaHabitacion...');
    
    // Construir los parámetros de consulta basados en el filtro
    const params = new URLSearchParams();
    
    if (filtro.disponibles) {
      params.append('disponibles', 'true');
    }
    
    if (filtro.misReservas) {
      params.append('misReservas', 'true');
    }
    
    if (filtro.sinAsignar) {
      params.append('sinAsignar', 'true');
    }
    
    if (filtro.fecha) {
      params.append('fecha', filtro.fecha);
    }
    
    // Añadir un parámetro para indicar que solo queremos reservas del modelo ReservaHabitacion
    params.append('soloReservaHabitacion', 'true');
    
    const url = `/reservas/habitaciones${params.toString() ? '?' + params.toString() : ''}`;
    console.log('URL de petición habitaciones:', url);
    
    // Obtener SOLO las reservas de habitaciones del modelo ReservaHabitacion
    const habitacionesResponse = await apiClient.get(url);
    
    console.log('Respuesta de habitaciones de ReservaHabitacion:', habitacionesResponse);

    let habitaciones = [];

    // Procesar habitaciones
    if (habitacionesResponse) {
      // La respuesta ya viene transformada por el interceptor
      const habitacionesData = Array.isArray(habitacionesResponse) 
        ? habitacionesResponse 
        : (habitacionesResponse.data && Array.isArray(habitacionesResponse.data) 
            ? habitacionesResponse.data 
            : []);
      
      console.log('Datos de habitaciones de ReservaHabitacion:', habitacionesData);
      
      habitaciones = habitacionesData.map(h => ({
        ...h,
        _id: h._id || h.id, // Asegurar que siempre hay un ID
        tipo: 'habitacion',
        tipoDisplay: h.reservaEvento ? 'Habitación de Evento' : 'Habitación Independiente',
        fechaDisplay: `${new Date(h.fechaEntrada).toLocaleDateString()} - ${new Date(h.fechaSalida).toLocaleDateString()}`,
        tituloDisplay: h.habitacion || h.tipoHabitacion || 'Habitación',
        clienteDisplay: `${h.nombreContacto || ''} ${h.apellidosContacto || ''}`,
        detallesUrl: `/admin/reservaciones/habitacion/${h._id || h.id}`,
        estado: h.estadoReserva || h.estado || 'pendiente',
        esIndependiente: !h.reservaEvento,
        esParteDePaquete: !!h.reservaEvento
      }));
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
    
    // Procesar la respuesta para asegurar que tipoHabitacion y habitacion estén en el formato correcto
    if (response && response.data) {
      const reserva = response.data;
      
      // Procesar tipoHabitacion
      if (typeof reserva.tipoHabitacion === 'string' && reserva.tipoHabitacionObj) {
        // Si tenemos el objeto completo, usarlo
        reserva.tipoHabitacion = reserva.tipoHabitacionObj;
      }
      
      if (typeof reserva.tipoHabitacion === 'object' && reserva.tipoHabitacion !== null) {
        // Si es un objeto pero no tiene nombre, intentar construirlo
        if (!reserva.tipoHabitacion.nombre) {
          reserva.tipoHabitacion = {
            ...reserva.tipoHabitacion,
            nombre: reserva.tipoHabitacion.titulo || reserva.tipoHabitacion.tipo || 'standard',
            tipo: reserva.tipoHabitacion.tipo || 'standard'
          };
        }
      } else if (typeof reserva.tipoHabitacion === 'string') {
        // Si es un string, convertirlo a objeto
        const tipoOriginal = reserva.tipoHabitacion;
        reserva.tipoHabitacion = {
          nombre: tipoOriginal,
          tipo: tipoOriginal,
          _id: reserva.tipoHabitacionId || tipoOriginal
        };
      }
      
      // Procesar habitacion
      if (typeof reserva.habitacion === 'string' && reserva.habitacionObj) {
        // Si tenemos el objeto completo, usarlo
        reserva.habitacion = reserva.habitacionObj;
      }
      
      if (typeof reserva.habitacion === 'object' && reserva.habitacion !== null) {
        if (!reserva.habitacion.nombre) {
          reserva.habitacion = {
            ...reserva.habitacion,
            nombre: reserva.habitacion.titulo || 'Habitación sin nombre',
            tipo: reserva.habitacion.tipo || reserva.tipoHabitacion?.tipo || 'standard'
          };
        }
      } else if (typeof reserva.habitacion === 'string') {
        const nombreOriginal = reserva.habitacion;
        reserva.habitacion = {
          nombre: nombreOriginal,
          tipo: reserva.tipoHabitacion?.tipo || 'standard',
          _id: reserva.habitacionId || nombreOriginal
        };
      }
      
      // Si existe datosCompletos, también procesar allí
      if (reserva.datosCompletos) {
        if (reserva.datosCompletos.tipoHabitacion) {
          reserva.datosCompletos.tipoHabitacion = typeof reserva.datosCompletos.tipoHabitacion === 'object' 
            ? {
                ...reserva.datosCompletos.tipoHabitacion,
                nombre: reserva.datosCompletos.tipoHabitacion.nombre || 
                       reserva.datosCompletos.tipoHabitacion.titulo || 
                       reserva.datosCompletos.tipoHabitacion.tipo || 
                       'standard'
              }
            : { nombre: reserva.datosCompletos.tipoHabitacion, tipo: 'standard' };
        }
        
        if (reserva.datosCompletos.habitacion) {
          reserva.datosCompletos.habitacion = typeof reserva.datosCompletos.habitacion === 'object'
            ? {
                ...reserva.datosCompletos.habitacion,
                nombre: reserva.datosCompletos.habitacion.nombre ||
                       reserva.datosCompletos.habitacion.titulo ||
                       'Habitación sin nombre'
              }
            : { nombre: reserva.datosCompletos.habitacion };
        }
      }
      
      return {
        success: true,
        data: reserva
      };
    }
    
    return response;
  } catch (error) {
    console.error(`Error al obtener reserva de habitación ${id}:`, error.message || error);
    return { success: false, data: null, message: error.message };
  }
};

export const createHabitacionReservation = async (reservationData) => {
  try {
    // Verificar campos mínimos esenciales y proporcionar valores predeterminados
    const tipoHabitacion = reservationData.tipoHabitacion || 'standard';
    const fechaEntrada = reservationData.fechaEntrada;
    const fechaSalida = reservationData.fechaSalida;

    // Validar campos obligatorios con mejor información de error
    const camposObligatorios = ['fechaEntrada', 'fechaSalida'];
    const camposFaltantes = camposObligatorios.filter(campo => !reservationData[campo]);
    
    if (camposFaltantes.length > 0) {
      console.error('Datos de reserva incompletos:', reservationData);
      console.error('Campos faltantes:', camposFaltantes);
      throw new Error(`Faltan campos obligatorios para la reserva: ${camposFaltantes.join(', ')}`);
    }

    // Verificar si es una reserva para evento o para hotel
    if (reservationData.tipoReserva === 'evento') {
      // Si tiene un eventoId, es una reserva asociada a un evento existente
      if (reservationData.eventoId) {
        // Agregar la habitación a un evento existente
        const response = await apiClient.post(`/reservas/eventos/${reservationData.eventoId}/habitaciones`, {
          tipoHabitacion: tipoHabitacion,
          habitacion: reservationData.habitacion || reservationData.nombre || 'Sin asignar',
          fechaEntrada: fechaEntrada,
          fechaSalida: fechaSalida,
          precio: reservationData.precio || reservationData.precioTotal || 0,
          numeroHabitaciones: reservationData.numeroHabitaciones || 1,
          numHuespedes: reservationData.numHuespedes || 2
        });
        return response;
      } else {
        // Crear un nuevo evento con habitación
        const response = await apiClient.post('/reservas/eventos', {
          tipoEvento: reservationData.tipoEvento || 'Estancia',
          nombreEvento: reservationData.nombreEvento || 'Reserva de habitaciones',
          nombreContacto: reservationData.nombreContacto || '',
          apellidosContacto: reservationData.apellidosContacto || '',
          emailContacto: reservationData.emailContacto || '',
          telefonoContacto: reservationData.telefonoContacto || '',
          fecha: fechaEntrada,
          serviciosAdicionales: {
            habitaciones: [{
              tipoHabitacion: tipoHabitacion,
              habitacion: reservationData.habitacion || reservationData.nombre || 'Sin asignar',
              fechaEntrada: fechaEntrada,
              fechaSalida: fechaSalida,
              precio: reservationData.precio || reservationData.precioTotal || 0,
              numeroHabitaciones: reservationData.numeroHabitaciones || 1,
              numHuespedes: reservationData.numHuespedes || 2
            }]
          }
        });
        return response;
      }
    } else {
      // Es una reserva de hotel independiente - asegurar que todos los campos tengan valores predeterminados
      console.log('Creando reserva de hotel independiente con datos:', reservationData);
      
      const requestData = {
        tipoHabitacion: tipoHabitacion,
        habitacion: reservationData.habitacion || reservationData.nombre || 'Sin asignar',
        fechaEntrada: fechaEntrada,
        fechaSalida: fechaSalida,
        precio: reservationData.precioTotal || reservationData.precio || 0,
        precioPorNoche: reservationData.precioPorNoche || 0,
        numeroHabitaciones: reservationData.numeroHabitaciones || 1,
        numHuespedes: reservationData.numHuespedes || 2,
        nombreContacto: reservationData.nombreContacto || '',
        apellidosContacto: reservationData.apellidosContacto || '',
        emailContacto: reservationData.emailContacto || '',
        telefonoContacto: reservationData.telefonoContacto || '',
        peticionesEspeciales: reservationData.peticionesEspeciales || '',
        tipoReserva: 'hotel',
        categoriaHabitacion: reservationData.categoriaHabitacion || 'doble',
        metodoPago: reservationData.metodoPago || 'efectivo',
        estadoPago: reservationData.metodoPago === 'tarjeta' ? 'procesando' : 'pendiente',
        infoHuespedes: reservationData.infoHuespedes || {
          nombres: [],
          detalles: ''
        }
      };
      
      // Log completo para depuración
      console.log('Datos finales enviados al servidor:', requestData);
      
      const response = await apiClient.post('/reservas/habitaciones', requestData);
      return response;
    }
  } catch (error) {
    console.error('Error al crear la reserva de habitación:', error);
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
    console.log(`Iniciando asignación de habitación ${id}`);
    
    // Primero verificar si la habitación es parte de un evento
    const habitacionResponse = await apiClient.get(`/reservas/habitaciones/${id}`);
    const habitacion = habitacionResponse?.data || {};
    
    // Si la habitación está asociada a un evento, intentar asignar el evento primero
    if (habitacion.reservaEvento) {
      console.log(`La habitación ${id} está asociada al evento ${habitacion.reservaEvento}, asignando el evento primero`);
      
      try {
        // Asignar el evento completo (esto asignará todas las habitaciones asociadas, incluida esta)
        const eventoResponse = await assignEventoReservation(habitacion.reservaEvento, usuarioId);
        
        // No necesitamos asignar la habitación individualmente, ya se asignó con el evento
        return {
          success: true,
          message: 'Habitación asignada como parte del evento asociado',
          data: {
            ...habitacion,
            asignadoA: usuarioId || 'current_user',
          },
          resultadosAdicionales: eventoResponse.resultadosAdicionales
        };
      } catch (eventError) {
        console.error(`Error al asignar el evento asociado ${habitacion.reservaEvento}:`, eventError);
        // Continuar con la asignación individual de la habitación si falla la asignación del evento
      }
    }
    
    // Asignar solo la habitación (caso de habitación suelta)
    const data = usuarioId ? { usuarioId } : {};
    console.log(`Asignando habitación independiente ${id} con datos:`, data);
    
    const response = await apiClient.put(`/reservas/habitaciones/${id}/asignar`, data);
    
    // Añadir datos adicionales para ayudar con la actualización de la UI
    return {
      ...response,
      resultadosAdicionales: {
        habitaciones: 0,
        totalAsignados: 1,
        habitacionesOmitidas: 0
      }
    };
  } catch (error) {
    console.error(`Error al asignar reserva de habitación ${id}:`, error.message || error);
    throw error;
  }
};

// Servicios para reservas de eventos
export const getEventoReservations = async (filtro = {}) => {
  try {
    // Construir los parámetros de consulta basados en el filtro
    const params = new URLSearchParams();
    
    if (filtro.disponibles) {
      params.append('disponibles', 'true');
    }
    
    if (filtro.misReservas) {
      params.append('misReservas', 'true');
      console.log('Solicitando específicamente eventos asignados al usuario actual');
    }
    
    if (filtro.sinAsignar) {
      params.append('sinAsignar', 'true');
    }
    
    if (filtro.fecha) {
      params.append('fecha', filtro.fecha);
    }
    
    // Añadir timestamp para evitar caché si existe
    if (filtro._t) {
      params.append('_t', filtro._t);
    }
    
    const url = `/reservas/eventos${params.toString() ? '?' + params.toString() : ''}`;
    console.log('URL de petición eventos:', url);
    
    const response = await apiClient.get(url);
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
    
    // Procesar la respuesta para asegurar que las habitaciones tengan los nombres correctos
    if (response && response.data) {
      const evento = response.data;
      
      // Si hay servicios adicionales con habitaciones, procesar cada habitación
      if (evento.serviciosAdicionales && Array.isArray(evento.serviciosAdicionales.habitaciones)) {
        evento.serviciosAdicionales.habitaciones = evento.serviciosAdicionales.habitaciones.map(habitacion => {
          // Procesar tipoHabitacion
          if (typeof habitacion.tipoHabitacion === 'object' && habitacion.tipoHabitacion !== null) {
            habitacion.tipoHabitacion = habitacion.tipoHabitacion.nombre || 
                                      habitacion.tipoHabitacion.titulo || 
                                      habitacion.tipoHabitacion.tipo || 
                                      'No especificado';
          }
          
          // Procesar habitacion
          if (typeof habitacion.habitacion === 'object' && habitacion.habitacion !== null) {
            habitacion.habitacion = habitacion.habitacion.nombre || 
                                  habitacion.habitacion.titulo || 
                                  habitacion.habitacion;
          }
          
          return habitacion;
        });
      }
      
      return {
        success: true,
        data: evento
      };
    }
    
    return response;
  } catch (error) {
    console.error(`Error al obtener reserva de evento ${id}:`, error.message || error);
    return { success: false, data: null, message: error.message };
  }
};

export const createEventoReservation = async (reservaData) => {
  try {
    const response = await apiClient.post('/reservas/eventos', reservaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear la reserva de evento:', error);
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
    
    // 1. Asignar el evento
    const response = await apiClient.put(`/reservas/eventos/${id}/asignar`, data);
    console.log('Respuesta de asignación de evento:', response);
    
    // 2. Obtener el evento completo para encontrar habitaciones asociadas
    const eventoResponse = await apiClient.get(`/reservas/eventos/${id}`);
    const evento = eventoResponse?.data || {};
    const serviciosAdicionales = evento.serviciosAdicionales || {};
    
    // Variables para almacenar resultados
    const resultados = {
      evento: response,
      habitacionesAsignadas: []
    };
    
    // 3. Verificar si hay habitaciones asociadas
    const tieneHabitaciones = serviciosAdicionales.habitaciones && serviciosAdicionales.habitaciones.length > 0;
    
    if (!tieneHabitaciones) {
      console.log('No hay habitaciones asociadas a este evento');
      
      return {
        ...response,
        resultadosAdicionales: {
          habitaciones: 0,
          totalAsignados: 1,
          habitacionesOmitidas: 0
        }
      };
    }
    
    // Obtener lista completa de habitaciones existentes
    const habitacionesResponse = await apiClient.get('/reservas/habitaciones');
    const todasHabitaciones = habitacionesResponse?.data || [];
    
    // Crear mapa de IDs para búsqueda eficiente
    const habitacionesExistentesMap = new Map();
    
    if (Array.isArray(todasHabitaciones)) {
      todasHabitaciones.forEach(h => {
        // Almacenar tanto por _id como por id para manejar ambos formatos
        if (h._id) habitacionesExistentesMap.set(h._id, h);
        if (h.id && h.id !== h._id) habitacionesExistentesMap.set(h.id, h);
      });
    }
    
    // 3. Asignar habitaciones asociadas al evento
    if (tieneHabitaciones) {
      console.log(`Encontradas ${serviciosAdicionales.habitaciones.length} habitaciones asociadas al evento ${id}`);
      
      for (const habitacion of serviciosAdicionales.habitaciones) {
        // Obtener el ID de la habitación de cualquiera de los campos posibles
        const habitacionId = habitacion._id || habitacion.reservaHabitacionId || habitacion.id;
        
        // Verificar que existe un ID válido
        if (!habitacionId) {
          console.log('Habitación sin ID válido, omitiendo');
          resultados.habitacionesAsignadas.push({ 
            error: 'Habitación sin ID válido',
            omitida: true
          });
          continue;
        }
        
        // Verificar si la habitación existe en nuestro mapa local
        const habitacionExistente = habitacionesExistentesMap.get(habitacionId);
        if (!habitacionExistente) {
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
          // Usar los mismos datos de asignación que para el evento
          const respHabitacion = await apiClient.put(`/reservas/habitaciones/${habitacionId}/asignar`, data);
          resultados.habitacionesAsignadas.push({ id: habitacionId, resultado: respHabitacion });
        } catch (err) {
          console.error(`Error al asignar habitación ${habitacionId}:`, err.message || err);
          resultados.habitacionesAsignadas.push({ 
            id: habitacionId, 
            error: err.message || 'Error desconocido',
            omitida: true 
          });
        }
      }
    }
    
    console.log('Resultados completos de asignación:', resultados);
    
    // Calcular solo los servicios que se asignaron correctamente (sin errores)
    const habitacionesExitosas = resultados.habitacionesAsignadas.filter(h => !h.error && !h.omitida).length;
    const habitacionesOmitidas = resultados.habitacionesAsignadas.filter(h => h.omitida).length;
    
    // Devolver el resultado del evento con información adicional
    return {
      ...response,
      resultadosAdicionales: {
        habitaciones: habitacionesExitosas,
        totalAsignados: habitacionesExitosas + 1, // +1 por el evento
        habitacionesOmitidas: habitacionesOmitidas
      }
    };
  } catch (error) {
    console.error(`Error al asignar reserva de evento ${id}:`, error);
    throw error;
  }
};

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

// Obtener todas las reservas para el dashboard
export const getAllReservationsForDashboard = async () => {
  try {
    const [habitacionesResponse, eventosResponse] = await Promise.all([
      apiClient.get('/reservas/habitaciones'),
      apiClient.get('/reservas/eventos')
    ]);

    // Procesar eventos
    const eventosProcessed = eventosResponse?.data?.map(e => ({
      ...e,
      id: e._id || e.id,
      tipo: 'evento',
      tipoDisplay: 'Evento',
      fechaDisplay: new Date(e.fecha).toLocaleDateString(),
      tituloDisplay: `${e.tipoEvento?.titulo || e.tipoEvento || 'Evento'} - ${e.nombreEvento || ''}`,
      clienteDisplay: `${e.nombreContacto || ''} ${e.apellidosContacto || ''}`.trim() || 'Cliente',
      detallesUrl: `/admin/reservaciones/evento/${e._id || e.id}`,
      estado: e.estadoReserva || e.estado || 'pendiente',
      total: parseFloat(e.total || e.precioTotal || 0),
      datosCompletos: {
        ...e,
        tipoEvento: e.tipoEvento,
        nombreEvento: e.nombreEvento,
        presupuestoEstimado: e.presupuestoEstimado,
        habitacionesAsociadas: e.habitacionesAsociadas || 0
      }
    })) || [];

    // Procesar habitaciones
    const habitacionesProcessed = habitacionesResponse?.data?.map(h => {
      // Determinar si es parte de un evento
      const eventoAsociado = h.reservaEvento || h.eventoId;
      const esParteDePaquete = !!eventoAsociado;

      // Procesar tipoHabitacion
      let tipoHabitacionProcesado = h.tipoHabitacion;
      if (typeof h.tipoHabitacion === 'object' && h.tipoHabitacion !== null) {
        tipoHabitacionProcesado = {
          ...h.tipoHabitacion,
          nombre: h.tipoHabitacion.nombre || h.tipoHabitacion.titulo || h.tipoHabitacion.tipo || 'standard',
          tipo: h.tipoHabitacion.tipo || 'standard'
        };
      } else if (typeof h.tipoHabitacion === 'string') {
        tipoHabitacionProcesado = {
          nombre: h.tipoHabitacion,
          tipo: h.tipoHabitacion,
          _id: h.tipoHabitacionId || h.tipoHabitacion
        };
      }

      // Procesar habitacion
      let habitacionProcesada = h.habitacion;
      if (typeof h.habitacion === 'object' && h.habitacion !== null) {
        habitacionProcesada = {
          ...h.habitacion,
          nombre: h.habitacion.nombre || h.habitacion.titulo || 'Habitación sin nombre',
          tipo: h.habitacion.tipo || tipoHabitacionProcesado.tipo || 'standard'
        };
      } else if (typeof h.habitacion === 'string') {
        habitacionProcesada = {
          nombre: h.habitacion,
          tipo: tipoHabitacionProcesado.tipo || 'standard',
          _id: h.habitacionId || h.habitacion
        };
      }

      return {
        ...h,
        id: h._id || h.id,
        tipo: 'habitacion',
        tipoDisplay: esParteDePaquete ? 'Habitación (Evento)' : 'Habitación',
        fechaDisplay: `${new Date(h.fechaEntrada).toLocaleDateString()} - ${new Date(h.fechaSalida).toLocaleDateString()}`,
        tituloDisplay: habitacionProcesada.nombre || `Habitación ${h.letraHabitacion || ''}`,
        clienteDisplay: `${h.nombreContacto || ''} ${h.apellidosContacto || ''}`.trim() || 'Cliente',
        detallesUrl: `/admin/reservaciones/habitacion/${h._id || h.id}`,
        estado: h.estadoReserva || h.estado || 'pendiente',
        precio: parseFloat(h.precio || h.precioTotal || 0),
        precioPorNoche: parseFloat(h.precioPorNoche || 0),
        tipoHabitacion: tipoHabitacionProcesado,
        habitacion: habitacionProcesada,
        datosCompletos: {
          ...h,
          tipoHabitacion: tipoHabitacionProcesado,
          categoriaHabitacion: h.categoriaHabitacion,
          letraHabitacion: h.letraHabitacion,
          nombre: habitacionProcesada.nombre,
          eventoAsociado: eventoAsociado ? {
            id: h.reservaEvento || h.eventoId,
            nombre: h.nombreEvento || 'Evento asociado'
          } : null
        }
      };
    }) || [];

    // Combinar todas las reservas
    const todasLasReservas = [...eventosProcessed, ...habitacionesProcessed];

    // Ordenar por fecha (más recientes primero)
    todasLasReservas.sort((a, b) => {
      const fechaA = new Date(a.fechaEntrada || a.fecha);
      const fechaB = new Date(b.fechaEntrada || b.fecha);
      return fechaB - fechaA;
    });

    return todasLasReservas;
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    return [];
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
    
    // Primero verificar si la habitación es parte de un evento
    const habitacionResponse = await apiClient.get(`/reservas/habitaciones/${id}`);
    const habitacion = habitacionResponse?.data || {};
    
    // Si la habitación está asociada a un evento, notificar al usuario
    if (habitacion.reservaEvento) {
      console.log(`La habitación ${id} está asociada al evento ${habitacion.reservaEvento}`);
      return {
        success: false,
        message: 'Esta habitación está asociada a un evento. Por favor, elimine la habitación desde el detalle del evento.',
        data: {
          eventoId: habitacion.reservaEvento,
          evento: true
        }
      };
    }
    
    // Solicitar la eliminación al servidor
    const response = await apiClient.delete(`/reservas/habitaciones/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al eliminar la reserva de habitación ${id}:`, error.message || error);
    throw error;
  }
};

export const deleteEventoReservation = async (id) => {
  try {
    // Validar que el ID tenga un formato correcto
    if (!id || typeof id !== 'string') {
      console.error('ID de evento no válido:', id);
      throw new Error('ID de evento no válido');
    }
    
    // Obtener el evento primero para comprobar si tiene habitaciones asociadas
    const eventoResponse = await apiClient.get(`/reservas/eventos/${id}`);
    const evento = eventoResponse?.data || {};
    
    if (!evento) {
      console.error('Evento no encontrado:', id);
      throw new Error('Evento no encontrado');
    }
    
    // Verificar si el evento tiene habitaciones asociadas
    const habitacionesAsociadas = evento.serviciosAdicionales?.habitaciones || [];
    const tieneHabitaciones = habitacionesAsociadas.length > 0;
    
    // Informar de las habitaciones asociadas que serán desvinculadas
    if (tieneHabitaciones) {
      console.log(`El evento ${id} tiene ${habitacionesAsociadas.length} habitaciones asociadas que serán desvinculadas`);
    }
    
    // Solicitar la eliminación del evento al servidor
    const response = await apiClient.delete(`/reservas/eventos/${id}`);
    
    // Incluir información adicional en la respuesta
    return {
      ...response,
      resultadosAdicionales: {
        habitacionesDesvinculadas: tieneHabitaciones ? habitacionesAsociadas.length : 0
      }
    };
  } catch (error) {
    console.error(`Error al eliminar la reserva de evento ${id}:`, error.message || error);
    throw error;
  }
};

// Desasignar reservas
export const unassignHabitacionReservation = async (id) => {
  try {
    // Validar que el ID tenga un formato correcto
    if (!id || typeof id !== 'string') {
      console.error('ID de habitación no válido para desasignar:', id);
      throw new Error('ID de habitación no válido');
    }
    
    console.log(`Iniciando desasignación de habitación con ID: ${id}`);
    
    // Caso especial: si el ID contiene "_habitacion_", estamos tratando de desasignar una habitación
    // que es parte de un evento, no un registro independiente
    if (id.includes('_habitacion_')) {
      console.log('Detectada habitación dentro de evento para desasignar. ID:', id);
      const eventId = id.split('_habitacion_')[0];
      
      if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
        console.error('ID de evento no válido:', eventId);
        throw new Error('ID de evento no válido');
      }
      
      // Desasignar el evento completo, lo que desasignará todas sus habitaciones
      return await unassignEventoReservation(eventId);
    }
    
    // Intentar primero verificar si esta habitación es parte de un evento
    try {
      // Obtener todos los eventos
      const eventosResponse = await apiClient.get('/reservas/eventos');
      if (eventosResponse?.data && Array.isArray(eventosResponse.data)) {
        // Buscar un evento que contenga esta habitación
        for (const evento of eventosResponse.data) {
          if (evento.serviciosAdicionales?.habitaciones?.length > 0) {
            const habitacionEnEvento = evento.serviciosAdicionales.habitaciones.find(
              h => h._id === id || h.reservaHabitacionId === id
            );
            
            if (habitacionEnEvento) {
              console.log(`Habitación ${id} encontrada en evento ${evento._id}`);
              // Si la habitación es parte de un evento, desasignar el evento
              return await unassignEventoReservation(evento._id);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error al verificar eventos para la habitación:', error);
      // Continuamos con el intento normal de desasignación
    }
    
    // Verificar primero si la habitación existe
    try {
      const habitacionResponse = await apiClient.get(`/reservas/habitaciones/${id}`);
      if (!habitacionResponse || !habitacionResponse.data) {
        console.error(`Habitación ${id} no encontrada en la base de datos`);
        throw {
          success: false,
          message: `La habitación con ID ${id} no existe o ha sido eliminada`,
          status: 404
        };
      }
    } catch (error) {
      // Si es un error 404, podemos intentar con otra estrategia
      if (error.status === 404) {
        console.warn(`Habitación ${id} no encontrada. Verificando otras posibles soluciones...`);
        
        // Una opción es eliminar la asignación solo en el frontend
        // Devolvemos un mensaje de éxito simulado
        return {
          success: true,
          message: `Habitación ${id} marcada como desasignada localmente. Refresque la página para actualizar la vista.`,
          data: { _id: id, asignadoA: null }
        };
      }
      
      throw error;
    }
    
    // Caso normal: desasignar una reserva de habitación independiente
    console.log(`Desasignando habitación independiente ${id}`);
    const response = await apiClient.put(`/reservas/habitaciones/${id}/desasignar`);
    return response;
  } catch (error) {
    console.error(`Error al desasignar reserva de habitación ${id}:`, error.message || error);
    
    // Construir un mensaje de error más informativo
    const errorInfo = {
      success: false,
      message: error.message || `Error al desasignar habitación con ID ${id}`,
      status: error.status || 500,
      data: error.data || null,
      habitacionId: id // Incluir el ID de la habitación para depuración
    };
    
    throw errorInfo;
  }
};

export const unassignEventoReservation = async (id) => {
  try {
    console.log(`Desasignando reserva de evento: ${id}`);
    const response = await apiClient.put(`/reservas/eventos/${id}/desasignar`, {});
    console.log('Respuesta de desasignación de evento:', response);
    
    // Ya no redirigimos, solo devolvemos la respuesta
    console.log('Desasignación completada con éxito');
    
    return response;
  } catch (error) {
    console.error(`Error al desasignar reserva de evento ${id}:`, error);
    throw error;
  }
};

// Crear una reserva de habitación
export const createReservacion = async (reservaData) => {
  try {
    console.log('Enviando datos de reserva:', reservaData);
    const response = await apiClient.post('/api/reservas/habitaciones', reservaData);
    console.log('Respuesta de creación de reserva:', response.data);
    
    return {
      success: true,
      data: response.data.data,
      message: 'Reserva creada exitosamente'
    };
  } catch (error) {
    console.error('Error al crear la reserva de habitación:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al crear la reserva. Por favor intente nuevamente.'
    };
  }
};

// Crear múltiples reservaciones de habitación
export const createMultipleReservaciones = async (reservasData) => {
  try {
    console.log('Enviando reservas múltiples:', reservasData);
    const responses = [];
    
    // Procesar cada reserva individualmente
    for (const reservaData of reservasData) {
      const response = await apiClient.post('/api/reservas/habitaciones', reservaData);
      responses.push(response.data.data);
    }
    
    console.log('Respuestas de reservas múltiples:', responses);
    
    return {
      success: true,
      data: responses,
      message: 'Reservas creadas exitosamente'
    };
  } catch (error) {
    console.error('Error al crear múltiples reservas:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al crear las reservas. Por favor intente nuevamente.'
    };
  }
}; 