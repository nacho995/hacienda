const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const ReservaEvento = require('../models/ReservaEvento');
const User = require('../models/User');
const TipoEvento = require('../models/TipoEvento');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const Habitacion = require('../models/Habitacion');
const Servicio = require('../models/Servicio');
const { sendEmail, enviarConfirmacionReservaEvento, sendBankTransferInstructions } = require('../utils/email');
const confirmacionTemplate = require('../emails/confirmacionReserva');
const confirmacionAdminTemplate = require('../emails/confirmacionAdmin');
const notificacionGestionAdmin = require('../emails/notificacionGestionAdmin');
const generarNumeroConfirmacion = require('../utils/confirmNumGen');
const TipoHabitacion = require('../models/TipoHabitacion');
// Posiblemente otros modelos/utils como Usuario, Servicio si los usas en otros controladores aquí...

// Controlador para obtener todas las reservas de evento
const getAllReservasEvento = asyncHandler(async (req, res, next) => {
  try {
    // Calcular la fecha de hace una semana
    const hoy = new Date();
    const fechaHaceUnaSemana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 7);
    // Ajustar a medianoche para incluir eventos de todo el día
    fechaHaceUnaSemana.setHours(0, 0, 0, 0);

    const reservas = await ReservaEvento.find({
        fecha: { $gte: fechaHaceUnaSemana } // <<< AÑADIDO: Filtrar eventos desde hace una semana
    })
      .populate('usuario', 'nombre email') // Opcional: poblar usuario creador si aplica
      .populate('tipoEvento', 'titulo nombre precioBase') // Poblar detalles del tipo de evento
      .populate({
          path: 'serviciosContratados.servicio', // Poblar el campo 'servicio' dentro del array
          model: 'Servicio', // Especificar el modelo
          select: 'nombre precio _id' // Seleccionar los campos necesarios del servicio
      })
      .populate('asignadoA', 'nombre apellidos email') // Opcional: poblar admin asignado
      .populate({ // <<< AÑADIDO: Poblar detalles de las reservas de habitación vinculadas >>>
          path: 'serviciosAdicionales.habitaciones.reservaHabitacionId',
          model: 'ReservaHabitacion',
          select: 'letraHabitacion tipoHabitacion fechaEntrada fechaSalida precio estadoReserva _id' // Campos necesarios para la tabla
      })
      .sort({ fecha: -1 }); // Ordenar por fecha de evento descendente

    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error) {
    // console.error('Error al obtener todas las reservas de evento:', error);
    next(new ErrorResponse('Error del servidor al obtener las reservas de evento', 500));
  }
});

// ... otros controladores ...

/**
 * @desc    Crear una reserva de evento
 * @route   POST /api/reservas/eventos
 * @access  Public (o según middleware)
 */
