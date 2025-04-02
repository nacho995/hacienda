"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronDown, FaAngleLeft, FaAngleRight, FaPlay } from 'react-icons/fa';

// Datos de carrusel mejorados
const carouselData = [
  {
    type: 'image',
    src: '/imagendron.jpg',
    alt: 'Hacienda San Carlos - Vista aérea principal',
    title: 'Elegancia & Tradición',
    subtitle: 'Un espacio donde la historia cobra vida',
    heading: 'El <span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Arte de Celebrar</span><br /><span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Momentos</span> <span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Inolvidables</span>',
    description: '<span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Donde cada evento se convierte en un </span><span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">recuerdo eterno</span><span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]"> envuelto en la más exquisita elegancia.</span>',
    cta: 'Conocer Más'
  },
  {
    type: 'image',
    src: '/imagendron2.jpg',
    alt: 'Hacienda San Carlos - Vista aérea panorámica',
    title: 'Eventos & Celebraciones',
    subtitle: 'Momentos inolvidables en un entorno único',
    heading: 'Tu <span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Boda Perfecta</span><br /><span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Merece un</span> <span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Lugar Único</span>',
    description: '<span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Creamos </span><span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">experiencias a medida</span><span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]"> para que tu día especial sea exactamente como lo imaginaste.</span>',
    cta: 'Ver Bodas'
  },
  {
    type: 'image',
    src: '/imagendron3.jpg',
    alt: 'Hacienda San Carlos - Vista aérea de jardines',
    title: 'Naturaleza & Armonía',
    subtitle: 'Jardines exuberantes para su deleite',
    heading: '<span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Espacios</span> <span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Únicos</span><br /><span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Para</span> <span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Cada</span> <span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Ocasión</span>',
    description: '<span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Nuestros </span><span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">jardines y salones</span><span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]"> se adaptan a tu visión y estilo para crear el ambiente perfecto.</span>',
    cta: 'Espacios'
  },
  {
    type: 'image',
    src: '/imagendron4.jpg',
    alt: 'Hacienda San Carlos - Vista aérea completa',
    title: 'Explora & Descubre',
    subtitle: 'Recorre virtualmente nuestras instalaciones',
    heading: '<span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Tradición</span> <span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">y</span> <span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Elegancia</span><br /><span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">En</span> <span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Cada Detalle</span>',
    description: '<span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">La perfecta combinación entre </span><span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">historia y modernidad</span><span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]"> para eventos que trascienden el tiempo.</span>',
    cta: 'Galería'
  },
  {
    type: 'image',
    src: '/imagendron5.jpg',
    alt: 'Hacienda San Carlos - Vista aérea de piscina y áreas verdes',
    title: 'Relax & Confort',
    subtitle: 'Disfruta de nuestras áreas de descanso',
    heading: '<span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Eventos</span> <span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Corporativos</span><br /><span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">De</span> <span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Alto Nivel</span>',
    description: '<span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">El entorno perfecto para </span><span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">reuniones ejecutivas</span><span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">, conferencias y eventos empresariales exclusivos.</span>',
    cta: 'Eventos'
  },
  {
    type: 'image',
    src: '/imagendron6.JPG',
    alt: 'Hacienda San Carlos - Vista aérea jardines traseros',
    title: 'Jardines & Espacios',
    subtitle: 'Áreas exclusivas para tu celebración',
    heading: '<span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Celebraciones</span> <span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Familiares</span><br /><span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">Memorables</span>',
    description: '<span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">El escenario ideal para reunir a tus </span><span class="font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">seres queridos</span><span class="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]"> en ocasiones especiales inolvidables.</span>',
    cta: 'Contacto'
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('next');
  const [loadedSlides, setLoadedSlides] = useState([0]);
  const sliderRef = useRef(null);
  const medallionRef = useRef(null);
  const slideInterval = 7000; // 7 segundos
  
  // Precarga de imágenes para transiciones suaves
  useEffect(() => {
    const slidesToLoad = carouselData.map((_, index) => index);
    setLoadedSlides(slidesToLoad);
  }, []);
  
  // Carrusel automático
  useEffect(() => {
    if (!isPlaying || isAnimating) return;
    
    const interval = setInterval(() => {
      setAnimationDirection('next');
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselData.length);
        
        setTimeout(() => {
          setIsAnimating(false);
        }, 500);
      }, 500);
    }, slideInterval);
    
    return () => clearInterval(interval);
  }, [isPlaying, isAnimating, carouselData.length]);
  
  const handlePrevSlide = useCallback(() => {
    if (isAnimating) return;
    
    setIsPlaying(false);
    setAnimationDirection('prev');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }, 500);
  }, [isAnimating, carouselData.length]);
  
  const handleNextSlide = useCallback(() => {
    if (isAnimating) return;
    
    setIsPlaying(false);
    setAnimationDirection('next');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }, 500);
  }, [isAnimating, carouselData.length]);
  
  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    
    setIsPlaying(false);
    setAnimationDirection(index > currentSlide ? 'next' : 'prev');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentSlide(index);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }, 500);
  }, [currentSlide, isAnimating]);
  
  // Efecto de teclado para navegar entre diapositivas
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (event.key === 'ArrowRight') {
        handleNextSlide();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrevSlide, handleNextSlide]);
  
  // Efecto de parallax para el fondo
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sliderRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const moveX = (clientX / innerWidth - 0.5) * 20; // Movimiento horizontal
      const moveY = (clientY / innerHeight - 0.5) * 20; // Movimiento vertical
      
      const slides = sliderRef.current.querySelectorAll('.slide-image');
      
      slides.forEach((slide) => {
        slide.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
      
      // Mover el medallón en dirección opuesta para efecto de parallax
      if (medallionRef.current) {
        medallionRef.current.style.transform = `translate(${-moveX * 0.5}px, ${-moveY * 0.5}px) rotate(${moveX * 0.03}deg)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Efecto de parallax al hacer scroll para el medallón
  useEffect(() => {
    const handleScroll = () => {
      if (medallionRef.current) {
        const scrollY = window.scrollY;
        const rotation = scrollY * 0.02; // Rotación suave al hacer scroll
        const scale = 1 - (scrollY * 0.0005); // Reducción de escala al hacer scroll
        const opacity = Math.max(1 - (scrollY * 0.003), 0);
        
        medallionRef.current.style.transform = `
          translateY(${scrollY * 0.15}px)
          rotate(${rotation}deg)
          scale(${Math.max(scale, 0.6)})
        `;
        medallionRef.current.style.opacity = opacity;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const current = carouselData[currentSlide];

  return (
    <section className="relative h-[100vh] min-h-[800px] md:min-h-[850px] lg:min-h-[900px] w-full overflow-hidden">
      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/30 to-[var(--color-accent)]/50 z-10"></div>
      
      {/* Carrusel de fondo */}
      <div 
        ref={sliderRef}
        className="relative h-full overflow-hidden"
      >
        {loadedSlides.map((index) => (
          <div 
            key={index}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative h-full overflow-hidden">
              <div className="slide-image absolute inset-0 transition-transform duration-1000 ease-out will-change-transform">
                <Image
                  src={carouselData[index].src}
                  alt={carouselData[index].alt}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  className={`object-cover transition-transform duration-7000 ease-out transform scale-[1.15] ${
                    index === currentSlide ? 'animate-ken-burns' : ''
                  }`}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[var(--color-accent)]/60 to-black/50"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Medallón decorativo central con efecto de parallax */}
      <div 
        ref={medallionRef}
        className="absolute top-[160px] md:top-[180px] lg:top-[220px] left-[10px] md:left-[40px] lg:left-[100px] transform z-20 pointer-events-none w-[200px] h-[200px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px]"
        style={{ 
          transition: 'transform 0.4s ease-out, opacity 0.4s ease-out'
        }}
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
          
          {/* Rayos decorativos */}
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = (index * 30) * Math.PI / 180;
            const x1 = Math.round((250 + 150 * Math.cos(angle)) * 100) / 100;
            const y1 = Math.round((250 + 150 * Math.sin(angle)) * 100) / 100;
            const x2 = Math.round((250 + 220 * Math.cos(angle)) * 100) / 100;
            const y2 = Math.round((250 + 220 * Math.sin(angle)) * 100) / 100;
            return (
              <line 
                key={index}
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke="#800020" 
                strokeWidth="1" 
                opacity={0.3 + (index % 3) * 0.2}
              />
            );
          })}
          
          {/* Elementos decorativos de celebración */}
          {/* Copa de champagne izquierda */}
          <path d="M180,150 C200,170 200,200 190,220 L170,250 L210,250 L190,220 C180,200 180,170 200,150 Z" 
                fill="none" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.7" />
          <line x1="190" y1="250" x2="190" y2="270" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.7" />
          
          {/* Copa de champagne derecha */}
          <path d="M320,150 C340,170 340,200 330,220 L310,250 L350,250 L330,220 C320,200 320,170 340,150 Z" 
                fill="none" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.7" />
          <line x1="330" y1="250" x2="330" y2="270" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.7" />
          
          {/* Anillos de boda entrelazados */}
          <circle cx="230" cy="320" r="25" fill="none" stroke="#FFFAF0" strokeWidth="2" opacity="0.8" />
          <circle cx="270" cy="320" r="25" fill="none" stroke="#FFFAF0" strokeWidth="2" opacity="0.8" />
          
          {/* Corazón decorativo */}
          <path d="M250,180 
                   C270,150 310,150 310,180 
                   C310,210 250,240 250,240 
                   C250,240 190,210 190,180 
                   C190,150 230,150 250,180 Z" 
                fill="none" stroke="#800020" strokeWidth="2" opacity="0.6" />
          
          {/* Líneas decorativas */}
          <path d="M230,320 C230,270 250,250 290,250 M270,320 C270,270 250,250 210,250" 
                stroke="#FFFAF0" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
          
          {/* Texto elegante en el centro - "CELEBRA" */}
          <g transform="translate(250, 250)" className="events-text">
            <text textAnchor="middle" fontFamily="serif" fontSize="30" fill="#FFFAF0" fontWeight="light" opacity="0.95" letterSpacing="4" filter="url(#textShadow)">
              CELEBRA
            </text>
            <text textAnchor="middle" fontFamily="serif" fontSize="18" fill="#FFFAF0" fontWeight="light" opacity="0.9" letterSpacing="2" y="30">
              MOMENTOS ÚNICOS
            </text>
          </g>
          
          {/* Elementos decorativos - estrellas */}
          {Array.from({ length: 8 }).map((_, index) => {
            const angle = (index * 45 + 22.5) * Math.PI / 180;
            const distance = 180;
            const x = Math.round((250 + distance * Math.cos(angle)) * 100) / 100;
            const y = Math.round((250 + distance * Math.sin(angle)) * 100) / 100;
            const size = 5 + (index % 3) * 2;
            
            return (
              <g key={`star-${index}`} transform={`translate(${x}, ${y})`}>
                <circle cx="0" cy="0" r={size / 2} fill="none" stroke="#FFFAF0" strokeWidth="1" opacity="0.6" />
                <path d={`M0,-${size} L${Math.round(size/4 * 100) / 100},-${Math.round(size/4 * 100) / 100} L${size},0 L${Math.round(size/4 * 100) / 100},${Math.round(size/4 * 100) / 100} L0,${size} L-${Math.round(size/4 * 100) / 100},${Math.round(size/4 * 100) / 100} L-${size},0 L-${Math.round(size/4 * 100) / 100},-${Math.round(size/4 * 100) / 100} Z`} 
                      fill="none" stroke="#FFFAF0" strokeWidth="0.5" opacity="0.4" />
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Overlay decorativo */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
      </div>
      
      {/* Contenido principal */}
      <div className="absolute inset-0 z-30 flex flex-col justify-start items-center pt-12 md:pt-14 lg:pt-16">
        <div className="container mx-auto px-4 lg:px-8 pt-8">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo centrado con animación */}
            <div className="mb-4 transform-gpu animate-float pt-8 md:pt-10 lg:pt-12">
              <div className="relative inline-block">
                <Image 
                  src="/images/logo.svg"
                  alt="Hacienda San Carlos Borromeo"
                  width={280}
                  height={100}
                  className="mx-auto relative z-10"
                />
                <div className="absolute inset-0 filter blur-[6px] bg-white/15 -z-10" style={{ clipPath: 'inset(-10px -20px -15px -20px round 10px)' }}></div>
              </div>
            
            </div>
            
            {/* Slider de contenido */}
            <div className="relative overflow-hidden h-[350px] md:h-[420px] lg:h-[450px] mt-0">
              {carouselData.map((slide, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 transform ${
                    index === currentSlide && !isAnimating
                      ? 'translate-x-0 opacity-100'
                      : index === currentSlide && isAnimating
                        ? animationDirection === 'next'
                          ? 'translate-x-[100px] opacity-0'
                          : 'translate-x-[-100px] opacity-0'
                        : animationDirection === 'next' && (currentSlide === 0 ? index === carouselData.length - 1 : index === currentSlide - 1)
                          ? 'translate-x-[-100px] opacity-0'
                          : animationDirection === 'prev' && (currentSlide === carouselData.length - 1 ? index === 0 : index === currentSlide + 1)
                            ? 'translate-x-[100px] opacity-0'
                            : 'translate-x-0 opacity-0'
                  }`}
                >
                  {/* Decorador superior elegante */}
                  <div className="flex flex-col items-center mb-4 md:mb-6 lg:mb-8 animate-delay-100 pt-0 md:pt-0 lg:pt-0">
                    <div className="w-24 md:w-32 lg:w-40 h-[1px] bg-[var(--color-primary)] mx-auto mb-3"></div>
                    <div className="relative inline-block mb-2 text-sm md:text-base uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--color-primary)] font-extrabold drop-shadow-[0_0_3px_rgba(190,150,50,0.7)] z-10">
                      {slide.title}
                      <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -6px -6px round 6px)' }}></div>
                    </div>
                    <div className="relative inline-block text-base md:text-lg text-white tracking-wide font-medium drop-shadow-[0_0_3px_rgba(110,70,20,0.9)] z-10">
                      {slide.subtitle}
                      <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -8px -6px round 6px)' }}></div>
                    </div>
                    <div className="w-24 md:w-32 lg:w-40 h-[1px] bg-[var(--color-primary)] mx-auto mt-3"></div>
                  </div>
                  
                  <div className="relative inline-block mb-4 md:mb-6 lg:mb-8 z-10">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-[var(--font-display)] font-normal leading-tight text-white tracking-tight relative px-3 md:px-4">
                      <span dangerouslySetInnerHTML={{ __html: slide.heading }} />
                      <div className="absolute inset-0 filter blur-[8px] bg-white/15 -z-10" style={{ clipPath: 'inset(-15px -25px -35px -25px round 16px)' }}></div>
                    </h1>
                  </div>
                  
                  <div className="relative inline-block text-lg sm:text-xl md:text-2xl font-[var(--font-display)] font-medium mb-8 md:mb-12 lg:mb-16 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto text-white z-10 tracking-wide px-4">
                    <span dangerouslySetInnerHTML={{ __html: slide.description }} />
                    <div className="absolute inset-0 filter blur-[6px] bg-white/15 -z-10" style={{ clipPath: 'inset(-10px -20px -25px -20px round 10px)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Controles del carrusel */}
        <div className="absolute top-[80%] md:top-[82%] lg:top-[84%] left-1/2 transform -translate-x-1/2 flex items-center space-x-4 md:space-x-6 z-30">
          <button
            onClick={handlePrevSlide}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[var(--color-primary)]/20 transition-all duration-300"
            aria-label="Diapositiva anterior"
          >
            <FaAngleLeft className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-[3px] transition-all duration-500 ${
                  index === currentSlide 
                    ? 'w-10 bg-[var(--color-primary)]' 
                    : 'w-5 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Ir a diapositiva ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNextSlide}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[var(--color-primary)]/20 transition-all duration-300"
            aria-label="Siguiente diapositiva"
          >
            <FaAngleRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
} 