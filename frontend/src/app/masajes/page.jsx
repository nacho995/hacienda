"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaClock, FaLeaf, FaHeart, FaRegGem, FaWater, FaSpa, FaChevronDown, FaChevronRight } from 'react-icons/fa';

// Datos de servicios de masajes
const SERVICIOS_MASAJE = [
  {
    id: 1,
    nombre: "Masaje Relajante con Aromaterapia",
    descripcion: "Sumérgete en un oasis de tranquilidad con nuestro masaje relajante que combina técnicas suaves con aceites esenciales para aliviar el estrés y la tensión.",
    duracion: "60 / 90 min",
    precio: 1200,
    imagen: "/images/placeholder/massage1.svg",
    destacado: true,
    beneficios: [
      "Reduce el estrés y la ansiedad",
      "Mejora la calidad del sueño",
      "Alivia dolores musculares",
      "Aumenta la circulación sanguínea"
    ]
  },
  {
    id: 2,
    nombre: "Masaje de Piedras Calientes",
    descripcion: "Experimenta el poder curativo de las piedras volcánicas calientes combinadas con técnicas de masaje que alivian profundamente la tensión muscular.",
    duracion: "75 min",
    precio: 1500,
    imagen: "/images/placeholder/massage2.svg",
    destacado: false,
    beneficios: [
      "Desbloquea nudos musculares profundos",
      "Mejora la flexibilidad",
      "Estimula el metabolismo",
      "Reduce la inflamación"
    ]
  },
  {
    id: 3,
    nombre: "Ritual Herbal Detox",
    descripcion: "Un tratamiento holístico que comienza con exfoliación, seguido de un masaje con hierbas mexicanas tradicionales que desintoxican y revitalizan el cuerpo.",
    duracion: "90 min",
    precio: 1700,
    imagen: "/images/placeholder/massage3.svg",
    destacado: false,
    beneficios: [
      "Elimina toxinas del cuerpo",
      "Hidrata y nutre la piel",
      "Mejora el sistema linfático",
      "Equilibra las energías corporales"
    ]
  },
  {
    id: 4,
    nombre: "Masaje Premium Hacienda",
    descripcion: "Nuestra experiencia insignia que combina diversas técnicas de masaje con tratamientos faciales, reflexología y aromaterapia para una renovación completa.",
    duracion: "120 min",
    precio: 2100,
    imagen: "/images/placeholder/massage4.svg",
    destacado: true,
    beneficios: [
      "Experiencia integral de bienestar",
      "Rejuvenecimiento facial y corporal",
      "Alivio total del estrés",
      "Sensación de renovación completa"
    ]
  }
];

// Datos de terapeutas
const TERAPEUTAS = [
  {
    id: 1,
    nombre: "Alejandra Morales",
    especialidad: "Masaje Terapéutico y Aromaterapia",
    experiencia: "12 años",
    imagen: "/images/placeholder/therapist1.svg",
    bio: "Certificada en técnicas internacionales de masaje y experta en aromaterapia ancestral mexicana."
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    especialidad: "Masaje Deportivo y Descontracturante",
    experiencia: "8 años",
    imagen: "/images/placeholder/therapist2.svg", 
    bio: "Especialista en recuperación de lesiones deportivas y técnicas avanzadas de liberación miofascial."
  },
  {
    id: 3,
    nombre: "Sofía Juárez",
    especialidad: "Terapias Holísticas y Energéticas",
    experiencia: "15 años",
    imagen: "/images/placeholder/therapist3.svg",
    bio: "Maestra en terapias alternativas que integra técnicas tradicionales con enfoques energéticos modernos."
  }
];

