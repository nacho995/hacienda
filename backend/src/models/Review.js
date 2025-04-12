const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio.'],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, 'La puntuación es obligatoria.'],
    min: [1, 'La puntuación mínima es 1.'],
    max: [5, 'La puntuación máxima es 5.'],
  },
  comment: {
    type: String,
    required: [true, 'El comentario es obligatorio.'],
    trim: true,
  },
  // Podríamos añadir un campo para el avatar si quisieras subir imágenes
  // avatar: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Podríamos enlazarlo a un usuario o reserva si fuera necesario
  // user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  // booking: { type: mongoose.Schema.ObjectId, ref: 'Booking' },
});

// Evitar reseñas duplicadas por la misma persona (opcional, ajustar según necesidad)
// reviewSchema.index({ name: 1, comment: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema); 