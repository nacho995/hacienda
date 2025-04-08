const mongoose = require('mongoose');

const tipoHabitacionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del tipo de habitación es requerido'],
    enum: ['Sencilla', 'Doble', 'Triple', 'Cuadruple'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del tipo de habitación es requerida']
  },
  precio: {
    type: Number,
    required: [true, 'El precio del tipo de habitación es requerido']
  },
  capacidadAdultos: {
    type: Number,
    required: [true, 'La capacidad de adultos es requerida'],
    min: [1, 'Debe haber al menos un adulto']
  },
  capacidadNinos: {
    type: Number,
    default: 0
  },
  precioAdultoAdicional: {
    type: Number,
    default: 0
  },
  imagen: {
    type: String,
  },
  amenidades: [{
    type: String
  }],
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TipoHabitacion', tipoHabitacionSchema); 