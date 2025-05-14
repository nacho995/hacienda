"use client";

import React from 'react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import HomePageSchema from '../structured-data/HomePageSchema';
import HeroSection from './HeroSection';
import IntroSection from './IntroSection';
import DecorativeSection from './DecorativeSection';
import EventsSection from './EventsSection';
import GallerySection from './GallerySection';
import LodgingSection from './LodgingSection';
import TestimonialsSection from './TestimonialsSection';
import CTASection from './CTASection';

export function HomeClientPage() {
  return (
    <>
      <HomePageSchema />
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
