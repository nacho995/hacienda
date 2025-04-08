/**
 * Seeder para insertar los tipos de habitaciones
 */
const mongoose = require('mongoose');
const TipoHabitacion = require('../models/TipoHabitacion');
require('dotenv').config({ path: './.env' });

// Conectarse a la base de datos
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión:'));
db.once('open', async () => {
  console.log('Conectado a MongoDB para insertar tipos de habitaciones');

  try {
    // Eliminar todos los tipos de habitaciones existentes
    await TipoHabitacion.deleteMany({});
    console.log('Tipos de habitaciones anteriores eliminados');

    // Datos de los tipos de habitaciones según las imágenes
    const tiposHabitacion = [
      {
        nombre: 'Doble',
        descripcion: 'Habitación para 2 adultos y 2 niños con dos camas matrimoniales',
        precio: 2450.00,
        capacidadAdultos: 2,
        capacidadNinos: 2,
        precioAdultoAdicional: 350.00,
        amenidades: ['Wifi', 'TV', 'Aire acondicionado', 'Baño privado'],
        activo: true
      },
      {
        nombre: 'Sencilla',
        descripcion: 'Habitación para 2 adultos con 1 cama king size',
        precio: 2400.00,
        capacidadAdultos: 2,
        capacidadNinos: 0,
        precioAdultoAdicional: 350.00,
        amenidades: ['Wifi', 'TV', 'Aire acondicionado', 'Baño privado'],
        activo: true
      },
      {
        nombre: 'Triple',
        descripcion: 'Habitación para 3 adultos',
        precio: 2450.00,
        capacidadAdultos: 3,
        capacidadNinos: 0,
        precioAdultoAdicional: 350.00,
        amenidades: ['Wifi', 'TV', 'Aire acondicionado', 'Baño privado'],
        activo: true
      },
      {
        nombre: 'Cuadruple',
        descripcion: 'Habitación para 4 adultos',
        precio: 2500.00,
        capacidadAdultos: 4,
        capacidadNinos: 0,
        precioAdultoAdicional: 350.00,
        amenidades: ['Wifi', 'TV', 'Aire acondicionado', 'Baño privado'],
        activo: true
      }
    ];

    // Insertar los tipos de habitaciones
    const result = await TipoHabitacion.insertMany(tiposHabitacion);
    console.log(`${result.length} tipos de habitaciones insertados con éxito`);

    // Cerrar la conexión a la base de datos
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
  } catch (error) {
    console.error('Error al insertar tipos de habitaciones:', error);
    process.exit(1);
  }
}); 