const mongoose = require('mongoose');
const baseReservaSchema = require('./BaseReserva');

// Crear un nuevo esquema que extiende del base
const reservaHabitacionSchema = baseReservaSchema.clone().add({
  habitacion: {
    type: String,
    required: [true, 'Por favor, seleccione una habitación']
  },
  tipoHabitacion: {
    type: String,
    required: [true, 'Por favor, seleccione un tipo de habitación'],
    // Permitir cualquier tipo de habitación, no solo los enumerados
    // Los IDs de MongoDB también pueden ser usados como tipos
    // enum: ['Individual', 'Doble', 'Suite', 'Premium']
  },
  fechaEntrada: {
    type: Date,
    required: [true, 'Por favor, seleccione una fecha de entrada']
  },
  fechaSalida: {
    type: Date,
    required: [true, 'Por favor, seleccione una fecha de salida']
  },
  numeroHabitaciones: {
    type: Number,
    required: [true, 'Por favor, indique el número de habitaciones'],
    min: [1, 'Debe reservar al menos una habitación'],
    default: 1
  },
  numHuespedes: {
    type: Number,
    required: [true, 'Por favor, indique el número de huéspedes'],
    min: [1, 'Debe haber al menos un huésped'],
    default: 2
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
    default: 'pendiente'
  },
  precioTotal: {
    type: Number,
    required: [true, 'El precio total es requerido'],
    default: 0
  },
  // Referencia al evento que contiene esta habitación (si existe)
  reservaEvento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReservaEvento',
    required: false
  }
});

// Establecer explícitamente el tipo de reserva para este modelo
reservaHabitacionSchema.pre('save', function(next) {
  // Asegurarnos de que tipoReserva esté establecido para el discriminador
  this.tipoReserva = 'Habitacion';
  next();
});

// Método estático para comprobar disponibilidad
reservaHabitacionSchema.statics.comprobarDisponibilidad = async function(habitacionId, fechaEntrada, fechaSalida) {
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
    estado: { $ne: 'cancelada' },
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
reservaHabitacionSchema.statics.obtenerDisponibilidadPorRango = async function(habitacionId, fechaInicio, fechaFin) {
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
    estado: { $ne: 'cancelada' },
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
reservaHabitacionSchema.statics.crearDesdeReservaEvento = async function(datosHabitacion, datosEvento, idReservaEvento) {
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
      precioTotal: precio * (datosHabitacion.numeroHabitaciones || 1),
      // Referencia al evento
      reservaEvento: idReservaEvento,
      tipoReserva: 'Habitacion',
      estadoReserva: 'pendiente',
      // Añadir el campo fecha requerido por BaseReserva (requerido)
      fecha: fechaEvento ? new Date(fechaEvento) : new Date(datosHabitacion.fechaEntrada)
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
const ReservaHabitacion = mongoose.model('ReservaHabitacion', reservaHabitacionSchema);
module.exports = ReservaHabitacion; 