"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaBed, FaUserFriends, FaRuler, FaCheck, FaChevronRight } from 'react-icons/fa';
import { checkHabitacionAvailability } from '@/services/reservationService';
import { obtenerHabitaciones } from '@/services/habitacionService';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useReservation } from '@/context/ReservationContext';

export default function RoomListSection() {
  const router = useRouter();
  const [habitaciones, setHabitaciones] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState({});
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Usar el contexto de reservaciones para las habitaciones seleccionadas
  const { 
    habitacionesSeleccionadas, 
    agregarHabitacion, 
    eliminarHabitacion,
    calcularTotalHabitaciones
  } = useReservation();

  useEffect(() => {
    // Inicializar las fechas por defecto al cargar el componente
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
        const disponibilidadPromises = habitaciones.map(async (habitacion) => {
          return await checkHabitacionAvailability({
            tipoHabitacion: habitacion.tipo,
            habitacion: habitacion.nombre,
            fechaEntrada: fechaInicio,
            fechaSalida: fechaFin,
            numeroHabitaciones: 1
          });
        });

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

  const handleHabitacionSelect = (habitacion) => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Por favor, seleccione las fechas de entrada y salida');
      return;
    }

    const disponible = estaDisponible(habitacion.tipo);
    if (!disponible) {
      toast.error('Esta habitación no está disponible para las fechas seleccionadas');
      return;
    }

    // Crear una copia de los datos de la habitación con todos los campos necesarios
    const habitacionData = {
      id: habitacion._id, // Asegurarnos de usar el _id de MongoDB
      tipoHabitacion: habitacion._id, // El tipoHabitacion debe ser el ID
      nombre: habitacion.nombre || habitacion.tipo,
      fechaEntrada: fechaInicio,
      fechaSalida: fechaFin,
      precio: parseFloat(habitacion.precio || 0),
      numeroHabitaciones: 1,
      numHuespedes: 2
    };
    
    console.log('Datos de habitación para agregar:', habitacionData);
    
    // Verificar si la habitación ya está seleccionada
    const estaSeleccionada = habitacionesSeleccionadas.some(h => h.id === habitacion._id);
    
    if (estaSeleccionada) {
      // Si ya está seleccionada, la eliminamos
      eliminarHabitacion(habitacion._id);
      toast.success(`${habitacion.nombre} eliminada de la selección`);
    } else {
      // Si no está seleccionada, la agregamos
      agregarHabitacion(habitacionData);
      toast.success(`${habitacion.nombre} agregada a la selección`);
    }
  };

  const handleConfirmarSeleccion = () => {
    if (habitacionesSeleccionadas.length === 0) {
      toast.error('Por favor, seleccione al menos una habitación');
      return;
    }

    console.log('Habitaciones seleccionadas:', habitacionesSeleccionadas);
    
    // Mostrar notificación
    toast.success(`Seleccionado ${habitacionesSeleccionadas.length} habitaciones. Continuando con la reserva...`);
    
    // Redirigir a la página de reserva con el fragmento para ir directamente a la sección de eventos
    router.push(`/reservar#paso-1`);
  };

  if (loading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando habitaciones...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !habitaciones.length) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-xl text-gray-600">
                {error || 'No hay habitaciones disponibles en este momento'}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 room-list-section">
      <div className="container mx-auto px-6">
        {/* Banner informativo */}
        <div className="mb-8 bg-[var(--color-primary)]/10 p-6 rounded-lg border-l-4 border-[var(--color-primary)]">
          <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-4">
            Sistema de Reservaciones
          </h3>
          <div className="space-y-4 text-gray-700">
            <p className="font-medium text-[var(--color-accent)] text-lg mb-6">
              Las habitaciones están disponibles exclusivamente como complemento a la reservación de eventos en nuestra hacienda
            </p>
            <div className="space-y-3">
              <p className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-3"></span>
                Seleccione fechas tentativas para verificar disponibilidad (podrá confirmarlas al reservar su evento)
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-3"></span>
                Explore nuestra colección de habitaciones y sus exclusivas amenidades
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-3"></span>
                Tiene la flexibilidad de reservar múltiples habitaciones según sus necesidades
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-3"></span>
                Las fechas finales de estancia se confirmarán al completar la reserva de su evento
              </p>
            </div>
            <div className="mt-8 p-5 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/10 rounded-lg">
              <p className="text-[var(--color-accent)] font-medium">
                Le recomendamos realizar su reservación con anticipación para garantizar la disponibilidad de las habitaciones de su preferencia
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
            Nuestras Habitaciones
          </h2>
          <div className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Descubre el confort y la elegancia en cada una de nuestras habitaciones, diseñadas para hacer tu estancia inolvidable.
          </p>
        </div>

        {/* Selector de fechas */}
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

        {/* Panel de habitaciones seleccionadas */}
        {habitacionesSeleccionadas.length > 0 && (
          <div className="mb-8 bg-[var(--color-cream-light)] p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-[var(--color-accent)]">Habitaciones Seleccionadas</h3>
            <div className="space-y-3">
              {habitacionesSeleccionadas.map((habitacion, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium text-lg">{habitacion.nombre}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(habitacion.fechaEntrada).toLocaleDateString()} - {new Date(habitacion.fechaSalida).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-lg">${habitacion.precio}</p>
                    <button
                      onClick={() => eliminarHabitacion(habitacion.id)}
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
                    <p className="text-gray-600">{habitacionesSeleccionadas.length} habitaciones seleccionadas</p>
                  </div>
                  <p className="font-semibold text-2xl text-[var(--color-accent)]">
                    ${calcularTotalHabitaciones()}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => router.push('/masajes')}
                    className="flex-1 bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] px-6 py-3 rounded-lg hover:bg-[var(--color-primary)]/5 transition-colors font-medium"
                  >
                    Agregar Masajes
                  </button>
                  <button
                    onClick={handleConfirmarSeleccion}
                    className="flex-1 bg-[var(--color-accent)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-accent)]/90 transition-colors font-medium"
                  >
                    Continuar con la Reserva
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Listado de habitaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {habitaciones.map((habitacion) => {
            const disponible = estaDisponible(habitacion.tipo);
            const estaSeleccionada = habitacionesSeleccionadas.some(h => h.id === habitacion._id);
            
            return (
              <motion.div
                key={habitacion._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-50px" }}
                className={`flex flex-col md:flex-row gap-8 group cursor-pointer ${
                  !disponible ? 'opacity-75' : ''
                } ${estaSeleccionada ? 'ring-2 ring-[var(--color-primary)] rounded-lg' : ''}`}
                onClick={() => disponible && handleHabitacionSelect(habitacion)}
              >
                <div className="relative w-full md:w-1/3 aspect-square">
                  <Image
                    src={habitacion.imagen}
                    alt={habitacion.nombre}
                    fill
                    className="object-cover rounded-lg"
                  />
                  {!disponible && (
                    <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center rounded-lg">
                      <div className="bg-red-600 text-white py-2 px-4 transform rotate-45 text-center font-bold w-full text-lg">
                        No disponible
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-[var(--color-accent)] group-hover:text-[var(--color-primary)] transition-colors">
                    {habitacion.nombre}
                  </h3>
                  <p className="text-gray-600 mt-2 flex-grow">
                    {habitacion.descripcion}
                  </p>
                  <div className="grid grid-cols-3 gap-4 my-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaBed className="mr-2 text-[var(--color-primary)]" />
                      {habitacion.camas}
                    </div>
                    <div className="flex items-center">
                      <FaUserFriends className="mr-2 text-[var(--color-primary)]" />
                      {habitacion.capacidad} personas
                    </div>
                    <div className="flex items-center">
                      <FaRuler className="mr-2 text-[var(--color-primary)]" />
                      {habitacion.tamaño}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {habitacion.amenidades.slice(0, 3).map((amenidad, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {amenidad}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-lg mr-4">${habitacion.precio}</span>
                      <FaChevronRight className="text-[var(--color-primary)] group-hover:translate-x-2 transition-transform" />
                    </div>
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