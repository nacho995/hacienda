const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true
  },
  precio: {
    type: String,
    required: true
  },
  // Tipo de icono para representación visual
  iconType: {
    type: String,
    required: true,
    enum: ['restaurante', 'decoracion', 'musica', 'fotografia', 'video', 'bebidas', 'flores', 'paquete', 'coctel', 'brunch', 'montaje', 'coordinacion', 'barra']
  },
  // Categoría principal del servicio
  categoria: {
    type: String,
    required: true,
    enum: ['paquete_evento', 'servicio_adicional', 'coctel_brunch', 'bebidas', 'montaje', 'foto_video', 'coordinacion']
  },
  // Subcategoría para clasificación más detallada
  subcategoria: {
    type: String,
    enum: ['basico', 'platinum', 'oro', 'comida', 'entretenimiento', 'comodidad', 'infraestructura', 'welcome_coctel', 'brunch', 'barra_libre', 'montaje_incluido', 'montaje_premium', 'bebidas', 'fotografia', 'video', 'coordinacion']
  },
  // Para qué tipo de eventos se recomienda este servicio
  recomendadoPara: {
    type: [String],
    default: []
  },
  // Color para representación visual
  color: {
    type: String,
    default: '#D1B59B'
  },
  // Si el servicio está activo o no
  activo: {
    type: Boolean,
    default: true
  },
  // Detalles adicionales en formato texto
  detalles: {
    type: String
  },
  // URL de la imagen representativa
  imagenUrl: {
    type: String
  },
  // Duración del servicio (si aplica)
  duracion: {
    type: String
  },
  // Lista de elementos incluidos en el servicio
  incluye: {
    type: [String],
    default: []
  },
  // Precios por rango de personas (para paquetes)
  preciosPorRango: [
    {
      rango: {
        min: { type: Number },
        max: { type: Number }
      },
      precio: { type: Number },
      precioFormateado: { type: String }
    }
  ],
  // Opciones de personalización disponibles
  opciones: [
    {
      nombre: { type: String },
      descripcion: { type: String },
      precio: { type: String },
      incluye: { type: [String], default: [] }
    }
  ],
  // Requisitos o condiciones especiales
  requisitos: {
    type: [String],
    default: []
  },
  // Notas importantes sobre el servicio
  notas: {
    type: [String],
    default: []
  },
  // Disponibilidad (días, horarios, etc.)
  disponibilidad: {
    type: String
  },
  // Tiempo de anticipación requerido para reservar
  tiempoAnticipacion: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Servicio', servicioSchema);
