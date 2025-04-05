const mongoose = require('mongoose');
const baseReservaSchema = require('./BaseReserva');

// Crear un nuevo esquema que extiende del base
const reservaMasajeSchema = baseReservaSchema.clone().add({
  tipoMasaje: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TipoMasaje',
    required: [true, 'Por favor, seleccione un tipo de masaje']
  },
  duracion: {
    type: Number,
    required: [true, 'Por favor, seleccione la duración del masaje'],
    enum: [30, 60, 90, 120]
  },
  hora: {
    type: String,
    required: [true, 'Por favor, seleccione una hora para el masaje']
  },
  reservaEvento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReservaEvento'
  }
});

// Método estático para comprobar disponibilidad
reservaMasajeSchema.statics.comprobarDisponibilidad = async function(fecha, hora, duracion) {
  // Validar duración
  if (![30, 60, 90, 120].includes(duracion)) {
    throw new Error('Duración no válida');
  }

  // Validar fecha y hora
  const fechaReserva = this.validarFecha(fecha);
  const horaInicio = this.validarHorarioComercial(hora);
  const horaFin = horaInicio + duracion;

  if (horaFin > 21 * 60) { // No puede terminar después de las 21:00
    throw new Error('El masaje no puede terminar después de las 21:00');
  }

  // Buscar reservas para el mismo día
  const reservasExistentes = await this.obtenerReservasEnFecha(fechaReserva);

  // Comprobar solapamiento con otras reservas
  for (const reserva of reservasExistentes) {
    const inicioExistente = this.convertirHoraAMinutos(reserva.hora);
    const finExistente = inicioExistente + reserva.duracion;

    if (this.haySolapamiento(horaInicio, horaFin, inicioExistente, finExistente)) {
      return false;
    }
  }

  return true;
};

// Crear y exportar el modelo
const ReservaMasaje = mongoose.model('ReservaMasaje', reservaMasajeSchema);
module.exports = ReservaMasaje; 