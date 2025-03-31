"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronDown, FaAngleLeft, FaAngleRight, FaPlay } from 'react-icons/fa';

// Datos de carrusel mejorados
const carouselData = [
  {
    type: 'image',
    src: '/images/placeholder/hero.svg',
    alt: 'Hacienda San Carlos - Vista frontal',
    title: 'Elegancia & Tradición',
    subtitle: 'Un espacio donde la historia cobra vida',
    cta: 'Descubrir la Hacienda'
  },
  {
    type: 'image',
    src: '/images/placeholder/gallery1.svg',
    alt: 'Hacienda San Carlos - Eventos',
    title: 'Eventos & Celebraciones',
    subtitle: 'Momentos inolvidables en un entorno único',
    cta: 'Explorar Servicios'
  },
  {
    type: 'image',
    src: '/images/placeholder/gallery2.svg',
    alt: 'Hacienda San Carlos - Jardines',
    title: 'Naturaleza & Armonía',
    subtitle: 'Jardines exuberantes para su deleite',
    cta: 'Conocer Espacios'
  },
  {
    type: 'video',
    src: '/images/placeholder/decorative.svg', // Placeholder hasta tener un video real
    alt: 'Hacienda San Carlos - Tour virtual',
    title: 'Explora & Descubre',
    subtitle: 'Recorre virtualmente nuestras instalaciones',
    cta: 'Ver Recorrido'
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('next');
  const [loadedSlides, setLoadedSlides] = useState([0]);
  const sliderRef = useRef(null);
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
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const current = carouselData[currentSlide];

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
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
            {carouselData[index].type === 'image' ? (
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
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/60 via-[var(--color-accent)]/40 to-[var(--color-accent)]/70"></div>
              </div>
            ) : (
              <div className="relative h-full overflow-hidden">
                <div className="slide-image absolute inset-0 transition-transform duration-1000 ease-out will-change-transform">
                  <Image
                    src={carouselData[index].src}
                    alt={carouselData[index].alt}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-[var(--color-accent)]/60 flex items-center justify-center">
                  <button className="group relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/30 animate-ping-slow"></div>
                    <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/50 flex items-center justify-center">
                      <FaPlay className="w-8 h-8 text-white ml-2 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Overlay decorativo */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
      </div>
      
      {/* Contenido principal */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center">
        <div className="container mx-auto px-4 lg:px-8 pt-16">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo centrado con animación */}
            <div className="mb-16 transform-gpu animate-float">
              <Image 
                src="/images/logo.svg"
                alt="Hacienda San Carlos"
                width={280}
                height={100}
                className="mx-auto"
              />
            </div>
            
            {/* Slider de contenido */}
            <div className="relative overflow-hidden h-[350px]">
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
                  <div className="flex flex-col items-center mb-12 animate-delay-100">
                    <div className="w-40 h-[1px] bg-[var(--color-primary)] mx-auto mb-6"></div>
                    <div className="mb-2 text-base uppercase tracking-[0.4em] text-[var(--color-primary)]">
                      {slide.title}
                    </div>
                    <div className="text-lg text-white/90 tracking-wide font-light italic">
                      {slide.subtitle}
                    </div>
                    <div className="w-40 h-[1px] bg-[var(--color-primary)] mx-auto mt-6"></div>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-[var(--font-display)] font-light mb-12 leading-tight text-white animate-delay-200">
                    El <span className="font-semibold text-[var(--color-primary)]">Arte de Celebrar</span><br />Momentos Inolvidables
                  </h1>
                  
                  <p className="text-xl md:text-2xl font-[var(--font-display)] font-light mb-16 max-w-2xl mx-auto text-gray-100 animate-delay-300">
                    Donde cada evento se convierte en un recuerdo eterno envuelto en la más exquisita elegancia.
                  </p>
                  
                  <div className="flex justify-center space-x-8 animate-delay-400">
                    <Link 
                      href="/contacto" 
                      className="group relative px-12 py-4 overflow-hidden"
                    >
                      <span className="absolute inset-0 border border-[var(--color-primary)]"></span>
                      <span className="absolute inset-0 bg-[var(--color-primary)] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
                      <span className="relative flex items-center justify-center text-[var(--color-primary)] group-hover:text-white uppercase tracking-[0.2em] text-sm font-medium transition-colors duration-500">
                        {slide.cta}
                        <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Controles del carrusel */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 z-30">
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