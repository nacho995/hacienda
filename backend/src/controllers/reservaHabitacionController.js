const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const ReservaEvento = require('../models/ReservaEvento');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// @desc    Crear una nueva reserva de habitación
// @route   POST /api/reservas/habitaciones
// @access  Public
exports.createReservaHabitacion = asyncHandler(async (req, res, next) => {
  try {
    // Si hay un usuario autenticado, usar su ID
    if (req.user) {
      req.body.usuario = req.user.id;
    }
    
    // Extraer datos de la solicitud
    const { 
      tipoHabitacion, 
      habitacion, 
      fechaEntrada, 
      fechaSalida, 
      numeroHabitaciones,
      tipoReserva = 'hotel',
      categoriaHabitacion = 'doble',
      precioPorNoche,
      infoHuespedes,
      letraHabitacion,
      reservaEvento,
      metodoPago = 'efectivo',
      estadoPago = 'pendiente'
    } = req.body;
    
    // Comprobar disponibilidad
    const disponibilidad = await ReservaHabitacion.comprobarDisponibilidad(
      tipoHabitacion,
      fechaEntrada,
      fechaSalida
    );
    
    if (!disponibilidad.disponible) {
      return res.status(400).json({
        success: false,
        message: 'La habitación no está disponible para las fechas seleccionadas'
      });
    }

    // Calcular la duración de la estancia en días
    const fechaInicioObj = new Date(fechaEntrada);
    const fechaFinObj = new Date(fechaSalida);
    const duracionEstancia = Math.ceil((fechaFinObj - fechaInicioObj) / (1000 * 60 * 60 * 24));

    // Calcular el precio según el tipo de reserva
    let precioTotal = 0;
    let precioFinal = 0;

    if (tipoReserva === 'hotel') {
      // Si es reservación individual (por noche como hotel)
      let precioPorNocheCalculado = 0;
      
      if (categoriaHabitacion === 'sencilla') {
        precioPorNocheCalculado = precioPorNoche || 2400; // Precio por defecto para habitación sencilla
      } else { // doble
        precioPorNocheCalculado = precioPorNoche || 2600; // Precio por defecto para habitación doble
      }
      
      precioTotal = precioPorNocheCalculado * duracionEstancia * numeroHabitaciones;
      precioFinal = precioPorNocheCalculado;
    } else {
      // Si es parte de un evento, el precio se podría manejar diferente
      precioTotal = precioPorNoche || 0;
      precioFinal = precioPorNoche || 0;
    }

    // Generar un número de confirmación único para esta reserva
    const prefix = 'H'; // H para Habitación
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const numeroConfirmacion = `${prefix}${timestamp}${random}`;

    // Crear la reserva con todos los datos
    const reservaData = {
      ...req.body,
      precio: precioTotal,
      precioPorNoche: precioFinal,
      tipoReserva,
      categoriaHabitacion,
      infoHuespedes: infoHuespedes || { nombres: [], detalles: '' },
      letraHabitacion: letraHabitacion || '',
      metodoPago,
      estadoPago,
      numeroConfirmacion
    };
    
    // Verificar que el objeto tiene todos los campos necesarios antes de crear la reserva
    if (!reservaData.tipoHabitacion) {
      return res.status(400).json({
        success: false,
        message: 'Falta el tipo de habitación'
      });
    }
    
    if (!reservaData.habitacion) {
      return res.status(400).json({
        success: false,
        message: 'Falta el nombre de la habitación'
      });
    }
    
    if (!reservaData.fechaEntrada || !reservaData.fechaSalida) {
      return res.status(400).json({
        success: false,
        message: 'Faltan fechas de entrada o salida'
      });
    }
    
    // Verificar que el numeroConfirmacion esté definido
    if (!reservaData.numeroConfirmacion) {
      return res.status(400).json({
        success: false,
        message: 'Error al generar número de confirmación'
      });
    }
    
    console.log('Creando reserva de habitación con datos:', reservaData);
    
    const reserva = await ReservaHabitacion.create(reservaData);
    
    // Enviar email de confirmación si hay una función sendEmail configurada
    if (typeof sendEmail === 'function') {
      try {
        // Preparar el contenido del email según el método de pago seleccionado
        let mensajeAdicional = '';
        if (metodoPago === 'tarjeta') {
          mensajeAdicional = '<p>Su pago con tarjeta está siendo procesado. Recibirá una confirmación adicional cuando se complete.</p>';
        } else {
          mensajeAdicional = '<p>Usted ha elegido pagar en efectivo al llegar. Por favor presente su número de confirmación en la recepción.</p>';
        }
        
        await sendEmail({
          email: reserva.emailContacto || reserva.email,
          subject: 'Confirmación de reserva - Hacienda San Carlos Borromeo',
          html: `
            <h1>Reserva confirmada</h1>
            <p>Su reserva para ${reserva.tipoHabitacion} ha sido confirmada para las fechas: ${new Date(reserva.fechaEntrada).toLocaleDateString()} - ${new Date(reserva.fechaSalida).toLocaleDateString()}</p>
            <p>Número de confirmación: ${reserva.numeroConfirmacion}</p>
            <p>Método de pago: ${metodoPago === 'tarjeta' ? 'Tarjeta de crédito/débito' : 'Efectivo al llegar'}</p>
            ${mensajeAdicional}
            <p>Gracias por elegir Hacienda San Carlos Borromeo.</p>
          `
        });
      } catch (err) {
        console.error('Error al enviar email de confirmación:', err);
        // No impedimos que se complete la reserva si el email falla
      }
    }
    
    res.status(201).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la reserva de habitación',
      error: error.message
    });
  }
});

