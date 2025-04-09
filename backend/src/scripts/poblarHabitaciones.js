/**
 * Script para poblar la base de datos con las habitaciones según la tabla proporcionada
 */
const mongoose = require('mongoose');
const Habitacion = require('../models/Habitacion');
const TipoHabitacion = require('../models/TipoHabitacion');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conexión a MongoDB establecida'))
.catch(err => {
  console.error('Error al conectar a MongoDB:', err);
  process.exit(1);
});

// Datos de las habitaciones según la tabla
const habitacionesData = [
  { 
    letra: 'A', 
    nombre: 'Habitación A', 
    descripcion: 'Habitación con 1 cama king size', 
    tipo: 'Sencilla',
    camas: '1 cama king size', 
    capacidadAdultos: 2, 
    capacidadNinos: 0,
    precio: 2400,
    noches: 2,
    ubicacion: 'Edificio Principal'
  },
  { 
    letra: 'B', 
    nombre: 'Habitación B', 
    descripcion: 'Habitación con 1 cama king size', 
    tipo: 'Sencilla',
    camas: '1 cama king size', 
    capacidadAdultos: 2, 
    capacidadNinos: 0,
    precio: 2400,
    noches: 2,
    ubicacion: 'Edificio Principal'
  },
  { 
    letra: 'C', 
    nombre: 'Habitación C', 
    descripcion: 'Habitación con dos camas matrimoniales', 
    tipo: 'Doble',
    camas: 'Dos matrimoniales', 
    capacidadAdultos: 2, 
    capacidadNinos: 2,
    precio: 2450,
    noches: 2,
    ubicacion: 'Lateral'
  },
  { 
    letra: 'D', 
    nombre: 'Habitación D', 
    descripcion: 'Habitación con dos camas matrimoniales', 
    tipo: 'Doble',
    camas: 'Dos matrimoniales', 
    capacidadAdultos: 2, 
    capacidadNinos: 2,
    precio: 2450,
    noches: 2,
    ubicacion: 'Lateral'
  },
  { 
    letra: 'E', 
    nombre: 'Habitación E', 
    descripcion: 'Habitación con dos camas matrimoniales', 
    tipo: 'Doble',
    camas: 'Dos matrimoniales', 
    capacidadAdultos: 2, 
    capacidadNinos: 2,
    precio: 2450,
    noches: 2,
    ubicacion: 'Lateral'
  },
  { 
    letra: 'F', 
    nombre: 'Habitación F', 
    descripcion: 'Habitación con dos camas matrimoniales', 
    tipo: 'Doble',
    camas: 'Dos matrimoniales', 
    capacidadAdultos: 2, 
    capacidadNinos: 2,
    precio: 2450,
    noches: 2,
    ubicacion: 'Lateral'
  },
  { 
    letra: 'G', 
    nombre: 'Habitación G', 
    descripcion: 'Habitación con dos camas matrimoniales', 
    tipo: 'Doble',
    camas: 'Dos matrimoniales', 
    capacidadAdultos: 2, 
    capacidadNinos: 2,
    precio: 2450,
    noches: 2,
    ubicacion: 'Trasera'
  },
  { 
    letra: 'H', 
    nombre: 'Habitación H', 
    descripcion: 'Habitación con dos camas matrimoniales', 
    tipo: 'Doble',
    camas: 'Dos matrimoniales', 
    capacidadAdultos: 2, 
    capacidadNinos: 2,
    precio: 2450,
    noches: 2,
    ubicacion: 'Trasera'
  },
  { 
    letra: 'I', 
    nombre: 'Habitación I', 
    descripcion: 'Habitación con dos camas matrimoniales', 
    tipo: 'Doble',
    camas: 'Dos matrimoniales', 
    capacidadAdultos: 2, 
    capacidadNinos: 2,
    precio: 2450,
    noches: 2,
    ubicacion: 'Trasera'
  },
  { 
    letra: 'J', 
    nombre: 'Habitación J', 
    descripcion: 'Habitación con dos camas matrimoniales', 
    tipo: 'Doble',
    camas: 'Dos matrimoniales', 
    capacidadAdultos: 2, 
    capacidadNinos: 2,
    precio: 2450,
    noches: 2,
    ubicacion: 'Trasera'
  },
  { 
    letra: 'K', 
    nombre: 'Habitación K', 
    descripcion: 'Habitación con 1 cama king size', 
    tipo: 'Sencilla',
    camas: '1 cama king size', 
    capacidadAdultos: 2, 
    capacidadNinos: 0,
    precio: 2400,
    noches: 2,
    ubicacion: 'Lateral Izquierda'
  },
  { 
    letra: 'L', 
    nombre: 'Habitación L', 
    descripcion: 'Habitación con 1 cama king size', 
    tipo: 'Sencilla',
    camas: '1 cama king size', 
    capacidadAdultos: 2, 
    capacidadNinos: 0,
    precio: 2400,
    noches: 2,
    ubicacion: 'Lateral Izquierda'
  },
  { 
    letra: 'M', 
    nombre: 'Habitación M', 
    descripcion: 'Habitación con 1 cama king size y noche en cortesía en habitación especial', 
    tipo: 'Sencilla',
    camas: '1 cama king size', 
    capacidadAdultos: 2, 
    capacidadNinos: 0,
    precio: 2400,
    noches: 2,
    especificaciones: '1 noche en cortesía en hab. especial',
    ubicacion: 'Lateral Derecha'
  },
  { 
    letra: 'O', 
    nombre: 'Habitación O', 
    descripcion: 'Habitación con 1 cama king size', 
    tipo: 'Sencilla',
    camas: '1 cama king size', 
    capacidadAdultos: 2, 
    capacidadNinos: 0,
    precio: 2400,
    noches: 2,
    ubicacion: 'Lateral Derecha'
  }
];

