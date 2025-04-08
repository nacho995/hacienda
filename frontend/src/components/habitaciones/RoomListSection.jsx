"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaBed, FaUserFriends, FaRuler, FaCheck, FaChevronRight, FaHotel, FaCalendarAlt, FaUsers, FaCheckCircle } from 'react-icons/fa';
import { checkHabitacionAvailability } from '@/services/reservationService';
import { obtenerHabitaciones } from '@/services/habitacionService';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useSimpleReservation } from '@/context/SimpleReservationContext';
import { Tab } from '@headlessui/react';

export default function RoomListSection({ onSelectRoom, selectedRoom, selectedRooms = [], formData, hidePrice = false, modoEvento = false }) {
  const router = useRouter();
  const [habitaciones, setHabitaciones] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState({});
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipoReserva, setTipoReserva] = useState(modoEvento ? 'evento' : 'hotel'); // 'hotel' o 'evento'
  const [eventoId, setEventoId] = useState('');
  
  // Usar el contexto de reservaciones para las habitaciones seleccionadas
  const { 
    habitacionesSeleccionadas, 
    agregarHabitacion, 
    eliminarHabitacion,
    calcularTotalHabitaciones
  } = useSimpleReservation();

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
          // Aseguramos que tipoHabitacion y habitacion estén definidos correctamente
          const tipoHabitacion = habitacion.tipo || habitacion._id;
          const nombreHabitacion = habitacion.nombre || habitacion.letraHabitacion || `Habitación ${habitacion._id}`;
          
          const requestData = {
            tipoHabitacion: tipoHabitacion,
            habitacion: nombreHabitacion,
            fechaEntrada: fechaInicio,
            fechaSalida: fechaFin,
            numeroHabitaciones: 1
          };
          
          console.log(`Verificando disponibilidad para habitación ${nombreHabitacion}:`, requestData);
          
          return await checkHabitacionAvailability(requestData);
        });

        const resultados = await Promise.all(disponibilidadPromises);
        const nuevaDisponibilidad = {};
        
        habitaciones.forEach((habitacion, index) => {
          const resultado = resultados[index];
          // Usamos la misma lógica para garantizar que tenemos una clave válida
          const tipoKey = habitacion.tipo || habitacion._id || `habitacion-${index}`;
          nuevaDisponibilidad[tipoKey] = {
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

  const estaDisponible = (tipo, habitacion) => {
    // Si tipo es undefined o null, intentamos usar el ID como respaldo
    const tipoKey = tipo || (habitacion && habitacion._id) || '';
    return disponibilidad[tipoKey]?.disponible !== false;
  };

  // Actualizar handleHabitacionSelect para usar la función onSelectRoom pasada como prop
  const handleHabitacionSelect = (habitacion) => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Por favor, seleccione las fechas de entrada y salida');
      return;
    }

    // Verificar si la habitación ya está seleccionada
    const esPrincipal = selectedRoom && (selectedRoom._id === habitacion._id || selectedRoom.id === habitacion._id);
    const estaEnLista = selectedRooms && selectedRooms.some(room => room._id === habitacion._id || room.id === habitacion._id);
    const esSeleccionada = esPrincipal || estaEnLista;

    // Si ya está seleccionada, deseleccionarla
    if (esSeleccionada) {
      // Llamar a una función de deselección si existe
      if (typeof onSelectRoom === 'function') {
        // Utilizamos una señal especial para indicar deselección
        const habitacionConSenal = {
          ...habitacion,
          accion: 'deseleccionar'
        };
        onSelectRoom(habitacionConSenal);
        const nombreHabitacion = habitacion.nombre || habitacion.tipo || 'Habitación';
      toast.success(`${nombreHabitacion} eliminada de la selección`);
      }
      return;
    }

    // Si no está seleccionada, verificar disponibilidad y seleccionarla
    const disponible = estaDisponible(habitacion.tipo, habitacion);
    if (!disponible) {
      toast.error('Esta habitación no está disponible para las fechas seleccionadas');
      return;
    }

    // Seleccionar la habitación
    if (typeof onSelectRoom === 'function') {
      // Actualizar las fechas en el objeto de habitación antes de enviarlo
      habitacion.fechaEntrada = fechaInicio;
      habitacion.fechaSalida = fechaFin;
      onSelectRoom(habitacion);
      
      // Mostrar notificación de éxito
      const nombreHabitacion = habitacion.nombre || habitacion.tipo || 'Habitación';
      toast.success(`${nombreHabitacion} añadida a la selección`);
    }
  };

  // Función para actualizar el tipo de reserva y sincronizarlo con el componente padre
  const handleTipoReservaChange = (tipo) => {
    setTipoReserva(tipo === 0 ? 'hotel' : 'evento');
    
    // Si hay una función de cambio de pestaña en el componente padre, la llamamos
    if (typeof formData?.sincronizarTipoReservacion === 'function') {
      formData.sincronizarTipoReservacion(tipo === 0 ? 'individual' : 'evento');
    }
    
    // Resetear datos específicos si es necesario
    if (tipo === 1) { // Evento
      setEventoId('');
    }
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
    <section className="py-16 room-list-section" id="habitaciones-disponibles">
      <div className="container mx-auto px-6">
        {/* Banner informativo */}
        <div className="mb-8 bg-[var(--color-primary)]/10 p-6 rounded-lg border-l-4 border-[var(--color-primary)]">
          <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-4">
            Sistema de Reservaciones
          </h3>
          <div className="space-y-4 text-gray-700">
            <p className="font-medium text-[var(--color-accent)] text-lg mb-6">
              {modoEvento 
                ? "Seleccione las habitaciones necesarias para los invitados de su evento" 
                : "Disfrute de una estancia exclusiva en nuestra hacienda, ya sea como complemento a su evento o como experiencia hotelera independiente"}
            </p>
            <div className="space-y-3">
              <p className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-3"></span>
                Seleccione fechas de su preferencia para verificar disponibilidad
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-3"></span>
                Explore nuestra colección de habitaciones y sus exclusivas amenidades
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-3"></span>
                Personalice su {modoEvento ? "evento" : "estancia"} reservando múltiples habitaciones según sus necesidades
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-3"></span>
                Todas nuestras habitaciones incluyen desayuno y amenidades premium
              </p>
            </div>
            <div className="mt-8 p-5 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/10 rounded-lg">
              <p className="text-[var(--color-accent)] font-medium">
                {modoEvento 
                  ? "Para eventos se requiere un mínimo de 7 habitaciones. El precio será parte del paquete del evento."
                  : "Le recomendamos realizar su reservación con anticipación para garantizar la disponibilidad de las habitaciones de su preferencia"}
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
            {modoEvento 
              ? "Habitaciones disponibles para los invitados de su evento. Seleccione las que necesitará incluir en su paquete."
              : "Descubre el confort y la elegancia en cada una de nuestras habitaciones, diseñadas para hacer tu estancia inolvidable."}
          </p>
        </div>

        {/* Selector de tipo de reserva */}
        {!modoEvento && (
          <Tab.Group onChange={handleTipoReservaChange}>
            <Tab.List className="flex space-x-1 rounded-xl bg-[var(--color-cream-light)] p-1 mb-8 max-w-3xl mx-auto">
              <Tab 
                className={({ selected }) =>
                  `w-full rounded-lg py-3 text-sm font-medium leading-5 flex items-center justify-center
                  ${selected 
                    ? 'bg-white shadow text-[var(--color-primary)]' 
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-[var(--color-primary)]'}`
                }
              >
                <FaHotel className="mr-2" />
                Estancia Hotel
              </Tab>
              <Tab 
                className={({ selected }) =>
                  `w-full rounded-lg py-3 text-sm font-medium leading-5 flex items-center justify-center
                  ${selected 
                    ? 'bg-white shadow text-[var(--color-primary)]' 
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-[var(--color-primary)]'}`
                }
              >
                <FaCalendarAlt className="mr-2" />
                Estancia con Evento
              </Tab>
            </Tab.List>
            <Tab.Panels>
              {/* Panel para reserva de hotel */}
              <Tab.Panel>
                <div className="mb-10 max-w-3xl mx-auto">
                  <div className="bg-[var(--color-cream-light)] p-6 rounded-sm shadow-sm">
                    <h3 className="text-lg text-[var(--color-accent)] mb-4">Reserva individual - Verifica la disponibilidad</h3>
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
                    <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
                      <div className="flex items-center text-[var(--color-primary)]">
                        <FaCheckCircle className="mr-2" />
                        <p className="font-medium">Precios por noche:</p>
                      </div>
                      <ul className="mt-2 space-y-1 pl-6">
                        <li>Habitación Doble (2 adultos, 2 niños): $2,450.00</li>
                        <li>Habitación Sencilla (2 adultos): $2,400.00</li>
                        <li>Adulto adicional (hab. triple): $350.00</li>
                        <li>Habitación Cuádruple: $500.00</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Tab.Panel>
              
              {/* Panel para reserva de evento */}
              <Tab.Panel>
                <div className="mb-10 max-w-3xl mx-auto">
                  <div className="bg-[var(--color-cream-light)] p-6 rounded-sm shadow-sm">
                    <h3 className="text-lg text-[var(--color-accent)] mb-4">Reserva para evento - Verifica la disponibilidad</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="fechaInicioEvento" className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de llegada
                        </label>
                        <input 
                          type="date" 
                          id="fechaInicioEvento" 
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                          min={formatDate(new Date())}
                          className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="fechaFinEvento" className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de salida
                        </label>
                        <input 
                          type="date" 
                          id="fechaFinEvento" 
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                          min={fechaInicio || formatDate(new Date())}
                          className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="eventoId" className="block text-sm font-medium text-gray-700 mb-1">
                        ID de Evento (opcional)
                      </label>
                      <input 
                        type="text" 
                        id="eventoId" 
                        value={eventoId}
                        onChange={(e) => setEventoId(e.target.value)}
                        placeholder="Ingrese el ID de su evento o déjelo en blanco para crear uno nuevo"
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
                      <div className="flex items-center text-[var(--color-primary)]">
                        <FaUsers className="mr-2" />
                        <p className="font-medium">Información importante:</p>
                      </div>
                      <ul className="mt-2 space-y-1 pl-6">
                        <li>El mínimo de habitaciones para operar son 7</li>
                        <li>Precio cerrado por evento, según cotización</li>
                        <li>Las habitaciones se asignarán según disponibilidad al momento de confirmar</li>
                      </ul>
                      
                      <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead>
                            <tr>
                              <th className="py-2 px-3 border-b text-left bg-gray-50">Habitación</th>
                              <th className="py-2 px-3 border-b text-left bg-gray-50">Tipo</th>
                              <th className="py-2 px-3 border-b text-left bg-gray-50">Capacidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 1</td>
                              <td className="py-2 px-3 border-b">Sencilla</td>
                              <td className="py-2 px-3 border-b">2 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 2</td>
                              <td className="py-2 px-3 border-b">Doble</td>
                              <td className="py-2 px-3 border-b">4 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 3</td>
                              <td className="py-2 px-3 border-b">Doble</td>
                              <td className="py-2 px-3 border-b">4 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 4</td>
                              <td className="py-2 px-3 border-b">Sencilla</td>
                              <td className="py-2 px-3 border-b">2 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 5</td>
                              <td className="py-2 px-3 border-b">Sencilla</td>
                              <td className="py-2 px-3 border-b">2 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 6</td>
                              <td className="py-2 px-3 border-b">Sencilla</td>
                              <td className="py-2 px-3 border-b">2 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 7</td>
                              <td className="py-2 px-3 border-b">Doble</td>
                              <td className="py-2 px-3 border-b">4 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 8</td>
                              <td className="py-2 px-3 border-b">Sencilla</td>
                              <td className="py-2 px-3 border-b">2 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 9</td>
                              <td className="py-2 px-3 border-b">Sencilla</td>
                              <td className="py-2 px-3 border-b">2 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 10</td>
                              <td className="py-2 px-3 border-b">Sencilla</td>
                              <td className="py-2 px-3 border-b">2 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 11</td>
                              <td className="py-2 px-3 border-b">Sencilla</td>
                              <td className="py-2 px-3 border-b">2 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 12</td>
                              <td className="py-2 px-3 border-b">Sencilla</td>
                              <td className="py-2 px-3 border-b">2 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 13</td>
                              <td className="py-2 px-3 border-b">Doble</td>
                              <td className="py-2 px-3 border-b">4 personas</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 border-b">Habitación 14</td>
                              <td className="py-2 px-3 border-b">Sencilla</td>
                              <td className="py-2 px-3 border-b">2 personas</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}
        
        {/* Si es modo evento, mostrar directamente el selector de fechas */}
        {modoEvento && (
          <div className="mb-10 max-w-3xl mx-auto">
            <div className="bg-[var(--color-cream-light)] p-6 rounded-sm shadow-sm">
              <h3 className="text-lg text-[var(--color-accent)] mb-4">Seleccione las fechas para su evento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="fechaInicioEvento" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de llegada
                  </label>
                  <input 
                    type="date" 
                    id="fechaInicioEvento" 
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    min={formatDate(new Date())}
                    className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="fechaFinEvento" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de salida
                  </label>
                  <input 
                    type="date" 
                    id="fechaFinEvento" 
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    min={fechaInicio || formatDate(new Date())}
                    className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
                <div className="flex items-center text-[var(--color-primary)]">
                  <FaUsers className="mr-2" />
                  <p className="font-medium">Información importante para eventos:</p>
                </div>
                <ul className="mt-2 space-y-1 pl-6">
                  <li>El mínimo de habitaciones para operar son 7</li>
                  <li>Precio cerrado por evento, según cotización</li>
                  <li>Las habitaciones se asignarán según disponibilidad al momento de confirmar</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Lista de habitaciones con botones de selección mejorados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {habitaciones.map((habitacion) => {
            const esDisponibleHab = estaDisponible(habitacion.tipo, habitacion);
            // Verificar si está seleccionada en selectedRoom o en selectedRooms
            const esPrincipal = selectedRoom && (selectedRoom._id === habitacion._id || selectedRoom.id === habitacion._id);
            const estaEnLista = selectedRooms && selectedRooms.some(room => room._id === habitacion._id || room.id === habitacion._id);
            const esSeleccionada = esPrincipal || estaEnLista;
            
            return (
              <div 
                key={habitacion._id || habitacion.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden border transition-all duration-300 ${
                  esSeleccionada 
                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 transform scale-[1.02]' 
                    : 'border-gray-200 hover:border-[var(--color-primary)] hover:shadow-lg'
                }`}
              >
                <div className="relative">
                  <Image 
                    src={habitacion.imagen || '/images/habitaciones/default-room.jpg'} 
                    alt={habitacion.nombre || 'Habitación'} 
                    width={500} 
                    height={300} 
                    className="h-64 w-full object-cover"
                  />
                  {esSeleccionada && (
                    <div className="absolute top-3 right-3 bg-[var(--color-primary)] text-white px-3 py-1 rounded-full text-sm font-medium">
                      Seleccionada
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">
                    {habitacion.nombre || 'Habitación'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {habitacion.descripcion || 'Una exquisita habitación para disfrutar de su estancia.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      <FaBed className="mr-1" /> {habitacion.camas || '1 King Size'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      <FaUserFriends className="mr-1" /> {typeof habitacion.capacidad === 'object' ? 
                        `${habitacion.capacidad.adultos} adultos, ${habitacion.capacidad.ninos} niños` : 
                        `${habitacion.capacidad || 2} adultos`}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      <FaRuler className="mr-1" /> {habitacion.tamano || '30m²'}
                    </span>
                  </div>
                  
                  <ul className="mb-6 space-y-2">
                    {(habitacion.amenidades || ['WiFi Gratuito', 'Aire Acondicionado', 'TV', 'Baño Privado']).map((amenidad, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <FaCheck className="text-[var(--color-primary)] mr-2 text-sm" /> {amenidad}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    {!hidePrice ? (
                      <p className="text-xl font-bold text-[var(--color-accent)]">
                        ${habitacion.precio || '2,450.00'} <span className="text-sm font-normal text-gray-500">/ noche</span>
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-gray-600">
                        Incluido en paquete de evento
                      </p>
                    )}
                    
                    <button
                      onClick={() => handleHabitacionSelect(habitacion)}
                      disabled={!esDisponibleHab}
                      className={`px-6 py-2 rounded-lg flex items-center transition-colors ${
                        esSeleccionada
                          ? 'bg-[var(--color-primary)] text-white'
                          : esDisponibleHab 
                            ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)]' 
                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {esSeleccionada ? (
                        <>Seleccionada <FaCheck className="ml-2" /></>
                      ) : (
                        <>Seleccionar <FaChevronRight className="ml-2" /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Instrucciones después de seleccionar */}
        <div className="mt-10 text-center">
          <p className="text-gray-700 mb-4">
            {modoEvento
              ? "Seleccione las habitaciones necesarias para su evento y continúe con la reserva completa."
              : "Seleccione una o más habitaciones y complete el formulario que aparecerá debajo para realizar su reserva."}
          </p>
          {(selectedRoom || (selectedRooms && selectedRooms.length > 0)) && (
            <button
              onClick={() => {
                const reservaFormSection = document.getElementById('reserva-form');
                if (reservaFormSection) {
                  reservaFormSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-block mt-2 px-8 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Ir al formulario de reserva
            </button>
          )}
        </div>
      </div>
    </section>
  );
} 