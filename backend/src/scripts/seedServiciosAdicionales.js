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
  seedServiciosAdicionales();
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
  process.exit(1);
});

const serviciosAdicionales = [
  {
    id: 'tacos-pastor',
    nombre: 'Tacos al Pastor',
    descripcion: 'Servicio de taquiza con tacos al pastor frescos preparados en el momento.',
    precio: 'Depende de la cantidad requerida',
    iconType: 'restaurante',
    categoria: 'servicio_adicional',
    subcategoria: 'comida',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'carro-churros',
    nombre: 'Carro de Churros',
    descripcion: 'Deliciosos churros recién hechos con diferentes opciones de relleno y cobertura.',
    precio: 'Depende de la cantidad requerida',
    iconType: 'restaurante',
    categoria: 'servicio_adicional',
    subcategoria: 'comida',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'carro-papas',
    nombre: 'Carro de Papas',
    descripcion: 'Papas a la francesa con variedad de aderezos y toppings.',
    precio: 'Depende de la cantidad requerida',
    iconType: 'restaurante',
    categoria: 'servicio_adicional',
    subcategoria: 'comida',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'mampara-donas',
    nombre: 'Mampara de Donas',
    descripcion: 'Exhibidor de donas decorativas para que tus invitados disfruten de un dulce postre.',
    precio: 'Depende de la cantidad requerida',
    iconType: 'restaurante',
    categoria: 'servicio_adicional',
    subcategoria: 'comida',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'sandalias-pantuflas',
    nombre: 'Sandalias y Pantuflas',
    descripcion: 'Cómodas opciones para tus invitados después de bailar.',
    precio: 'Cotiza según modelo (Mínimo 50 pzas)',
    iconType: 'decoracion',
    categoria: 'servicio_adicional',
    subcategoria: 'comodidad',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'abanicos',
    nombre: 'Abanicos',
    descripcion: 'Abanicos personalizados para tus invitados.',
    precio: 'Cotiza según modelo (Mínimo 50 pzas)',
    iconType: 'decoracion',
    categoria: 'servicio_adicional',
    subcategoria: 'comodidad',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'kits-anticruda',
    nombre: 'Kits Anticruda',
    descripcion: 'Kit de recuperación para tus invitados después de la fiesta.',
    precio: 'Cotiza según modelo (Mínimo 50 pzas)',
    iconType: 'decoracion',
    categoria: 'servicio_adicional',
    subcategoria: 'comodidad',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'carpas',
    nombre: 'Carpas',
    descripcion: 'Carpas para eventos al aire libre.',
    precio: 'Depende de las medidas requeridas',
    iconType: 'decoracion',
    categoria: 'servicio_adicional',
    subcategoria: 'infraestructura',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true,
    requisitos: [
      'LA CONTRATACIÓN DE CARPAS DEBERÁ DE CONFIRMARSE AL MENOS 2 SEMANAS ANTES DEL EVENTO PARA ASEGURAR LA DISPONIBILIDAD.'
    ]
  },
  {
    id: 'tarimas',
    nombre: 'Tarimas',
    descripcion: 'Tarimas para escenarios o pistas elevadas.',
    precio: 'Depende de las medidas requeridas',
    iconType: 'decoracion',
    categoria: 'servicio_adicional',
    subcategoria: 'infraestructura',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'carro-shots',
    nombre: 'Carro Shots',
    descripcion: 'Servicio de shots variados para animar la fiesta.',
    precio: 'Cotizar',
    iconType: 'bebidas',
    categoria: 'servicio_adicional',
    subcategoria: 'bebidas',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'papeles-metalicos',
    nombre: 'Papeles Metálicos',
    descripcion: 'Efectos especiales con papeles metálicos para momentos culminantes.',
    precio: 'Cotizar',
    iconType: 'decoracion',
    categoria: 'servicio_adicional',
    subcategoria: 'entretenimiento',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'ludoteca-movil',
    nombre: 'Ludoteca Móvil',
    descripcion: 'Entretenimiento infantil con juegos y actividades supervisadas.',
    precio: 'Cotizar',
    iconType: 'decoracion',
    categoria: 'servicio_adicional',
    subcategoria: 'entretenimiento',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'cabina-fotos',
    nombre: 'Cabina de Fotos',
    descripcion: 'Cabina para que tus invitados se lleven un recuerdo fotográfico del evento.',
    precio: 'Cotizar',
    iconType: 'fotografia',
    categoria: 'servicio_adicional',
    subcategoria: 'entretenimiento',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'cotillon',
    nombre: 'Cotillón',
    descripcion: 'Accesorios divertidos para animar la pista de baile.',
    precio: 'Cotizar',
    iconType: 'decoracion',
    categoria: 'servicio_adicional',
    subcategoria: 'entretenimiento',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'mariachis',
    nombre: 'Mariachis',
    descripcion: 'Grupo de mariachis para ambientar tu evento con música tradicional mexicana.',
    precio: 'Cotizar',
    iconType: 'musica',
    categoria: 'servicio_adicional',
    subcategoria: 'entretenimiento',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'marimba',
    nombre: 'Marimba',
    descripcion: 'Grupo de marimba para ambientar tu evento con música tradicional.',
    precio: 'Cotizar',
    iconType: 'musica',
    categoria: 'servicio_adicional',
    subcategoria: 'entretenimiento',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'saxofonista',
    nombre: 'Saxofonista',
    descripcion: 'Saxofonista profesional para ambientar tu evento con música en vivo.',
    precio: 'Cotizar',
    iconType: 'musica',
    categoria: 'servicio_adicional',
    subcategoria: 'entretenimiento',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'musica-ceremonia',
    nombre: 'Música para Ceremonia',
    descripcion: 'Música especial para tu ceremonia religiosa o civil.',
    precio: 'Cotizar',
    iconType: 'musica',
    categoria: 'servicio_adicional',
    subcategoria: 'entretenimiento',
    recomendadoPara: ['Boda', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'ventiladores',
    nombre: 'Ventiladores',
    descripcion: 'Ventiladores para eventos en temporada de calor.',
    precio: 'Cotizar',
    iconType: 'decoracion',
    categoria: 'servicio_adicional',
    subcategoria: 'infraestructura',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'calentadores',
    nombre: 'Calentadores',
    descripcion: 'Calentadores para eventos en temporada de frío.',
    precio: 'Cotizar',
    iconType: 'decoracion',
    categoria: 'servicio_adicional',
    subcategoria: 'infraestructura',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'tramite-civil',
    nombre: 'Trámite Civil',
    descripcion: 'Asistencia para realizar el trámite civil de tu boda.',
    precio: 'Cotizar',
    iconType: 'coordinacion',
    categoria: 'servicio_adicional',
    subcategoria: 'coordinacion',
    recomendadoPara: ['Boda'],
    color: '#D1B59B',
    activo: true
  },
  {
    id: 'tramite-religioso',
    nombre: 'Trámite Religioso',
    descripcion: 'Asistencia para el trámite religioso directamente con la parroquia de San Carlos Borromeo.',
    precio: 'Cotizar',
    iconType: 'coordinacion',
    categoria: 'servicio_adicional',
    subcategoria: 'coordinacion',
    recomendadoPara: ['Boda', 'Ceremonia Religiosa'],
    color: '#D1B59B',
    activo: true
  }
];

async function seedServiciosAdicionales() {
  try {
    // Eliminar servicios adicionales existentes
    await Servicio.deleteMany({ categoria: 'servicio_adicional' });
    console.log('Servicios adicionales eliminados');

    // Insertar nuevos servicios adicionales
    await Servicio.insertMany(serviciosAdicionales);
    console.log('Servicios adicionales insertados');

    // Cerrar conexión
    mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('Error al insertar servicios adicionales:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
