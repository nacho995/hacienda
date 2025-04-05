const mongoose = require('mongoose');

const habitacionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la habitación es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción de la habitación es requerida']
  },
  tipo: {
    type: String,
    required: [true, 'El tipo de habitación es requerido'],
    enum: ['Individual', 'Doble', 'Suite', 'Premium']
  },
  precio: {
    type: Number,
    required: [true, 'El precio de la habitación es requerido']
  },
  capacidad: {
    type: Number,
    required: [true, 'La capacidad de la habitación es requerida']
  },
  tamaño: {
    type: String,
    required: [true, 'El tamaño de la habitación es requerido']
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
  numeroHabitacion: {
    type: String,
    required: [true, 'El número de habitación es requerido'],
    unique: true
  },
  totalDisponibles: {
    type: Number,
    required: [true, 'El número total de habitaciones disponibles es requerido'],
    min: [1, 'Debe haber al menos una habitación disponible']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Habitacion', habitacionSchema); 