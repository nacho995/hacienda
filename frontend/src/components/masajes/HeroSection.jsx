"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HeroSection({ scrollRef }) {
  const [animateHero, setAnimateHero] = useState(false);
  const heroRef = useRef(null);
  
  // Efecto para animación inicial
  useEffect(() => {
    setAnimateHero(true);
  }, []);
  
  // Configuración del efecto parallax con framer-motion
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Transformación para el efecto parallax (solo la imagen)
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  
  const handleScrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={heroRef}
      className="relative h-screen overflow-hidden flex items-center justify-center"
    >
      {/* Fondo con efecto parallax (solo la imagen) */}
      <motion.div 
        className="absolute inset-0 z-0 w-full h-full overflow-hidden"
        style={{ 
          y: backgroundY
        }}
      >
        <Image
          src="/bienestar.jpg"
          alt="Experiencia de bienestar en Hacienda San Carlos"
          fill
          className="object-cover transform scale-[1.15] animate-ken-burns"
          priority
        />
        {/* Overlay con gradiente similar al de imagendron.jpg */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[var(--color-accent)]/60 to-black/50"></div>
      </motion.div>
      
      {/* Overlay decorativo */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
      </div>
      
      {/* Medallón decorativo - ahora con hidden sm:block */}
      <div 
        className="absolute top-[140px] md:top-[150px] lg:top-[180px] left-[10px] md:left-[40px] lg:left-[80px] transform z-20 pointer-events-none w-[180px] h-[180px] md:w-[220px] md:h-[220px] lg:w-[260px] lg:h-[260px] hidden sm:block"
      >
        <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Definiciones para filtros */}
          <defs>
            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="black" floodOpacity="0.8" />
            </filter>
          </defs>
          
          {/* Fondo semitransparente del medallón */}
          <circle cx="250" cy="250" r="225" fill="rgba(0,0,0,0.3)" />
          
          {/* Círculos decorativos externos */}
          <circle cx="250" cy="250" r="245" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="8,8" opacity="0.3" />
          <circle cx="250" cy="250" r="230" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" />
          
          {/* Forma de medallón radiante */}
          <path d="M250,30 
                C330,30 400,90 430,170
                C460,250 440,350 370,410
                C300,470 200,470 130,410
                C60,350 40,250 70,170
                C100,90 170,30 250,30 Z" 
              fill="none" stroke="#800020" strokeWidth="2" opacity="0.5" />
          
          {/* Adorno medallón interno */}
          <circle cx="250" cy="250" r="150" fill="none" stroke="#800020" strokeWidth="1" opacity="0.3" />
          <circle cx="250" cy="250" r="120" fill="none" stroke="#800020" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
          
          {/* Texto elegante en el centro */}
          <g transform="translate(250, 250)" className="events-text">
            <text textAnchor="middle" fontFamily="serif" fontSize="30" fill="#FFFAF0" fontWeight="light" opacity="0.95" letterSpacing="4" filter="url(#textShadow)">
              BIENESTAR
            </text>
            <text textAnchor="middle" fontFamily="serif" fontSize="18" fill="#FFFAF0" fontWeight="light" opacity="0.9" letterSpacing="2" y="30">
              CUERPO Y ALMA
            </text>
          </g>
        </svg>
      </div>
      
      {/* Contenido del hero */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={animateHero ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          {/* Decorador superior elegante */}
          <div className="flex flex-col items-center mb-4 md:mb-6 lg:mb-8 animate-delay-100 pt-0 md:pt-0 lg:pt-0">
            <div className="w-24 md:w-32 lg:w-40 h-[1px] bg-[var(--color-primary)] mx-auto mb-3"></div>
            <div className="relative inline-block mb-2 text-sm md:text-base uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--color-primary)] font-extrabold z-10 transform-style-preserve-3d">
              <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "white", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(10px)", display: "inline-block"}}>
                Bienestar & Armonía
              </span>
              <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -6px -6px round 6px)' }}></div>
            </div>
            <div className="relative inline-block text-base md:text-lg text-white tracking-wide font-medium drop-shadow-[0_0_3px_rgba(110,70,20,0.9)] z-10">
              Experiencias de renovación para cuerpo y alma
              <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -8px -6px round 6px)' }}></div>
            </div>
            <div className="w-24 md:w-32 lg:w-40 h-[1px] bg-[var(--color-primary)] mx-auto mt-3"></div>
          </div>
          
          <div className="relative inline-block mb-4 md:mb-6 lg:mb-8 z-10 perspective-[1000px]">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-[var(--font-display)] font-normal leading-tight tracking-tight relative px-3 md:px-4 transform-style-preserve-3d">
              <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Santuario</span> <span className="font-bold transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>de Bienestar</span>
              <div className="absolute inset-0 filter blur-[8px] bg-white/15 -z-10" style={{ clipPath: 'inset(-15px -25px -35px -25px round 16px)' }}></div>
            </h1>
          </div>
          
          <div className="relative inline-block text-lg sm:text-xl md:text-2xl font-[var(--font-display)] font-medium mb-8 md:mb-12 lg:mb-16 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto z-10 tracking-wide px-4 perspective-[1000px]">
            <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Descubre un oasis de tranquilidad en nuestra hacienda, donde las </span><span className="font-bold transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "white", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>técnicas ancestrales</span><span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]"> se fusionan con terapias modernas para renovar cuerpo, mente y alma.</span>
            <div className="absolute inset-0 filter blur-[6px] bg-white/15 -z-10" style={{ clipPath: 'inset(-10px -20px -25px -20px round 10px)' }}></div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={animateHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            <Link
              href="#servicios"
              onClick={(e) => {
                e.preventDefault();
                const serviciosSection = document.querySelector('.services-section');
                if (serviciosSection) {
                  serviciosSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
              className="px-10 py-4 bg-[var(--color-primary)] text-white text-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors inline-block shadow-xl transform hover:scale-105 transition-transform duration-300"
            >
              Descubrir Experiencias
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-32 right-20 w-48 h-48 border border-[var(--color-primary)]/30 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute top-40 right-40 w-20 h-20 border border-[var(--color-primary)]/40 rounded-full animate-pulse delay-500"></div>
    </section>
  );
} 