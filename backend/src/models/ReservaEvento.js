const mongoose = require('mongoose');

const ReservaEventoSchema = new mongoose.Schema({
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
  nombreEvento: {
    type: String,
    required: [true, 'Por favor, proporcione un nombre para el evento']
  },
  tipoEvento: {
    type: String,
    required: [true, 'Por favor, seleccione un tipo de evento'],
    enum: ['Boda', 'Cumpleaños', 'Corporativo', 'Aniversario', 'Otro']
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
    required: [true, 'Por favor, seleccione una fecha para el evento']
  },
  horaInicio: {
    type: String,
    required: [true, 'Por favor, seleccione una hora de inicio']
  },
  horaFin: {
    type: String,
    required: [true, 'Por favor, seleccione una hora de finalización']
  },
  espacioSeleccionado: {
    type: String,
    required: [true, 'Por favor, seleccione un espacio'],
    enum: ['Jardín Principal', 'Salón Hacienda', 'Terraza', 'Patio Central', 'Sala VIP']
  },
  numeroInvitados: {
    type: Number,
    required: [true, 'Por favor, indique el número de invitados'],
    min: [10, 'El número mínimo de invitados es 10']
  },
  serviciosCatering: {
    type: Boolean,
    default: false
  },
  menuSeleccionado: {
    type: String,
    enum: ['Básico', 'Premium', 'Deluxe', 'Personalizado', 'No aplica'],
    default: 'No aplica'
  },
  serviciosAdicionales: {
    decoracion: {
      type: Boolean,
      default: false
    },
    musica: {
      type: Boolean,
      default: false
    },
    fotografo: {
      type: Boolean,
      default: false
    },
    transporte: {
      type: Boolean,
      default: false
    }
  },
  descripcionEvento: {
    type: String,
    maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres']
  },
  peticionesEspeciales: {
    type: String,
    maxlength: [500, 'Las peticiones especiales no pueden tener más de 500 caracteres']
  },
  presupuestoEstimado: {
    type: Number
  },
  estadoReserva: {
    type: String,
    enum: ['pendiente', 'confirmada', 'pagada', 'cancelada', 'completada'],
    default: 'pendiente'
  },
  adelanto: {
    type: Number,
    default: 0
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
  documentosAdjuntos: [
    {
      nombre: String,
      url: String,
      tipo: String,
      fechaSubida: {
        type: Date,
        default: Date.now
      }
    }
  ],
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
ReservaEventoSchema.statics.comprobarDisponibilidad = async function(
  espacioSeleccionado,
  fecha,
  horaInicio,
  horaFin,
  reservaIdExcluir = null
) {
  // Validar que el espacio seleccionado sea válido
  const espaciosValidos = ['Jardín Principal', 'Salón Hacienda', 'Terraza', 'Patio Central', 'Sala VIP'];
  if (!espaciosValidos.includes(espacioSeleccionado)) {
    return {
      disponible: false,
      mensaje: `Espacio no válido. Los espacios disponibles son: ${espaciosValidos.join(', ')}`
    };
  }
  
  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) {
    return {
      disponible: false,
      mensaje: 'La fecha proporcionada no es válida'
    };
  }
  
  const fechaFormateada = fechaObj.toISOString().split('T')[0];
  
  // Convertir horas a minutos para comparación
  const convertirAMinutos = (hora) => {
    if (!hora || !hora.includes(':')) {
      return 0;
    }
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  };
  
  const inicioMinutos = convertirAMinutos(horaInicio);
  const finMinutos = convertirAMinutos(horaFin);
  
  // Verificar que la hora de inicio es anterior a la hora de fin
  if (inicioMinutos >= finMinutos) {
    return {
      disponible: false,
      mensaje: 'La hora de inicio debe ser anterior a la hora de finalización'
    };
  }
  
  // Buscar reservas que se solapen en el mismo espacio y día
  const queryReservas = {
    espacioSeleccionado,
    estadoReserva: { $ne: 'cancelada' },
    fecha: {
      $gte: new Date(fechaFormateada),
      $lt: new Date(fechaFormateada + 'T23:59:59.999Z')
    }
  };
  
  // Si se proporciona un ID de reserva a excluir, añadirlo a la consulta
  if (reservaIdExcluir) {
    queryReservas._id = { $ne: reservaIdExcluir };
  }
  
  const reservas = await this.find(queryReservas);
  
  // Verificar solapamiento de horarios
  for (const reserva of reservas) {
    const reservaInicioMinutos = convertirAMinutos(reserva.horaInicio);
    const reservaFinMinutos = convertirAMinutos(reserva.horaFin);
    
    // Hay solapamiento si:
    // 1. La hora de inicio del nuevo evento está entre el inicio y fin del evento existente
    // 2. La hora de fin del nuevo evento está entre el inicio y fin del evento existente
    // 3. El nuevo evento engloba completamente al evento existente
    if (
      (inicioMinutos >= reservaInicioMinutos && inicioMinutos < reservaFinMinutos) ||
      (finMinutos > reservaInicioMinutos && finMinutos <= reservaFinMinutos) ||
      (inicioMinutos <= reservaInicioMinutos && finMinutos >= reservaFinMinutos)
    ) {
      return {
        disponible: false,
        mensaje: `Este espacio ya está reservado entre las ${reserva.horaInicio} y las ${reserva.horaFin}`
      };
    }
  }
  
  return {
    disponible: true,
    mensaje: 'El espacio está disponible para la fecha y hora seleccionadas'
  };
};

// Generar número de confirmación antes de guardar
ReservaEventoSchema.pre('save', async function(next) {
  if (!this.numeroConfirmacion) {
    // Formato: E + año + mes + día + 4 dígitos aleatorios
    const fecha = new Date();
    const ano = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const aleatorio = Math.floor(1000 + Math.random() * 9000);
    
    this.numeroConfirmacion = `E${ano}${mes}${dia}${aleatorio}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ReservaEvento', ReservaEventoSchema); 