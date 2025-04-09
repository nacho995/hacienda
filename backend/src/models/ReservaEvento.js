const mongoose = require('mongoose');
const baseReservaSchema = require('./BaseReserva');

// Definir el esquema de ReservaEvento directamente, incorporando los campos del esquema base
const reservaEventoSchema = new mongoose.Schema({
  // Campos del esquema base
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  asignadoA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  nombreContacto: {
    type: String,
    required: [true, 'Por favor, proporcione un nombre de contacto']
  },
  apellidosContacto: {
    type: String,
    required: [true, 'Por favor, proporcione los apellidos del contacto']
  },
  emailContacto: {
    type: String,
    required: [true, 'Por favor, proporcione un email de contacto'],
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Por favor, proporcione un email válido'
    ]
  },
  telefonoContacto: {
    type: String,
    required: [true, 'Por favor, proporcione un teléfono de contacto']
  },
  fecha: {
    type: Date,
    required: [true, 'Por favor, seleccione una fecha']
  },
  estadoReserva: {
    type: String,
    enum: ['pendiente', 'confirmada', 'pagada', 'cancelada', 'completada'],
    default: 'pendiente'
  },
  numeroConfirmacion: {
    type: String,
    unique: true
  },
  precio: {
    type: Number,
    required: true
  },
  metodoPago: {
    type: String,
    enum: ['tarjeta', 'transferencia', 'efectivo', 'pendiente'],
    default: 'pendiente'
  },
  adelanto: {
    type: Number,
    default: 0
  },
  peticionesEspeciales: {
    type: String,
    maxlength: [500, 'Las peticiones especiales no pueden tener más de 500 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Campos específicos de ReservaEvento
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
  modoGestionHabitaciones: {
    type: String,
    enum: ['usuario', 'hacienda'],
    default: 'usuario'
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
      precio: Number,
      reservaHabitacionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReservaHabitacion'
      }
    }]
  }
}, {
  timestamps: true
});

// Método para generar número de confirmación
reservaEventoSchema.pre('save', async function(next) {
  if (!this.numeroConfirmacion) {
    const prefix = 'E'; // E para Evento
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.numeroConfirmacion = `${prefix}${timestamp}${random}`;
    console.log(`Número de confirmación generado: ${this.numeroConfirmacion}`);
  }
  next();
});

// Copiar métodos estáticos del BaseReserva
reservaEventoSchema.statics.validarFecha = baseReservaSchema.statics.validarFecha;
reservaEventoSchema.statics.validarRangoFechas = baseReservaSchema.statics.validarRangoFechas;
reservaEventoSchema.statics.convertirHoraAMinutos = baseReservaSchema.statics.convertirHoraAMinutos;
reservaEventoSchema.statics.haySolapamiento = baseReservaSchema.statics.haySolapamiento;
reservaEventoSchema.statics.obtenerReservasEnFecha = baseReservaSchema.statics.obtenerReservasEnFecha;
reservaEventoSchema.statics.validarHorarioComercial = baseReservaSchema.statics.validarHorarioComercial;

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