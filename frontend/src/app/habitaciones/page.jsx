"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tab } from '@headlessui/react';
import { FaHotel, FaCalendarAlt, FaSuitcase } from 'react-icons/fa';
import { toast } from 'sonner';

// Importar componentes de layout
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

// Importar componentes de la página de hotel
const HeroSection = dynamic(() => import('@/components/habitaciones/HeroSection'), { ssr: false });
const IntroSection = dynamic(() => import('@/components/habitaciones/IntroSection'), { ssr: false });
const RoomListSection = dynamic(() => import('@/components/habitaciones/RoomListSection'), { ssr: false });
const BookingFormSection = dynamic(() => import('@/components/habitaciones/BookingFormSection'), { ssr: false });
const PoliciesSection = dynamic(() => import('@/components/habitaciones/PoliciesSection'), { ssr: false });
const FAQSection = dynamic(() => import('@/components/habitaciones/FAQSection'), { ssr: false });

export default function HotelPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    fechaEntrada: '',
    fechaSalida: '',
    huespedes: 1,
    mensaje: '',
    habitacion: '',
    tipoHabitacion: '',
    habitacionesMultiples: []
  });
  const [scrollY, setScrollY] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectRoom = (room) => {
    // Verificar si room es nulo antes de intentar acceder a sus propiedades
    if (!room) {
      console.error('Error: Se recibió un objeto room nulo');
      toast.error('Error al seleccionar la habitación');
      return;
    }

    // Verificar si es una acción de deselección
    if (room.accion === 'deseleccionar') {
      handleRemoveRoom(room._id);
      return;
    }
    
    // Para modo estancia hotel (selectedTab === 0), añadir a la lista de habitaciones seleccionadas
    if (selectedTab === 0) {
      // Verificar si la habitación ya está seleccionada
      const roomExists = selectedRooms.some(r => r._id === room._id);
      
      if (!roomExists) {
        // Asegurarse de que el precio está definido
        const roomPrice = room.precio || 0;
        console.log('Añadiendo habitación con precio:', roomPrice);
        
        // Añadir a las habitaciones seleccionadas
        setSelectedRooms([...selectedRooms, {...room, precio: roomPrice}]);
        
        // Actualizar también el formData con las habitaciones múltiples
        setFormData(prev => ({
          ...prev,
          habitacion: room._id, // La última habitación seleccionada
          tipoHabitacion: room.tipo,
          habitacionesMultiples: [...prev.habitacionesMultiples, {
            id: room._id,
            nombre: room.nombre,
            tipo: room.tipo,
            precio: roomPrice,
            fechaEntrada: room.fechaEntrada,
            fechaSalida: room.fechaSalida
          }]
        }));
        
        // Establecer la habitación seleccionada (para mantener compatibilidad)
        setSelectedRoom({...room, precio: roomPrice});
      }
    } else {
      // Asegurarse de que el precio está definido
      const roomPrice = room.precio || 0;
      console.log('Seleccionando habitación para evento con precio:', roomPrice);
      
      // Para el caso de evento, solo actualizar la habitación actual
      setFormData(prev => ({
        ...prev,
        habitacion: room._id,
        tipoHabitacion: room.tipo
      }));
      setSelectedRoom({...room, precio: roomPrice});
      
      // Scroll al formulario para eventos
      setTimeout(() => {
        const reservaFormSection = document.getElementById('reserva-form');
        if (reservaFormSection) {
          reservaFormSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  // Función para eliminar una habitación seleccionada
  const handleRemoveRoom = (roomId) => {
    const updatedRooms = selectedRooms.filter(room => room._id !== roomId);
    setSelectedRooms(updatedRooms);
    
    // Actualizar también el formData
    setFormData(prev => ({
      ...prev,
      habitacionesMultiples: prev.habitacionesMultiples.filter(h => h.id !== roomId),
      // Si eliminamos la última seleccionada, actualizar habitacion con la primera disponible o vacío
      habitacion: roomId === prev.habitacion ? 
        (updatedRooms.length > 0 ? updatedRooms[0]._id : '') : 
        prev.habitacion
    }));
    
    // Si no quedan habitaciones seleccionadas, limpiar la selección actual
    if (updatedRooms.length === 0) {
      setSelectedRoom(null);
    } else if (selectedRoom && selectedRoom._id === roomId) {
      // Si eliminamos la habitación que estaba seleccionada, seleccionar la primera disponible
      setSelectedRoom(updatedRooms[0]);
    }
  };

  // Nueva función para manejar el cambio de pestaña y sincronizar el tipo de reserva
  const handleTabChange = (index) => {
    setSelectedTab(index);
    
    // Actualiza el tipo de reserva en formData cuando cambia la pestaña
    setFormData(prev => ({
      ...prev,
      tipoReservacion: index === 0 ? 'individual' : 'evento'
    }));
    
    // Limpiar la selección de habitación cuando cambia de pestaña
    if (selectedRoom) {
      setSelectedRoom(null);
    }
    
    // Limpiar las habitaciones múltiples si cambiamos a la pestaña de eventos
    if (index === 1) {
      setSelectedRooms([]);
      setFormData(prev => ({
        ...prev,
        habitacionesMultiples: []
      }));
    }
  };

  // Añadir función para sincronizar tipos de reservación
  const handleSyncReservationType = (tipo) => {
    // Si el tipo pasado es diferente al actual, actualizar la pestaña
    if ((tipo === 'individual' && selectedTab !== 0) || 
        (tipo === 'evento' && selectedTab !== 1)) {
      setSelectedTab(tipo === 'individual' ? 0 : 1);
    }
    
    // Actualizar el formData
    setFormData(prev => ({
      ...prev,
      tipoReservacion: tipo
    }));
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Resto del contenido */}
        <div className="section-padding">
          <div className="container-custom">
            <Tab.Group
              onChange={handleTabChange}
              selectedIndex={selectedTab}
              className="relative"
            >
              <Tab.List className="flex space-x-1 mb-8 bg-[var(--color-brown-light)] rounded-xl p-1">
                <Tab
                  className={({ selected }) =>
                    `w-full py-2.5 text-sm font-medium leading-5 text-center rounded-lg ${
                      selected
                        ? 'bg-white shadow'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
                    }`
                  }
                >
                  <FaHotel className="inline-block mr-1" />
                  Estancia Hotel
                </Tab>
                <Tab
                  className={({ selected }) =>
                    `w-full py-2.5 text-sm font-medium leading-5 text-center rounded-lg ${
                      selected
                        ? 'bg-white shadow'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
                    }`
                  }
                >
                  <FaSuitcase className="inline-block mr-1" />
                  Eventos
                </Tab>
              </Tab.List>

              <Tab.Panels className="mt-4">
                <Tab.Panel>
                  <IntroSection scrollY={scrollY} />
                  <RoomListSection 
                    onSelectRoom={handleSelectRoom} 
                    selectedRoom={selectedRoom}
                    selectedRooms={selectedRooms}
                    formData={formData}
                  />
                  <BookingFormSection 
                    formData={formData} 
                    setFormData={setFormData}
                    selectedRoom={selectedRoom}
                    selectedRooms={selectedRooms}
                    handleRemoveRoom={handleRemoveRoom}
                    handleSyncReservationType={handleSyncReservationType}
                  />
                </Tab.Panel>

                <Tab.Panel>
                  {selectedRooms.length > 0 && (
                    <div className="container mx-auto px-6 mb-10">
                      <div className="max-w-4xl mx-auto bg-[var(--color-brown-light)] shadow-md rounded-lg overflow-hidden border border-[var(--color-brown-medium)]">
                        <div className="p-4 bg-[var(--color-brown-medium)]/10 border-b border-[var(--color-brown-medium)]/20">
                          <h3 className="text-xl font-semibold text-[var(--color-brown-medium)] flex items-center">
                            <FaSuitcase className="mr-2" />
                            Habitaciones para Evento ({selectedRooms.length})
                          </h3>
                        </div>
                        <div className="divide-y divide-[var(--color-brown-light-20)]">
                          {selectedRooms.map(room => (
                            <div key={room._id} className="p-4 flex justify-between items-center hover:bg-[var(--color-brown-light-10)]">
                              <div>
                                <h4 className="font-medium text-[var(--color-brown-medium)]">{room.nombre}</h4>
                                <p className="text-sm text-[var(--color-brown-medium)]">
                                  {room.tipo} - {typeof room.capacidad === 'object' ? 
                                    `${room.capacidad.adultos + room.capacidad.ninos} huéspedes (${room.capacidad.adultos} adultos, ${room.capacidad.ninos} niños)` : 
                                    `${room.capacidad || 2} huéspedes`}
                                </p>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-[var(--color-brown-medium)]">Incluido en paquete</span>
                                <button 
                                  onClick={() => handleRemoveRoom(room._id)}
                                  className="text-[var(--color-brown-dark)] hover:text-[var(--color-brown-deep)] text-sm font-medium"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {selectedRooms.length > 0 && (
                          <div className="p-4 bg-[var(--color-brown-light-20)] border-t border-[var(--color-brown-light-20)]">
                            <a 
                              href={`/reservar?tipo=evento&habitaciones=${encodeURIComponent(JSON.stringify(
                                selectedRooms.map(room => ({
                                  id: room._id,
                                  nombre: room.nombre,
                                  tipo: room.tipo,
                                  fechaEntrada: room.fechaEntrada || formData.fechaEntrada,
                                  fechaSalida: room.fechaSalida || formData.fechaSalida
                                }))
                              ))}`}
                              className="w-full block text-center px-8 py-3 bg-[var(--color-brown-medium)] text-white rounded-lg hover:bg-[var(--color-brown-dark)] transition-colors font-medium"
                            >
                              Continuar con Reserva de Evento
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Mostrar componente de habitaciones con hidePrice=true para eventos */}
                  <RoomListSection 
                    onSelectRoom={handleSelectRoom} 
                    selectedRoom={selectedRoom}
                    selectedRooms={selectedRooms}
                    formData={{...formData, sincronizarTipoReservacion: handleSyncReservationType}}
                    hidePrice={true}
                    modoEvento={true}
                  />
                  
                  {/* Botón principal para ir a reservar evento */}
                  {selectedRooms.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-[var(--color-brown-medium)] mb-6">
                        Seleccione las habitaciones que necesitará para sus invitados o continúe directamente a la reserva de su evento.
                      </p>
                      <a 
                        href="/reservar?tipo=evento" 
                        className="inline-block px-8 py-4 bg-[var(--color-brown-medium)] text-white rounded-lg hover:bg-[var(--color-brown-dark)] transition-colors font-medium text-lg"
                      >
                        Iniciar Reserva de Evento sin Habitaciones
                      </a>
                    </div>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>

        <PoliciesSection scrollY={scrollY} />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}