// @desc    Obtener todas las reservas de habitaciones
// @route   GET /api/reservas/habitaciones
// @access  Private
exports.getReservasHabitacion = asyncHandler(async (req, res, next) => {
  try {
    // Filtros básicos
    let query = {};
    
    // Si el usuario está autenticado y es admin, puede ver reservas según filtros
    if (req.user && req.user.role === 'admin') {
      // Filtros para administradores
      if (req.query.misReservas === 'true') {
        // Ver solo las reservas asignadas al admin actual
        query.asignadoA = req.user.id;
      } else if (req.query.disponibles === 'true' || req.query.sinAsignar === 'true') {
        // Ver solo las reservas no asignadas (disponibles)
        query.asignadoA = null;
      } else {
        // Sin filtros específicos, mostrar tanto las asignadas a este admin como las sin asignar
        query = {
          $or: [
            { asignadoA: req.user.id },
            { asignadoA: null }
          ]
        };
      }
    } else if (req.user) {
      // Usuario autenticado normal: ver sus propias reservas
      query = {
        $or: [
          { usuario: req.user.id },
          { asignadoA: req.user.id }
        ]
      };
    }
    
    // Ejecutar query con opción strictPopulate para evitar errores
    const reservas = await ReservaHabitacion.find(query)
      .populate({
        path: 'usuario',
        select: 'nombre apellidos email telefono',
        strictPopulate: false
      })
      .populate({
        path: 'asignadoA',
        select: 'nombre apellidos email',
        strictPopulate: false
      })
      .populate({
        path: 'habitacion',
        select: 'nombre letra',
        strictPopulate: false
      })
      .populate({
        path: 'tipoHabitacion',
        select: 'nombre',
        strictPopulate: false
      })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas
    });
  } catch (error) {
    console.error('Error al obtener las reservas de habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las reservas de habitación',
      error: error.message
    });
  }
});

// @desc    Obtener una reserva de habitación por ID
// @route   GET /api/reservas/habitaciones/:id
// @access  Private
exports.getReservaHabitacion = asyncHandler(async (req, res, next) => {
  try {
    const reserva = await ReservaHabitacion.findById(req.params.id)
      .populate({
        path: 'usuario',
        select: 'nombre apellidos email telefono',
        strictPopulate: false
      })
      .populate({
        path: 'asignadoA',
        select: 'nombre apellidos email',
        strictPopulate: false
      })
      .populate({
        path: 'reservaEvento',
        select: 'nombreEvento tipoEvento',
        strictPopulate: false,
        populate: {
           path: 'tipoEvento',
           select: 'titulo nombre'
        }
      });
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la reserva de habitación'
    });
  }
});

