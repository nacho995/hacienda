"use client";

import HeroSection from '@/components/contact/HeroSection';
import ContactForm from '@/components/contact/ContactForm';
import MapSection from '@/components/contact/MapSection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  return (
    <>
    <Navbar />
    <main className="min-h-screen pb-20">
      <HeroSection />
      <ContactForm />
      <MapSection />
    </main>
    <Footer />
    </>
  );
} 