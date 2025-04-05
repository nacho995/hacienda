const mongoose = require('mongoose');

const baseReservaSchema = new mongoose.Schema({
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
  }
}, {
  discriminatorKey: 'tipoReserva'
});

// Método para generar número de confirmación
baseReservaSchema.pre('save', async function(next) {
  if (!this.numeroConfirmacion) {
    const prefix = this.tipoReserva.charAt(0).toUpperCase(); // E: Evento, M: Masaje, H: Habitación
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.numeroConfirmacion = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Métodos de utilidad para validación de fechas
baseReservaSchema.statics.validarFecha = function(fecha) {
  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) {
    throw new Error('Formato de fecha no válido');
  }
  return fechaObj;
};

baseReservaSchema.statics.validarRangoFechas = function(fechaInicio, fechaFin) {
  const fechaInicioObj = this.validarFecha(fechaInicio);
  const fechaFinObj = this.validarFecha(fechaFin);

  if (fechaFinObj <= fechaInicioObj) {
    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
  }

  return { fechaInicioObj, fechaFinObj };
};

baseReservaSchema.statics.convertirHoraAMinutos = function(hora) {
  if (!hora || !hora.includes(':')) {
    throw new Error('Formato de hora no válido');
  }
  const [horas, minutos] = hora.split(':').map(Number);
  if (isNaN(horas) || isNaN(minutos) || horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
    throw new Error('Hora no válida');
  }
  return horas * 60 + minutos;
};

// Métodos de utilidad para validación de solapamientos
baseReservaSchema.statics.haySolapamiento = function(inicio1, fin1, inicio2, fin2) {
  return (
    (inicio1 >= inicio2 && inicio1 < fin2) ||
    (fin1 > inicio2 && fin1 <= fin2) ||
    (inicio1 <= inicio2 && fin1 >= fin2)
  );
};

baseReservaSchema.statics.obtenerReservasEnFecha = async function(fecha, filtrosAdicionales = {}) {
  const fechaObj = this.validarFecha(fecha);
  return await this.find({
    fecha: {
      $gte: new Date(fechaObj.setHours(0, 0, 0)),
      $lt: new Date(fechaObj.setHours(23, 59, 59))
    },
    estadoReserva: { $nin: ['cancelada'] },
    ...filtrosAdicionales
  });
};

baseReservaSchema.statics.validarHorarioComercial = function(hora) {
  const minutos = this.convertirHoraAMinutos(hora);
  const inicioJornada = 9 * 60; // 9:00
  const finJornada = 21 * 60;   // 21:00

  if (minutos < inicioJornada || minutos > finJornada) {
    throw new Error('El horario debe estar entre las 9:00 y las 21:00');
  }
  return minutos;
};

module.exports = baseReservaSchema; 