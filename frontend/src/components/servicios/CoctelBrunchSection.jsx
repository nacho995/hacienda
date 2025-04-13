import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaGlassMartiniAlt, FaCoffee, FaUtensils, FaCheck } from 'react-icons/fa';

const CoctelBrunchSection = () => {
  // Definir array de imágenes para las opciones de cóctel
  const coctelImages = [
    '/fuentesfrutas.png', // Nueva imagen para Box Lunch (index 0)
    '/margaritamojitos.jpg', // Actualizar imagen para Opción 1 (index 1)
    '/canapesyquesos.jpg', // Actualizar imagen para Opción 2 (index 2)
    '/pasta3quesos.jpg', // Actualizar imagen para Opción 3 (index 3)
    '/cecinaenchilada.jpg', // Actualizar imagen para Opción 4 (index 4)
    '/tacosalpastor.jpg', // Actualizar imagen para Opción 5 (index 5)
    '/tacosalpastor1.jpg', // Actualizar imagen para Opción 6 (index 6)
    '/pizza.png', // Actualizar imagen para Opción 7 (index 7)
    '/chicharron-en-salsa-de-chile-morita.jpg' // Actualizar imagen para Opción 8 (index 8)
  ];

  // Definir array de imágenes para las opciones de brunch
  const brunchImages = [
    '/paquete1.png', // Nueva imagen para Paquete 1 (index 0)
    '/paquete2.png' // Actualizar imagen para Paquete 2 (index 1)
  ];

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Introducción */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6">Opciones de Cóctel y Brunch</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-[var(--color-brown-text)]">
              Ofrecemos diferentes opciones de cóctel de bienvenida y brunch para complementar tu evento
              y brindar a tus invitados una experiencia gastronómica excepcional.
            </p>
          </div>
        </div>

        {/* Welcome Cóctel */}
        <div className="mb-16">
          <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
            Opciones Welcome Cóctel
          </h3>
          <p className="text-center text-[var(--color-brown-medium)] mb-8">
            Todas nuestras opciones son con un mínimo de 35 personas
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opcionesCoctel.map((opcion, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg overflow-hidden shadow-md"
              >
                <div className="relative h-48">
                  <Image 
                    src={coctelImages[index] || '/images/default-coctel.jpg'} // Usar el array de imágenes
                    alt={`Opción de cóctel ${opcion.nombre}`} 
                    layout="fill"
                    objectFit={index === 0 ? 'cover' : 'contain'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h4 className="text-xl font-[var(--font-display)]">{opcion.nombre}</h4>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <ul className="space-y-2 mb-4">
                    {opcion.items.map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                        <span className="text-sm text-[var(--color-brown-text)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-medium text-[var(--color-brown-dark)]">
                    Costo por persona: {opcion.precio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Brunch */}
        <div className="mb-16">
          <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
            Opciones de Brunch
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {opcionesBrunch.map((opcion, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden shadow-lg"
              >
                <div className="relative h-60 bg-black">
                  <Image 
                    src={brunchImages[index] || '/images/default-brunch.jpg'} 
                    alt={`Brunch ${opcion.nombre}`} 
                    layout="fill"
                    objectFit={index === 0 ? 'cover' : 'contain'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <div className="flex items-center space-x-3 mb-2">
                        <FaCoffee className="text-white" />
                        <h4 className="text-2xl font-[var(--font-display)]">{opcion.nombre}</h4>
                      </div>
                      <p className="text-sm opacity-90">Desayuno Buffet</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h5 className="font-semibold text-[var(--color-brown-dark)] mb-4">Incluye:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h6 className="font-medium text-[var(--color-brown-dark)] mb-2">Servicio y Bebidas:</h6>
                      <ul className="space-y-2">
                        {opcion.servicio.map((item, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                            <span className="text-sm text-[var(--color-brown-text)]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-medium text-[var(--color-brown-dark)] mb-2">Guisados:</h6>
                      <ul className="space-y-2">
                        {opcion.guisados.map((item, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                            <span className="text-sm text-[var(--color-brown-text)]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h6 className="font-medium text-[var(--color-brown-dark)] mb-2">Guarniciones:</h6>
                    <ul className="space-y-2 mb-6">
                      {opcion.guarniciones.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                          <span className="text-sm text-[var(--color-brown-text)]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <p className="font-medium text-[var(--color-brown-dark)]">
                    Costo por persona: {opcion.precio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Opciones de Bebidas */}
        <div className="mb-16">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="p-8">
              <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6 text-center">
                Opciones de Bebidas
              </h3>
              <p className="text-center text-[var(--color-brown-text)] mb-8">
                En caso de incluir barra libre por 4 horas tenemos las siguientes opciones:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-[var(--color-cream-light)] p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Barra Libre Plata</h4>
                  <ul className="space-y-2 mb-6">
                    {barraLibrePlata.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                        <span className="text-[var(--color-brown-medium)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-medium text-[var(--color-brown-dark)]">
                    Costo por persona: $250.00 (4 Horas)
                  </p>
                </div>
                
                <div className="bg-[var(--color-cream-light)] p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Barra Libre Oro</h4>
                  <ul className="space-y-2 mb-6">
                    {barraLibreOro.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                        <span className="text-[var(--color-brown-medium)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-medium text-[var(--color-brown-dark)]">
                    Costo por persona: $300.00 (4 Horas)
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--color-cream-light)] p-4 rounded-lg">
                  <h5 className="font-medium text-[var(--color-brown-dark)] mb-2">Cartones de Cervezas</h5>
                  <p className="text-sm text-[var(--color-brown-medium)] mb-2">
                    Ampolletas de 24 (Victoria/coronita) - $600.00 cada cartón
                  </p>
                </div>
                
                <div className="bg-[var(--color-cream-light)] p-4 rounded-lg">
                  <h5 className="font-medium text-[var(--color-brown-dark)] mb-2">Barra Libre de Cerveza</h5>
                  <p className="text-sm text-[var(--color-brown-medium)] mb-2">
                    Costo por persona: $200.00 (4 horas)
                  </p>
                </div>
                
                <div className="bg-[var(--color-cream-light)] p-4 rounded-lg">
                  <h5 className="font-medium text-[var(--color-brown-dark)] mb-2">Barra de Clamatos</h5>
                  <p className="text-sm text-[var(--color-brown-medium)] mb-2">
                    Costo por persona: $60.00 (4 horas)
                  </p>
                </div>
                
                <div className="bg-[var(--color-cream-light)] p-4 rounded-lg">
                  <h5 className="font-medium text-[var(--color-brown-dark)] mb-2">Barra de Gin</h5>
                  <p className="text-sm text-[var(--color-brown-medium)] mb-2">
                    Costo por persona: $180.00 (2 horas)
                  </p>
                </div>
                
                <div className="bg-[var(--color-cream-light)] p-4 rounded-lg">
                  <h5 className="font-medium text-[var(--color-brown-dark)] mb-2">Refrescos y Mezcladores</h5>
                  <p className="text-sm text-[var(--color-brown-medium)] mb-2">
                    Costo por persona: $60.00 (4 Horas)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="mb-16">
          <div className="bg-[var(--color-cream-light)] p-8 rounded-xl">
            <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6 text-center">
              Ubicación
            </h3>
            
            <div className="flex items-center justify-center mb-6">
              <div className="h-1 w-20 bg-[var(--color-brown-medium)]"></div>
            </div>
            
            <p className="text-center text-[var(--color-brown-text)] mb-4 font-medium">
              CARRETERA FEDERAL CUERNAVACA-CUAUTLA, KM.32, LOCALIDAD LOS ARCOS
            </p>
            <p className="text-center text-[var(--color-brown-text)] mb-8 font-medium">
              YAUTEPEC, MORELOS
            </p>
            
            <div className="text-center">
              <p className="text-[var(--color-brown-dark)] font-semibold italic">
                AGRADECEMOS QUE NOS HAYAS ELEGIDO COMO OPCIÓN PARA LLEVAR A CABO TAN IMPORTANTE EVENTO.
              </p>
              <p className="text-[var(--color-brown-dark)] font-semibold italic mt-2">
                HACIENDA SAN CARLOS TE DA LAS MÁS CORDIAL BIENVENIDA Y TE INVITA A VIVIR UNA EXPERIENCIA ÚNICA EN LA CONTRATACIÓN DE NUESTROS SERVICIOS.
              </p>
              <p className="text-[var(--color-brown-dark)] font-semibold italic mt-2">
                VIVE LA EXPERIENCIA Y CÁSATE EN EL MEJOR LUGAR DE MORELOS.
              </p>
            </div>
          </div>
        </div>

        {/* Llamada a la acción */}
        <div className="text-center">
          <a 
            href="/reservar?servicio=coctel" 
            className="inline-flex items-center space-x-2 bg-[var(--color-brown-medium)] text-white px-8 py-4 rounded-lg hover:bg-[var(--color-brown-dark)] transition-colors"
          >
            <FaGlassMartiniAlt />
            <span>Cotiza tu cóctel o brunch</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Datos de opciones
const opcionesCoctel = [
  {
    nombre: "Box Lunch",
    items: [
      "Salas Lounge / Periqueras",
      "Barra de Fruta de Temporada o Crudites (jícama, pepino, zanahoria)",
      "1 Bagel de Jamón y queso",
      "Café Americano o Té",
      "Surtido de Galletas"
    ],
    precio: "$ 250.00"
  },
  {
    nombre: "Opción 1",
    items: [
      "Salas Lounge",
      "Canapés mexicanos",
      "Crudites",
      "1 hr de Coctelería (Margaritas, mojitos)",
      "Aguas frescas"
    ],
    precio: "$ 350.00"
  },
  {
    nombre: "Opción 2",
    items: [
      "Salas Lounge /Periqueras",
      "Canapés Internacionales y tablas de quesos",
      "1 hr Cockteleria (margaritas, mojitos)",
      "Aguas frescas"
    ],
    precio: "$ 400.00"
  },
  {
    nombre: "Opción 3: Barra ensaladas y pastas",
    items: [
      "Salas Lounge",
      "Comida montada tipo buffet (3 tiempos) o servicio en mesa",
      "Tabla de Quesos y Carnes frías",
      "Ensalada San Carlos / (mezcla de lechugas, nuez, queso panela, mango, manzana y aderezo de Jamaica)",
      "Ensalada César",
      "Fetuccini con mariscos en salsa de tres quesos",
      "Espagueti al pesto",
      "Aguas frescas"
    ],
    precio: "$ 430.00"
  },
  {
    nombre: "Opción 4: Parrillada",
    items: [
      "Salas Lounge",
      "Arrachera",
      "Cecina, Cecina Enchilada, Pechugas de Pollo",
      "Longaniza, Chorizo",
      "Nopales",
      "Arroz",
      "Quesadillas, sopes",
      "Frijoles",
      "Aguas Frescas"
    ],
    precio: "$ 550.00"
  },
  {
    nombre: "Opción 5: Variedad de Tacos",
    items: [
      "Salas Lounge",
      "Tacos al Pastor, Tacos de Bistec, Tacos de Costilla, Alambre de Res",
      "Quesadilla y Gringas",
      "Aguas Frescas"
    ],
    precio: "$ 380.00"
  },
  {
    nombre: "Opción 6: Tacos Al pastor",
    items: [
      "Salas Lounge",
      "Tacos al Pastor",
      "Aguas Frescas"
    ],
    precio: "$ 300.00"
  },
  {
    nombre: "Opción 7: Pizzas y Ensaladas",
    items: [
      "Salas Lounge",
      "Aguas frescas",
      "1 hr De Cócteleria (Margaritas, Mojitos)",
      "Barra de Pizzas y Ensaladas",
      "Ensalada Cesar y San Carlos",
      "Salas Lounge"
    ],
    precio: "$ 550.00"
  },
  {
    nombre: "Opción 8: Cazuelas de Guisado",
    items: [
      "Salas Lounge",
      "5 Guisados a elegir (Chicharrón en salsa, Tinga de Pollo, Bistec a la mexicana, Cerdo en Salsa de Cacahuate, Rajas con crema, Mole con pollo, Picadillo, Chorizo c/ papas)",
      "Quesadillas, Sopes, Tacos dorados",
      "Nopales a la Mexicana",
      "Arroz y frijoles",
      "Tortillas a mano",
      "Aguas frescas",
      "Hielo"
    ],
    precio: "$ 480.00"
  }
];

const opcionesBrunch = [
  {
    nombre: "Paquete 1",
    servicio: [
      "Servicio de meseros y mobiliario",
      "Jugo de Naranja",
      "Fruta de la estación",
      "Café de Grano",
      "Pan Dulce",
      "Aguas Frescas de Frutas Naturales",
      "Hielo para el evento",
      "Pan Salado"
    ],
    guisados: [
      "Chicharron en salsa verde",
      "Rajas c/crema (rajas, elote, queso cincho)",
      "Chilaquiles con pollo",
      "Quesadillas de tinga de pollo y queso Oaxaca",
      "Cecina de yecapixtla"
    ],
    guarniciones: [
      "Frijoles refritos",
      "Nopales sofritos con chile de árbol",
      "Barra de salsas (roja, verde, rajas)",
      "Cebollas cambray",
      "Tortillas hechas al momento"
    ],
    precio: "$400.00 por/persona"
  },
  {
    nombre: "Paquete 2",
    servicio: [
      "Servicio de meseros y mobiliario",
      "Fruta de la estación",
      "Café de Grano",
      "Pan Dulce",
      "Aguas Frescas de Frutas Naturales",
      "Hielo para el evento",
      "Pan Salado"
    ],
    guisados: [
      "Huevo en salsa verde",
      "Huevo con jamón",
      "Chicharron en salsa verde",
      "Chilaquiles con pollo",
      "Variedad de quesadillas"
    ],
    guarniciones: [
      "Frijoles refritos",
      "Nopales sofritos con chile de árbol",
      "Barra de salsas (roja, verde, rajas)",
      "Tortillas hechas al momento"
    ],
    precio: "$400.00 por/persona"
  }
];

const barraLibrePlata = [
  "Etiqueta Roja",
  "Appleton especial",
  "Tequila Jimador o 100 años",
  "Vodka smirnoff"
];

const barraLibreOro = [
  "Etiqueta negra",
  "Bacardi o appleton state",
  "Tequila tradicional",
  "Vodka Stolishnaya o absolut"
];

export default CoctelBrunchSection;
