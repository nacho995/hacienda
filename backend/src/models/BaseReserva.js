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
    // Protección contra tipoReserva undefined
    let prefix = 'R'; // R: Reserva (valor por defecto)
    
    // Verificar si tipoReserva existe y es una cadena antes de usar charAt
    if (this.tipoReserva && typeof this.tipoReserva === 'string' && this.tipoReserva.length > 0) {
      prefix = this.tipoReserva.charAt(0).toUpperCase(); // E: Evento, M: Masaje, H: Habitación
    } else {
      // Intentar determinar el tipo por el modelo
      const modelName = this.constructor.modelName;
      console.log(`Generando número de confirmación para modelo: ${modelName}`);
      
      if (modelName === 'ReservaEvento') {
        prefix = 'E';
      } else if (modelName === 'ReservaMasaje') {
        prefix = 'M'; 
      } else if (modelName === 'ReservaHabitacion') {
        prefix = 'H';
      }
    }
    
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.numeroConfirmacion = `${prefix}${timestamp}${random}`;
    console.log(`Número de confirmación generado: ${this.numeroConfirmacion}`);
  }
  next();
});

// Métodos de utilidad para validación de fechas
baseReservaSchema.statics.validarFecha = function(fecha) {
  try {
    // Si fecha es undefined o null, devolver la fecha actual
    if (!fecha) {
      console.warn('Fecha no proporcionada, utilizando fecha actual');
      return new Date();
    }
    
    // Intentar convertir a objeto Date
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      console.warn(`Formato de fecha no válido: ${fecha}, utilizando fecha actual`);
      return new Date();
    }
    return fechaObj;
  } catch (error) {
    console.error(`Error al validar fecha: ${error.message}`, error);
    return new Date();
  }
};

baseReservaSchema.statics.validarRangoFechas = function(fechaInicio, fechaFin) {
  try {
    // Validar fechas individualmente con manejo de errores
    const fechaInicioObj = this.validarFecha(fechaInicio);
    const fechaFinObj = this.validarFecha(fechaFin);

    // Asegurarnos de que la fecha final es posterior a la inicial
    if (fechaFinObj <= fechaInicioObj) {
      console.warn('La fecha de fin debe ser posterior a la fecha de inicio, ajustando automáticamente');
      // Ajustar fecha fin para que sea un día después del inicio
      fechaFinObj.setDate(fechaInicioObj.getDate() + 1);
    }

    return { fechaInicioObj, fechaFinObj };
  } catch (error) {
    console.error(`Error al validar rango de fechas: ${error.message}`, error);
    // Crear un rango de fechas por defecto: hoy y mañana
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);
    return { fechaInicioObj: hoy, fechaFinObj: manana };
  }
};

baseReservaSchema.statics.convertirHoraAMinutos = function(hora) {
  // Validar que hora sea una cadena válida
  if (!hora || typeof hora !== 'string') {
    console.warn(`Hora inválida: ${hora}, usando 10:00 como valor por defecto`);
    hora = '10:00';
  }
  
  // Verificar formato de hora antes de usar split
  if (!hora.includes(':')) {
    console.warn(`Formato de hora incorrecto: ${hora}, usando 10:00 como valor por defecto`);
    hora = '10:00';
  }
  
  try {
    const [horas, minutos] = hora.split(':').map(Number);
    if (isNaN(horas) || isNaN(minutos) || horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
      console.warn(`Componentes de hora inválidos: ${horas}:${minutos}, usando 10:00 como valor por defecto`);
      return 10 * 60; // 10:00 AM en minutos
    }
    return horas * 60 + minutos;
  } catch (error) {
    console.error(`Error al convertir hora a minutos: ${error.message}`, error);
    return 10 * 60; // 10:00 AM en minutos como valor por defecto
  }
};

// Métodos de utilidad para validación de solapamientos
baseReservaSchema.statics.haySolapamiento = function(inicio1, fin1, inicio2, fin2) {
  try {
    // Validar que los parámetros sean números
    inicio1 = Number(inicio1) || 0;
    fin1 = Number(fin1) || 0;
    inicio2 = Number(inicio2) || 0;
    fin2 = Number(fin2) || 0;
    
    return (
      (inicio1 >= inicio2 && inicio1 < fin2) ||
      (fin1 > inicio2 && fin1 <= fin2) ||
      (inicio1 <= inicio2 && fin1 >= fin2)
    );
  } catch (error) {
    console.error(`Error al comprobar solapamiento: ${error.message}`, error);
    // Por seguridad, asumimos que hay solapamiento en caso de error
    return true;
  }
};

baseReservaSchema.statics.obtenerReservasEnFecha = async function(fecha, filtrosAdicionales = {}) {
  try {
    // Validar la fecha
    const fechaObj = this.validarFecha(fecha);
    
    // Crear objetos Date para el inicio y final del día
    const inicioDia = new Date(fechaObj);
    inicioDia.setHours(0, 0, 0, 0);
    
    const finDia = new Date(fechaObj);
    finDia.setHours(23, 59, 59, 999);
    
    // Construir la consulta
    const consulta = {
      fecha: {
        $gte: inicioDia,
        $lt: finDia
      },
      estadoReserva: { $nin: ['cancelada'] },
      ...filtrosAdicionales
    };
    
    return await this.find(consulta);
  } catch (error) {
    console.error(`Error al obtener reservas en fecha: ${error.message}`, error);
    // Devolver un array vacío en caso de error
    return [];
  }
};

baseReservaSchema.statics.validarHorarioComercial = function(hora) {
  try {
    // Validar que hora sea una cadena válida
    if (!hora || typeof hora !== 'string') {
      console.warn(`Hora inválida: ${hora}, usando 10:00 como valor por defecto`);
      hora = '10:00';
    }
    
    const minutos = this.convertirHoraAMinutos(hora);
    const inicioJornada = 9 * 60; // 9:00
    const finJornada = 21 * 60;   // 21:00

    if (minutos < inicioJornada || minutos > finJornada) {
      console.warn(`Hora fuera del horario comercial: ${hora}, ajustando al horario comercial`);
      return (minutos < inicioJornada) ? inicioJornada : finJornada;
    }
    return minutos;
  } catch (error) {
    console.error(`Error al validar horario comercial: ${error.message}`, error);
    return 10 * 60; // 10:00 AM en minutos como valor por defecto
  }
};

module.exports = baseReservaSchema; 