export default function MasajesPage() {
  const [selectedMassage, setSelectedMassage] = useState(null);
  const [animateHero, setAnimateHero] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const scrollRef = useRef(null);
  
  // Efecto para animación inicial
  useEffect(() => {
    setAnimateHero(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Calcular opacidad para elementos parallax en función del scroll
  const heroOpacity = Math.max(1 - scrollY * 0.002, 0);
  const heroScale = 1 + scrollY * 0.0003;
  const heroTranslateY = scrollY * 0.5;
  
  const handleScrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative h-screen overflow-hidden flex items-center justify-center"
      >
        {/* Fondo con efecto parallax */}
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            opacity: heroOpacity,
            transform: `scale(${heroScale}) translateY(-${heroTranslateY}px)`
          }}
        >
          <Image
            src="/images/placeholder/spa-hero.svg"
            alt="Experiencia de bienestar en Hacienda San Carlos"
            fill
            className="object-cover transition-transform duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/50"></div>
        </div>
        
        {/* Contenido del hero */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={animateHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-[var(--font-display)] text-white mb-6 leading-tight">
              Santuario <span className="text-[var(--color-primary)]">de Bienestar</span>
            </h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={animateHero ? { width: "150px" } : {}}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-[2px] bg-[var(--color-primary)] mx-auto mb-10"
            ></motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={animateHero ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-white/90 text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Descubre un oasis de tranquilidad en nuestra hacienda, donde las técnicas ancestrales se 
              fusionan con terapias modernas para renovar cuerpo, mente y alma.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={animateHero ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 1.2 }}
            >
              <Link
                href="#servicios"
                className="px-10 py-4 bg-[var(--color-primary)] text-white text-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors inline-block shadow-xl transform hover:scale-105 transition-transform duration-300"
              >
                Descubrir Experiencias
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Botón para scroll down */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={animateHero ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
            onClick={handleScrollDown}
          >
            <div className="flex flex-col items-center">
              <p className="text-white mb-2 text-sm tracking-widest">DESCUBRE</p>
              <FaChevronDown className="text-white text-2xl animate-bounce" />
            </div>
          </motion.div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-48 h-48 border border-[var(--color-primary)]/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-40 w-20 h-20 border border-[var(--color-primary)]/40 rounded-full animate-pulse delay-500"></div>
      </section>
      
      {/* Introducción */}
      <section 
        ref={scrollRef} 
        className="py-20 bg-[var(--color-cream-light)]"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
              El Arte del Bienestar
            </h2>
            <div className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-10"></div>
            <p className="text-lg text-gray-700 mb-12 leading-relaxed">
              En Hacienda San Carlos, el bienestar es un pilar fundamental de nuestra filosofía. 
              Nuestro Santuario de Bienestar ofrece una colección de terapias cuidadosamente diseñadas 
              para reconectar con uno mismo en un entorno de lujo rústico y natural.
            </p>
          </div>
          
          {/* Beneficios destacados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center p-8 bg-white shadow-xl relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full 
                              transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaLeaf className="text-3xl text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-accent)] mb-4">Ambiente Natural</h3>
                <p className="text-gray-600">
                  Un entorno que fusiona la arquitectura colonial con la naturaleza para crear una atmósfera de serenidad absoluta.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center p-8 bg-white shadow-xl relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full 
                              transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaHeart className="text-3xl text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-accent)] mb-4">Terapeutas Expertos</h3>
                <p className="text-gray-600">
                  Profesionales certificados con experiencia en técnicas tradicionales y modernas para un cuidado excepcional.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center p-8 bg-white shadow-xl relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full 
                              transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaWater className="text-3xl text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-accent)] mb-4">Productos Naturales</h3>
                <p className="text-gray-600">
                  Utilizamos exclusivamente productos orgánicos y aceites esenciales puros para tratamientos efectivos y sustentables.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Servicios de Masaje */}
      <section id="servicios" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
              Nuestras Terapias
            </h2>
            <div className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Cada terapia está diseñada para proporcionar una experiencia sensorial única, adaptada a tus necesidades específicas.
            </p>
          </div>
          
          {/* Listado de masajes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {SERVICIOS_MASAJE.map((servicio) => (
              <motion.div
                key={servicio.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-50px" }}
                className="flex flex-col md:flex-row gap-8 group"
              >
                <div className="md:w-1/2 relative overflow-hidden rounded-lg">
                  <div className="aspect-w-4 aspect-h-3">
                    <Image
                      src={servicio.imagen}
                      alt={servicio.nombre}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {servicio.destacado && (
                      <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white text-sm px-4 py-1 font-medium">
                        Destacado
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-accent)] mb-3">
                    {servicio.nombre}
                  </h3>
                  
                  <div className="flex items-center mb-4 text-sm text-gray-600">
                    <FaClock className="mr-2 text-[var(--color-primary)]" />
                    <span>{servicio.duracion}</span>
                    <span className="mx-3">|</span>
                    <span className="font-semibold text-[var(--color-primary)]">
                      ${servicio.precio} MXN
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-5">
                    {servicio.descripcion}
                  </p>
                  
                  <h4 className="font-medium text-[var(--color-accent)] mb-3">Beneficios:</h4>
                  <ul className="space-y-2 mb-8">
                    {servicio.beneficios.map((beneficio, index) => (
                      <li key={index} className="flex items-start">
                        <FaChevronRight className="mt-1 mr-2 text-[var(--color-primary)] flex-shrink-0" />
                        <span className="text-gray-600">{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href="/reservar"
                    className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors"
                  >
                    Reservar Ahora
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Sección de Terapeutas */}
      <section className="py-20 bg-[var(--color-cream-light)]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
              Nuestros Terapeutas
            </h2>
            <div className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Expertos certificados que brindan experiencias excepcionales adaptadas a tus necesidades individuales.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {TERAPEUTAS.map((terapeuta, index) => (
              <motion.div
                key={terapeuta.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white shadow-xl overflow-hidden group"
              >
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={terapeuta.imagen}
                    alt={terapeuta.nombre}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <h3 className="text-xl font-medium">{terapeuta.nombre}</h3>
                    <p className="text-white/80 text-sm">{terapeuta.especialidad}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-4 text-sm">
                    <span className="text-[var(--color-primary)] font-medium mr-2">Experiencia:</span>
                    <span className="text-gray-700">{terapeuta.experiencia}</span>
                  </div>
                  
                  <p className="text-gray-600">
                    {terapeuta.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Sección de Promoción */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/placeholder/spa-promo.svg"
            alt="Promoción especial de masajes"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-xl">
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-[var(--font-display)] text-white mb-6"
            >
              Oferta Especial <span className="text-[var(--color-primary)]">para Huéspedes</span>
            </motion.h2>
            
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "120px" }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="h-[2px] bg-[var(--color-primary)] mb-8"
            ></motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-white/90 text-lg mb-10"
            >
              Reserva tu estancia en nuestra hacienda y disfruta de un 20% de descuento 
              en cualquiera de nuestros tratamientos de bienestar. Una experiencia 
              completa para el cuerpo y el alma.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link
                href="/habitaciones"
                className="inline-block px-8 py-4 bg-[var(--color-primary)] text-white text-lg hover:bg-[var(--color-primary-dark)] transition-colors shadow-xl"
              >
                Reservar Habitación
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
              Preguntas Frecuentes
            </h2>
            <div className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border border-gray-200 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-[var(--color-accent)] mb-3">¿Es necesario reservar con anticipación?</h3>
              <p className="text-gray-600">
                Sí, recomendamos hacer una reserva con al menos 24-48 horas de anticipación para garantizar la disponibilidad de nuestros terapeutas y servicios.
              </p>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-[var(--color-accent)] mb-3">¿Qué debo usar durante el masaje?</h3>
              <p className="text-gray-600">
                Proporcionamos batas y ropa interior desechable para todos nuestros tratamientos. Nuestros terapeutas están capacitados para preservar tu privacidad en todo momento.
              </p>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-[var(--color-accent)] mb-3">¿Ofrecen masajes para parejas?</h3>
              <p className="text-gray-600">
                Sí, contamos con una sala especial para masajes en pareja. Esta experiencia incluye dos terapeutas que trabajan simultáneamente en un ambiente romántico.
              </p>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-[var(--color-accent)] mb-3">¿Hay alguna contraindicación para recibir masajes?</h3>
              <p className="text-gray-600">
                Algunos tratamientos pueden no ser recomendables en casos de embarazo, presión arterial alta, o ciertas condiciones médicas. Por favor, infórmanos sobre cualquier condición de salud al momento de reservar.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA final */}
      <section className="py-16 bg-[var(--color-primary-5)]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
            Reserva Tu Experiencia de Bienestar
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-10">
            Permítete un momento de indulgencia y transformación. Nuestros terapeutas están listos para guiarte en un viaje de renovación completa.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-[var(--color-primary)] text-white text-lg hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg"
          >
            Contactar Ahora
          </Link>
        </div>
      </section>
    </main>
  );
} 