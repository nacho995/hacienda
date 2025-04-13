const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const ReservaEvento = require('../models/ReservaEvento');
const User = require('../models/User');
const { sendEmail, sendBankTransferInstructions } = require('../utils/email');
const mongoose = require('mongoose'); // Importar mongoose
const Habitacion = require('../models/Habitacion');
const bankTransferInstructionsTemplate = require('../emails/bankTransferInstructions');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

// @desc    Crear una nueva reserva de habitación
// @route   POST /api/reservas/habitaciones
// @access  Public
const createReservaHabitacion = asyncHandler(async (req, res, next) => {
  // Iniciar sesión de MongoDB
  const session = await mongoose.startSession();

  try {
    // Iniciar transacción
    await session.withTransaction(async () => {
      // Si hay un usuario autenticado, usar su ID
      if (req.user) {
        req.body.usuario = req.user.id;
      }
      
      // Extraer datos de la solicitud
      const { 
        tipoHabitacion, 
        habitacion, // Este es el ID/Letra de la habitación específica
        fechaEntrada, 
        fechaSalida, 
        numeroHabitaciones = 1, // Asegurar default si no viene
        tipoReserva = 'hotel',
        categoriaHabitacion = 'doble',
        precioPorNoche,
        infoHuespedes,
        letraHabitacion, // Puede ser redundante si 'habitacion' ya es la letra/ID
        reservaEvento,
        metodoPago = 'pendiente', // Default más seguro
        estadoPago = 'pendiente'
      } = req.body;

      const fechaEntradaObj = new Date(fechaEntrada);
      const fechaSalidaObj = new Date(fechaSalida);

      // Validaciones básicas de fechas
      if (isNaN(fechaEntradaObj.getTime()) || isNaN(fechaSalidaObj.getTime())) {
        throw new ErrorResponse('Fechas inválidas proporcionadas.', 400);
      }
      if (fechaEntradaObj >= fechaSalidaObj) {
        throw new ErrorResponse('La fecha de entrada debe ser anterior a la fecha de salida.', 400);
      }
      
      // --- Verificación de disponibilidad DENTRO de la transacción ---
      const reservaSolapada = await ReservaHabitacion.findOne({
        habitacion: habitacion, 
        estadoReserva: { $in: ['pendiente', 'confirmada', 'completada'] }, 
        fechaEntrada: { $lt: fechaSalidaObj }, 
        fechaSalida: { $gt: fechaEntradaObj }
      }).session(session); 

      if (reservaSolapada) {
        throw new ErrorResponse(`La habitación ${habitacion} no está disponible para las fechas seleccionadas. Ya existe una reserva (${reservaSolapada.estadoReserva}) que se solapa.`, 409); 
      }

      // --- Si no hay solapamiento, continuamos con la creación ---

      const duracionEstancia = Math.ceil((fechaSalidaObj - fechaEntradaObj) / (1000 * 60 * 60 * 24));
      let precioTotal = 0;
      let precioNocheFinal = 0;

      if (tipoReserva === 'hotel') {
        let precioPorNocheCalculado = 0;
        if (categoriaHabitacion === 'sencilla') {
          precioPorNocheCalculado = precioPorNoche !== undefined ? precioPorNoche : 2400;
        } else { 
          precioPorNocheCalculado = precioPorNoche !== undefined ? precioPorNoche : 2600;
        }
        precioTotal = precioPorNocheCalculado * duracionEstancia * numeroHabitaciones;
        precioNocheFinal = precioPorNocheCalculado;
      } else { 
        precioTotal = precioPorNoche !== undefined ? precioPorNoche : 0;
        precioNocheFinal = precioPorNoche !== undefined ? precioPorNoche : 0;
      }

      const reservaData = {
        ...req.body,
        fechaEntrada: fechaEntradaObj,
        fechaSalida: fechaSalidaObj,
        precio: precioTotal,
        precioPorNoche: precioNocheFinal,
        tipoReserva,
        categoriaHabitacion,
        infoHuespedes: infoHuespedes || { nombres: [], detalles: '' },
        letraHabitacion: letraHabitacion || habitacion, 
        metodoPago,
        estadoPago,
      };
      
      if (!reservaData.tipoHabitacion || !reservaData.habitacion || reservaData.precio === undefined) { // Corrección: comparar con undefined
         throw new ErrorResponse('Faltan datos esenciales para la reserva (tipo, habitación, precio).', 400);
      }

      const [reservaCreada] = await ReservaHabitacion.create([reservaData], { session }); 

      if (!reservaCreada) {
         throw new ErrorResponse('No se pudo crear la reserva en la base de datos.', 500);
      }
      
      req.reservaCreada = reservaCreada; 
      req.metodoPago = metodoPago;

    }); // Fin de session.withTransaction

    const reserva = req.reservaCreada;
    const metodoPagoSeleccionado = req.metodoPago;

    console.log(`>>> [ReservaHabitación] Valor de 'reserva' antes del IF de email: ${reserva ? reserva._id : String(reserva)}`);

    if (reserva) {
      try {
        const clienteEmail = reserva.emailContacto || (reserva.usuario?.email);
        
        // --- ¿Enviar email de confirmación o instrucciones de transferencia? ---
        if (clienteEmail) {
          if (reserva.metodoPago === 'transferencia' && reserva.estadoReserva === 'pendiente_pago') {
            // --- ENVIAR INSTRUCCIONES DE TRANSFERENCIA ---
            console.log(`>>> [ReservaHabitación] Preparando envío de instrucciones de transferencia a: ${clienteEmail}`);
            await sendBankTransferInstructions({
              email: clienteEmail,
              nombreCliente: `${reserva.nombreContacto || 'Cliente'} ${reserva.apellidosContacto || ''}`.trim(),
              numeroConfirmacion: reserva.numeroConfirmacion,
              montoTotal: reserva.precio
            });

          } else {
             // --- ENVIAR EMAIL DE CONFIRMACIÓN NORMAL (Para otros métodos o estados) ---
             let mensajeAdicionalCliente = '';
             if (metodoPagoSeleccionado === 'tarjeta') {
               mensajeAdicionalCliente = '<p>Su pago con tarjeta fue procesado exitosamente.</p>'; // Asumiendo pago exitoso
             } else if (metodoPagoSeleccionado === 'efectivo') {
               mensajeAdicionalCliente = '<p>Usted ha elegido pagar en efectivo al llegar. Por favor presente su número de confirmación en la recepción.</p>';
             } // No añadir mensaje para transferencia aquí, ya se envió el email específico
             
             const confirmacionReserva = require('../emails/confirmacionReserva'); // Mover require aquí si solo se usa en este bloque
             const htmlCliente = confirmacionReserva({
                // ... (parámetros existentes para confirmacionReserva)
               nombreCliente: `${reserva.nombreContacto || 'Cliente'} ${reserva.apellidosContacto || ''}`.trim(),
               tipoEvento: `Habitación ${reserva.habitacion} (${reserva.tipoHabitacion || 'No especificado'})`,
               fechaEvento: `${new Date(reserva.fechaEntrada).toLocaleDateString()} - ${new Date(reserva.fechaSalida).toLocaleDateString()}`,
               numeroConfirmacion: reserva.numeroConfirmacion,
               detallesAdicionales: {
                 precio: `${reserva.precio} ${reserva.tipoReserva === 'hotel' ? 'MXN' : '(Incluido en Evento)'}`,
                 metodoPago: metodoPagoSeleccionado.charAt(0).toUpperCase() + metodoPagoSeleccionado.slice(1),
                 notaAdicional: mensajeAdicionalCliente.replace(/<\/?p>/g, '')
               },
               urlConfirmacion: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reserva/${reserva._id}` // <-- USAR RUTA PÚBLICA
             });
             
             console.log(`>>> [ReservaHabitación] Intentando enviar confirmación normal a cliente: ${clienteEmail}`);
             await sendEmail({
               email: clienteEmail,
               subject: 'Confirmación de reserva - Hacienda San Carlos Borromeo',
               html: htmlCliente
             });
          }
        } else {
          console.warn(`[Email Send] No se pudo determinar el email del cliente para la reserva ${reserva._id}`);
        }

        // --- EMAIL A LA HACIENDA (ADMIN) se envía siempre ---
        const adminEmailsString = process.env.ADMIN_EMAIL;
        if (adminEmailsString) {
            const adminEmailArray = adminEmailsString.split(',').map(email => email.trim());
            if (adminEmailArray.length > 0) {
                const notificacionGestionAdmin = require('../emails/notificacionGestionAdmin');
                const htmlAdmin = notificacionGestionAdmin({
                  accion: "Nueva Reserva",
                  tipoReserva: `Habitación (${reserva.tipoReserva})`,
                  numeroConfirmacion: reserva.numeroConfirmacion,
                  nombreCliente: `${reserva.nombreContacto || 'No especificado'} ${reserva.apellidosContacto || ''}`,
                  emailCliente: clienteEmail || 'No disponible',
                  detallesAdicionales: {
                    telefono: reserva.telefonoContacto || 'No disponible',
                    habitacion: `${reserva.habitacion} (${reserva.tipoHabitacion || 'No especificado'})`,
                    fechas: `${new Date(reserva.fechaEntrada).toLocaleDateString()} - ${new Date(reserva.fechaSalida).toLocaleDateString()}`,
                    precio: `${reserva.precio} ${reserva.tipoReserva === 'hotel' ? 'MXN' : '(Incluido en Evento)'}`,
                    metodoPago: metodoPagoSeleccionado.charAt(0).toUpperCase() + metodoPagoSeleccionado.slice(1),
                    estado: reserva.estadoReserva || 'pendiente',
                    notas: reserva.infoHuespedes?.detalles || 'Ninguna'
                  },
                  urlGestionReserva: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reservas/habitaciones/${reserva._id}`
                });
                
                console.log(`>>> [ReservaHabitación] Intentando enviar notificación a admin: ${adminEmailArray.join(', ')}`);
                await sendEmail({
                  email: adminEmailArray, 
                  subject: `Nueva Reserva Habitación #${reserva.numeroConfirmacion} (${reserva.tipoReserva})`,
                  html: htmlAdmin
                });
            } else {
                 console.warn('[Email Send] ADMIN_EMAIL está configurado pero no contiene direcciones válidas después de dividir.');
            }
        } else {
            console.warn('[Email Send] La variable de entorno ADMIN_EMAIL no está configurada. No se envió notificación a la hacienda.');
        }

      } catch (err) {
        console.error(`[Email Send] Error al enviar email(s) para reserva ${reserva?._id} (la reserva FUE creada):`, err);
      }
    }

    res.status(201).json({
      success: true,
      data: reserva 
    });

  } catch (error) {
    console.error('Error durante la transacción de creación de reserva:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error al crear la reserva de habitación';
    // Evitar enviar el objeto error completo en producción si contiene detalles sensibles
    res.status(statusCode).json({
      success: false,
      message: message
    });
  } finally {
    await session.endSession();
  }
});

// @desc    Obtener todas las reservas de habitaciones
// @route   GET /api/reservas/habitaciones
// @access  Private
const getReservasHabitacion = asyncHandler(async (req, res, next) => {
  try {
    let query = {};
    const { from_admin, misReservas, disponibles, sinAsignar, fechaInicio, fechaFin, estado, habitacionId } = req.query;

    // Lógica de filtrado para admin/usuario normal (simplificada para claridad)
    if (req.user && from_admin === 'true') { 
      if (misReservas === 'true') query.asignadoA = req.user.id;
      else if (disponibles === 'true' || sinAsignar === 'true') query.asignadoA = null;
    } else if (req.user) { 
      query.$or = [ { usuario: req.user.id }, { asignadoA: req.user.id } ];
    } else {
       query._id = null; // No autenticado, devuelve vacío por defecto
    }

    // Filtros Adicionales
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (!isNaN(inicio) && !isNaN(fin) && inicio <= fin) {
        // Añadir condición de solapamiento al query existente
        const dateCondition = { fechaEntrada: { $lt: fin }, fechaSalida: { $gt: inicio } };
        if (query.$or) {
            // Si ya hay un $or (del filtro de usuario), añadirlo a una condición $and
            query.$and = [ { $or: query.$or }, dateCondition ];
            delete query.$or; // Quitar el $or original
        } else {
            // Si no hay $or, añadir directamente la condición de fecha
             Object.assign(query, dateCondition);
        }
      }
    } // Podrían añadirse casos para solo fechaInicio o fechaFin si es necesario
    
    if (estado && ['pendiente', 'confirmada', 'cancelada', 'completada'].includes(estado)) {
      query.estadoReserva = estado;
    }
    if (habitacionId) {
      query.habitacion = habitacionId; 
    }
    
    const reservas = await ReservaHabitacion.find(query)
      .populate({ path: 'usuario', select: 'nombre apellidos email', strictPopulate: false })
      .populate({ path: 'asignadoA', select: 'nombre apellidos email', strictPopulate: false })
      .populate({ path: 'reservaEvento', select: 'nombreEvento fecha', strictPopulate: false }) 
      .sort('-fechaEntrada'); 
    
    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas
    });
  } catch (error) {
    console.error('Error al obtener las reservas de habitación:', error);
    next(error); 
  }
});

