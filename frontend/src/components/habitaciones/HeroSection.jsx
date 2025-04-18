"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

// Componente de héroe con parallax para la página de habitaciones
export default function HeroSection({ scrollY, title = "Habitaciones de Ensueño", subtitle = "Experimente el lujo y la comodidad en un entorno de tradición histórica" }) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Calcular el desplazamiento para el efecto parallax basado en el scroll
  const parallax = scrollY * 0.5;
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section 
      className="relative h-[85vh] min-h-[550px] max-h-[800px] overflow-hidden flex items-center justify-center"
    >
      {/* Fondo con degradado y patrón */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--gradient-primary)] to-[var(--gradient-secondary)] opacity-90 z-0">
        <div className="absolute inset-0 bg-brown-pattern opacity-10" />
      </div>
      
      {/* Capa de imagen de fondo con parallax */}
      <div 
        className="absolute inset-0 h-full w-full z-0"
        style={{ 
          transform: `translateY(${parallax}px)`,
          backgroundImage: `url('/Entrada-hotel.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.65)',
          transition: 'transform 0.1s ease-out',
        }}
      />
      
      {/* Elementos decorativos del header */}
      <div className="absolute inset-0 z-10">
        {/* Sombra superior para dar profundidad */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--color-brown-dark)]/70 to-transparent"></div>
        
        {/* Sombra inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-brown-dark)]/70 to-transparent"></div>
      </div>
      
      {/* Contenido del header */}
      <div className="container mx-auto px-6 relative z-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logotipo como ornamento elegante */}
          <div className="mb-8">
            <div className="mx-auto w-48 h-48 relative transform-style-preserve-3d" style={{transform: `translateZ(30px)`}}>
              <Image
                src="/images/logo-white.png"
                alt="Hacienda San Carlos"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          {/* Contenido superpuesto */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            {/* MODIFICADO: Título con la nueva fuente y resaltado */}
            <h1 
              className="text-white text-5xl md:text-7xl lg:text-8xl mb-4 text-shadow font-script"
            >
              Nuestras <span style={{ color: 'var(--color-brown-medium)' }}>Habitaciones</span>
            </h1>
            {/* Subtítulo */}
            <p className="text-white text-lg md:text-xl max-w-2xl mx-auto shadow-text">
              Descubra el confort y la elegancia en cada uno de nuestros espacios únicos.
            </p>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={() => {
                const element = document.querySelector('.room-list-section');
                if (element) {
                  element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }} 
              className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-[var(--color-brown-medium)] text-black hover:bg-[var(--color-brown-dark)] rounded shadow-lg inline-block transform hover:scale-105 transition-all duration-300"
            >
              Reserva tu Habitación
            </button>
          </div>
        </div>
      </div>
      
      {/* Elemento decorativo desplazado hacia la izquierda con efecto de parallax */}
      <div 
        className="absolute -left-20 bottom-0 w-80 h-80 opacity-50 z-10"
        style={{ 
          transform: `translateY(${-parallax * 0.2}px)`,
          backgroundImage: 'url(/images/ornament-corner.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          transition: 'transform 0.1s ease-out',
        }}
      />
      
      {/* Elemento decorativo desplazado hacia la derecha con efecto de parallax */}
      <div 
        className="absolute -right-20 bottom-0 w-80 h-80 opacity-50 z-10"
        style={{ 
          transform: `translateY(${-parallax * 0.2}px) scaleX(-1)`,
          backgroundImage: 'url(/images/ornament-corner.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          transition: 'transform 0.1s ease-out',
        }}
      />
    </section>
  );
}