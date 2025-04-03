"use client";

import { useRef, useEffect } from 'react';

export default function HeroSection({ scrollY }) {
  const decorativeElementRef = useRef(null);

  useEffect(() => {
    // Aplicar efecto parallax al elemento decorativo
    if (decorativeElementRef.current && typeof scrollY !== 'undefined') {
      const movement = scrollY * 0.15; // Controla la velocidad del movimiento
      const rotation = scrollY * 0.02; // Rotación suave al hacer scroll
      const scale = 1 + (scrollY * 0.0005); // Ligero cambio de escala
      
      decorativeElementRef.current.style.transform = `
        translate(-50%, -50%) 
        translateY(${movement}px) 
        rotate(${rotation}deg)
        scale(${Math.min(scale, 1.15)})
      `;
      
      // Cambio de opacidad al hacer scroll
      const opacity = Math.max(1 - (scrollY * 0.002), 0);
      decorativeElementRef.current.style.opacity = opacity;
    }
  }, [scrollY]);

  return (
    <section className="relative h-[80vh] overflow-hidden pt-24 sm:pt-28 md:pt-32">
      <div 
        className="absolute inset-0 bg-[url('/habitacion.JPG')] bg-cover bg-center w-screen"
        style={{
          transform: `translateY(${scrollY * 0.15}px)`,
          transition: 'transform 0.3s ease-out',
          height: '120%',
          top: '-10%'
        }}
      ></div>
      {/* Overlay con degradado para mejorar visibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/60 z-10 w-screen"></div>
      
      {/* Contenido del hero */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white pt-16 sm:pt-20">
        <div className="text-center px-2 sm:px-4 max-w-5xl mx-auto perspective-[1000px]">
          {/* Decorador superior elegante */}
          <div className="flex flex-col items-center mb-4 md:mb-6 lg:mb-8 animate-delay-100 pt-0 md:pt-0 lg:pt-0">
            <div className="w-24 md:w-32 lg:w-40 h-[1px] bg-[var(--color-primary)] mx-auto mb-3"></div>
            <div className="relative inline-block mb-2 transform-style-preserve-3d">
              <span className="block text-sm md:text-base uppercase tracking-[0.3em] md:tracking-[0.4em] z-10" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(10px)", display: "inline-block"}}>
                Confort & Elegancia
              </span>
              <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -6px -6px round 6px)' }}></div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-[var(--font-display)] leading-tight tracking-tight mb-4 transform-style-preserve-3d">
            <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Habitaciones </span>
            <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>de Ensueño</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-8 perspective-[1000px] transform-style-preserve-3d">
            <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Experimente el lujo y la comodidad en un entorno de </span>
            <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>tradición histórica</span>
          </p>
          
          <div className="mt-8">
            <button 
              onClick={() => {
                const element = document.getElementById('habitaciones');
                if (element) {
                  element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }} 
              className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors rounded shadow-lg inline-block transform hover:scale-105 transition-transform duration-300"
            >
              Ver Habitaciones
            </button>
          </div>
        </div>
      </div>
      
      {/* Elemento decorativo desplazado hacia la izquierda con efecto de parallax */}
      <div 
        ref={decorativeElementRef}
        className="absolute top-[60%] left-[20%] transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden sm:block"
        style={{ 
          width: '380px', 
          height: '380px',
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
        }}
      >
        <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Círculo base decorativo */}
          <circle cx="250" cy="250" r="240" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
          <circle cx="250" cy="250" r="220" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
          
          {/* Forma decorativa de viñeta de vino */}
          <path d="M250,30 
                   C350,30 430,130 430,250 
                   C430,370 350,470 250,470 
                   C150,470 70,370 70,250 
                   C70,130 150,30 250,30 Z" 
                fill="none" stroke="#800020" strokeWidth="2" opacity="0.7" />
          
          {/* Elementos decorativos - copas */}
          <g opacity="0.8">
            <path d="M170,100 C190,120 190,150 180,170 L160,200 L200,200 L180,170 C170,150 170,120 190,100 Z" 
                  fill="none" stroke="#800020" strokeWidth="2" />
            <path d="M330,100 C350,120 350,150 340,170 L320,200 L360,200 L340,170 C330,150 330,120 350,100 Z" 
                  fill="none" stroke="#800020" strokeWidth="2" />
            <line x1="180" y1="200" x2="180" y2="220" stroke="#800020" strokeWidth="2" />
            <line x1="340" y1="200" x2="340" y2="220" stroke="#800020" strokeWidth="2" />
          </g>
          
          {/* Elementos decorativos - flores y adornos */}
          <g opacity="0.8">
            <circle cx="250" cy="120" r="20" fill="none" stroke="#800020" strokeWidth="2" />
            <circle cx="250" cy="120" r="10" fill="none" stroke="#800020" strokeWidth="1" />
            <circle cx="140" cy="250" r="15" fill="none" stroke="#800020" strokeWidth="2" />
            <circle cx="360" cy="250" r="15" fill="none" stroke="#800020" strokeWidth="2" />
            <circle cx="250" cy="380" r="20" fill="none" stroke="#800020" strokeWidth="2" />
          </g>
          
          {/* Elementos de enlace */}
          <path d="M250,140 C250,140 200,200 140,265 M250,140 C250,140 300,200 360,265" 
                stroke="#800020" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity="0.7" />
          <path d="M250,140 L250,380" stroke="#800020" strokeWidth="1" fill="none" 
                strokeDasharray="5,5" opacity="0.7" />
          
          {/* Texto elegante - "EVENTOS" - Centrado en el elemento */}
          <g transform="translate(250, 250)" className="events-text">
            <text textAnchor="middle" fontFamily="serif" fontSize="26" fill="#FFFAF0" fontWeight="light" opacity="0.9" letterSpacing="5">
              EVENTOS
            </text>
            <text textAnchor="middle" fontFamily="serif" fontSize="18" fill="#FFFAF0" fontWeight="light" opacity="0.8" letterSpacing="2" y="30">
              MEMORABLES
            </text>
          </g>
          
          {/* Pequeños adornos decorativos */}
          <circle cx="190" cy="320" r="5" fill="none" stroke="#800020" strokeWidth="1" />
          <circle cx="310" cy="320" r="5" fill="none" stroke="#800020" strokeWidth="1" />
          <path d="M120,200 C140,220 140,230 120,250" fill="none" stroke="#800020" strokeWidth="1" opacity="0.8" />
          <path d="M380,200 C360,220 360,230 380,250" fill="none" stroke="#800020" strokeWidth="1" opacity="0.8" />
          
          {/* Anillos de boda estilizados */}
          <circle cx="220" cy="300" r="15" fill="none" stroke="#FFFAF0" strokeWidth="2" opacity="0.7" />
          <circle cx="280" cy="300" r="15" fill="none" stroke="#FFFAF0" strokeWidth="2" opacity="0.7" />
        </svg>
      </div>
    </section>
  );
} 