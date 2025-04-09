/**
 * Seeder para insertar las habitaciones
 */
const mongoose = require('mongoose');
const Habitacion = require('../models/Habitacion');
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
  console.log('Conectado a MongoDB para insertar habitaciones');

  try {
    // Eliminar todas las habitaciones existentes
    await Habitacion.deleteMany({});
    console.log('Habitaciones anteriores eliminadas');

    // Obtener los IDs de los tipos de habitaciones
    const tipoDoble = await TipoHabitacion.findOne({ nombre: 'Doble' });
    const tipoSencilla = await TipoHabitacion.findOne({ nombre: 'Sencilla' });

    if (!tipoDoble || !tipoSencilla) {
      console.error('No se encontraron los tipos de habitaciones necesarios. Por favor, ejecute primero el seeder de tipos de habitaciones.');
      process.exit(1);
    }

    // Datos de las habitaciones según las imágenes
    const habitaciones = [
      {
        nombre: 'Habitación A',
        descripcion: 'Habitación con una cama king size',
        tipoHabitacion: tipoSencilla._id,
        letra: 'A',
        camas: '1 cama king size',
        imagen: '/images/habitaciones/sencilla.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2400.00,
        totalHabitacion: 4800.00,
        especificaciones: '',
        planta: 'Primera planta',
        ubicacion: 'Ala derecha',
        capacidad: 2,
        metrosCuadrados: 25,
        coordenadas: {
          x: 10,
          y: 20
        }
      },
      {
        nombre: 'Habitación B',
        descripcion: 'Habitación con una cama king size',
        tipoHabitacion: tipoSencilla._id,
        letra: 'B',
        camas: '1 cama king size',
        imagen: '/images/habitaciones/sencilla.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2400.00,
        totalHabitacion: 4800.00,
        especificaciones: '',
        planta: 'Primera planta',
        ubicacion: 'Ala derecha',
        capacidad: 2,
        metrosCuadrados: 25,
        coordenadas: {
          x: 20,
          y: 20
        }
      },
      {
        nombre: 'Habitación C',
        descripcion: 'Habitación con dos camas matrimoniales',
        tipoHabitacion: tipoDoble._id,
        letra: 'C',
        camas: 'Dos matrimoniales',
        imagen: '/images/habitaciones/doble.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2450.00,
        totalHabitacion: 4900.00,
        especificaciones: '',
        planta: 'Primera planta',
        ubicacion: 'Ala izquierda',
        capacidad: 4,
        metrosCuadrados: 30,
        coordenadas: {
          x: 30,
          y: 20
        }
      },
      {
        nombre: 'Habitación D',
        descripcion: 'Habitación con dos camas matrimoniales',
        tipoHabitacion: tipoDoble._id,
        letra: 'D',
        camas: 'Dos matrimoniales',
        imagen: '/images/habitaciones/doble.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2450.00,
        totalHabitacion: 4900.00,
        especificaciones: '',
        planta: 'Primera planta',
        ubicacion: 'Ala izquierda',
        capacidad: 4,
        metrosCuadrados: 30,
        coordenadas: {
          x: 40,
          y: 20
        }
      },
      {
        nombre: 'Habitación E',
        descripcion: 'Habitación con dos camas matrimoniales',
        tipoHabitacion: tipoDoble._id,
        letra: 'E',
        camas: 'Dos matrimoniales',
        imagen: '/images/habitaciones/doble.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2450.00,
        totalHabitacion: 4900.00,
        especificaciones: '',
        planta: 'Segunda planta',
        ubicacion: 'Ala derecha',
        capacidad: 4,
        metrosCuadrados: 30,
        coordenadas: {
          x: 10,
          y: 40
        }
      },
      {
        nombre: 'Habitación F',
        descripcion: 'Habitación con dos camas matrimoniales',
        tipoHabitacion: tipoDoble._id,
        letra: 'F',
        camas: 'Dos matrimoniales',
        imagen: '/images/habitaciones/doble.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2450.00,
        totalHabitacion: 4900.00,
        especificaciones: '',
        planta: 'Segunda planta',
        ubicacion: 'Ala derecha',
        capacidad: 4,
        metrosCuadrados: 30,
        coordenadas: {
          x: 20,
          y: 40
        }
      },
      {
        nombre: 'Habitación G',
        descripcion: 'Habitación con dos camas matrimoniales',
        tipoHabitacion: tipoDoble._id,
        letra: 'G',
        camas: 'Dos matrimoniales',
        imagen: '/images/habitaciones/doble.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2450.00,
        totalHabitacion: 4900.00,
        especificaciones: '',
        planta: 'Segunda planta',
        ubicacion: 'Ala izquierda',
        capacidad: 4,
        metrosCuadrados: 30,
        coordenadas: {
          x: 30,
          y: 40
        }
      },
      {
        nombre: 'Habitación H',
        descripcion: 'Habitación con dos camas matrimoniales',
        tipoHabitacion: tipoDoble._id,
        letra: 'H',
        camas: 'Dos matrimoniales',
        imagen: '/images/habitaciones/doble.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2450.00,
        totalHabitacion: 4900.00,
        especificaciones: '',
        planta: 'Segunda planta',
        ubicacion: 'Ala izquierda',
        capacidad: 4,
        metrosCuadrados: 30,
        coordenadas: {
          x: 40,
          y: 40
        }
      },
      {
        nombre: 'Habitación I',
        descripcion: 'Habitación con dos camas matrimoniales',
        tipoHabitacion: tipoDoble._id,
        letra: 'I',
        camas: 'Dos matrimoniales',
        imagen: '/images/habitaciones/doble.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2450.00,
        totalHabitacion: 4900.00,
        especificaciones: '',
        planta: 'Tercera planta',
        ubicacion: 'Ala derecha',
        capacidad: 4,
        metrosCuadrados: 30,
        coordenadas: {
          x: 10,
          y: 60
        }
      },
      {
        nombre: 'Habitación J',
        descripcion: 'Habitación con dos camas matrimoniales',
        tipoHabitacion: tipoDoble._id,
        letra: 'J',
        camas: 'Dos matrimoniales',
        imagen: '/images/habitaciones/doble.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2450.00,
        totalHabitacion: 4900.00,
        especificaciones: '',
        planta: 'Tercera planta',
        ubicacion: 'Ala derecha',
        capacidad: 4,
        metrosCuadrados: 30,
        coordenadas: {
          x: 20,
          y: 60
        }
      },
      {
        nombre: 'Habitación K',
        descripcion: 'Habitación con una cama king size',
        tipoHabitacion: tipoSencilla._id,
        letra: 'K',
        camas: '1 cama king size',
        imagen: '/images/habitaciones/sencilla.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2400.00,
        totalHabitacion: 4800.00,
        especificaciones: '',
        planta: 'Tercera planta',
        ubicacion: 'Ala izquierda',
        capacidad: 2,
        metrosCuadrados: 25,
        coordenadas: {
          x: 30,
          y: 60
        }
      },
      {
        nombre: 'Habitación L',
        descripcion: 'Habitación con una cama king size',
        tipoHabitacion: tipoSencilla._id,
        letra: 'L',
        camas: '1 cama king size',
        imagen: '/images/habitaciones/sencilla.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2400.00,
        totalHabitacion: 4800.00,
        especificaciones: '',
        planta: 'Tercera planta',
        ubicacion: 'Ala izquierda',
        capacidad: 2,
        metrosCuadrados: 25,
        coordenadas: {
          x: 40,
          y: 60
        }
      },
      {
        nombre: 'Habitación M',
        descripcion: 'Habitación con una cama king size',
        tipoHabitacion: tipoSencilla._id,
        letra: 'M',
        camas: '1 cama king size',
        imagen: '/images/habitaciones/sencilla.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2400.00,
        totalHabitacion: 4800.00,
        especificaciones: '1 noche en cortesía en hab. Nupcial',
        planta: 'Primera planta',
        ubicacion: 'Ala derecha',
        capacidad: 2,
        metrosCuadrados: 25,
        coordenadas: {
          x: 50,
          y: 20
        }
      },
      {
        nombre: 'Habitación O',
        descripcion: 'Habitación con una cama king size',
        tipoHabitacion: tipoSencilla._id,
        letra: 'O',
        camas: '1 cama king size',
        imagen: '/images/habitaciones/sencilla.jpg',
        estado: 'Disponible',
        noches: 2,
        precioPorNoche: 2400.00,
        totalHabitacion: 4800.00,
        especificaciones: '',
        planta: 'Primera planta',
        ubicacion: 'Ala derecha',
        capacidad: 2,
        metrosCuadrados: 25,
        coordenadas: {
          x: 60,
          y: 20
        }
      }
    ];

    // Insertar las habitaciones
    const result = await Habitacion.insertMany(habitaciones);
    console.log(`${result.length} habitaciones insertadas con éxito`);

    // Cerrar la conexión a la base de datos
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
  } catch (error) {
    console.error('Error al insertar habitaciones:', error);
    process.exit(1);
  }
}); 