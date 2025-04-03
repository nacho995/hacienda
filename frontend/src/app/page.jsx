"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

// Section components
import HeroSection from '@/components/sections/HeroSection';
import IntroSection from '@/components/sections/IntroSection';
import DecorativeSection from '@/components/sections/DecorativeSection';
import EventsSection from '@/components/sections/EventsSection';
import GallerySection from '@/components/sections/GallerySection';
import LodgingSection from '@/components/sections/LodgingSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CTASection from '@/components/sections/CTASection';

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section - Impactante slider inicial */}
      <HeroSection />
      
      {/* Intro Section - Elegante presentación */}
      <IntroSection />
      
      {/* Decorative Section - Cita inspiracional */}
      <DecorativeSection />
      
      {/* Events Section - Tipos de eventos */}
      <EventsSection />
      
      {/* Gallery Section - Galería mejorada */}
      <GallerySection />
      
      {/* Lodging Section - Habitaciones */}
      <LodgingSection />
      
      {/* Testimonials Section - Lo que dicen nuestros clientes */}
      <TestimonialsSection />
      
      {/* CTA Section - Llamada a la acción */}
      <CTASection />
    </main>
  );
} 