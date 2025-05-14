const asyncHandler = require('../middleware/async'); // <-- Ruta corregida a async.js
const ErrorResponse = require('../utils/errorResponse');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const ReservaEvento = require('../models/ReservaEvento');
const User = require('../models/User');
const { sendEmail, sendBankTransferInstructions, enviarConfirmacionReservaHabitacion } = require('../utils/email');
const mongoose = require('mongoose'); // Importar mongoose
const Habitacion = require('../models/Habitacion');
const bankTransferInstructionsTemplate = require('../emails/bankTransferInstructions');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // <-- IMPORTAR Y CONFIGURAR STRIPE
const TipoHabitacion = require('../models/TipoHabitacion'); // <-- Importar TipoHabitacion
const notificacionGestionAdmin = require('../emails/notificacionGestionAdmin'); // Importar plantilla admin

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
        tipoHabitacion: tipoHabitacionNombre, // <-- Renombrar para claridad
        habitacion: habitacionIdentificador, // <-- ID o Letra?
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
      
      // --- Buscar Documentos Relacionados ---
      const tipoHabDoc = await TipoHabitacion.findOne({ nombre: tipoHabitacionNombre }).session(session).lean();
      if (!tipoHabDoc) {
        throw new ErrorResponse(`Tipo de habitación inválido: ${tipoHabitacionNombre}`, 400);
      }
      const tipoHabitacionId = tipoHabDoc._id;

      // Asumiendo que habitacionIdentificador es la LETRA (ajustar si es ID)
      const habitacionDoc = await Habitacion.findOne({ letra: habitacionIdentificador }).session(session).lean();
      if (!habitacionDoc) {
          throw new ErrorResponse(`Habitación no encontrada: ${habitacionIdentificador}`, 404);
      }
      const habitacionObjectId = habitacionDoc._id;

      // --- Verificación de disponibilidad DENTRO de la transacción ---
      // *** USAR ESTADOS CONSISTENTES ***
      const activeStates = ['confirmada', 'pendiente_pago', 'check_in', 'pago_parcial']; 
      
      const reservaSolapada = await ReservaHabitacion.findOne({
        habitacion: habitacionObjectId, // <-- Usar ObjectId para la búsqueda
        estadoReserva: { $in: activeStates }, // <-- Usar el array consistente
        fechaEntrada: { $lt: fechaSalidaObj }, 
        fechaSalida: { $gt: fechaEntradaObj }
      }).session(session); 

      if (reservaSolapada) {
        // *** Mensaje de error mejorado ***
        throw new ErrorResponse(`Conflicto: La habitación ${habitacionIdentificador} ya no está disponible entre ${fechaEntradaObj.toLocaleDateString()} y ${fechaSalidaObj.toLocaleDateString()}. Estado reserva existente: ${reservaSolapada.estadoReserva}.`, 409); 
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
        letraHabitacion: habitacionDoc.letra, // <-- Usar letra del documento encontrado
        metodoPago,
        estadoPago,
        estadoReserva: metodoPago === 'transferencia' ? 'pendiente_pago' : 'pendiente',
        // Asegurar que se guardan los ObjectId correctos:
        habitacion: habitacionObjectId,
        tipoHabitacion: tipoHabitacionId,
      };
      
      // Quitar el campo original del body si se renombró para evitar conflictos
      delete reservaData.tipoHabitacionNombre; 
      delete reservaData.habitacionIdentificador;

      // Validar IDs antes de crear
      if (!reservaData.tipoHabitacion || !reservaData.habitacion /* || !reservaData.precio === undefined*/) { // Validar precio si es necesario
         throw new ErrorResponse('Faltan IDs esenciales para la reserva (tipo, habitación). Precio: ' + reservaData.precio, 400);
      }

      const [reservaCreada] = await ReservaHabitacion.create([reservaData], { session }); 

      if (!reservaCreada) {
         throw new ErrorResponse('No se pudo crear la reserva en la base de datos.', 500);
      }
      
      req.reservaCreada = reservaCreada; 
      req.metodoPago = metodoPago;

    }); // Fin de session.withTransaction

    // Logs para depurar envío de email
    const reserva = req.reservaCreada;
    const metodoPagoSeleccionado = req.metodoPago;
    // console.log(`[Email Debug Habitación ${reserva?._id}] Reserva Creada: ${!!reserva}. Método Pago Seleccionado: ${metodoPagoSeleccionado}. Estado Reserva: ${reserva?.estadoReserva}`);

    if (reserva) {
      try {
        const clienteEmail = reserva.emailContacto || (reserva.usuario?.email);
        // console.log(`[Email Debug Habitación ${reserva._id}] Email Cliente: ${clienteEmail}`);
        
        // --- ¿Enviar email de confirmación o instrucciones de transferencia? ---
        if (clienteEmail) {
          // Log para ver si entra en la condición de transferencia
          // console.log(`[Email Debug Habitación ${reserva._id}] Verificando condiciones para transferencia: metodoPago=${reserva.metodoPago}, estadoReserva=${reserva.estadoReserva}`);
          if (reserva.metodoPago === 'transferencia' && reserva.estadoReserva === 'pendiente_pago') {
            // --- ENVIAR INSTRUCCIONES DE TRANSFERENCIA ---
            // console.log(`>>> [Email Debug Habitación ${reserva._id}] INTENTANDO enviar instrucciones de transferencia a: ${clienteEmail}`);
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
             
             const confirmacionReserva = require('../emails/confirmacionReserva'); 
             const htmlCliente = confirmacionReserva({
                // Pasar el objeto reserva completo (o los campos necesarios) a detallesAdicionales
               nombreCliente: `${reserva.nombreContacto || 'Cliente'} ${reserva.apellidosContacto || ''}`.trim(),
               tipoEvento: `Habitación ${habitacionIdentificador} (${tipoHabitacionNombre || 'No especificado'})`,
               fechaEvento: `${new Date(reserva.fechaEntrada).toLocaleDateString()} - ${new Date(reserva.fechaSalida).toLocaleDateString()}`,
               numeroConfirmacion: reserva.numeroConfirmacion,
               detallesAdicionales: {
                 // Incluir detalles relevantes aquí
                 Precio: `${reserva.precio} ${reserva.tipoReserva === 'hotel' ? 'MXN' : '(Incluido en Evento)'}`,
                 'Método de Pago': metodoPagoSeleccionado.charAt(0).toUpperCase() + metodoPagoSeleccionado.slice(1),
                 Huéspedes: reserva.numHuespedes || 'No especificado',
                 // Mantener la nota específica del pago
                 notaAdicional: mensajeAdicionalCliente.replace(/<\/?p>/g, '') 
               },
               urlConfirmacion: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reserva/${reserva._id}` 
             });
             
             // console.log(`>>> [ReservaHabitación] Intentando enviar confirmación normal a cliente: ${clienteEmail}`);
             await sendEmail({
               email: clienteEmail,
               subject: 'Confirmación de reserva - Hacienda San Carlos Borromeo',
               html: htmlCliente
             });
          }
        } else {
          // console.warn(`[Email Send] No se pudo determinar el email del cliente para la reserva ${reserva._id}`);
        }

        // --- EMAIL A LA HACIENDA (ADMIN) se envía siempre ---
        const adminEmailsString = process.env.ADMIN_EMAIL;
        if (adminEmailsString) {
            const adminEmailArray = adminEmailsString.split(',').map(email => email.trim());
            if (adminEmailArray.length > 0) {
                const htmlAdmin = notificacionGestionAdmin({
                  accion: "Nueva Reserva",
                  tipoReserva: `Habitación (${reserva.tipoReserva})`,
                  numeroConfirmacion: reserva.numeroConfirmacion,
                  nombreCliente: `${reserva.nombreContacto || 'No especificado'} ${reserva.apellidosContacto || ''}`,
                  emailCliente: clienteEmail || 'No disponible',
                  detallesAdicionales: {
                    telefono: reserva.telefonoContacto || 'No disponible',
                    habitacion: `${habitacionIdentificador} (${tipoHabitacionNombre || 'No especificado'})`,
                    fechas: `${new Date(reserva.fechaEntrada).toLocaleDateString()} - ${new Date(reserva.fechaSalida).toLocaleDateString()}`,
                    precio: `${reserva.precio} ${reserva.tipoReserva === 'hotel' ? 'MXN' : '(Incluido en Evento)'}`,
                    // Añadir explícitamente metodoPago y estadoPago/estadoReserva
                    metodoPago: metodoPagoSeleccionado.charAt(0).toUpperCase() + metodoPagoSeleccionado.slice(1),
                    estadoPago: reserva.estadoPago || 'No disponible', // Usar estadoPago si existe
                    estadoReserva: reserva.estadoReserva || 'pendiente',
                    huespedes: reserva.numHuespedes || 'No especificado',
                    notas: reserva.peticionesEspeciales || reserva.infoHuespedes?.detalles || 'Ninguna'
                  },
                  // Pasar tipo, asunto y mensaje para la plantilla admin
                  tipo: 'Info', // O 'Success' si el pago está completo?
                  asunto: `Nueva Reserva Habitación #${reserva.numeroConfirmacion} (${reserva.tipoReserva})`,
                  mensaje: `Se ha creado una nueva reserva de habitación.`, // Mensaje genérico aquí, los detalles van en detallesAdicionales
                  // Pasar enlace y texto para el botón
                  enlaceAccion: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reservas/habitaciones/${reserva._id}`,
                  textoEnlace: 'Gestionar Reserva'
                });
                
                // console.log(`>>> [ReservaHabitación] Intentando enviar notificación a admin: ${adminEmailArray.join(', ')}`);
                await sendEmail({
                  email: adminEmailArray, 
                  subject: `Nueva Reserva Habitación #${reserva.numeroConfirmacion} (${reserva.tipoReserva})`,
                  html: htmlAdmin
                });
            } else {
                 // console.warn('[Email Send] ADMIN_EMAIL está configurado pero no contiene direcciones válidas después de dividir.');
            }
        } else {
            // console.warn('[Email Send] La variable de entorno ADMIN_EMAIL no está configurada. No se envió notificación a la hacienda.');
        }

      } catch (err) {
        // console.error(`[Email Send] Error al enviar email(s) para reserva ${reserva?._id} (la reserva FUE creada):`, err);
      }
    }

    res.status(201).json({
      success: true,
      data: reserva 
    });

  } catch (error) {
    // console.error('Error durante la transacción de creación de reserva:', error);
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

// @desc    Obtener TODAS las reservas de habitación (Admin)
// @route   GET /api/reservas/habitaciones
// @access  Private (Admin, Recepcionista)
const getAllReservasHabitacion = asyncHandler(async (req, res, next) => {
  // Calcular la fecha de hace SEIS días
  const hoy = new Date();
  const fechaDesdeHaceSeisDias = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 6);
  fechaDesdeHaceSeisDias.setHours(0, 0, 0, 0);
  
  const excludedStates = ['completada', 'completado']; // Excluir completadas si aplica

  const query = ReservaHabitacion.find({
    estadoReserva: { $nin: excludedStates },
    fechaSalida: { $gte: fechaDesdeHaceSeisDias } // <<< AÑADIDO: Filtrar por fecha de salida
  })
    .populate('usuario', 'nombre email') // Cliente que reservó (si aplica)
    .populate('habitacion', 'letra nombre') // Detalles básicos de la habitación física
    .populate('tipoHabitacion', 'nombre') // Nombre del tipo de habitación
    .populate('reservaEvento', 'nombreEvento fecha') // Evento asociado (si aplica)
    .populate('asignadoA', 'nombre apellidos email') // Admin asignado
    .sort({ fechaEntrada: -1 }); // Ordenar por fecha de entrada descendente

  const reservas = await query;

  res.status(200).json({
    success: true,
    count: reservas.length,
    data: reservas
  });
});

