const ReservaEvento = require('../models/ReservaEvento');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const ReservaMasaje = require('../models/ReservaMasaje');
const { StatusCodes } = require('http-status-codes');

// Función auxiliar para actualizar el estado de una reserva
const actualizarEstadoReserva = async (tipoReserva, id, nuevoEstado) => {
  let modelo;
  
  switch (tipoReserva) {
    case 'evento':
      modelo = ReservaEvento;
      break;
    case 'habitacion':
      modelo = ReservaHabitacion;
      break;
    case 'masaje':
      modelo = ReservaMasaje;
      break;
    default:
      throw new Error('Tipo de reserva no válido');
  }

  // Validar que el nuevo estado sea válido
  const estadosValidos = ['pendiente', 'confirmada', 'pagada', 'cancelada', 'completada'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error('Estado no válido');
  }

  try {
    // Buscar la reserva y actualizar el estado en una operación atómica
    const reservaActualizada = await modelo.findByIdAndUpdate(
      id,
      { estadoReserva: nuevoEstado, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!reservaActualizada) {
      throw new Error('Reserva no encontrada');
    }

    console.log(`Estado de reserva actualizado: ${tipoReserva} ${id} -> ${nuevoEstado}`);
    return reservaActualizada;
  } catch (error) {
    console.error('Error al actualizar estado de reserva:', error);
    throw error;
  }
};

// Controlador para actualizar el estado de una reserva
const actualizarEstado = async (req, res) => {
  try {
    const { tipoReserva, id, estadoReserva } = req.body;

    if (!tipoReserva || !id || !estadoReserva) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Faltan parámetros requeridos'
      });
    }

    const reservaActualizada = await actualizarEstadoReserva(tipoReserva, id, estadoReserva);

    res.status(StatusCodes.OK).json({
      success: true,
      data: reservaActualizada,
      message: `Estado de reserva actualizado a ${estadoReserva}`
    });
  } catch (error) {
    console.error('Error al actualizar estado de reserva:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error al actualizar el estado de la reserva'
    });
  }
};

module.exports = {
  actualizarEstado
};
