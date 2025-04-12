"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaBed, FaBath, FaUsers, FaWifi, FaMountain, FaCocktail, FaCoffee, FaConciergeBell, FaAngleRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/services/apiClient';
import Link from 'next/link';

// Componente de Carga
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
  </div>
);

// Componente de Error
const ErrorMessage = ({ message }) => (
  <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
    <p>Error al cargar las habitaciones:</p>
    <p>{message}</p>
  </div>
);

// Función para formatear la capacidad
const formatCapacity = (capacity) => {
  if (typeof capacity === 'object' && capacity !== null) {
    let text = `Máx. ${capacity.adultos} adulto${capacity.adultos !== 1 ? 's' : ''}`;
    if (capacity.ninos > 0) {
      text += `, ${capacity.ninos} niño${capacity.ninos !== 1 ? 's' : ''}`;
    }
    return text;
  } else if (capacity) {
    return `Máx. ${capacity} personas`;
  } else {
    return 'Capacidad N/A';
  }
};

export default function LodgingSection() {
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRoom, setActiveRoom] = useState(0);
  const [isHovering, setIsHovering] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [activeTab, setActiveTab] = useState('features');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const fetchRoomTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get('/tipos-habitacion');
        
        // Mapeo flexible de datos
        const formattedData = data.data.map((room, index) => {
          const imageIndex = (index % 6) + 1;
          const localImage = `/Habitacion${imageIndex}.jpeg`;

          // Determinar capacidad
          let capacityData = { adultos: 0, ninos: 0 };
          if (typeof room.capacidad === 'object' && room.capacidad !== null) {
            capacityData = { 
              adultos: room.capacidad.adultos || 0,
              ninos: room.capacidad.ninos || 0
            };
          } else if (typeof room.capacidadAdultos === 'number') {
            capacityData = {
              adultos: room.capacidadAdultos,
              ninos: typeof room.capacidadNinos === 'number' ? room.capacidadNinos : 0
            };
          }
          
          return {
            id: room._id,
            name: room.nombre || 'Nombre no disponible',
            description: room.descripcion || 'Descripción no disponible',
            // Guardar características si existen
            features: Array.isArray(room.caracteristicas) ? room.caracteristicas : [], 
            // Guardar amenidades si existen
            amenities: Array.isArray(room.amenidades) ? room.amenidades : [], 
            price: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(room.precio || 0), 
            capacity: capacityData, // Pasar el objeto estandarizado
            image: localImage,
            gallery: [localImage] 
          };
        });
       
        setRoomsData(formattedData);
      } catch (e) {
        console.error("Error fetching room types:", e);
        setError(e.message || 'No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);
  
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
    if (!roomsData[activeRoom]?.gallery?.length) return;
    setCurrentSlide((prev) => 
      prev === roomsData[activeRoom].gallery.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    if (!roomsData[activeRoom]?.gallery?.length) return;
    setCurrentSlide((prev) => 
      prev === 0 ? roomsData[activeRoom].gallery.length - 1 : prev - 1
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
    if (loading || error || !roomsData[activeRoom]?.gallery?.length) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, activeRoom, loading, error, roomsData]);

  // Reiniciar el índice de diapositiva al cambiar de habitación
  useEffect(() => {
    setCurrentSlide(0);
    // Resetear tab al cambiar habitación, priorizando features si existen
    const room = roomsData[activeRoom];
    if (room && room.features && room.features.length > 0) {
        setActiveTab('features');
    } else if (room && room.amenities && room.amenities.length > 0) {
        setActiveTab('amenities');
    } else {
        setActiveTab('features'); // Default a features si nada existe
    }
  }, [activeRoom, roomsData]); // Depender también de roomsData

  // Si no hay datos después de cargar y sin errores, mostrar mensaje
  if (!loading && !error && roomsData.length === 0) {
    return (
      <section id="lodging" className="section-padding bg-white">
        <div className="container-custom text-center">
          <p>No hay tipos de habitación disponibles en este momento.</p>
        </div>
      </section>
    );
  }

  // Obtener la habitación activa de forma segura
  const currentRoom = roomsData[activeRoom];

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

        {/* Mostrar indicador de carga o error */}
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        
        {/* Solo renderizar el contenido si no hay carga ni error y hay datos */}
        {!loading && !error && roomsData.length > 0 && currentRoom && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-7 relative h-[550px] rounded-lg overflow-hidden shadow-xl border border-gray-100 group"
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                <AnimatePresence mode="wait">
                  {currentRoom.gallery && currentRoom.gallery.length > 0 ? (
                    currentRoom.gallery.map((image, idx) => (
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
                            alt={`${currentRoom.name} - Imagen ${idx + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="object-center"
                            priority={idx === 0}
                            onError={(e) => e.target.src = '/placeholder-general.jpg'}
                            sizes="(max-width: 1024px) 100vw, 60vw"
                          />
                        </motion.div>
                      )
                    ))
                   ) : (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                       <Image src='/placeholder-general.jpg' layout="fill" objectFit="cover" alt="Placeholder"/>
                    </div>
                   )}
                </AnimatePresence>
                
                {currentRoom.gallery && currentRoom.gallery.length > 1 && (
                  <>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                      <motion.button
                        whileHover={{ scale: 1.1, x: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center text-gray-800 hover:bg-white/80 transition-all duration-300 shadow-md"
                        aria-label="Imagen anterior"
                      >
                        <FaChevronLeft className="h-4 w-4" />
                      </motion.button>
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                      <motion.button
                        whileHover={{ scale: 1.1, x: 2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center text-gray-800 hover:bg-white/80 transition-all duration-300 shadow-md"
                         aria-label="Siguiente imagen"
                      >
                        <FaChevronRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                      {currentRoom.gallery.map((_, idx) => (
                        <button
                          key={`dot-${idx}`}
                          onClick={() => setCurrentSlide(idx)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            idx === currentSlide 
                              ? 'bg-white scale-125 ring-2 ring-white/50' 
                              : 'bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Ver imagen ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-20 z-0">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex justify-between items-end text-white"
                  >
                    <div>
                      <h3 className="text-2xl font-[var(--font-display)] font-light mb-1 shadow-text-strong">{currentRoom.name}</h3>
                      <p className="text-sm opacity-90 shadow-text">{formatCapacity(currentRoom.capacity)}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-2xl font-semibold shadow-text-strong">{currentRoom.price}</div>
                      <p className="text-xs opacity-90 shadow-text">por noche</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5 flex flex-col justify-start h-full pt-4 lg:pt-0"
              >
                <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-accent)] mb-4">{currentRoom.name}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">{currentRoom.description}</p>

                <div className="mb-6 text-center">
                  <div className="bg-gray-50 inline-block p-3 rounded-lg shadow-sm border border-gray-100">
                    <FaUsers className="text-[var(--color-primary)] mx-auto text-xl mb-1.5" />
                    <p className="text-xs font-medium text-gray-700">{formatCapacity(currentRoom.capacity)}</p>
                  </div>
                </div>
                
                <div className="w-full flex-grow flex flex-col">
                  {(currentRoom.features.length > 0 || currentRoom.amenities.length > 0) && (
                    <div className="border-b border-gray-200 mb-4">
                      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {/* Mostrar Tab Características solo si hay features */}
                        {currentRoom.features.length > 0 && (
                          <button
                            onClick={() => setActiveTab('features')}
                            className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                              activeTab === 'features'
                                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            aria-controls="features-panel"
                            id="features-tab"
                          >
                            Características
                          </button>
                        )}
                        {/* Mostrar Tab Servicios solo si hay amenities */}
                        {currentRoom.amenities.length > 0 && (
                          <button
                            onClick={() => setActiveTab('amenities')}
                            className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                              activeTab === 'amenities'
                                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            aria-controls="amenities-panel"
                            id="amenities-tab"
                          >
                            Servicios
                          </button>
                        )}
                      </nav>
                    </div>
                  )}
                  
                  {/* Contenido de las Tabs */} 
                  <div className="flex-grow min-h-[100px]">
                     <AnimatePresence mode="wait">
                       <motion.div
                         key={activeTab} // Re-renderiza al cambiar tab
                         initial={{ opacity: 0, y: 5 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -5 }}
                         transition={{ duration: 0.2 }}
                         role="tabpanel"
                         id={activeTab === 'features' ? "features-panel" : "amenities-panel"}
                         aria-labelledby={activeTab === 'features' ? "features-tab" : "amenities-tab"}
                       >
                         {/* Mostrar contenido Features si es tab activa Y hay features */} 
                         {activeTab === 'features' && currentRoom.features.length > 0 && (
                           <ul className="space-y-1.5 text-gray-600 text-sm list-inside pl-1">
                             {currentRoom.features.map((feature, i) => (
                               <li key={`feature-${i}`} className="flex items-start">
                                 <FaAngleRight className="text-[var(--color-primary)]/70 mr-1.5 mt-1 flex-shrink-0 text-[10px]" />
                                 <span>{feature}</span>
                               </li>
                             ))}
                           </ul>
                         )}
                         {/* Mostrar contenido Amenities si es tab activa Y hay amenities */} 
                         {activeTab === 'amenities' && currentRoom.amenities.length > 0 && (
                           <ul className="space-y-1.5 text-gray-600 text-sm list-inside pl-1">
                             {currentRoom.amenities.map((amenity, i) => (
                               <li key={`amenity-${i}`} className="flex items-start">
                                 <FaAngleRight className="text-[var(--color-primary)]/70 mr-1.5 mt-1 flex-shrink-0 text-[10px]" />
                                 <span>{amenity}</span>
                               </li>
                             ))}
                           </ul>
                         )}
                         {/* Mensaje si no hay NADA que mostrar en esta sección */}
                         {currentRoom.features.length === 0 && currentRoom.amenities.length === 0 && (
                            <p className="text-gray-400 italic text-xs mt-2">No hay características o servicios especificados.</p>
                         )}
                       </motion.div>
                     </AnimatePresence>
                   </div>
                 </div>

                {/* Botón de reserva (ahora como Link sin legacyBehavior) */}
                <Link href="/habitaciones">
                  <motion.a // `motion.a` es ahora el hijo directo
                    whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-auto bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 self-start flex items-center text-sm cursor-pointer" // Añadido cursor-pointer para claridad visual
                  >
                    Ver disponibilidad <FaAngleRight className="ml-1.5" />
                  </motion.a>
                </Link>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16"
            >
              {roomsData.map((room, index) => (
                <motion.div
                  key={room.id}
                  className={`relative overflow-hidden rounded-lg shadow-md cursor-pointer group border transition-all duration-300 ${activeRoom === index ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30' : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                  onClick={() => setActiveRoom(index)}
                  onMouseEnter={() => setIsHovering(index)}
                  onMouseLeave={() => setIsHovering(null)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={room.image}
                      alt={room.name}
                      layout="fill"
                      objectFit="cover"
                      className={`transform transition-transform duration-500 ease-in-out ${
                        isHovering === index ? 'scale-105' : 'scale-100'
                      }`}
                      onError={(e) => e.target.src = '/placeholder-general.jpg'}
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <h4 className="font-medium text-sm text-white shadow-text truncate">{room.name}</h4>
                    </div>
                    {activeRoom === index && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-primary)] rounded-full ring-1 ring-white/80 shadow"></div>
                    )}
                  </div>
                  <div className="p-3 bg-white">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-gray-900 text-sm">{room.price}</span>
                      <span className="text-gray-500">por noche</span>
                    </div>
                    <div className="flex justify-end text-[11px] text-gray-600 border-t border-gray-100 pt-1.5">
                       <div className="flex items-center space-x-1">
                        <FaUsers className="text-gray-400 flex-shrink-0" />
                        <span>{formatCapacity(room.capacity)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
} 