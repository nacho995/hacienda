"use client";

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function HabitacionesLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
} 