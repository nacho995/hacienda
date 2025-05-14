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
    
    const url = `/api/reservas/habitaciones${params.toString() ? '?' + params.toString() : ''}`;
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
    const response = await apiClient.get(`/api/reservas/habitaciones/${id}`);
    
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
        const response = await apiClient.post(`/api/reservas/eventos/${reservationData.eventoId}/habitaciones`, {
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
      console.log('Creando reserva de hotel independiente con datos (originales):', reservationData);

      // --- INICIO DE MODIFICACIÓN PROVISIONAL ---
      let tipoHabitacionModificado = tipoHabitacion; 
      if (reservationData.tipoHabitacion === 'Estándar') {
        tipoHabitacionModificado = 'Habitación Doble'; 
        console.warn('Parche aplicado: tipoHabitacion cambiado de "Estándar" a "Habitación Doble"');
      } else if (reservationData.tipoHabitacion === 'standard') { 
        tipoHabitacionModificado = 'Habitación Doble'; 
        console.warn('Parche aplicado: tipoHabitacion cambiado de "standard" (default) a "Habitación Doble"');
      }
      // --- FIN DE MODIFICACIÓN PROVISIONAL ---

      const requestData = {
        // tipoHabitacion: tipoHabitacion, // Ya no se usa el original directamente
        habitacion: reservationData.habitacionLetra || reservationData.habitacion || reservationData.nombre || 'Sin asignar',
        fechaEntrada: fechaEntrada,
        fechaSalida: fechaSalida,
        // precio: reservationData.precioTotal || reservationData.precio || 0, // Eliminado
        precioPorNoche: reservationData.precioPorNoche || 0,
        numeroHabitaciones: reservationData.numeroHabitaciones || 1,
        numHuespedes: reservationData.numHuespedes || 2,
        nombreContacto: reservationData.nombreContacto || '',
        apellidosContacto: reservationData.apellidosContacto || '',
        emailContacto: reservationData.emailContacto || '',
        telefonoContacto: reservationData.telefonoContacto || '',
        peticionesEspeciales: reservationData.peticionesEspeciales || '',
        estadoReserva: reservationData.estadoReserva || 'pendiente',
        origen: reservationData.origen || 'web',
        huespedPrincipal: reservationData.huespedPrincipal || null,
        tipoHabitacion: tipoHabitacionModificado 
      };
      
      // Eliminar el campo precio explícitamente si existe en requestData
      // Esta fue una de las líneas problemáticas, asegúrate que el if y delete estén correctos
      if ('precio' in requestData) { 
        delete requestData.precio;
        console.warn('Parche aplicado: Se eliminó el campo \'precio\' de requestData para que el backend lo calcule.');
      }

      // Asegurarse de que no se envían campos undefined que puedan causar problemas
      // Aquí es donde el linter marcaba el error, asegúrate que la siguiente línea sea el Object.keys
      Object.keys(requestData).forEach(key => { // <--- Esta línea debe seguir fluidamente
        if (requestData[key] === undefined) {
          delete requestData[key];
        }
      });

      const response = await apiClient.post('/api/reservas/habitaciones', requestData);
      return response;
    }
  } catch (error) {
    // Este catch ahora atrapará errores de validación inicial O errores lanzados arriba
    console.error('Error CATCH en createHabitacionReservation:', error.response?.data || error.message || error);
    
    // *** VOLVER A DEVOLVER OBJETO DE ERROR FORMATEADO (NO LANZAR) ***
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Error desconocido al crear reserva',
      status: error.response?.status,
      data: error.response?.data // Devolver datos del error si existen
    }; 
  }
};

