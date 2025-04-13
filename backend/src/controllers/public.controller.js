const ReservaEvento = require('../models/ReservaEvento');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Obtener datos públicos de una reserva (evento o habitación) por ID
 * @route   GET /api/public/reserva/:id
 * @access  Public
 */
exports.getReservaPublica = async (req, res, next) => {
  const { id } = req.params;

  try {
    let reserva = null;
    let tipoReserva = null;

    // Buscar primero en Reservas de Evento
    reserva = await ReservaEvento.findById(id)
      .select('nombreEvento nombreContacto apellidosContacto emailContacto fecha horaInicio horaFin numeroInvitados espacioSeleccionado estadoReserva tipoEvento')
      .populate('tipoEvento', 'titulo');

    if (reserva) {
      tipoReserva = 'evento';
    } else {
      // Si no se encuentra, buscar en Reservas de Habitación
      reserva = await ReservaHabitacion.findById(id)
        .select('nombreContacto apellidosContacto emailContacto fechaEntrada fechaSalida numeroHuespedes estadoReserva habitacion tipoHabitacion')
        .populate('habitacion', 'letra nombre')
        .populate('tipoHabitacion', 'nombre');
      
      if (reserva) {
        tipoReserva = 'habitacion';
      }
    }

    if (!reserva) {
      return next(new ErrorResponse('Reserva no encontrada', 404));
    }

    // Devolver solo los datos necesarios y seguros
    res.status(200).json({
      success: true,
      tipo: tipoReserva,
      data: reserva 
    });

  } catch (error) {
    console.error('Error al obtener reserva pública:', error);
    // Manejar error de Cast si el ID no es válido
    if (error.name === 'CastError') {
        return next(new ErrorResponse('ID de reserva inválido', 400));
    }
    next(new ErrorResponse('Error al obtener la reserva', 500));
  }
}; 