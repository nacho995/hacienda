const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Servicio = require('../models/Servicio');

// Cargar variables de entorno especificando la ruta
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión a MongoDB establecida');
  seedPaquetesEventos();
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
  process.exit(1);
});

const paquetesEventos = [
  {
    id: 'paquete-basico',
    nombre: 'Paquete Básico',
    descripcion: 'Paquete básico para eventos con todos los servicios esenciales para una experiencia inolvidable.',
    precio: 'Desde $1,747.00 por persona',
    iconType: 'paquete',
    categoria: 'paquete_evento',
    subcategoria: 'basico',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    detalles: 'Paquete básico con todos los servicios esenciales para tu evento.',
    imagenUrl: '/images/paquetes/basico.jpg',
    duracion: '12 horas',
    incluye: [
      'RENTA DEL LUGAR POR 12 HORAS (Límite Para Finalizar Evento 3 am)',
      'ÁREA PARA MONTAJE CIVIL',
      'ÁREA PARA RECEPCION',
      'CAPILLA Y DECORACION BASICA',
      'ILUMINACIÓN ARQUITECTÓNICA',
      'PERSONAL DE SEGURIDAD',
      'PERSONAL DE SERVICIO',
      'MENU DE 3 ó 4 TIEMPOS',
      '1 MESAS CLÁSICAS Y/O MADERA POR CADA 10 PERSONAS',
      'VARIEDAD DE SILLAS',
      'LOZA',
      '1 CENTROS DE MESA POR CADA 10 PERSONAS',
      '1 MESERO POR MESA DURANTE TODO EL EVENTO',
      'REFRESCOS, JUGO Y HIELO COMO MEZCLADORES (Fam.Coca-Cola)',
      'CRISTALERÍA IMPORTADA',
      'MANTELERÍA NACIONAL O IMPORTADA',
      'PISTA DE BAILE MADERA O CRISTAL ILUMINADA',
      'ESQUITES',
      'CARRO DE PAPAS O MESA DE DULCES',
      'COCKTAIL DE BIENVENIDA (AGUAS FRESCAS Y MARGARITAS, BOTANA MEXICANA)',
      'PIROTECNIA FRIA (NO ÀEREA)',
      'TORNA FIESTA',
      'SALAS LOUNGE',
      'PERIQUERAS',
      'EDECANES',
      'PLANTA DE LUZ',
      'VALET PARKING',
      'COORDINACION DEL EVENTO'
    ],
    preciosPorRango: [
      { rango: { min: 100, max: 149 }, precio: 4045, precioFormateado: '$4,045.00' },
      { rango: { min: 150, max: 199 }, precio: 3083, precioFormateado: '$3,083.00' },
      { rango: { min: 200, max: 249 }, precio: 2602, precioFormateado: '$2,602.00' },
      { rango: { min: 250, max: 299 }, precio: 2314, precioFormateado: '$2,314.00' },
      { rango: { min: 300, max: 349 }, precio: 2125, precioFormateado: '$2,125.00' },
      { rango: { min: 350, max: 399 }, precio: 1987, precioFormateado: '$1,987.00' },
      { rango: { min: 400, max: 449 }, precio: 1889, precioFormateado: '$1,889.00' },
      { rango: { min: 450, max: 499 }, precio: 1808, precioFormateado: '$1,808.00' },
      { rango: { min: 500, max: 549 }, precio: 1747, precioFormateado: '$1,747.00' }
    ],
    notas: [
      'PRECIOS SUJETOS A CAMBIO SIN PREVIO AVISO.',
      'TODOS NUESTROS PRECIOS SON SIN IVA'
    ]
  },
  {
    id: 'paquete-platinum',
    nombre: 'Paquete Platinum',
    descripcion: 'Paquete premium para eventos con servicios adicionales para una experiencia de lujo.',
    precio: 'Desde $1,817.00 por persona',
    iconType: 'paquete',
    categoria: 'paquete_evento',
    subcategoria: 'platinum',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    detalles: 'Paquete premium con servicios adicionales para una experiencia de lujo.',
    imagenUrl: '/images/paquetes/platinum.jpg',
    duracion: '12 horas',
    incluye: [
      'RENTA DEL LUGAR POR 12 HORAS (Límite Para Finalizar Evento 3 am)',
      'ÁREA PARA MONTAJE CIVIL',
      'ÁREA PARA RECEPCION',
      'CAPILLA Y DECORACION BASICA',
      'ILUMINACIÓN ARQUITECTÓNICA',
      'PERSONAL DE SEGURIDAD',
      'PERSONAL DE SERVICIO',
      'MENU DE 3 ó 4 TIEMPOS',
      '1 MESAS CLÁSICAS Y/O MADERA POR CADA 10 PERSONAS',
      'VARIEDAD DE SILLAS',
      'LOZA',
      '1 CENTROS DE MESA POR CADA 10 PERSONAS',
      'DJ COBERTURA TOTAL O FOTOGRAFIA Y VIDEO',
      '1 MESERO POR MESA DURANTE TODO EL EVENTO',
      'REFRESCOS, JUGO Y HIELO COMO MEZCLADORES (Fam.Coca-Cola)',
      'CRISTALERÍA IMPORTADA',
      'MANTELERÍA NACIONAL O IMPORTADA',
      'PISTA DE BAILE MADERA O CRISTAL ILUMINADA',
      'ESQUITES',
      'MESA DE QUESOS O MESA DE DULCES PLATINUM',
      'COCKTAIL DE BIENVENIDA (AGUAS FRESCAS Y MARGARITAS, BOTANA MEXICANA)',
      'PIROTECNIA FRIA (NO ÀEREA)',
      'TORNA FIESTA',
      'SALAS LOUNGE',
      'PERIQUERAS',
      'EDECANES',
      'PLANTA DE LUZ',
      'VALET PARKING',
      'COORDINACION DEL EVENTO'
    ],
    preciosPorRango: [
      { rango: { min: 100, max: 149 }, precio: 4355, precioFormateado: '$4,355.00' },
      { rango: { min: 150, max: 199 }, precio: 3293, precioFormateado: '$3,293.00' },
      { rango: { min: 200, max: 249 }, precio: 2762, precioFormateado: '$2,762.00' },
      { rango: { min: 250, max: 299 }, precio: 2444, precioFormateado: '$2,444.00' },
      { rango: { min: 300, max: 349 }, precio: 2235, precioFormateado: '$2,235.00' },
      { rango: { min: 350, max: 399 }, precio: 2082, precioFormateado: '$2,082.00' },
      { rango: { min: 400, max: 449 }, precio: 1974, precioFormateado: '$1,974.00' },
      { rango: { min: 450, max: 499 }, precio: 1884, precioFormateado: '$1,884.00' },
      { rango: { min: 500, max: 549 }, precio: 1817, precioFormateado: '$1,817.00' }
    ],
    notas: [
      'PRECIOS SUJETOS A CAMBIO SIN PREVIO AVISO.',
      'TODOS NUESTROS PRECIOS SON SIN IVA'
    ]
  },
  {
    id: 'paquete-oro',
    nombre: 'Paquete Oro',
    descripcion: 'Nuestro paquete más exclusivo con barra libre y servicios premium para una experiencia de lujo total.',
    precio: 'Desde $2,284.00 por persona',
    iconType: 'paquete',
    categoria: 'paquete_evento',
    subcategoria: 'oro',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    detalles: 'Nuestro paquete más exclusivo con barra libre y servicios premium.',
    imagenUrl: '/images/paquetes/oro.jpg',
    duracion: '12 horas',
    incluye: [
      'RENTA DEL LUGAR POR 12 HORAS (Límite Para Finalizar Evento 3 am)',
      'ÁREA PARA MONTAJE CIVIL',
      'ÁREA PARA RECEPCION',
      'CAPILLA Y DECORACION BASICA',
      'ILUMINACIÓN ARQUITECTÓNICA',
      'PERSONAL DE SEGURIDAD',
      'PERSONAL DE SERVICIO',
      'MENU DE 3 ó 4 TIEMPOS',
      '1 MESAS CLÁSICAS Y/O MADERA POR CADA 10 PERSONAS',
      'VARIEDAD DE SILLAS',
      'LOZA',
      '1 CENTROS DE MESA POR CADA 10 PERSONAS',
      'DJ COBERTURA TOTAL',
      'FOTOGRAFIA Y VIDEO',
      '1 MESERO POR MESA DURANTE TODO EL EVENTO',
      'REFRESCOS, JUGO Y HIELO COMO MEZCLADORES (Fam.Coca-Cola)',
      'CRISTALERÍA IMPORTADA',
      'MANTELERÍA NACIONAL O IMPORTADA',
      'PISTA DE BAILE MADERA O CRISTAL ILUMINADA',
      'ESQUITES',
      'HELADOS',
      'MESA DE QUESOS O MESA DE DULCES PLATINUM',
      'COCKTAIL DE BIENVENIDA (AGUAS FRESCAS Y MARGARITAS, BOTANA MEXICANA)',
      'A ELEGIR 1 OPCION (MARIACHI, BANDA, SAX, TRIO, MARIMBA)',
      'PIROTECNIA FRIA (NO ÀEREA)',
      'TORNA FIESTA',
      'SALAS LOUNGE',
      'PERIQUERAS',
      'EDECANES',
      'PLANTA DE LUZ',
      'VALET PARKING',
      'COORDINACION DEL EVENTO',
      'BARRA LIBRE ORO POR 10 HRS'
    ],
    preciosPorRango: [
      { rango: { min: 100, max: 149 }, precio: 5135, precioFormateado: '$5,135.00' },
      { rango: { min: 150, max: 199 }, precio: 3940, precioFormateado: '$3,940.00' },
      { rango: { min: 200, max: 249 }, precio: 3342, precioFormateado: '$3,342.00' },
      { rango: { min: 250, max: 299 }, precio: 2984, precioFormateado: '$2,984.00' },
      { rango: { min: 300, max: 349 }, precio: 2748, precioFormateado: '$2,748.00' },
      { rango: { min: 350, max: 399 }, precio: 2577, precioFormateado: '$2,577.00' },
      { rango: { min: 400, max: 449 }, precio: 2454, precioFormateado: '$2,454.00' },
      { rango: { min: 450, max: 499 }, precio: 2353, precioFormateado: '$2,353.00' },
      { rango: { min: 500, max: 549 }, precio: 2284, precioFormateado: '$2,284.00' }
    ],
    opciones: [
      {
        nombre: 'Barra Libre Oro',
        descripcion: 'Barra libre premium por 10 horas',
        incluye: [
          'RON (APPLETON STATE/BACARDI)',
          'BRANDY TORRES 10',
          'TEQUILA (TRADICIONAL/CAZADORES Y DON JULIO)',
          'VODKA (ABSOLUT / STOLISCHNAYA)',
          'WHISKEY (BUCHANAN´S / ETIQUETA NEGRA)',
          'GINEBRA TANQUERAY',
          'CERVEZA'
        ]
      }
    ],
    notas: [
      'PRECIOS SUJETOS A CAMBIO SIN PREVIO AVISO.',
      'TODOS NUESTROS PRECIOS SON SIN IVA'
    ]
  }
];

async function seedPaquetesEventos() {
  try {
    // Eliminar paquetes de eventos existentes
    await Servicio.deleteMany({ categoria: 'paquete_evento' });
    console.log('Paquetes de eventos eliminados');

    // Insertar nuevos paquetes de eventos
    await Servicio.insertMany(paquetesEventos);
    console.log('Paquetes de eventos insertados');

    // Cerrar conexión
    mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('Error al insertar paquetes de eventos:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