export const updateHabitacionReservation = async (id, data) => {
  try {
    const response = await apiClient.put(`/api/reservas/habitaciones/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Error al actualizar reserva de habitación ${id}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

export const assignHabitacionReservation = async (id, usuarioId) => {
  console.log(`Iniciando asignación de habitación ${id} a usuario ${usuarioId}`);
  try {
    // GET para obtener detalles (si es necesario antes de asignar, como en los logs) - ¡YA TIENE /api!
    // const detalles = await apiClient.get(`/api/reservas/habitaciones/${id}`);
    // console.log("Detalles obtenidos antes de asignar:", detalles.data);

    // La llamada PUT para asignar - ¡AÑADIR /api!
    const response = await apiClient.post(`/api/reservas/habitaciones/${id}/assign`, { usuarioId });
    console.log(`Respuesta de asignación para habitación ${id}:`, response);
    return response;
  } catch (error) {
    console.error(`Error al asignar reserva de habitación ${id}:`, error.response?.data?.message || error.message);
    // Lanzar un error más informativo
    const errorMessage = error.response?.data?.message || `Error asignando la reserva de habitación ${id}`;
    const status = error.response?.status || 500;
    throw { success: false, message: errorMessage, status: status, data: error.response?.data };
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
    
    params.append('soloReservaEvento', 'true');
    
    const url = `/api/reservas/eventos${params.toString() ? '?' + params.toString() : ''}`;
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
    const response = await apiClient.get(`/api/reservas/eventos/${id}`);
    
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
  console.log('>>> Intentando crear reserva de evento con datos:', reservaData);
  try {
    // Asegúrate de que la URL incluya el prefijo /api
    const response = await apiClient.post('/api/reservas/eventos', reservaData);
    console.log('>>> Respuesta de crear reserva de evento:', response);
    if (response && response.success) {
      return response;
    } else {
      throw new Error('No se recibió respuesta del servidor');
    }
  } catch (error) {
    console.error('Error al crear la reserva de evento:', error);
    throw error;
  }
};

export const updateEventoReservation = async (id, data) => {
  try {
    const response = await apiClient.put(`/api/reservas/eventos/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Error al actualizar reserva de evento ${id}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

export const assignEventoReservation = async (id, usuarioId) => {
  try {
    const response = await apiClient.post(`/api/reservas/eventos/${id}/assign`, { usuarioId });
    return response;
  } catch (error) {
    console.error(`Error al asignar reserva de evento ${id}:`, error.response?.data?.message || error.message);
    const errorMessage = error.response?.data?.message || `Error asignando la reserva de evento ${id}`;
    const status = error.response?.status || 500;
    throw { success: false, message: errorMessage, status: status, data: error.response?.data };
  }
};

export const getEventoOccupiedDates = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/api/reservas/eventos/occupied-dates${queryParams ? '?' + queryParams : ''}`);
    return response;
  } catch (error) {
    console.error('Error fetching occupied dates for eventos:', error);
    return []; // Devolver array vacío en caso de error
  }
};

// Verificar disponibilidad
export const checkEventoAvailability = async (availabilityData) => {
  try {
    // Validar datos requeridos
    if (!availabilityData.fecha || !availabilityData.tipoEvento) {
      throw new Error('Fecha y tipo de evento son requeridos');
    }

    // Formatear los datos para la API
    const requestData = {
      fecha: availabilityData.fecha,
      tipo_evento: availabilityData.tipoEvento,
      total_habitaciones: availabilityData.totalHabitaciones || 0
    };

    console.log('Verificando disponibilidad con datos:', requestData);

    const response = await apiClient.post('/reservas/eventos/check-availability', requestData);
    
    // Asegurar que la respuesta tenga el formato esperado
    return {
      available: response?.available || false,
      message: response?.message || 'No hay disponibilidad para la fecha seleccionada'
    };
  } catch (error) {
    console.error('Error al verificar disponibilidad del evento:', error);
    throw error;
  }
};

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

    const response = await apiClient.post('/reservas/habitaciones/check-availability', requestData);
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
      mensaje: error.response?.data?.message || error.message || 'Error al verificar disponibilidad',
      habitacionesRestantes: 0
    };
  }
};

// Obtener TODAS las reservas (eventos + habitaciones) para el dashboard
export const getAllReservationsForDashboard = async () => {
  // console.log('[DashboardService] Obteniendo TODAS las reservas...');
  try {
    const response = await apiClient.get('/api/reservas');
    // console.log('[DashboardService] Respuesta recibida:', response);

    let allReservations = [];
    // La respuesta ya debería venir transformada por el interceptor
    if (response && Array.isArray(response.data)) {
      allReservations = response.data;
      // console.log('[DashboardService] Total de reservas obtenidas:', allReservations.length);
    } else if (response && typeof response === 'object' && response.data && Array.isArray(response.data)) {
      // Fallback si el interceptor no transformó o si se llama desde otro lugar
      allReservations = response.data;
      // console.log('[DashboardService] Total de reservas obtenidas (desde response.data):', allReservations.length);
    } else if (Array.isArray(response)) {
        // Fallback por si la respuesta es directamente el array
        allReservations = response;
        // console.log('[DashboardService] Total de reservas obtenidas (respuesta directa array):', allReservations.length);
    }
    else {
      console.warn('[DashboardService] Respuesta inesperada o vacía al obtener todas las reservas:', response);
    }

    // Procesar cada reserva para añadir campos comunes/útiles para el dashboard
    const processedReservations = allReservations.map(reserva => {
      // --- Simplificación y Asegurar 'tipo' --- 
      // Preservar tipo original
      const tipoOriginal = reserva.tipo;
      
      // Lógica existente para determinar display, cliente, etc.
      const esEvento = tipoOriginal === 'evento';
      const fechaPrincipal = esEvento ? reserva.fecha : reserva.fechaEntrada;
      const nombreCliente = `${reserva.nombreContacto || ''} ${reserva.apellidosContacto || ''}`.trim() || 
                            (reserva.huesped ? `${reserva.huesped.nombre || ''} ${reserva.huesped.apellidos || ''}`.trim() : '') || 
                            reserva.usuario?.nombre || 
                            'No especificado';
                            
      let nombreMostrado = 'Reserva Desconocida';
      let clientePrincipal = 'No especificado';
      
      // Determinar nombre del tipo de evento (priorizando details)
      const nombreTipoEvento = reserva.tipoEventoDetails?.titulo || 'Tipo Desconocido';
      const nombreHabitacion = reserva.habitacionDetails?.nombre || 'Habitación Desconocida';
      const letraHabitacion = reserva.habitacionDetails?.letra || '?';

      if (reserva.tipo === 'evento') {
        const nombreFinalEvento = nombreTipoEvento || reserva.nombreEvento || 'Evento Desconocido';
        nombreMostrado = `Evento: ${nombreFinalEvento}`;
      } else { // Es habitacion
        nombreMostrado = `Habitación ${letraHabitacion}`;
        if (reserva.reservaEventoDetails) {
          nombreMostrado += ` (Evento: ${reserva.reservaEventoDetails.nombreEvento || 'Sin nombre'})`;
        }
      }

      // Retornar un nuevo objeto asegurando que 'tipo' esté presente
      return {
        ...reserva, // Esparcir el item original PRIMERO
        id: reserva._id, // Asegurar id
        tipo: tipoOriginal, // Asegurar el tipo original
        // Añadir/Sobrescribir campos display procesados
        fechaMostrada: fechaPrincipal,
        clientePrincipal: nombreCliente,
        nombreMostrado: nombreMostrado,
        // Añadir cualquier otro campo procesado necesario aquí...
      };
      // --- Fin Simplificación --- 
    });
    
    // <<< NUEVO LOG: Verificar datos ANTES de retornar del servicio >>>
    console.log('[reservationService] Primeros 5 elementos procesados ANTES de retornar:', 
      processedReservations.slice(0, 5).map(r => ({ _id: r._id, tipo: r.tipo }))
    );
    // <<< FIN NUEVO LOG >>>

    return {
      success: true,
      data: processedReservations
    };
  } catch (error) {
    console.error('[DashboardService] Error al obtener todas las reservas:', error.response || error);
    return { 
      success: false, 
      data: [], 
      message: error.message || 'Error al obtener todas las reservas'
    };
  }
};

// Obtener fechas ocupadas para habitaciones
export const getHabitacionOccupiedDates = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/api/reservas/habitaciones/occupied-dates${queryParams ? '?' + queryParams : ''}`);
    return response;
  } catch (error) {
    console.error('Error en servicio getHabitacionOccupiedDates, relanzando:', error);
    throw error; 
  }
};

