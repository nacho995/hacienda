"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaClock, FaChevronRight } from 'react-icons/fa';
import { getTiposMasaje } from '@/services/masajeService';

export default function ServicesSection() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const tiposMasaje = await getTiposMasaje();
        setServicios(tiposMasaje);
      } catch (error) {
        console.error('Error al cargar los servicios:', error);
        setError('No se pudieron cargar los servicios');
      } finally {
        setLoading(false);
      }
    };

    cargarServicios();
  }, []);

  if (loading) {
    return (
      <section id="servicios" className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando servicios de masaje...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !servicios.length) {
    return (
      <section id="servicios" className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-xl text-gray-600">
                {error || 'No hay servicios disponibles en este momento'}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
          {servicios.map((servicio) => (
            <motion.div
              key={servicio._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex flex-col md:flex-row gap-8 group"
            >
              <div className="md:w-1/2 relative overflow-hidden rounded-lg">
                <div className="aspect-w-4 aspect-h-3">
                  <Image
                    src={servicio.imagen || '/images/placeholder/massage1.svg'}
                    alt={servicio.titulo}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>
              
              <div className="md:w-1/2">
                <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-accent)] mb-3">
                  {servicio.titulo}
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
                
                <Link
                  href={`/reservar?tipo=masaje&id=${servicio._id}&nombre=${encodeURIComponent(servicio.titulo)}&duracion=${encodeURIComponent(servicio.duracion)}&precio=${servicio.precio}`}
                  className="inline-flex items-center px-6 py-3 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Reservar como Servicio Adicional
                  <FaChevronRight className="ml-2" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 