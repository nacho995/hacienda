const ReservaEvento = require('../models/ReservaEvento');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const confirmacionTemplate = require('../emails/confirmacionReserva');
const confirmacionAdminTemplate = require('../emails/confirmacionAdmin');

/**
 * @desc    Crear una reserva de evento
 * @route   POST /api/reservas/eventos
 * @access  Private
 */
exports.crearReservaEvento = async (req, res) => {
  try {
    const { 
      fechaEvento, 
      horaInicio, 
      horaFin, 
      tipoEvento, 
      numPersonas,
      serviciosAdicionales,
      comentarios 
    } = req.body;

    // Verificar disponibilidad para la fecha y hora solicitadas
    const disponible = await ReservaEvento.comprobarDisponibilidad(
      fechaEvento,
      horaInicio,
      horaFin
    );

    if (!disponible) {
      return res.status(400).json({
        success: false,
        message: 'El espacio no está disponible para la fecha y hora solicitadas'
      });
    }

    // Crear la reserva
    const reserva = await ReservaEvento.create({
      usuario: req.user.id,
      fechaEvento,
      horaInicio,
      horaFin,
      tipoEvento,
      numPersonas,
      serviciosAdicionales,
      comentarios,
      numeroConfirmacion: ReservaEvento.generarNumeroConfirmacion()
    });

    // Buscar información del usuario para el email
    const usuario = await User.findById(req.user.id);

    // Enviar email de confirmación al usuario
    await sendEmail({
      email: usuario.email,
      subject: 'Confirmación de Reserva de Evento - Hacienda San Carlos Borromeo',
      html: confirmacionTemplate({
        nombre: usuario.nombre,
        tipo: 'evento',
        fecha: fechaEvento,
        hora: `${horaInicio} - ${horaFin}`,
        numeroConfirmacion: reserva.numeroConfirmacion,
        detalles: `Tipo de evento: ${tipoEvento}, Número de personas: ${numPersonas}`
      })
    });

    // Enviar email de notificación al administrador
    await sendEmail({
      email: process.env.EMAIL_ADMIN,
      subject: 'Nueva Reserva de Evento - Hacienda San Carlos Borromeo',
      html: confirmacionAdminTemplate({
        tipo: 'evento',
        cliente: `${usuario.nombre} ${usuario.apellidos}`,
        email: usuario.email,
        telefono: usuario.telefono,
        fecha: fechaEvento,
        hora: `${horaInicio} - ${horaFin}`,
        detalles: `Tipo de evento: ${tipoEvento}, Número de personas: ${numPersonas}`,
        comentarios: comentarios || 'No hay comentarios adicionales'
      })
    });

    res.status(201).json({
      success: true,
      data: reserva
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
      .populate('usuario', 'nombre apellidos email telefono');
      
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Verificar que el usuario tenga acceso a esta reserva
    if (reserva.usuario._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta reserva'
      });
    }
    
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
    
    // Verificar que el usuario tenga acceso a esta reserva
    if (reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta reserva'
      });
    }
    
    // Si se cambia la fecha u hora, verificar disponibilidad
    if (
      (req.body.fechaEvento && req.body.fechaEvento !== reserva.fechaEvento.toISOString().split('T')[0]) ||
      (req.body.horaInicio && req.body.horaInicio !== reserva.horaInicio) ||
      (req.body.horaFin && req.body.horaFin !== reserva.horaFin)
    ) {
      const fechaEvento = req.body.fechaEvento || reserva.fechaEvento;
      const horaInicio = req.body.horaInicio || reserva.horaInicio;
      const horaFin = req.body.horaFin || reserva.horaFin;
      
      const disponible = await ReservaEvento.comprobarDisponibilidad(
        fechaEvento,
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
    );
    
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
    
    // Verificar que el usuario tenga acceso a esta reserva
    if (reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta reserva'
      });
    }
    
    await reserva.deleteOne();
    
    res.status(200).json({
      success: true,
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
    const { fechaEvento, horaInicio, horaFin } = req.body;
    
    if (!fechaEvento || !horaInicio || !horaFin) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona fecha, hora de inicio y hora de fin'
      });
    }
    
    const disponible = await ReservaEvento.comprobarDisponibilidad(
      fechaEvento,
      horaInicio,
      horaFin
    );
    
    res.status(200).json({
      success: true,
      disponible
    });
  } catch (error) {
    console.error('Error al comprobar disponibilidad de evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al comprobar disponibilidad',
      error: error.message
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
    
    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione el ID del usuario al que se asignará la reserva'
      });
    }
    
    // Verificar que el usuario existe
    const usuario = await User.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
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
    reserva.asignadoA = usuarioId;
    await reserva.save();
    
    res.status(200).json({
      success: true,
      data: reserva
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