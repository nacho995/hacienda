const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  // Configuración general
  nombreSitio: {
    type: String,
    default: 'Hacienda San Carlos Borromeo'
  },
  direccion: {
    type: String,
    default: ''
  },
  telefono: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  horarioAtencion: {
    type: String,
    default: '9:00 AM - 6:00 PM'
  },
  notificacionesEmail: {
    type: Boolean,
    default: true
  },
  
  // Configuración de reservaciones
  minDiasAnticipacion: {
    type: Number,
    default: 2
  },
  maxDiasAnticipacion: {
    type: Number,
    default: 90
  },
  horaInicioDisponible: {
    type: String,
    default: '09:00'
  },
  horaFinDisponible: {
    type: String,
    default: '18:00'
  },
  tiempoMinimoEvento: {
    type: Number,
    default: 4 // horas
  },
  diasNoDisponibles: [{
    type: Date
  }],
  
  // Configuración de pagos
  requeridoAnticipo: {
    type: Boolean,
    default: true
  },
  porcentajeAnticipo: {
    type: Number,
    default: 30
  },
  metodosAceptados: {
    type: [String],
    default: ['efectivo', 'transferencia']
  },
  impuestos: {
    type: Number,
    default: 16 // porcentaje
  },
  
  // Metadatos del sitio
  siteTitle: {
    type: String,
    default: 'Hacienda San Carlos Borromeo - Eventos y Hospedaje'
  },
  siteDescription: {
    type: String,
    default: 'Hacienda para eventos, bodas y hospedaje en un entorno único.'
  },
  keywords: {
    type: [String],
    default: ['hacienda', 'eventos', 'bodas', 'hospedaje']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Config', ConfigSchema); 