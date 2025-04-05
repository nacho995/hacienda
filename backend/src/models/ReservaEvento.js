const mongoose = require('mongoose');
const baseReservaSchema = require('./BaseReserva');

// Crear un nuevo esquema que extiende del base
const reservaEventoSchema = baseReservaSchema.clone().add({
  tipoReserva: {
    type: String,
    default: 'Evento',
    required: true
  },
  tipoEvento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TipoEvento',
    required: [true, 'Por favor, seleccione un tipo de evento']
  },
  nombreEvento: {
    type: String,
    required: [true, 'Por favor, proporcione un nombre para el evento']
  },
  horaInicio: {
    type: String,
    required: [true, 'Por favor, seleccione una hora de inicio']
  },
  horaFin: {
    type: String,
    required: [true, 'Por favor, seleccione una hora de fin']
  },
  numInvitados: {
    type: Number,
    required: [true, 'Por favor, indique el número de invitados'],
    min: [10, 'El número mínimo de invitados es 10']
  },
  espacioSeleccionado: {
    type: String,
    enum: ['salon', 'jardin', 'terraza'],
    required: [true, 'Por favor, seleccione un espacio']
  },
  serviciosAdicionales: {
    masajes: [{
      tipo: String,
      duracion: Number,
      precio: Number
    }],
    habitaciones: [{
      tipo: String,
      noches: Number,
      precio: Number
    }]
  }
});

// Método estático para comprobar disponibilidad
reservaEventoSchema.statics.comprobarDisponibilidad = async function(fecha, espacio, horaInicio, horaFin) {
  // Validar espacio
  if (!['salon', 'jardin', 'terraza'].includes(espacio)) {
    throw new Error('Espacio no válido');
  }

  // Validar fecha y horas
  const fechaReserva = this.validarFecha(fecha);
  const inicioSolicitado = this.validarHorarioComercial(horaInicio);
  const finSolicitado = this.validarHorarioComercial(horaFin);

  if (finSolicitado <= inicioSolicitado) {
    throw new Error('La hora de fin debe ser posterior a la hora de inicio');
  }

  // Buscar reservas para el mismo día y espacio
  const reservasExistentes = await this.obtenerReservasEnFecha(fechaReserva, {
    espacioSeleccionado: espacio
  });

  // Comprobar solapamiento con otras reservas
  for (const reserva of reservasExistentes) {
    const inicioExistente = this.convertirHoraAMinutos(reserva.horaInicio);
    const finExistente = this.convertirHoraAMinutos(reserva.horaFin);

    if (this.haySolapamiento(inicioSolicitado, finSolicitado, inicioExistente, finExistente)) {
      return false;
    }
  }

  return true;
};

// Crear y exportar el modelo
const ReservaEvento = mongoose.model('ReservaEvento', reservaEventoSchema);
module.exports = ReservaEvento; 