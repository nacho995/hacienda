const ReservaEvento = require('../models/ReservaEvento');
const ReservaHabitacion = require('../models/ReservaHabitacion');
// const ReservaMasaje = require('../models/ReservaMasaje'); // Comentado porque el modelo no existe
const { StatusCodes } = require('http-status-codes');

// Función auxiliar para actualizar el estado de una reserva
const actualizarEstadoReserva = async (tipoReserva, id, nuevoEstado, usuarioActualId) => {
  let modelo;
  
  switch (tipoReserva) {
    case 'evento':
      modelo = ReservaEvento;
      break;
    case 'habitacion':
      modelo = ReservaHabitacion;
      break;
    // case 'masaje': // Comentado porque el modelo no existe
    //   modelo = ReservaMasaje;
    //   break;
    default:
      // Modificado para lanzar error si no es evento o habitacion
      if (tipoReserva !== 'evento' && tipoReserva !== 'habitacion') {
          throw new Error(`Tipo de reserva no válido o no soportado: ${tipoReserva}`);
      }
      // Si llega aquí, algo raro pasó, pero lanzamos error genérico
      throw new Error('Tipo de reserva no válido'); 
  }

  // Validar que el nuevo estado sea válido
  const estadosValidos = ['pendiente', 'confirmada', 'pagada', 'cancelada', 'completada'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error('Estado no válido');
  }

  try {
    // --- Obtener la reserva PRIMERO para verificar permiso ---
    const reserva = await modelo.findById(id);
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    // --- INICIO: Verificación de Permiso de Asignación --- 
    if (!usuarioActualId) {
       console.error("Error: usuarioActualId no fue proporcionado a actualizarEstadoReserva.");
       throw new Error('Error interno del servidor (Autenticación)');
    }
    const asignadoAId = reserva.asignadoA ? reserva.asignadoA.toString() : null;
    const userId = usuarioActualId.toString(); 

    // Si está asignada Y NO está asignada al usuario actual Y el nuevo estado NO es 'cancelada'
    if (asignadoAId && asignadoAId !== userId && nuevoEstado !== 'cancelada') {
      const error = new Error('No tienes permiso para actualizar el estado de esta reserva porque está asignada a otro administrador.');
      error.statusCode = 403; // Añadir código de estado para el catch
      throw error;
    }
    // --- FIN: Verificación de Permiso de Asignación ---

    // Si la verificación pasa, ahora sí actualizar
    reserva.estadoReserva = nuevoEstado;
    reserva.updatedAt = new Date();
    const reservaActualizada = await reserva.save({ validateBeforeSave: true });

    console.log(`Estado de reserva actualizado: ${tipoReserva} ${id} -> ${nuevoEstado}`);
    return reservaActualizada;
  } catch (error) {
    console.error('Error al actualizar estado de reserva:', error);
    throw error; // Re-lanzar el error para que lo maneje el controlador
  }
};

// Controlador para actualizar el estado de una reserva
const actualizarEstado = async (req, res) => {
  try {
    const { tipoReserva, id, estadoReserva } = req.body;

    // --- Asegurarse de que req.user.id existe --- 
    if (!req.user || !req.user.id) {
       console.error("Error: req.user no está definido en el controlador actualizarEstado.");
       return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
         success: false, 
         message: 'Error interno del servidor (Autenticación)' 
       });
    }
    // -------------------------------------------

    if (!tipoReserva || !id || !estadoReserva) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Faltan parámetros requeridos'
      });
    }

    // Pasar el ID del usuario actual a la función auxiliar
    const reservaActualizada = await actualizarEstadoReserva(tipoReserva, id, estadoReserva, req.user.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: reservaActualizada,
      message: `Estado de reserva actualizado a ${estadoReserva}`
    });
  } catch (error) {
    console.error('Error en controlador actualizarEstado:', error);
    // Usar el statusCode del error si existe (para el 403 Forbidden)
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al actualizar el estado de la reserva'
    });
  }
};

module.exports = {
  actualizarEstado
};
