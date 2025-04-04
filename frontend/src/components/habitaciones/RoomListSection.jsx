"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaCheck, FaBed, FaUserFriends } from 'react-icons/fa';
import { checkHabitacionAvailability } from '@/services/reservationService';
import { obtenerHabitaciones } from '@/services/habitacionService';

export default function RoomListSection({ onSelectRoom }) {
  const [habitaciones, setHabitaciones] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState({});
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar las fechas por defecto al cargar el componente
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(afterTomorrow.getDate() + 2);
    
    setFechaInicio(formatDate(tomorrow));
    setFechaFin(formatDate(afterTomorrow));
  }, []);

  // Cargar habitaciones desde la API
  useEffect(() => {
    const cargarHabitaciones = async () => {
      try {
        const data = await obtenerHabitaciones();
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

  // Formatear fecha para input date
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Verificar disponibilidad cuando cambien las fechas
  useEffect(() => {
    const verificarDisponibilidad = async () => {
      if (!fechaInicio || !fechaFin || habitaciones.length === 0) return;

      try {
        const disponibilidadPromises = habitaciones.map(habitacion =>
          checkHabitacionAvailability({
            tipoHabitacion: habitacion.tipo,
            fechaEntrada: fechaInicio,
            fechaSalida: fechaFin,
            numeroHabitaciones: 1
          })
        );

        const resultados = await Promise.all(disponibilidadPromises);
        const nuevaDisponibilidad = {};
        
        habitaciones.forEach((habitacion, index) => {
          const resultado = resultados[index];
          nuevaDisponibilidad[habitacion.tipo] = {
            disponible: resultado.disponible,
            mensaje: resultado.mensaje,
            habitacionesRestantes: resultado.habitacionesRestantes
          };
        });

        setDisponibilidad(nuevaDisponibilidad);
      } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        setError('Error al verificar disponibilidad de habitaciones');
      }
    };

    verificarDisponibilidad();
  }, [fechaInicio, fechaFin, habitaciones]);

  const estaDisponible = (tipo) => {
    return disponibilidad[tipo]?.disponible !== false;
  };

  const getMensajeDisponibilidad = (tipo) => {
    return disponibilidad[tipo]?.mensaje || 'Verificando disponibilidad...';
  };

  if (loading) return (
    <div className="container-custom py-16">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando habitaciones...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container-custom py-16">
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <section id="habitaciones" className="py-16">
      <div className="container-custom">
        <h2 className="font-[var(--font-display)] text-3xl text-center mb-6">
          Encuentra tu Habitación Ideal
        </h2>
        
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="bg-[var(--color-cream-light)] p-6 rounded-sm shadow-sm">
            <h3 className="text-lg text-[var(--color-accent)] mb-4">Verifica la disponibilidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de llegada
                </label>
                <input 
                  type="date" 
                  id="fechaInicio" 
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  min={formatDate(new Date())}
                  className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de salida
                </label>
                <input 
                  type="date" 
                  id="fechaFin" 
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  min={fechaInicio || formatDate(new Date())}
                  className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {habitaciones.map((habitacion) => {
            const disponible = estaDisponible(habitacion.tipo);
            
            return (
              <div 
                key={habitacion._id} 
                className={`border-decorative group transition-shadow duration-300 ${disponible ? 'hover:shadow-lg' : 'opacity-75'}`}
              >
                <div className="relative h-80 overflow-hidden">
                  {!disponible && (
                    <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
                      <div className="bg-red-600 text-white py-2 px-4 transform rotate-45 text-center font-bold w-full text-lg">
                        {getMensajeDisponibilidad(habitacion.tipo)}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 z-10 transition-opacity group-hover:opacity-0"></div>
                  <Image 
                    src={habitacion.imagen}
                    alt={habitacion.nombre}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-[var(--font-display)] text-2xl text-[var(--color-accent)]">
                      {habitacion.nombre}
                    </h3>
                    <div className="text-[var(--color-primary)] font-semibold">
                      ${habitacion.precio} <span className="text-sm font-normal text-gray-500">/ noche</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {habitacion.descripcion}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 text-sm text-gray-700">
                    <div className="flex items-center">
                      <FaBed className="mr-2 text-[var(--color-primary)]" />
                      {habitacion.camas}
                    </div>
                    <div className="flex items-center">
                      <FaUserFriends className="mr-2 text-[var(--color-primary)]" />
                      {habitacion.capacidad} personas
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-[var(--color-primary)]">&#x33A1;</span>
                      {habitacion.tamaño}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-8">
                    <h4 className="font-semibold mb-3 text-[var(--color-accent)]">Amenidades:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {habitacion.amenidades.slice(0, 6).map((amenidad, index) => (
                        <div key={index} className="flex items-center">
                          <FaCheck className="mr-2 text-xs text-[var(--color-primary)]" />
                          {amenidad}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => disponible && onSelectRoom(habitacion)}
                    className={`w-full py-3 font-medium tracking-wide transition-colors duration-300 ${
                      disponible 
                        ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-primary)]' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!disponible}
                  >
                    {disponible ? 'Reservar Ahora' : 'No Disponible'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 