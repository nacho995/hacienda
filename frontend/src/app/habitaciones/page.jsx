"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaCalendarAlt, FaCheck, FaBed, FaUserFriends, FaWifi, FaCoffee, FaTv, FaSnowflake } from 'react-icons/fa';

// Datos simulados de habitaciones
const HABITACIONES = [
  {
    id: 1,
    nombre: "Suite Hacienda Principal",
    descripcion: "Elegante suite con vistas panorámicas a los jardines, decorada con muebles de época y detalles auténticos de hacienda mexicana.",
    precio: 3500,
    capacidad: 2,
    tamaño: "45m²",
    camas: "1 King Size",
    imagen: "/images/placeholder/room1.jpg.svg",
    amenidades: ["WiFi gratis", "Desayuno incluido", "TV de pantalla plana", "Aire acondicionado", "Baño privado de lujo", "Artículos de tocador premium"]
  },
  {
    id: 2,
    nombre: "Suite Tradición Colonial",
    descripcion: "Espaciosa habitación con elementos coloniales, techos altos y una combinación perfecta entre la comodidad moderna y el encanto histórico.",
    precio: 2800,
    capacidad: 2,
    tamaño: "38m²",
    camas: "1 Queen Size",
    imagen: "/images/placeholder/room2.jpg.svg",
    amenidades: ["WiFi gratis", "Desayuno incluido", "TV de pantalla plana", "Aire acondicionado", "Baño privado", "Terraza privada"]
  },
  {
    id: 3,
    nombre: "Habitación Deluxe Jardín",
    descripcion: "Acogedora habitación con acceso directo a los jardines, ideal para disfrutar de la tranquilidad y belleza natural de la hacienda.",
    precio: 2400,
    capacidad: 2,
    tamaño: "32m²",
    camas: "2 Individuales o 1 King Size",
    imagen: "/images/placeholder/room3.jpg.svg",
    amenidades: ["WiFi gratis", "Desayuno incluido", "TV de pantalla plana", "Aire acondicionado", "Baño privado", "Vista al jardín"]
  },
  {
    id: 4,
    nombre: "Suite Familiar Hacienda",
    descripcion: "Amplia suite diseñada para familias, con espacios separados y todas las comodidades para una estancia inolvidable en un entorno histórico.",
    precio: 4200,
    capacidad: 4,
    tamaño: "60m²",
    camas: "1 King Size + 2 Individuales",
    imagen: "/images/placeholder/room4.jpg.svg",
    amenidades: ["WiFi gratis", "Desayuno incluido", "TV de pantalla plana", "Aire acondicionado", "2 Baños privados", "Sala de estar", "Minibar"]
  }
];

