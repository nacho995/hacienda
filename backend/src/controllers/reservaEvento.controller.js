const ReservaEvento = require('../models/ReservaEvento');
const User = require('../models/User');
const TipoEvento = require('../models/TipoEvento');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const mongoose = require('mongoose');
const sendEmail = require('../utils/email');
const confirmacionTemplate = require('../emails/confirmacionReserva');
const confirmacionAdminTemplate = require('../emails/confirmacionAdmin');

/**
 * @desc    Crear una reserva de evento
 * @route   POST /api/reservas/eventos
 * @access  Public
 */
exports.crearReservaEvento = async (req, res) => {
  try {
    const { 
      tipo_evento,
      fecha,
      nombre_contacto,
      apellidos_contacto,
      email_contacto,
      telefono_contacto,
      mensaje,
      habitaciones,
      modo_gestion_habitaciones
    } = req.body;
    
    // Validar campos obligatorios
    if (!tipo_evento || !fecha || !nombre_contacto || !email_contacto || !telefono_contacto) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione todos los campos obligatorios'
      });
    }

    // Validar tipo de evento
    const tipoEventoDoc = await TipoEvento.findOne({ 
      nombre: { $regex: new RegExp(tipo_evento, 'i') }
    });

    if (!tipoEventoDoc) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de evento no válido'
      });
    }

    // Validar fecha
    const fechaEvento = new Date(fecha);
    if (isNaN(fechaEvento.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha no válida'
      });
    }

    // Verificar disponibilidad para la fecha
    const reservasExistentes = await ReservaEvento.find({
      fecha: {
        $gte: new Date(fechaEvento.setHours(0, 0, 0, 0)),
        $lt: new Date(fechaEvento.setHours(23, 59, 59, 999))
      },
      estadoReserva: { $ne: 'cancelada' }
    });

    if (reservasExistentes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'La fecha seleccionada no está disponible'
      });
    }

    // Procesar las habitaciones
    const habitacionesValidadas = habitaciones?.map(hab => ({
      fecha_entrada: new Date(hab.fecha_entrada),
      huespedes: hab.huespedes.map(h => ({
        nombre: h.nombre,
        numero_personas: parseInt(h.numero_personas)
      }))
    })) || [];

    // Calcular el total de habitaciones
    const totalHabitaciones = habitacionesValidadas.length || 7;
    
    // Crear objeto para guardar
    const reservaData = {
      // Solo incluir usuario si está autenticado
      ...(req.user && req.user.id ? { usuario: req.user.id } : {}),
      tipoEvento: tipoEventoDoc._id,
      nombreContacto: nombre_contacto,
      apellidosContacto: apellidos_contacto,
      emailContacto: email_contacto,
      telefonoContacto: telefono_contacto,
      fecha: fechaEvento,
      horaInicio: '12:00',
      horaFin: '18:00',
      espacioSeleccionado: 'jardin',
      numInvitados: 50, // Valor por defecto
      peticionesEspeciales: mensaje || '',
      estadoReserva: 'pendiente',
      metodoPago: 'pendiente',
      modoGestionHabitaciones: modo_gestion_habitaciones || 'usuario',
      totalHabitaciones,
      serviciosAdicionales: {
        habitaciones: habitacionesValidadas.map((hab, index) => ({
          tipoHabitacion: index < 6 ? '1 cama king size' : 'Dos matrimoniales',
          categoriaHabitacion: index < 6 ? 'sencilla' : 'doble',
          precio: index < 6 ? 2400 : 2600,
          fechaEntrada: hab.fecha_entrada,
          fechaSalida: new Date(hab.fecha_entrada.getTime() + 24 * 60 * 60 * 1000),
          huespedes: hab.huespedes,
          estado: 'pendiente'
        }))
      }
    };

    // Crear la reserva
    const reserva = await ReservaEvento.create(reservaData);

    // Crear las reservas de habitaciones asociadas
    const reservasHabitaciones = [];
    for (const [index, hab] of habitacionesValidadas.entries()) {
      const reservaHabitacion = await ReservaHabitacion.create({
        tipoReserva: 'evento',
        reservaEvento: reserva._id,
        tipoHabitacion: index < 6 ? '1 cama king size' : 'Dos matrimoniales',
        categoriaHabitacion: index < 6 ? 'sencilla' : 'doble',
        numHuespedes: hab.huespedes.reduce((total, h) => total + h.numero_personas, 0),
        infoHuespedes: {
          nombres: hab.huespedes.map(h => h.nombre),
          detalles: `${hab.huespedes.length} huéspedes`
        },
        fechaEntrada: hab.fecha_entrada,
        fechaSalida: new Date(hab.fecha_entrada.getTime() + 24 * 60 * 60 * 1000),
        estado: 'pendiente',
        nombreContacto: nombre_contacto,
        apellidosContacto: apellidos_contacto,
        emailContacto: email_contacto,
        telefonoContacto: telefono_contacto
      });
      reservasHabitaciones.push(reservaHabitacion);
    }

    // Actualizar la reserva del evento con las referencias a las habitaciones
    reserva.serviciosAdicionales.habitaciones = reservasHabitaciones.map(rh => ({
      reservaHabitacionId: rh._id,
      tipoHabitacion: rh.tipoHabitacion,
      precio: rh.tipoHabitacion === '1 cama king size' ? 2400 : 2600
    }));
    await reserva.save();

    // Enviar correo de confirmación al cliente
    try {
      // Preparar contenido del email
      const emailContent = confirmacionTemplate({
        nombre: nombre_contacto,
        apellidos: apellidos_contacto,
        tipoEvento: tipoEventoDoc.nombre,
        fecha: fechaEvento.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        numeroConfirmacion: reserva.numeroConfirmacion,
        habitaciones: habitacionesValidadas.length,
        modoGestionHabitaciones: modo_gestion_habitaciones || 'usuario'
      });
      
      // Enviar email al cliente
      await sendEmail({
        email: email_contacto,
        subject: 'Confirmación de Reserva - Hacienda La Esperanza',
        html: emailContent
      });

      // Si el modo de gestión es por la hacienda, enviar correo adicional al administrador
      if (modo_gestion_habitaciones === 'hacienda') {
        // Obtener todos los usuarios con rol admin
        const adminUsers = await User.find({ role: 'admin' });
        const adminEmails = adminUsers.map(admin => admin.email);
        
        if (adminEmails.length > 0) {
          const adminEmailContent = `
            <h2>Nueva Reserva de Evento con Gestión de Habitaciones por la Hacienda</h2>
            <p><strong>Número de Confirmación:</strong> ${reserva.numeroConfirmacion}</p>
            <p><strong>Tipo de Evento:</strong> ${tipoEventoDoc.nombre}</p>
            <p><strong>Fecha:</strong> ${fechaEvento.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Cliente:</strong> ${nombre_contacto} ${apellidos_contacto}</p>
            <p><strong>Email:</strong> ${email_contacto}</p>
            <p><strong>Teléfono:</strong> ${telefono_contacto}</p>
            <p><strong>Modo de Gestión:</strong> Gestión por la Hacienda</p>
            <p>El cliente ha seleccionado que el personal de la hacienda gestione la asignación de habitaciones.</p>
            <p>Por favor, contacte al cliente para coordinar los detalles de las habitaciones y huéspedes.</p>
            <p><a href="${process.env.FRONTEND_URL}/admin/reservas/eventos/${reserva._id}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Ver Reserva en el Panel de Administración</a></p>
          `;
          
          await sendEmail({
            email: adminEmails,
            subject: `Nueva Reserva con Gestión de Habitaciones - ${reserva.numeroConfirmacion}`,
            html: adminEmailContent
          });
        }
      } else {
        // Enviar correo de notificación al administrador estándar
        const defaultAdminEmails = ['admin@hacienda.com']; // Lista de correos de administradores
        for (const adminEmail of defaultAdminEmails) {
          await sendEmail({
            email: adminEmail,
            subject: 'Nueva Reserva de Evento',
            html: confirmacionAdminTemplate({
              nombre: nombre_contacto,
              apellidos: apellidos_contacto,
              tipoEvento: tipoEventoDoc.nombre,
              fecha: fechaEvento.toLocaleDateString('es-ES'),
              numeroConfirmacion: reserva.numeroConfirmacion,
              habitaciones: habitacionesValidadas.length
            })
          });
        }
      }
    } catch (emailError) {
      console.error('Error al enviar correos de confirmación:', emailError);
      // No devolvemos error al cliente ya que la reserva se creó correctamente
    }

    res.status(201).json({
      success: true,
      data: {
        reserva,
        habitaciones: reservasHabitaciones
      }
    });
  } catch (error) {
    console.error('Error al crear reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la reserva de evento',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener todas las reservas de eventos
 * @route   GET /api/reservas/eventos
 * @access  Private
 */
exports.obtenerReservasEvento = async (req, res) => {
  try {
    let query = {};
    
    // Si no es admin, solo ver sus propias reservas
    if (req.user.role !== 'admin') {
      // Ver tanto las reservas propias como las asignadas a este usuario
      query = {
        $or: [
          { usuario: req.user.id },
          { asignadoA: req.user.id }
        ]
      };
    } else {
      // Para administradores, filtrar según los parámetros
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
    }
    
    // Añadir filtro por fecha si se proporciona
    if (req.query.fecha) {
      // Formato ISO YYYY-MM-DD
      const fechaInicio = new Date(req.query.fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      
      const fechaFin = new Date(req.query.fecha);
      fechaFin.setHours(23, 59, 59, 999);
      
      query.fecha = {
        $gte: fechaInicio,
        $lte: fechaFin
      };
    }
    
    // Añadir filtro por espacio/lugar si se proporciona
    if (req.query.espacio) {
      query.espacio = req.query.espacio;
    }
    
    console.log('Consulta para obtener reservas de eventos:', JSON.stringify(query));
    
    // Ejecutar la consulta
    const reservas = await ReservaEvento.find(query)
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
        path: 'tipoEvento',
        strictPopulate: false
      })
      .sort({ fecha: 1, horaInicio: 1 });
      
    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas
    });
  } catch (error) {
    console.error('Error al obtener reservas de eventos:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudieron obtener las reservas',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener una reserva de evento por ID
 * @route   GET /api/reservas/eventos/:id
 * @access  Private
 */
exports.obtenerReservaEvento = async (req, res) => {
  try {
    const reserva = await ReservaEvento.findById(req.params.id)
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
        path: 'tipoEvento',
        strictPopulate: false
      });
      
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Temporalmente desactivada la verificación de permisos para debugging
    // Comentado: Verificar que el usuario tenga acceso a esta reserva
    // if (reserva.usuario && reserva.usuario._id && 
    //     reserva.usuario._id.toString() !== req.user.id && 
    //     req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'No tienes permiso para ver esta reserva'
    //   });
    // }
    
    res.status(200).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error('Error al obtener reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo obtener la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar una reserva de evento
 * @route   PUT /api/reservas/eventos/:id
 * @access  Private
 */
exports.actualizarReservaEvento = async (req, res) => {
  try {
    let reserva = await ReservaEvento.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Temporalmente desactivada la verificación de permisos para debugging
    // if (reserva.usuario && reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'No tienes permiso para actualizar esta reserva'
    //   });
    // }
    
    // Detectar si es una operación de eliminación de habitación por la bandera especial
    const esOperacionEliminacionHabitacion = req.body._operacion_eliminacion_habitacion === true;
    
    if (esOperacionEliminacionHabitacion) {
      console.log('Detectada operación de eliminación de habitación. Omitiendo verificación de disponibilidad.');
      
      // Eliminar la bandera especial antes de guardar
      delete req.body._operacion_eliminacion_habitacion;
    } else {
      // Verificación normal de disponibilidad si se cambia fecha/hora/espacio
      if (
        (req.body.fecha && req.body.fecha !== reserva.fecha.toISOString().split('T')[0]) ||
        (req.body.horaInicio && req.body.horaInicio !== reserva.horaInicio) ||
        (req.body.horaFin && req.body.horaFin !== reserva.horaFin) ||
        (req.body.espacioSeleccionado && req.body.espacioSeleccionado !== reserva.espacioSeleccionado)
      ) {
        const fecha = req.body.fecha || reserva.fecha;
        const horaInicio = req.body.horaInicio || reserva.horaInicio;
        const horaFin = req.body.horaFin || reserva.horaFin;
        const espacio = req.body.espacioSeleccionado || reserva.espacioSeleccionado;
        
        const disponible = await ReservaEvento.comprobarDisponibilidad(
          fecha,
          espacio,
          horaInicio,
          horaFin,
          reserva._id // Excluir la reserva actual de la verificación
        );
        
        if (!disponible) {
          return res.status(400).json({
            success: false,
            message: 'El espacio no está disponible para la fecha y hora solicitadas'
          });
        }
      }
    }
    
    // Detectar si se están modificando las habitaciones
    if (req.body.serviciosAdicionales?.habitaciones) {
      console.log('Actualizando habitaciones del evento:', req.params.id);
      console.log('Habitaciones actuales:', reserva.serviciosAdicionales?.habitaciones?.length || 0);
      console.log('Nuevas habitaciones:', req.body.serviciosAdicionales.habitaciones.length);
      
      // Si se están eliminando habitaciones, mostrar detalle
      if (reserva.serviciosAdicionales?.habitaciones?.length > req.body.serviciosAdicionales.habitaciones.length) {
        console.log('Eliminando habitaciones:');
        console.log('  - Antes:', JSON.stringify(reserva.serviciosAdicionales.habitaciones));
        console.log('  - Después:', JSON.stringify(req.body.serviciosAdicionales.habitaciones));
      }
    }
    
    // Actualizar la reserva
    reserva = await ReservaEvento.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'usuario',
      select: 'nombre apellidos email telefono',
      strictPopulate: false
    }).populate({
      path: 'asignadoA',
      select: 'nombre apellidos email',
      strictPopulate: false
    }).populate({
      path: 'tipoEvento',
      strictPopulate: false
    });
    
    console.log('Evento actualizado correctamente:', req.params.id);
    
    res.status(200).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error('Error al actualizar reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo actualizar la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar una reserva de evento
 * @route   DELETE /api/reservas/eventos/:id
 * @access  Private
 */
exports.eliminarReservaEvento = async (req, res) => {
  try {
    const reserva = await ReservaEvento.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Temporalmente desactivada la verificación de permisos para debugging
    // if (reserva.usuario && reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'No tienes permiso para eliminar esta reserva'
    //   });
    // }
    
    await reserva.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Reserva eliminada correctamente',
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo eliminar la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Comprobar disponibilidad de eventos
 * @route   POST /api/reservas/eventos/disponibilidad
 * @access  Public
 */
exports.checkEventoAvailability = async (req, res) => {
  try {
    const { fecha, tipo_evento, total_habitaciones } = req.body;

    console.log('Verificando disponibilidad con datos:', { fecha, tipo_evento, total_habitaciones });

    // Validar campos requeridos
    if (!fecha || !tipo_evento) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione la fecha y el tipo de evento'
      });
    }

    // Validar que la fecha sea futura
    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    
    // Establecer las horas a 0 para comparar solo las fechas
    fechaReserva.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    
    console.log('Fecha reserva:', fechaReserva.toISOString());
    console.log('Fecha hoy:', hoy.toISOString());
    
    if (fechaReserva <= hoy) {
      return res.status(400).json({
        success: false,
        message: 'La fecha debe ser posterior a hoy'
      });
    }

    // Validar tipo de evento
    const tipoEventoDoc = await TipoEvento.findOne({ 
      nombre: { $regex: new RegExp(tipo_evento, 'i') }
    });

    if (!tipoEventoDoc) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de evento no válido'
      });
    }

    // Validar número de habitaciones
    const habitacionesRequeridas = total_habitaciones || 7;
    if (habitacionesRequeridas < 7 || habitacionesRequeridas > 14) {
      return res.status(400).json({
        success: false,
        message: 'El número de habitaciones debe estar entre 7 y 14'
      });
    }

    // Buscar reservas existentes para la fecha
    const inicioDelDia = new Date(fechaReserva);
    inicioDelDia.setHours(0, 0, 0, 0);
    
    const finDelDia = new Date(fechaReserva);
    finDelDia.setHours(23, 59, 59, 999);
    
    const reservasExistentes = await ReservaEvento.find({
      fecha: {
        $gte: inicioDelDia,
        $lt: finDelDia
      },
      estadoReserva: { $ne: 'cancelada' }
    });
    
    console.log('Buscando reservas entre:', inicioDelDia.toISOString(), 'y', finDelDia.toISOString());

    // Si hay reservas en la fecha, verificar disponibilidad
    if (reservasExistentes.length > 0) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'La fecha seleccionada no está disponible'
      });
    }

    res.status(200).json({
      success: true,
      available: true,
      message: 'Fecha disponible para el evento'
    });
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar disponibilidad',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener fechas ocupadas para eventos
 * @route   GET /api/reservas/eventos/fechas-ocupadas
 * @access  Public
 */