// @desc    Actualizar una reserva de habitación
// @route   PUT /api/reservas/habitaciones/:id
// @access  Private
exports.updateReservaHabitacion = asyncHandler(async (req, res, next) => {
  try {
    let reserva = await ReservaHabitacion.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // --- INICIO: Verificación de Permiso de Asignación ---
    if (!req.user || !req.user.id) {
       console.error("Error: req.user no está definido en updateReservaHabitacion.");
       return res.status(500).json({ success: false, message: 'Error interno del servidor (Autenticación)' });
    }
    const asignadoAId = reserva.asignadoA ? reserva.asignadoA.toString() : null;
    const userId = req.user.id.toString(); 
    if (asignadoAId && asignadoAId !== userId) {
      // Excepción: Permitir actualizar solo si el único cambio es el estado a 'cancelada'
      const updateKeys = Object.keys(req.body);
      const isOnlyStatusUpdateToCancelled = updateKeys.length === 1 && updateKeys[0] === 'estadoReserva' && req.body.estadoReserva === 'cancelada';
      
      if (!isOnlyStatusUpdateToCancelled) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para actualizar esta reserva porque está asignada a otro administrador.'
        });
      }
    }
    // --- FIN: Verificación de Permiso de Asignación ---
    
    // (Añadir verificación de permisos de usuario normal si es necesario)
    // if (reserva.usuario && reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') { ... }

    // Definir campos que requieren verificación de disponibilidad
    const requiresAvailabilityCheck = 
        req.body.hasOwnProperty('tipoHabitacion') || 
        req.body.hasOwnProperty('fechaEntrada') || 
        req.body.hasOwnProperty('fechaSalida') || 
        req.body.hasOwnProperty('numeroHabitaciones');

    // Si se está cambiando algún campo que afecta la disponibilidad
    if (requiresAvailabilityCheck) {
      console.log('Realizando chequeo de disponibilidad para la actualización...');
      // Usar valores del body si existen, si no, los de la reserva original
      const tipoHabitacion = req.body.tipoHabitacion !== undefined ? req.body.tipoHabitacion : reserva.tipoHabitacion;
      const fechaEntrada = req.body.fechaEntrada !== undefined ? req.body.fechaEntrada : reserva.fechaEntrada;
      const fechaSalida = req.body.fechaSalida !== undefined ? req.body.fechaSalida : reserva.fechaSalida;
      // numeroHabitaciones no afecta directamente comprobarDisponibilidad por ahora
      
      // Validar fechas antes de comprobar
      if (new Date(fechaSalida) <= new Date(fechaEntrada)) {
           return res.status(400).json({
               success: false,
               message: 'La fecha de salida debe ser posterior a la fecha de entrada.'
           });
      }

      const disponibilidad = await ReservaHabitacion.comprobarDisponibilidad(
        tipoHabitacion, 
        fechaEntrada, 
        fechaSalida
      );
      
      // Importante: Excluir la reserva actual de la comprobación de solapamiento
      const reservaActualId = req.params.id;
      const haySolapamientoReal = disponibilidad.reservasExistentes.some(
          reservaExistente => reservaExistente._id.toString() !== reservaActualId
      );

      if (haySolapamientoReal) {
           console.warn('Conflicto de disponibilidad detectado al actualizar.');
           return res.status(400).json({
               success: false,
               message: 'Conflicto de disponibilidad para las nuevas fechas o tipo de habitación.'
           });
      }
      console.log('Disponibilidad confirmada para la actualización.');
    }
    
    // Log ANTES de la actualización
    console.log(`[updateReservaHabitacion] Intentando actualizar ${req.params.id} con body:`, req.body);
    console.log(`[updateReservaHabitacion] Estado ANTES: ${reserva.estadoReserva}`);

    const reservaActualizada = await ReservaHabitacion.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Devolver el documento modificado
      runValidators: true // Ejecutar validaciones del Schema
    });
    
    // Log DESPUÉS de la actualización
    console.log(`[updateReservaHabitacion] Resultado de findByIdAndUpdate:`, reservaActualizada);
    console.log(`[updateReservaHabitacion] Estado DESPUÉS (en reservaActualizada): ${reservaActualizada?.estadoReserva}`);

     if (!reservaActualizada) {
         return res.status(404).json({ success: false, message: 'No se pudo actualizar la reserva.' });
     }

    console.log('Reserva actualizada exitosamente:', reservaActualizada._id);
    res.status(200).json({
      success: true,
      data: reservaActualizada
    });

  } catch (error) {
    console.error('Error detallado al actualizar reserva:', error);
    // Devolver un mensaje de error más específico si es un error de validación
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message });
    }
    // Error genérico para otros casos
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar la reserva de habitación'
    });
  }
});

