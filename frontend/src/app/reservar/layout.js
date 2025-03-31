"use client";

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ReservarLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
} 