exports.getEventoOccupiedDates = async (req, res) => {
  try {
    // Parámetros opcionales para filtrar por espacio y fechas
    const { espacioSeleccionado, fechaInicio, fechaFin } = req.query;
    
    // Construir el query
    const query = {
      estadoReserva: { $ne: 'cancelada' }
    };
    
    // Si se especifica un espacio, filtrar por él
    if (espacioSeleccionado) {
      query.espacioSeleccionado = espacioSeleccionado;
    }
    
    // Si hay fechas de inicio y fin, filtrar el rango
    if (fechaInicio && fechaFin) {
      const fechaInicioObj = new Date(fechaInicio);
      const fechaFinObj = new Date(fechaFin);
      
      query.fecha = {
        $gte: fechaInicioObj,
        $lte: fechaFinObj
      };
    }
    
    // Proyectar solo los campos necesarios
    const reservas = await ReservaEvento.find(query, 'fecha horaInicio horaFin espacioSeleccionado')
      .sort({ fecha: 1, horaInicio: 1 });
    
    // Preparar datos para el frontend
    const fechasOcupadas = reservas.map(reserva => ({
      fecha: reserva.fecha,
      horaInicio: reserva.horaInicio,
      horaFin: reserva.horaFin,
      espacioSeleccionado: reserva.espacioSeleccionado
    }));
    
    res.status(200).json({
      success: true,
      data: fechasOcupadas
    });
  } catch (error) {
    console.error('Error al obtener fechas ocupadas de eventos:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudieron obtener las fechas ocupadas',
      error: error.message
    });
  }
};