// Obtener TODAS las fechas ocupadas por CUALQUIER habitación
export const getAllHabitacionOccupiedDates = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/api/reservas/habitaciones/all-occupied-dates${queryParams ? '?' + queryParams : ''}`);
    return response;
  } catch (error) {
    console.error('Error en servicio getAllHabitacionOccupiedDates:', error);
    // Devolver un objeto de error consistente
    return { success: false, data: [], message: error.message || 'Error al obtener fechas ocupadas' };
  }
};

// Eliminar reservas
export const deleteHabitacionReservation = async (id) => {
  try {
    const response = await apiClient.delete(`/api/reservas/habitaciones/${id}`);
    console.log(`Reserva de habitación ${id} eliminada:`, response);
    return response;
  } catch (error) {
    console.error(`Error al eliminar la reserva de habitación ${id}:`, error.response?.data?.message || error.message);
    const errorMessage = error.response?.data?.message || `Error eliminando la reserva de habitación ${id}`;
    const status = error.response?.status || 500;
    throw { success: false, message: errorMessage, status: status, data: error.response?.data };
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
    const eventoResponse = await apiClient.get(`/api/reservas/eventos/${id}`);
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
    const response = await apiClient.delete(`/api/reservas/eventos/${id}`);
    
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
  console.log(`Iniciando desasignación de habitación ${id}`);
  try {
    const response = await apiClient.post(`/api/reservas/habitaciones/${id}/unassign`, {});
    console.log(`Respuesta de desasignación para habitación ${id}:`, response);
    return response;
  } catch (error) {
    console.error(`Error al desasignar reserva de habitación ${id}:`, error.response?.data?.message || error.message);
    const errorMessage = error.response?.data?.message || `Error desasignando la reserva de habitación ${id}`;
    const status = error.response?.status || 500;
    throw { success: false, message: errorMessage, status: status, data: error.response?.data };
  }
};

/**
 * Desasigna un administrador de una reserva de evento.
 * @param {string} reservationId - El ID de la reserva de evento.
 * @returns {Promise<object>} - La respuesta de la API.
 */
export const unassignEventoReservation = async (reservationId) => {
  if (!reservationId) {
    console.error('[unassignEventoReservation] Se requiere reservationId');
    throw new Error('Se requiere el ID de la reserva');
  }
  console.log(`[Service] Desasignando admin para evento ${reservationId}`);
  try {
    const response = await apiClient.post(`/api/reservas/eventos/${reservationId}/unassign`, {});
    console.log(`[Service] Respuesta desasignar evento ${reservationId}:`, response);
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'El recurso solicitado no existe';
    console.error(`>>> Service Error: Error desasignando evento ${reservationId}: "${errorMessage}"`, error.response || error);
    return { success: false, message: errorMessage, error: error.response?.data || error };
  }
};

// Crear una reserva de habitación
export const createReservacion = async (reservaData) => {
  try {
    console.log('Enviando datos de reserva:', reservaData);
    const response = await apiClient.post('/reservas', reservaData);
    console.log('Respuesta de creación de reserva:', response.data);
    
    return {
      success: true,
      data: response.data,
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
  // Verificar que reservasData es un array no vacío
  if (!Array.isArray(reservasData) || reservasData.length === 0) {
    console.error('createMultipleReservaciones: Se esperaba un array de reservaciones.');
    return {
      success: false,
      message: 'No se proporcionaron datos de reserva válidos.',
      data: null,
      errors: []
    };
  }

  try {
    console.log('Enviando múltiples reservas a /batch:', reservasData);
    
    const response = await apiClient.post('/reservas/multiple', { reservaciones: reservasData });
    console.log('Respuesta de creación múltiple /batch:', response);

    // Asumimos que apiClient devuelve la respuesta parseada, 
    // incluyendo success, data, message, y opcionalmente errors
    return response; 

  } catch (error) {
    // El interceptor de apiClient ya debería haber formateado el error
    console.error('Error en llamada API createMultipleReservaciones:', error.response?.data || error.message || error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error inesperado al crear múltiples reservas.',
      data: null,
      errors: error.response?.data?.errors || []
    };
  }
};

// Nueva función para obtener las habitaciones detalladas de un evento
export const getEventoHabitaciones = async (eventoId) => {
  if (!eventoId) {
    console.error('getEventoHabitaciones: Se requiere ID del evento.');
    return { success: false, data: null, message: 'ID de evento no proporcionado' };
  }
  try {
    const response = await apiClient.get(`/api/reservas/eventos/${eventoId}/habitaciones`);
    
    if (response && response.success && Array.isArray(response.data?.habitaciones)) {
      console.log(`Habitaciones obtenidas para evento ${eventoId}:`, response.data.habitaciones.length);
      return response; 
    } else {
      console.error('Respuesta inválida o no exitosa para getEventoHabitaciones:', response);
      return { success: false, data: [], message: response?.message || 'Formato de respuesta inesperado' };
    }
  } catch (error) {
    console.error(`Error al obtener habitaciones para evento ${eventoId}:`, error.response || error);
    return { 
      success: false, 
      data: [], 
      message: error.response?.data?.message || 'Error al obtener las habitaciones del evento'
    };
  }
};

// Nueva función para actualizar los huéspedes de una ReservaHabitacion
export const updateReservaHabitacionHuespedes = async (reservaHabitacionId, data) => {
  if (!reservaHabitacionId) {
    console.error('ID de ReservaHabitacion no proporcionado');
    return { success: false, message: 'ID de reserva de habitación no proporcionado' };
  }
  if (!data || (data.numHuespedes === undefined && data.infoHuespedes === undefined)) {
    console.error('No se proporcionaron datos para actualizar', data);
    return { success: false, message: 'No se proporcionaron datos válidos para actualizar' };
  }
  
  try {
    const response = await apiClient.put(`/api/reservas/habitaciones/${reservaHabitacionId}/huespedes`, data);
    console.log(`Respuesta de actualización de huéspedes para reserva de habitación ${reservaHabitacionId}:`, response);
    return response;
  } catch (error) {
    console.error(`Error al actualizar huéspedes para reserva de habitación ${reservaHabitacionId}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

