"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaPhoneAlt, FaRegEnvelope, FaSearch, FaCalendarAlt } from 'react-icons/fa';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const decorativeElementRef = useRef(null);
  const invitationPagesRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      
      // Aplicar solo efecto de rotación al borde del sello
      if (decorativeElementRef.current) {
        const rotation = scrollY * 0.1; // Rotación más notable
        decorativeElementRef.current.style.transform = `rotate(${rotation}deg)`;
      }
      
      // Efecto de pasar hojas en invitación sin rotación 
      if (invitationPagesRef.current && invitationPagesRef.current.length) {
        // Calcular qué página mostrar según posición de scroll
        const totalPages = invitationPagesRef.current.length;
        const scrollPerPage = 400; // Cambiar de página con menos frecuencia
        const currentPage = Math.min(Math.floor(scrollY / scrollPerPage) % totalPages, totalPages - 1);
        
        invitationPagesRef.current.forEach((page, index) => {
          if (!page) return;
          
          // Solo mostrar la página actual - sin rotación
          if (index === currentPage) {
            page.style.opacity = '1';
            page.style.transform = 'translateZ(0)';
          } else {
            // Páginas ocultas - sin rotación
            page.style.opacity = '0';
            page.style.transform = 'translateZ(-10px)';
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);
  
  // Inicializar las referencias de las páginas de la invitación
  useEffect(() => {
    // Inicializar referencias para las páginas
    invitationPagesRef.current = Array(4).fill(null);
  }, []);

  const navLinks = [
    { href: 'intro', label: 'Inicio' },
    { href: 'events', label: 'Eventos' },
    { href: 'gallery', label: 'Galería' },
    { href: '/habitaciones', label: 'Habitaciones', isPage: true },
    { href: '/masajes', label: 'Bienestar', isPage: true },
    { href: '/contact', label: 'Contacto', isPage: true }
  ];

  // Función para generar el enlace correcto dependiendo de si estamos en la página de inicio o no
  const getNavHref = (href, isPage) => {
    if (isPage) return href;
    return isHome ? `#${href}` : `/#${href}`;
  };

  return (
    <>
      {/* Barra superior con información de contacto */}
      <div className={`w-full fixed top-0 transition-all duration-500 hidden lg:block z-50 ${
        isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-10 bg-[var(--color-accent)]'
      }`}>
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center space-x-6 text-white/80 text-xs tracking-wider">
            <div className="flex items-center space-x-2">
              <FaPhoneAlt className="h-3 w-3 text-[var(--color-primary)]" />
              <span>+52 (777) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaRegEnvelope className="h-3 w-3 text-[var(--color-primary)]" />
              <span>info@haciendasancarlos.com</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-white/80 text-xs">
            <a href="#" className="hover:text-white transition-colors duration-300">Política de Privacidad</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors duration-300">FAQ</a>
          </div>
        </div>
      </div>
      
      {/* Barra de navegación principal */}
      <nav className={`fixed top-0 w-full transition-all duration-500 z-50 ${
        isScrolled 
          ? 'py-3 bg-white/95 backdrop-blur-sm shadow-lg' 
          : 'py-5 bg-transparent mt-10'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo y navegación izquierda */}
            <div className="flex-1 flex items-center justify-start space-x-8">
              <div className="hidden lg:flex items-center space-x-8">
                {navLinks.slice(0, 2).map((link) => (
                  <Link
                    key={link.href}
                    href={getNavHref(link.href, link.isPage)}
                    className={`text-sm font-medium uppercase tracking-[0.15em] transition-colors border-b border-transparent hover:border-[var(--color-primary)] ${
                      isScrolled 
                        ? 'text-[var(--color-accent)] hover:text-[var(--color-primary)]' 
                        : 'text-white hover:text-[var(--color-primary)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Logo y sello (centrado) */}
            <div className="flex-shrink-0 relative">
              {/* Sello decorativo en lugar del logo */}
              <div className="relative h-20 w-44 flex items-center justify-center">
                {/* Dos capas - externa rotativa e interna estática */}
                <div className="relative w-44 h-44">
                  {/* Capa externa rotativa - solo el sello circular */}
                  <div 
                    ref={decorativeElementRef}
                    className="absolute inset-0 transition-transform duration-700"
                  >
                    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-lg">
                      {/* Sello circular base */}
                      <defs>
                        <radialGradient id="selloBg" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" stopColor="#800020" stopOpacity="0.05" />
                          <stop offset="70%" stopColor="#800020" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#800020" stopOpacity="0.15" />
                        </radialGradient>
                        <filter id="paperTexture" x="-50%" y="-50%" width="200%" height="200%">
                          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
                          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
                        </filter>
                      </defs>
                      
                      {/* Círculo base del sello */}
                      <circle cx="250" cy="250" r="240" fill="url(#selloBg)" filter="url(#paperTexture)" />
                      <circle cx="250" cy="250" r="240" fill="none" stroke="#800020" strokeWidth="5" strokeDasharray="5,10" opacity="0.5" />
                      <circle cx="250" cy="250" r="220" fill="none" stroke="#800020" strokeWidth="2" opacity="0.4" />
                      
                      {/* Bordes del sello dentados */}
                      {Array.from({ length: 40 }).map((_, i) => {
                        const angle = (i * 9) * Math.PI / 180;
                        const r1 = 240;
                        const r2 = 260;
                        const x1 = 250 + r1 * Math.cos(angle);
                        const y1 = 250 + r1 * Math.sin(angle);
                        const x2 = 250 + r2 * Math.cos(angle);
                        const y2 = 250 + r2 * Math.sin(angle);
                        return (
                          <line 
                            key={i} 
                            x1={x1} 
                            y1={y1} 
                            x2={x2} 
                            y2={y2} 
                            stroke="#800020" 
                            strokeWidth="2" 
                            opacity="0.3" 
                          />
                        );
                      })}
                      
                      {/* Texto circular alrededor del sello */}
                      <path id="textCircle" d="M 250,100 A 150,150 0 0 1 250,400 A 150,150 0 0 1 250,100" fill="none" />
                      <text>
                        <textPath xlinkHref="#textCircle" startOffset="0%" textAnchor="middle" className="text-xs tracking-widest font-serif" fill="#800020" opacity="0.7">
                          • HACIENDA SAN CARLOS • BODAS • EVENTOS •
                        </textPath>
                      </text>
                    </svg>
                  </div>
                  
                  {/* Capa interna estática - rectángulo y contenido */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Texto central estático */}
                    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <text x="250" y="240" textAnchor="middle" fontFamily="serif" fontSize="24" fill="#800020" fontWeight="normal" letterSpacing="2" opacity="0.8">
                        HACIENDA
                      </text>
                      <text x="250" y="270" textAnchor="middle" fontFamily="serif" fontSize="18" fill="#800020" fontWeight="normal" letterSpacing="3" opacity="0.7">
                        SAN CARLOS
                      </text>
                    </svg>
                    
                    {/* Páginas de invitación estáticas */}
                    <div className="absolute inset-0 overflow-hidden">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div 
                          key={index} 
                          ref={el => invitationPagesRef.current[index] = el}
                          className="absolute inset-0 transition-all duration-700 ease-in-out"
                          style={{ 
                            opacity: index === 0 ? 1 : 0,
                            backfaceVisibility: 'hidden',
                            transform: index === 0 ? 'translateZ(0)' : 'translateZ(-10px)'
                          }}
                        >
                          <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            {/* Diseño de página de invitación */}
                            <rect x="160" y="160" width="180" height="180" rx="5" fill="#FFFAF0" stroke="#800020" strokeWidth="2" opacity="0.85" />
                            
                            {/* Contenido simplificado para cada página */}
                            {index === 0 && (
                              <>
                                <text x="250" y="200" textAnchor="middle" fontFamily="serif" fontSize="16" fill="#800020" opacity="0.9">
                                  INVITACIÓN
                                </text>
                                <rect x="190" y="215" width="120" height="1" fill="#800020" opacity="0.5" />
                                <text x="250" y="240" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#800020" opacity="0.8">
                                  Bodas y Eventos
                                </text>
                                <text x="250" y="270" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#800020" opacity="0.7">
                                  Hacienda San Carlos
                                </text>
                              </>
                            )}
                            
                            {index === 1 && (
                              <>
                                <text x="250" y="200" textAnchor="middle" fontFamily="serif" fontSize="16" fill="#800020" opacity="0.9">
                                  EVENTOS
                                </text>
                                <rect x="190" y="215" width="120" height="1" fill="#800020" opacity="0.5" />
                                <text x="250" y="240" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#800020" opacity="0.8">
                                  Celebraciones
                                </text>
                                <text x="250" y="270" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#800020" opacity="0.7">
                                  Momentos Inolvidables
                                </text>
                              </>
                            )}
                            
                            {index === 2 && (
                              <>
                                <text x="250" y="200" textAnchor="middle" fontFamily="serif" fontSize="16" fill="#800020" opacity="0.9">
                                  BODAS
                                </text>
                                <rect x="190" y="215" width="120" height="1" fill="#800020" opacity="0.5" />
                                <text x="250" y="240" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#800020" opacity="0.8">
                                  Elegancia y Tradición
                                </text>
                                <text x="250" y="270" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#800020" opacity="0.7">
                                  En un entorno mágico
                                </text>
                              </>
                            )}
                            
                            {index === 3 && (
                              <>
                                <text x="250" y="200" textAnchor="middle" fontFamily="serif" fontSize="16" fill="#800020" opacity="0.9">
                                  HACIENDA
                                </text>
                                <rect x="190" y="215" width="120" height="1" fill="#800020" opacity="0.5" />
                                <text x="250" y="240" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#800020" opacity="0.8">
                                  Historia y Belleza
                                </text>
                                <text x="250" y="270" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#800020" opacity="0.7">
                                  Cuernavaca, Morelos
                                </text>
                              </>
                            )}
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Link para la página de inicio */}
                <Link href="/" className="block absolute inset-0 z-10">
                  <span className="sr-only">Hacienda San Carlos - Inicio</span>
                </Link>
              </div>
            </div>

            {/* Navegación derecha y botones */}
            <div className="flex-1 flex items-center justify-end">
              <div className="hidden lg:flex items-center space-x-8">
                {navLinks.slice(2).map((link) => (
                  <Link
                    key={link.href}
                    href={getNavHref(link.href, link.isPage)}
                    className={`text-sm font-medium uppercase tracking-[0.15em] transition-colors border-b border-transparent hover:border-[var(--color-primary)] ${
                      isScrolled 
                        ? 'text-[var(--color-accent)] hover:text-[var(--color-primary)]' 
                        : 'text-white hover:text-[var(--color-primary)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Botón de búsqueda */}
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`transition-colors duration-300 ${
                    isScrolled 
                      ? 'text-[var(--color-accent)]' 
                      : 'text-white'
                  }`}
                >
                  <FaSearch />
                </button>
                
                {/* Botón de reserva destacado en navbar */}
                <Link
                  href="/reservar"
                  className={`flex items-center space-x-2 bg-[var(--color-primary)] text-white px-6 py-3 transition-all duration-300 hover:bg-[var(--color-primary-dark)] shadow-lg transform hover:scale-105 ${
                    isScrolled ? 'opacity-100' : 'opacity-95'
                  }`}
                >
                  <FaCalendarAlt className="mr-1" />
                  <span className="font-medium uppercase tracking-wider text-sm">Reservar</span>
                </Link>
              </div>

              {/* Botón de menú móvil */}
              <button
                className="lg:hidden text-2xl relative z-50"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="text-white" />
                ) : (
                  <FaBars className={isScrolled ? 'text-[var(--color-accent)]' : 'text-white'} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Barra de búsqueda */}
      <div 
        className={`fixed w-full bg-white shadow-md z-40 transition-all duration-500 ${
          isSearchOpen ? 'top-[80px] opacity-100' : '-top-20 opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full px-4 py-3 bg-gray-100 focus:outline-none focus:bg-gray-50 transition-colors"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--color-primary)]">
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div 
        className={`fixed inset-0 bg-[var(--color-accent)] z-40 transition-transform duration-500 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col justify-center items-center px-6">
          <div className="mb-12">
            <Image 
              src="/images/logo.svg"
              alt="Hacienda San Carlos"
              width={160}
              height={60}
            />
          </div>
          
          <div className="flex flex-col space-y-6 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getNavHref(link.href, link.isPage)}
                className="text-white text-xl uppercase tracking-[0.2em] hover:text-[var(--color-primary)] transition-colors py-2 border-b border-[var(--color-primary)]/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Botón destacado de reservar en el menú móvil */}
            <Link
              href="/reservar"
              className="mt-8 flex items-center justify-center space-x-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors px-8 py-4 uppercase tracking-[0.2em] font-semibold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaCalendarAlt className="mr-2" />
              <span>Reservar Evento</span>
            </Link>
          </div>
          
          <div className="mt-16 flex flex-col items-center space-y-4 text-white/70">
            <div className="flex items-center space-x-2">
              <FaPhoneAlt className="h-4 w-4 text-[var(--color-primary)]" />
              <span>+52 (777) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaRegEnvelope className="h-4 w-4 text-[var(--color-primary)]" />
              <span>info@haciendasancarlos.com</span>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-white/20">
              <a href="#" className="text-sm hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-sm hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-sm hover:text-white transition-colors">Pinterest</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 