const createEvento = asyncHandler(async (req, res, next) => { // Renombrado de createReservaEvento
  const session = await mongoose.startSession();
  let reservaCreada;
  const habitacionesCreadas = [];

  try {
    await session.withTransaction(async () => {
      const {
        tipo_evento,
        fecha,
        fechaFin,
        nombre_contacto,
        apellidos_contacto,
        email_contacto,
        telefono_contacto,
        mensaje,
        habitaciones,
        modo_gestion_habitaciones,
        modo_gestion_servicios,
        serviciosContratados,
        _serviciosCompletosParaPrecio,
        numInvitados
      } = req.body;

      if (!tipo_evento || !fecha || !nombre_contacto || !email_contacto || !telefono_contacto) {
        throw new ErrorResponse('Por favor, proporcione todos los campos obligatorios', 400);
      }
      const tipoEventoDoc = await TipoEvento.findOne({ titulo: { $regex: new RegExp(tipo_evento, 'i') } }).session(session);
      if (!tipoEventoDoc) {
        throw new ErrorResponse('Tipo de evento no válido', 400);
      }
      const fechaEvento = new Date(fecha);
      if (isNaN(fechaEvento.getTime())) {
        throw new ErrorResponse('Fecha no válida', 400);
      }
      const fechaInicioDia = new Date(new Date(fechaEvento).setHours(0, 0, 0, 0)); // Usar copia
      const fechaFinDia = new Date(new Date(fechaEvento).setHours(23, 59, 59, 999)); // Usar copia

      const eventoSolapado = await ReservaEvento.findOne({
        fecha: { $gte: fechaInicioDia, $lt: fechaFinDia },
        estadoReserva: { $ne: 'cancelada' }
      }).session(session);
      if (eventoSolapado) {
        throw new ErrorResponse('La fecha seleccionada ya no está disponible para eventos', 409);
      }

      const precioBaseEvento = Number(tipoEventoDoc.precioBase) || 0;
      let precioServicios = 0;
      if (Array.isArray(_serviciosCompletosParaPrecio)) {
        precioServicios = _serviciosCompletosParaPrecio.reduce((sum, servicio) => (sum + (Number(servicio?.precio) || 0)), 0);
      }
      const precioTotalCalculado = precioBaseEvento + precioServicios;
      const totalHabitaciones = (modo_gestion_habitaciones === 'hacienda') ? 14 : (habitaciones?.length || 0);

      const serviciosFormateados = Array.isArray(serviciosContratados)
        ? serviciosContratados.map(item => ({ servicio: item.id || item._id, cantidad: item.cantidad || 1 }))
        : [];

      const reservaData = {
        ...(req.user && req.user.id ? { usuario: req.user.id } : {}),
        tipoEvento: tipoEventoDoc._id,
        nombreEvento: tipoEventoDoc.nombre || tipoEventoDoc.titulo || 'Evento sin nombre',
        nombreContacto: nombre_contacto,
        apellidosContacto: apellidos_contacto,
        emailContacto: email_contacto,
        telefonoContacto: telefono_contacto,
        fecha: fechaEvento,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        horaInicio: '12:00', horaFin: '18:00', espacioSeleccionado: 'jardin',
        numInvitados: numInvitados || 50, precio: precioTotalCalculado, peticionesEspeciales: mensaje || '',
        estadoReserva: 'pendiente', metodoPago: 'pendiente',
        modoGestionHabitaciones: modo_gestion_habitaciones || 'usuario',
        modoGestionServicios: modo_gestion_servicios || 'usuario',
        totalHabitaciones, serviciosContratados: serviciosFormateados,
        numeroConfirmacion: generarNumeroConfirmacion(), fechaHoraCreacion: new Date(),
      };

      const [reservaEventoCreada] = await ReservaEvento.create([reservaData], { session });
      if (!reservaEventoCreada) throw new ErrorResponse('No se pudo crear la reserva del evento', 500);
      reservaCreada = reservaEventoCreada;

      let referenciasHabitaciones = [];
      if (modo_gestion_habitaciones === 'hacienda') {
        const habitacionesEstandar = await Habitacion.find({ estado: 'Disponible' }).limit(14).select('letra tipoHabitacion capacidad precioPorNoche _id').session(session);
        if (habitacionesEstandar.length < 14) console.warn(`[Transacción] Se esperaban 14 hab, se encontraron ${habitacionesEstandar.length}`);
        
        for (const habInfo of habitacionesEstandar) {
          const letraHab = habInfo?.letra;
          if (!habInfo || !habInfo._id) { 
            console.error('[Transacción][HaciendaMode] habInfo inválido o sin _id:', habInfo);
            throw new ErrorResponse('Error interno procesando habitaciones estándar.', 500);
          }
          const habitacionId = habInfo._id;

          // --- INICIO MODIFICACIÓN PROPUESTA ---
          // El campo 'habInfo.tipoHabitacion' ya debería ser el ObjectId de TipoHabitacion
          const tipoHabitacionRefId = habInfo?.tipoHabitacion;

          if (!tipoHabitacionRefId || !mongoose.Types.ObjectId.isValid(tipoHabitacionRefId)) {
            console.error(`[Backend CreateEvento] La habitación física con letra '${letraHab}' (ID: ${habitacionId}) no tiene un campo 'tipoHabitacion' válido o es un ObjectId inválido. Valor: ${tipoHabitacionRefId}`);
            throw new ErrorResponse(`La habitación física '${letraHab}' no tiene una referencia válida a TipoHabitacion. No se puede crear la reserva de habitación.`, 400);
          }
          // --- FIN MODIFICACIÓN PROPUESTA ---

          const entrada = new Date(fechaEvento); const salida = new Date(entrada); salida.setDate(entrada.getDate() + 1);
          const reservaHabitacionData = {
            tipoReserva: 'evento',
            reservaEvento: reservaCreada._id,
            habitacion: habitacionId, 
            letraHabitacion: letraHab || null, 
            tipoHabitacion: tipoHabitacionRefId, // <<< USAR ObjectId DEL TipoHabitacion ENCONTRADO
            categoriaHabitacion: (habInfo?.capacidad <= 2) ? 'sencilla' : 'doble',
            precio: habInfo?.precioPorNoche || 0,
            numHuespedes: habInfo?.capacidad || 2,
            fechaEntrada: entrada,
            fechaSalida: salida,
            estadoReserva: 'pendiente',
            nombreContacto: nombre_contacto,
            apellidosContacto: apellidos_contacto,
            emailContacto: email_contacto,
            telefonoContacto: telefono_contacto,
            fecha: fechaEvento,
          };
          const [habCreada] = await ReservaHabitacion.create([reservaHabitacionData], { session });
          if (!habCreada) throw new ErrorResponse(`Error al crear habitación estándar ${letraHab || habitacionId}`, 500);
          habitacionesCreadas.push(habCreada);
          referenciasHabitaciones.push({ reservaHabitacionId: habCreada._id, tipo: habCreada.tipoHabitacion || 'Estándar', noches: 1, precio: habCreada.precio || 0 });
        }
      } else if (Array.isArray(habitaciones)) { // Modo Usuario/Organizador
          for (const hab of habitaciones) {
            let entrada, salida;
            if (hab.fechaEntrada) { entrada = new Date(hab.fechaEntrada); salida = new Date(entrada); salida.setDate(entrada.getDate() + (hab.noches || 1)); } 
            else { entrada = new Date(fechaEvento); salida = new Date(entrada); salida.setDate(entrada.getDate() + 1); }

            if (!hab.letra) throw new ErrorResponse(`Falta letra para habitación en la solicitud: ${JSON.stringify(hab)}`, 400);

            // <<< BUSCAR LA HABITACIÓN POR LETRA PARA OBTENER SU ObjectId >>>
            const habitacionReal = await Habitacion.findOne({ letra: hab.letra }).select('_id tipo capacidad precioPorNoche').session(session);
            if (!habitacionReal) {
                throw new ErrorResponse(`La habitación con letra '${hab.letra}' no fue encontrada. Verifique que la letra sea correcta y la habitación exista.`, 404);
            }
            const habitacionId = habitacionReal._id; // <-- El ObjectId correcto
            // <<< FIN BÚSQUEDA >>>

            const reservaHabitacionData = {
              tipoReserva: 'evento',
              reservaEvento: reservaCreada._id,
              habitacion: habitacionId, // <<< USAR ObjectId encontrado >>>
              letraHabitacion: hab.letra, // Guardar la letra también puede ser útil
              // Usar datos de la habitación real si los datos del request (hab) no son fiables o están incompletos
              tipoHabitacion: habitacionReal.tipo || hab.tipoHabitacion?.nombre || hab.tipoHabitacion || 'Estándar',
              categoriaHabitacion: (habitacionReal.capacidad <= 2) ? 'sencilla' : 'doble', 
              precio: habitacionReal.precioPorNoche || hab.precioPorNoche || hab.precio || 0,
              numHuespedes: habitacionReal.capacidad || hab.capacidad || 2, 
              fechaEntrada: entrada, 
              fechaSalida: salida, 
              estadoReserva: 'pendiente',
              nombreContacto: nombre_contacto, 
              apellidosContacto: apellidos_contacto, 
              emailContacto: email_contacto,
              telefonoContacto: telefono_contacto, 
              fecha: fechaEvento,
            };
            const [habCreada] = await ReservaHabitacion.create([reservaHabitacionData], { session });
            if (!habCreada) throw new ErrorResponse(`Error al crear habitación ${hab.letra}`, 500);
            habitacionesCreadas.push(habCreada);
            referenciasHabitaciones.push({ reservaHabitacionId: habCreada._id, tipo: habCreada.tipoHabitacion || 'Estándar', noches: hab.noches || 1, precio: habCreada.precio || 0 });
          }
      }
      
      if (referenciasHabitaciones.length > 0) {
        // console.log(`[Transacción] Actualizando evento ${reservaCreada._id} con ${referenciasHabitaciones.length} refs.`);
        if (!reservaCreada.serviciosAdicionales) reservaCreada.serviciosAdicionales = { habitaciones: [], masajes: [] };
        reservaCreada.serviciosAdicionales.habitaciones = referenciasHabitaciones;
        await reservaCreada.save({ session });
      }
    });

    // Operaciones Post-Transacción
    await reservaCreada.populate([
      { path: 'tipoEvento' },
      { path: 'serviciosContratados.servicio', model: 'Servicio' },
      { 
        path: 'serviciosAdicionales.habitaciones.reservaHabitacionId',
        model: 'ReservaHabitacion',
        select: 'habitacion tipoHabitacion fechaEntrada fechaSalida precio estadoReserva'
      }
    ]);

    res.status(201).json({ success: true, data: reservaCreada });

    // Enviar correos después de confirmar la transacción
    try {
        const emailHtmlCliente = confirmacionTemplate({
            nombre: reservaCreada.nombreContacto,
            tipo: reservaCreada.tipoEvento?.nombre || reservaCreada.nombreEvento,
            fecha: new Date(reservaCreada.fecha).toLocaleDateString('es-ES'),
            numeroConfirmacion: reservaCreada.numeroConfirmacion
        });
        await sendEmail({
            to: reservaCreada.emailContacto,
            subject: 'Confirmación de Reserva - Hacienda Los Conejos',
            html: emailHtmlCliente
        });

        const emailHtmlAdmin = confirmacionAdminTemplate({
            nombre: reservaCreada.nombreContacto,
            email: reservaCreada.emailContacto,
            telefono: reservaCreada.telefonoContacto,
            tipo: reservaCreada.tipoEvento?.nombre || reservaCreada.nombreEvento,
            fecha: new Date(reservaCreada.fecha).toLocaleDateString('es-ES'),
            numeroConfirmacion: reservaCreada.numeroConfirmacion
        });
        await sendEmail({
            to: process.env.ADMIN_EMAIL, // Asegúrate que esta variable de entorno exista
            subject: `Nueva Reserva de Evento (#${reservaCreada.numeroConfirmacion}) - ${reservaCreada.nombreContacto}`,
            html: emailHtmlAdmin
        });
    } catch (emailError) {
        // console.error("Error enviando correos post-transacción:", emailError);
        // No lanzar error aquí para no afectar la respuesta al cliente, solo loggear
    }

  } catch (error) {
    // console.error('Error en createReservaEvento:', error);
    // Si el error viene de la transacción, session.abortTransaction() ya fue llamado (o debería serlo)
    if (session.inTransaction()) {
        await session.abortTransaction();
        // console.log("Transacción abortada debido a error.");
    }
    // Asegurarse de pasar el error al manejador de errores global
    next(error instanceof ErrorResponse ? error : new ErrorResponse(`Error creando reserva: ${error.message}`, 500));
  } finally {
    session.endSession();
    // console.log("Sesión de MongoDB cerrada.");
  }
});

