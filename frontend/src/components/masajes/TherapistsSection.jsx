"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

// Datos de terapeutas
const TERAPEUTAS = [
  {
    id: 1,
    nombre: "Alejandra Morales",
    especialidad: "Masaje Terapéutico y Aromaterapia",
    experiencia: "12 años",
    imagen: "/images/placeholder/therapist1.svg",
    bio: "Certificada en técnicas internacionales de masaje y experta en aromaterapia ancestral mexicana."
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    especialidad: "Masaje Deportivo y Descontracturante",
    experiencia: "8 años",
    imagen: "/images/placeholder/therapist2.svg", 
    bio: "Especialista en recuperación de lesiones deportivas y técnicas avanzadas de liberación miofascial."
  },
  {
    id: 3,
    nombre: "Sofía Juárez",
    especialidad: "Terapias Holísticas y Energéticas",
    experiencia: "15 años",
    imagen: "/images/placeholder/therapist3.svg",
    bio: "Maestra en terapias alternativas que integra técnicas tradicionales con enfoques energéticos modernos."
  }
];

export default function TherapistsSection() {
  return (
    <section className="py-20 bg-[var(--color-cream-light)]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
            Nuestros Terapeutas
          </h2>
          <div className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Expertos certificados que brindan experiencias excepcionales adaptadas a tus necesidades individuales.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {TERAPEUTAS.map((terapeuta, index) => (
            <motion.div
              key={terapeuta.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-white shadow-xl overflow-hidden group"
            >
              <div className="relative h-80 overflow-hidden">
                <Image
                  src={terapeuta.imagen}
                  alt={terapeuta.nombre}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-xl font-medium">{terapeuta.nombre}</h3>
                  <p className="text-white/80 text-sm">{terapeuta.especialidad}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4 text-sm">
                  <span className="text-[var(--color-primary)] font-medium mr-2">Experiencia:</span>
                  <span className="text-gray-700">{terapeuta.experiencia}</span>
                </div>
                
                <p className="text-gray-600">
                  {terapeuta.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 