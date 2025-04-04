const ReservaHabitacion = require('../models/ReservaHabitacion');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const emailConfirmacionReserva = require('../emails/confirmacionReserva');

// @desc    Crear una nueva reserva de habitación
// @route   POST /api/reservas/habitaciones
// @access  Private
exports.crearReservaHabitacion = async (req, res) => {
  try {
    // Agregar usuario a req.body
    req.body.usuario = req.user.id;
    
    // Comprobar disponibilidad
    const { tipoHabitacion, fechaEntrada, fechaSalida, numeroHabitaciones } = req.body;
    
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
    
    // Crear la reserva
    const reserva = await ReservaHabitacion.create(req.body);
    
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
// @access  Private/Admin
exports.obtenerReservasHabitacion = async (req, res) => {
  try {
    let query;
    
    // Si el usuario es administrador, puede ver todas las reservas
    if (req.user.role === 'admin') {
      query = ReservaHabitacion.find().populate({
        path: 'usuario',
        select: 'nombre apellidos email telefono'
      });
    } else {
      // Si es un usuario normal, solo ve sus propias reservas
      query = ReservaHabitacion.find({ usuario: req.user.id });
    }
    
    // Filtrado
    const queryStr = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete queryStr[param]);
    
    // Convertir en format de mongoose
    let queryString = JSON.stringify(queryStr);
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    query = query.find(JSON.parse(queryString));
    
    // Selección de campos
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Ordenación
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await ReservaHabitacion.countDocuments(JSON.parse(queryString));
    
    query = query.skip(startIndex).limit(limit);
    
    // Ejecutar query
    const reservas = await query;
    
    // Resultado de paginación
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: reservas.length,
      pagination,
      data: reservas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las reservas de habitación'
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
    const { tipoHabitacion, fechaEntrada, fechaSalida, numeroHabitaciones } = req.body;
    
    if (!tipoHabitacion || !fechaEntrada || !fechaSalida || !numeroHabitaciones) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione todos los campos requeridos'
      });
    }
    
    const disponibilidad = await ReservaHabitacion.comprobarDisponibilidad(
      tipoHabitacion,
      fechaEntrada,
      fechaSalida,
      numeroHabitaciones
    );
    
    res.status(200).json({
      success: true,
      disponibilidad
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al comprobar la disponibilidad'
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