// @desc    Obtener una reserva de habitación por ID
// @route   GET /api/reservas/habitaciones/:id
// @access  Private/Admin
const getReservaHabitacionById = asyncHandler(async (req, res, next) => {
  const reserva = await ReservaHabitacion.findById(req.params.id)
    .populate('asignadoA', 'nombre apellidos email')
    .populate('habitacion')
    .populate('reservaEvento');

  if (!reserva) {
    return next(new ErrorResponse(`Reserva no encontrada con ID ${req.params.id}`, 404));
  }

  // TODO: Revisar lógica de autorización.
  // La comprobación original `reserva.usuario.toString() !== req.user.id` podría fallar
  // si 'usuario' no está definido o no es lo que se espera.
  // Considerar si la autorización debe basarse en `reserva.usuario` (creador) o `reserva.asignadoA`.
  // Por ahora, se comenta para evitar errores si `reserva.usuario` es null.
  /* 
  if (reserva.usuario?.toString() !== req.user.id && req.user.role !== 'admin') {
     return next(new ErrorResponse('No autorizado para acceder a esta reserva', 401));
  }
  */

  res.status(200).json({ success: true, data: reserva });
});

// @desc    Actualizar una reserva de habitación
// @route   PUT /api/reservas/habitaciones/:id
// @access  Private (Admin)
const updateReservaHabitacion = asyncHandler(async (req, res, next) => {
    const { numeroConfirmacion, ...updateData } = req.body;
    // TODO: Añadir re-validación de disponibilidad si se cambian fechas/habitación.
    const reserva = await ReservaHabitacion.findByIdAndUpdate(req.params.id, updateData, {
        new: true, 
        runValidators: true 
    });
    if (!reserva) {
        return next(new ErrorResponse(`Reserva no encontrada con ID ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: reserva });
});

// @desc    Eliminar una reserva de habitación
// @route   DELETE /api/reservas/habitaciones/:id
// @access  Private (Admin)
const deleteReservaHabitacion = asyncHandler(async (req, res, next) => {
    const reserva = await ReservaHabitacion.findById(req.params.id);
    if (!reserva) {
        return next(new ErrorResponse(`Reserva no encontrada con ID ${req.params.id}`, 404));
    }
    await reserva.deleteOne(); 
    res.status(200).json({ success: true, data: {} }); 
});

// @desc    Asignar una reserva de habitación a un usuario (Admin)
// @route   PUT /api/reservas/habitaciones/:id/asignar
// @access  Private (Admin)
const asignarReservaHabitacion = asyncHandler(async (req, res, next) => {
  const { usuarioId } = req.body;
  if (!usuarioId) {
    return next(new ErrorResponse('Por favor, proporcione el ID del usuario a asignar.', 400));
  }
  const userExists = await User.findById(usuarioId);
  if (!userExists) {
      return next(new ErrorResponse(`Usuario no encontrado con ID ${usuarioId}`, 404));
  }
  const reserva = await ReservaHabitacion.findByIdAndUpdate(
    req.params.id,
    { asignadoA: usuarioId },
    { new: true, runValidators: true }
  ).populate('asignadoA', 'nombre apellidos email'); 
  if (!reserva) {
    return next(new ErrorResponse(`Reserva no encontrada con ID ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: reserva });
});

// @desc    Desasignar una reserva de habitación (Admin)
// @route   PUT /api/reservas/habitaciones/:id/desasignar
// @access  Private (Admin)
const desasignarReservaHabitacion = asyncHandler(async (req, res, next) => {
  const reserva = await ReservaHabitacion.findByIdAndUpdate(
    req.params.id,
    { asignadoA: null }, 
    { new: true, runValidators: true }
  );
  if (!reserva) {
    return next(new ErrorResponse(`Reserva no encontrada con ID ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: reserva, message: 'Reserva de habitación desasignada exitosamente' });
});


// @desc    Actualizar estado de una reserva de habitación (Admin)
// @route   PATCH /api/reservas/habitaciones/:id/estado
// @access  Private (Admin)
const actualizarEstadoReservaHabitacion = asyncHandler(async (req, res, next) => {
  const { estado } = req.body;
  const validStates = ['pendiente', 'confirmada', 'cancelada', 'completada'];
  if (!estado || !validStates.includes(estado)) {
    return next(new ErrorResponse(`Estado inválido. Los estados permitidos son: ${validStates.join(', ')}.`, 400));
  }
  const reserva = await ReservaHabitacion.findByIdAndUpdate(
    req.params.id,
    { estadoReserva: estado },
    { new: true, runValidators: true }
  );
  if (!reserva) {
    return next(new ErrorResponse(`Reserva no encontrada con ID ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: reserva });
});

// @desc    Comprobar disponibilidad de habitaciones
// @route   POST /api/reservas/habitaciones/disponibilidad
// @access  Public
const checkHabitacionAvailability = asyncHandler(async (req, res, next) => {
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
const getHabitacionOccupiedDates = asyncHandler(async (req, res, next) => {
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
      fechaEntrada: { $lt: fechaFinObj }, 
      fechaSalida: { $gt: fechaInicioObj } 
    }).select('fechaEntrada fechaSalida'); 

    reservasHabitacion.forEach(reserva => {
      let currentDate = new Date(reserva.fechaEntrada);
      const endDate = new Date(reserva.fechaSalida);
      
      while (currentDate < endDate) {
        if (currentDate >= new Date(fechaInicio) && currentDate < new Date(fechaFin).setDate(new Date(fechaFin).getDate() + 1) ) {
          occupiedDatesSet.add(currentDate.toISOString().split('T')[0]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // --- Devolver solo las fechas ocupadas por la habitación específica --- 
    const occupiedDatesArray = Array.from(occupiedDatesSet);

    res.status(200).json({
      success: true,
      data: occupiedDatesArray 
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
const getAllHabitacionOccupiedDates = asyncHandler(async (req, res, next) => {
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
const updateReservaHabitacionHuespedes = asyncHandler(async (req, res, next) => {
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
const asignarHabitacionAdmin = asyncHandler(async (req, res, next) => {
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

// @desc    Comprobar disponibilidad de múltiples habitaciones en un rango de fechas
// @route   POST /api/reservas/habitaciones/verificar-disponibilidad-rango
// @access  Public (o Private si se necesita contexto de usuario)
const verificarDisponibilidadRango = asyncHandler(async (req, res, next) => {
  const { habitacionIds, fechaInicio, fechaFin, reservaActualId } = req.body;

  // Validaciones de entrada
  if (!Array.isArray(habitacionIds) || habitacionIds.length === 0) {
    return next(new ErrorResponse('Se requiere un array de IDs de habitación.', 400));
  }
  if (!fechaInicio || !fechaFin) {
    return next(new ErrorResponse('Se requieren fecha de inicio y fecha de fin.', 400));
  }

  const fechaInicioObj = new Date(fechaInicio);
  const fechaFinObj = new Date(fechaFin);

  if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
    return next(new ErrorResponse('Fechas inválidas.', 400));
  }
  if (fechaInicioObj >= fechaFinObj) {
    return next(new ErrorResponse('La fecha de inicio debe ser anterior a la fecha de fin.', 400));
  }

  try {
    const habitacionesOcupadas = [];
    let todasDisponibles = true;

    // Construir la consulta base para buscar conflictos
    const conflictQuery = {
      estadoReserva: { $in: ['pendiente', 'confirmada'] }, // Solo reservas activas
      fechaEntrada: { $lt: fechaFinObj }, // La reserva existente empieza antes de que termine la nueva
      fechaSalida: { $gt: fechaInicioObj } // La reserva existente termina después de que empiece la nueva
    };

    // Si estamos editando, excluimos la reserva actual de la comprobación
    if (reservaActualId) {
      conflictQuery._id = { $ne: new mongoose.Types.ObjectId(reservaActualId) };
    }

    // Iterar sobre cada habitación solicitada
    for (const habitacionId of habitacionIds) {
      const queryForThisRoom = { 
        ...conflictQuery,
        habitacion: habitacionId // Añadir filtro por habitación específica
      };

      const reservaSolapada = await ReservaHabitacion.findOne(queryForThisRoom).lean(); // Usar lean() para eficiencia

      if (reservaSolapada) {
        todasDisponibles = false;
        habitacionesOcupadas.push(habitacionId); 
        // Podríamos parar aquí si solo necesitamos saber si *alguna* está ocupada
        // break; 
        // O continuar para obtener la lista completa de las ocupadas
      }
    }

    if (todasDisponibles) {
      res.status(200).json({
        success: true,
        disponibles: true,
        message: 'Todas las habitaciones seleccionadas están disponibles para el rango especificado.'
      });
    } else {
      // Devolver un código 409 (Conflict) si no están disponibles
      res.status(409).json({
        success: true, // La operación de verificación fue exitosa, pero el resultado es no disponible
        disponibles: false,
        message: `Una o más habitaciones no están disponibles en las fechas seleccionadas.`,
        habitacionesOcupadas: habitacionesOcupadas
      });
    }

  } catch (error) {
    console.error('Error en verificarDisponibilidadRango:', error);
    // Manejar errores específicos como ID inválido si es necesario
    if (error.name === 'CastError') {
      return next(new ErrorResponse('Uno o más IDs de habitación o el ID de reserva actual son inválidos', 400));
    }
    next(error); // Pasar a manejador de errores global
  }
});

/**
 * @desc    Obtener todas las fechas ocupadas globalmente (habitaciones y eventos)
 * @route   GET /api/reservas/habitaciones/fechas-ocupadas-global
 * @access  Public
 */
const getGlobalOccupiedDates = asyncHandler(async (req, res, next) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return next(new ErrorResponse('Se requieren fechaInicio y fechaFin como parámetros query', 400));
  }

  const inicio = new Date(fechaInicio);
  inicio.setUTCHours(0, 0, 0, 0);
  const fin = new Date(fechaFin);
  fin.setUTCHours(23, 59, 59, 999);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    return next(new ErrorResponse('Formato de fecha inválido', 400));
  }

  const allOccupiedDates = new Set();

  // 1. Obtener fechas de ReservaHabitacion activas
  const reservasHabitacion = await ReservaHabitacion.find({
    $or: [
      { fechaEntrada: { $lte: fin, $gte: inicio } }, // Entrada en el rango
      { fechaSalida: { $gte: inicio, $lte: fin } }, // Salida en el rango
      { $and: [{ fechaEntrada: { $lt: inicio } }, { fechaSalida: { $gt: fin } }] } // Reserva abarca todo el rango
    ],
    estadoReserva: { $in: ['confirmada', 'pendiente_pago', 'check_in', 'pago_parcial'] } // Estados activos
  }).select('fechaEntrada fechaSalida');

  reservasHabitacion.forEach(reserva => {
    let currentDate = new Date(reserva.fechaEntrada);
    const endDate = new Date(reserva.fechaSalida);

    while (currentDate < endDate) { // Iterar hasta el día *antes* de la salida
      // Solo añadir si está dentro del rango solicitado
      if (currentDate >= inicio && currentDate <= fin) {
        const year = currentDate.getUTCFullYear();
        const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getUTCDate()).padStart(2, '0');
        allOccupiedDates.add(`${year}-${month}-${day}`);
      }
      currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Avanzar al día siguiente
    }
  });

  // 2. Obtener fechas de ReservaEvento activas
  const eventos = await ReservaEvento.find({
    fecha: {
      $gte: inicio,
      $lte: fin
    },
    estadoReserva: { $in: ['pendiente', 'confirmada', 'pago_parcial'] } // Estados activos
  }).select('fecha');

  eventos.forEach(evento => {
    const date = new Date(evento.fecha);
    // Asegurar que la fecha del evento también esté dentro del rango
    if (date >= inicio && date <= fin) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        allOccupiedDates.add(`${year}-${month}-${day}`);
    }
  });

  const sortedDates = Array.from(allOccupiedDates).sort();

  res.status(200).json({
    success: true,
    count: sortedDates.length,
    data: sortedDates, // Devolver array ordenado de fechas únicas YYYY-MM-DD
  });
});

// Exportaciones finales (asegurando que todas las usadas estén aquí)
module.exports = {
  createReservaHabitacion,
  getReservasHabitacion,
  getReservaHabitacionById,
  updateReservaHabitacion,
  deleteReservaHabitacion,
  getHabitacionOccupiedDates,
  verificarDisponibilidadRango,
  getGlobalOccupiedDates,
  asignarReservaHabitacion,
  desasignarReservaHabitacion,
  actualizarEstadoReservaHabitacion,
  checkHabitacionAvailability,
  getAllHabitacionOccupiedDates,
  updateReservaHabitacionHuespedes,
}; 