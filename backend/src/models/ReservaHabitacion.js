const mongoose = require('mongoose');

// Definir el esquema de ReservaHabitacion directamente en lugar de extender de un base schema
const ReservaHabitacionSchema = new mongoose.Schema({
  habitacion: {
    type: String,
    required: [true, 'Por favor, proporcione un identificador para la habitación'],
    trim: true
  },
  tipoHabitacion: {
    type: String,
    required: [true, 'Por favor, proporcione el tipo de habitación'],
    trim: true
  },
  fechaEntrada: {
    type: Date,
    required: [true, 'Por favor, proporcione la fecha de entrada']
  },
  fechaSalida: {
    type: Date,
    required: [true, 'Por favor, proporcione la fecha de salida']
  },
  numeroHabitaciones: {
    type: Number,
    default: 1,
    min: [1, 'El número de habitaciones debe ser al menos 1']
  },
  numHuespedes: {
    type: Number,
    default: 2,
    min: [1, 'El número de huéspedes debe ser al menos 1']
  },
  precio: {
    type: Number,
    required: [true, 'Por favor, proporcione el precio de la habitación']
  },
  nombreContacto: {
    type: String,
    trim: true
  },
  apellidosContacto: {
    type: String,
    trim: true
  },
  emailContacto: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, proporcione un email válido'
    ]
  },
  telefonoContacto: {
    type: String,
    trim: true
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'pendiente'],
    default: 'pendiente',
    description: 'Método de pago seleccionado por el cliente'
  },
  estadoPago: {
    type: String,
    enum: ['pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'],
    default: 'pendiente',
    description: 'Estado actual del pago de la reserva'
  },
  fechaPago: {
    type: Date,
    default: null,
    description: 'Fecha en que se realizó el pago'
  },
  referenciaPago: {
    type: String,
    trim: true,
    description: 'Referencia o ID de transacción del pago'
  },
  estadoReserva: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
    default: 'pendiente'
  },
  fechaReserva: {
    type: Date,
    default: Date.now
  },
  // Nuevo campo para indicar si es una reserva de hotel independiente o está vinculada a un evento
  tipoReserva: {
    type: String,
    enum: ['hotel', 'evento'],
    default: 'hotel'
  },
  // Referencia al evento si la reserva está vinculada a uno
  reservaEvento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReservaEvento',
    default: null
  },
  // Indica si la reserva se realiza de forma independiente al evento
  esReservaIndependiente: {
    type: Boolean,
    default: true
  },
  notas: {
    type: String,
    trim: true
  },
  // Campo para saber quién creó la reserva
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Campo para saber si la reserva está asignada a algún usuario
  asignadoA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Categoría de la habitación
  categoriaHabitacion: {
    type: String,
    enum: ['sencilla', 'doble'],
    default: 'doble'
  },
  // Precio por noche (solo aplica en reservaciones individuales)
  precioPorNoche: {
    type: Number,
    default: 0
  },
  // Información de huéspedes para eventos (quiénes se hospedarán en la habitación)
  infoHuespedes: {
    nombres: [String],
    detalles: String
  },
  // Letra o número asignado a la habitación (ej: A, B, C...)
  letraHabitacion: {
    type: String
  },
  // Fecha del evento o reserva general (para compatibilidad)
  fecha: {
    type: Date,
    default: Date.now
  },
  // Número de confirmación único para cada reserva
  numeroConfirmacion: {
    type: String,
    sparse: true // Permite valores nulos pero asegura unicidad para valores no nulos
  }
}, {
  timestamps: true
});

// Método para generar número de confirmación antes de guardar
ReservaHabitacionSchema.pre('save', async function(next) {
  if (!this.numeroConfirmacion) {
    // Generar un número de confirmación único para la habitación
    const prefix = 'H'; // H para Habitación
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.numeroConfirmacion = `${prefix}${timestamp}${random}`;
    console.log(`Número de confirmación generado para habitación: ${this.numeroConfirmacion}`);
  }
  next();
});

// Método estático para comprobar disponibilidad
ReservaHabitacionSchema.statics.comprobarDisponibilidad = async function(habitacionId, fechaEntrada, fechaSalida) {
  // Validar fechas
  const fechaEntradaObj = new Date(fechaEntrada);
  const fechaSalidaObj = new Date(fechaSalida);

  if (isNaN(fechaEntradaObj.getTime()) || isNaN(fechaSalidaObj.getTime())) {
    throw new Error('Fechas inválidas');
  }

  if (fechaEntradaObj >= fechaSalidaObj) {
    throw new Error('La fecha de entrada debe ser anterior a la fecha de salida');
  }

  // Buscar reservas que se solapen
  const reservasExistentes = await this.find({
    habitacion: habitacionId,
    estadoReserva: { $ne: 'cancelada' },
    $or: [
      {
        fechaEntrada: { $lte: fechaSalidaObj },
        fechaSalida: { $gt: fechaEntradaObj }
      }
    ]
  });

  return {
    disponible: reservasExistentes.length === 0,
    reservasExistentes
  };
};

