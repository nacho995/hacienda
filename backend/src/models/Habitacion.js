const mongoose = require('mongoose');

const habitacionSchema = new mongoose.Schema({
  letra: {
    type: String,
    required: [true, 'La letra de identificación de la habitación es requerida'],
    unique: true,
    index: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre de la habitación es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción de la habitación es requerida']
  },
  tipoHabitacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TipoHabitacion',
    required: [true, 'El tipo de habitación es requerido']
  },
  camas: {
    type: String,
    required: [true, 'La descripción de las camas es requerida']
  },
  imagen: {
    type: String,
    required: [true, 'La imagen de la habitación es requerida']
  },
  imagenes: [{
    type: String
  }],
  amenidades: [{
    type: String
  }],
  estado: {
    type: String,
    enum: ['Disponible', 'No Disponible', 'Mantenimiento'],
    default: 'Disponible'
  },
  noches: {
    type: Number,
    default: 2
  },
  precioPorNoche: {
    type: Number,
    required: [true, 'El precio por noche es requerido']
  },
  totalHabitacion: {
    type: Number,
    required: [true, 'El precio total de la habitación es requerido']
  },
  especificaciones: {
    type: String
  },
  planta: {
    type: String,
    required: [true, 'La planta es requerida'],
    enum: ['Primera planta', 'Segunda planta', 'Tercera planta']
  },
  ubicacion: {
    type: String,
    required: [true, 'La ubicación es requerida']
  },
  capacidad: {
    type: Number,
    required: [true, 'La capacidad es requerida']
  },
  metrosCuadrados: {
    type: Number,
    required: [true, 'Los metros cuadrados son requeridos']
  },
  coordenadas: {
    x: {
      type: Number,
      required: [true, 'La coordenada X es requerida']
    },
    y: {
      type: Number,
      required: [true, 'La coordenada Y es requerida']
    }
  }
}, {
  timestamps: true
});

// Método para calcular el total de la habitación
habitacionSchema.pre('save', function(next) {
  if (this.precioPorNoche && this.noches) {
    this.totalHabitacion = this.precioPorNoche * this.noches;
  }
  next();
});

module.exports = mongoose.model('Habitacion', habitacionSchema);