// @desc    Eliminar una reserva de habitación
// @route   DELETE /api/reservas/habitaciones/:id
// @access  Private
exports.deleteReservaHabitacion = asyncHandler(async (req, res, next) => {
  try {
    console.log('Intentando eliminar reserva de habitación con ID:', req.params.id);
    
    // Validar que el ID sea válido para MongoDB
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('ID de reserva no válido:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'ID de reserva no válido'
      });
    }
    
    const reserva = await ReservaHabitacion.findById(req.params.id);
    
    if (!reserva) {
      console.log('Reserva no encontrada con ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }

    // --- INICIO: Verificación de Permiso de Asignación ---
    if (!req.user || !req.user.id) {
       console.error("Error: req.user no está definido en deleteReservaHabitacion.");
       return res.status(500).json({ success: false, message: 'Error interno del servidor (Autenticación)' });
    }
    const asignadoAId = reserva.asignadoA ? reserva.asignadoA.toString() : null;
    const userId = req.user.id.toString(); 
    if (asignadoAId && asignadoAId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta reserva porque está asignada a otro administrador.'
      });
    }
    // --- FIN: Verificación de Permiso de Asignación ---
    
    // (Añadir verificación de permisos de usuario normal si es necesario)
    // if (reserva.usuario && reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') { ... }

    await reserva.deleteOne();
    console.log('Reserva eliminada exitosamente');
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar reserva de habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la reserva de habitación'
    });
  }
});

// @desc    Asignar reserva de habitación a un usuario
// @route   PUT /api/reservas/habitaciones/:id/asignar
// @access  Private
exports.assignReservaHabitacion = asyncHandler(async (req, res, next) => {
  try {
    const { usuarioId } = req.body;
    
    // Si no se proporciona un ID de usuario, asignar al usuario actual
    const idUsuarioAsignar = usuarioId || req.user.id;
    
    // Verificar que el usuario existe (solo si se proporcionó un ID específico)
    if (usuarioId) {
      const usuario = await User.findById(usuarioId);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
    }
    
    // Buscar la reserva y actualizarla
    const reserva = await ReservaHabitacion.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // Actualizar asignación
    reserva.asignadoA = idUsuarioAsignar;
    await reserva.save();
    
    res.status(200).json({
      success: true,
      data: reserva,
      message: 'Reserva asignada exitosamente'
    });
  } catch (error) {
    console.error('Error al asignar la reserva de habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar la reserva de habitación',
      error: error.message
    });
  }
});

// @desc    Desasignar una reserva de habitación
// @route   PUT /api/reservas/habitaciones/:id/desasignar
// @access  Private
exports.unassignReservaHabitacion = asyncHandler(async (req, res, next) => {
  try {
    // Buscar la reserva
    const reserva = await ReservaHabitacion.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // Desasignar reserva
    reserva.asignadoA = null;
    await reserva.save();
    
    res.status(200).json({
      success: true,
      data: reserva,
      message: 'Reserva de habitación desasignada exitosamente'
    });
  } catch (error) {
    console.error('Error al desasignar la reserva de habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desasignar la reserva de habitación',
      error: error.message
    });
  }
});

