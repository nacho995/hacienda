const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  general: {
    nombreSitio: { type: String, default: 'Hacienda San Carlos Borromeo' },
    direccion: { type: String, default: 'Carretera Nacional Km 123, Valle del Silencio' },
    telefono: { type: String, default: '+34 612 345 678' },
    email: { type: String, default: 'info@haciendasancarlos.com' },
    horarioAtencion: { type: String, default: 'Lunes a Viernes: 9:00 AM - 6:00 PM' },
    notificaciones: {
      nuevaReservacion: { type: Boolean, default: true },
      nuevoPago: { type: Boolean, default: true }
    }
  },
  reservacion: {
    minDiasAnticipacion: { type: Number, default: 14 },
    maxDiasAnticipacion: { type: Number, default: 180 },
    horaInicioDisponible: { type: String, default: '10:00' },
    horaFinDisponible: { type: String, default: '23:00' },
    tiempoMinimoEvento: { type: Number, default: 4 },
    diasNoDisponibles: [{ type: String }]
  },
  pagos: {
    requeridoAnticipo: { type: Boolean, default: true },
    porcentajeAnticipo: { type: Number, default: 30 },
    metodosAceptados: [{ type: String }],
    impuestos: { type: Number, default: 21 }
  },
  metadata: {
    siteTitle: { type: String, default: 'Hacienda San Carlos Borromeo - Bodas y Eventos Exclusivos' },
    siteDescription: { type: String, default: 'Hacienda histórica para celebrar bodas y eventos exclusivos en un entorno natural único.' },
    keywords: { type: String, default: 'bodas, eventos, hacienda, celebraciones, fincas para bodas' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Config', configSchema); 