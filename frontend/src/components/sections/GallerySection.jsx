"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaTimes, FaImage, FaVideo, FaAngleLeft, FaAngleRight, FaPlay } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const galleryContent = [
  {
    type: 'image',
    src: '/images/placeholder/gallery1.svg',
    alt: 'Vista frontal de Hacienda San Carlos Borromeo',
    category: 'exterior',
    title: 'Fachada Principal',
    description: 'Elegante entrada principal con detalles arquitectónicos coloniales y jardines frontales cuidadamente diseñados.'
  },
  {
    type: 'image',
    src: '/images/placeholder/gallery2.svg',
    alt: 'Jardines de la hacienda',
    category: 'exterior',
    title: 'Jardines Exteriores',
    description: 'Extensos jardines con vegetación autóctona, fuentes ornamentales y caminos de piedra natural.'
  },
  {
    type: 'image',
    src: '/images/placeholder/gallery3.svg',
    alt: 'Detalles arquitectónicos',
    category: 'exterior',
    title: 'Arquitectura Colonial',
    description: 'Detalles arquitectónicos que preservan la esencia de la época colonial, desde arcos hasta balcones de hierro forjado.'
  },
  {
    type: 'image',
    src: '/images/placeholder/gallery1.svg',
    alt: 'Salón principal',
    category: 'interior',
    title: 'Gran Salón de Eventos',
    description: 'Amplio salón principal con capacidad para 300 invitados, con iluminación ambiental y exquisita decoración.'
  },
  {
    type: 'video',
    src: '/images/placeholder/gallery2.svg',
    alt: 'Recorrido virtual',
    category: 'interior',
    title: 'Tour Virtual',
    description: 'Exploración inmersiva de las instalaciones de nuestra hacienda a través de un recorrido 360°.'
  },
  {
    type: 'image',
    src: '/images/placeholder/gallery3.svg',
    alt: 'Patio central',
    category: 'exterior',
    title: 'Patio Central',
    description: 'Patio interior rodeado de columnas y arcadas, ideal para cócteles y ceremonias íntimas.'
  },
  {
    type: 'video',
    src: '/images/placeholder/gallery1.svg',
    alt: 'Video de eventos',
    category: 'eventos',
    title: 'Momentos Especiales',
    description: 'Testimonios y momentos destacados de bodas y eventos realizados en nuestra hacienda.'
  },
  {
    type: 'image',
    src: '/images/placeholder/gallery2.svg',
    alt: 'Ceremonia de boda',
    category: 'eventos',
    title: 'Ceremonias',
    description: 'Espacio consagrado para celebraciones matrimoniales, con detalles religiosos y espirituales.'
  }
];