// --- Crear Payment Intent para Habitación (NUEVA) ---
export const createHabitacionPaymentIntent = async (id) => {
  if (!id) {
    console.error('createHabitacionPaymentIntent: Se requiere ID de reserva.');
    return { success: false, message: 'Datos incompletos para crear intento de pago.' };
  }
  try {
    console.log(`>>> Servicio: Intentando crear PaymentIntent para reserva habitación ${id}`);
    const response = await apiClient.post(`/api/reservas/habitaciones/${id}/create-payment-intent`);
    console.log(`>>> Servicio: Respuesta de crear PaymentIntent habitación:`, response);
    return response || { success: false, message: 'No se recibió respuesta del servidor.' };
  } catch (error) {
    console.error(`Error en servicio createHabitacionPaymentIntent para reserva ${id}:`, error.response?.data || error.message || error);
    return {
      success: false,
      message: error.response?.data?.message || `Error al iniciar el pago para la habitación.`,
      error: error
    };
  }
};
// --- FIN Crear Payment Intent Habitación ---

// --- Selección de Método de Pago para Habitación (NUEVA) ---
export const seleccionarMetodoPagoHabitacion = async (id, metodo) => {
  if (!id || !metodo) {
    console.error('seleccionarMetodoPagoHabitacion: Se requiere ID de reserva y método.');
    return { success: false, message: 'Datos incompletos.' };
  }
  if (metodo === 'tarjeta') {
     console.warn('seleccionarMetodoPagoHabitacion no debe llamarse para tarjeta.');
     return { success: false, message: 'Método inválido para esta función.' };
  }
  try {
    console.log(`>>> Servicio: Actualizando método ${metodo} para reserva habitación ${id}`);
    const response = await apiClient.post(`/api/reservas/habitaciones/${id}/seleccionar-metodo-pago`, { metodoPago: metodo });
    console.log(`>>> Servicio: Respuesta de seleccionar método pago habitación:`, response);
    return response || { success: false, message: 'No se recibió respuesta.' };
  } catch (error) {
    console.error(`Error en servicio seleccionarMetodoPagoHabitacion ${id}:`, error.response?.data || error.message || error);
    return {
      success: false,
      message: error.response?.data?.message || `Error al seleccionar método ${metodo}.`,
      error: error
    };
  }
};
// --- FIN Selección Método Pago Habitación ---

