const mongoose = require('mongoose');

const ReservaHabitacionSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  asignadoA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  nombre: {
    type: String,
    required: [true, 'Por favor, proporcione su nombre']
  },
  apellidos: {
    type: String,
    required: [true, 'Por favor, proporcione sus apellidos']
  },
  email: {
    type: String,
    required: [true, 'Por favor, proporcione un email'],
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Por favor, proporcione un email válido'
    ]
  },
  telefono: {
    type: String,
    required: [true, 'Por favor, proporcione un número de teléfono']
  },
  tipoHabitacion: {
    type: String,
    required: [true, 'Por favor, seleccione un tipo de habitación'],
    enum: ['Individual', 'Doble', 'Suite', 'Premium']
  },
  habitacion: {
    type: String,
    required: [true, 'Por favor, seleccione una habitación específica']
  },
  numeroHabitaciones: {
    type: Number,
    required: [true, 'Por favor, indique el número de habitaciones'],
    min: [1, 'Debe reservar al menos una habitación']
  },
  fechaEntrada: {
    type: Date,
    required: [true, 'Por favor, seleccione una fecha de entrada']
  },
  fechaSalida: {
    type: Date,
    required: [true, 'Por favor, seleccione una fecha de salida']
  },
  numeroAdultos: {
    type: Number,
    required: [true, 'Por favor, indique el número de adultos'],
    min: [1, 'Debe haber al menos un adulto']
  },
  numeroNinos: {
    type: Number,
    default: 0
  },
  serviciosAdicionales: {
    desayuno: {
      type: Boolean,
      default: false
    },
    parking: {
      type: Boolean,
      default: false
    },
    mascotas: {
      type: Boolean,
      default: false
    },
    spa: {
      type: Boolean,
      default: false
    }
  },
  peticionesEspeciales: {
    type: String,
    maxlength: [500, 'Las peticiones especiales no pueden tener más de 500 caracteres']
  },
  precioTotal: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
    default: 'pendiente'
  },
  metodoPago: {
    type: String,
    enum: ['tarjeta', 'transferencia', 'efectivo', 'pendiente'],
    default: 'pendiente'
  },
  numeroConfirmacion: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Método estático para comprobar disponibilidad
ReservaHabitacionSchema.statics.comprobarDisponibilidad = async function(
  tipoHabitacion,
  fechaEntrada,
  fechaSalida,
  numeroHabitaciones = 1
) {
  const habitacionesDisponibles = {
    'Individual': 10,
    'Doble': 15,
    'Suite': 5,
    'Premium': 3
  };

  const fechaInicioObj = new Date(fechaEntrada);
  const fechaFinObj = new Date(fechaSalida);

  // Comprobar que la fecha de entrada es anterior a la de salida
  if (fechaInicioObj >= fechaFinObj) {
    return {
      disponible: false,
      mensaje: 'La fecha de entrada debe ser anterior a la fecha de salida'
    };
  }

  // Buscar reservas que se solapen con las fechas proporcionadas
  const reservas = await this.find({
    tipoHabitacion,
    estado: { $ne: 'cancelada' },
    $or: [
      {
        fechaEntrada: { $lte: fechaSalida },
        fechaSalida: { $gte: fechaEntrada }
      }
    ]
  });

  // Calcular habitaciones totales reservadas para ese periodo
  let habitacionesReservadas = 0;
  reservas.forEach(reserva => {
    habitacionesReservadas += reserva.numeroHabitaciones;
  });

  // Verificar disponibilidad
  const habitacionesRestantes = habitacionesDisponibles[tipoHabitacion] - habitacionesReservadas;
  
  return {
    disponible: habitacionesRestantes >= numeroHabitaciones,
    habitacionesRestantes,
    mensaje: habitacionesRestantes >= numeroHabitaciones
      ? `Hay ${habitacionesRestantes} habitaciones disponibles`
      : `Lo sentimos, solo quedan ${habitacionesRestantes} habitaciones disponibles`
  };
};

// Generar número de confirmación antes de guardar
ReservaHabitacionSchema.pre('save', async function(next) {
  if (!this.numeroConfirmacion) {
    // Formato: H + año + mes + día + 4 dígitos aleatorios
    const fecha = new Date();
    const ano = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const aleatorio = Math.floor(1000 + Math.random() * 9000);
    
    this.numeroConfirmacion = `H${ano}${mes}${dia}${aleatorio}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ReservaHabitacion', ReservaHabitacionSchema); 