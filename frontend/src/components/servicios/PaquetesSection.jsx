import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaGlassCheers, FaCheck } from 'react-icons/fa';

const PaquetesSection = () => {
  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Introducción */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6">Nuestros Paquetes</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-[var(--color-brown-text)]">
              Ofrecemos diferentes opciones para que encuentres el paquete perfecto para tu evento.
              Cada uno está diseñado para brindarte una experiencia inolvidable en nuestra hacienda.
            </p>
          </div>
        </div>

        {/* Paquete Básico */}
        <div className="mb-16">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="relative h-60">
              <Image 
                src="/images/paquete-basico.jpg" 
                alt="Paquete Básico" 
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h3 className="text-3xl font-[var(--font-display)] mb-2">Paquete Básico</h3>
                  <p className="text-lg opacity-90">La opción perfecta para comenzar</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Incluye:</h4>
                  <ul className="space-y-3">
                    {paqueteBasico.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                        <span className="text-[var(--color-brown-text)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Precios por persona:</h4>
                  <ul className="space-y-3">
                    {preciosBasico.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                        <span className="text-[var(--color-brown-text)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-[var(--color-brown-text)]">
                    *PRECIOS SUJETOS A CAMBIO SIN PREVIO AVISO.<br />
                    TODOS NUESTROS PRECIOS SON SIN IVA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paquete Platinum */}
        <div className="mb-16">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="relative h-60">
              <Image 
                src="/images/paquete-platinum.jpg" 
                alt="Paquete Platinum" 
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h3 className="text-3xl font-[var(--font-display)] mb-2">Paquete Platinum</h3>
                  <p className="text-lg opacity-90">Eleva tu experiencia con servicios premium</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Incluye:</h4>
                  <ul className="space-y-3">
                    {paquetePlatinum.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                        <span className="text-[var(--color-brown-text)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Precios por persona:</h4>
                  <ul className="space-y-3">
                    {preciosPlatinum.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                        <span className="text-[var(--color-brown-text)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-[var(--color-brown-text)]">
                    *PRECIOS SUJETOS A CAMBIO SIN PREVIO AVISO.<br />
                    TODOS NUESTROS PRECIOS SON SIN IVA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paquete Oro */}
        <div className="mb-16">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="relative h-60">
              <Image 
                src="/images/paquete-oro.jpg" 
                alt="Paquete Oro" 
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h3 className="text-3xl font-[var(--font-display)] mb-2">Paquete Oro</h3>
                  <p className="text-lg opacity-90">La experiencia más completa y exclusiva</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Incluye:</h4>
                  <ul className="space-y-3">
                    {paqueteOro.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                        <span className="text-[var(--color-brown-text)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mt-6 mb-4">Barra Libre Oro por 10 hrs:</h4>
                  <ul className="space-y-3">
                    {barraLibreOro.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                        <span className="text-[var(--color-brown-text)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Precios por persona:</h4>
                  <ul className="space-y-3">
                    {preciosOro.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                        <span className="text-[var(--color-brown-text)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-[var(--color-brown-text)]">
                    *PRECIOS SUJETOS A CAMBIO SIN PREVIO AVISO.<br />
                    TODOS NUESTROS PRECIOS SON SIN IVA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Llamada a la acción */}
        <div className="text-center">
          <a 
            href="/reservar?tipo=evento" 
            className="inline-flex items-center space-x-2 bg-[var(--color-brown-medium)] text-black px-8 py-4 rounded-lg hover:bg-[var(--color-brown-dark)] transition-colors"
          >
            <FaGlassCheers className="text-black" />
            <span>Cotiza tu evento ahora</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Datos de paquetes
const paqueteBasico = [
  "RENTA DEL LUGAR POR 12 HORAS (Límite Para Finalizar Evento 3 am)",
  "ÁREA PARA MONTAJE CIVIL",
  "ÁREA PARA RECEPCION",
  "CAPILLA Y DECORACION BASICA",
  "ILUMINACIÓN ARQUITECTÓNICA",
  "PERSONAL DE SEGURIDAD",
  "PERSONAL DE SERVICIO",
  "MENU DE 3 ó 4 TIEMPOS",
  "1 MESAS CLÁSICAS Y/O MADERA POR CADA 10 PERSONAS",
  "VARIEDAD DE SILLAS",
  "LOZA",
  "1 CENTROS DE MESA POR CADA 10 PERSONAS",
  "1 MESERO POR MESA DURANTE TODO EL EVENTO",
  "REFRESCOS, JUGO Y HIELO COMO MEZCLADORES",
  "CRISTALERÍA IMPORTADA",
  "MANTELERÍA NACIONAL O IMPORTADA",
  "PISTA DE BAILE MADERA O CRISTAL ILUMINADA",
  "ESQUITES",
  "CARRO DE PAPAS O MESA DE DULCES",
  "COCKTAIL DE BIENVENIDA",
  "PIROTECNIA FRIA (NO ÀEREA)",
  "TORNA FIESTA",
  "SALAS LOUNGE",
  "PERIQUERAS",
  "EDECANES",
  "PLANTA DE LUZ",
  "VALET PARKING",
  "COORDINACION DEL EVENTO"
];

const preciosBasico = [
  "DE 100 A 149 packs $4045.00",
  "DE 150 A 199 packs: $3083.00",
  "DE 200 A 249 packs: $2602.00",
  "DE 250 A 299 packs: $2314.00",
  "DE 300 A 349 packs: $2125.00",
  "DE 350 A 399 packs: $1987.00",
  "DE 400 A 449 packs: $1889.00",
  "DE 450 A 499 packs: $1808.00",
  "DE 500 A 549 packs: $1747.00"
];

const paquetePlatinum = [
  "RENTA DEL LUGAR POR 12 HORAS (Límite Para Finalizar Evento 3 am)",
  "ÁREA PARA MONTAJE CIVIL",
  "ÁREA PARA RECEPCION",
  "CAPILLA Y DECORACION BASICA",
  "ILUMINACIÓN ARQUITECTÓNICA",
  "PERSONAL DE SEGURIDAD",
  "PERSONAL DE SERVICIO",
  "MENU DE 3 ó 4 TIEMPOS",
  "1 MESAS CLÁSICAS Y/O MADERA POR CADA 10 PERSONAS",
  "VARIEDAD DE SILLAS",
  "LOZA",
  "1 CENTROS DE MESA POR CADA 10 PERSONAS",
  "DJ COBERTURA TOTAL O FOTOGRAFIA Y VIDEO",
  "1 MESERO POR MESA DURANTE TODO EL EVENTO",
  "REFRESCOS, JUGO Y HIELO COMO MEZCLADORES",
  "CRISTALERÍA IMPORTADA",
  "MANTELERÍA NACIONAL O IMPORTADA",
  "PISTA DE BAILE MADERA O CRISTAL ILUMINADA",
  "ESQUITES",
  "MESA DE QUESOS O MESA DE DULCES PLATINUM",
  "COCKTAIL DE BIENVENIDA",
  "PIROTECNIA FRIA (NO ÀEREA)",
  "TORNA FIESTA",
  "SALAS LOUNGE",
  "PERIQUERAS",
  "EDECANES",
  "PLANTA DE LUZ",
  "VALET PARKING",
  "COORDINACION DEL EVENTO"
];

const preciosPlatinum = [
  "DE 100 A 149 packs $4355.00",
  "DE 150 A 199 packs: $3293.00",
  "DE 200 A 249 packs: $2762.00",
  "DE 250 A 299 packs: $2444.00",
  "DE 300 A 349 packs: $2235.00",
  "DE 350 A 399 packs: $2082.00",
  "DE 400 A 449 packs: $1974.00",
  "DE 450 A 499 packs: $1884.00",
  "DE 500 A 549 packs: $1817.00"
];

const paqueteOro = [
  "RENTA DEL LUGAR POR 12 HORAS (Límite Para Finalizar Evento 3 am)",
  "ÁREA PARA MONTAJE CIVIL",
  "ÁREA PARA RECEPCION",
  "CAPILLA Y DECORACION BASICA",
  "ILUMINACIÓN ARQUITECTÓNICA",
  "PERSONAL DE SEGURIDAD",
  "PERSONAL DE SERVICIO",
  "MENU DE 3 ó 4 TIEMPOS",
  "1 MESAS CLÁSICAS Y/O MADERA POR CADA 10 PERSONAS",
  "VARIEDAD DE SILLAS",
  "LOZA",
  "1 CENTROS DE MESA POR CADA 10 PERSONAS",
  "DJ COBERTURA TOTAL",
  "FOTOGRAFIA Y VIDEO",
  "1 MESERO POR MESA DURANTE TODO EL EVENTO",
  "REFRESCOS, JUGO Y HIELO COMO MEZCLADORES",
  "CRISTALERÍA IMPORTADA",
  "MANTELERÍA NACIONAL O IMPORTADA",
  "PISTA DE BAILE MADERA O CRISTAL ILUMINADA",
  "ESQUITES",
  "HELADOS",
  "MESA DE QUESOS O MESA DE DULCES PLATINUM",
  "COCKTAIL DE BIENVENIDA",
  "A ELEGIR 1 OPCION (MARIACHI, BANDA, SAX, TRIO, MARIMBA)",
  "PIROTECNIA FRIA (NO ÀEREA)",
  "TORNA FIESTA",
  "SALAS LOUNGE",
  "PERIQUERAS",
  "EDECANES",
  "PLANTA DE LUZ",
  "VALET PARKING",
  "COORDINACION DEL EVENTO"
];

const barraLibreOro = [
  "RON (APPLETON STATE/BACARDI BRANDY TORRES 10",
  "TEQUILA (TRADICIONAL/CAZADORES Y DON JULIO)",
  "VODKA (ABSOLUT / STOLISCHNAYA)",
  "WHISKEY (BUCHANAN´S / ETIQUETA NEGRA)",
  "GINEBRA TANQUERAY",
  "CERVEZA"
];

const preciosOro = [
  "DE 100 A 149 packs $5135.00",
  "DE 150 A 199 packs: $3940.00",
  "DE 200 A 249 packs: $3342.00",
  "DE 250 A 299 packs: $2984.00",
  "DE 300 A 349 packs: $2748.00",
  "DE 350 A 399 packs: $2577.00",
  "DE 400 A 449 packs: $2454.00",
  "DE 450 A 499 packs: $2353.00",
  "DE 500 A 549 packs: $2284.00"
];

export default PaquetesSection;
