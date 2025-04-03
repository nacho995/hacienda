"use client";

import dynamic from 'next/dynamic';

// Importar componentes de layout
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

// Importar componentes dinámicamente para mejorar rendimiento
const HeroSection = dynamic(() => import('@/components/home/HeroSection'), { ssr: true });
const IntroSection = dynamic(() => import('@/components/home/IntroSection'), { ssr: false });
const DecorativeSection = dynamic(() => import('@/components/home/DecorativeSection'), { ssr: false });
const EventsSection = dynamic(() => import('@/components/home/EventsSection'), { ssr: false });
const GallerySection = dynamic(() => import('@/components/home/GallerySection'), { ssr: false });
const LodgingSection = dynamic(() => import('@/components/home/LodgingSection'), { ssr: false });
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'), { ssr: false });
const CTASection = dynamic(() => import('@/components/home/CTASection'), { ssr: false });

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <IntroSection />
        <DecorativeSection />
        <EventsSection />
        <GallerySection />
        <LodgingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
} 