// @desc    Comprobar disponibilidad de habitaciones
// @route   POST /api/reservas/habitaciones/disponibilidad
// @access  Public
exports.checkHabitacionAvailability = asyncHandler(async (req, res, next) => {
  try {
    const { 
      tipoHabitacion, 
      fechaEntrada, 
      fechaSalida,
      numeroHabitaciones = 1
    } = req.body;
    
    if (!tipoHabitacion) {
      return res.status(400).json({
        success: false,
        disponible: false,
        mensaje: 'Debe proporcionar un tipo de habitación'
      });
    }
    
    if (!fechaEntrada || !fechaSalida) {
      return res.status(400).json({
        success: false,
        disponible: false,
        mensaje: 'Debe proporcionar fechas de entrada y salida'
      });
    }
    
    // Comprobar disponibilidad
    const disponibilidad = await ReservaHabitacion.comprobarDisponibilidad(
      tipoHabitacion,
      fechaEntrada,
      fechaSalida
    );
    
    return res.status(200).json({
      success: true,
      disponible: disponibilidad.disponible,
      mensaje: disponibilidad.disponible 
        ? 'Habitación disponible para las fechas seleccionadas'
        : 'La habitación no está disponible para las fechas seleccionadas',
      reservasExistentes: disponibilidad.reservasExistentes
    });
  } catch (error) {
    console.error('Error al comprobar disponibilidad:', error);
    return res.status(500).json({
      success: false,
      disponible: false,
      mensaje: 'Error al comprobar disponibilidad: ' + error.message
    });
  }
});

