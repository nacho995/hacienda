require('dotenv').config();
const mongoose = require('mongoose');
const TipoEvento = require('../models/TipoEvento');

const MONGODB_URI = process.env.MONGODB_URI;

const tiposEvento = [
  {
    id: 'boda',
    titulo: 'Boda',
    descripcion: 'Celebra tu boda en nuestros elegantes espacios con vistas panorámicas',
    imagen: '/images/eventos/boda.jpg',
    capacidad: '50-200 personas',
    precio: 'Desde $50,000',
    serviciosDisponibles: ['Catering', 'Decoración', 'DJ', 'Fotografía', 'Coordinador de bodas', 'Iluminación']
  },
  {
    id: 'ceremonia-religiosa',
    titulo: 'Ceremonia Religiosa',
    descripcion: 'Celebra tu ceremonia religiosa en nuestra hermosa capilla o jardín',
    imagen: '/images/eventos/ceremonia-religiosa.jpg',
    capacidad: '20-150 personas',
    precio: 'Desde $30,000',
    serviciosDisponibles: ['Decoración floral', 'Música sacra', 'Fotografía', 'Coordinación ceremonial']
  },
  {
    id: 'evento-corporativo',
    titulo: 'Evento Corporativo',
    descripcion: 'Espacios versátiles para conferencias, reuniones y eventos empresariales',
    imagen: '/images/eventos/corporativo.jpg',
    capacidad: '20-180 personas',
    precio: 'Desde $35,000',
    serviciosDisponibles: ['Equipo audiovisual', 'Coffee break', 'Catering ejecutivo', 'Internet de alta velocidad']
  },
  {
    id: 'aniversario',
    titulo: 'Aniversario',
    descripcion: 'Celebra tus momentos especiales en un entorno único y memorable',
    imagen: '/images/eventos/aniversario.jpg',
    capacidad: '30-150 personas',
    precio: 'Desde $40,000',
    serviciosDisponibles: ['Decoración temática', 'Catering', 'DJ o música en vivo', 'Fotografía', 'Bar premium']
  },
  {
    id: 'cumpleanos',
    titulo: 'Cumpleaños',
    descripcion: 'Festeja tu cumpleaños con una celebración única y memorable',
    imagen: '/images/eventos/cumpleanos.jpg',
    capacidad: '20-100 personas',
    precio: 'Desde $25,000',
    serviciosDisponibles: ['Decoración personalizada', 'Catering', 'DJ', 'Fotografía', 'Pastel personalizado', 'Zona de juegos']
  }
];

async function seedTiposEvento() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Eliminar tipos de evento existentes
    await TipoEvento.deleteMany({});
    console.log('Tipos de evento existentes eliminados');

    // Insertar nuevos tipos de evento
    const tiposEventoCreados = await TipoEvento.insertMany(tiposEvento);
    console.log('Tipos de evento creados:', tiposEventoCreados);

    // Desconectar de MongoDB
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error al sembrar tipos de evento:', error);
    process.exit(1);
  }
}

seedTiposEvento();
