"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaBed, FaUserFriends, FaRuler, FaCheck, FaCheckCircle } from 'react-icons/fa';
import { obtenerHabitaciones } from '@/services/habitaciones.service';

export default function RoomListSection({ selectedRoomIds = [], onToggleRoom }) {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cargar habitaciones desde la API
    const cargarHabitaciones = async () => {
      try {
        const response = await obtenerHabitaciones();
        console.log('Respuesta de obtenerHabitaciones:', response);

        // Verificar que la respuesta y response.data existen y que response.data es un array
        if (response && response.data && Array.isArray(response.data)) {
          const habitacionesData = response.data;
          // Verificar que todas las habitaciones tienen un tipo o un ID
          habitacionesData.forEach((habitacion, index) => {
            if (!habitacion.tipo && !habitacion._id) {
              console.warn(`Habitación #${index} sin tipo ni ID:`, habitacion);
            }
          });
          setHabitaciones(habitacionesData);
        } else {
          // Mejorar el mensaje de error basado en la respuesta real
          let errorMsg = 'Formato de datos inesperado recibido del servidor.';
          if (response && response.data && !Array.isArray(response.data)) {
              errorMsg = 'La propiedad \'data\' de la respuesta no es un array.';
          } else if (!response || !response.data) {
              errorMsg = 'La respuesta del servidor no contiene la propiedad \'data\' esperada.';
          }
          console.error('Error:', errorMsg, response);
          setError(errorMsg);
          setHabitaciones([]); // Establecer como array vacío para evitar errores posteriores
        }

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar habitaciones:', error);
        setError('No se pudieron cargar las habitaciones');
        setLoading(false);
      }
    };

    cargarHabitaciones();
  }, []);

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-[var(--color-primary)]">
        Selecciona tus Habitaciones
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitaciones.map((habitacion) => {
              const isSelected = selectedRoomIds.includes(habitacion._id);
              return (
                <motion.div
                  key={habitacion._id || habitacion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 cursor-pointer relative border-2 ${
                    isSelected ? 'border-[var(--color-primary)] shadow-lg scale-[1.02]' : 'border-transparent hover:shadow-lg'
                  }`}
                  onClick={() => onToggleRoom(habitacion._id)}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[var(--color-primary)] text-white rounded-full p-1 z-10">
                      <FaCheckCircle size={20} />
                    </div>
                  )}
                  <div className={`relative h-48 transition-opacity duration-200 ${isSelected ? 'opacity-90' : 'opacity-100'}`}>
                    <Image
                      src={habitacion.imagen || '/images/placeholder/room.jpg'}
                      alt={habitacion.nombre || 'Habitación'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={habitaciones.indexOf(habitacion) < 3}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {habitacion.nombre || 'Habitación'}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {habitacion.descripcion || 'Descripción de la habitación'}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <span className="text-lg font-bold text-[var(--color-primary)]">
                        ${habitacion.precio || 0} / noche
                      </span>
                      <span
                        className={`px-4 py-2 rounded text-sm font-medium ${
                          isSelected
                            ? 'bg-green-100 text-green-700'
                            : 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                        }`}
                      >
                        {isSelected ? 'Seleccionada' : 'Seleccionar'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-[var(--color-cream-light)] p-8 rounded-lg mt-12">
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