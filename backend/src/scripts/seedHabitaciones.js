require('dotenv').config();
const mongoose = require('mongoose');
const Habitacion = require('../models/Habitacion');

// Mapeo de tipos de habitación a cantidad total disponible
const tiposHabitacion = {
  'Individual': 2,
  'Doble': 4,
  'Suite': 4,
  'Premium': 4
};

const habitaciones = [
  {
    nombre: "Suite Hacienda Principal",
    descripcion: "Elegante suite con vistas panorámicas a los jardines, decorada con muebles de época y detalles auténticos de hacienda mexicana.",
    tipo: "Premium",
    precio: 3500,
    capacidad: 2,
    tamaño: "45m²",
    camas: "1 King Size",
    imagen: "/images/placeholder/room1.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Aire acondicionado",
      "Baño privado de lujo",
      "Artículos de tocador premium",
      "Vista panorámica",
      "Sala de estar"
    ],
    numeroHabitacion: "P101",
    totalDisponibles: 4
  },
  {
    nombre: "Suite Tradición Colonial",
    descripcion: "Espaciosa habitación con elementos coloniales, techos altos y una combinación perfecta entre la comodidad moderna y el encanto histórico.",
    tipo: "Suite",
    precio: 2800,
    capacidad: 2,
    tamaño: "38m²",
    camas: "1 Queen Size",
    imagen: "/images/placeholder/room2.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Aire acondicionado",
      "Baño privado",
      "Terraza privada"
    ],
    numeroHabitacion: "S201",
    totalDisponibles: 4
  },
  {
    nombre: "Habitación Deluxe Jardín",
    descripcion: "Acogedora habitación con acceso directo a los jardines, ideal para disfrutar de la tranquilidad y belleza natural de la hacienda.",
    tipo: "Doble",
    precio: 2400,
    capacidad: 2,
    tamaño: "32m²",
    camas: "2 Individuales o 1 King Size",
    imagen: "/images/placeholder/room3.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Aire acondicionado",
      "Baño privado",
      "Vista al jardín"
    ],
    numeroHabitacion: "D301",
    totalDisponibles: 4
  },
  {
    nombre: "Suite Familiar Hacienda",
    descripcion: "Amplia suite diseñada para familias, con espacios separados y todas las comodidades para una estancia inolvidable en un entorno histórico.",
    tipo: "Premium",
    precio: 4200,
    capacidad: 4,
    tamaño: "60m²",
    camas: "1 King Size + 2 Individuales",
    imagen: "/images/placeholder/room4.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Aire acondicionado",
      "2 Baños privados",
      "Sala de estar",
      "Minibar"
    ],
    numeroHabitacion: "P102",
    totalDisponibles: 4
  },
  // Habitaciones adicionales para llegar a 14
  {
    nombre: "Suite Luna de Miel",
    descripcion: "Suite romántica con decoración especial, perfecta para parejas en su luna de miel o celebrando ocasiones especiales.",
    tipo: "Premium",
    precio: 3800,
    capacidad: 2,
    tamaño: "50m²",
    camas: "1 King Size",
    imagen: "/images/placeholder/room1.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Jacuzzi privado",
      "Champagne de bienvenida",
      "Pétalos de rosa",
      "Terraza privada"
    ],
    numeroHabitacion: "P103",
    totalDisponibles: 4
  },
  {
    nombre: "Habitación Doble Superior",
    descripcion: "Habitación espaciosa con dos camas, ideal para amigos o familias pequeñas que buscan comodidad y estilo.",
    tipo: "Doble",
    precio: 2600,
    capacidad: 3,
    tamaño: "35m²",
    camas: "2 Queen Size",
    imagen: "/images/placeholder/room2.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Aire acondicionado",
      "Baño privado",
      "Escritorio"
    ],
    numeroHabitacion: "D302",
    totalDisponibles: 4
  },
  {
    nombre: "Suite Ejecutiva",
    descripcion: "Suite diseñada para viajeros de negocios, con área de trabajo y todas las comodidades necesarias para una estancia productiva.",
    tipo: "Suite",
    precio: 3000,
    capacidad: 2,
    tamaño: "40m²",
    camas: "1 King Size",
    imagen: "/images/placeholder/room3.jpg.svg",
    amenidades: [
      "WiFi de alta velocidad",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Escritorio ejecutivo",
      "Cafetera Nespresso",
      "Caja fuerte laptop"
    ],
    numeroHabitacion: "S202",
    totalDisponibles: 4
  },
  {
    nombre: "Habitación Individual Confort",
    descripcion: "Habitación individual con diseño moderno y funcional, perfecta para viajeros solitarios que buscan comodidad.",
    tipo: "Individual",
    precio: 1800,
    capacidad: 1,
    tamaño: "25m²",
    camas: "1 Queen Size",
    imagen: "/images/placeholder/room4.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Aire acondicionado",
      "Baño privado",
      "Escritorio"
    ],
    numeroHabitacion: "I401",
    totalDisponibles: 2
  },
  {
    nombre: "Suite Vista Jardín",
    descripcion: "Suite con impresionantes vistas al jardín de la hacienda, decorada con un estilo colonial contemporáneo.",
    tipo: "Suite",
    precio: 2900,
    capacidad: 2,
    tamaño: "42m²",
    camas: "1 King Size",
    imagen: "/images/placeholder/room1.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Balcón privado",
      "Área de estar",
      "Minibar"
    ],
    numeroHabitacion: "S203",
    totalDisponibles: 4
  },
  {
    nombre: "Habitación Doble Clásica",
    descripcion: "Habitación tradicional con dos camas, que combina el encanto colonial con comodidades modernas.",
    tipo: "Doble",
    precio: 2200,
    capacidad: 2,
    tamaño: "30m²",
    camas: "2 Individuales",
    imagen: "/images/placeholder/room2.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Aire acondicionado",
      "Baño privado"
    ],
    numeroHabitacion: "D303",
    totalDisponibles: 4
  },
  {
    nombre: "Suite Premium Plus",
    descripcion: "La suite más exclusiva de la hacienda, con servicios premium y atención personalizada.",
    tipo: "Premium",
    precio: 4500,
    capacidad: 3,
    tamaño: "65m²",
    camas: "1 King Size + 1 Sofá cama",
    imagen: "/images/placeholder/room3.jpg.svg",
    amenidades: [
      "WiFi de alta velocidad",
      "Desayuno gourmet incluido",
      "TV de pantalla plana",
      "Sala de estar separada",
      "Jacuzzi",
      "Servicio de mayordomo",
      "Minibar premium"
    ],
    numeroHabitacion: "P104",
    totalDisponibles: 4
  },
  {
    nombre: "Habitación Individual Superior",
    descripcion: "Habitación individual amplia con área de trabajo y zona de descanso.",
    tipo: "Individual",
    precio: 2000,
    capacidad: 1,
    tamaño: "28m²",
    camas: "1 Queen Size",
    imagen: "/images/placeholder/room4.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Escritorio",
      "Sillón de lectura",
      "Cafetera"
    ],
    numeroHabitacion: "I402",
    totalDisponibles: 2
  },
  {
    nombre: "Suite Colonial Deluxe",
    descripcion: "Suite que captura la esencia colonial de la hacienda con toques de lujo moderno.",
    tipo: "Suite",
    precio: 3200,
    capacidad: 2,
    tamaño: "45m²",
    camas: "1 King Size",
    imagen: "/images/placeholder/room1.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno incluido",
      "TV de pantalla plana",
      "Sala de estar",
      "Balcón colonial",
      "Bañera antigua"
    ],
    numeroHabitacion: "S204",
    totalDisponibles: 4
  },
  {
    nombre: "Habitación Doble Premium",
    descripcion: "Habitación doble de categoría superior con vistas privilegiadas y amenidades premium.",
    tipo: "Doble",
    precio: 2800,
    capacidad: 2,
    tamaño: "38m²",
    camas: "2 Queen Size",
    imagen: "/images/placeholder/room2.jpg.svg",
    amenidades: [
      "WiFi gratis",
      "Desayuno buffet incluido",
      "TV de pantalla plana",
      "Aire acondicionado",
      "Baño de lujo",
      "Vista panorámica"
    ],
    numeroHabitacion: "D304",
    totalDisponibles: 4
  }
];

const seedHabitaciones = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conexión a MongoDB establecida');

    await Habitacion.deleteMany();
    console.log('Habitaciones eliminadas');

    // Asignar totalDisponibles según el tipo de habitación
    const habitacionesConTotal = habitaciones.map(habitacion => ({
      ...habitacion,
      totalDisponibles: tiposHabitacion[habitacion.tipo]
    }));

    await Habitacion.insertMany(habitacionesConTotal);
    console.log('Habitaciones creadas exitosamente');

    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedHabitaciones(); 