// Función para crear o actualizar los tipos de habitación
async function crearTiposHabitacion() {
  const tiposHabitacion = {
    'Sencilla': {
      nombre: 'Sencilla',
      descripcion: 'Habitación con una cama king size',
      precio: 2400,
      capacidadAdultos: 2,
      capacidadNinos: 0,
      precioAdultoAdicional: 0,
      amenidades: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado']
    },
    'Doble': {
      nombre: 'Doble',
      descripcion: 'Habitación con dos camas matrimoniales',
      precio: 2450,
      capacidadAdultos: 2,
      capacidadNinos: 2,
      precioAdultoAdicional: 0,
      amenidades: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado']
    }
  };

  const tiposCreados = {};

  for (const [tipo, datos] of Object.entries(tiposHabitacion)) {
    // Buscar si ya existe
    let tipoExistente = await TipoHabitacion.findOne({ nombre: tipo });
    
    if (tipoExistente) {
      console.log(`Tipo de habitación ${tipo} ya existe, actualizando...`);
      tipoExistente = await TipoHabitacion.findOneAndUpdate(
        { nombre: tipo },
        datos,
        { new: true }
      );
      tiposCreados[tipo] = tipoExistente._id;
    } else {
      console.log(`Creando tipo de habitación ${tipo}...`);
      const nuevoTipo = await TipoHabitacion.create(datos);
      tiposCreados[tipo] = nuevoTipo._id;
    }
  }

  return tiposCreados;
}

// Función para crear o actualizar las habitaciones
async function crearHabitaciones(tiposHabitacion) {
  for (const habitacionData of habitacionesData) {
    try {
      // Buscar si ya existe
      const habitacionExistente = await Habitacion.findOne({ letra: habitacionData.letra });
      
      // Preparar datos completos
      const datosCompletos = {
        ...habitacionData,
        tipoHabitacion: tiposHabitacion[habitacionData.tipo],
        imagen: `/images/habitaciones/${habitacionData.tipo.toLowerCase()}.jpg`,
        imagenes: [
          `/images/habitaciones/${habitacionData.tipo.toLowerCase()}_1.jpg`,
          `/images/habitaciones/${habitacionData.tipo.toLowerCase()}_2.jpg`
        ],
        amenidades: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
        estado: 'Disponible',
        totalHabitacion: habitacionData.precio * habitacionData.noches,
        precioPorNoche: habitacionData.precio
      };
      
      if (habitacionExistente) {
        console.log(`Habitación ${habitacionData.letra} ya existe, actualizando...`);
        await Habitacion.findOneAndUpdate(
          { letra: habitacionData.letra },
          datosCompletos,
          { new: true }
        );
      } else {
        console.log(`Creando habitación ${habitacionData.letra}...`);
        await Habitacion.create(datosCompletos);
      }
    } catch (error) {
      console.error(`Error al crear/actualizar habitación ${habitacionData.letra}:`, error);
    }
  }
}

// Ejecutar el proceso
async function main() {
  try {
    // Crear tipos de habitación
    const tiposHabitacion = await crearTiposHabitacion();
    
    // Crear habitaciones
    await crearHabitaciones(tiposHabitacion);
    
    console.log('Proceso completado con éxito');
    process.exit(0);
  } catch (error) {
    console.error('Error en el proceso:', error);
    process.exit(1);
  }
}

main();
