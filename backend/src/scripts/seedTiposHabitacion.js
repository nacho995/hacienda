const mongoose = require('mongoose');
const TipoHabitacion = require('../models/TipoHabitacion');
require('dotenv').config();

const tiposHabitacion = [
  {
    nombre: 'Sencilla',
    descripcion: 'Habitación ideal para una persona, con todas las comodidades necesarias para una estancia placentera.',
    precio: 1500,
    capacidadAdultos: 1,
    capacidadNinos: 1,
    precioAdultoAdicional: 500,
    imagen: '/images/tipos-habitacion/sencilla.jpg',
    amenidades: [
      'Cama individual',
      'Baño privado',
      'TV por cable',
      'WiFi',
      'Aire acondicionado',
      'Escritorio de trabajo'
    ]
  },
  {
    nombre: 'Doble',
    descripcion: 'Espaciosa habitación con dos camas, perfecta para parejas o amigos viajando juntos.',
    precio: 2500,
    capacidadAdultos: 2,
    capacidadNinos: 2,
    precioAdultoAdicional: 750,
    imagen: '/images/tipos-habitacion/doble.jpg',
    amenidades: [
      'Dos camas matrimoniales',
      'Baño privado',
      'TV por cable',
      'WiFi',
      'Aire acondicionado',
      'Minibar',
      'Área de estar'
    ]
  },
  {
    nombre: 'Triple',
    descripcion: 'Amplia habitación familiar con tres camas, ideal para grupos pequeños o familias.',
    precio: 3500,
    capacidadAdultos: 3,
    capacidadNinos: 2,
    precioAdultoAdicional: 1000,
    imagen: '/images/tipos-habitacion/triple.jpg',
    amenidades: [
      'Tres camas individuales',
      'Baño privado',
      'TV por cable',
      'WiFi',
      'Aire acondicionado',
      'Minibar',
      'Área de estar',
      'Vista al jardín'
    ]
  },
  {
    nombre: 'Cuadruple',
    descripcion: 'Nuestra habitación más grande, perfecta para grupos grandes o familias numerosas.',
    precio: 4500,
    capacidadAdultos: 4,
    capacidadNinos: 3,
    precioAdultoAdicional: 1200,
    imagen: '/images/tipos-habitacion/cuadruple.jpg',
    amenidades: [
      'Dos camas matrimoniales y dos individuales',
      'Dos baños completos',
      'TV por cable',
      'WiFi',
      'Aire acondicionado',
      'Minibar',
      'Sala de estar',
      'Balcón privado',
      'Vista panorámica'
    ]
  }
];

async function seedTiposHabitacion() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conexión a MongoDB establecida');

    // Eliminar tipos de habitación existentes
    await TipoHabitacion.deleteMany({});
    console.log('Tipos de habitación existentes eliminados');

    // Insertar nuevos tipos de habitación
    const tiposCreados = await TipoHabitacion.create(tiposHabitacion);
    console.log(`${tiposCreados.length} tipos de habitación creados exitosamente`);

    await mongoose.disconnect();
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seeding:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedTiposHabitacion(); 