/**
 * @desc    Obtener una reserva de evento por ID
 * @route   GET /api/reservas/eventos/:id
 * @access  Private/Admin
 */
const getEventoById = asyncHandler(async (req, res, next) => { // Renombrado de obtenerReservaEvento
  const reserva = await ReservaEvento.findById(req.params.id)
    .populate('tipoEvento')
    .populate('serviciosContratados.servicio')
    .populate({ 
        path: 'serviciosAdicionales.habitaciones.reservaHabitacionId', 
        model: 'ReservaHabitacion', 
        select: 'tipoHabitacion fechaEntrada fechaSalida precio estadoReserva letraHabitacion _id'
    })
    .populate('usuario', 'nombre email')
    .populate('asignadoA', 'nombre apellidos email');

  if (!reserva) {
    return next(new ErrorResponse(`Reserva de evento no encontrada con id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: reserva });
});

/**
 * @desc    Actualizar una reserva de evento (ADMIN)
 * @route   PUT /api/reservas/eventos/:id
 * @access  Private/Admin
 */
const updateEvento = asyncHandler(async (req, res, next) => { // Renombrado de actualizarReservaEvento
  let reserva = await ReservaEvento.findById(req.params.id);

  if (!reserva) {
    return next(new ErrorResponse(`Reserva de evento no encontrada con id ${req.params.id}`, 404));
  }

  // <<< INICIO: Validación de serviciosContratados >>>
  if (req.body.serviciosContratados && Array.isArray(req.body.serviciosContratados)) {
    const idsServiciosEnRequest = req.body.serviciosContratados
      .map(item => item.servicio) // Extraer el ID de cada item
      .filter(id => id && mongoose.Types.ObjectId.isValid(id)); // Filtrar null/undefined/inválidos

    if (idsServiciosEnRequest.length > 0) {
        const serviciosExistentes = await Servicio.find({ 
            _id: { $in: idsServiciosEnRequest } 
        }).select('_id');

        const idsServiciosExistentes = serviciosExistentes.map(s => s._id.toString());

        // Verificar si TODOS los IDs válidos del request existen en la BD
        const todosExisten = idsServiciosEnRequest.every(idReq => idsServiciosExistentes.includes(idReq.toString()));

        if (!todosExisten) {
            // Encontrar cuál(es) falta(n) - opcional para mejor mensaje de error
            const idsFaltantes = idsServiciosEnRequest.filter(idReq => !idsServiciosExistentes.includes(idReq.toString()));
            // console.warn(`Intento de actualizar evento ${req.params.id} con IDs de servicio inválidos/inexistentes: ${idsFaltantes.join(', ')}`);
            return next(new ErrorResponse(`Se proporcionaron uno o más servicios inválidos o inexistentes. IDs problemáticos: ${idsFaltantes.join(', ')}`, 400));
        }
    } 
    // Si idsServiciosEnRequest está vacío (ej: [{ servicio: null }]), la validación de schema debería fallar si servicio es required.
    // Si el array serviciosContratados está vacío [], no hay nada que validar aquí.
  }
  // <<< FIN: Validación de serviciosContratados >>>

  // Si la validación pasa (o no había servicios para validar), proceder con la actualización
  reserva = await ReservaEvento.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  // Repoblar después de actualizar para devolver datos completos
  await reserva.populate([
      { path: 'tipoEvento' },
      { path: 'serviciosContratados.servicio', model: 'Servicio' },
      { 
        path: 'serviciosAdicionales.habitaciones.reservaHabitacionId',
        model: 'ReservaHabitacion',
        select: 'habitacion tipoHabitacion fechaEntrada fechaSalida precio estadoReserva'
      },
      { path: 'usuario', select: 'nombre email' },
      { path: 'asignadoA', select: 'nombre apellidos email'}
  ]);

  res.status(200).json({ success: true, data: reserva });
});

/**
 * @desc    Eliminar una reserva de evento (ADMIN)
 * @route   DELETE /api/reservas/eventos/:id
 * @access  Private/Admin
 */
const deleteEvento = asyncHandler(async (req, res, next) => { // Renombrado de eliminarReservaEvento
  const reserva = await ReservaEvento.findById(req.params.id);

  if (!reserva) {
    return next(new ErrorResponse(`Reserva de evento no encontrada con id ${req.params.id}`, 404));
  }

  // Opcional: Podrías querer cancelar las reservas de habitación asociadas en lugar de borrarlas?
  // Por ahora, solo borramos la reserva del evento
  await reserva.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

/**
 * @desc    Obtener todas las reservas de habitación asociadas a un evento específico
 * @route   GET /api/reservas/eventos/:id/habitaciones
 * @access  Private (Admin)
 */
const getEventoHabitaciones = asyncHandler(async (req, res, next) => {
  const eventoId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(eventoId)) {
    return next(new ErrorResponse(`ID de evento no válido: ${eventoId}`, 400));
  }

  try {
    // 1. Encontrar las reservas de habitación que referencian a este evento
    const reservasHabitacion = await ReservaHabitacion.find({ reservaEvento: eventoId })
      // Seleccionar campos necesarios, incluyendo el ID de la habitación real
      .select('_id fechaEntrada fechaSalida estadoReserva habitacion infoHuespedes numHuespedes asignadoA letraHabitacion')
      .lean(); // Usar lean para obtener objetos JS planos

    if (!reservasHabitacion || reservasHabitacion.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No se encontraron habitaciones asociadas a este evento.',
        data: { habitaciones: [] } 
      });
    }

    // --- Lógica de Populado de HabitacionDetails --- CORREGIDA PARA USAR LETRA
    // 1. Extraer todas las letras únicas de las reservas
    const letrasHabitacion = new Set();
    reservasHabitacion.forEach(r => {
      if (r.letraHabitacion) {
        letrasHabitacion.add(r.letraHabitacion);
      }
      // Opcional: podríamos intentar también con r.habitacion si es ObjectId como fallback?
      // else if (r.habitacion && mongoose.Types.ObjectId.isValid(r.habitacion)) { ... }
    });

    // 2. Buscar Habitaciones por letra
    const habitacionesData = letrasHabitacion.size > 0 
      ? await Habitacion.find({ letra: { $in: [...letrasHabitacion] } })
          .populate({ path: 'tipoHabitacion', select: 'nombre' }) 
          .select('_id letra nombre tipoHabitacion') 
          .lean()
      : [];

    // 3. Crear mapa LETRA -> HabitacionDoc
    const habitacionesMap = new Map(habitacionesData.map(h => [h.letra, h])); // Usar letra como key
    
    const placeholderInvalidHabitacion = { _id: null, letra: '?', nombre: 'Inválida/Antigua', tipoHabitacion: { nombre: 'Desconocido' } }; 
    // --- Fin Lógica Populado ---
    
    // <<< Código de populado de Usuario Asignado (sin cambios) >>>
    const userIds = new Set();
    reservasHabitacion.forEach(r => {
      if (r.asignadoA && mongoose.Types.ObjectId.isValid(r.asignadoA)) {
          userIds.add(r.asignadoA.toString());
      }
    });
    const usersData = userIds.size > 0
      ? await User.find({ _id: { $in: [...userIds].map(id => new mongoose.Types.ObjectId(id)) } })
          .select('_id nombre apellidos email').lean()
      : [];
    const usersMap = new Map(usersData.map(u => [u._id.toString(), u]));
    const placeholderInvalidUser = { _id: null, nombre: 'Usuario Desc.', apellidos: '', email: '' };
    // <<< FIN Código de populado de Usuario Asignado >>>

    // 4. Procesar cada reserva de habitación para añadir detalles
    const habitacionesProcesadas = reservasHabitacion.map(r => {
      let habitacionDetails = placeholderInvalidHabitacion; // Default
      let letraParaBuscar = r.letraHabitacion; // Prioridad 1: Usar letraHabitacion si existe

      // Prioridad 2: Si no hay letraHabitacion, y r.habitacion es una string (viejo formato), usarla
      if (!letraParaBuscar && typeof r.habitacion === 'string' && r.habitacion.length === 1) {
          letraParaBuscar = r.habitacion;
          // Opcional: Añadir log para saber que usamos el fallback
          // console.warn(`[EventoHab] Reserva ${r._id}: usando r.habitacion ('${letraParaBuscar}') como letra por fallback.`);
      }

      if (letraParaBuscar) {
        const foundHabitacion = habitacionesMap.get(letraParaBuscar);
        if (foundHabitacion) {
           habitacionDetails = { ...foundHabitacion };
        } else {
           // console.warn(`[EventoHab] Habitación con letra '${letraParaBuscar}' (buscada para reserva ${r._id}) no encontrada en mapa.`);
        }
      } else {
          // Este log ahora solo debería aparecer si ni letraHabitacion ni r.habitacion (string) están presentes
          // console.warn(`[EventoHab] Reserva ${r._id}: No se pudo determinar la letra de la habitación.`);
      }
      
      // <<< Código para añadir usuarioDetails (sin cambios) >>>
      let usuarioDetails = placeholderInvalidUser;
      if (r.asignadoA && mongoose.Types.ObjectId.isValid(r.asignadoA)) {
        const foundUser = usersMap.get(r.asignadoA.toString());
        if (foundUser) {
          usuarioDetails = { ...placeholderInvalidUser, ...foundUser };
        }
      }
      // <<< FIN Código para añadir usuarioDetails >>>

      // Devolver la reserva original + detalles encontrados (o placeholder)
      return {
        ...r, 
        habitacion: r.habitacion, // Mantenemos el valor original de habitacion
        asignadoA: r.asignadoA, 
        habitacionDetails, 
        usuarioDetails 
      };
    });

    // <<< LOG DETALLADO ANTES DE ENVIAR RESPUESTA >>>
    // console.log('[getEventoHabitaciones] Enviando habitacionesProcesadas:', JSON.stringify(habitacionesProcesadas, null, 2)); 
    // <<< FIN LOG DETALLADO >>>

    res.status(200).json({
      success: true,
      data: { habitaciones: habitacionesProcesadas } // Devolver las habitaciones procesadas
    });

  } catch (error) {
    // console.error(`Error al obtener habitaciones para evento ${eventoId}:`, error);
    next(new ErrorResponse('Error interno al obtener las habitaciones del evento', 500));
  }
});

/**
 * @desc    Añadir una habitación a una reserva de evento existente (ADMIN)
 * @route   POST /api/reservas/eventos/:id/habitaciones
 * @access  Private/Admin
 */
const addHabitacionToEvento = asyncHandler(async (req, res, next) => { // Renombrado de addHabitacionAEvento
  const eventoId = req.params.id;
  const session = await mongoose.startSession();
  let nuevaHabitacion;

  try {
    await session.withTransaction(async () => {
        const evento = await ReservaEvento.findById(eventoId).session(session);
        if (!evento) {
            throw new ErrorResponse(`Evento no encontrado con ID ${eventoId}`, 404);
        }

        const {
            habitacion, // letra o ID?
            tipoHabitacion,
            categoriaHabitacion,
            precio,
            numHuespedes,
            fechaEntrada,
            fechaSalida,
            letraHabitacion // Asegurar que venga la letra
        } = req.body;

        if (!letraHabitacion && !habitacion) { // Necesitamos la letra
           throw new ErrorResponse('Identificador de habitación (letra) requerido', 400);
        }

        const entrada = fechaEntrada ? new Date(fechaEntrada) : new Date(evento.fecha);
        const salida = fechaSalida ? new Date(fechaSalida) : new Date(entrada).setDate(entrada.getDate() + 1);
        const letraReal = letraHabitacion || habitacion; // Priorizar letraHabitacion

        const reservaHabitacionData = {
            tipoReserva: 'evento',
            reservaEvento: eventoId,
            habitacion: letraReal, // Usar letra
            letraHabitacion: letraReal,
            tipoHabitacion: tipoHabitacion || 'Estándar',
            categoriaHabitacion: categoriaHabitacion || 'sencilla',
            precio: precio || 0,
            numHuespedes: numHuespedes || 2,
            fechaEntrada: entrada,
            fechaSalida: salida,
            estadoReserva: 'confirmada', // O 'pendiente' según lógica
            nombreContacto: evento.nombreContacto, // Copiar del evento
            apellidosContacto: evento.apellidosContacto,
            emailContacto: evento.emailContacto,
            telefonoContacto: evento.telefonoContacto,
            fecha: evento.fecha, // Fecha del evento
        };

        const [habCreada] = await ReservaHabitacion.create([reservaHabitacionData], { session });
        if (!habCreada) {
            throw new ErrorResponse('No se pudo crear la reserva de habitación asociada', 500);
        }
        nuevaHabitacion = habCreada;

        // Añadir referencia al evento
        const noches = Math.ceil((new Date(salida) - new Date(entrada)) / (1000 * 60 * 60 * 24)) || 1;
        const referencia = {
            reservaHabitacionId: habCreada._id,
            tipo: habCreada.tipoHabitacion,
            noches: noches,
            precio: habCreada.precio
        };

        if (!evento.serviciosAdicionales) {
            evento.serviciosAdicionales = { habitaciones: [], masajes: [] };
        }
        if (!evento.serviciosAdicionales.habitaciones) {
            evento.serviciosAdicionales.habitaciones = [];
        }
        evento.serviciosAdicionales.habitaciones.push(referencia);
        await evento.save({ session });
    });

    res.status(201).json({ success: true, data: nuevaHabitacion });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    next(error);
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Eliminar una habitación de una reserva de evento (ADMIN)
 * @route   DELETE /api/reservas/eventos/:id/habitaciones/:habId
 * @access  Private/Admin
 */
const removeHabitacionFromEvento = asyncHandler(async (req, res, next) => { // Renombrado de removeHabitacionDeEvento
  const eventoId = req.params.id;
  const reservaHabitacionId = req.params.habId;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
        const evento = await ReservaEvento.findById(eventoId).session(session);
        if (!evento) {
            throw new ErrorResponse(`Evento no encontrado con ID ${eventoId}`, 404);
        }

        // 1. Eliminar la reserva de habitación
        const resultadoDelete = await ReservaHabitacion.deleteOne({ _id: reservaHabitacionId, reservaEvento: eventoId }).session(session);
        if (resultadoDelete.deletedCount === 0) {
            throw new ErrorResponse(`Reserva de habitación ${reservaHabitacionId} no encontrada o no pertenece a este evento`, 404);
        }

        // 2. Eliminar la referencia del array en el evento
        if (evento.serviciosAdicionales && evento.serviciosAdicionales.habitaciones) {
            const index = evento.serviciosAdicionales.habitaciones.findIndex(
                habRef => habRef.reservaHabitacionId.toString() === reservaHabitacionId
            );
            if (index > -1) {
                evento.serviciosAdicionales.habitaciones.splice(index, 1);
                await evento.save({ session });
            }
        }
    });

    res.status(200).json({ success: true, data: {} });

  } catch (error) {
    if (session.inTransaction()) {
        await session.abortTransaction();
    }
    next(error);
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Obtener fechas de eventos en un rango (PUBLIC?)
 * @route   GET /api/reservas/eventos/fechas-en-rango
 * @access  Public
 */
const getEventDatesInRange = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new ErrorResponse('Se requieren fechas de inicio y fin', 400));
    }
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return next(new ErrorResponse('Formato de fecha inválido', 400));
      }
      
      // Asegurar que las horas no interfieran
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      const eventos = await ReservaEvento.find({
        fecha: {
          $gte: start,
          $lte: end
        },
        estadoReserva: { $ne: 'cancelada' } // Excluir canceladas
      }).select('fecha'); // Solo necesitamos la fecha
      
      const fechasOcupadas = eventos.map(e => {
          const d = new Date(e.fecha);
          // Formato YYYY-MM-DD
          return d.toISOString().split('T')[0]; 
      });
      
      res.status(200).json({ success: true, data: fechasOcupadas });
      
    } catch (error) {
      // console.error("Error en getEventDatesInRange:", error);
      next(new ErrorResponse('Error del servidor al obtener fechas de eventos', 500));
    }
});

/**
 * @desc    Seleccionar método de pago para evento
 * @route   PUT /api/reservas/eventos/:id/seleccionar-pago
 * @access  Private
 */
const seleccionarMetodoPagoEvento = asyncHandler(async (req, res, next) => {
  const { metodo } = req.body;
  const eventoId = req.params.id;

  if (!metodo) {
    return next(new ErrorResponse('Debe seleccionar un método de pago', 400));
  }

  const evento = await ReservaEvento.findById(eventoId);
  if (!evento) {
    return next(new ErrorResponse(`Evento no encontrado con ID ${eventoId}`, 404));
  }

  evento.metodoPago = metodo;
  await evento.save();

  if (metodo === 'transferencia') {
    try {
      await sendBankTransferInstructions(evento.emailContacto, {
        nombre: evento.nombreContacto,
        monto: evento.precio, // O el monto pendiente si lo calculas
        concepto: `Reserva Evento #${evento.numeroConfirmacion}`
      });
    } catch (emailError) {
      // console.error('Error enviando instrucciones de transferencia:', emailError);
      // No fallar la respuesta principal por el email
    }
  }

  res.status(200).json({ success: true, data: evento });
});

