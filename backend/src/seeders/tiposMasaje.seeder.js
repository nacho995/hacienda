const mongoose = require('mongoose');
const TipoMasaje = require('../models/TipoMasaje');

const tiposMasaje = [
  {
    titulo: 'Masaje Relajante',
    descripcion: 'Perfecto para aliviar el estrés y la tensión',
    duracion: '60 minutos',
    precio: 800,
    activo: true
  },
  {
    titulo: 'Masaje Descontracturante',
    descripcion: 'Ideal para dolores musculares específicos',
    duracion: '60 minutos',
    precio: 900,
    activo: true
  },
  {
    titulo: 'Masaje con Piedras Calientes',
    descripcion: 'Terapia con piedras volcánicas calientes',
    duracion: '90 minutos',
    precio: 1200,
    activo: true
  }
];

const seedTiposMasaje = async () => {
  try {
    const dbUrl = 'mongodb://localhost:27017/hacienda_db';
    await mongoose.connect(dbUrl);
    console.log('Conectado a MongoDB');

    // Eliminar tipos de masaje existentes
    await TipoMasaje.deleteMany({});
    console.log('Tipos de masaje eliminados');

    // Eliminar el índice del campo id si existe
    try {
      await mongoose.connection.db.collection('tipomasajes').dropIndex('id_1');
      console.log('Índice id_1 eliminado');
    } catch (error) {
      console.log('El índice id_1 no existía o no se pudo eliminar');
    }

    // Insertar nuevos tipos de masaje
    await TipoMasaje.insertMany(tiposMasaje);
    console.log('Tipos de masaje insertados correctamente');

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error al sembrar tipos de masaje:', error);
    process.exit(1);
  }
};

seedTiposMasaje(); 