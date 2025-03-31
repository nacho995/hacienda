"use client";

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: 'intro', label: 'Inicio' },
    { href: 'events', label: 'Eventos' },
    { href: 'gallery', label: 'Galería' },
    { href: '/habitaciones', label: 'Habitaciones', isPage: true },
    { href: 'contact', label: 'Contacto' }
  ];

  // Función para generar el enlace correcto dependiendo de si estamos en la página de inicio o no
  const getNavHref = (href, isPage) => {
    if (isPage) return href;
    return isHome ? `#${href}` : `/#${href}`;
  };

  return (
    <>
      {/* Barra superior con información de contacto */}
      <div className={`w-full transition-all duration-500 hidden lg:block z-50 ${
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
      
      {/* Botón destacado de reservas - Fijo en la esquina */}
      <div className="fixed top-24 right-0 z-50 transform rotate-90 origin-right">
        <Link 
          href="/reservar"
          className={`flex items-center space-x-2 px-6 py-3 bg-[var(--color-primary)] text-white font-semibold shadow-lg hover:bg-[var(--color-primary-dark)] transition-all duration-300 ${
            isScrolled ? 'translate-y-[-10px]' : ''
          }`}
        >
          <FaCalendarAlt className="mr-2 text-white" />
          <span className="uppercase tracking-wider text-sm">Reserva Tu Evento</span>
        </Link>
      </div>
      
      {/* Barra de navegación principal */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled ? 'py-3 bg-white/95 backdrop-blur-sm shadow-lg' : 'py-5 bg-transparent'
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

            {/* Logo (centrado) */}
            <div className="flex-shrink-0 relative">
              <Link href="/" className="block">
                <div className={`transition-all duration-500 ${isScrolled ? 'opacity-100 scale-75' : 'opacity-90'}`}>
                  <Image 
                    src="/images/logo.svg"
                    alt="Hacienda San Carlos"
                    width={180}
                    height={80}
                  />
                </div>
              </Link>
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
                    isScrolled ? 'text-[var(--color-accent)]' : 'text-white'
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