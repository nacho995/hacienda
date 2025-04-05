const mongoose = require('mongoose');
const baseReservaSchema = require('./BaseReserva');

// Crear un nuevo esquema que extiende del base
const reservaHabitacionSchema = baseReservaSchema.clone().add({
  habitacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habitacion',
    required: [true, 'Por favor, seleccione una habitación']
  },
  fechaSalida: {
    type: Date,
    required: [true, 'Por favor, seleccione una fecha de salida']
  },
  numHuespedes: {
    type: Number,
    required: [true, 'Por favor, indique el número de huéspedes'],
    min: [1, 'Debe haber al menos un huésped']
  },
  reservaEvento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReservaEvento',
    required: [true, 'La reserva de habitación debe estar asociada a un evento']
  }
});

// Método estático para comprobar disponibilidad
reservaHabitacionSchema.statics.comprobarDisponibilidad = async function(habitacionId, fechaEntrada, fechaSalida) {
  // Validar fechas
  const { fechaInicioObj: fechaEntradaObj, fechaFinObj: fechaSalidaObj } = 
    this.validarRangoFechas(fechaEntrada, fechaSalida);

  // Buscar reservas que se solapen
  const reservasExistentes = await this.find({
    habitacion: habitacionId,
    estadoReserva: { $nin: ['cancelada'] },
    $or: [
      {
        fecha: { $lte: fechaSalidaObj },
        fechaSalida: { $gt: fechaEntradaObj }
      },
      {
        fecha: { $lt: fechaSalidaObj },
        fechaSalida: { $gte: fechaEntradaObj }
      }
    ]
  });

  // Para habitaciones, consideramos que hay solapamiento si existe alguna reserva
  // que se superponga con las fechas solicitadas
  return reservasExistentes.length === 0;
};

// Método para obtener disponibilidad por rango de fechas
reservaHabitacionSchema.statics.obtenerDisponibilidadPorRango = async function(habitacionId, fechaInicio, fechaFin) {
  const { fechaInicioObj, fechaFinObj } = this.validarRangoFechas(fechaInicio, fechaFin);
  
  const reservas = await this.find({
    habitacion: habitacionId,
    estadoReserva: { $nin: ['cancelada'] },
    $or: [
      {
        fecha: { $lte: fechaFinObj },
        fechaSalida: { $gt: fechaInicioObj }
      }
    ]
  }).sort('fecha');

  const diasOcupados = [];
  let fechaActual = new Date(fechaInicioObj);

  while (fechaActual <= fechaFinObj) {
    for (const reserva of reservas) {
      if (fechaActual >= reserva.fecha && fechaActual < reserva.fechaSalida) {
        diasOcupados.push(new Date(fechaActual));
        break;
      }
    }
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return {
    disponible: diasOcupados.length === 0,
    diasOcupados
  };
};

// Crear y exportar el modelo
const ReservaHabitacion = mongoose.model('ReservaHabitacion', reservaHabitacionSchema);
module.exports = ReservaHabitacion; 