// @desc    Obtener una reserva de habitación por ID
// @route   GET /api/reservas/habitaciones/:id
// @access  Private/Admin
const getReservaHabitacionById = asyncHandler(async (req, res, next) => {
  // 1. Busca por ID sin poblar tipoHabitacion inicialmente
  const reserva = await ReservaHabitacion.findById(req.params.id);

  if (!reserva) {
    return next(new ErrorResponse(`Reserva no encontrada con ID ${req.params.id}`, 404));
  }

  // 2. Poblar otros campos necesarios (excepto tipoHabitacion)
  await reserva.populate([
    { path: 'habitacion', select: 'letra nombre' },
    { path: 'reservaEvento', select: 'nombreEvento fecha _id' },
    // { path: 'usuario', select: 'nombre email _id' }, // Descomentar si se necesita
    // { path: 'asignadoA', select: 'nombre apellidos email' } // Descomentar si se necesita
  ]);

  // 3. Manejar tipoHabitacion condicionalmente
  let tipoHabitacionData = null;
  if (reserva.tipoHabitacion) {
    if (mongoose.Types.ObjectId.isValid(reserva.tipoHabitacion)) {
      // Si es un ObjectId válido, popúlalo
      const tempReserva = await ReservaHabitacion.findById(reserva._id).populate({ path: 'tipoHabitacion', select: 'nombre _id' }).lean();
      if (tempReserva && tempReserva.tipoHabitacion) {
        tipoHabitacionData = tempReserva.tipoHabitacion; // Guarda el objeto poblado
      } else {
         // console.warn(`[getReservaHabitacionById ${req.params.id}] No se pudo poblar tipoHabitacion con ID: ${reserva.tipoHabitacion}`);
         // Opcional: Guardar el ID original como fallback si la población falla inesperadamente
         // tipoHabitacionData = { _id: reserva.tipoHabitacion, nombre: 'Error al poblar' }; 
      }
    } else if (typeof reserva.tipoHabitacion === 'string') {
      // Si es una cadena, busca por nombre
      // console.log(`[getReservaHabitacionById ${req.params.id}] tipoHabitacion es string: "${reserva.tipoHabitacion}". Buscando por nombre...`);
      tipoHabitacionData = await TipoHabitacion.findOne({ nombre: reserva.tipoHabitacion }).select('nombre _id').lean();
      if (!tipoHabitacionData) {
        // console.warn(`[getReservaHabitacionById ${req.params.id}] No se encontró TipoHabitacion con nombre: "${reserva.tipoHabitacion}"`);
        // Opcional: Guardar la cadena original como fallback
        // tipoHabitacionData = { _id: null, nombre: reserva.tipoHabitacion }; 
      }
    } else {
        // Caso inesperado: ni ObjectId ni string
        // console.warn(`[getReservaHabitacionById ${req.params.id}] tipoHabitacion tiene un tipo inesperado: ${typeof reserva.tipoHabitacion}, valor: ${reserva.tipoHabitacion}`);
        // tipoHabitacionData = { _id: null, nombre: 'Tipo inválido' };
    }
  }

  // 4. Convertir la reserva a un objeto plano
  const reservaObj = reserva.toObject();

  // 5. Asignar los datos de tipoHabitacion resueltos
  // Si tipoHabitacionData es null (porque no existía, no se encontró o hubo error),
  // el campo tipoHabitacion en reservaObj mantendrá su valor original (string o ObjectId inválido)
  // o será null si no existía. Si se encontró/pobló, se reemplaza con el objeto { _id, nombre }.
  if (tipoHabitacionData) {
      reservaObj.tipoHabitacion = tipoHabitacionData;
  } else if (reserva.tipoHabitacion) {
      // Si no se resolvió pero existía originalmente, puedes decidir qué enviar:
      // Opción A: Enviar el valor original (string/ID inválido)
       reservaObj.tipoHabitacion = reserva.tipoHabitacion; // Ya está así por toObject()
      // Opción B: Enviar un indicador de que no se resolvió
      // reservaObj.tipoHabitacion = { _id: null, nombre: `No resuelto (${reserva.tipoHabitacion})` };
      // Opción C: Enviar null explícitamente
      // reservaObj.tipoHabitacion = null;
      // console.log(`[getReservaHabitacionById ${req.params.id}] No se pudo resolver tipoHabitacion (${reserva.tipoHabitacion}), se enviará el valor original.`);
  } else {
       reservaObj.tipoHabitacion = null; // Asegurarse de que sea null si no existía
  }


  // LOG para depurar el objeto reserva ANTES de enviar  <<<<< ESTE SE QUEDA
  console.log(`[getReservaHabitacionById ${req.params.id}] Reserva procesada enviada:`, JSON.stringify(reservaObj, null, 2));

  // 6. Enviar el objeto modificado
  res.status(200).json({ success: true, data: reservaObj });
});