/**
 * @desc    Asignar una reserva de evento a un usuario existente (ADMIN)
 * @route   PUT /api/reservas/eventos/:id/asignar
 * @access  Private/Admin
 */
const assignReservaEvento = asyncHandler(async (req, res, next) => {
  const { usuarioId } = req.body;
  const eventoId = req.params.id;

  if (!usuarioId) {
    return next(new ErrorResponse('Debe proporcionar el ID del usuario', 400));
  }

  const [evento, usuario] = await Promise.all([
    ReservaEvento.findById(eventoId),
    User.findById(usuarioId)
  ]);

  if (!evento) {
    return next(new ErrorResponse(`Evento no encontrado con ID ${eventoId}`, 404));
  }
  if (!usuario) {
    return next(new ErrorResponse(`Usuario no encontrado con ID ${usuarioId}`, 404));
  }

  evento.usuario = usuarioId;
  evento.nombreContacto = usuario.nombre; // Actualizar info de contacto?
  evento.emailContacto = usuario.email;
  // evento.telefonoContacto = usuario.telefono; // Si existe en User

  await evento.save();

  res.status(200).json({ success: true, data: evento });
});

/**
 * @desc    Actualizar el estado de una reserva de evento (ADMIN)
 * @route   PATCH /api/reservas/eventos/:id/estado
 * @access  Private/Admin
 */
