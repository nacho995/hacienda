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
        {/* Se elimina el Logo y sello */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Columna 1: Información de contacto */}
          <div className={`transition-all duration-700 delay-100 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-xl font-[var(--font-display)] text-[var(--color-primary-light)] mb-6 font-bold tracking-wide border-b-2 border-[var(--color-primary)] pb-2 inline-block">Información de Contacto</h3>
            <div className="w-12 h-[2px] bg-gradient-to-r from-[var(--color-primary-light)] to-transparent mb-8"></div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-lg ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                  <FaMapMarkerAlt className="text-white text-sm" />
                </div>
                <div className="group-hover:translate-x-1 transition-transform duration-300">
                  <p className="text-white/90 font-medium">Camino a la Hacienda 123</p>
                  <p className="text-white/80">Cuernavaca, Morelos, México</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-lg ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                  <FaPhone className="text-white text-sm" />
                </div>
                <p className="text-white/90 font-medium group-hover:translate-x-1 transition-transform duration-300">+52 (777) 123-4567</p>
              </div>
              
              <div className="flex items-center space-x-4 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-lg ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                  <FaEnvelope className="text-white text-sm" />
                </div>
                <p className="text-white/90 font-medium group-hover:translate-x-1 transition-transform duration-300">info@haciendasancarlos.com</p>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] transition-all duration-300 shadow-lg transform hover:scale-110 ring-1 ring-white/10 hover:ring-white/30">
                <FaFacebookF />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] transition-all duration-300 shadow-lg transform hover:scale-110 ring-1 ring-white/10 hover:ring-white/30">
                <FaInstagram />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] transition-all duration-300 shadow-lg transform hover:scale-110 ring-1 ring-white/10 hover:ring-white/30">
                <FaPinterestP />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] transition-all duration-300 shadow-lg transform hover:scale-110 ring-1 ring-white/10 hover:ring-white/30">
                <FaTwitter />
              </a>
            </div>
          </div>
          
          {/* Columna 2: Enlaces Rápidos */}
          <div className={`transition-all duration-700 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-xl font-[var(--font-display)] text-[var(--color-primary-light)] mb-6 font-bold tracking-wide border-b-2 border-[var(--color-primary)] pb-2 inline-block">Enlaces Rápidos</h3>
            <div className="w-12 h-[2px] bg-gradient-to-r from-[var(--color-primary-light)] to-transparent mb-8"></div>
            
            <ul className="space-y-3">
              <li className="text-white/90 hover:text-white transition-all duration-200 group">
                <Link href="/" className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3 shadow-md ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                    <FaChevronRight className="text-white text-[10px]" />
                  </div>
                  <span className="font-medium">Inicio</span>
                </Link>
              </li>
              <li className="text-white/90 hover:text-white transition-all duration-200 group">
                <Link href="/#events" className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3 shadow-md ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                    <FaChevronRight className="text-white text-[10px]" />
                  </div>
                  <span className="font-medium">Eventos</span>
                </Link>
              </li>
              <li className="text-white/90 hover:text-white transition-all duration-200 group">
                <Link href="/#gallery" className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3 shadow-md ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                    <FaChevronRight className="text-white text-[10px]" />
                  </div>
                  <span className="font-medium">Galería</span>
                </Link>
              </li>
              <li className="text-white/90 hover:text-white transition-all duration-200 group">
                <Link href="/habitaciones" className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3 shadow-md ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                    <FaChevronRight className="text-white text-[10px]" />
                  </div>
                  <span className="font-medium">Hotel</span>
                </Link>
              </li>
              <li className="text-white/90 hover:text-white transition-all duration-200 group">
                <Link href="/contact" className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3 shadow-md ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                    <FaChevronRight className="text-white text-[10px]" />
                  </div>
                  <span className="font-medium">Contacto</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Columna 3: Páginas legales */}
          <div className={`transition-all duration-700 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-xl font-[var(--font-display)] text-[var(--color-primary-light)] mb-6 font-bold tracking-wide border-b-2 border-[var(--color-primary)] pb-2 inline-block">Información Legal</h3>
            <div className="w-12 h-[2px] bg-gradient-to-r from-[var(--color-primary-light)] to-transparent mb-8"></div>
            
            <ul className="space-y-3">
              <li className="text-white/90 hover:text-white transition-all duration-200 group">
                <Link href="/aviso-legal" className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3 shadow-md ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                    <FaChevronRight className="text-white text-[10px]" />
                  </div>
                  <span className="font-medium">Aviso Legal</span>
                </Link>
              </li>
              <li className="text-white/90 hover:text-white transition-all duration-200 group">
                <Link href="/cookies" className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3 shadow-md ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                    <FaChevronRight className="text-white text-[10px]" />
                  </div>
                  <span className="font-medium">Política de Cookies</span>
                </Link>
              </li>
              <li className="text-white/90 hover:text-white transition-all duration-200 group">
                <Link href="/privacidad" className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3 shadow-md ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                    <FaChevronRight className="text-white text-[10px]" />
                  </div>
                  <span className="font-medium">Política de Privacidad</span>
                </Link>
              </li>
              <li className="text-white/90 hover:text-white transition-all duration-200 group">
                <Link href="/terminos" className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3 shadow-md ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                    <FaChevronRight className="text-white text-[10px]" />
                  </div>
                  <span className="font-medium">Términos de Uso</span>
                </Link>
              </li>
              <li className="text-white/90 hover:text-white transition-all duration-200 group">
                <Link href="/reservar" className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3 shadow-md ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                    <FaChevronRight className="text-white text-[10px]" />
                  </div>
                  <span className="font-medium">Cotizar</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Banner decorativo */}
        <div className={`relative overflow-hidden bg-[var(--color-accent-dark)] rounded-lg shadow-2xl p-12 mb-12 transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Bordes decorativos animados */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-primary)] via-transparent to-[var(--color-primary)]"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-primary)] via-transparent to-[var(--color-primary)]"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
          
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-4 left-4 w-16 h-16 border border-[var(--color-primary)]/20 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 border border-[var(--color-primary)]/20 rounded-full"></div>
          <div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-4 h-4 bg-[var(--color-primary)]/30 rounded-full blur-sm"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between relative z-10">
            <div className="text-2xl md:text-3xl font-[var(--font-display)] font-light mb-8 md:mb-0 text-center md:text-left perspective-[1000px] transform-style-preserve-3d">
              ¿Planeas un <span className="font-bold transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-brown-medium)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light)", transform: "translateZ(20px)", display: "inline-block"}}>evento inolvidable</span>?
            </div>
            <Link 
              href="/contact" 
              className="px-8 py-4 bg-gradient-to-r from-[var(--color-brown-medium)] to-[var(--color-brown-dark)] text-black font-bold uppercase tracking-wider text-sm hover:from-[var(--color-brown-dark)] hover:to-[var(--color-brown-medium)] border border-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg rounded-sm flex items-center group"
            >
              <span className="mr-2">Contáctanos</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="bg-black/50 backdrop-blur-sm py-8 border-t border-[var(--color-primary)]/30">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-between items-center text-white/80 text-sm">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">©</span>
              </div>
              <div className="font-medium">
                {new Date().getFullYear()} Hacienda San Carlos. Todos los derechos reservados.
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[var(--color-primary)]/50 to-transparent hidden md:block"></div>
              <div className="px-4 font-medium">
                Hecho con <span className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full mx-1 shadow-lg ring-1 ring-white/10"><FaHeart className="text-white text-xs animate-pulse" /></span> en México
              </div>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[var(--color-primary)]/50 to-transparent hidden md:block"></div>
            </div>
            
            <div className="flex space-x-6 justify-center md:justify-end">
              <Link href="/privacidad" className="hover:text-white transition-colors font-medium hover:underline flex items-center">
                <span className="w-1 h-1 rounded-full bg-[var(--color-primary)] mr-2"></span>
                Privacidad
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors font-medium hover:underline flex items-center">
                <span className="w-1 h-1 rounded-full bg-[var(--color-primary)] mr-2"></span>
                Cookies
              </Link>
              <Link href="/aviso-legal" className="hover:text-white transition-colors font-medium hover:underline flex items-center">
                <span className="w-1 h-1 rounded-full bg-[var(--color-primary)] mr-2"></span>
                Legal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 