// @desc    Actualizar una reserva de habitación
// @route   PUT /api/reservas/habitaciones/:id
// @access  Private (Admin)
const updateReservaHabitacion = asyncHandler(async (req, res, next) => {
    const { numeroConfirmacion, ...updateData } = req.body;

    // --- Manejo de tipoHabitacion si viene como nombre ---
    if (updateData.tipoHabitacion && typeof updateData.tipoHabitacion === 'string' && !mongoose.Types.ObjectId.isValid(updateData.tipoHabitacion)) {
        const tipoHabDoc = await TipoHabitacion.findOne({ nombre: updateData.tipoHabitacion }).lean();
        if (!tipoHabDoc) {
            return next(new ErrorResponse(`Tipo de habitación inválido proporcionado para actualizar: ${updateData.tipoHabitacion}`, 400));
        }
        // Reemplazar el nombre con el ObjectId encontrado
        updateData.tipoHabitacion = tipoHabDoc._id;
        // console.log(`[updateReservaHabitacion ${req.params.id}] Se actualizó tipoHabitacion a ObjectId: ${updateData.tipoHabitacion}`); // Log para depuración
    }
    // -----------------------------------------------------

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
    // console.error('Error al comprobar disponibilidad:', error);
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
    // console.error('Error al obtener fechas ocupadas de habitaciones:', error);
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
    // console.error('Error al obtener todas las fechas ocupadas de habitaciones:', error);
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
    // console.error('Error al actualizar huéspedes de reserva:', error);
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
    // console.log(`Habitación ${habitacionId} asignada a admin ${adminId}`);

    // 3. Si la habitación está asociada a un evento, asignar también el evento
    if (habitacion.reservaEvento) {
      const ReservaEvento = require('../models/ReservaEvento'); // Asegurar modelo disponible
      const evento = await ReservaEvento.findById(habitacion.reservaEvento);
      if (evento && !evento.asignadoA) { // Solo asignar el evento si no tiene ya alguien
        evento.asignadoA = adminId;
        await evento.save();
        // console.log(`Evento ${habitacion.reservaEvento} asociado también asignado a admin ${adminId}`);
      } else if (evento && evento.asignadoA && evento.asignadoA.toString() !== adminId) {
        // console.warn(`La habitación ${habitacionId} pertenece al evento ${habitacion.reservaEvento} que ya está asignado a otro admin (${evento.asignadoA}). No se reasigna el evento.`);
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
    // console.error('Error asignando habitación a admin:', error);
    next(error); // Pasar el error al manejador de errores global
  }
});

// @desc    Comprobar disponibilidad de múltiples habitaciones en rangos de fechas individuales
// @route   POST /api/reservas/habitaciones/verificar-disponibilidad-rango
// @access  Public
const verificarDisponibilidadRango = asyncHandler(async (req, res, next) => {
  // El payload ahora es un array de objetos: [{ habitacionId, fechaInicio, fechaFin }, ...]
  const checkRequests = req.body;
  const reservaActualId = req.query.reservaActualId; // Obtener de query params si se envía

  // Validación de entrada: verificar que es un array y que cada objeto tiene los campos necesarios
  if (!Array.isArray(checkRequests) || checkRequests.length === 0) {
    return next(new ErrorResponse('Se requiere un array de solicitudes de verificación.', 400));
  }

  const validationError = checkRequests.find(req => 
    !req.habitacionId || !req.fechaInicio || !req.fechaFin
  );

  if (validationError) {
    return next(new ErrorResponse('Cada solicitud debe incluir habitacionId, fechaInicio y fechaFin.', 400));
  }

  try {
    const habitacionesConflictivas = [];
    let todasDisponibles = true;
    // console.log(`[Check Rango Debug] Iniciando verificación para ${checkRequests.length} solicitudes.`); // Log inicial

    // Iterar sobre cada solicitud de verificación individual
    for (const request of checkRequests) {
      const { habitacionId, fechaInicio, fechaFin } = request;
      // console.log(`[Check Rango Debug] Verificando Habitación: ${habitacionId}, Rango: ${fechaInicio} a ${fechaFin}`); // Log por solicitud

      const fechaInicioObj = new Date(fechaInicio);
      const fechaFinObj = new Date(fechaFin);

      if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
        // Podríamos devolver error 400 o marcar esta habitación como no disponible
        habitacionesConflictivas.push({ habitacionId, motivo: 'Fechas inválidas' });
        todasDisponibles = false;
        continue; // Pasar a la siguiente solicitud
      }
      if (fechaInicioObj >= fechaFinObj) {
        habitacionesConflictivas.push({ habitacionId, motivo: 'Fecha inicio debe ser anterior a fecha fin' });
        todasDisponibles = false;
        continue; 
      }

      // Construir la consulta base para buscar conflictos para ESTA habitación/rango
      const conflictQuery = {
        estadoReserva: { $in: ['pendiente', 'confirmada', 'pendiente_pago'] }, // Ajustar estados si es necesario
        fechaEntrada: { $lt: fechaFinObj }, 
        fechaSalida: { $gt: fechaInicioObj } 
      };

      // Excluir la reserva actual si se está editando
      if (reservaActualId) {
        conflictQuery._id = { $ne: new mongoose.Types.ObjectId(reservaActualId) };
      }

      // 1. Buscar conflicto en ReservaHabitacion
      const queryHabitacion = { 
        ...conflictQuery,
        habitacion: habitacionId 
      };
      const reservaHabitacionSolapada = await ReservaHabitacion.findOne(queryHabitacion).lean();
      // console.log(`[Check Rango Debug ${habitacionId}] Conflicto ReservaHabitacion encontrado:`, reservaHabitacionSolapada ? reservaHabitacionSolapada._id : 'Ninguno'); // Log resultado consulta

      if (reservaHabitacionSolapada) {
        todasDisponibles = false;
        if (!habitacionesConflictivas.some(h => h.habitacionId === habitacionId)) {
            habitacionesConflictivas.push({ habitacionId, motivo: 'Reserva Habitación' });
        }
        // console.log(`[Check Rango Debug ${habitacionId}] Conflicto detectado (ReservaHabitacion). Pasando a siguiente.`); // Log conflicto
        continue; 
      }

      // 2. Buscar conflicto en ReservaEvento
      const eventosSolapados = await ReservaEvento.find({
          fecha: { $gte: fechaInicioObj, $lt: fechaFinObj }, 
          estadoReserva: { $in: ['pendiente', 'confirmada'] } 
      }).select('fecha').lean(); 
      // console.log(`[Check Rango Debug ${habitacionId}] Eventos solapados encontrados: ${eventosSolapados.length}`); // Log resultado consulta eventos

      if (eventosSolapados.length > 0) {
          todasDisponibles = false;
          if (!habitacionesConflictivas.some(h => h.habitacionId === habitacionId)) {
              const fechasEvento = eventosSolapados.map(e => format(new Date(e.fecha), 'dd/MM/yyyy')).join(', ');
              habitacionesConflictivas.push({ habitacionId, motivo: `Evento(s) en fecha(s): ${fechasEvento}` });
          }
          // console.log(`[Check Rango Debug ${habitacionId}] Conflicto detectado (ReservaEvento).`); // Log conflicto evento
      }
    }

    // Responder basado en el resultado final
    // console.log(`[Check Rango Debug] Verificación completada. Todas disponibles: ${todasDisponibles}. Conflictos:`, habitacionesConflictivas); // Log final
    if (todasDisponibles) {
      res.status(200).json({
        success: true,
        disponibles: true,
        message: 'Todas las habitaciones y rangos solicitados están disponibles.'
      });
    } else {
      // Devolver un código 409 (Conflict)
      res.status(409).json({
        success: true, // La operación de verificación fue exitosa
        disponibles: false,
        message: `Conflicto de disponibilidad detectado.`, // Mensaje más genérico
        // Devolver detalles de qué habitaciones y por qué fallaron
        habitacionesConflictivas: habitacionesConflictivas 
      });
    }

  } catch (error) {
    // console.error('Error en verificarDisponibilidadRango:', error);
    if (error.name === 'CastError') {
      return next(new ErrorResponse('Uno o más IDs de habitación o el ID de reserva actual son inválidos', 400));
    }
    next(error); 
  }
});

