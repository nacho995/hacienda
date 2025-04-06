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
    enum: [30, 60, 90, 120],
    default: 60
  },
  hora: {
    type: String,
    required: [true, 'Por favor, seleccione una hora para el masaje'],
    default: '10:00',
    validate: {
      validator: function(v) {
        return v && typeof v === 'string' && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} no es una hora válida! Use formato HH:MM`
    }
  },
  reservaEvento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReservaEvento'
  }
});

// Establecer explícitamente el tipo de reserva para este modelo
reservaMasajeSchema.pre('save', function(next) {
  // Asegurarnos de que tipoReserva esté establecido para el discriminador
  this.tipoReserva = 'Masaje';
  next();
});

// Método para sanear/validar una cadena
reservaMasajeSchema.statics.sanearTexto = function(texto) {
  // Si el texto es undefined o null, devolver cadena vacía
  if (texto === undefined || texto === null) {
    return '';
  }
  // Si no es una cadena, convertirlo a cadena
  if (typeof texto !== 'string') {
    return String(texto);
  }
  return texto;
};

// Métodos para validación 
reservaMasajeSchema.statics.validarFecha = function(fecha) {
  // Verificación adicional para evitar errores con undefined
  if (!fecha) {
    console.warn('Fecha indefinida, utilizando fecha actual');
    return new Date();
  }
  
  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      console.warn('Formato de fecha no válido, utilizando fecha actual');
      return new Date();
    }
    return fechaObj;
  } catch (error) {
    console.error('Error al procesar fecha:', error);
    return new Date();
  }
};

// Método estático para comprobar disponibilidad
reservaMasajeSchema.statics.comprobarDisponibilidad = async function(fecha, hora, duracion) {
  try {
    // Añadir valores por defecto para parámetros indefinidos
    fecha = fecha || new Date().toISOString().split('T')[0];
    hora = hora || '10:00';
    duracion = duracion || 60;
    
    // Validar duración
    if (![30, 60, 90, 120].includes(parseInt(duracion))) {
      console.warn(`Duración no válida: ${duracion}, utilizando 60 minutos por defecto`);
      duracion = 60;
    }

    // Validar fecha y hora con manejo de errores adicional
    let fechaReserva;
    try {
      fechaReserva = this.validarFecha(fecha);
    } catch (error) {
      console.error('Error al validar fecha:', error);
      fechaReserva = new Date();
    }
    
    let horaInicio;
    try {
      if (!hora || typeof hora !== 'string') {
        console.warn('Formato de hora inválido, utilizando 10:00 como valor por defecto');
        hora = '10:00';
      }
      horaInicio = this.validarHorarioComercial(hora);
    } catch (error) {
      console.error('Error al validar horario:', error);
      horaInicio = 10 * 60; // 10:00 AM en minutos
    }
    
    const horaFin = horaInicio + parseInt(duracion);

    if (horaFin > 21 * 60) { // No puede terminar después de las 21:00
      console.warn('El masaje no puede terminar después de las 21:00, ajustando hora de fin');
      return false;
    }

    // Buscar reservas para el mismo día con manejo de errores adicional
    let reservasExistentes = [];
    try {
      reservasExistentes = await this.obtenerReservasEnFecha(fechaReserva);
    } catch (error) {
      console.error('Error al obtener reservas existentes:', error);
      return false;
    }

    // Comprobar solapamiento con otras reservas
    for (const reserva of reservasExistentes) {
      try {
        const horaReserva = reserva.hora || '10:00';
        const duracionReserva = reserva.duracion || 60;
        
        const inicioExistente = this.convertirHoraAMinutos(horaReserva);
        const finExistente = inicioExistente + duracionReserva;

        if (this.haySolapamiento(horaInicio, horaFin, inicioExistente, finExistente)) {
          return false;
        }
      } catch (error) {
        console.error('Error al comprobar solapamiento:', error);
        // Si hay un error al procesar alguna reserva, asumimos que hay solapamiento por seguridad
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error general en comprobarDisponibilidad:', error);
    return false;
  }
};

// Crear y exportar el modelo
const ReservaMasaje = mongoose.model('ReservaMasaje', reservaMasajeSchema);
module.exports = ReservaMasaje; 