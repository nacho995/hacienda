const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Servicio = require('../models/Servicio');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión a MongoDB establecida');
  seedMontajeFotoCoordinacion();
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
  process.exit(1);
});

const montajeFotoCoordinacion = [
  // Montaje
  {
    id: 'montaje-incluido',
    nombre: 'Montaje Incluido',
    descripcion: 'Opciones de montaje incluidas en los paquetes básicos.',
    precio: 'Incluido en paquetes',
    iconType: 'montaje',
    categoria: 'montaje',
    subcategoria: 'montaje_incluido',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Sillas Cross Back, Luis XV ó Wishone',
      'Mesas redondas o cuadradas con mantelería importada',
      'Mesas de madera redondas rectangulares o cuadradas',
      'Mesas gigantes o imperiales',
      'Servilleta con tonalidad a elegir',
      'Cristalería importada',
      'Copas artesanales',
      'Plato base de diseño',
      'Cubierto plata'
    ]
  },
  {
    id: 'montaje-premium',
    nombre: 'Montaje Premium',
    descripcion: 'Opciones de montaje premium para eventos exclusivos.',
    precio: 'Cotizar',
    iconType: 'montaje',
    categoria: 'montaje',
    subcategoria: 'montaje_premium',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Mesa de cristal',
      'Mesas mármol',
      'Mesas rectangular negra',
      'Sillas Pavorreal para novios',
      'Equipales novios',
      'Silla Janeth Funda Gris',
      'Silla Pretty',
      'Silla Piraámide',
      'Sillaón maple',
      'Silla Basquet',
      'Cubierto oro / cobre o negro'
    ]
  },
  
  // Fotografía y Video
  {
    id: 'paquete-fotografia',
    nombre: 'Paquete de Fotografía',
    descripcion: 'Servicio completo de fotografía para tu evento.',
    precio: 'Incluido en paquetes Platinum y Oro',
    iconType: 'fotografia',
    categoria: 'foto_video',
    subcategoria: 'fotografia',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true,
    duracion: '10-12 horas',
    incluye: [
      'Shooting de novios el mismo día',
      'Shooting con familiares, damas y padrinos',
      'Arreglo de novios',
      'Ceremonia religioso y civil (siempre y cuando sea el mismo dia)',
      'Recepción',
      'Fotógrafos',
      'Edición y retoque de material fotográfico',
      'Entrega de material en USB'
    ]
  },
  {
    id: 'paquete-video',
    nombre: 'Paquete de Video',
    descripcion: 'Servicio completo de videografía para tu evento.',
    precio: 'Incluido en paquetes Platinum y Oro',
    iconType: 'video',
    categoria: 'foto_video',
    subcategoria: 'video',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true,
    duracion: '10-12 horas',
    incluye: [
      'Producción de cortometraje (Tu boda en corto)',
      'Cámaras fotográficas (DSRL) que graban en video y formato HD',
      'Estabilizador de cámara DJI Ronin',
      'Grabadora de audio independiente',
      'Cobertura de arreglo de novios',
      'Llegada de los novios',
      'Making off de sesión fotográfica (mismo día)',
      'Acto religioso y/o civil',
      'Momentos emotivos o importantes de la fiesta',
      'Diferentes clips (Arreglos, civil, sesiones, fiesta, dron)',
      'Entrega de todo el material recopilado en USB',
      'Dron Phantom DJI 4'
    ]
  },
  
  // Coordinación
  {
    id: 'coordinacion-evento',
    nombre: 'Coordinación del Evento',
    descripcion: 'Servicio integral de coordinación para tu evento, desde la planificación hasta la ejecución.',
    precio: 'Incluido en paquetes',
    iconType: 'coordinacion',
    categoria: 'coordinacion',
    subcategoria: 'coordinacion',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true,
    detalles: 'En su servicio integral, tiene presupuestado coordinación integral y ES UN SEGURO PARA SU EVENTO, será su hada madrina, si desean despreocuparse por todo, que coordinemos y diseñemos de principio a fin su evento, organizando logística, diseño, decoración, montaje, minuto a minuto, pagos, layout, llamadas de confirmación, invitación digital, entrega de documentos a iglesia, civil. Etc. Ustedes sólo se encargarán de disfrutar al máximo ese gran dia dejando todo en nuestras manos.'
  }
];

async function seedMontajeFotoCoordinacion() {
  try {
    // Eliminar servicios de montaje, foto y coordinación existentes
    await Servicio.deleteMany({ 
      $or: [
        { categoria: 'montaje' },
        { categoria: 'foto_video' },
        { categoria: 'coordinacion' }
      ]
    });
    console.log('Servicios de montaje, foto y coordinación eliminados');

    // Insertar nuevos servicios de montaje, foto y coordinación
    await Servicio.insertMany(montajeFotoCoordinacion);
    console.log('Servicios de montaje, foto y coordinación insertados');

    // Cerrar conexión
    mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('Error al insertar servicios de montaje, foto y coordinación:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
