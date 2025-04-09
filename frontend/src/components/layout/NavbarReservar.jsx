"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaPhoneAlt, FaRegEnvelope, FaSearch, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';

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
    { href: '/habitaciones', label: 'Hotel', isPage: true },
    { href: '/servicios', label: 'Servicios', isPage: true },
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
          ? 'py-3 bg-black/50 backdrop-blur-md shadow-lg' 
          : 'py-5 bg-black/20 backdrop-blur-sm md:pt-8 lg:mt-10'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo con diseño de castillo */}
            <div className="hidden lg:flex items-center mr-8">
              <div className="relative w-48 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Puerta principal */}
                  <div className="absolute w-40 h-28 bg-white/80 backdrop-blur-sm rounded-t-[100px] shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    {/* Líneas decorativas superiores */}
                    <div className="absolute top-3 left-4 right-4 h-[2px] bg-slate-200"></div>
                    <div className="absolute top-6 left-4 right-4 h-[2px] bg-slate-200"></div>
                    {/* Líneas verticales */}
                    <div className="absolute top-9 left-4 w-[2px] h-6 bg-slate-200"></div>
                    <div className="absolute top-9 right-4 w-[2px] h-6 bg-slate-200"></div>
                    {/* Líneas decorativas inferiores */}
                    <div className="absolute bottom-6 left-4 right-4 h-[2px] bg-slate-200"></div>
                    <div className="absolute bottom-3 left-4 right-4 h-[2px] bg-slate-200"></div>
                  </div>
                  {/* Torre izquierda */}
                  <div className="absolute w-8 h-32 bg-white/80 backdrop-blur-sm left-4 rounded-t-lg shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    {/* Líneas decorativas torre izquierda */}
                    <div className="absolute top-3 left-1 right-1 h-[2px] bg-slate-200"></div>
                    <div className="absolute top-6 left-1 right-1 h-[2px] bg-slate-200"></div>
                    <div className="absolute bottom-6 left-1 right-1 h-[2px] bg-slate-200"></div>
                  </div>
                  {/* Torre derecha */}
                  <div className="absolute w-8 h-32 bg-white/80 backdrop-blur-sm right-4 rounded-t-lg shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    {/* Líneas decorativas torre derecha */}
                    <div className="absolute top-3 left-1 right-1 h-[2px] bg-slate-200"></div>
                    <div className="absolute top-6 left-1 right-1 h-[2px] bg-slate-200"></div>
                    <div className="absolute bottom-6 left-1 right-1 h-[2px] bg-slate-200"></div>
                  </div>
                  {/* Almenas superiores con líneas */}
                  <div className="absolute top-0 w-full flex justify-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="relative w-4 h-4 bg-white/80 backdrop-blur-sm rounded-t-lg shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        <div className="absolute top-1 left-1 right-1 h-[1px] bg-slate-200"></div>
                      </div>
                    ))}
                  </div>
                  {/* Arco decorativo */}
                  <div className="absolute top-9 left-1/2 transform -translate-x-1/2 w-24 h-24 border-t-2 border-slate-200 rounded-full"></div>
                </div>
                <Image 
                  src="/logo.png" 
                  alt="Hacienda San Carlos" 
                  width={160} 
                  height={160} 
                  className="relative z-10 object-contain"
                  style={{ 
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>
            </div>
            
            {/* Navegación izquierda */}
            <div className="hidden lg:flex flex-1 items-center justify-end space-x-8">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={getNavHref(link.href, link.isPage)}
                  className={`text-sm font-medium uppercase tracking-[0.15em] transition-colors border-b border-transparent hover:border-[var(--color-primary)] ${
                    isScrolled 
                      ? 'text-white hover:text-[var(--color-primary)]' 
                      : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] hover:text-[var(--color-primary)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Botón de menú móvil (visible solo en móvil) */}
            <div className="lg:hidden">
              <button
                className="text-3xl relative z-50 p-2 rounded-full bg-[var(--color-primary)]/80 backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                ) : (
                  <FaBars className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                )}
              </button>
            </div>

            {/* Logo y sello (centrado) */}
            <div className="flex-shrink-0 relative mx-auto">
              {/* Sello decorativo en lugar del logo */}
              <div className="relative h-16 md:h-20 w-32 md:w-40 flex items-center justify-center">
                {/* Dos capas - externa rotativa e interna estática */}
                <div className="relative w-48 h-48 scale-[0.55]">
                  {/* Capa externa rotativa - solo el sello circular */}
                  <div 
                    ref={decorativeElementRef}
                    className="absolute inset-0 transition-transform duration-700"
                  >
                    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-lg">
                      {/* Anillo de compromiso con diamante */}
                      <defs>
                        <radialGradient id="ringGold" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.8" />
                          <stop offset="95%" stopColor="#FFD700" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#FFEC8B" stopOpacity="1" />
                        </radialGradient>
                        <radialGradient id="diamond" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                          <stop offset="50%" stopColor="#F0F8FF" stopOpacity="0.95" />
                          <stop offset="80%" stopColor="#E6E8FA" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#B9D3EE" stopOpacity="0.85" />
                        </radialGradient>
                        <linearGradient id="diamondHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                          <stop offset="100%" stopColor="#F0F8FF" stopOpacity="0.3" />
                        </linearGradient>
                        <filter id="diamondSparkle">
                          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                          <feGaussianBlur stdDeviation="1" />
                        </filter>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="intense-glow" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="8" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="2" />
                          </feComponentTransfer>
                        </filter>
                        <filter id="super-glow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="10" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="2.5" />
                          </feComponentTransfer>
                        </filter>
                      </defs>
                      
                      {/* Base circular del anillo */}
                      <circle cx="250" cy="250" r="220" fill="none" stroke="url(#ringGold)" strokeWidth="24" opacity="0.9" />
                      <circle cx="250" cy="250" r="240" fill="none" stroke="#D4AF37" strokeWidth="3" strokeDasharray="2,4" opacity="0.5" />
                      <circle cx="250" cy="250" r="210" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.6" />
                      
                      {/* Detalles del anillo - pequeñas gemas */}
                      {Array.from({ length: 24 }).map((_, i) => {
                        if (i === 0) return null; // Espacio para el diamante principal
                        const angle = (i * 15) * Math.PI / 180;
                        const r1 = 232; // En el borde exterior del anillo
                        const x1 = Math.round((250 + r1 * Math.cos(angle)) * 100) / 100;
                        const y1 = Math.round((250 + r1 * Math.sin(angle)) * 100) / 100;
                        // Alternar entre gemas doradas y pequeños brillantes
                        const isGoldGem = i % 3 === 0;
                        return isGoldGem ? (
                          <circle 
                            key={i} 
                            cx={x1} 
                            cy={y1} 
                            r="6" 
                            fill="#FFDF00" 
                            opacity="0.8" 
                            filter="url(#glow)"
                          />
                        ) : (
                          <circle 
                            key={i} 
                            cx={x1} 
                            cy={y1} 
                            r="4" 
                            fill="white" 
                            opacity="0.7" 
                            filter="url(#glow)"
                          />
                        );
                      })}
                      
                      {/* Diamante principal en el borde superior */}
                      <g transform="translate(250, 15)">
                        {/* Base del diamante */}
                        <circle cx="0" cy="0" r="28" fill="url(#ringGold)" stroke="#D4AF37" strokeWidth="3" />
                        
                        {/* Diamante con facetas */}
                        <g filter="url(#super-glow)">
                          {/* Forma principal */}
                          <polygon 
                            points="0,-48 34,0 0,48 -34,0" 
                            fill="url(#diamond)" 
                            stroke="#FFFFFF" 
                            strokeWidth="1.5"
                          />
                          
                          {/* Facetas - mejoran la apariencia de 3D */}
                          <polygon 
                            points="0,-48 15,-20 -15,-20" 
                            fill="url(#diamondHighlight)" 
                            opacity="0.9"
                          />
                          <polygon 
                            points="0,48 15,20 -15,20" 
                            fill="url(#diamondHighlight)" 
                            opacity="0.7"
                          />
                          <polygon 
                            points="34,0 15,20 15,-20" 
                            fill="url(#diamondHighlight)" 
                            opacity="0.8"
                          />
                          <polygon 
                            points="-34,0 -15,20 -15,-20" 
                            fill="url(#diamondHighlight)" 
                            opacity="0.8"
                          />
                          
                          {/* Brillo central */}
                          <polygon 
                            points="-15,-25 15,-25 0,15" 
                            fill="white" 
                            opacity="0.9"
                          />
                        </g>
                        
                        {/* Destellos adicionales */}
                        <circle cx="-22" cy="-22" r="4" fill="white" opacity="0.9" filter="url(#intense-glow)" />
                        <circle cx="22" cy="-22" r="4" fill="white" opacity="0.9" filter="url(#intense-glow)" />
                        <circle cx="0" cy="-40" r="3" fill="white" opacity="0.9" filter="url(#intense-glow)" />
                        <circle cx="-18" cy="18" r="3" fill="white" opacity="0.8" filter="url(#glow)" />
                        <circle cx="18" cy="18" r="3" fill="white" opacity="0.8" filter="url(#glow)" />
                        <circle cx="0" cy="0" r="6" fill="white" opacity="0.7" filter="url(#glow)" />
                      </g>
                      
                      {/* Texto circular alrededor del anillo */}
                      <path id="textCircle" d="M 250,100 A 150,150 0 0 1 250,400 A 150,150 0 0 1 250,100" fill="none" />
                      <text>
                        <textPath xlinkHref="#textCircle" startOffset="0%" textAnchor="middle" className="text-xs tracking-widest font-serif" fill="#D4AF37" opacity="0.9">
                          • HACIENDA SAN CARLOS BORROMEO • BODAS • EVENTOS •
                        </textPath>
                      </text>
                    </svg>
                  </div>
                  
                  {/* Capa interna estática - rectángulo y contenido */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Texto central estático */}
                    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <text x="250" y="250" textAnchor="middle" fontFamily="serif" fontSize="48" fill="#D4AF37" fontWeight="bold" letterSpacing="1" opacity="1" filter="url(#textShadow)">
                        HACIENDA
                      </text>
                      <text x="250" y="310" textAnchor="middle" fontFamily="serif" fontSize="38" fill="#D4AF37" fontWeight="bold" letterSpacing="1" opacity="1" filter="url(#textShadow)">
                        SAN CARLOS
                      </text>
                      <text x="250" y="350" textAnchor="middle" fontFamily="serif" fontSize="30" fill="#D4AF37" fontWeight="bold" letterSpacing="1" opacity="1" filter="url(#textShadow)">
                        BORROMEO
                      </text>
                    </svg>
                    
                    {/* Páginas de invitación estáticas - ocultas para el diseño de anillo */}
                    <div className="absolute inset-0 overflow-hidden opacity-0">
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

            {/* Logo y navegación derecha */}
            <div className="hidden lg:flex flex-1 items-center space-x-8">
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={getNavHref(link.href, link.isPage)}
                  className={`text-sm font-medium uppercase tracking-[0.15em] transition-colors border-b border-transparent hover:border-[var(--color-primary)] ${
                    isScrolled 
                      ? 'text-white hover:text-[var(--color-primary)]' 
                      : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] hover:text-[var(--color-primary)]'
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
                    ? 'text-white' 
                    : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                }`}
              >
                <FaSearch />
              </button>
              
              {/* Botón de reserva destacado */}
              <Link
                href="/reservar"
                className={`flex items-center space-x-2 bg-[var(--color-brown-medium)] text-black px-6 py-3 transition-all duration-300 hover:bg-[var(--color-brown-dark)] shadow-lg transform hover:scale-105 ${
                  isScrolled ? 'opacity-100' : 'opacity-95 shadow-[0_4px_8px_rgba(0,0,0,0.3)]'
                }`}
              >
                <FaCalendarAlt className="mr-1" />
                <span className="font-bold uppercase tracking-wider text-sm">Cotizar</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Barra de búsqueda */}
      <div 
        className={`fixed w-full bg-black/50 backdrop-blur-md shadow-md z-40 transition-all duration-500 ${
          isSearchOpen ? 'top-[80px] opacity-100' : '-top-20 opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full px-4 py-3 bg-black/30 text-white border border-gray-700 rounded-md focus:outline-none focus:border-[var(--color-primary)] focus:bg-black/40 transition-colors placeholder-white/60"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--color-primary)]">
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div className={`fixed inset-0 z-40 overflow-y-auto transition-transform duration-500 transform ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Fondo con gradiente elegante */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brown-light)] via-[var(--color-brown-medium)] to-[var(--color-brown-dark)] opacity-95 backdrop-blur-md"></div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-64 h-64 border-l-2 border-t-2 border-white/10 opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 border-r-2 border-b-2 border-white/10 opacity-30"></div>
        <div className="absolute top-1/4 right-10 w-32 h-32 rounded-full bg-[var(--color-primary-light)]/10 blur-xl"></div>
        <div className="absolute bottom-1/4 left-10 w-40 h-40 rounded-full bg-white/5 blur-xl"></div>
        
        <div className="container mx-auto p-6 pt-24 md:pt-32 lg:pt-24 relative z-10">
          <div className="mt-8 md:mt-12">
            <ul className="space-y-6 text-center font-[var(--font-display)]">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={getNavHref(link.href, link.isPage)}
                    className="text-2xl text-white font-semibold tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] hover:text-[var(--color-cream-light)] transition-colors duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Botón destacado de reservar en el menú móvil */}
            <div className="mt-12 text-center">
              <Link
                href="/reservar"
                className="inline-flex items-center justify-center space-x-2 bg-[var(--color-brown-medium)] text-black hover:bg-[var(--color-brown-dark)] transition-colors px-8 py-4 uppercase tracking-wider font-bold shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaCalendarAlt className="mr-2" />
                <span>Cotizar Evento</span>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-col items-center space-y-4 text-white">
              <div className="flex items-center space-x-2">
                <FaPhoneAlt className="h-4 w-4 text-white" />
                <span className="font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">+52 (777) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaRegEnvelope className="h-4 w-4 text-white" />
                <span className="font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">info@haciendasancarlos.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 