"use client";

// Importar componentes de layout directamente
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Importar componentes de home directamente
import HeroSection from '../components/home/HeroSection';
import IntroSection from '../components/home/IntroSection';
import DecorativeSection from '../components/home/DecorativeSection';
import EventsSection from '../components/home/EventsSection';
import GallerySection from '../components/home/GallerySection';
import LodgingSection from '../components/home/LodgingSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTASection from '../components/home/CTASection';

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