/**
 * @desc    Asignar reserva de evento a un usuario
 * @route   PUT /api/reservas/eventos/:id/asignar
 * @access  Private
 */
exports.assignReservaEvento = async (req, res) => {
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
    const reserva = await ReservaEvento.findById(req.params.id);
    
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
    console.error('Error al asignar la reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar la reserva de evento',
      error: error.message
    });
  }
};

/**
 * @desc    Desasignar una reserva de evento
 * @route   PUT /api/reservas/eventos/:id/desasignar
 * @access  Private
 */
exports.unassignReservaEvento = async (req, res) => {
  try {
    // Buscar la reserva
    const reserva = await ReservaEvento.findById(req.params.id);
    
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
      message: 'Reserva de evento desasignada exitosamente'
    });
  } catch (error) {
    console.error('Error al desasignar la reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desasignar la reserva de evento',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener todas las habitaciones asignadas a un evento
 * @route   GET /api/reservas/eventos/:id/habitaciones
 * @access  Private
 */
exports.obtenerHabitacionesEvento = async (req, res) => {
  try {
    const eventoId = req.params.id;
    
    // Validar que el ID sea válido para MongoDB
    if (!eventoId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID de evento no válido'
      });
    }
    
    // Verificar que el evento existe
    const evento = await ReservaEvento.findById(eventoId)
      .populate({
        path: 'usuario',
        select: 'nombre apellidos email telefono',
        strictPopulate: false
      })
      .populate({
        path: 'tipoEvento',
        strictPopulate: false
      });
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    // Verificar que el usuario es propietario del evento o admin
    if (
      evento.usuario && 
      evento.usuario.toString() !== req.user.id && 
      (!evento.asignadoA || evento.asignadoA.toString() !== req.user.id) && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para ver las habitaciones de este evento'
      });
    }
    
    // Crear un array con las 14 habitaciones
    const habitaciones = Array(14).fill().map((_, index) => ({
      numero: index + 1,
      tipo: index < 6 ? '1 cama king size' : 'Dos matrimoniales',
      categoria: index < 6 ? 'sencilla' : 'doble',
      precio: index < 6 ? 2400 : 2600,
      estado: 'pendiente',
      fechaEntrada: evento.fecha,
      fechaSalida: new Date(evento.fecha.getTime() + 24 * 60 * 60 * 1000), // +1 día
      infoHuespedes: {
        nombres: [],
        detalles: ''
      }
    }));
    
    res.status(200).json({
      success: true,
      data: {
        evento,
        habitaciones
      }
    });
  } catch (error) {
    console.error('Error al obtener las habitaciones del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las habitaciones del evento',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar información de huéspedes para una habitación de evento
 * @route   PUT /api/reservas/eventos/:eventoId/habitaciones/:letraHabitacion
 * @access  Private
 */
exports.actualizarHabitacionEvento = async (req, res) => {
  try {
    const { eventoId, letraHabitacion } = req.params;
    const { infoHuespedes } = req.body;
    
    // Validar que el ID sea válido para MongoDB
    if (!eventoId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID de evento no válido'
      });
    }
    
    // Verificar que el evento existe
    const evento = await ReservaEvento.findById(eventoId)
      .populate({
        path: 'usuario',
        select: 'nombre apellidos email telefono',
        strictPopulate: false
      })
      .populate({
        path: 'tipoEvento',
        strictPopulate: false
      });
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    // Verificar que el usuario es propietario del evento o admin
    if (
      evento.usuario && 
      evento.usuario.toString() !== req.user.id && 
      (!evento.asignadoA || evento.asignadoA.toString() !== req.user.id) && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para actualizar las habitaciones de este evento'
      });
    }
    
    // Buscar la habitación por letra y evento
    const ReservaHabitacion = require('../models/ReservaHabitacion');
    let habitacion = await ReservaHabitacion.findOne({ 
      reservaEvento: eventoId,
      letraHabitacion: letraHabitacion
    });
    
    // Si no existe la habitación, crearla
    if (!habitacion) {
      // Determinar el tipo de habitación y precio según la letra
      let tipoHabitacion = 'Dos matrimoniales';
      let categoriaHabitacion = 'doble';
      let precioPorNoche = 2600;
      
      // Habitaciones sencillas (A, B, K, L, M, O)
      if (['A', 'B', 'K', 'L', 'M', 'O'].includes(letraHabitacion)) {
        tipoHabitacion = '1 cama king size';
        categoriaHabitacion = 'sencilla';
        precioPorNoche = 2400;
      }
      
      habitacion = await ReservaHabitacion.create({
        tipoHabitacion,
        categoriaHabitacion,
        precioPorNoche,
        letraHabitacion,
        numHuespedes: 2,
        infoHuespedes: infoHuespedes || { nombres: [], detalles: '' },
        tipoReservacion: 'evento',
        reservaEvento: eventoId,
        numeroHabitaciones: 1,
        fechaEntrada: evento.fecha,
        fechaSalida: new Date(evento.fecha.getTime() + 24 * 60 * 60 * 1000), // +1 día
        habitacion: `Habitación ${letraHabitacion}`,
        estado: 'pendiente',
        nombreContacto: evento.nombreContacto,
        apellidosContacto: evento.apellidosContacto,
        emailContacto: evento.emailContacto,
        telefonoContacto: evento.telefonoContacto,
        fecha: evento.fecha,
        precio: 0, // El precio se maneja a nivel de evento
        precioTotal: 0
      });
    } else {
      // Actualizar la información de huéspedes
      habitacion = await ReservaHabitacion.findOneAndUpdate(
        { 
          reservaEvento: eventoId,
          letraHabitacion: letraHabitacion
        },
        { infoHuespedes },
        { new: true, runValidators: true }
      );
    }
    
    res.status(200).json({
      success: true,
      data: habitacion
    });
  } catch (error) {
    console.error('Error al actualizar habitación del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la habitación del evento',
      error: error.message
    });
  }
};

// Función para ajustar la duración al valor permitido más cercano
const ajustarDuracionValida = (duracion) => {
  const duracionesValidas = [30, 60, 90, 120];
  
  // Si la duración ya es válida, la devolvemos tal cual
  if (duracionesValidas.includes(duracion)) {
    return duracion;
  }
  
  // Si no, encontramos el valor más cercano
  let duracionAjustada = duracionesValidas.reduce((prev, curr) => {
    return (Math.abs(curr - duracion) < Math.abs(prev - duracion) ? curr : prev);
  });
  
  console.log(`Ajustando duración inválida: ${duracion} min → ${duracionAjustada} min (valor permitido más cercano)`);
  return duracionAjustada;
};