const updateReservaEventoEstado = asyncHandler(async (req, res, next) => {
  const { estadoReserva } = req.body;
  const eventoId = req.params.id;

  if (!estadoReserva) {
    return next(new ErrorResponse('Debe proporcionar el nuevo estado', 400));
  }

  const evento = await ReservaEvento.findById(eventoId);
  if (!evento) {
    return next(new ErrorResponse(`Evento no encontrado con ID ${eventoId}`, 404));
  }

  evento.estadoReserva = estadoReserva;
  await evento.save();
  
  // Opcional: Enviar notificación si se confirma o cancela

  res.status(200).json({ success: true, data: evento });
});

/**
 * @desc    Asignar un admin a una reserva de evento (ADMIN)
 * @route   PUT /api/reservas/eventos/:id/asignar-admin
 * @access  Private/Admin
 */
const asignarEventoAdmin = asyncHandler(async (req, res, next) => {
  const { adminUserId } = req.body; // ID del usuario admin a asignar
  const eventoId = req.params.id;

  if (!adminUserId) {
    return next(new ErrorResponse('Debe proporcionar el ID del administrador a asignar', 400));
  }

  const [evento, adminUser] = await Promise.all([
    ReservaEvento.findById(eventoId),
    User.findById(adminUserId).select('+role') // Seleccionar role para verificar si es admin
  ]);

  if (!evento) {
    return next(new ErrorResponse(`Evento no encontrado con ID ${eventoId}`, 404));
  }
  if (!adminUser) {
    return next(new ErrorResponse(`Usuario administrador no encontrado con ID ${adminUserId}`, 404));
  }

  // Opcional: Verificar si el usuario es realmente un admin
  if (!adminUser.role || adminUser.role !== 'admin') {
     return next(new ErrorResponse(`El usuario ${adminUser.nombre} no tiene permisos de administrador`, 403));
  }

  evento.asignadoA = adminUserId;
  await evento.save();

  // Repoblar el usuario asignado para la respuesta
  await evento.populate('asignadoA', 'nombre apellidos email');

   // Opcional: Enviar notificación al admin asignado
    try {
        const emailHtmlNotificacion = notificacionGestionAdmin({
             nombreAdmin: adminUser.nombre,
             tipoReserva: 'Evento',
             nombreCliente: evento.nombreContacto,
             fechaReserva: new Date(evento.fecha).toLocaleDateString('es-ES'),
             numeroConfirmacion: evento.numeroConfirmacion,
             eventoId: evento._id // Pasar el ID para generar un enlace si es necesario
        });
        await sendEmail({
            to: adminUser.email,
            subject: `Se te ha asignado la gestión de la reserva de evento #${evento.numeroConfirmacion}`,
            html: emailHtmlNotificacion
        });
    } catch (emailError) {
        // console.error(`Error enviando email de asignación a admin ${adminUser.email}:`, emailError);
        // No bloquear la respuesta por el email
    }

  res.status(200).json({ success: true, data: evento });
});

