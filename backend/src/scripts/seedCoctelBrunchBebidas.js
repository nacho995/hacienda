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
  seedCoctelBrunchBebidas();
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
  process.exit(1);
});

const coctelBrunchBebidas = [
  // Welcome Cóctel
  {
    id: 'box-lunch',
    nombre: 'Box Lunch',
    descripcion: 'Opción ligera para eventos matutinos o como refrigerio.',
    precio: '$250.00 por persona',
    iconType: 'coctel',
    categoria: 'coctel_brunch',
    subcategoria: 'welcome_coctel',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Salas Lounge / Periqueras',
      'Barra de Fruta de Temporada o Crudites (jícama, pepino, zanahoria)',
      '1 Bagel de Jamón y queso',
      'Café Americano o Té',
      'Surtido de Galletas'
    ],
    requisitos: [
      'Mínimo 35 personas'
    ]
  },
  {
    id: 'coctel-opcion-1',
    nombre: 'Cóctel Opción 1',
    descripcion: 'Opción de cóctel con canapés mexicanos y coctelería.',
    precio: '$350.00 por persona',
    iconType: 'coctel',
    categoria: 'coctel_brunch',
    subcategoria: 'welcome_coctel',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Salas Lounge',
      'Canapés mexicanos',
      'Crudites',
      '1 hr de Coctelería (Margaritas, mojitos)',
      'Aguas frescas'
    ],
    requisitos: [
      'Mínimo 35 personas'
    ]
  },
  {
    id: 'coctel-opcion-2',
    nombre: 'Cóctel Opción 2',
    descripcion: 'Opción de cóctel con canapés internacionales y tablas de quesos.',
    precio: '$400.00 por persona',
    iconType: 'coctel',
    categoria: 'coctel_brunch',
    subcategoria: 'welcome_coctel',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Salas Lounge /Periqueras',
      'Canapés Internacionales y tablas de quesos',
      '1 hr Cockteleria (margaritas, mojitos)',
      'Aguas frescas'
    ],
    requisitos: [
      'Mínimo 35 personas'
    ]
  },
  {
    id: 'coctel-opcion-3',
    nombre: 'Cóctel Opción 3: Barra de Ensaladas y Pastas',
    descripcion: 'Opción de cóctel con barra de ensaladas y pastas.',
    precio: '$430.00 por persona',
    iconType: 'coctel',
    categoria: 'coctel_brunch',
    subcategoria: 'welcome_coctel',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Salas Lounge',
      'Comida montada tipo buffet (3 tiempos) o servicio en mesa',
      'Tabla de Quesos y Carnes frías',
      'Ensalada San Carlos (mezcla de lechugas, nuez, queso panela, mango, manzana y aderezo de Jamaica)',
      'Ensalada César',
      'Fetuccini con mariscos en salsa de tres quesos',
      'Espagueti al pesto',
      'Aguas frescas'
    ],
    requisitos: [
      'Mínimo 35 personas'
    ]
  },
  {
    id: 'coctel-opcion-4',
    nombre: 'Cóctel Opción 4: Parrillada',
    descripcion: 'Opción de cóctel con parrillada.',
    precio: '$550.00 por persona',
    iconType: 'coctel',
    categoria: 'coctel_brunch',
    subcategoria: 'welcome_coctel',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Salas Lounge',
      'Arrachera',
      'Cecina, Cecina Enchilada, Pechugas de Pollo',
      'Longaniza, Chorizo',
      'Nopales',
      'Arroz',
      'Quesadillas, sopes',
      'Frijoles',
      'Aguas Frescas'
    ],
    requisitos: [
      'Mínimo 35 personas'
    ]
  },
  {
    id: 'coctel-opcion-5',
    nombre: 'Cóctel Opción 5: Variedad de Tacos',
    descripcion: 'Opción de cóctel con variedad de tacos.',
    precio: '$380.00 por persona',
    iconType: 'coctel',
    categoria: 'coctel_brunch',
    subcategoria: 'welcome_coctel',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Salas Lounge',
      'Tacos al Pastor, Tacos de Bistec, Tacos de Costilla, Alambre de Res, Quesadilla y Gringas',
      'Aguas Frescas'
    ],
    requisitos: [
      'Mínimo 35 personas'
    ]
  },
  {
    id: 'coctel-opcion-6',
    nombre: 'Cóctel Opción 6: Tacos Al Pastor',
    descripcion: 'Opción de cóctel con tacos al pastor.',
    precio: '$300.00 por persona',
    iconType: 'coctel',
    categoria: 'coctel_brunch',
    subcategoria: 'welcome_coctel',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Salas Lounge',
      'Tacos al Pastor',
      'Aguas Frescas'
    ],
    requisitos: [
      'Mínimo 35 personas'
    ]
  },
  {
    id: 'coctel-opcion-7',
    nombre: 'Cóctel Opción 7: Pizzas y Ensaladas',
    descripcion: 'Opción de cóctel con pizzas y ensaladas.',
    precio: '$550.00 por persona',
    iconType: 'coctel',
    categoria: 'coctel_brunch',
    subcategoria: 'welcome_coctel',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Salas Lounge',
      'Aguas frescas',
      '1 hr De Cócteleria (Margaritas, Mojitos)',
      'Barra de Pizzas y Ensaladas',
      'Ensalada Cesar y San Carlos'
    ],
    requisitos: [
      'Mínimo 35 personas'
    ]
  },
  {
    id: 'coctel-opcion-8',
    nombre: 'Cóctel Opción 8: Cazuelas de Guisado',
    descripcion: 'Opción de cóctel con cazuelas de guisado.',
    precio: '$480.00 por persona',
    iconType: 'coctel',
    categoria: 'coctel_brunch',
    subcategoria: 'welcome_coctel',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Salas Lounge',
      '5 guisados a elegir entre: Chicharrón en salsa, Tinga de Pollo, Bistec a la mexicana, Cerdo en Salsa de Cacahuate, Rajas con crema, Mole con pollo, Picadillo, Chorizo c/ papas',
      'Quesadillas',
      'Sopes',
      'Tacos dorados',
      'Nopales a la Mexicana',
      'Arroz y frijoles',
      'Tortillas a mano',
      'Aguas frescas',
      'Hielo'
    ],
    requisitos: [
      'Mínimo 35 personas'
    ]
  },
  
  // Brunch
  {
    id: 'brunch-paquete-1',
    nombre: 'Brunch Paquete 1',
    descripcion: 'Desayuno buffet completo con variedad de guisados.',
    precio: '$400.00 por persona',
    iconType: 'brunch',
    categoria: 'coctel_brunch',
    subcategoria: 'brunch',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Servicio de meseros y mobiliario',
      'Jugo de Naranja',
      'Fruta de la estación',
      'Café de Grano',
      'Pan Dulce',
      'Aguas Frescas de Frutas Naturales',
      'Hielo para el evento',
      'Pan Salado',
      '4 guisados a elegir entre: Chicharron en salsa verde, Rajas c/crema, Chilaquiles con pollo, Quesadillas de tinga de pollo y queso Oaxaca, Cecina de yecapixtla',
      'Frijoles refritos',
      'Nopales sofritos con chile de árbol',
      'Barra de salsas (roja, verde, rajas)',
      'Cebollas cambray',
      'Tortillas hechas al momento'
    ]
  },
  {
    id: 'brunch-paquete-2',
    nombre: 'Brunch Paquete 2',
    descripcion: 'Desayuno buffet completo con variedad de platillos.',
    precio: '$400.00 por persona',
    iconType: 'brunch',
    categoria: 'coctel_brunch',
    subcategoria: 'brunch',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Servicio de meseros y mobiliario',
      'Fruta de la estación',
      'Café de Grano',
      'Pan Dulce',
      'Aguas Frescas de Frutas Naturales',
      'Hielo para el evento',
      'Pan Salado',
      'Huevo en salsa verde',
      'Huevo con jamón',
      'Chicharron en salsa verde',
      'Chilaquiles con pollo',
      'Variedad de quesadillas',
      'Frijoles refritos',
      'Nopales sofritos con chile de árbol',
      'Barra de salsas (roja, verde, rajas)',
      'Tortillas hechas al momento'
    ]
  },
  
  // Bebidas
  {
    id: 'barra-libre-plata',
    nombre: 'Barra Libre Plata',
    descripcion: 'Barra libre por 4 horas con licores de gama media.',
    precio: '$250.00 por persona',
    iconType: 'barra',
    categoria: 'bebidas',
    subcategoria: 'barra_libre',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    duracion: '4 horas',
    incluye: [
      'Etiqueta Roja',
      'Appleton especial',
      'Tequila Jimador o 100 años',
      'Vodka smirnoff'
    ]
  },
  {
    id: 'barra-libre-oro',
    nombre: 'Barra Libre Oro',
    descripcion: 'Barra libre por 4 horas con licores premium.',
    precio: '$300.00 por persona',
    iconType: 'barra',
    categoria: 'bebidas',
    subcategoria: 'barra_libre',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    duracion: '4 horas',
    incluye: [
      'Etiqueta negra',
      'Bacardi o appleton state',
      'Tequila tradicional',
      'Vodka Stolishnaya o absolut'
    ]
  },
  {
    id: 'cartones-cerveza',
    nombre: 'Cartones de Cervezas',
    descripcion: 'Cartones de 24 ampolletas de cerveza.',
    precio: '$600.00 cada cartón',
    iconType: 'barra',
    categoria: 'bebidas',
    subcategoria: 'barra_libre',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    incluye: [
      'Ampolletas de 24 (Victoria/coronita)'
    ]
  },
  {
    id: 'barra-libre-cerveza',
    nombre: 'Barra Libre de Cerveza',
    descripcion: 'Barra libre de cerveza por 4 horas.',
    precio: '$200.00 por persona',
    iconType: 'barra',
    categoria: 'bebidas',
    subcategoria: 'barra_libre',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    duracion: '4 horas'
  },
  {
    id: 'barra-clamatos',
    nombre: 'Barra de Clamatos',
    descripcion: 'Barra de clamatos por 4 horas.',
    precio: '$60.00 por persona',
    iconType: 'barra',
    categoria: 'bebidas',
    subcategoria: 'barra_libre',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    duracion: '4 horas'
  },
  {
    id: 'barra-gin',
    nombre: 'Barra de Gin',
    descripcion: 'Barra de gin por 2 horas.',
    precio: '$180.00 por persona',
    iconType: 'barra',
    categoria: 'bebidas',
    subcategoria: 'barra_libre',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    duracion: '2 horas'
  },
  {
    id: 'refrescos-mezcladores',
    nombre: 'Refrescos y Mezcladores',
    descripcion: 'Refrescos y mezcladores por 4 horas.',
    precio: '$60.00 por persona',
    iconType: 'barra',
    categoria: 'bebidas',
    subcategoria: 'barra_libre',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    duracion: '4 horas'
  },
  {
    id: 'barra-libre-platinum-10h',
    nombre: 'Barra Libre Platinum 10 horas',
    descripcion: 'Barra libre platinum por 10 horas para paquetes Básico y Platinum.',
    precio: '$280.00 por persona',
    iconType: 'barra',
    categoria: 'bebidas',
    subcategoria: 'barra_libre',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    duracion: '10 horas',
    incluye: [
      'RON (APPLETON DORADO / BACARDI)',
      'BRANDY TORRES 5',
      'TEQUILA 100 AÑOS (AZUL O VERDE)',
      'VODKA SMIRNOFF',
      'WHISKEY (JB O JOHNNY WALKER)',
      'GINEBRA DARGENT',
      'CERVEZA (CÓCTEL)'
    ]
  },
  {
    id: 'barra-libre-oro-10h',
    nombre: 'Barra Libre Oro 10 horas',
    descripcion: 'Barra libre oro por 10 horas para paquetes Básico y Platinum.',
    precio: '$350.00 por persona',
    iconType: 'barra',
    categoria: 'bebidas',
    subcategoria: 'barra_libre',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Aniversario'],
    color: '#D1B59B',
    activo: true,
    duracion: '10 horas',
    incluye: [
      'RON (APPLETON STATE/BACARDI)',
      'BRANDY TORRES 10',
      'TEQUILA (TRADICIONAL/CAZADORES Y DON JULIO)',
      'VODKA (ABSOLUT / STOLISCHNAYA)',
      'WHISKEY (BUCHANAN´S / ETIQUETA NEGRA)',
      'GINEBRA TANQUERAY',
      'CERVEZA (CÓCTEL)'
    ]
  },
  {
    id: 'descorche',
    nombre: 'Descorche',
    descripcion: 'Descorche por evento en caso de no contratar barra libre.',
    precio: '$5,000.00',
    iconType: 'barra',
    categoria: 'bebidas',
    subcategoria: 'barra_libre',
    recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Aniversario'],
    color: '#D1B59B',
    activo: true
  }
];

async function seedCoctelBrunchBebidas() {
  try {
    // Eliminar servicios de cóctel, brunch y bebidas existentes
    await Servicio.deleteMany({ 
      $or: [
        { categoria: 'coctel_brunch' },
        { categoria: 'bebidas' }
      ]
    });
    console.log('Servicios de cóctel, brunch y bebidas eliminados');

    // Insertar nuevos servicios de cóctel, brunch y bebidas
    await Servicio.insertMany(coctelBrunchBebidas);
    console.log('Servicios de cóctel, brunch y bebidas insertados');

    // Cerrar conexión
    mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('Error al insertar servicios de cóctel, brunch y bebidas:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
