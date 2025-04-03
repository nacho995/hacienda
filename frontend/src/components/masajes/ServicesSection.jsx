"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaClock, FaChevronRight } from 'react-icons/fa';

// Datos de servicios de masajes
const SERVICIOS_MASAJE = [
  {
    id: 1,
    nombre: "Masaje Relajante con Aromaterapia",
    descripcion: "Sumérgete en un oasis de tranquilidad con nuestro masaje relajante que combina técnicas suaves con aceites esenciales para aliviar el estrés y la tensión.",
    duracion: "60 / 90 min",
    precio: 1200,
    imagen: "/images/placeholder/massage1.svg",
    destacado: true,
    beneficios: [
      "Reduce el estrés y la ansiedad",
      "Mejora la calidad del sueño",
      "Alivia dolores musculares",
      "Aumenta la circulación sanguínea"
    ]
  },
  {
    id: 2,
    nombre: "Masaje de Piedras Calientes",
    descripcion: "Experimenta el poder curativo de las piedras volcánicas calientes combinadas con técnicas de masaje que alivian profundamente la tensión muscular.",
    duracion: "75 min",
    precio: 1500,
    imagen: "/images/placeholder/massage2.svg",
    destacado: false,
    beneficios: [
      "Desbloquea nudos musculares profundos",
      "Mejora la flexibilidad",
      "Estimula el metabolismo",
      "Reduce la inflamación"
    ]
  },
  {
    id: 3,
    nombre: "Ritual Herbal Detox",
    descripcion: "Un tratamiento holístico que comienza con exfoliación, seguido de un masaje con hierbas mexicanas tradicionales que desintoxican y revitalizan el cuerpo.",
    duracion: "90 min",
    precio: 1700,
    imagen: "/images/placeholder/massage3.svg",
    destacado: false,
    beneficios: [
      "Elimina toxinas del cuerpo",
      "Hidrata y nutre la piel",
      "Mejora el sistema linfático",
      "Equilibra las energías corporales"
    ]
  },
  {
    id: 4,
    nombre: "Masaje Premium Hacienda",
    descripcion: "Nuestra experiencia insignia que combina diversas técnicas de masaje con tratamientos faciales, reflexología y aromaterapia para una renovación completa.",
    duracion: "120 min",
    precio: 2100,
    imagen: "/images/placeholder/massage4.svg",
    destacado: true,
    beneficios: [
      "Experiencia integral de bienestar",
      "Rejuvenecimiento facial y corporal",
      "Alivio total del estrés",
      "Sensación de renovación completa"
    ]
  }
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
            Nuestras Terapias
          </h2>
          <div className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Cada terapia está diseñada para proporcionar una experiencia sensorial única, adaptada a tus necesidades específicas.
          </p>
        </div>
        
        {/* Listado de masajes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {SERVICIOS_MASAJE.map((servicio) => (
            <motion.div
              key={servicio.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex flex-col md:flex-row gap-8 group"
            >
              <div className="md:w-1/2 relative overflow-hidden rounded-lg">
                <div className="aspect-w-4 aspect-h-3">
                  <Image
                    src={servicio.imagen}
                    alt={servicio.nombre}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {servicio.destacado && (
                    <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white text-sm px-4 py-1 font-medium">
                      Destacado
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:w-1/2">
                <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-accent)] mb-3">
                  {servicio.nombre}
                </h3>
                
                <div className="flex items-center mb-4 text-sm text-gray-600">
                  <FaClock className="mr-2 text-[var(--color-primary)]" />
                  <span>{servicio.duracion}</span>
                  <span className="mx-3">|</span>
                  <span className="font-semibold text-[var(--color-primary)]">
                    ${servicio.precio} MXN
                  </span>
                </div>
                
                <p className="text-gray-700 mb-5">
                  {servicio.descripcion}
                </p>
                
                <h4 className="font-medium text-[var(--color-accent)] mb-3">Beneficios:</h4>
                <ul className="space-y-2 mb-8">
                  {servicio.beneficios.map((beneficio, index) => (
                    <li key={index} className="flex items-start">
                      <FaChevronRight className="mt-1 mr-2 text-[var(--color-primary)] flex-shrink-0" />
                      <span className="text-gray-600">{beneficio}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/reservar"
                  className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Reservar Ahora
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 