/**
 * @desc    Desasignar un admin de una reserva de evento (ADMIN)
 * @route   PUT /api/reservas/eventos/:id/desasignar-admin
 * @access  Private/Admin
 */
const desasignarEventoAdmin = asyncHandler(async (req, res, next) => {
  const eventoId = req.params.id;

  const evento = await ReservaEvento.findById(eventoId).populate('asignadoA', 'email nombre'); // Poblar para saber a quién notificar (opcional)
  if (!evento) {
    return next(new ErrorResponse(`Evento no encontrado con ID ${eventoId}`, 404));
  }

  const adminAnterior = evento.asignadoA; // Guardar referencia antes de borrar

  evento.asignadoA = null; // O undefined, según tu modelo
  await evento.save();

  // Opcional: Notificar al admin que fue desasignado
  if (adminAnterior && adminAnterior.email) {
       try {
           await sendEmail({
               to: adminAnterior.email,
               subject: `Ya no gestionas la reserva de evento #${evento.numeroConfirmacion}`,
               text: `Hola ${adminAnterior.nombre || 'Admin'},

Ya no estás asignado a la gestión de la reserva de evento #${evento.numeroConfirmacion} para ${evento.nombreContacto}.

Saludos,
El equipo de Hacienda Los Conejos`
               // Considera crear una plantilla HTML también para este email
           });
       } catch (emailError) {
           // console.error(`Error enviando email de desasignación a admin ${adminAnterior.email}:`, emailError);
       }
   }

  res.status(200).json({ success: true, data: evento }); // Devolver el evento actualizado sin el admin asignado
});

