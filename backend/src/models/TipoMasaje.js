const mongoose = require('mongoose');

const tipoMasajeSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  duracion: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TipoMasaje', tipoMasajeSchema); 