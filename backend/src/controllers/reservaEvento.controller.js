const ReservaEvento = require('../models/ReservaEvento');
const User = require('../models/User');
const TipoEvento = require('../models/TipoEvento');
const ReservaMasaje = require('../models/ReservaMasaje');
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
      nombreEvento,
      tipoEvento,
      nombreContacto,
      apellidosContacto,
      emailContacto,
      telefonoContacto,
      fecha,
      horaInicio,
      horaFin,
      espacioSeleccionado,
      numInvitados,
      peticionesEspeciales,
      presupuestoEstimado
    } = req.body;
    
    // Validar campos obligatorios
    if (!nombreEvento || !tipoEvento || !nombreContacto || !apellidosContacto || !emailContacto || !telefonoContacto || !fecha || !numInvitados) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione todos los campos obligatorios'
      });
    }

    // Buscar el tipo de evento por su ID
    const tipoEventoDoc = await TipoEvento.findById(tipoEvento);
    if (!tipoEventoDoc) {
      return res.status(400).json({
        success: false,
        message: `El tipo de evento no es válido`
      });
    }

    // Verificar disponibilidad para la fecha y hora solicitadas
    const disponible = await ReservaEvento.comprobarDisponibilidad(
      fecha,
      espacioSeleccionado || 'jardin',
      horaInicio || '12:00',
      horaFin || '18:00'
    );

    if (!disponible) {
      return res.status(400).json({
        success: false,
        message: 'El espacio no está disponible para la fecha y hora solicitadas'
      });
    }
    
    // Crear objeto para guardar
    const reservaData = {
      // Solo incluir usuario si está autenticado
      ...(req.user && req.user.id ? { usuario: req.user.id } : {}),
      nombreEvento,
      tipoEvento: tipoEventoDoc._id, // Usar el ObjectId del tipo de evento
      nombreContacto,
      apellidosContacto,
      emailContacto,
      telefonoContacto,
      fecha,
      horaInicio: horaInicio || '12:00',
      horaFin: horaFin || '18:00',
      espacioSeleccionado: espacioSeleccionado || 'jardin',
      numInvitados: parseInt(numInvitados),
      peticionesEspeciales: peticionesEspeciales || '',
      presupuestoEstimado: presupuestoEstimado || 0,
      serviciosAdicionales: {
        masajes: req.body.serviciosAdicionales?.masajes?.map(masaje => ({
          tipo: masaje.titulo,
          duracion: parseInt(masaje.duracion),
          precio: parseFloat(masaje.precio)
        })) || []
      }
    };

    // Calcular precio base usando el precio del tipo de evento
    const precioBase = parseFloat(tipoEventoDoc.precio) || 0;

    // Calcular precio por invitado
    const precioPorInvitado = 350; // $350 por invitado
    const precioInvitados = parseInt(numInvitados) * precioPorInvitado;

    // Calcular precio por servicios adicionales
    let precioServicios = 0;
    if (req.body.serviciosAdicionales) {
      if (req.body.serviciosAdicionales.decoracion) precioServicios += 15000;
      if (req.body.serviciosAdicionales.musica) precioServicios += 12000;
      if (req.body.serviciosAdicionales.fotografo) precioServicios += 8000;
      if (req.body.serviciosAdicionales.transporte) precioServicios += 5000;
    }

    // Calcular precio por menú seleccionado
    let precioMenu = 0;
    switch (req.body.menuSeleccionado) {
      case 'Premium':
        precioMenu = parseInt(numInvitados) * 800;
        break;
      case 'Deluxe':
        precioMenu = parseInt(numInvitados) * 1200;
        break;
      case 'Personalizado':
        precioMenu = parseInt(numInvitados) * 1500;
        break;
      case 'Básico':
        precioMenu = parseInt(numInvitados) * 500;
        break;
    }

    // Calcular precio total
    const precioTotal = precioBase + precioInvitados + precioServicios + precioMenu;

    // Actualizar el objeto de reserva con el precio total
    reservaData.precio = precioTotal;

    // Crear la reserva del evento
    const reservaEvento = await ReservaEvento.create(reservaData);

    // Si hay masajes seleccionados, crear las reservas de masajes
    if (req.body.serviciosAdicionales?.masajes?.length > 0) {
      const masajesPromises = req.body.serviciosAdicionales.masajes.map(masaje => {
        return ReservaMasaje.create({
          tipoMasaje: masaje.id,
          duracion: parseInt(masaje.duracion),
          hora: horaInicio, // Por defecto usamos la hora de inicio del evento
          fecha: fecha,
          nombreContacto: nombreContacto,
          apellidosContacto: apellidosContacto,
          emailContacto: emailContacto,
          telefonoContacto: telefonoContacto,
          reservaEvento: reservaEvento._id
        });
      });

      await Promise.all(masajesPromises);
    }

    // Enviar email de confirmación al usuario
    try {
      await sendEmail({
        email: emailContacto,
        subject: 'Confirmación de Reserva de Evento - Hacienda San Carlos Borromeo',
        html: confirmacionTemplate({
          nombreContacto: nombreContacto,
          apellidosContacto: apellidosContacto,
          tipoEvento: tipoEvento,
          nombreEvento: nombreEvento,
          fecha: fecha,
          horaInicio: horaInicio || '12:00',
          horaFin: horaFin || '18:00',
          espacioSeleccionado: espacioSeleccionado || 'jardin',
          numeroInvitados: numInvitados,
          numeroConfirmacion: reservaEvento.numeroConfirmacion,
          estadoReserva: reservaEvento.estadoReserva,
          presupuestoEstimado: presupuestoEstimado || 0
        })
      });
  
      // Enviar email de notificación al administrador
      await sendEmail({
        email: process.env.EMAIL_ADMIN || 'admin@hacienda-sancarlos.com',
        subject: 'Nueva Reserva de Evento - Hacienda San Carlos Borromeo',
        html: confirmacionAdminTemplate({
          tipo: 'evento',
          cliente: `${nombreContacto} ${apellidosContacto}`,
          email: emailContacto,
          telefono: telefonoContacto,
          fecha: fecha,
          hora: `${horaInicio || '12:00'} - ${horaFin || '18:00'}`,
          detalles: `Tipo de evento: ${tipoEvento}, Número de personas: ${numInvitados}`,
          comentarios: peticionesEspeciales || 'No hay comentarios adicionales'
        })
      });
    } catch (emailError) {
      console.error('Error al enviar emails de confirmación:', emailError);
      // Continuamos con la respuesta aunque falle el envío de emails
    }

    res.status(201).json({
      success: true,
      data: reservaEvento
    });
  } catch (error) {
    console.error('Error al crear reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo crear la reserva',
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
    }
    
    // Filtros opcionales
    if (req.query.fecha) {
      // Formato ISO YYYY-MM-DD
      const fechaInicio = new Date(req.query.fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      
      const fechaFin = new Date(req.query.fecha);
      fechaFin.setHours(23, 59, 59, 999);
      
      query.fechaEvento = {
        $gte: fechaInicio,
        $lte: fechaFin
      };
    }

    // Filtro opcional para mostrar solo reservas sin asignar
    if (req.query.sinAsignar === 'true') {
      query.asignadoA = null;
    }
    
    const reservas = await ReservaEvento.find(query)
      .populate('usuario', 'nombre apellidos email telefono')
      .populate('asignadoA', 'nombre apellidos email')
      .sort({ fechaEvento: 1, horaInicio: 1 });
      
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
      .populate('usuario', 'nombre apellidos email telefono')
      .populate('asignadoA', 'nombre apellidos email');
      
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
    
    // Si se cambia la fecha u hora, verificar disponibilidad
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
    
    // Actualizar la reserva
    reserva = await ReservaEvento.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('usuario', 'nombre apellidos email telefono')
     .populate('asignadoA', 'nombre apellidos email');
    
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
 * @desc    Comprobar disponibilidad de espacios para eventos
 * @route   POST /api/reservas/eventos/disponibilidad
 * @access  Public
 */
exports.comprobarDisponibilidadEvento = async (req, res) => {
  try {
    const { fecha, espacio, horaInicio, horaFin } = req.body;
    
    // Verificar todos los parámetros requeridos
    if (!fecha || !horaInicio || !horaFin) {
      return res.status(400).json({
        success: false,
        disponible: false,
        mensaje: 'Por favor proporciona fecha, hora de inicio y hora de fin'
      });
    }
    
    // Si no se especifica el espacio, usar el predeterminado
    const espacioSeleccionado = espacio || 'jardin';
    
    // Verificar que el espacio sea válido
    if (!['salon', 'jardin', 'terraza'].includes(espacioSeleccionado)) {
      return res.status(400).json({
        success: false,
        disponible: false,
        mensaje: 'Espacio no válido. Los espacios válidos son: salon, jardin, terraza'
      });
    }
    
    // Verificar disponibilidad
    const disponible = await ReservaEvento.comprobarDisponibilidad(
      fecha,
      espacioSeleccionado,
      horaInicio,
      horaFin
    );
    
    // Enviar respuesta con formato consistente
    res.status(200).json({
      success: true,
      disponible: disponible,
      mensaje: disponible ? 'El espacio está disponible' : 'El espacio no está disponible para la fecha y hora seleccionadas'
    });
  } catch (error) {
    console.error('Error al comprobar disponibilidad de evento:', error);
    res.status(500).json({
      success: false,
      disponible: false,
      mensaje: error.message || 'Error al comprobar disponibilidad'
    });
  }
};

/**
 * @desc    Asignar reserva de evento a un usuario
 * @route   PUT /api/reservas/eventos/:id/asignar
 * @access  Private/Admin
 */
exports.asignarReservaEvento = async (req, res) => {
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
 * @desc    Asignar una reserva a un usuario
 * @route   PUT /api/reservas/eventos/:id/asignar
 * @access  Private
 */
exports.asignarReserva = async (req, res) => {
  try {
    const reserva = await ReservaEvento.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Asignar al usuario actual
    reserva.asignadoA = req.user.id;
    await reserva.save();

    res.status(200).json({
      success: true,
      data: reserva,
      message: 'Reserva asignada exitosamente'
    });
  } catch (error) {
    console.error('Error al asignar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo asignar la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Desasignar una reserva
 * @route   PUT /api/reservas/eventos/:id/desasignar
 * @access  Private
 */
exports.desasignarReserva = async (req, res) => {
  try {
    const reserva = await ReservaEvento.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar que el usuario actual es quien tiene asignada la reserva
    if (reserva.asignadoA && reserva.asignadoA.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para desasignar esta reserva'
      });
    }

    // Desasignar reserva
    reserva.asignadoA = null;
    await reserva.save();

    res.status(200).json({
      success: true,
      data: reserva,
      message: 'Reserva desasignada exitosamente'
    });
  } catch (error) {
    console.error('Error al desasignar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo desasignar la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener fechas ocupadas para eventos
 * @route   GET /api/reservas/eventos/fechas-ocupadas
 * @access  Public
 */
exports.obtenerFechasOcupadas = async (req, res) => {
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
      query.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    } else if (fechaInicio) {
      // Solo hay fecha de inicio
      query.fecha = { $gte: new Date(fechaInicio) };
    } else if (fechaFin) {
      // Solo hay fecha de fin
      query.fecha = { $lte: new Date(fechaFin) };
    } else {
      // Si no hay fechas, establecer un rango por defecto (próximos 12 meses)
      const hoy = new Date();
      const finPeriodo = new Date();
      finPeriodo.setFullYear(hoy.getFullYear() + 1);
      
      query.fecha = {
        $gte: hoy,
        $lte: finPeriodo
      };
    }
    
    // Proyectar solo los campos necesarios: fecha, horaInicio, horaFin, espacioSeleccionado
    const reservas = await ReservaEvento.find(query, 'fecha horaInicio horaFin espacioSeleccionado')
      .sort({ fecha: 1, horaInicio: 1 });
    
    // Agrupar por fechas para enviar un formato más simple al frontend
    const fechasOcupadas = reservas.map(reserva => ({
      fecha: reserva.fecha,
      espacioSeleccionado: reserva.espacioSeleccionado,
      horaInicio: reserva.horaInicio,
      horaFin: reserva.horaFin
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