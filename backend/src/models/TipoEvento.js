const mongoose = require('mongoose');

const tipoEventoSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  imagen: {
    type: String,
    required: true
  },
  capacidad: {
    type: String,
    required: true
  },
  precio: {
    type: String,
    required: true
  },
  serviciosDisponibles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servicio'
  }],
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TipoEvento', tipoEventoSchema); 