"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaBed, FaBath, FaUsers, FaWifi, FaMountain, FaCocktail, FaCoffee, FaConciergeBell, FaAngleRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const rooms = [
  {
    name: 'Suite Principal',
    description: 'Una suite espaciosa con vista panorámica a los jardines, perfecta para la luna de miel. Decorada con mobiliario de época y detalles exclusivos para crear una atmósfera romántica e inolvidable.',
    features: ['Cama King Size', 'Baño Privado de Mármol', 'Vista a Jardines', 'WiFi de Alta Velocidad'],
    amenities: ['Servicio a la habitación 24h', 'Minibar Premium', 'Área de estar con Chimenea'],
    price: '$3,500',
    sqm: '48',
    capacity: '2',
    image: '/images/placeholder/room1.svg',
    gallery: [
      '/images/placeholder/room1.svg',
      '/images/placeholder/room2.svg',
      '/images/placeholder/room3.svg',
    ]
  },
  {
    name: 'Habitación Colonial',
    description: 'Ambiente tradicional con detalles arquitectónicos coloniales y mobiliario de época. Los techos altos y ventanales con vistas a los patios interiores evocan la auténtica elegancia de la hacienda.',
    features: ['Cama Queen Size', 'Baño Privado', 'Balcón Privado', 'WiFi'],
    amenities: ['Escritorio de trabajo antiguo', 'Caja fuerte electrónica', 'Minibar selecto'],
    price: '$2,800',
    sqm: '42',
    capacity: '2',
    image: '/images/placeholder/room2.svg',
    gallery: [
      '/images/placeholder/room2.svg',
      '/images/placeholder/room1.svg',
      '/images/placeholder/room3.svg',
    ]
  },
  {
    name: 'Suite Familiar',
    description: 'Amplia suite con espacio adicional para familias o grupos pequeños. Distribuida en dos ambientes con todas las comodidades necesarias para que su estancia sea perfecta, combinando funcionalidad y elegancia.',
    features: ['Cama King Size', 'Sofá Cama Doble', 'Baño Privado con Bañera', 'WiFi'],
    amenities: ['Área de estar independiente', 'Minibar completo', 'Vista panorámica a jardines'],
    price: '$4,200',
    sqm: '58',
    capacity: '4',
    image: '/images/placeholder/room3.svg',
    gallery: [
      '/images/placeholder/room3.svg',
      '/images/placeholder/room1.svg',
      '/images/placeholder/room2.svg',
    ]
  }
];