export default function HabitacionesPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fechaEntrada: '',
    fechaSalida: '',
    huespedes: 1,
    habitacion: '',
    mensaje: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [showReservationSuccess, setShowReservationSuccess] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const decorativeElementRef = useRef(null);

  useEffect(() => {
    // Validar formulario
    const { nombre, email, telefono, fechaEntrada, fechaSalida, habitacion } = formData;
    setIsFormValid(
      nombre !== '' && 
      email !== '' && 
      telefono !== '' && 
      fechaEntrada !== '' && 
      fechaSalida !== '' && 
      habitacion !== ''
    );
  }, [formData]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Aplicar efecto parallax al elemento decorativo
      if (decorativeElementRef.current) {
        const movement = window.scrollY * 0.15; // Controla la velocidad del movimiento
        const rotation = window.scrollY * 0.02; // Rotación suave al hacer scroll
        const scale = 1 + (window.scrollY * 0.0005); // Ligero cambio de escala
        
        decorativeElementRef.current.style.transform = `
          translate(-50%, -50%) 
          translateY(${movement}px) 
          rotate(${rotation}deg)
          scale(${Math.min(scale, 1.15)})
        `;
        
        // Cambio de opacidad al hacer scroll
        const opacity = Math.max(1 - (window.scrollY * 0.002), 0);
        decorativeElementRef.current.style.opacity = opacity;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Si se selecciona una habitación desde el select, actualizar el selectedRoom
    if (name === 'habitacion' && value !== '') {
      const roomId = parseInt(value);
      const room = HABITACIONES.find(h => h.id === roomId);
      setSelectedRoom(room);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setFormData({
      ...formData,
      habitacion: room.id.toString()
    });
    
    // Scroll al formulario
    document.getElementById('reserva-form').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Aquí iría la lógica para enviar la reserva a un API
    console.log("Datos de reserva:", formData);
    
    // Mostrar mensaje de éxito
    setShowReservationSuccess(true);
    
    // Reset del formulario después de unos segundos
    setTimeout(() => {
      setShowReservationSuccess(false);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        fechaEntrada: '',
        fechaSalida: '',
        huespedes: 1,
        habitacion: '',
        mensaje: ''
      });
      setSelectedRoom(null);
    }, 5000);
  };

  return (
    <main>
      {/* Sección Hero */}
      <section className="relative h-[80vh] overflow-hidden pt-24 sm:pt-28 md:pt-32">
        <div 
          className="absolute inset-0 bg-[url('/habitacion.JPG')] bg-cover bg-center w-screen"
          style={{
            transform: `translateY(${scrollY * 0.15}px)`,
            transition: 'transform 0.3s ease-out',
            height: '120%',
            top: '-10%'
          }}
        ></div>
        {/* Overlay con degradado para mejorar visibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/60 z-10 w-screen"></div>
        
        {/* Contenido del hero */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white pt-16 sm:pt-20">
          <div className="text-center px-2 sm:px-4 max-w-5xl mx-auto perspective-[1000px]">
            {/* Decorador superior elegante */}
            <div className="flex flex-col items-center mb-4 md:mb-6 lg:mb-8 animate-delay-100 pt-0 md:pt-0 lg:pt-0">
              <div className="w-24 md:w-32 lg:w-40 h-[1px] bg-[var(--color-primary)] mx-auto mb-3"></div>
              <div className="relative inline-block mb-2 transform-style-preserve-3d">
                <span className="block text-sm md:text-base uppercase tracking-[0.3em] md:tracking-[0.4em] z-10" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(10px)", display: "inline-block"}}>
                  Confort & Elegancia
                </span>
                <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -6px -6px round 6px)' }}></div>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-[var(--font-display)] leading-tight tracking-tight mb-4 transform-style-preserve-3d">
              <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Habitaciones </span>
              <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>de Ensueño</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-8 perspective-[1000px] transform-style-preserve-3d">
              <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Experimente el lujo y la comodidad en un entorno de </span>
              <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>tradición histórica</span>
            </p>
            
            <div className="mt-8">
              <a href="#habitaciones" className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors rounded shadow-lg inline-block transform hover:scale-105 transition-transform duration-300">
                Ver Habitaciones
              </a>
            </div>
          </div>
        </div>
        
        {/* Elemento decorativo desplazado hacia la izquierda con efecto de parallax */}
        <div 
          ref={decorativeElementRef}
          className="absolute top-[60%] left-[20%] transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden sm:block"
          style={{ 
            width: '380px', 
            height: '380px',
            transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
          }}
        >
          <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Círculo base decorativo */}
            <circle cx="250" cy="250" r="240" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
            <circle cx="250" cy="250" r="220" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
            
            {/* Forma decorativa de viñeta de vino */}
            <path d="M250,30 
                     C350,30 430,130 430,250 
                     C430,370 350,470 250,470 
                     C150,470 70,370 70,250 
                     C70,130 150,30 250,30 Z" 
                  fill="none" stroke="#800020" strokeWidth="2" opacity="0.7" />
            
            {/* Elementos decorativos - copas */}
            <g opacity="0.8">
              <path d="M170,100 C190,120 190,150 180,170 L160,200 L200,200 L180,170 C170,150 170,120 190,100 Z" 
                    fill="none" stroke="#800020" strokeWidth="2" />
              <path d="M330,100 C350,120 350,150 340,170 L320,200 L360,200 L340,170 C330,150 330,120 350,100 Z" 
                    fill="none" stroke="#800020" strokeWidth="2" />
              <line x1="180" y1="200" x2="180" y2="220" stroke="#800020" strokeWidth="2" />
              <line x1="340" y1="200" x2="340" y2="220" stroke="#800020" strokeWidth="2" />
            </g>
            
            {/* Elementos decorativos - flores y adornos */}
            <g opacity="0.8">
              <circle cx="250" cy="120" r="20" fill="none" stroke="#800020" strokeWidth="2" />
              <circle cx="250" cy="120" r="10" fill="none" stroke="#800020" strokeWidth="1" />
              <circle cx="140" cy="250" r="15" fill="none" stroke="#800020" strokeWidth="2" />
              <circle cx="360" cy="250" r="15" fill="none" stroke="#800020" strokeWidth="2" />
              <circle cx="250" cy="380" r="20" fill="none" stroke="#800020" strokeWidth="2" />
            </g>
            
            {/* Elementos de enlace */}
            <path d="M250,140 C250,140 200,200 140,265 M250,140 C250,140 300,200 360,265" 
                  stroke="#800020" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity="0.7" />
            <path d="M250,140 L250,380" stroke="#800020" strokeWidth="1" fill="none" 
                  strokeDasharray="5,5" opacity="0.7" />
            
            {/* Texto elegante - "EVENTOS" - Centrado en el elemento */}
            <g transform="translate(250, 250)" className="events-text">
              <text textAnchor="middle" fontFamily="serif" fontSize="26" fill="#FFFAF0" fontWeight="light" opacity="0.9" letterSpacing="5">
                EVENTOS
              </text>
              <text textAnchor="middle" fontFamily="serif" fontSize="18" fill="#FFFAF0" fontWeight="light" opacity="0.8" letterSpacing="2" y="30">
                MEMORABLES
              </text>
            </g>
            
            {/* Pequeños adornos decorativos */}
            <circle cx="190" cy="320" r="5" fill="none" stroke="#800020" strokeWidth="1" />
            <circle cx="310" cy="320" r="5" fill="none" stroke="#800020" strokeWidth="1" />
            <path d="M120,200 C140,220 140,230 120,250" fill="none" stroke="#800020" strokeWidth="1" opacity="0.8" />
            <path d="M380,200 C360,220 360,230 380,250" fill="none" stroke="#800020" strokeWidth="1" opacity="0.8" />
            
            {/* Anillos de boda estilizados */}
            <circle cx="220" cy="300" r="15" fill="none" stroke="#FFFAF0" strokeWidth="2" opacity="0.7" />
            <circle cx="280" cy="300" r="15" fill="none" stroke="#FFFAF0" strokeWidth="2" opacity="0.7" />
          </svg>
        </div>
      </section>

      {/* Introducción */}
      <section className="py-16 bg-[var(--color-cream-light)]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-[var(--font-display)] text-3xl md:text-4xl text-[var(--color-accent)] mb-6">
              Un Descanso con Historia
            </h2>
            <div className="w-16 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
            <p className="text-gray-700 mb-8">
              Nuestras habitaciones han sido cuidadosamente restauradas para preservar la esencia histórica de la hacienda, 
              mientras ofrecen todas las comodidades modernas que garantizan una estancia placentera. Cada habitación cuenta 
              con un carácter único, manteniendo elementos originales que relatan la historia centenaria de este lugar mágico.
            </p>
          </div>
        </div>
      </section>

      {/* Listado de Habitaciones */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="font-[var(--font-display)] text-3xl text-center mb-12">
            Encuentra tu Habitación Ideal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {HABITACIONES.map((habitacion) => (
              <div 
                key={habitacion.id} 
                className="border-decorative group hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-80 overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 z-10 transition-opacity group-hover:opacity-0"></div>
                  <Image 
                    src={habitacion.imagen}
                    alt={habitacion.nombre}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-[var(--font-display)] text-2xl text-[var(--color-accent)]">
                      {habitacion.nombre}
                    </h3>
                    <div className="text-[var(--color-primary)] font-semibold">
                      ${habitacion.precio} <span className="text-sm font-normal text-gray-500">/ noche</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {habitacion.descripcion}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 text-sm text-gray-700">
                    <div className="flex items-center">
                      <FaBed className="mr-2 text-[var(--color-primary)]" />
                      {habitacion.camas}
                    </div>
                    <div className="flex items-center">
                      <FaUserFriends className="mr-2 text-[var(--color-primary)]" />
                      {habitacion.capacidad} personas
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-[var(--color-primary)]">&#x33A1;</span>
                      {habitacion.tamaño}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-8">
                    <h4 className="font-semibold mb-3 text-[var(--color-accent)]">Amenidades:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {habitacion.amenidades.slice(0, 6).map((amenidad, index) => (
                        <div key={index} className="flex items-center">
                          <FaCheck className="mr-2 text-xs text-[var(--color-primary)]" />
                          {amenidad}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleSelectRoom(habitacion)}
                    className="w-full py-3 bg-[var(--color-accent)] text-white font-medium tracking-wide hover:bg-[var(--color-primary)] transition-colors duration-300"
                  >
                    Reservar Ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de Reserva */}
      <section id="reserva-form" className="py-16 bg-[var(--color-cream-light)]">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-[var(--font-display)] text-3xl text-center mb-4">
              Haga su Reservación
            </h2>
            <div className="w-16 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
            
            <div className="bg-white shadow-lg p-8 md:p-10 border border-gray-100">
              {showReservationSuccess ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaCheck className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-accent)] mb-4">
                    ¡Reserva Recibida!
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Gracias por su reserva. Hemos recibido su solicitud y nos pondremos en contacto con usted a la brevedad para confirmar los detalles.
                  </p>
                  <button 
                    onClick={() => setShowReservationSuccess(false)}
                    className="btn-primary"
                  >
                    Realizar otra reserva
                  </button>
                </div>
              ) : (
                <>
                  {selectedRoom && (
                    <div className="mb-8 p-4 bg-[var(--color-primary-5)] border border-[var(--color-primary-20)] rounded-sm">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative w-full md:w-1/3 h-40 overflow-hidden">
                          <Image 
                            src={selectedRoom.imagen}
                            alt={selectedRoom.nombre}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                        <div className="md:w-2/3">
                          <h3 className="font-[var(--font-display)] text-xl mb-2">
                            {selectedRoom.nombre}
                          </h3>
                          <div className="text-[var(--color-primary)] font-semibold mb-2">
                            ${selectedRoom.precio} <span className="text-sm font-normal text-gray-500">/ noche</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {selectedRoom.tamaño} | {selectedRoom.camas} | Máx. {selectedRoom.capacidad} personas
                          </div>
                          <div className="flex flex-wrap gap-x-4 text-xs text-gray-700">
                            <div className="flex items-center">
                              <FaWifi className="mr-1 text-[var(--color-primary)]" />
                              WiFi
                            </div>
                            <div className="flex items-center">
                              <FaCoffee className="mr-1 text-[var(--color-primary)]" />
                              Desayuno
                            </div>
                            <div className="flex items-center">
                              <FaTv className="mr-1 text-[var(--color-primary)]" />
                              TV
                            </div>
                            <div className="flex items-center">
                              <FaSnowflake className="mr-1 text-[var(--color-primary)]" />
                              A/C
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Datos personales */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 pb-2 border-b border-gray-200">
                        Información Personal
                      </h3>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                        Nombre completo
                      </label>
                      <input 
                        type="text" 
                        id="nombre" 
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors" 
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Correo electrónico
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors" 
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                        Teléfono de contacto
                      </label>
                      <input 
                        type="tel" 
                        id="telefono" 
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors" 
                        required
                      />
                    </div>
                    
                    <div></div>
                    
                    {/* Datos de reserva */}
                    <div className="md:col-span-2 mt-4">
                      <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 pb-2 border-b border-gray-200">
                        Detalles de Reserva
                      </h3>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="fechaEntrada" className="block text-sm font-medium text-gray-700">
                        Fecha de entrada
                      </label>
                      <div className="relative">
                        <input 
                          type="date" 
                          id="fechaEntrada" 
                          name="fechaEntrada"
                          value={formData.fechaEntrada}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                          required
                        />
                        <FaCalendarAlt className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="fechaSalida" className="block text-sm font-medium text-gray-700">
                        Fecha de salida
                      </label>
                      <div className="relative">
                        <input 
                          type="date" 
                          id="fechaSalida" 
                          name="fechaSalida"
                          value={formData.fechaSalida}
                          onChange={handleInputChange}
                          min={formData.fechaEntrada || new Date().toISOString().split('T')[0]}
                          className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                          required
                        />
                        <FaCalendarAlt className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="huespedes" className="block text-sm font-medium text-gray-700">
                        Número de huéspedes
                      </label>
                      <select 
                        id="huespedes" 
                        name="huespedes"
                        value={formData.huespedes}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors" 
                      >
                        {[...Array(4)].map((_, i) => (
                          <option key={i} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="habitacion" className="block text-sm font-medium text-gray-700">
                        Seleccionar habitación
                      </label>
                      <select 
                        id="habitacion" 
                        name="habitacion"
                        value={formData.habitacion}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors" 
                        required
                      >
                        <option value="">Seleccione una habitación</option>
                        {HABITACIONES.map((habitacion) => (
                          <option key={habitacion.id} value={habitacion.id}>
                            {habitacion.nombre} - ${habitacion.precio}/noche
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2 space-y-1">
                      <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700">
                        Solicitudes especiales (opcional)
                      </label>
                      <textarea 
                        id="mensaje" 
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleInputChange}
                        rows="4" 
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      ></textarea>
                    </div>
                    
                    <div className="md:col-span-2 mt-4">
                      <button 
                        type="submit" 
                        disabled={!isFormValid}
                        className={`w-full py-3 font-medium tracking-wide text-white transition-colors ${
                          isFormValid 
                            ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]' 
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Enviar Solicitud de Reserva
                      </button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Al enviar este formulario, acepta nuestros términos y condiciones de reserva.
                      </p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Banner de Políticas */}
      <section className="py-12 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 w-full h-[120%] -top-[10%]"
          style={{ 
            backgroundImage: "url('/textura.png')",
            backgroundSize: "cover",
            backgroundPosition: `center ${50 + scrollY * 0.03}%`,
            transition: "background-position 0.1s ease-out"
          }}
        >
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center backdrop-blur-md bg-black/10 p-6 rounded-lg border border-white/10 shadow-xl transition-transform hover:scale-105 duration-300">
              <h3 className="font-[var(--font-display)] text-xl mb-4 font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">
                Política de Check-in
              </h3>
              <p className="text-white font-bold text-shadow">
                Check-in: 15:00 - 20:00<br />
                Check-out: 12:00<br />
                Se requiere identificación oficial
              </p>
            </div>
            
            <div className="text-center backdrop-blur-md bg-black/10 p-6 rounded-lg border border-white/10 shadow-xl transition-transform hover:scale-105 duration-300">
              <h3 className="font-[var(--font-display)] text-xl mb-4 font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">
                Política de Cancelación
              </h3>
              <p className="text-white font-bold text-shadow">
                Cancelación gratuita hasta 7 días antes<br />
                50% de penalización de 2 a 6 días antes<br />
                Sin reembolso dentro de las 48 hrs
              </p>
            </div>
            
            <div className="text-center backdrop-blur-md bg-black/10 p-6 rounded-lg border border-white/10 shadow-xl transition-transform hover:scale-105 duration-300">
              <h3 className="font-[var(--font-display)] text-xl mb-4 font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">
                Instalaciones y Servicios
              </h3>
              <p className="text-white font-bold text-shadow">
                Estacionamiento gratuito<br />
                Desayuno incluido (7:00 - 10:30)<br />
                Servicio a la habitación (cargo adicional)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Preguntas Frecuentes */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="font-[var(--font-display)] text-3xl text-center mb-12">
            Preguntas Frecuentes
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  pregunta: "¿Puedo solicitar una cama adicional?",
                  respuesta: "Sí, se puede solicitar una cama adicional con un cargo extra de $500 MXN por noche, sujeto a disponibilidad y capacidad de la habitación."
                },
                {
                  pregunta: "¿Aceptan mascotas?",
                  respuesta: "Lamentablemente no aceptamos mascotas en nuestras habitaciones para garantizar el confort de todos nuestros huéspedes."
                },
                {
                  pregunta: "¿Ofrecen transporte desde/hacia el aeropuerto?",
                  respuesta: "Sí, ofrecemos servicio de transporte con costo adicional. Por favor indíquenos sus necesidades al realizar su reserva."
                },
                {
                  pregunta: "¿Las habitaciones tienen caja fuerte?",
                  respuesta: "Sí, todas nuestras habitaciones cuentan con caja fuerte para su tranquilidad y seguridad durante su estancia."
                }
              ].map((faq, index) => (
                <div key={index} className="border-b pb-6 border-gray-200">
                  <h3 className="text-lg font-medium text-[var(--color-accent)] mb-2">
                    {faq.pregunta}
                  </h3>
                  <p className="text-gray-600">
                    {faq.respuesta}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">
                ¿Tienes más preguntas? No dudes en contactarnos
              </p>
              <a 
                href="mailto:reservaciones@haciendasancarlos.com"
                className="text-[var(--color-primary)] hover:underline font-medium"
              >
                reservaciones@haciendasancarlos.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 