const mongoose = require('mongoose');
const TipoEvento = require('../models/TipoEvento');

const tiposEvento = [
  {
    id: 'boda',
    titulo: 'Boda',
    descripcion: 'Ceremonias inolvidables en un entorno de ensueño',
    imagen: '/images/placeholder/gallery1.svg',
    capacidad: '50-300',
    precio: 'Desde $50,000',
    serviciosDisponibles: ['masaje'],
    activo: true
  },
  {
    id: 'corporativo',
    titulo: 'Corporativo',
    descripcion: 'Reuniones ejecutivas, conferencias y presentaciones',
    imagen: '/images/placeholder/gallery2.svg',
    capacidad: '20-200',
    precio: 'Desde $35,000',
    serviciosDisponibles: ['masaje'],
    activo: true
  },
  {
    id: 'cumpleanos',
    titulo: 'Cumpleaños',
    descripcion: 'Celebraciones especiales con amigos y familia',
    imagen: '/images/placeholder/gallery3.svg',
    capacidad: '30-250',
    precio: 'Desde $40,000',
    serviciosDisponibles: ['masaje'],
    activo: true
  },
  {
    id: 'aniversario',
    titulo: 'Aniversario',
    descripcion: 'Conmemora tus momentos más importantes',
    imagen: '/images/placeholder/gallery1.svg',
    capacidad: '30-150',
    precio: 'Desde $30,000',
    serviciosDisponibles: ['masaje'],
    activo: true
  }
];

const seedTiposEvento = async () => {
  try {
    const dbUrl = 'mongodb://localhost:27017/hacienda_db';
    await mongoose.connect(dbUrl);
    console.log('Conectado a MongoDB');

    // Eliminar tipos de evento existentes
    await TipoEvento.deleteMany({});
    console.log('Tipos de evento eliminados');

    // Insertar nuevos tipos de evento
    await TipoEvento.insertMany(tiposEvento);
    console.log('Tipos de evento insertados correctamente');

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error al sembrar tipos de evento:', error);
    process.exit(1);
  }
};

seedTiposEvento(); 