// Método para obtener disponibilidad por rango de fechas
ReservaHabitacionSchema.statics.obtenerDisponibilidadPorRango = async function(habitacionId, fechaInicio, fechaFin) {
  const fechaInicioObj = new Date(fechaInicio);
  const fechaFinObj = new Date(fechaFin);

  if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
    throw new Error('Fechas inválidas');
  }

  if (fechaInicioObj >= fechaFinObj) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha fin');
  }
  
  const reservas = await this.find({
    habitacion: habitacionId,
    estadoReserva: { $ne: 'cancelada' },
    $or: [
      {
        fechaEntrada: { $lte: fechaFinObj },
        fechaSalida: { $gt: fechaInicioObj }
      }
    ]
  }).sort('fechaEntrada');

  const diasOcupados = [];
  let fechaActual = new Date(fechaInicioObj);

  while (fechaActual <= fechaFinObj) {
    for (const reserva of reservas) {
      if (fechaActual >= reserva.fechaEntrada && fechaActual < reserva.fechaSalida) {
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

// Método estático para validar y procesar los datos de una habitación
ReservaHabitacionSchema.statics.crearDesdeReservaEvento = async function(datosHabitacion, datosEvento, idReservaEvento) {
  // Datos de contacto del evento
  const { 
    nombreContacto, 
    apellidosContacto, 
    emailContacto, 
    telefonoContacto, 
    fecha: fechaEvento 
  } = datosEvento;
  
  console.log('Creando habitación desde evento. Datos recibidos:', {
    datosHabitacion,
    contactoEvento: { nombreContacto, apellidosContacto, emailContacto, telefonoContacto },
    fechaEvento,
    idReservaEvento
  });

  try {
    // Validar datos mínimos necesarios
    if (!datosHabitacion.tipoHabitacion) {
      throw new Error('Tipo de habitación requerido');
    }
    
    if (!datosHabitacion.fechaEntrada || !datosHabitacion.fechaSalida) {
      throw new Error('Fechas de entrada y salida requeridas');
    }
    
    // Validar precio
    let precio = parseFloat(datosHabitacion.precio);
    if (isNaN(precio) || precio <= 0) {
      precio = 0; // Valor por defecto
      console.warn('Precio inválido, usando default:', datosHabitacion.precio);
    }
    
    // Generar número de confirmación único para esta habitación
    const prefix = 'H'; // H para Habitación
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const numeroConfirmacion = `${prefix}${timestamp}${random}`;
    
    // Crear objeto con todos los campos necesarios
    const habitacionValidada = {
      habitacion: datosHabitacion.nombre || 'Habitación sin nombre',
      tipoHabitacion: datosHabitacion.tipoHabitacion,
      fechaEntrada: new Date(datosHabitacion.fechaEntrada),
      fechaSalida: new Date(datosHabitacion.fechaSalida),
      numeroHabitaciones: datosHabitacion.numeroHabitaciones || 1,
      numHuespedes: datosHabitacion.numHuespedes || 2,
      nombreContacto: nombreContacto || '',
      apellidosContacto: apellidosContacto || '',
      emailContacto: emailContacto || '',
      telefonoContacto: telefonoContacto || '',
      precio: precio,
      // Referencia al evento
      reservaEvento: idReservaEvento,
      tipoReserva: 'evento',
      estadoReserva: 'pendiente',
      // Añadir el campo fecha requerido
      fecha: fechaEvento ? new Date(fechaEvento) : new Date(datosHabitacion.fechaEntrada),
      categoriaHabitacion: datosHabitacion.categoriaHabitacion || 'doble',
      precioPorNoche: datosHabitacion.precioPorNoche || 0,
      infoHuespedes: datosHabitacion.infoHuespedes || { nombres: [], detalles: '' },
      letraHabitacion: datosHabitacion.letraHabitacion || '',
      esReservaIndependiente: false,
      creadoPor: datosHabitacion.creadoPor || null,
      asignadoA: datosHabitacion.asignadoA || null,
      numeroConfirmacion: numeroConfirmacion
    };
    
    console.log('Objeto de habitación validado antes de crear:', habitacionValidada);
    
    // Crear la habitación en la base de datos
    const nuevaHabitacion = await this.create(habitacionValidada);
    console.log('Habitación creada correctamente:', nuevaHabitacion._id);
    return nuevaHabitacion;
  } catch (error) {
    console.error('Error al crear habitación desde evento:', error);
    throw error;
  }
};

// Crear y exportar el modelo
const ReservaHabitacion = mongoose.model('ReservaHabitacion', ReservaHabitacionSchema);
module.exports = ReservaHabitacion; 