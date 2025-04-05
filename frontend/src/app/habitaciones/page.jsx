"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Importar componentes de layout
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

// Importar componentes de la página de habitaciones
const HeroSection = dynamic(() => import('@/components/habitaciones/HeroSection'), { ssr: false });
const IntroSection = dynamic(() => import('@/components/habitaciones/IntroSection'), { ssr: false });
const RoomListSection = dynamic(() => import('@/components/habitaciones/RoomListSection'), { ssr: false });
const BookingFormSection = dynamic(() => import('@/components/habitaciones/BookingFormSection'), { ssr: false });
const PoliciesSection = dynamic(() => import('@/components/habitaciones/PoliciesSection'), { ssr: false });
const FAQSection = dynamic(() => import('@/components/habitaciones/FAQSection'), { ssr: false });

export default function HabitacionesPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fechaEntrada: '',
    fechaSalida: '',
    huespedes: 1,
    habitacion: '',
    mensaje: ''
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
    setFormData({
      ...formData,
      habitacion: room ? room._id : ''
    });
    
    // Scroll al formulario con comprobación de que el elemento existe
    if (room) {
      const formElement = document.getElementById('reserva-form');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <HeroSection scrollY={scrollY} />
        <IntroSection />
        <RoomListSection onSelectRoom={handleSelectRoom} />
        <BookingFormSection 
          selectedRoom={selectedRoom} 
          onSelectRoom={setSelectedRoom} 
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