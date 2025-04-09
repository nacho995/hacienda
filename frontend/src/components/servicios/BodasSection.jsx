import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaHeart, FaCheck } from 'react-icons/fa';

const BodasSection = () => {
  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Introducción */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6">Bodas en Hacienda San Carlos</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-[var(--color-brown-text)] mb-4">
              Sabemos el compromiso y detalle que debe llevar su boda y por ello nos encargaremos
              de hacer de ese día simplemente el mejor.
            </p>
            <p className="text-lg text-[var(--color-brown-text)]">
              Unir su vida para iniciar una nueva familia es crear felicidad y nos
              sentimos honrados que nos dejen ser parte de ese momento.
            </p>
          </div>
        </div>

        {/* Imagen principal con texto superpuesto */}
        <div className="relative rounded-xl overflow-hidden mb-16 h-[500px]">
          <Image 
            src="/images/boda-principal.jpg" 
            alt="Bodas en Hacienda San Carlos" 
            layout="fill"
            objectFit="cover"
            className="object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-8 text-white max-w-2xl">
              <h3 className="text-3xl font-[var(--font-display)] mb-4">¿Deseas agregar detalles?</h3>
              <p className="text-lg">
                Contamos con los mejores servicios para que tu boda sea espectacular
              </p>
            </div>
          </div>
        </div>

        {/* Servicios incluidos */}
        <div className="mb-16">
          <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
            ¿Qué Incluye mi Banquete en un servicio integral?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviciosBoda.map((servicio, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4"
              >
                <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                <p className="text-[var(--color-brown-text)]">{servicio}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Galería de imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="relative h-80 rounded-lg overflow-hidden">
              <Image 
                src={`/images/boda-galeria-${num}.jpg`} 
                alt={`Boda en Hacienda San Carlos ${num}`} 
                layout="fill"
                objectFit="cover"
                className="hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>

        {/* Llamada a la acción */}
        <div className="text-center">
          <a 
            href="/reservar?tipo=boda" 
            className="inline-flex items-center space-x-2 bg-[var(--color-brown-medium)] text-black px-8 py-4 rounded-lg hover:bg-[var(--color-brown-dark)] hover:text-black transition-colors"
          >
            <FaHeart />
            <span>Cotiza tu boda ahora</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Lista de servicios incluidos
const serviciosBoda = [
  "Servicio por 9 hrs a partir del cocktail de bienvenida",
  "Recepción: canapés a elección y cocktaleria acorde al menú seleccionado (No incluye alcohol, se agrega en caso de adquirir barra libre)",
  "Aguas frescas",
  "Menú tres tiempos pollo o cerdo o 4 tiempos res o pescado",
  "1 Mesero cada 10 packs",
  "Refrescos, hielos, agua quina, agua de garrafon, ilimitado",
  "Pan Artesanal",
  "Café Americano",
  "Prueba de menú para 4 packs (Persona extra tiene un costo de $500)",
  "Plato base a elegir",
  "Cubiertos plata (Oro, cobre tiene un costo adicional)",
  "Cristalería necesaria para bebidas",
  "Copa de vino tinto y blanco",
  "Dos menús impresos por mesa con tipografía de los novios",
  "Número de mesa",
  "Personal necesario para cocina",
  "Sillas Crossback, Luis Xv y wishone",
  "Mesas a elección (Consultar catálogo)",
  "Coordinador de banquete",
  "Capitán de meseros",
  "Elaboración de lay out en base a las mesas elegidas"
];

export default BodasSection;
