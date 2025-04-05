const ReservaHabitacion = require('../models/ReservaHabitacion');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const emailConfirmacionReserva = require('../emails/confirmacionReserva');

// @desc    Crear una nueva reserva de habitación
// @route   POST /api/reservas/habitaciones
// @access  Public
exports.crearReservaHabitacion = async (req, res) => {
  try {
    // Si hay un usuario autenticado, usar su ID
    if (req.user) {
      req.body.usuario = req.user.id;
    } else {
      // Si no hay usuario autenticado, crear la reserva con un ID temporal
      req.body.usuario = process.env.GUEST_USER_ID || '65f3829ead6cc5d7c8c26e62';
    }
    
    // Comprobar disponibilidad
    const { tipoHabitacion, habitacion, fechaEntrada, fechaSalida, numeroHabitaciones } = req.body;
    
    const disponibilidad = await ReservaHabitacion.comprobarDisponibilidad(
      tipoHabitacion,
      fechaEntrada,
      fechaSalida,
      numeroHabitaciones
    );
    
    if (!disponibilidad.disponible) {
      return res.status(400).json({
        success: false,
        message: disponibilidad.mensaje
      });
    }

    // Obtener el precio de la habitación
    const Habitacion = require('../models/Habitacion');
    const habitacionInfo = await Habitacion.findOne({ nombre: habitacion });

    if (!habitacionInfo) {
      return res.status(400).json({
        success: false,
        message: 'No se encontró la habitación especificada'
      });
    }

    // Calcular la duración de la estancia en días
    const fechaInicioObj = new Date(fechaEntrada);
    const fechaFinObj = new Date(fechaSalida);
    const duracionEstancia = Math.ceil((fechaFinObj - fechaInicioObj) / (1000 * 60 * 60 * 24));

    // Calcular el precio total
    const precioTotal = habitacionInfo.precio * duracionEstancia * numeroHabitaciones;

    // Crear la reserva con el precio total calculado
    const reserva = await ReservaHabitacion.create({
      ...req.body,
      precioTotal
    });
    
    // Enviar email de confirmación
    try {
      await sendEmail({
        email: reserva.email,
        subject: 'Confirmación de reserva - Hacienda San Carlos Borromeo',
        html: emailConfirmacionReserva('habitacion', reserva)
      });
    } catch (err) {
      console.error('Error al enviar email de confirmación:', err);
      // No impedimos que se complete la reserva si el email falla
    }
    
    res.status(201).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la reserva de habitación'
    });
  }
};

// @desc    Obtener todas las reservas de habitaciones
// @route   GET /api/reservas/habitaciones
// @access  Public/Private
exports.obtenerReservasHabitacion = async (req, res) => {
  try {
    let query = { estado: { $ne: 'cancelada' } };
    
    // Si el usuario está autenticado y es admin, puede ver todas las reservas
    if (req.user && req.user.role === 'admin') {
      // Ver todas las reservas
      query = {};
    } else if (req.user) {
      // Usuario autenticado normal: ver sus propias reservas
      query = {
        $or: [
          { usuario: req.user.id },
          { asignadoA: req.user.id }
        ]
      };
    } else {
      // Acceso público: solo ver reservas activas y futuras
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      query = {
        estado: { $ne: 'cancelada' },
        fechaSalida: { $gte: today }
      };
    }
    
    // Ejecutar query
    const reservas = await ReservaHabitacion.find(query)
      .populate('usuario', 'nombre apellidos email telefono')
      .populate('asignadoA', 'nombre apellidos email')
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
};

// @desc    Obtener una reserva de habitación por ID
// @route   GET /api/reservas/habitaciones/:id
// @access  Private
exports.obtenerReservaHabitacion = async (req, res) => {
  try {
    const reserva = await ReservaHabitacion.findById(req.params.id).populate({
      path: 'usuario',
      select: 'nombre apellidos email telefono'
    });
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // Asegurarse de que el usuario es propietario de la reserva o es admin
    if (reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para acceder a esta reserva'
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
};

// @desc    Actualizar una reserva de habitación
// @route   PUT /api/reservas/habitaciones/:id
// @access  Private
exports.actualizarReservaHabitacion = async (req, res) => {
  try {
    let reserva = await ReservaHabitacion.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // Asegurarse de que el usuario es propietario de la reserva o es admin
    if (reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para actualizar esta reserva'
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
        fechaSalida,
        numeroHabitaciones
      );
      
      if (!disponibilidad.disponible) {
        return res.status(400).json({
          success: false,
          message: disponibilidad.mensaje
        });
      }
    }
    
    // No permitir cambiar el usuario de la reserva
    delete req.body.usuario;
    
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
};

// @desc    Eliminar una reserva de habitación
// @route   DELETE /api/reservas/habitaciones/:id
// @access  Private
exports.eliminarReservaHabitacion = async (req, res) => {
  try {
    const reserva = await ReservaHabitacion.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // Asegurarse de que el usuario es propietario de la reserva o es admin
    if (reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para eliminar esta reserva'
      });
    }
    
    await reserva.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la reserva de habitación'
    });
  }
};

