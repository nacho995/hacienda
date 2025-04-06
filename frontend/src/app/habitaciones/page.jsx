"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import RoomListSection from '@/components/habitaciones/RoomListSection';
import BookingFormSection from '@/components/habitaciones/BookingFormSection';

// Importar componentes de layout
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

// Importar componentes de la página de habitaciones
const HeroSection = dynamic(() => import('@/components/habitaciones/HeroSection'), { ssr: false });
const IntroSection = dynamic(() => import('@/components/habitaciones/IntroSection'), { ssr: false });
const PoliciesSection = dynamic(() => import('@/components/habitaciones/PoliciesSection'), { ssr: false });
const FAQSection = dynamic(() => import('@/components/habitaciones/FAQSection'), { ssr: false });

export default function HabitacionesPage() {
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
    tipoHabitacion: ''
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
    setSelectedRoom(room);
  };

  return (
    <>
      <Navbar />
      <main>
        <HeroSection scrollY={scrollY} />
        <IntroSection />
        <RoomListSection 
          onSelectRoom={handleSelectRoom} 
          selectedRoom={selectedRoom}
          formData={formData}
        />
        <BookingFormSection 
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          formData={formData}
          setFormData={setFormData}
        />
        <PoliciesSection scrollY={scrollY} />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
} 