/**
 * @desc    Obtener todos los rangos de fechas ocupadas globalmente (habitaciones y eventos)
 * @route   GET /api/reservas/habitaciones/fechas-ocupadas-global
 * @access  Public
 */
const getGlobalOccupiedDates = asyncHandler(async (req, res, next) => {
  try {
    // 1. Obtener fechas de Reservas de Eventos ACTIVAS
    const activeEventStates = ['confirmada', 'pagada', 'pendiente_pago']; // Estados que bloquean
    const eventos = await ReservaEvento.find({
      estadoReserva: { $in: activeEventStates } 
    }).select('fecha fechaFin nombreEvento'); // <--- CAMBIO: 'fecha' es fechaInicio para eventos, mantener fechaFin

    const eventDates = eventos.map(evento => {
      if (!evento.fecha) { 
          console.warn('[Backend getGlobalOccupiedDates] Evento sin fecha de inicio:', evento._id, evento.nombreEvento);
          return null;
      }
      
      // 'fecha' es el inicio del evento.
      const inicioEvento = new Date(evento.fecha);
      // Si fechaFin no existe o es inválida, el evento dura solo el día de 'fecha'
      // Asegurarse de que fechaFin, si existe, también se convierta a Date.
      const finEvento = evento.fechaFin && !isNaN(new Date(evento.fechaFin).getTime()) 
                        ? new Date(evento.fechaFin) 
                        : new Date(evento.fecha); // Si no hay fechaFin, el evento dura un día.

      return {
        inicio: inicioEvento.toISOString(), 
        fin: finEvento.toISOString(),     
        tipo: 'evento',
        // nombre: evento.nombreEvento // Para depurar, opcional
      };
    }).filter(Boolean); 

    // 2. Obtener fechas de Reservas de Habitaciones ACTIVAS
    const activeRoomStates = ['confirmada', 'pendiente_pago', 'check_in', 'pago_parcial', 'pendiente']; 
    const habitacionesReservadas = await ReservaHabitacion.find({
      estadoReserva: { $in: activeRoomStates }
    }).select('fechaEntrada fechaSalida tipoReserva'); // <--- Correcto: fechaEntrada, fechaSalida

    const roomDates = habitacionesReservadas.map(reserva => {
      if (!reserva.fechaEntrada || !reserva.fechaSalida) { 
          console.warn('[Backend getGlobalOccupiedDates] Reserva de habitación sin fechas completas:', reserva._id);
          return null;
      }
      return {
        inicio: new Date(reserva.fechaEntrada).toISOString(), 
        fin: new Date(reserva.fechaSalida).toISOString(),   
        tipo: reserva.tipoReserva === 'evento' ? 'habitacion-asociada-evento' : 'habitacion-individual'
      };
    }).filter(Boolean); 

    // 3. Combinar ambas listas de fechas
    const allOccupiedDates = [...eventDates, ...roomDates];

    // console.log(`[Backend getGlobalOccupiedDates] Enviando ${allOccupiedDates.length} rangos globales.`);
    // Descomenta la siguiente línea para ver en detalle los datos enviados:
    // console.log('[Backend getGlobalOccupiedDates] Datos Combinados:', JSON.stringify(allOccupiedDates, null, 2));

    res.status(200).json({
        success: true,
        count: allOccupiedDates.length,
        data: allOccupiedDates 
    });

  } catch (error) {
    console.error('[Backend getGlobalOccupiedDates] Error obteniendo fechas ocupadas globales:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor al obtener fechas ocupadas globales.', 
        error: error.message, 
        data: [] 
    });
  }
});

/**
 * @desc    Crear una Intención de Pago (PaymentIntent) con Stripe para una reserva de habitación
 * @route   POST /api/reservas/habitaciones/:id/create-payment-intent
 * @access  Private (Usuario que hizo la reserva o Admin)
 */
