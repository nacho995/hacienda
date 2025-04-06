"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaClock, FaChevronRight } from 'react-icons/fa';
import { getTiposMasaje } from '@/services/masajeService';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useReservation } from '@/context/ReservationContext';

export default function ServicesSection() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Usar el contexto de reservaciones para acceder a los masajes seleccionados
  const { 
    masajesSeleccionados, 
    agregarMasaje, 
    eliminarMasaje, 
    agregarMasajes,
    calcularTotalMasajes
  } = useReservation();

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

  const handleMasajeSelect = (masaje) => {
    const estaSeleccionado = masajesSeleccionados.some(m => m.id === masaje.id);
    
    if (estaSeleccionado) {
      // Si ya está seleccionado, lo eliminamos
      eliminarMasaje(masaje.id);
    } else {
      // Si no está seleccionado, lo agregamos
      agregarMasaje(masaje);
    }
  };

  const handleConfirmarSeleccion = () => {
    if (masajesSeleccionados.length === 0) {
      toast.error('Por favor, seleccione al menos un masaje');
      return;
    }

    toast.success(`Seleccionado ${masajesSeleccionados.length} masajes. Continuando con la reserva...`);
    
    // Redirigir a la página de reserva con el fragmento para ir directamente a la sección de servicios
    router.push('/reservar#paso-1');
  };

  if (loading) {
    return (
      <section className="py-24">
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
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-xl text-gray-600">
                {error || 'No hay servicios de masaje disponibles en este momento'}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section id="servicios" className="py-24 services-section">
      <div className="container mx-auto px-6">
        {/* Banner informativo */}
        <div className="mb-8 bg-[var(--color-primary)]/10 p-6 rounded-lg border-l-4 border-[var(--color-primary)]">
          <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-4">
            Masajes de Lujo
          </h3>
          <div className="space-y-4 text-gray-700">
            <p className="font-medium text-[var(--color-accent)] text-lg mb-6">
              Nuestros servicios de masaje están disponibles exclusivamente como complemento para su evento en la hacienda
            </p>
            <div className="space-y-3">
              <p className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-3"></span>
                Seleccione los masajes de su preferencia explorando nuestro catálogo
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-3"></span>
                Puede elegir múltiples servicios según sus necesidades
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-3"></span>
                La fecha y hora de los masajes se programarán durante su evento en la hacienda
              </p>
            </div>
            <div className="mt-8 p-5 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/10 rounded-lg">
              <p className="text-[var(--color-accent)] font-medium">
                Recomendamos reservar sus masajes con anticipación para garantizar la disponibilidad de los terapeutas
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
            Servicios de Masaje
          </h2>
          <div className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Descubra nuestra exclusiva selección de tratamientos terapéuticos diseñados para revitalizar su cuerpo y mente.
          </p>
        </div>

        {masajesSeleccionados.length > 0 && (
          <div className="mb-8 bg-[var(--color-cream-light)] p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-[var(--color-accent)]">Masajes Seleccionados</h3>
            <div className="space-y-3">
              {masajesSeleccionados.map((masaje, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium text-lg">{masaje.titulo}</p>
                    <p className="text-sm text-gray-600">Duración: {masaje.duracion}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-lg">${masaje.precio}</p>
                    <button
                      onClick={() => eliminarMasaje(masaje.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="font-medium text-lg">Total:</p>
                    <p className="text-gray-600">{masajesSeleccionados.length} masajes seleccionados</p>
                  </div>
                  <p className="font-semibold text-2xl text-[var(--color-accent)]">
                    ${calcularTotalMasajes()}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => router.push('/habitaciones')}
                    className="flex-1 bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] px-6 py-3 rounded-lg hover:bg-[var(--color-primary)]/5 transition-colors font-medium"
                  >
                    Agregar Habitaciones
                  </button>
                  <button
                    onClick={() => {
                      toast.success(`Seleccionado ${masajesSeleccionados.length} masajes. Continuando con la reserva...`);
                      router.push('/reservar#paso-1');
                    }}
                    className="flex-1 bg-[var(--color-accent)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-accent)]/90 transition-colors font-medium"
                  >
                    Continuar con la Reserva
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Listado de masajes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {servicios.map((servicio) => {
            const estaSeleccionado = masajesSeleccionados.some(m => m.id === servicio.id);
            
            return (
              <motion.div
                key={servicio.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-50px" }}
                className={`flex flex-col md:flex-row gap-8 group cursor-pointer ${
                  estaSeleccionado ? 'ring-2 ring-[var(--color-primary)] rounded-lg' : ''
                }`}
                onClick={() => handleMasajeSelect(servicio)}
              >
                <div className="relative w-full md:w-1/3 aspect-square">
                  <Image
                    src={servicio.imagen || '/images/placeholder/massage.jpg'}
                    alt={servicio.titulo}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-[var(--color-accent)] group-hover:text-[var(--color-primary)] transition-colors">
                    {servicio.titulo}
                  </h3>
                  <p className="text-gray-600 mt-2 flex-grow">
                    {servicio.descripcion}
                  </p>
                  <div className="flex items-center mt-3 text-sm text-gray-500">
                    <FaClock className="mr-2 text-[var(--color-primary)]" /> {servicio.duracion}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-semibold text-lg">${servicio.precio}</span>
                    <FaChevronRight className="text-[var(--color-primary)] group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 