export default function LodgingSection() {
  const [activeRoom, setActiveRoom] = useState(0);
  const [isHovering, setIsHovering] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [activeTab, setActiveTab] = useState('features');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef(null);
  
  const getIconForFeature = (feature) => {
    if (feature.toLowerCase().includes('cama')) return FaBed;
    if (feature.toLowerCase().includes('baño')) return FaBath;
    if (feature.toLowerCase().includes('wifi')) return FaWifi;
    if (feature.toLowerCase().includes('vista')) return FaMountain;
    if (feature.toLowerCase().includes('minibar')) return FaCocktail;
    if (feature.toLowerCase().includes('servicio')) return FaConciergeBell;
    if (feature.toLowerCase().includes('escritorio')) return FaCoffee;
    return FaUsers;
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX || e.touches[0].clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches[0].clientX;
    const diff = dragStartX - clientX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === rooms[activeRoom].gallery.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? rooms[activeRoom].gallery.length - 1 : prev - 1
    );
  };

  // Efecto parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cambiar automáticamente la diapositiva cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentSlide, activeRoom]);

  // Reiniciar el índice de diapositiva al cambiar de habitación
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeRoom]);

  return (
    <section 
      id="lodging" 
      ref={sectionRef}
      className="section-padding bg-white relative overflow-hidden"
    >
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-64 h-64 border-l-4 border-t-4 border-[var(--color-primary)]/10 transform -translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 border-r-4 border-b-4 border-[var(--color-primary)]/10 transform translate-x-12 translate-y-12"></div>
      
      <div className="absolute inset-0 bg-pattern-subtle opacity-5"></div>
      
      <div 
        className="container-custom relative"
        style={{
          transform: `translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)`,
          transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-accent)] mb-12 font-light">
            Alojamiento <span className="text-[var(--color-primary)] font-semibold">Exclusivo</span>
          </h2>
          
          <div className="relative gold-divider mx-auto mb-10">
            <div className="absolute -top-1 -left-2 w-4 h-4 border-l-2 border-t-2 border-[var(--color-primary)]"></div>
            <div className="absolute -bottom-1 -right-2 w-4 h-4 border-r-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
          
          <p className="text-xl md:text-2xl font-light mt-10 max-w-4xl mx-auto leading-relaxed text-gray-700">
            Descubra nuestras elegantes habitaciones, donde la comodidad se encuentra con el encanto colonial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          {/* Habitación destacada - Imágenes */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 relative h-[550px] border-decorative group"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <AnimatePresence mode="wait">
              {rooms[activeRoom].gallery.map((image, idx) => (
                idx === currentSlide && (
                  <motion.div 
                    key={`${activeRoom}-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={image}
                      alt={`${rooms[activeRoom].name} - Imagen ${idx + 1}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover shadow-2xl"
                      priority={idx === 0}
                    />
                  </motion.div>
                )
              ))}
            </AnimatePresence>
            
            {/* Controles del carrusel */}
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[var(--color-primary)]/70 transition-all duration-300 shadow-lg"
              >
                <FaChevronLeft className="h-5 w-5" />
              </motion.button>
            </div>
            
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[var(--color-primary)]/70 transition-all duration-300 shadow-lg"
              >
                <FaChevronRight className="h-5 w-5" />
              </motion.button>
            </div>
            
            {/* Indicadores de diapositivas */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
              {rooms[activeRoom].gallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide 
                      ? 'bg-[var(--color-primary)] w-8' 
                      : 'bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Ver imagen ${idx + 1}`}
                />
              ))}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-24 z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-between items-end text-white"
              >
                <div>
                  <h3 className="text-2xl font-[var(--font-display)] font-light mb-2 shadow-text-strong">{rooms[activeRoom].name}</h3>
                  <p className="text-sm opacity-90 shadow-text">Capacidad: {rooms[activeRoom].capacity} personas</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold shadow-text-strong">{rooms[activeRoom].price}</div>
                  <p className="text-xs opacity-90 shadow-text">por noche</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Habitación destacada - Detalles */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 px-0 md:px-6"
          >
            <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-accent)] mb-4">
              {rooms[activeRoom].name}
            </h3>
            <div className="w-32 h-[1px] bg-gradient-to-r from-[var(--color-primary)] to-transparent mb-8"></div>
            
            <p className="text-lg leading-relaxed text-gray-600 mb-10">
              {rooms[activeRoom].description}
            </p>
            
            <div className="mb-8 grid grid-cols-2 gap-y-4">
              <div className="flex items-center space-x-3">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-full bg-[var(--color-primary-5)] flex items-center justify-center shadow-md"
                >
                  <FaBed className="text-black text-lg" />
                </motion.div>
                <span className="text-gray-700">{rooms[activeRoom].sqm} m²</span>
              </div>
              <div className="flex items-center space-x-3">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-full bg-[var(--color-primary-5)] flex items-center justify-center shadow-md"
                >
                  <FaUsers className="text-black text-lg" />
                </motion.div>
                <span className="text-gray-700">Máx. {rooms[activeRoom].capacity} personas</span>
              </div>
            </div>
            
            {/* Tabs para características y amenidades */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('features')}
                  className={`pb-3 transition-all duration-300 relative ${
                    activeTab === 'features' 
                      ? 'text-black font-medium' 
                      : 'text-black hover:text-black'
                  }`}
                >
                  Características
                  {activeTab === 'features' && (
                    <motion.div 
                      layoutId="activeFeaturesIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('amenities')}
                  className={`pb-3 transition-all duration-300 relative ${
                    activeTab === 'amenities' 
                      ? 'text-black font-medium' 
                      : 'text-black hover:text-black'
                  }`}
                >
                  Servicios
                  {activeTab === 'amenities' && (
                    <motion.div 
                      layoutId="activeFeaturesIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </button>
              </div>
            </div>
            
            <div className="mb-10">
              <AnimatePresence mode="wait">
                {activeTab === 'features' && (
                  <motion.div 
                    key="features"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 gap-4"
                  >
                    {rooms[activeRoom].features.map((feature, featureIndex) => {
                      const Icon = getIconForFeature(feature);
                      return (
                        <motion.div 
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1 }}
                          className="flex items-center space-x-3 text-gray-700 p-3 border-l-2 border-[var(--color-primary-20)] bg-[var(--color-primary-5)] rounded-r-md"
                        >
                          <Icon className="text-black text-lg" />
                          <span className="font-medium">{feature}</span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
                
                {activeTab === 'amenities' && (
                  <motion.div 
                    key="amenities"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 gap-4"
                  >
                    {rooms[activeRoom].amenities.map((amenity, amenityIndex) => {
                      const Icon = getIconForFeature(amenity);
                      return (
                        <motion.div 
                          key={amenityIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: amenityIndex * 0.1 }}
                          className="flex items-center space-x-3 text-gray-700 p-3 border-l-2 border-[var(--color-primary-20)] bg-[var(--color-primary-5)] rounded-r-md"
                        >
                          <Icon className="text-black text-lg" />
                          <span className="font-medium">{amenity}</span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center space-x-2 px-10 py-4 bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-dark)] transition-all duration-300 shadow-lg"
            >
              <span className="text-black">Reservar esta habitación</span>
              <FaAngleRight className="group-hover:translate-x-1 transition-transform duration-300 text-black" />
            </motion.button>
          </motion.div>
        </div>
        
        {/* Listado de habitaciones */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {rooms.map((room, index) => (
            <motion.div 
              key={index} 
              whileHover={{ y: -10 }}
              className={`relative overflow-hidden cursor-pointer transition-all duration-500 bg-white
                ${activeRoom === index 
                  ? 'shadow-2xl border-2 border-[var(--color-primary)] scale-[1.02] z-10' 
                  : 'shadow-lg border border-gray-100 hover:shadow-xl'}
              `}
              onClick={() => setActiveRoom(index)}
              onMouseEnter={() => setIsHovering(index)}
              onMouseLeave={() => setIsHovering(null)}
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={`object-cover transition-all duration-700 transform ${
                    isHovering === index ? 'scale-110' : 'scale-100'
                  }`}
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
                  isHovering === index || activeRoom === index ? 'opacity-70' : 'opacity-40'
                }`}></div>
                {activeRoom === index && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center z-10 shadow-lg">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
              <div className="p-8 bg-white border-t border-gray-100">
                <h3 className={`text-2xl font-[var(--font-display)] mb-4 transition-colors duration-300 ${
                  activeRoom === index ? 'text-black' : 'text-black'
                }`}>
                  {room.name}
                </h3>
                <div className={`w-20 h-[1px] ${
                  activeRoom === index ? 'bg-black' : 'bg-gray-200'
                } mb-4 transition-colors duration-300`}></div>
                <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                  {room.description}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-black font-semibold text-lg">
                    {room.price} <span className="text-sm font-normal text-gray-500">/ noche</span>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center space-x-2">
                    <FaUsers className="text-gray-400" />
                    <span>Max. {room.capacity}</span>
                  </div>
                </div>
                {activeRoom === index && (
                  <motion.div 
                    layoutId="selectedRoomIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-black"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 