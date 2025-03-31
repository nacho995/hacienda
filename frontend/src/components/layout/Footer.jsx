"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaInstagram, FaFacebookF, FaPinterestP, FaTwitter, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHeart, FaChevronRight } from 'react-icons/fa';

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Detectar cuando el footer está visible
  useEffect(() => {
    const handleScroll = () => {
      const footerElement = document.getElementById('footer');
      if (!footerElement) return;
      
      const position = footerElement.getBoundingClientRect();
      if (position.top < window.innerHeight - 100) {
        setIsVisible(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Verificar al cargar
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <footer 
      id="footer" 
      className="bg-[var(--color-accent)] text-white relative pt-24 overflow-hidden"
    >
      {/* Patrón decorativo superior */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-[var(--color-primary)]"></div>
      
      {/* Elemento decorativo top */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
        <div className="w-20 h-20 bg-[var(--color-primary)] rotate-45 transform"></div>
      </div>
      
      {/* Elementos decorativos laterales */}
      <div className="absolute top-10 left-0 w-40 h-40 border-l-2 border-t-2" style={{ borderColor: 'var(--color-primary-30)' }}></div>
      <div className="absolute bottom-10 right-0 w-40 h-40 border-r-2 border-b-2" style={{ borderColor: 'var(--color-primary-30)' }}></div>
      
      <div className="container-custom relative">
        {/* Logo y sello */}
        <div className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Image 
            src="/images/logo.svg"
            alt="Hacienda San Carlos"
            width={180}
            height={80}
            className="mx-auto"
          />
          <div className="mt-8 text-sm opacity-80 font-light tracking-wide uppercase">
            Creando momentos extraordinarios desde 1920
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Columna 1: Información de contacto */}
          <div className={`transition-all duration-700 delay-100 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-xl font-[var(--font-display)] text-[var(--color-primary)] mb-6 font-medium">Información de Contacto</h3>
            <div className="w-12 h-[1px] bg-[var(--color-primary)] mb-8"></div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <FaMapMarkerAlt className="text-[var(--color-primary)] mt-1" />
                <div>
                  <p className="text-white/80">Camino a la Hacienda 123</p>
                  <p className="text-white/80">Cuernavaca, Morelos, México</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <FaPhone className="text-[var(--color-primary)]" />
                <p className="text-white/80">+52 (777) 123-4567</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <FaEnvelope className="text-[var(--color-primary)]" />
                <p className="text-white/80">info@haciendasancarlos.com</p>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white">
                <FaFacebookF />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white">
                <FaInstagram />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white">
                <FaPinterestP />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white">
                <FaTwitter />
              </a>
            </div>
          </div>
          
          {/* Columna 2: Enlaces Rápidos */}
          <div className={`transition-all duration-700 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-xl font-[var(--font-display)] text-[var(--color-primary)] mb-6 font-medium">Enlaces Rápidos</h3>
            <div className="w-12 h-[1px] bg-[var(--color-primary)] mb-8"></div>
            
            <ul className="space-y-3">
              {['Inicio', 'Eventos', 'Galería', 'Habitaciones', 'Contacto'].map((item) => (
                <li key={item} className="text-white/80 hover:text-white transition-colors">
                  <Link href={`#${item.toLowerCase()}`} className="flex items-center">
                    <FaChevronRight className="mr-2 text-[var(--color-primary)] text-xs" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Columna 3: Servicios */}
          <div className={`transition-all duration-700 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-xl font-[var(--font-display)] text-[var(--color-primary)] mb-6 font-medium">Nuestros Servicios</h3>
            <div className="w-12 h-[1px] bg-[var(--color-primary)] mb-8"></div>
            
            <ul className="space-y-3">
              {['Bodas', 'Eventos Corporativos', 'Eventos Sociales', 'Ceremonias Religiosas', 'Alojamiento'].map((item) => (
                <li key={item} className="text-white/80 hover:text-white transition-colors">
                  <Link href="#servicios" className="flex items-center">
                    <FaChevronRight className="mr-2 text-[var(--color-primary)] text-xs" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Columna 4: Newsletter */}
          <div className={`transition-all duration-700 delay-400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-xl font-[var(--font-display)] text-[var(--color-primary)] mb-6 font-medium">Suscríbete</h3>
            <div className="w-12 h-[1px] bg-[var(--color-primary)] mb-8"></div>
            
            <p className="text-white/80 mb-6">Mantente al día con nuestras últimas novedades y ofertas especiales.</p>
            
            <form className="space-y-4">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico" 
                  className="w-full bg-white/10 py-3 px-4 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-colors"
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
        
        {/* Banner decorativo */}
        <div className={`relative overflow-hidden border-t border-b py-12 mb-12 transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ borderColor: 'var(--color-primary-20)' }}>
          <div className="absolute top-0 left-0 w-20 h-1 bg-[var(--color-primary)]"></div>
          <div className="absolute bottom-0 right-0 w-20 h-1 bg-[var(--color-primary)]"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
            <div className="text-2xl md:text-3xl font-[var(--font-display)] font-light mb-6 md:mb-0 text-center md:text-left">
              ¿Planeas un <span className="text-[var(--color-primary)]">evento inolvidable</span>?
            </div>
            <Link 
              href="#contacto" 
              className="px-8 py-3 bg-[var(--color-primary)] text-white uppercase tracking-wider text-sm hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="bg-black/30 py-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center text-white/60 text-sm">
            <div>
              &copy; {new Date().getFullYear()} Hacienda San Carlos. Todos los derechos reservados.
            </div>
            <div className="mt-4 md:mt-0">
              Hecho con <FaHeart className="inline-block text-[var(--color-primary)] mx-1" /> por <span className="text-white">tu empresa</span>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
              <Link href="/terminos" className="hover:text-white transition-colors">Términos de Uso</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 