// @desc    Obtener fechas ocupadas para UNA habitación específica (identificada por su letra)
// @route   GET /api/reservas/habitaciones/fechas-ocupadas
// @access  Public
exports.getHabitacionOccupiedDates = asyncHandler(async (req, res, next) => {
  try {
    const { habitacionLetra, fechaInicio, fechaFin } = req.query;

    if (!habitacionLetra) { 
        return res.status(400).json({ success: false, message: 'Falta el parámetro habitacionLetra' });
    }
    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ success: false, message: 'Faltan los parámetros fechaInicio o fechaFin' });
    }
    
    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);
    // Ajustar fechaFinObj para incluir el día final completo en la comparación <
    fechaFinObj.setDate(fechaFinObj.getDate() + 1);
    
    if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
      return res.status(400).json({ success: false, message: 'Fechas inválidas' });
    }

    const occupiedDatesSet = new Set();

    // --- 1. Buscar reservas de HABITACIÓN para esa letra específica --- 
    const reservasHabitacion = await ReservaHabitacion.find({
      habitacion: habitacionLetra, 
      estadoReserva: { $in: ['confirmada', 'pendiente'] },
      // Buscar reservas cuya duración se solape con el rango solicitado
      fechaEntrada: { $lt: fechaFinObj }, 
      fechaSalida: { $gt: fechaInicioObj } 
    }).select('fechaEntrada fechaSalida'); // Seleccionar solo fechas

    reservasHabitacion.forEach(reserva => {
      let currentDate = new Date(reserva.fechaEntrada);
      const endDate = new Date(reserva.fechaSalida);
      
      while (currentDate < endDate) {
        // Añadir solo si está dentro del rango solicitado (original, sin ajustar fechaFinObj)
        if (currentDate >= new Date(fechaInicio) && currentDate < new Date(fechaFin).setDate(new Date(fechaFin).getDate() + 1) ) {
          occupiedDatesSet.add(currentDate.toISOString().split('T')[0]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // --- 2. Buscar reservas de EVENTO activas en el rango --- 
    const reservasEvento = await ReservaEvento.find({
      estadoReserva: { $in: ['confirmada', 'pendiente'] },
      fecha: { // Asumiendo que 'fecha' es la fecha principal del evento
        $gte: fechaInicioObj, 
        $lt: fechaFinObj 
      }
    }).select('fecha'); // Seleccionar solo la fecha del evento

    reservasEvento.forEach(evento => {
      // Asumimos que un evento bloquea al menos el día de su 'fecha'
      const eventoDate = new Date(evento.fecha);
       // Añadir solo si está dentro del rango solicitado (original)
       if (eventoDate >= new Date(fechaInicio) && eventoDate < new Date(fechaFin).setDate(new Date(fechaFin).getDate() + 1) ) {
          occupiedDatesSet.add(eventoDate.toISOString().split('T')[0]);
       }
      // NOTA: Si los eventos pueden durar más de un día, se necesitaría lógica adicional 
      // para calcular la fecha de fin del evento y añadir todos los días intermedios.
    });
    
    // --- 3. Combinar y devolver --- 
    const occupiedDatesArray = Array.from(occupiedDatesSet);

    res.status(200).json({
      success: true,
      data: occupiedDatesArray // Devolver array de strings YYYY-MM-DD
    });
  } catch (error) {
    console.error('Error al obtener fechas ocupadas de habitaciones:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudieron obtener las fechas ocupadas',
      error: error.message
    });
  }
});

// @desc    Obtener TODAS las fechas en las que CUALQUIER habitación está ocupada
// @route   GET /api/reservas/habitaciones/fechas-ocupadas-todas
// @access  Public
exports.getAllHabitacionOccupiedDates = asyncHandler(async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ success: false, message: 'Faltan los parámetros fechaInicio o fechaFin' });
    }
    
    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);
    
    if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
      return res.status(400).json({ success: false, message: 'Fechas inválidas' });
    }

    // Buscar todas las reservas activas que se solapen con el rango
    const reservas = await ReservaHabitacion.find({
      estadoReserva: { $in: ['confirmada', 'pendiente'] }, // Solo activas
      $or: [
        { fechaEntrada: { $lt: fechaFinObj }, fechaSalida: { $gt: fechaInicioObj } }, // Solapamiento
      ]
    });

    const occupiedDatesSet = new Set();

    reservas.forEach(reserva => {
      let currentDate = new Date(reserva.fechaEntrada);
      const endDate = new Date(reserva.fechaSalida);
      
      while (currentDate < endDate) {
        if (currentDate >= fechaInicioObj && currentDate <= fechaFinObj) {
          occupiedDatesSet.add(currentDate.toISOString().split('T')[0]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    const occupiedDatesArray = Array.from(occupiedDatesSet);

    res.status(200).json({
      success: true,
      data: occupiedDatesArray // Devolver array de strings YYYY-MM-DD
    });
  } catch (error) {
    console.error('Error al obtener todas las fechas ocupadas de habitaciones:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudieron obtener todas las fechas ocupadas',
      error: error.message
    });
  }
});

// @desc    Actualizar información de huéspedes para una reserva de habitación
// @route   PUT /api/reservas/habitaciones/:id/huespedes
// @access  Private
exports.updateReservaHabitacionHuespedes = asyncHandler(async (req, res, next) => {
  const { numHuespedes, infoHuespedes } = req.body;

  // Validación básica de entrada
  if (numHuespedes === undefined && infoHuespedes === undefined) {
    return next(
      new ErrorResponse('Debe proporcionar numHuespedes o infoHuespedes', 400)
    );
  }
  
  if (numHuespedes !== undefined && (typeof numHuespedes !== 'number' || numHuespedes < 1)) {
    return next(
      new ErrorResponse('El número de huéspedes debe ser un número positivo', 400)
    );
  }

  if (infoHuespedes !== undefined) {
    if (typeof infoHuespedes !== 'object' || infoHuespedes === null) {
      return next(
        new ErrorResponse('infoHuespedes debe ser un objeto', 400)
      );
    }
    if (infoHuespedes.nombres !== undefined && !Array.isArray(infoHuespedes.nombres)) {
      return next(
        new ErrorResponse('infoHuespedes.nombres debe ser un array', 400)
      );
    }
    if (infoHuespedes.detalles !== undefined && typeof infoHuespedes.detalles !== 'string') {
      return next(
        new ErrorResponse('infoHuespedes.detalles debe ser un string', 400)
      );
    }
  }

  try {
    let reserva = await ReservaHabitacion.findById(req.params.id);

    if (!reserva) {
      return next(
        new ErrorResponse(`Reserva no encontrada con ID ${req.params.id}`, 404)
      );
    }

    // TODO: Añadir comprobación de permisos si es necesario
    // Por ejemplo, ¿solo el admin o el creador del evento pueden modificar?
    // if (reserva.creadoPor.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return next(new ErrorResponse('No autorizado para actualizar esta reserva', 401));
    // }

    // Actualizar los campos proporcionados
    const updateData = {};
    if (numHuespedes !== undefined) {
      updateData.numHuespedes = numHuespedes;
    }
    if (infoHuespedes !== undefined) {
      // Asegurarse de que no sobreescribimos todo el objeto si solo viene una parte
      updateData.infoHuespedes = { ...reserva.infoHuespedes }; 
      if (infoHuespedes.nombres !== undefined) {
        updateData.infoHuespedes.nombres = infoHuespedes.nombres;
      }
      if (infoHuespedes.detalles !== undefined) {
        updateData.infoHuespedes.detalles = infoHuespedes.detalles;
      }
    }

    // Guardar los cambios
    reserva = await ReservaHabitacion.findByIdAndUpdate(req.params.id, updateData, {
      new: true, // Devolver el documento modificado
      runValidators: true // Ejecutar validadores del schema
    });

    res.status(200).json({
      success: true,
      data: reserva
    });

  } catch (error) {
    console.error('Error al actualizar huéspedes de reserva:', error);
    next(error);
  }
});

// @desc    Asignar una reserva de habitación a un administrador
// @route   PUT /api/reservas/habitaciones/:id/asignar
// @access  Private (Admin)
exports.asignarHabitacionAdmin = asyncHandler(async (req, res, next) => {
  try {
    const habitacionId = req.params.id;
    const adminId = req.user.id; // ID del admin haciendo la petición

    // 1. Buscar la habitación
    const habitacion = await ReservaHabitacion.findById(habitacionId);
    if (!habitacion) {
      return next(new ErrorResponse('Reserva de habitación no encontrada', 404));
    }

    // 2. Asignar la habitación al admin
    habitacion.asignadoA = adminId;
    console.log(`Habitación ${habitacionId} asignada a admin ${adminId}`);

    // 3. Si la habitación está asociada a un evento, asignar también el evento
    if (habitacion.reservaEvento) {
      const ReservaEvento = require('../models/ReservaEvento'); // Asegurar modelo disponible
      const evento = await ReservaEvento.findById(habitacion.reservaEvento);
      if (evento && !evento.asignadoA) { // Solo asignar el evento si no tiene ya alguien
        evento.asignadoA = adminId;
        await evento.save();
        console.log(`Evento ${habitacion.reservaEvento} asociado también asignado a admin ${adminId}`);
      } else if (evento && evento.asignadoA && evento.asignadoA.toString() !== adminId) {
        console.warn(`La habitación ${habitacionId} pertenece al evento ${habitacion.reservaEvento} que ya está asignado a otro admin (${evento.asignadoA}). No se reasigna el evento.`);
        // Podrías decidir si quieres permitir reasignar el evento aquí o no
      }
    }
    
    // Guardar la habitación (después de potencial cambio en evento)
    await habitacion.save();

    res.status(200).json({ 
      success: true, 
      message: 'Habitación asignada correctamente.', 
      data: habitacion // Opcional: devolver la habitación actualizada
    });

  } catch (error) {
    console.error('Error asignando habitación a admin:', error);
    next(error); // Pasar el error al manejador de errores global
  }
}); 