const mongoose = require('mongoose');

const ReservaMasajeSchema = new mongoose.Schema({
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
  tipoMasaje: {
    type: String,
    required: [true, 'Por favor, seleccione un tipo de masaje'],
    enum: ['Relajante', 'Descontracturante', 'Deportivo', 'Aromaterapia', 'Piedras Calientes', 'Tailandés', 'Balinés']
  },
  duracion: {
    type: Number,
    required: [true, 'Por favor, seleccione la duración del masaje'],
    enum: [30, 60, 90, 120],
    default: 60
  },
  fecha: {
    type: Date,
    required: [true, 'Por favor, seleccione una fecha']
  },
  hora: {
    type: String,
    required: [true, 'Por favor, seleccione una hora']
  },
  numeroPersonas: {
    type: Number,
    required: [true, 'Por favor, indique el número de personas'],
    min: [1, 'Debe haber al menos una persona'],
    default: 1
  },
  terapeutaPreferido: {
    type: String,
    enum: ['Sin preferencia', 'Masculino', 'Femenino'],
    default: 'Sin preferencia'
  },
  estaHospedado: {
    type: Boolean,
    default: false
  },
  habitacion: {
    type: String,
    default: ''
  },
  condicionesMedicas: {
    type: String,
    maxlength: [500, 'Las condiciones médicas no pueden tener más de 500 caracteres']
  },
  areasFoco: {
    espalda: {
      type: Boolean,
      default: false
    },
    piernas: {
      type: Boolean,
      default: false
    },
    cuello: {
      type: Boolean,
      default: false
    },
    hombros: {
      type: Boolean,
      default: false
    },
    pies: {
      type: Boolean,
      default: false
    }
  },
  serviciosAdicionales: {
    exfoliacion: {
      type: Boolean,
      default: false
    },
    aromaterapia: {
      type: Boolean,
      default: false
    },
    hidroterapia: {
      type: Boolean,
      default: false
    }
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
    enum: ['tarjeta', 'transferencia', 'efectivo', 'cargo a habitación', 'pendiente'],
    default: 'pendiente'
  },
  numeroConfirmacion: {
    type: String,
    unique: true
  },
  observaciones: {
    type: String,
    maxlength: [500, 'Las observaciones no pueden tener más de 500 caracteres']
  },
  terapeuta: {
    nombre: String,
    id: String
  },
  calificacion: {
    puntuacion: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    comentario: String,
    fecha: Date
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
ReservaMasajeSchema.statics.comprobarDisponibilidad = async function(
  fecha,
  hora,
  duracion = 60,
  numeroPersonas = 1
) {
  const fechaObj = new Date(fecha);
  const fechaFormateada = fechaObj.toISOString().split('T')[0];
  
  // Convertir horas a minutos para comparación
  const convertirAMinutos = (hora) => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  };
  
  const horaInicioMinutos = convertirAMinutos(hora);
  const horaFinMinutos = horaInicioMinutos + duracion;
  
  // Capacidad máxima por hora (número de terapeutas disponibles)
  const capacidadMaxima = 3;
  
  // Buscar reservas que se solapen en el mismo día y hora
  const reservas = await this.find({
    estado: { $ne: 'cancelada' },
    fecha: {
      $gte: new Date(fechaFormateada),
      $lt: new Date(fechaFormateada + 'T23:59:59.999Z')
    }
  });
  
  // Contar terapeutas ocupados en cada intervalo de tiempo
  let terapeutasOcupados = 0;
  
  for (const reserva of reservas) {
    const reservaInicioMinutos = convertirAMinutos(reserva.hora);
    const reservaFinMinutos = reservaInicioMinutos + reserva.duracion;
    
    // Si hay solapamiento de horarios
    if (
      (horaInicioMinutos < reservaFinMinutos && horaFinMinutos > reservaInicioMinutos)
    ) {
      terapeutasOcupados += reserva.numeroPersonas;
    }
  }
  
  // Verificar si hay suficientes terapeutas disponibles
  const terapeutasDisponibles = capacidadMaxima - terapeutasOcupados;
  
  return {
    disponible: terapeutasDisponibles >= numeroPersonas,
    terapeutasDisponibles,
    mensaje: terapeutasDisponibles >= numeroPersonas
      ? `Hay ${terapeutasDisponibles} terapeutas disponibles en ese horario`
      : `Lo sentimos, solo quedan ${terapeutasDisponibles} terapeutas disponibles en ese horario`
  };
};

// Generar número de confirmación antes de guardar
ReservaMasajeSchema.pre('save', async function(next) {
  if (!this.numeroConfirmacion) {
    // Formato: M + año + mes + día + 4 dígitos aleatorios
    const fecha = new Date();
    const ano = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const aleatorio = Math.floor(1000 + Math.random() * 9000);
    
    this.numeroConfirmacion = `M${ano}${mes}${dia}${aleatorio}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ReservaMasaje', ReservaMasajeSchema); 