/**
 * @desc    Obtener todos los rangos de fechas ocupadas por eventos (PÚBLICO)
 * @route   GET /api/public/reservas/fechas-ocupadas-eventos
 * @access  Public
 */
/**
 * @desc    Obtener todos los rangos de fechas ocupadas por eventos (PÚBLICO)
 * @route   GET /api/reservas/eventos/public/fechas-ocupadas-eventos
 * @access  Public
 */
const getPublicOccupiedEventDates = asyncHandler(async (req, res, next) => {
  console.log('[DEBUG] Iniciando getPublicOccupiedEventDates');
  
  // Estados considerados activos para bloquear fechas públicamente
  const activeStates = ['pendiente', 'confirmada', 'pago_parcial']; 
  console.log('[DEBUG] Buscando eventos con estados:', activeStates);

  // Verificar primero si hay eventos en el sistema
  const totalEventos = await ReservaEvento.countDocuments();
  console.log(`[DEBUG] Total de eventos en la base de datos: ${totalEventos}`);

  // Buscar todos los eventos activos
  const eventos = await ReservaEvento.find({
    estadoReserva: { $in: activeStates }
  }).select('fecha fechaFin estadoReserva tipoEvento');

  console.log(`[DEBUG] Eventos encontrados (${eventos.length}):`, 
    eventos.map(evento => ({
      fecha: evento.fecha,
      fechaFin: evento.fechaFin,
      estado: evento.estadoReserva,
      tipoEvento: evento.tipoEvento
    }))
  );

  const dateRanges = eventos.map(evento => {
    // Usar fechaFin si existe, si no, la fecha de inicio es también el fin
    const inicio = evento.fecha;
    const fin = evento.fechaFin || evento.fecha;
    return {
      inicio,
      fin 
    };
  });

  console.log(`[DEBUG] Rangos de fechas ocupadas por eventos (${dateRanges.length}):`, dateRanges);
  res.status(200).json(dateRanges); // Devolver directamente el array de rangos
});

// ... otros controladores ... (ESTE COMENTARIO SE PUEDE BORRAR)

// EXPORTACIONES (actualizadas en el paso anterior, verificar que coincidan)
module.exports = {
  createEvento, // Definida arriba
  getAllReservasEvento, // Existente
  getEventoById, // Definida arriba
  updateEvento, // Definida arriba
  deleteEvento, // Definida arriba
  getEventoHabitaciones, // Definida arriba
  addHabitacionToEvento, // Definida arriba
  removeHabitacionFromEvento, // Definida arriba
  asignarEventoAdmin, // Definida arriba
  desasignarEventoAdmin, // Definida arriba
  getEventDatesInRange, // Definida arriba
  seleccionarMetodoPagoEvento, // Definida arriba
  assignReservaEvento, // Definida arriba
  updateReservaEventoEstado, // Definida arriba
  getPublicOccupiedEventDates // Definida arriba
}; 