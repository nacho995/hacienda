const ReservaMasaje = require('../models/ReservaMasaje');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const confirmacionTemplate = require('../emails/confirmacionReserva');
const confirmacionAdminTemplate = require('../emails/confirmacionAdmin');

/**
 * @desc    Crear una reserva de masaje
 * @route   POST /api/reservas/masajes
 * @access  Private
 */
exports.crearReservaMasaje = async (req, res) => {
  try {
    const { 
      fechaMasaje, 
      horaMasaje, 
      tipoMasaje, 
      duracion, 
      terapeuta, 
      comentarios 
    } = req.body;

    // Verificar disponibilidad para la fecha y hora solicitadas
    const disponible = await ReservaMasaje.comprobarDisponibilidad(
      fechaMasaje,
      horaMasaje,
      duracion,
      terapeuta
    );

    if (!disponible) {
      return res.status(400).json({
        success: false,
        message: 'No hay disponibilidad para la fecha, hora o terapeuta solicitados'
      });
    }

    // Crear la reserva
    const reserva = await ReservaMasaje.create({
      usuario: req.user.id,
      fechaMasaje,
      horaMasaje,
      tipoMasaje,
      duracion,
      terapeuta,
      comentarios,
      numeroConfirmacion: ReservaMasaje.generarNumeroConfirmacion()
    });

    // Buscar información del usuario para el email
    const usuario = await User.findById(req.user.id);

    // Enviar email de confirmación al usuario
    await sendEmail({
      email: usuario.email,
      subject: 'Confirmación de Reserva de Masaje - Hacienda San Carlos Borromeo',
      html: confirmacionTemplate({
        nombre: usuario.nombre,
        tipo: 'masaje',
        fecha: fechaMasaje,
        hora: horaMasaje,
        numeroConfirmacion: reserva.numeroConfirmacion,
        detalles: `Tipo de masaje: ${tipoMasaje}, Duración: ${duracion} minutos, Terapeuta: ${terapeuta}`
      })
    });

    // Enviar email de notificación al administrador
    await sendEmail({
      email: process.env.EMAIL_ADMIN,
      subject: 'Nueva Reserva de Masaje - Hacienda San Carlos Borromeo',
      html: confirmacionAdminTemplate({
        tipo: 'masaje',
        cliente: `${usuario.nombre} ${usuario.apellidos}`,
        email: usuario.email,
        telefono: usuario.telefono,
        fecha: fechaMasaje,
        hora: horaMasaje,
        detalles: `Tipo de masaje: ${tipoMasaje}, Duración: ${duracion} minutos, Terapeuta: ${terapeuta}`,
        comentarios: comentarios || 'No hay comentarios adicionales'
      })
    });

    res.status(201).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error('Error al crear reserva de masaje:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo crear la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener todas las reservas de masajes
 * @route   GET /api/reservas/masajes
 * @access  Private
 */
exports.obtenerReservasMasaje = async (req, res) => {
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
    
    // Filtros opcionales
    if (req.query.fecha) {
      // Formato ISO YYYY-MM-DD
      const fechaInicio = new Date(req.query.fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      
      const fechaFin = new Date(req.query.fecha);
      fechaFin.setHours(23, 59, 59, 999);
      
      query.fechaMasaje = {
        $gte: fechaInicio,
        $lte: fechaFin
      };
    }
    
    if (req.query.terapeuta) {
      query.terapeuta = req.query.terapeuta;
    }
    
    console.log('Consulta para obtener reservas de masajes:', JSON.stringify(query));
    
    const reservas = await ReservaMasaje.find(query)
      .populate('usuario', 'nombre apellidos email telefono')
      .populate('asignadoA', 'nombre apellidos email')
      .sort({ fechaMasaje: 1, horaMasaje: 1 });
      
    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas
    });
  } catch (error) {
    console.error('Error al obtener reservas de masajes:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudieron obtener las reservas',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener una reserva de masaje por ID
 * @route   GET /api/reservas/masajes/:id
 * @access  Private
 */
exports.obtenerReservaMasaje = async (req, res) => {
  try {
    const reserva = await ReservaMasaje.findById(req.params.id)
      .populate('usuario', 'nombre apellidos email telefono');
      
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Verificar que el usuario tenga acceso a esta reserva
    if ((reserva.usuario && reserva.usuario._id && reserva.usuario._id.toString() !== req.user.id) && req.user.role !== 'admin') {
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
    console.error('Error al obtener reserva de masaje:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo obtener la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar una reserva de masaje
 * @route   PUT /api/reservas/masajes/:id
 * @access  Private
 */
exports.actualizarReservaMasaje = async (req, res) => {
  try {
    let reserva = await ReservaMasaje.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Verificar que el usuario tenga acceso a esta reserva
    if ((reserva.usuario && reserva.usuario.toString() !== req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta reserva'
      });
    }
    
    // Si se cambia la fecha, hora, duración o terapeuta, verificar disponibilidad
    if (
      (req.body.fechaMasaje && req.body.fechaMasaje !== reserva.fechaMasaje.toISOString().split('T')[0]) ||
      (req.body.horaMasaje && req.body.horaMasaje !== reserva.horaMasaje) ||
      (req.body.duracion && req.body.duracion !== reserva.duracion) ||
      (req.body.terapeuta && req.body.terapeuta !== reserva.terapeuta)
    ) {
      const fechaMasaje = req.body.fechaMasaje || reserva.fechaMasaje;
      const horaMasaje = req.body.horaMasaje || reserva.horaMasaje;
      const duracion = req.body.duracion || reserva.duracion;
      const terapeuta = req.body.terapeuta || reserva.terapeuta;
      
      const disponible = await ReservaMasaje.comprobarDisponibilidad(
        fechaMasaje,
        horaMasaje,
        duracion,
        terapeuta,
        reserva._id // Excluir la reserva actual de la verificación
      );
      
      if (!disponible) {
        return res.status(400).json({
          success: false,
          message: 'No hay disponibilidad para la fecha, hora o terapeuta solicitados'
        });
      }
    }
    
    // Actualizar la reserva
    reserva = await ReservaMasaje.findByIdAndUpdate(
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
    console.error('Error al actualizar reserva de masaje:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo actualizar la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar una reserva de masaje
 * @route   DELETE /api/reservas/masajes/:id
 * @access  Private
 */
exports.eliminarReservaMasaje = async (req, res) => {
  try {
    console.log('Intentando eliminar reserva de masaje con ID:', req.params.id);
    const reserva = await ReservaMasaje.findById(req.params.id);
    
    if (!reserva) {
      console.log('Reserva no encontrada con ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    console.log('Datos de la reserva:', {
      id: reserva._id,
      usuario: reserva.usuario,
      tipoReserva: reserva.tipoReserva,
      estadoReserva: reserva.estadoReserva
    });
    
    // Verificar que el usuario tenga acceso a esta reserva
    // Agregamos verificación adicional para evitar el error "Cannot read properties of undefined (reading 'toString')"
    if ((reserva.usuario && reserva.usuario.toString() !== req.user.id) && req.user.role !== 'admin') {
      console.log('Sin permiso para eliminar. Usuario actual:', req.user.id, 'Usuario de la reserva:', reserva.usuario);
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta reserva'
      });
    }
    
    await reserva.deleteOne();
    console.log('Reserva eliminada exitosamente');
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar reserva de masaje:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo eliminar la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Comprobar disponibilidad de masajes
 * @route   POST /api/reservas/masajes/disponibilidad
 * @access  Public
 */
exports.comprobarDisponibilidadMasaje = async (req, res) => {
  try {
    const { fechaMasaje, horaMasaje, duracion, terapeuta } = req.body;
    
    if (!fechaMasaje || !horaMasaje || !duracion) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona fecha, hora y duración del masaje'
      });
    }
    
    const disponible = await ReservaMasaje.comprobarDisponibilidad(
      fechaMasaje,
      horaMasaje,
      duracion,
      terapeuta
    );
    
    res.status(200).json({
      success: true,
      disponible
    });
  } catch (error) {
    console.error('Error al comprobar disponibilidad de masaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al comprobar disponibilidad',
      error: error.message
    });
  }
};

/**
 * @desc    Asignar reserva de masaje a un usuario
 * @route   PUT /api/reservas/masajes/:id/asignar
 * @access  Private/Admin
 */
exports.asignarReservaMasaje = async (req, res) => {
  try {
    const { usuarioId } = req.body;
    
    // Si no se proporciona un ID de usuario, asignar al usuario actual
    const idUsuarioAsignar = usuarioId || req.user.id;
    
    // Buscar la reserva y actualizarla
    const reserva = await ReservaMasaje.findById(req.params.id);
    
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
      message: 'Reserva de masaje asignada exitosamente'
    });
  } catch (error) {
    console.error('Error al asignar la reserva de masaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar la reserva de masaje',
      error: error.message
    });
  }
};

/**
 * @desc    Desasignar una reserva de masaje
 * @route   PUT /api/reservas/masajes/:id/desasignar
 * @access  Private/Admin
 */
exports.desasignarReservaMasaje = async (req, res) => {
  try {
    // Buscar la reserva
    const reserva = await ReservaMasaje.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // Verificar que el usuario actual es quien tiene asignada la reserva o es admin
    if (reserva.asignadoA && reserva.asignadoA.toString() !== req.user.id && req.user.role !== 'admin') {
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
      message: 'Reserva de masaje desasignada exitosamente'
    });
  } catch (error) {
    console.error('Error al desasignar la reserva de masaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desasignar la reserva de masaje',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener todas las reservas de masajes (para admin)
 * @route   GET /api/reservas/eventos/masajes/lista
 * @access  Private/Admin
 */
exports.getMasajeReservations = async (req, res) => {
  try {
    let query = {};
    
    // Filtrar según los parámetros para administradores
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
    
    console.log('Consulta para obtener reservas de masajes (admin):', JSON.stringify(query));
    
    const reservas = await ReservaMasaje.find(query)
      .populate('usuario', 'nombre apellidos email telefono')
      .populate('asignadoA', 'nombre apellidos email')
      .sort({ fechaMasaje: -1 });

    res.status(200).json({
      success: true,
      data: reservas,
      message: 'Reservas de masajes obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener reservas de masajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las reservas de masajes',
      error: error.message
    });
  }
}; 