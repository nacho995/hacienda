"use client";

import { useState, useEffect, useRef } from 'react';
import { useScroll } from 'framer-motion';
import dynamic from 'next/dynamic';

// Importar componentes de layout
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

// Importar componentes de la página de masajes
const HeroSection = dynamic(() => import('@/components/masajes/HeroSection'), { ssr: false });
const IntroSection = dynamic(() => import('@/components/masajes/IntroSection'), { ssr: false });
const ServicesSection = dynamic(() => import('@/components/masajes/ServicesSection'), { ssr: false });
const TherapistsSection = dynamic(() => import('@/components/masajes/TherapistsSection'), { ssr: false });
const PromotionSection = dynamic(() => import('@/components/masajes/PromotionSection'), { ssr: false });
const FAQSection = dynamic(() => import('@/components/masajes/FAQSection'), { ssr: false });
const CTASection = dynamic(() => import('@/components/masajes/CTASection'), { ssr: false });

export default function MasajesPage() {
  const scrollRef = useRef(null);
  const heroRef = useRef(null);
  
  // Configuración del efecto parallax con framer-motion
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <HeroSection scrollRef={scrollRef} />
        <IntroSection scrollYProgress={scrollYProgress} />
        <ServicesSection />
        <TherapistsSection />
        <PromotionSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
} 