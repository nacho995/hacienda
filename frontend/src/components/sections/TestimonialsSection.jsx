"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaQuoteRight, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Datos de testimonios
const testimonials = [
  {
    id: 1,
    name: 'María y Juan González',
    role: 'Boda - Mayo 2023',
    quote: 'Elegir Hacienda San Carlos para nuestra boda fue la mejor decisión. El lugar es simplemente mágico, con jardines impecables y una arquitectura imponente. El equipo hizo que todo fluyera a la perfección y nuestros invitados quedaron maravillados con la experiencia.',
    avatar: '/images/placeholder/hero.svg',
    rating: 5
  },
  {
    id: 2,
    name: 'Carlos Méndez',
    role: 'Evento Corporativo - Marzo 2023',
    quote: 'Realizamos nuestro evento anual de empresa en Hacienda San Carlos y superó todas nuestras expectativas. Las instalaciones son perfectas, el servicio es excelente y la atención al detalle nos dejó sin palabras. Sin duda, volveremos para futuros eventos.',
    avatar: '/images/placeholder/hero.svg',
    rating: 5
  },
  {
    id: 3,
    name: 'Laura Ramírez',
    role: 'Celebración de XV Años - Julio 2023',
    quote: 'La celebración de XV años de mi hija fue como un sueño. El lugar tiene un encanto especial que le da un toque mágico a cualquier evento. El personal fue atento en todo momento y los invitados no paran de comentar lo hermoso que fue todo.',
    avatar: '/images/placeholder/hero.svg',
    rating: 5
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);
  const slideRef = useRef(null);
  
  // Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % testimonials.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Detectar cuando la sección está en el viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
  
  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % testimonials.length);
  };
  
  const currentTestimonial = testimonials[currentIndex];
  
  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-[var(--color-cream-light)] relative overflow-hidden"
    >
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4" style={{ borderColor: 'var(--color-primary-20)' }}></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4" style={{ borderColor: 'var(--color-primary-20)' }}></div>
      
      {/* Elemento decorativo centrado */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-2 pointer-events-none" style={{ borderColor: 'var(--color-primary-5)' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border pointer-events-none" style={{ borderColor: 'var(--color-primary-10)' }}></div>
      
      <div className="container-custom relative">
        <div className="text-center mb-20">
          <h2 className={`text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-accent)] mb-12 font-light transition-all duration-1000 transform ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Lo Que Dicen <span className="text-[var(--color-primary)] font-semibold">Nuestros Clientes</span>
          </h2>
          <div className={`gold-divider transition-all duration-700 delay-100 transform ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Comilla decorativa */}
          <div className="absolute -top-12 left-0 text-[120px] pointer-events-none z-[1]" style={{ color: 'var(--color-primary-10)' }}>
            <FaQuoteRight />
          </div>
          
          {/* Testimonial */}
          <div 
            ref={slideRef}
            className={`relative z-10 transition-all duration-1000 transform ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
          >
            <div className="bg-white p-12 border-decorative shadow-xl">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-full lg:w-1/3 flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-[var(--color-primary)] shadow-lg">
                    <Image
                      src={currentTestimonial.avatar}
                      alt={currentTestimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <h3 className="text-xl font-[var(--font-display)] text-[var(--color-accent)] mb-1 text-center">
                    {currentTestimonial.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 text-center italic">
                    {currentTestimonial.role}
                  </p>
                  
                  <div className="flex space-x-1 text-[var(--color-primary)]">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                </div>
                
                <div className="w-full lg:w-2/3">
                  <p className="text-xl md:text-2xl font-[var(--font-display)] text-gray-700 font-light italic leading-relaxed">
                    "{currentTestimonial.quote}"
                  </p>
                </div>
              </div>
            </div>
            
            {/* Indicadores y controles */}
            <div className="flex justify-center items-center mt-12 space-x-8">
              <button 
                onClick={goToPrevious}
                className="w-12 h-12 rounded-full border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                aria-label="Testimonio anterior"
              >
                <FaChevronLeft />
              </button>
              
              <div className="flex space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'bg-[var(--color-primary)] w-10' 
                        : 'bg-[var(--color-primary-30)] hover:bg-[var(--color-primary-50)]'
                    }`}
                    aria-label={`Ir al testimonio ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={goToNext}
                className="w-12 h-12 rounded-full border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                aria-label="Siguiente testimonio"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 