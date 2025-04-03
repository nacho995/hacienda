"use client";

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

export default function CTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  // Detectar cuando la sección es visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
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
  
  return (
    <section 
      ref={sectionRef} 
      className="py-0 relative overflow-hidden bg-white"
    >
      <div className="relative">
        {/* Fondo con overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/platopresentacion.JPG"
            alt="Exquisita presentación gastronómica de Hacienda San Carlos"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15, 15, 15, 0.75)' }}></div>
        </div>
        
        {/* Patrón decorativo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-primary)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--color-primary)]"></div>
        
        {/* Contenido principal */}
        <div className="relative z-10 py-24 lg:py-32">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Columna izquierda - Contenido */}
              <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'}`}>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-[var(--font-display)] font-light text-white mb-8 leading-tight perspective-[1000px] transform-style-preserve-3d">
                  Haz Realidad <span className="font-semibold transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>El Evento</span> De Tus <span className="font-semibold transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>Sueños</span>
                </h2>
                
                <div className="w-32 h-[1px] bg-[var(--color-primary)] mb-10"></div>
                
                <p className="text-xl text-white/90 font-light mb-10 leading-relaxed">
                  Desde <span className="text-white/100 font-medium">bodas de ensueño</span> hasta <span className="text-white/100 font-medium">eventos corporativos excepcionales</span>, 
                  ponemos a tu disposición un lugar con <span className="text-white/100 font-medium">historia, elegancia y servicio 
                  de clase mundial</span> para crear momentos inolvidables.
                </p>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
                  <div className="flex items-center space-x-4 group hover:transform hover:scale-105 transition-all duration-300">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white shadow-lg transform group-hover:rotate-3 transition-all duration-300 ring-2 ring-white/10 group-hover:ring-white/30">
                      <FaCalendarAlt className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg group-hover:translate-x-1 transition-transform duration-300">Agenda una visita</h3>
                      <p className="text-white/80 text-sm group-hover:translate-x-1 transition-transform duration-300">Conoce nuestras instalaciones</p>
                    </div>
                  </div>
                  <div className="border-l border-white/20 pl-6 hidden sm:block"></div>
                  <div className="flex items-center space-x-4 group hover:transform hover:scale-105 transition-all duration-300">
                    <div className="w-14 h-14 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center text-white bg-black/20 backdrop-blur-sm shadow-lg transform group-hover:rotate-3 transition-all duration-300">
                      <span className="text-xl font-semibold">15+</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg group-hover:translate-x-1 transition-transform duration-300">Años de experiencia</h3>
                      <p className="text-white/80 text-sm group-hover:translate-x-1 transition-transform duration-300">Creando eventos inolvidables</p>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href="/contact" 
                  className="group inline-flex items-center bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white px-8 py-4 uppercase tracking-wider text-sm font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300 shadow-lg transform hover:scale-105 rounded-sm border border-white/10 hover:border-white/30"
                >
                  <span>Reserva tu fecha</span>
                  <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
              
              {/* Columna derecha - Formulario */}
              <div className={`bg-white p-8 lg:p-12 shadow-2xl border-l-4 border-[var(--color-primary)] transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0'}`}>
                <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
                  Solicita Información
                </h3>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <input 
                        type="text" 
                        className="w-full border-b-2 border-gray-300 py-3 px-4 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                      <input 
                        type="email" 
                        className="w-full border-b-2 border-gray-300 py-3 px-4 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                      <input 
                        type="tel" 
                        className="w-full border-b-2 border-gray-300 py-3 px-4 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        placeholder="Tu teléfono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento</label>
                      <select className="w-full border-b-2 border-gray-300 py-3 px-4 focus:border-[var(--color-primary)] focus:outline-none transition-colors appearance-none bg-transparent">
                        <option value="">Seleccionar...</option>
                        <option value="boda">Boda</option>
                        <option value="corporativo">Evento Corporativo</option>
                        <option value="social">Evento Social</option>
                        <option value="ceremonia">Ceremonia Religiosa</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                    <textarea 
                      className="w-full border-b-2 border-gray-300 py-3 px-4 focus:border-[var(--color-primary)] focus:outline-none transition-colors min-h-[100px]"
                      placeholder="Cuéntanos sobre tu evento..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <button 
                      type="submit" 
                      className="w-full py-4 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors tracking-wider uppercase text-sm font-medium"
                    >
                      Enviar Solicitud
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 