import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaUtensils, FaWineGlassAlt, FaCheck } from 'react-icons/fa';

const BanquetesSection = () => {
  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Introducción */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6">Banquetes y Montajes</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-[var(--color-brown-text)]">
              Ofrecemos una experiencia gastronómica excepcional con opciones de montaje elegantes
              para crear el ambiente perfecto para tu evento.
            </p>
          </div>
        </div>

        {/* Tipos de Montaje */}
        <div className="mb-16">
          <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
            ¿Qué tipo de montaje puedo elegir?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Montaje Incluido */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="relative h-60">
                <Image 
                  src="/images/montaje-incluido.jpg" 
                  alt="Montaje Incluido" 
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h4 className="text-2xl font-[var(--font-display)] mb-2">Montaje Incluido</h4>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <ul className="space-y-3">
                  {montajeIncluido.map((item, index) => (
                    <motion.li 
                      key={index} 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-2"
                    >
                      <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                      <span className="text-[var(--color-brown-medium)]">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Montaje Premium */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="relative h-60">
                <Image 
                  src="/images/montaje-premium.jpg" 
                  alt="Montaje Premium" 
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h4 className="text-2xl font-[var(--font-display)] mb-2">Montaje Premium</h4>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <ul className="space-y-3">
                  {montajePremium.map((item, index) => (
                    <motion.li 
                      key={index} 
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-2"
                    >
                      <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                      <span className="text-[var(--color-brown-medium)]">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bebidas */}
        <div className="mb-16">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <FaWineGlassAlt className="text-2xl text-[var(--color-brown-dark)]" />
                  <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)]">¿Y las bebidas?</h3>
                </div>
                
                <p className="text-[var(--color-brown-text)] mb-6">
                  Nuestro servicio más completo, ya te incluye barra libre, ten en cuenta
                  que siempre será una ventaja tener éste servicio, pues así te
                  despreocupas de tener que cargar cajas, cazar ofertas y que te sobre
                  o te falte alguna bebida durante tu evento. Una barra libre es garantía
                  de que nunca se negará ninguna bebida solicitada por tus invitados.
                  También puedes incluir el servicio sobre un paquete más básico o
                  más completo.
                </p>
                
                <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Opciones de Barra Libre:</h4>
                
                <div className="space-y-6">
                  <div className="bg-[var(--color-cream-light)] p-4 rounded-lg">
                    <h5 className="font-semibold text-[var(--color-brown-dark)] mb-2">Barra Libre Platinum por 10 hrs</h5>
                    <ul className="space-y-2">
                      {barraLibrePlatinum.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                          <span className="text-[var(--color-brown-text)]">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 font-medium text-[var(--color-brown-dark)]">Costo por persona: $280.00</p>
                  </div>
                  
                  <div className="bg-[var(--color-cream-light)] p-4 rounded-lg">
                    <h5 className="font-semibold text-[var(--color-brown-dark)] mb-2">Barra Libre Oro por 10 hrs</h5>
                    <ul className="space-y-2">
                      {barraLibreOro.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                          <span className="text-[var(--color-brown-text)]">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 font-medium text-[var(--color-brown-dark)]">Costo por persona: $350.00</p>
                  </div>
                  
                  <p className="text-[var(--color-brown-text)]">
                    El descorche por evento es de $5000.00, en caso de no contratar barra libre.
                  </p>
                </div>
              </div>
              <div className="relative h-full min-h-[500px]">
                <Image 
                  src="/images/bebidas-barra.jpg" 
                  alt="Bebidas y Barra Libre" 
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Galería de Banquetes */}
        <div className="mb-16">
          <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6 text-center">
            Nuestros Banquetes
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div key={num} className="relative h-48 rounded-lg overflow-hidden">
                <Image 
                  src={`/images/banquete-${num}.jpg`} 
                  alt={`Banquete ejemplo ${num}`} 
                  layout="fill"
                  objectFit="cover"
                  className="hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Coordinación de Evento */}
        <div className="mb-16">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="p-8">
              <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6 text-center">
                ¿Qué incluye mi servicio de coordinación?
              </h3>
              
              <p className="text-[var(--color-brown-medium)] text-center mb-8 max-w-3xl mx-auto">
                En su servicio integral, tiene presupuestado coordinación integral y ES UN
                SEGURO PARA SU EVENTO, será su hada madrina, si desean despreocuparse por
                todo, que coordinemos y diseñemos de principio a fin su evento,
                organizando logística, diseño, decoración, montaje, minuto a minuto, pagos,
                layout, llamadas de confirmación, invitación digital, entrega de documentos
                a iglesia, civil. Etc. Ustedes sólo se encargarán de disfrutar al máximo ese
                gran día dejando todo en nuestras manos.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--color-cream-light)] p-6 rounded-lg text-center">
                  <div className="w-16 h-16 bg-[var(--color-brown-medium)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-[var(--color-brown-dark)] mb-2">Planificación</h4>
                  <p className="text-sm text-[var(--color-brown-text)]">
                    Organizamos cada detalle de tu evento, desde la logística hasta el diseño.
                  </p>
                </div>
                
                <div className="bg-[var(--color-cream-light)] p-6 rounded-lg text-center">
                  <div className="w-16 h-16 bg-[var(--color-brown-medium)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-[var(--color-brown-dark)] mb-2">Coordinación</h4>
                  <p className="text-sm text-[var(--color-brown-text)]">
                    Supervisamos a todos los proveedores y el desarrollo del evento minuto a minuto.
                  </p>
                </div>
                
                <div className="bg-[var(--color-cream-light)] p-6 rounded-lg text-center">
                  <div className="w-16 h-16 bg-[var(--color-brown-medium)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-[var(--color-brown-dark)] mb-2">Ejecución</h4>
                  <p className="text-sm text-[var(--color-brown-text)]">
                    Nos encargamos de que todo salga perfecto para que tú solo disfrutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Llamada a la acción */}
        <div className="text-center">
          <a 
            href="/reservar?servicio=banquete" 
            className="inline-flex items-center space-x-2 bg-[var(--color-brown-medium)] text-white px-8 py-4 rounded-lg hover:bg-[var(--color-brown-dark)] transition-colors"
          >
            <FaUtensils />
            <span>Cotiza tu banquete</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Datos de montajes y bebidas
const montajeIncluido = [
  "Sillas Cross Back, Luis XV ó Wishone",
  "Mesas redondas o cuadradas con mantelería importada",
  "Mesas de madera redondas rectangulares o cuadradas",
  "Mesas gigantes o imperiales",
  "Servilleta con tonalidad a elegir",
  "Cristalería importada",
  "Copas artesanales",
  "Plato base de diseño",
  "Cubierto plata"
];

const montajePremium = [
  "Mesa de cristal",
  "Mesas mármol",
  "Mesas rectangular negra",
  "Sillas Pavorreal para novios",
  "Equipales novios",
  "Silla Janeth Funda Gris",
  "Silla Pretty",
  "Silla Piraámide",
  "Sillaón maple",
  "Silla Basquet",
  "Cubierto oro / cobre o negro"
];

const barraLibrePlatinum = [
  "RON (APPLETON DORADO / BACARDI)",
  "BRANDY TORRES 5",
  "TEQUILA 100 AÑOS (AZUL O VERDE)",
  "VODKA SMIRNOFF",
  "WHISKEY (JB O JOHNNY WALKER)",
  "GINEBRA DARGENT",
  "CERVEZA (CÓCTEL)"
];

const barraLibreOro = [
  "RON (APPLETON STATE/BACARDI BRANDY TORRES 10",
  "TEQUILA (TRADICIONAL/CAZADORES Y DON JULIO)",
  "VODKA (ABSOLUT / STOLISCHNAYA)",
  "WHISKEY (BUCHANAN´S / ETIQUETA NEGRA)",
  "GINEBRA TANQUERAY",
  "CERVEZA (CÓCTEL)"
];

export default BanquetesSection;
