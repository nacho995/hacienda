const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const Servicio = require('../models/Servicio');

// Cargar variables de entorno
dotenv.config();

// Datos de servicios para inicializar la colección
const servicios = [
  {
    id: 'catering',
    nombre: 'Catering Premium',
    descripcion: 'Menú gourmet personalizado con opciones para todos los gustos y necesidades dietéticas',
    precio: 'Desde $450 por persona',
    iconType: 'restaurante',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    detalles: 'Nuestro servicio de catering premium ofrece una experiencia culinaria excepcional diseñada específicamente para su evento. Trabajamos con chefs reconocidos que crean menús personalizados utilizando ingredientes frescos y de temporada. Ofrecemos opciones para todas las necesidades dietéticas, incluyendo vegetarianas, veganas, sin gluten y alergias específicas.',
    incluye: [
      'Menú personalizado de 3 a 5 tiempos',
      'Estaciones de comida interactivas',
      'Bebidas no alcohólicas ilimitadas',
      'Personal de servicio profesional',
      'Montaje y desmontaje completo',
      'Prueba de menú para hasta 4 personas'
    ]
  },
  {
    id: 'decoracion',
    nombre: 'Decoración Personalizada',
    descripcion: 'Diseño y montaje de decoración elegante adaptada al estilo de su evento',
    precio: 'Desde $3,500',
    iconType: 'decoracion',
    recomendadoPara: ['Boda', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    detalles: 'Transformamos cualquier espacio en un entorno mágico que refleja su visión y estilo personal. Nuestro equipo de diseñadores trabaja estrechamente con usted para crear un concepto único que complemente perfectamente su evento. Desde elegantes bodas hasta celebraciones temáticas, nos encargamos de cada detalle decorativo.',
    incluye: [
      'Consulta de diseño personalizada',
      'Centros de mesa y decoración floral',
      'Iluminación ambiental',
      'Mobiliario y mantelería',
      'Elementos decorativos personalizados',
      'Montaje y desmontaje completo'
    ]
  },
  {
    id: 'musica',
    nombre: 'Música en Vivo',
    descripcion: 'Grupo musical o DJ profesional con equipo de sonido incluido',
    precio: 'Desde $2,800',
    iconType: 'musica',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños'],
    color: '#D1B59B',
    detalles: 'La música perfecta crea la atmósfera ideal para su evento. Ofrecemos una variedad de opciones musicales, desde bandas en vivo hasta DJs profesionales, todos con amplia experiencia en eventos exclusivos. Nuestros músicos y DJs trabajan con usted para crear una lista de reproducción personalizada que refleje sus preferencias musicales y mantenga a sus invitados entretenidos.',
    incluye: [
      'Consulta previa para selección musical',
      'Equipo de sonido profesional',
      'Técnico de sonido',
      'Iluminación básica',
      'Repertorio personalizado',
      'Hasta 5 horas de servicio continuo'
    ]
  },
  {
    id: 'fotografia',
    nombre: 'Fotografía Profesional',
    descripcion: 'Servicio completo de fotografía con entrega de álbum digital y físico',
    precio: 'Desde $3,200',
    iconType: 'fotografia',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    detalles: 'Capturamos cada momento especial de su evento con un enfoque artístico y atención al detalle. Nuestros fotógrafos profesionales tienen años de experiencia documentando eventos exclusivos y saben exactamente cómo capturar la esencia y emoción de cada momento. Utilizamos equipos de última generación para garantizar imágenes de la más alta calidad.',
    incluye: [
      'Sesión previa al evento (para bodas)',
      'Cobertura completa del evento',
      'Edición profesional de todas las imágenes',
      'Galería digital en línea',
      'Álbum físico de lujo (30 páginas)',
      'Entrega de todas las imágenes en alta resolución'
    ]
  },
  {
    id: 'video',
    nombre: 'Videografía',
    descripcion: 'Grabación profesional y edición de video con dron incluido',
    precio: 'Desde $4,500',
    iconType: 'video',
    recomendadoPara: ['Boda', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    detalles: 'Creamos películas cinematográficas que cuentan la historia única de su evento. Nuestro equipo de videógrafos utiliza las últimas tecnologías, incluyendo drones y estabilizadores, para capturar tomas espectaculares desde todos los ángulos. El resultado es un video emotivo y profesional que podrá atesorar para siempre.',
    incluye: [
      'Consulta previa para planificación',
      'Dos videógrafos profesionales',
      'Grabación con dron (sujeto a condiciones climáticas)',
      'Audio de alta calidad',
      'Edición cinematográfica completa',
      'Video resumen (5-7 minutos)',
      'Video completo del evento',
      'Entrega en formato digital y USB personalizado'
    ]
  },
  {
    id: 'bar',
    nombre: 'Barra de Bebidas Premium',
    descripcion: 'Selección de bebidas premium con bartenders profesionales',
    precio: 'Desde $350 por persona',
    iconType: 'bebidas',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños'],
    color: '#D1B59B',
    detalles: 'Elevamos la experiencia de su evento con nuestro servicio de bar premium. Nuestros bartenders profesionales no solo sirven bebidas excepcionales, sino que también crean una experiencia interactiva para sus invitados. Ofrecemos una selección de licores premium, cócteles artesanales y opciones personalizadas que complementan perfectamente su evento.',
    incluye: [
      'Bartenders profesionales',
      'Selección de licores premium',
      'Cócteles de autor personalizados',
      'Estación de mixología interactiva',
      'Cristalería elegante',
      'Hielo y guarniciones',
      'Servicio por 5 horas'
    ]
  },
  {
    id: 'flores',
    nombre: 'Arreglos Florales',
    descripcion: 'Diseño y montaje de arreglos florales frescos para todo el evento',
    precio: 'Desde $2,800',
    iconType: 'flores',
    recomendadoPara: ['Boda', 'Ceremonia Religiosa', 'Evento Corporativo'],
    color: '#D1B59B',
    detalles: 'Transformamos cualquier espacio con arreglos florales espectaculares que reflejan su estilo y la temporada. Nuestros diseñadores florales trabajan con las flores más frescas y de la más alta calidad para crear composiciones únicas que añaden elegancia y sofisticación a su evento. Desde ramos de novia hasta centros de mesa y decoraciones arquitectónicas, cada arreglo se crea con pasión y atención al detalle.',
    incluye: [
      'Consulta de diseño floral',
      'Flores frescas de temporada',
      'Ramo y boutonniere (para bodas)',
      'Centros de mesa',
      'Decoración floral del espacio principal',
      'Montaje y desmontaje',
      'Florero de cristal o cerámica para cada arreglo'
    ]
  }
];

// Función para conectar a la base de datos y sembrar los datos
const seedDatabase = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Conexión a MongoDB establecida'.cyan.underline);

    // Eliminar datos existentes
    await Servicio.deleteMany();
    console.log('Datos de servicios eliminados'.red);

    // Insertar nuevos datos
    await Servicio.insertMany(servicios);
    console.log('Datos de servicios insertados'.green);

    // Cerrar conexión
    mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada'.cyan);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Ejecutar la función
seedDatabase();
