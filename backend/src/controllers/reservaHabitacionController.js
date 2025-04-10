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
    let query = { estadoReserva: { $ne: 'cancelada' } };
    
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
          estadoReserva: { $ne: 'cancelada' }, // mantener filtro de estado
          $or: [
            { asignadoA: req.user.id },
            { asignadoA: null }
          ]
        };
      }
    } else if (req.user) {
      // Usuario autenticado normal: ver sus propias reservas
      query = {
        estadoReserva: { $ne: 'cancelada' }, // mantener filtro de estado
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
    
    // Si se está cambiando la fecha, tipo o número de habitaciones, verificar disponibilidad
    if (
      req.body.tipoHabitacion || 
      req.body.fechaEntrada || 
      req.body.fechaSalida || 
      req.body.numeroHabitaciones
    ) {
      const tipoHabitacion = req.body.tipoHabitacion || reserva.tipoHabitacion;
      const fechaEntrada = req.body.fechaEntrada || reserva.fechaEntrada;
      const fechaSalida = req.body.fechaSalida || reserva.fechaSalida;
      const numeroHabitaciones = req.body.numeroHabitaciones || reserva.numeroHabitaciones;
      
      const disponibilidad = await ReservaHabitacion.comprobarDisponibilidad(
        tipoHabitacion,
        fechaEntrada,
        fechaSalida
      );
      
      if (!disponibilidad.disponible) {
        return res.status(400).json({
          success: false,
          message: 'No hay disponibilidad para las nuevas fechas o tipo de habitación'
        });
      }
    }
    
    reserva = await ReservaHabitacion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la reserva de habitación'
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

// @desc    Obtener fechas ocupadas para habitaciones
// @route   GET /api/reservas/habitaciones/fechas-ocupadas
// @access  Public
exports.getHabitacionOccupiedDates = asyncHandler(async (req, res, next) => {
  try {
    // Parámetros opcionales para filtrar por tipo de habitación y fechas
    const { tipoHabitacion, fechaInicio, fechaFin } = req.query;
    
    // Construir el query
    const query = {
      estadoReserva: { $ne: 'cancelada' }
    };
    
    // Si se especifica un tipo de habitación, filtrar por él
    if (tipoHabitacion) {
      query.tipoHabitacion = tipoHabitacion;
    }
    
    // Si hay fechas de inicio y fin, filtrar el rango
    if (fechaInicio && fechaFin) {
      // Para habitaciones, hay que considerar todo el rango de fechas (entrada a salida)
      query.$or = [
        // Fecha entrada está dentro del rango solicitado
        {
          fechaEntrada: {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin)
          }
        },
        // Fecha salida está dentro del rango solicitado
        {
          fechaSalida: {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin)
          }
        },
        // El rango solicitado está completamente dentro de la estancia
        {
          fechaEntrada: { $lte: new Date(fechaInicio) },
          fechaSalida: { $gte: new Date(fechaFin) }
        }
      ];
    } 
    
    // Proyectar solo los campos necesarios
    const reservas = await ReservaHabitacion.find(query, 'fechaEntrada fechaSalida tipoHabitacion numeroHabitaciones')
      .sort({ fechaEntrada: 1 });
    
    // Preparar datos para el frontend
    const fechasOcupadas = reservas.map(reserva => ({
      fechaEntrada: reserva.fechaEntrada,
      fechaSalida: reserva.fechaSalida,
      tipoHabitacion: reserva.tipoHabitacion,
      numeroHabitaciones: reserva.numeroHabitaciones
    }));
    
    res.status(200).json({
      success: true,
      data: fechasOcupadas
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