"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
    totalHabitaciones: 7
  });
  const [scrollY, setScrollY] = useState(0);
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

    // Establecer la habitación seleccionada
    setSelectedRoom(room);
    
    // Actualizar el formData con la habitación seleccionada
    setFormData(prev => ({
      ...prev,
      habitacion: room._id,
      tipoHabitacion: room.tipo
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <IntroSection scrollY={scrollY} />
              <RoomListSection 
                onSelectRoom={handleSelectRoom} 
                selectedRoom={selectedRoom}
                formData={formData}
              />
              <BookingFormSection 
                formData={formData} 
                setFormData={setFormData}
                selectedRoom={selectedRoom}
                onTipoReservaChange={(tipo) => {
                  setFormData(prev => ({
                    ...prev,
                    tipoReservacion: tipo
                  }));
                }}
              />
            </div>
          </div>
        </div>

        <PoliciesSection scrollY={scrollY} />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}