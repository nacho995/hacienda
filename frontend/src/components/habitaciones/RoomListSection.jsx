"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaBed, FaUserFriends, FaRuler, FaCheck, FaChevronRight, FaHotel, FaCalendarAlt, FaUsers, FaCheckCircle, FaMapMarkedAlt } from 'react-icons/fa';
import { obtenerHabitaciones } from '@/services/habitaciones.service';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function RoomListSection({ onSelectRoom }) {
  const router = useRouter();
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cargar habitaciones desde la API
    const cargarHabitaciones = async () => {
      try {
        const data = await obtenerHabitaciones();
        console.log('Habitaciones cargadas:', data);
        
        // Verificar que todas las habitaciones tienen un tipo o un ID
        data.forEach((habitacion, index) => {
          if (!habitacion.tipo && !habitacion._id) {
            console.warn(`Habitación #${index} sin tipo ni ID:`, habitacion);
          }
        });
        
        setHabitaciones(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar habitaciones:', error);
        setError('No se pudieron cargar las habitaciones');
        setLoading(false);
      }
    };

    cargarHabitaciones();
  }, []);

  const handleHabitacionSelect = (habitacion) => {
    // Solo seleccionar la habitación para mostrar sus detalles
    onSelectRoom(habitacion);
  };

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-[var(--color-primary)]">
        Nuestras Habitaciones
      </h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando habitaciones...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">Error al cargar las habitaciones: {error}</p>
        </div>
      ) : (
        <>
          {/* Lista de habitaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitaciones.map((habitacion) => (
              <motion.div
                key={habitacion._id || habitacion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                onClick={() => handleHabitacionSelect(habitacion)}
              >
                <div className="relative h-48">
                  <Image
                    src={habitacion.imagen || '/images/placeholder/room.jpg'}
                    alt={habitacion.nombre || 'Habitación'}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {habitacion.nombre || 'Habitación'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {habitacion.descripcion || 'Descripción de la habitación'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[var(--color-primary)]">
                      ${habitacion.precio || 0} por noche
                    </span>
                    <button
                      className="px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-dark)]"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Información sobre las habitaciones */}
          <div className="bg-[var(--color-cream-light)] p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-center mb-6 text-[var(--color-primary)]">
              Tipos de Habitaciones
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-[var(--color-primary)]/20 rounded-lg bg-[var(--color-primary)]/5">
                <h4 className="text-xl font-semibold mb-4 text-[var(--color-primary)]">
                  Habitaciones Sencillas (King Size)
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <FaCheck className="text-[var(--color-primary)] mr-2" />
                    Precio: $2,400 por noche
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-[var(--color-primary)] mr-2" />
                    Capacidad: 2 adultos
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-[var(--color-primary)] mr-2" />
                    Cama King Size
                  </li>
                </ul>
              </div>
              
              <div className="p-6 border border-[var(--color-accent)]/20 rounded-lg bg-[var(--color-accent)]/5">
                <h4 className="text-xl font-semibold mb-4 text-[var(--color-accent)]">
                  Habitaciones Dobles (Matrimoniales)
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <FaCheck className="text-[var(--color-accent)] mr-2" />
                    Precio: $2,600 por noche
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-[var(--color-accent)] mr-2" />
                    Capacidad: 2 adultos, 2 niños
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-[var(--color-accent)] mr-2" />
                    Dos camas matrimoniales
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}