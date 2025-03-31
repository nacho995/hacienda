"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function DecorativeSection() {
  const sectionRef = useRef(null);
  const quoteRef = useRef(null);
  
  // Efecto de paralaje para el fondo y la cita
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !quoteRef.current) return;
      
      const scrollPosition = window.scrollY;
      const sectionTop = sectionRef.current.offsetTop;
      const relativeScroll = scrollPosition - sectionTop + window.innerHeight;
      
      if (relativeScroll > 0) {
        // Efecto paralaje para el fondo
        const backgroundElement = sectionRef.current.querySelector('.background-image');
        if (backgroundElement) {
          backgroundElement.style.transform = `translateY(${relativeScroll * 0.05}px)`;
        }
        
        // Efecto para la cita (movimiento más lento)
        quoteRef.current.style.transform = `translateY(${relativeScroll * 0.02}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <section ref={sectionRef} className="relative h-[500px] md:h-[600px] overflow-hidden">
      <div className="background-image absolute inset-0 z-0 transition-transform duration-300 will-change-transform">
        <Image
          src="/images/placeholder/decorative.svg"
          alt="Detalles arquitectónicos Hacienda San Carlos Borromeo"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20"></div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center z-10 px-6">
        <div 
          ref={quoteRef} 
          className="text-center max-w-4xl mx-auto transition-transform will-change-transform fade-in"
        >
          <div className="flex justify-center mb-10">
            <div className="relative w-32 h-[1px] bg-[var(--color-primary)]">
              <div className="absolute -top-[3px] left-1/2 transform -translate-x-1/2 w-4 h-[7px] bg-[var(--color-primary)]"></div>
            </div>
          </div>
          
          <h3 className="text-3xl md:text-5xl font-[var(--font-display)] text-white mb-10 font-light tracking-wide leading-relaxed">
            <span className="text-[var(--color-primary)] font-serif text-6xl md:text-7xl italic inline-block transform -translate-y-4">"</span>
            <span className="text-white">Crear momentos excepcionales<br />es nuestro compromiso</span>
            <span className="text-[var(--color-primary)] font-serif text-6xl md:text-7xl italic inline-block transform -translate-y-4">"</span>
          </h3>
          
          <p className="text-white/80 italic font-light text-lg md:text-xl mb-10">
            Cada detalle es importante para nosotros
          </p>
          
          <div className="flex justify-center">
            <div className="relative w-32 h-[1px] bg-[var(--color-primary)]">
              <div className="absolute -bottom-[3px] left-1/2 transform -translate-x-1/2 w-4 h-[7px] bg-[var(--color-primary)]"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-10 left-10 w-24 h-24 border-l-2 border-t-2 border-white/20 opacity-30"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 border-r-2 border-b-2 border-white/20 opacity-30"></div>
    </section>
  );
} 