export default function GallerySection() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const galleryRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const filteredContent = activeCategory === 'all' 
    ? galleryContent 
    : galleryContent.filter(item => item.category === activeCategory);

  // Manejar navegación en lightbox
  const handlePrevItem = () => {
    if (selectedItem === null) return;
    setIsAnimating(true);
    
    const currentIndex = filteredContent.findIndex((_, index) => index === selectedItem);
    const newIndex = (currentIndex - 1 + filteredContent.length) % filteredContent.length;
    
    setTimeout(() => {
      setSelectedItem(newIndex);
      setIsAnimating(false);
    }, 300);
  };

  const handleNextItem = () => {
    if (selectedItem === null) return;
    setIsAnimating(true);
    
    const currentIndex = filteredContent.findIndex((_, index) => index === selectedItem);
    const newIndex = (currentIndex + 1) % filteredContent.length;
    
    setTimeout(() => {
      setSelectedItem(newIndex);
      setIsAnimating(false);
    }, 300);
  };
  
  // Efecto para manejar presión de teclas en lightbox
  useEffect(() => {
    if (selectedItem === null) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevItem();
      if (e.key === 'ArrowRight') handleNextItem();
      if (e.key === 'Escape') setSelectedItem(null);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem]);

  // Efecto para el movimiento parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!galleryRef.current) return;
      const rect = galleryRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [galleryRef]);

  return (
    <section id="gallery" className="section-padding relative overflow-hidden">
      {/* Fondo con degradado */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-cream-light)] to-white z-0"></div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 h-64 w-64 border-l-2 border-t-2 border-[var(--color-primary-20)] opacity-50"></div>
      <div className="absolute bottom-0 right-0 h-64 w-64 border-r-2 border-b-2 border-[var(--color-primary-20)] opacity-50"></div>
      
      <div 
        className="container-custom relative z-10"
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
            Nuestra <span className="text-[var(--color-primary)] font-semibold">Galería</span>
          </h2>
          
          <div className="relative gold-divider mx-auto mb-10">
            <div className="absolute -top-1 -left-2 w-4 h-4 border-l-2 border-t-2 border-[var(--color-primary)]"></div>
            <div className="absolute -bottom-1 -right-2 w-4 h-4 border-r-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
          
          <p className="text-xl md:text-2xl font-light mt-10 max-w-4xl mx-auto leading-relaxed text-gray-700">
            Descubra la belleza atemporal de nuestra hacienda a través de nuestra colección exclusiva de imágenes y videos.
          </p>
        </motion.div>

        {/* Filtros de categoría */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex justify-center mb-16 overflow-x-auto pb-2"
        >
          <div className="flex space-x-1 sm:space-x-3 px-6">
            {['all', 'exterior', 'interior', 'eventos'].map((category, index) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-4 uppercase tracking-wider text-sm font-medium transition-all duration-500 relative ${
                  activeCategory === category
                    ? 'text-[var(--color-primary)]'
                    : 'text-gray-500 hover:text-[var(--color-primary)]'
                }`}
              >
                {category === 'all' ? 'Todos' : category.charAt(0).toUpperCase() + category.slice(1)}
                
                {/* Línea animada debajo del botón activo */}
                {activeCategory === category && (
                  <motion.div 
                    layoutId="activeCategoryIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-primary)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Galería de contenido con layout Masonry */}
        <div ref={galleryRef}>
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(200px,auto)] gap-6"
            style={{ 
              gridTemplateRows: 'masonry',
              gridAutoFlow: 'dense' 
            }}
          >
            {filteredContent.map((item, index) => {
              // Ajuste de tamaño para el layout masonry
              const isLarge = index % 5 === 0 || index % 5 === 3;
              const spanRows = isLarge ? 'md:row-span-2' : '';
              const spanCols = index % 5 === 0 ? 'md:col-span-2' : '';
              
              return (
                <motion.div
                  layout
                  key={`${item.title}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`group relative overflow-hidden cursor-pointer ${spanRows} ${spanCols} border-decorative`}
                  onClick={() => setSelectedItem(index)}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{ 
                    minHeight: isLarge ? '400px' : '250px'
                  }}
                >
                  <div 
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
                    style={{ 
                      backgroundImage: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.8) 140%)' 
                    }}
                  />
                  
                  <div className="absolute inset-0 z-0 transition-all duration-700">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      style={{ transformOrigin: hoveredItem === index ? 'center center' : '50% 50%' }}
                    />
                  </div>
                  
                  <div className="absolute top-3 left-3 z-20">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className={`
                        w-10 h-10 rounded-full backdrop-blur-sm
                        ${item.type === 'video' ? 'bg-[var(--color-primary)]/80' : 'bg-[var(--color-accent)]/80'} 
                        flex items-center justify-center text-white 
                        transition-opacity transform duration-500
                        opacity-0 group-hover:opacity-100
                      `}
                    >
                      {item.type === 'video' ? <FaVideo className="w-4 h-4" /> : <FaImage className="w-4 h-4" />}
                    </motion.div>
                  </div>
                  
                  {item.type === 'video' && (
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    >
                      <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/80 backdrop-blur-md flex items-center justify-center">
                        <FaPlay className="w-8 h-8 text-white ml-1" />
                      </div>
                    </motion.div>
                  )}
                  
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 p-8 z-20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                    style={{ 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' 
                    }}
                  >
                    <h3 className="text-2xl font-[var(--font-display)] text-white mb-3 shadow-text-strong">{item.title}</h3>
                    <p className="text-white/90 line-clamp-3 leading-relaxed shadow-text">{item.description}</p>
                  </motion.div>
                  
                  {hoveredItem === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 border-[3px] border-white/40 z-30 pointer-events-none"
                      style={{ 
                        mixBlendMode: 'overlay',
                        boxShadow: 'inset 0 0 30px rgba(255,255,255,0.2)'
                      }}
                    ></motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Lightbox con AnimatePresence para transiciones suaves */}
        <AnimatePresence>
          {selectedItem !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 text-white text-2xl z-50 w-12 h-12 rounded-full bg-[var(--color-primary)]/70 flex items-center justify-center backdrop-blur-sm hover:bg-[var(--color-primary)] transition-colors"
                aria-label="Cerrar"
              >
                <FaTimes className="w-6 h-6" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[var(--color-primary)]/70 transition-colors"
                onClick={handlePrevItem}
                aria-label="Anterior"
              >
                <FaAngleLeft className="h-8 w-8" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[var(--color-primary)]/70 transition-colors"
                onClick={handleNextItem}
                aria-label="Siguiente"
              >
                <FaAngleRight className="h-8 w-8" />
              </motion.button>
              
              <div className="relative w-full max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={selectedItem}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                  >
                    {filteredContent[selectedItem].type === 'video' ? (
                      <div className="relative aspect-video">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary-dark)]/30 to-transparent opacity-70"></div>
                        <Image
                          src={filteredContent[selectedItem].src}
                          alt={filteredContent[selectedItem].alt}
                          fill
                          sizes="100vw"
                          className="object-contain"
                        />
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-28 h-28 rounded-full bg-[var(--color-primary)]/60 backdrop-blur-sm flex items-center justify-center group cursor-pointer border border-white/20">
                            <FaPlay className="h-12 w-12 text-white group-hover:text-[var(--color-cream-light)] transition-colors ml-2" />
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="relative aspect-[16/9]">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary-dark)]/30 to-transparent opacity-70"></div>
                        <Image
                          src={filteredContent[selectedItem].src}
                          alt={filteredContent[selectedItem].alt}
                          fill
                          sizes="100vw"
                          className="object-contain"
                        />
                      </div>
                    )}
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="absolute left-0 right-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent pt-24"
                    >
                      <h3 className="text-3xl font-[var(--font-display)] text-white mb-4 shadow-text-strong">
                        {filteredContent[selectedItem].title}
                      </h3>
                      <p className="text-white/90 text-lg max-w-3xl shadow-text">
                        {filteredContent[selectedItem].description}
                      </p>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {filteredContent.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedItem(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === selectedItem ? 'bg-[var(--color-primary)] w-10' : 'bg-white/50 w-2 hover:bg-white/80'
                    }`}
                    aria-label={`Ver elemento ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
} 