// @desc    Comprobar disponibilidad de habitaciones
// @route   POST /api/reservas/habitaciones/disponibilidad
// @access  Public
exports.comprobarDisponibilidadHabitacion = async (req, res) => {
  try {
    const { tipoHabitacion, habitacion, fechaEntrada, fechaSalida, numeroHabitaciones } = req.body;
    
    if (!tipoHabitacion || !habitacion || !fechaEntrada || !fechaSalida || !numeroHabitaciones) {
      return res.status(400).json({
        success: false,
        disponible: false,
        mensaje: 'Por favor, proporcione todos los campos requeridos'
      });
    }
    
    // Buscar reservas que se solapen con las fechas proporcionadas para esta habitación específica
    const reservas = await ReservaHabitacion.find({
      habitacion, // Filtramos por la habitación específica
      estado: { $ne: 'cancelada' },
      $or: [
        {
          fechaEntrada: { $lte: fechaSalida },
          fechaSalida: { $gte: fechaEntrada }
        }
      ]
    });

    // Calcular habitaciones ocupadas
    let habitacionesOcupadas = 0;
    reservas.forEach(reserva => {
      habitacionesOcupadas += reserva.numeroHabitaciones || 1;
    });

    // Obtener el total de habitaciones disponibles de la base de datos
    const Habitacion = require('../models/Habitacion');
    const habitacionInfo = await Habitacion.findOne({ nombre: habitacion });

    if (!habitacionInfo) {
      return res.status(404).json({
        success: false,
        disponible: false,
        mensaje: 'No se encontró la habitación especificada'
      });
    }

    // Verificar que la habitación es del tipo correcto
    if (habitacionInfo.tipo !== tipoHabitacion) {
      return res.status(400).json({
        success: false,
        disponible: false,
        mensaje: 'El tipo de habitación no coincide con la habitación seleccionada'
      });
    }

    const habitacionesRestantes = Math.max(0, habitacionInfo.totalDisponibles - habitacionesOcupadas);
    
    res.status(200).json({
      success: true,
      disponible: habitacionesRestantes >= numeroHabitaciones,
      mensaje: habitacionesRestantes >= numeroHabitaciones
        ? `Hay ${habitacionesRestantes} habitaciones disponibles`
        : `Lo sentimos, solo quedan ${habitacionesRestantes} habitaciones disponibles`,
      habitacionesRestantes
    });
  } catch (error) {
    console.error('Error al comprobar disponibilidad:', error);
    res.status(500).json({
      success: false,
      disponible: false,
      mensaje: 'Error al comprobar disponibilidad'
    });
  }
};

// @desc    Asignar reserva de habitación a un usuario
// @route   PUT /api/reservas/habitaciones/:id/asignar
// @access  Private/Admin
exports.asignarReservaHabitacion = async (req, res) => {
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
    const reserva = await ReservaHabitacion.findById(req.params.id);
    
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar la reserva de habitación',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener fechas ocupadas para habitaciones
 * @route   GET /api/reservas/habitaciones/fechas-ocupadas
 * @access  Public
 */
exports.obtenerFechasOcupadas = async (req, res) => {
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
    } else if (fechaInicio) {
      // Solo hay fecha de inicio (buscar reservas desde esa fecha)
      query.fechaSalida = { $gte: new Date(fechaInicio) };
    } else if (fechaFin) {
      // Solo hay fecha de fin (buscar reservas hasta esa fecha)
      query.fechaEntrada = { $lte: new Date(fechaFin) };
    } else {
      // Si no hay fechas, establecer un rango por defecto (próximos 12 meses)
      const hoy = new Date();
      const finPeriodo = new Date();
      finPeriodo.setFullYear(hoy.getFullYear() + 1);
      
      query.$or = [
        { fechaEntrada: { $gte: hoy, $lte: finPeriodo } },
        { fechaSalida: { $gte: hoy, $lte: finPeriodo } },
        { fechaEntrada: { $lte: hoy }, fechaSalida: { $gte: finPeriodo } }
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
}; 