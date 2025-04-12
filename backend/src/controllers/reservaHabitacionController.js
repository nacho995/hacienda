const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const ReservaEvento = require('../models/ReservaEvento');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const mongoose = require('mongoose'); // Importar mongoose

// @desc    Crear una nueva reserva de habitación
// @route   POST /api/reservas/habitaciones
// @access  Public
exports.createReservaHabitacion = asyncHandler(async (req, res, next) => {
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

    if (reserva && typeof sendEmail === 'function') {
      try {
        let mensajeAdicionalCliente = '';
        if (metodoPagoSeleccionado === 'tarjeta') {
          mensajeAdicionalCliente = '<p>Su pago con tarjeta está siendo procesado. Recibirá una confirmación adicional cuando se complete.</p>';
        } else if (metodoPagoSeleccionado === 'transferencia') {
          mensajeAdicionalCliente = '<p>Usted ha elegido pagar mediante transferencia. Recibirá instrucciones por separado.</p>';
        } else { // Asumir efectivo u otro método pendiente
          mensajeAdicionalCliente = '<p>Usted ha elegido pagar en efectivo al llegar. Por favor presente su número de confirmación en la recepción.</p>';
        }
        
        // --- EMAIL AL CLIENTE ---
        const clienteEmail = reserva.emailContacto || (reserva.usuario?.email); // Usar optional chaining
        if (clienteEmail) {
          // Importar la plantilla de confirmación de reserva
          const confirmacionReserva = require('../emails/confirmacionReserva');
          
          // Adaptar la plantilla para una reserva de habitación
          const htmlCliente = confirmacionReserva({
            nombreCliente: `${reserva.nombreContacto || 'Cliente'} ${reserva.apellidosContacto || ''}`,
            tipoEvento: `Habitación ${reserva.habitacion} (${reserva.tipoHabitacion || 'No especificado'})`,
            fechaEvento: `${new Date(reserva.fechaEntrada).toLocaleDateString()} - ${new Date(reserva.fechaSalida).toLocaleDateString()}`,
            numeroConfirmacion: reserva.numeroConfirmacion,
            detallesAdicionales: {
              precio: `${reserva.precio} ${reserva.tipoReserva === 'hotel' ? 'MXN' : '(Incluido en Evento)'}`,
              metodoPago: metodoPagoSeleccionado.charAt(0).toUpperCase() + metodoPagoSeleccionado.slice(1),
              notaAdicional: mensajeAdicionalCliente.replace(/<\/?p>/g, '')
            },
            urlConfirmacion: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/perfil/reservas/${reserva.numeroConfirmacion}`
          });
          
          await sendEmail({
            email: clienteEmail,
            subject: 'Confirmación de reserva - Hacienda San Carlos Borromeo',
            html: htmlCliente
          });
        } else {
          console.warn(`[Email Send] No se pudo determinar el email del cliente para la reserva ${reserva._id}`);
        }

        // --- EMAIL A LA HACIENDA (ADMIN) ---
        const adminEmailsString = process.env.ADMIN_EMAIL;
        if (adminEmailsString) {
            // Dividir la cadena de emails por comas y quitar espacios en blanco
            const adminEmailArray = adminEmailsString.split(',').map(email => email.trim());

            if (adminEmailArray.length > 0) {
                // Importar la plantilla de notificación para administradores
                const notificacionGestionAdmin = require('../emails/notificacionGestionAdmin');
                
                // Crear la plantilla para admin con la notificación de nueva reserva
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
                
                await sendEmail({
                  email: adminEmailArray, // <-- Pasar el array de emails
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
        // No relanzar el error aquí para no fallar la respuesta HTTP principal
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
exports.getReservasHabitacion = asyncHandler(async (req, res, next) => {
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
// @access  Private
exports.getReservaHabitacionById = asyncHandler(async (req, res, next) => {
  try {
    let reserva = await ReservaHabitacion.findById(req.params.id)
      .populate('asignadoA', 'nombre apellidos email') // Populamos los otros primero
      .populate('reservaEvento', 'nombreEvento fecha');

    if (!reserva) {
      return next(new ErrorResponse(`Reserva no encontrada con ID ${req.params.id}`, 404));
    }

    // Intentar popular 'usuario' por separado y manejar el error si falla
    try {
      // Necesitamos re-ejecutar el populate en el documento encontrado
      await reserva.populate({ path: 'usuario', select: 'nombre apellidos email' });
    } catch (populateError) {
      // Si falla el populate de 'usuario', simplemente lo dejamos como null o undefined
      // y continuamos, en lugar de lanzar un error 500.
      console.warn(`[Populate Warn] No se pudo popular 'usuario' para ReservaHabitacion ${req.params.id}: ${populateError.message}`);
      // El campo reserva.usuario podría quedar como el ObjectId original o null/undefined,
      // el frontend debería manejar esto.
    }

    res.status(200).json({ success: true, data: reserva });

  } catch (error) {
    // Capturar otros errores inesperados
    console.error(`Error en getReservaHabitacionById para ID ${req.params.id}:`, error);
    next(error); // Pasar a middleware de errores
  }
});

// @desc    Actualizar una reserva de habitación
// @route   PUT /api/reservas/habitaciones/:id
// @access  Private (Admin)
exports.updateReservaHabitacion = asyncHandler(async (req, res, next) => {
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
exports.deleteReservaHabitacion = asyncHandler(async (req, res, next) => {
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
exports.asignarReservaHabitacion = asyncHandler(async (req, res, next) => {
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
exports.desasignarReservaHabitacion = asyncHandler(async (req, res, next) => {
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
exports.actualizarEstadoReservaHabitacion = asyncHandler(async (req, res, next) => {
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