// *** NUEVA FUNCIÓN para crear Payment Intent para EVENTOS ***
export const createEventoPaymentIntent = async (id) => {
  if (!id) {
    console.error('Error: Se requiere ID de reserva de evento para crear Payment Intent');
    return { success: false, message: 'ID de reserva no proporcionado' };
  }
  try {
    const response = await apiClient.post(`/api/reservas/eventos/${id}/create-payment-intent`);
    console.log(`Respuesta de createEventoPaymentIntent para ${id}:`, response);
    return response;
  } catch (error) {
    console.error(`Error al crear Payment Intent para reserva de evento ${id}:`, error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Error al iniciar el proceso de pago' 
    };
  }
};

// *** NUEVA FUNCIÓN para seleccionar Método de Pago para EVENTOS ***
export const seleccionarMetodoPagoEvento = async (id, metodo) => {
  if (!id || !metodo) {
    console.error('seleccionarMetodoPagoEvento: Se requiere ID de reserva y método.');
    return { success: false, message: 'Datos incompletos para seleccionar método de pago del evento.' };
  }
  // No se debería llamar para 'tarjeta' si el pago se maneja con PaymentIntent
  if (metodo === 'tarjeta') {
     console.warn('seleccionarMetodoPagoEvento: El método "tarjeta" usualmente se maneja vía Payment Intent y no debería requerir esta llamada directa para cambiar el método.');
     // Considera si quieres permitirlo o devolver un error/advertencia específica.
     // Por ahora, se permite continuar, pero es un caso a revisar según el flujo de Stripe.
  }
  try {
    console.log(`>>> Servicio: Actualizando método ${metodo} para reserva de evento ${id}`);
    // El backend espera el método en el campo `metodo` según el controlador `seleccionarMetodoPagoEvento`
    const response = await apiClient.put(`/api/reservas/eventos/${id}/seleccionar-pago`, { metodo });
    console.log(`>>> Servicio: Respuesta de seleccionar método pago evento:`, response);
    return response || { success: false, message: 'No se recibió respuesta del servidor al seleccionar método de pago para el evento.' };
  } catch (error) {
    console.error(`Error en servicio seleccionarMetodoPagoEvento para reserva ${id}, método ${metodo}:`, error.response?.data || error.message || error);
    return {
      success: false,
      message: error.response?.data?.message || `Error al seleccionar método de pago "${metodo}" para el evento.`,
      error: error
    };
  }
};
// *** FIN NUEVA FUNCIÓN para seleccionar Método de Pago para EVENTOS ***

export default {
  createHabitacionPaymentIntent,
  seleccionarMetodoPagoHabitacion,
  createEventoPaymentIntent,
  seleccionarMetodoPagoEvento
};