const createHabitacionPaymentIntent = asyncHandler(async (req, res, next) => {
  const reservaId = req.params.id;

  try {
    // Incluir populate para obtener datos del usuario si es necesario para Stripe customer
    const reserva = await ReservaHabitacion.findById(reservaId); //.populate('usuario', 'stripeCustomerId');

    if (!reserva) {
      return next(new ErrorResponse(`Reserva de habitación no encontrada con ID ${reservaId}`, 404));
    }

    // Opcional: Verificar permisos
    // ...

    if (!reserva.precio || reserva.precio <= 0) {
      return next(new ErrorResponse('El precio de la reserva no es válido', 400));
    }

    const amountInCents = Math.round(Number(reserva.precio) * 100);
    const currency = 'mxn'; // O la moneda que uses

    // Metadata para identificar la reserva en el webhook
    const metadata = { 
      reservaId: reserva._id.toString(),
      tipoReserva: 'habitacion' 
    };

    // Opcional: Si tienes un customer de Stripe asociado al usuario
    // const stripeCustomerId = reserva.usuario?.stripeCustomerId;
    // const customerParam = stripeCustomerId ? { customer: stripeCustomerId } : {};

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency,
      metadata: metadata,
      // ...customerParam, // Añadir si se usa customer
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`>>> [Stripe Habitación ${reservaId}] PaymentIntent ${paymentIntent.id} creado.`);

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
      reservaId: reserva._id 
    });

  } catch (error) {
    // console.error(`>>> [Stripe Habitación ${reservaId}] Error creando PaymentIntent:`, error);
    next(new ErrorResponse(error.message || 'Error al crear la intención de pago', 500));
  }
});

/**
 * @desc    Seleccionar método de pago para una reserva de HABITACIÓN y realizar acciones
 * @route   PUT /api/reservas/habitaciones/:id/seleccionar-pago
 * @access  Private (Usuario que hizo la reserva o Admin)
 */
const seleccionarMetodoPagoHabitacion = asyncHandler(async (req, res, next) => {
  const { metodoPago } = req.body;
  const reservaId = req.params.id;

  if (!metodoPago || !['transferencia', 'efectivo', 'tarjeta'].includes(metodoPago)) {
    return next(new ErrorResponse('Método de pago no válido', 400));
  }

  const reserva = await ReservaHabitacion.findById(reservaId);

  if (!reserva) {
    return next(new ErrorResponse(`Reserva de habitación no encontrada con ID ${reservaId}`, 404));
  }

  // Opcional: Verificar permisos
  // ...

  // Actualizar método de pago
  reserva.metodoPago = metodoPago;
  // Actualizar estado de pago/reserva si corresponde (ej. 'confirmada' para efectivo?)
  // if (metodoPago === 'efectivo') reserva.estadoReserva = 'confirmada';

  await reserva.save();
  // console.log(`>>> [Pago Habitación ${reservaId}] Método de pago actualizado a: ${metodoPago}`);

  // Realizar acciones post-selección
  try {
    const emailCliente = reserva.emailContacto;
    const nombreClienteCompleto = `${reserva.nombreContacto || 'Cliente'} ${reserva.apellidosContacto || ''}`.trim();

    if (emailCliente) {
      if (metodoPago === 'transferencia') {
        // console.log(`>>> [Pago Habitación ${reservaId}] Enviando instrucciones de transferencia a: ${emailCliente}`);
        await sendBankTransferInstructions({
          email: emailCliente,
          nombreCliente: nombreClienteCompleto,
          numeroConfirmacion: reserva.numeroConfirmacion, // Asegúrate que las reservas de habitación tengan numeroConfirmacion
          montoTotal: reserva.precio
        });
      } else if (metodoPago === 'efectivo') {
        // console.log(`>>> [Pago Habitación ${reservaId}] Enviando confirmación para pago en efectivo a: ${emailCliente}`);
        // Necesitarías una función enviarConfirmacionReservaHabitacion si no existe
        await enviarConfirmacionReservaHabitacion({
          email: emailCliente,
          nombreCliente: nombreClienteCompleto,
          tipoHabitacion: reserva.tipoHabitacion || 'Estándar',
          numeroConfirmacion: reserva.numeroConfirmacion,
          fechaEntrada: reserva.fechaEntrada.toLocaleDateString(),
          fechaSalida: reserva.fechaSalida.toLocaleDateString(),
          totalNoches: Math.round((reserva.fechaSalida - reserva.fechaEntrada) / (1000 * 60 * 60 * 24)) || 1,
          precio: reserva.precio,
          metodoPago: 'Efectivo (a pagar en recepción)'
        });
      } 
      // No hacemos nada aquí para 'tarjeta', eso se maneja al crear PaymentIntent y webhook
    } else {
      // console.warn(`>>> [Pago Habitación ${reservaId}] No se encontró email, no se envía notificación.`);
    }
  } catch(emailError) {
     // console.error(`>>> [Pago Habitación ${reservaId}] Error enviando email post-pago:`, emailError);
  }

  res.status(200).json({
    success: true,
    message: `Método de pago actualizado a ${metodoPago}.`,
    data: {
      _id: reserva._id,
      metodoPago: reserva.metodoPago,
      estadoReserva: reserva.estadoReserva
    }
  });
});

// --- CONTROLADOR PARA CREACIÓN MÚLTIPLE --- 
const createMultipleReservacionesHabitacion = async (req, res) => {
  const { reservas } = req.body; 
  // ¡Importante! Necesitamos obtener los datos de contacto del *body* de la petición,
  // ya que req.user podría no existir si la ruta es pública.
  // Asumimos que vienen en la raíz o dentro de cada objeto `reservaData`.
  // Si vienen en la raíz:
  // const { nombreContacto, apellidosContacto, emailContacto, telefonoContacto } = req.body;
  // Si vienen en CADA reserva, se extraerán dentro del bucle.

  // Si la ruta puede ser llamada por un usuario logueado, obtener su ID opcionalmente
  const userId = req.user ? req.user.id : null;

  if (!Array.isArray(reservas) || reservas.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'El cuerpo de la solicitud debe contener un array \'reservas\' no vacío.'
    });
  }

  const resultados = [];
  const errores = [];
  let primeraReservaCreada = null; // Para enviar un único email con datos representativos

  const session = await mongoose.startSession(); // Iniciar sesión para transacción

  try {
    await session.withTransaction(async () => {
      for (const reservaData of reservas) {
        try {
          // Validar datos básicos
          if (!reservaData.habitacionLetra || !reservaData.fechaEntrada || !reservaData.fechaSalida || reservaData.precioPorNoche === undefined || !reservaData.emailContacto) { // Asegurar emailContacto
            throw new Error('Faltan datos requeridos (habitacionLetra, fechas, precioPorNoche, emailContacto).');
          }

          // 1. Buscar la Habitación por letra
          const habitacionDoc = await Habitacion.findOne({ letra: reservaData.habitacionLetra }).session(session);
          if (!habitacionDoc) {
            throw new Error(`No se encontró una habitación con la letra ${reservaData.habitacionLetra}.`);
          }
          if (!habitacionDoc.tipoHabitacion) {
            throw new Error(`La habitación ${reservaData.habitacionLetra} no tiene un tipoHabitacion asociado.`);
          }

          // 2. Buscar el TipoHabitacion
          const tipoHabDoc = await TipoHabitacion.findById(habitacionDoc.tipoHabitacion).session(session);
          if (!tipoHabDoc || !tipoHabDoc.nombre) {
            throw new Error(`No se pudo encontrar el nombre del TipoHabitacion para ${reservaData.habitacionLetra}.`);
          }
          const tipoHabitacionNombre = tipoHabDoc.nombre;

          // 3. Calcular precio total
          const fechaEntradaObj = new Date(reservaData.fechaEntrada + 'T00:00:00Z');
          const fechaSalidaObj = new Date(reservaData.fechaSalida + 'T00:00:00Z');
          if (isNaN(fechaEntradaObj.getTime()) || isNaN(fechaSalidaObj.getTime()) || fechaEntradaObj >= fechaSalidaObj) {
            throw new Error('Fechas inválidas.');
          }
          const duracionEstancia = Math.ceil((fechaSalidaObj - fechaEntradaObj) / (1000 * 60 * 60 * 24));
          const precioTotal = Number(reservaData.precioPorNoche) * duracionEstancia;

          // --- Verificación de disponibilidad DENTRO de la transacción ---
          const reservaSolapada = await ReservaHabitacion.findOne({
            habitacion: habitacionDoc.letra, 
            estadoReserva: { $in: ['pendiente', 'confirmada', 'completada'] }, 
            fechaEntrada: { $lt: fechaSalidaObj }, 
            fechaSalida: { $gt: fechaEntradaObj }
          }).session(session); 

          if (reservaSolapada) {
            throw new Error(`La habitación ${habitacionDoc.letra} no está disponible para las fechas seleccionadas. Ya existe una reserva.`); 
          }
          // --- Fin Verificación ---
          
          // 4. Construir datos para ReservaHabitacion
          const nuevaReservaData = {
            habitacion: habitacionDoc.letra, // <-- ¿Guardar letra o ID? Modelo espera ID.
            tipoHabitacion: tipoHabitacionNombre, // <-- ¡ERROR! Modelo espera ID.
            fechaEntrada: fechaEntradaObj, 
            fechaSalida: fechaSalidaObj,   
            numHuespedes: reservaData.numHuespedes,
            precio: precioTotal,
            precioPorNoche: Number(reservaData.precioPorNoche),
            nombreContacto: reservaData.nombreContacto,
            apellidosContacto: reservaData.apellidosContacto,
            emailContacto: reservaData.emailContacto, // Tomado de reservaData
            telefonoContacto: reservaData.telefonoContacto,
            metodoPago: reservaData.metodoPago || 'pendiente',
            estadoReserva: reservaData.metodoPago === 'transferencia' ? 'pendiente_pago' : 'pendiente', // Estado inicial correcto
            estadoPago: 'pendiente',
            tipoReserva: reservaData.tipoReserva || 'hotel',
            // Asociar al usuario logueado si existe, si no, null
            usuario: userId, // Usar 'usuario' si ese es el campo en el modelo
            creadoPor: userId, // O 'creadoPor' si se usa ese campo
            numeroHabitaciones: reservaData.numeroHabitaciones || 1,
            letraHabitacion: habitacionDoc.letra, 
            infoHuespedes: reservaData.infoHuespedes || { nombres: [], detalles: '' },
            // Asegurar que se guardan los ObjectId correctos:
            habitacion: habitacionDoc._id, // <-- USAR ID
            tipoHabitacion: tipoHabDoc._id, // <-- USAR ID
          };

          // 5. Crear la ReservaHabitacion
          const [reservaCreada] = await ReservaHabitacion.create([nuevaReservaData], { session });
          
          if (!reservaCreada) {
            throw new Error('Error al guardar la reserva en la BD.');
          }

          resultados.push(reservaCreada);
          if (!primeraReservaCreada) {
            primeraReservaCreada = reservaCreada; // Guardar la primera para datos de email
          }

        } catch (error) {
          // console.error(`Error al crear reserva para habitación ${reservaData.habitacionLetra || 'desconocida'} dentro de la transacción:`, error.message);
          // Guardar el error específico de esta reserva
          errores.push({
            habitacionLetra: reservaData.habitacionLetra || 'desconocida',
            message: error.message,
          });
          // IMPORTANTE: No relanzar el error aquí para permitir que otras reservas del lote continúen
        }
      } // Fin del bucle for

      // Si no se pudo crear ninguna reserva, abortar transacción
      if (resultados.length === 0 && errores.length > 0) {
          // Lanzar un error general para que la transacción haga rollback
          throw new ErrorResponse('No se pudo crear ninguna de las reservas solicitadas.', 400); 
      }
      // Si se creó al menos una, la transacción será commit

    }); // Fin de session.withTransaction

    // --- 6. ENVÍO DE EMAILS DESPUÉS DE LA TRANSACCIÓN (si fue exitosa) ---
    if (primeraReservaCreada) {
      try {
        const clienteEmail = primeraReservaCreada.emailContacto; // Email de la primera reserva
        const nombreCliente = `${primeraReservaCreada.nombreContacto || 'Cliente'} ${primeraReservaCreada.apellidosContacto || ''}`.trim();
        const adminEmailsString = process.env.ADMIN_EMAIL;
        const adminEmailArray = adminEmailsString ? adminEmailsString.split(',').map(email => email.trim()).filter(email => email) : [];
        const metodoPagoSeleccionado = primeraReservaCreada.metodoPago;

        // 6a. Email al Cliente (Solo uno para todo el lote)
        if (clienteEmail) {
          if (metodoPagoSeleccionado === 'transferencia') {
            // console.log(`>>> [ReservaHabitación /batch] Enviando instrucciones de transferencia a: ${clienteEmail} para ${resultados.length} reservas.`);
            // Podríamos necesitar adaptar el email para reflejar múltiples habitaciones/confirmaciones
            // Por ahora, usamos la info de la primera como representativa.
            await sendBankTransferInstructions({
              email: clienteEmail,
              nombreCliente: nombreCliente,
              // Podríamos generar un número de confirmación de "lote" o usar el de la primera
              numeroConfirmacion: primeraReservaCreada.numeroConfirmacion, 
              montoTotal: resultados.reduce((sum, r) => sum + (r.precio || 0), 0) // Sumar precios de todas las reservas creadas
            });
          } else if (metodoPagoSeleccionado === 'efectivo') {
            // console.log(`>>> [ReservaHabitación /batch] Enviando confirmación (efectivo) a: ${clienteEmail} para ${resultados.length} reservas.`);
            // Adaptar la confirmación para indicar que es pago en efectivo
             await enviarConfirmacionReservaHabitacion({
                email: clienteEmail,
                nombreCliente: nombreCliente,
                // Adaptar descripción para múltiples habitaciones?
                tipoHabitacion: resultados.map(r => r.habitacion).join(', '), 
                numeroConfirmacion: primeraReservaCreada.numeroConfirmacion, // O un número de lote
                fechaEntrada: primeraReservaCreada.fechaEntrada.toLocaleDateString('es-ES'),
                fechaSalida: primeraReservaCreada.fechaSalida.toLocaleDateString('es-ES'),
                totalNoches: Math.round((primeraReservaCreada.fechaSalida - primeraReservaCreada.fechaEntrada) / (1000 * 60 * 60 * 24)) || 1,
                precio: resultados.reduce((sum, r) => sum + (r.precio || 0), 0),
                metodoPago: 'Efectivo (a pagar en recepción)'
            });
          }
          // No se envía nada para 'tarjeta' aquí, se maneja por webhook
        } else {
          // console.warn(`[Email Send /batch] No se pudo determinar el email del cliente para el lote.`);
        }

        // 6b. Email al Admin (Solo uno para todo el lote)
        if (adminEmailArray.length > 0) {
            const detallesLote = resultados.map(r => (
              `Hab. ${r.habitacion} (${r.tipoHabitacion}): ${r.fechaEntrada.toLocaleDateString('es-ES')} - ${r.fechaSalida.toLocaleDateString('es-ES')} ($${r.precio})`
            )).join('\n');
            
            const htmlAdmin = notificacionGestionAdmin({
                accion: "Nuevas Reservas (Lote)",
                tipoReserva: `Habitaciones (${primeraReservaCreada.tipoReserva || 'hotel'})`,
                // Usar confirmación de la primera o un identificador de lote
                numeroConfirmacion: primeraReservaCreada.numeroConfirmacion, 
                nombreCliente: nombreCliente,
                emailCliente: clienteEmail || 'No disponible',
                detallesAdicionales: {
                  telefono: primeraReservaCreada.telefonoContacto || 'No disponible',
                  // Detalle de todas las habitaciones en el lote
                  habitacion: `Lote: \n${detallesLote}`,
                  // Fechas de la primera como referencia
                  fechas: `${primeraReservaCreada.fechaEntrada.toLocaleDateString('es-ES')} - ${primeraReservaCreada.fechaSalida.toLocaleDateString('es-ES')}`,
                  // Precio total del lote
                  precio: `${resultados.reduce((sum, r) => sum + (r.precio || 0), 0)} MXN`, 
                  metodoPago: metodoPagoSeleccionado.charAt(0).toUpperCase() + metodoPagoSeleccionado.slice(1),
                  // Estado de la primera como referencia
                  estado: primeraReservaCreada.estadoReserva || 'pendiente',
                  notas: primeraReservaCreada.infoHuespedes?.detalles || 'Ninguna' 
                },
                // Enlace a la página general de reservas de admin?
                urlGestionReserva: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reservaciones`
            });
            // console.log(`>>> [ReservaHabitación /batch] Enviando notificación de lote a admin: ${adminEmailArray.join(', ')}`);
            await sendEmail({
                email: adminEmailArray,
                subject: `Nuevas Reservas Habitación (Lote) - Cliente: ${nombreCliente}`,
                html: htmlAdmin
            });
        } else {
            // console.warn(`[Email Send /batch] ADMIN_EMAIL no configurado. No se envió notificación de lote.`);
        }

      } catch (emailError) {
          // console.error(`[Email Send /batch] Error enviando emails DESPUÉS de procesar lote:`, emailError);
          // No relanzar el error, la reserva ya se creó
      }
    } // Fin if (primeraReservaCreada)
    // --- FIN ENVÍO DE EMAILS ---

    // Respuesta final
    if (resultados.length > 0) {
      res.status(201).json({
        success: true,
        message: `Se crearon ${resultados.length} de ${reservas.length} reservas exitosamente.`,
        data: resultados,
        errors: errores.length > 0 ? errores : undefined
      });
    } else {
      // Si llegamos aquí, significa que la transacción falló o no se creó nada
      res.status(400).json({ 
        success: false,
        message: 'No se pudo crear ninguna reserva.',
        errors: errores // Devolver los errores individuales
      });
    }

  } catch (error) {
    // Error durante la transacción o fuera del bucle
    // console.error('Error general durante la creación múltiple de reservas:', error);
    await session.abortTransaction(); // Asegurar aborto si no se hizo ya
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error al procesar el lote de reservas.',
      errors: errores.length > 0 ? errores : undefined // Incluir errores si los hubo
    });
  } finally {
    await session.endSession();
  }
};

/**
 * @desc    Actualizar el estado de una reserva de habitación
 * @route   PATCH /api/reservas/habitaciones/:id/estado
 * @access  Private (Admin/Staff)
 */
const updateReservaHabitacionEstado = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { estado } = req.body;

  // 1. Validar el estado recibido
  const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada']; // Ajustar si hay otros estados
  if (!estado || !estadosValidos.includes(estado.toLowerCase())) {
    return next(new ErrorResponse(`Estado inválido: ${estado}. Estados permitidos: ${estadosValidos.join(', ')}`, 400));
  }

  // 2. Buscar y actualizar la reserva de habitación
  const reservaHabitacionActualizada = await ReservaHabitacion.findByIdAndUpdate(
    id,
    { estadoReserva: estado.toLowerCase() },
    {
      new: true, // Devolver el documento actualizado
      runValidators: true // Ejecutar validadores del schema
    }
  );

  // 3. Verificar si se encontró y actualizó
  if (!reservaHabitacionActualizada) {
    return next(new ErrorResponse(`Reserva de habitación no encontrada con ID ${id}`, 404));
  }

  // 4. Enviar respuesta exitosa
  res.status(200).json({
    success: true,
    message: `Estado de la reserva de habitación actualizado a ${estado.toLowerCase()}`,
    data: reservaHabitacionActualizada
  });
});

// @desc    Obtener las reservas de habitación de un usuario específico
// @route   GET /api/reservas/habitaciones/usuario
// @access  Private
const getReservasHabitacionUsuario = asyncHandler(async (req, res, next) => {
  // Asegurarse de que el usuario está autenticado (protectRoute ya lo hizo)
  if (!req.user) {
    return next(new ErrorResponse('No autorizado', 401));
  }

  try {
    const userId = req.user.id;
    const reservas = await ReservaHabitacion.find({ usuario: userId })
      // Poblar los campos que sean útiles para mostrar al usuario
      .populate({ path: 'habitacion', select: 'letra nombre tipo' }) 
      .sort({ fechaEntrada: -1 }); // Ordenar por fecha de entrada

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas
    });

  } catch (error) {
    // console.error('Error al obtener las reservas de habitación del usuario:', error);
    next(new ErrorResponse('Error del servidor al obtener tus reservas', 500));
  }
});

// @desc    Cancelar una reserva de habitación para un usuario
// @route   DELETE /api/reservas/habitaciones/:id/cancelar
// @access  Private
const cancelarReservaHabitacionUsuario = asyncHandler(async (req, res, next) => {
  const reservaId = req.params.id;

  if (!req.user) {
    return next(new ErrorResponse('No autorizado', 401));
  }

  try {
    const userId = req.user.id;
    const reserva = await ReservaHabitacion.findOne({ _id: reservaId, usuario: userId });

    if (!reserva) {
      return next(new ErrorResponse(`Reserva no encontrada con ID ${reservaId} para el usuario`, 404));
    }

    // Actualizar el estado de la reserva a 'cancelada'
    reserva.estadoReserva = 'cancelada';
    await reserva.save();

    res.status(200).json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      data: reserva
    });

  } catch (error) {
    // console.error('Error al cancelar la reserva:', error);
    next(new ErrorResponse(error.message || 'Error al cancelar la reserva', 500));
  }
});

/**
 * @desc    Obtener todos los rangos de fechas ocupadas por habitaciones (PÚBLICO)
 * @route   GET /api/public/reservas/fechas-ocupadas-habitaciones
 * @access  Public
 */
const getPublicOccupiedRoomDates = asyncHandler(async (req, res, next) => {
  // Estados considerados activos para bloquear fechas públicamente
  const activeStates = ['confirmada', 'pendiente_pago', 'check_in', 'pago_parcial']; 

  const reservas = await ReservaHabitacion.find({
    estadoReserva: { $in: activeStates }
  }).select('fechaEntrada fechaSalida'); // Seleccionar solo las fechas

  const dateRanges = reservas.map(reserva => ({
    inicio: reserva.fechaEntrada,
    fin: reserva.fechaSalida
  }));

  // console.log("[Backend] Fechas Ocupadas (Habitaciones Públicas):", dateRanges); // <-- LOG AÑADIDO
  res.status(200).json(dateRanges); // Devolver directamente el array de rangos
});

// *** NUEVO Controlador: Obtener rangos de fechas ocupadas para UNA habitación específica ***
const getOccupiedDatesForRoomById = asyncHandler(async (req, res, next) => {
  const { habitacionId } = req.params; // Esto es la LETRA de la habitación, ej: "G"
  
  // console.log(`[DEBUG] getOccupiedDatesForRoomById llamado con habitacionLetra: ${habitacionId}`);
  
  if (!habitacionId) {
    return next(new ErrorResponse('Se requiere la letra de la habitación', 400));
  }

  // Estados considerados activos para bloquear fechas
  const activeStates = ['confirmada', 'pendiente_pago', 'check_in', 'pago_parcial', 'pendiente']; // <-- AÑADIDO 'pendiente'
  // console.log('[DEBUG] Buscando reservas con estados:', activeStates);
  
  let reservas = [];
  try {
    // 1. Encontrar la habitación por su letra para obtener su ObjectId
    const habitacionDoc = await Habitacion.findOne({ letra: habitacionId }).select('_id').lean(); // Añadido .lean() para objeto plano
    
    // LOG 1: Verificar si se encontró la habitación...
    if (!habitacionDoc) {
      // ...
      return res.status(200).json([]); 
    }
    console.log(`%c[BACKEND DETAIL] Habitación encontrada para letra '${habitacionId}': ObjectId STR = ${habitacionDoc._id.toString()}`, 'color: green; font-weight: bold;');
    
    const habitacionObjectIdForQuery = new mongoose.Types.ObjectId(habitacionDoc._id.toString());
    console.log(`%c[BACKEND DETAIL] habitacionObjectIdForQuery (tipo: ${typeof habitacionObjectIdForQuery}, valor: ${habitacionObjectIdForQuery.toString()})`, 'color: purple; font-weight: bold;');

    // ***** INICIO PRUEBA DE LECTURA DIRECTA POR _ID ***** <--- DEBE ESTAR AQUÍ
    if (habitacionId === 'G') { 
      const specificReservaId = '67f8f790b6c8b32832a9bc4f';
      try {
        const testReserva = await ReservaHabitacion.findById(specificReservaId);
        console.log(
          `%c[BACKEND DEBUG TEST BY ID] Reserva '${specificReservaId}' (Esperada para G en Abril):`,
          'color: orange; font-weight: bold;',
          testReserva ? JSON.parse(JSON.stringify(testReserva)) : null
        );
        if (testReserva) {
            console.log(`%c[BACKEND DEBUG TEST BY ID] Estado de la reserva de Abril (G): ${testReserva.estadoReserva}, ID Habitación en reserva: ${testReserva.habitacion.toString()}`, 'color: orange; font-weight: bold;');
        } else {
            console.log(`%c[BACKEND DEBUG TEST BY ID] La reserva con ID '${specificReservaId}' NO FUE ENCONTRADA.`, 'color: red; font-weight: bold;');
        }
      } catch (err) {
        console.error(`%c[BACKEND DEBUG TEST BY ID] Error buscando reserva '${specificReservaId}':`, 'color: red; font-weight: bold;', err);
      }
    }
    // ***** FIN PRUEBA DE LECTURA DIRECTA POR _ID *****

    const rawReservas = await ReservaHabitacion.find({ // <--- LA CONSULTA PROBLEMÁTICA
      habitacion: habitacionObjectIdForQuery, 
      estadoReserva: { $in: activeStates }
    });

    console.log(`%c[BACKEND DETAIL] RAW Reservas encontradas para ObjectId '${habitacionObjectIdForQuery.toString()}' (${rawReservas.length}):`, 'color: green; font-weight: bold;', JSON.parse(JSON.stringify(rawReservas)));

    // Mapear a partir de rawReservas...
    const dateRanges = rawReservas.map(reserva => ({
      inicio: reserva.fechaEntrada,
      fin: reserva.fechaSalida
      // tipo: 'habitacion' // El frontend ya añade esto si es necesario
    }));

    // LOG DETALLADO ANTES DE ENVIAR RESPUESTA...
    console.log(`%c[BACKEND RESPONSE] Endpoint: /api/reservas/habitaciones/${habitacionId}/fechas-ocupadas`, 'color: blue; font-weight: bold;');
    console.log(`%c[BACKEND RESPONSE] Enviando ${dateRanges.length} rangos:`, 'color: blue;', JSON.parse(JSON.stringify(dateRanges)));

    res.status(200).json(dateRanges); // Devolver directamente el array de rangos
  } catch (error) {
    // console.error('[ERROR] Error al buscar reservas de habitación:', error);
    // Considerar enviar un error 500 si la consulta a la BD falla
    return next(new ErrorResponse('Error interno del servidor al buscar fechas ocupadas.', 500));
  }
});

// @desc    Obtener todas las reservas de habitación (con filtros opcionales para admin)
// @route   GET /api/reservas/habitaciones
// @access  Private (Admin/Recepcionista)
const getReservaHabitaciones = asyncHandler(async (req, res, next) => {
  // El middleware advancedResults ya maneja el filtrado, paginación y selección.
  // Solo necesitamos asegurarnos de que la población se aplique.
  
  // res.advancedResults contiene los datos procesados por el middleware.
  // Si el middleware advancedResults NO está configurado para poblar 'habitacion',
  // necesitaríamos hacerlo aquí o ajustar la configuración del middleware.
  
  // Asumiendo que advancedResults SÍ puede manejar la población,
  // la llamada debería configurarse en la RUTA (routes/reservaHabitacion.routes.js)
  // con algo como: advancedResults(ReservaHabitacion, 'habitacion cliente')
  // Si la población falla o no está configurada, la propiedad 'habitacion' 
  // en las reservas devueltas será solo un ObjectId.
  
  // ¡Vamos a añadir la población explícitamente aquí por si acaso!
  // Primero, obtenemos la query base (antes de ejecutarla)
  let query = ReservaHabitacion.find(res.advancedResults.query); 

  // Aplicar población explícita
  query = query.populate('habitacion', 'letra nombre tipo capacidad'); // Poblar los detalles de la habitación <-- MODIFICADO: Añadido populate y selección de campos
  query = query.populate('tipoHabitacion', 'nombre'); // <-- AÑADIR ESTA LÍNEA
  query = query.populate('usuario', 'nombre email'); // Poblar datos del usuario si es necesario
  query = query.populate('reservaEvento', 'nombreEvento tipoEvento'); // Poblar datos del evento si es necesario
  
  // Aplicar select (si no lo hace advancedResults)
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  } else {
     query = query.select('-__v'); // Excluir __v por defecto
  }
  
  // Aplicar sort (si no lo hace advancedResults)
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // Ordenar por fecha de creación descendente por defecto
  }

  // Ejecutar la query CON población
  const reservas = await query;

  // Sobrescribir los datos en res.advancedResults con los datos poblados
  // para mantener la estructura de respuesta esperada por el frontend
  res.advancedResults.data = reservas;
  // (Asegúrate que la cuenta total y paginación sigan siendo correctas si las usas)

  res.status(200).json(res.advancedResults);
});

// Exportaciones finales (asegurando que todas las usadas estén aquí)
module.exports = {
  createReservaHabitacion,
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
  createHabitacionPaymentIntent,
  seleccionarMetodoPagoHabitacion,
  createMultipleReservacionesHabitacion,
  updateReservaHabitacionEstado,
  getAllReservasHabitacion,
  getReservasHabitacionUsuario,
  cancelarReservaHabitacionUsuario,
  getPublicOccupiedRoomDates,
  getOccupiedDatesForRoomById,
  getReservaHabitaciones
}; 