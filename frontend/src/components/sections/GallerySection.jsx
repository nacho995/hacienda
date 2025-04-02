"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaTimes, FaAngleLeft, FaAngleRight, FaCamera, FaHeart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Datos de las imágenes de bodas, con descripciones elegantes
const weddingPhotos = [
  {
    src: '/boda1.JPG',
    alt: 'Ceremonia de boda en la hacienda',
    title: 'Votos Eternos',
    description: 'El momento en que dos almas se comprometen para toda la vida, bajo la luz dorada del atardecer en nuestros jardines centenarios.',
    category: 'ceremonia'
  },
  {
    src: '/boda2.JPG',
    alt: 'Recepción elegante al aire libre',
    title: 'Celebración Bajo las Estrellas',
    description: 'Recepciones al aire libre donde la magia de la noche abraza cada momento de su celebración.',
    category: 'recepcion'
  },
  {
    src: '/boda3.JPG',
    alt: 'Decoración floral de la ceremonia',
    title: 'Detalles que Enamoran',
    description: 'Arreglos florales que transforman nuestros espacios en escenarios de ensueño para su día especial.',
    category: 'decoracion'
  },
  {
    src: '/boda4.jpg',
    alt: 'Primer baile de los novios',
    title: 'El Primer Baile',
    description: 'Ese momento íntimo donde el mundo se detiene mientras comparten su primer baile como matrimonio.',
    category: 'momentos'
  },
  {
    src: '/boda5.jpg',
    alt: 'Mesa principal decorada',
    title: 'Elegancia en Cada Detalle',
    description: 'Decoración personalizada que refleja su estilo único y la grandeza del momento.',
    category: 'decoracion'
  },
  {
    src: '/boda6.JPG',
    alt: 'Novios en los jardines',
    title: 'Jardines de Ensueño',
    description: 'Rincones mágicos entre vegetación centenaria, perfectos para capturar los primeros recuerdos como matrimonio.',
    category: 'espacios'
  },
  {
    src: '/boda7.JPG',
    alt: 'Ceremonia iluminada con velas',
    title: 'Luces del Corazón',
    description: 'Iluminación cálida que crea atmósferas íntimas y memorables para cada momento de su boda.',
    category: 'decoracion'
  },
  {
    src: '/boda8.JPG',
    alt: 'Banquete de boda',
    title: 'Festín de Celebración',
    description: 'Experiencias gastronómicas excepcionales que deleitan a sus invitados mientras celebran su amor.',
    category: 'recepcion'
  },
  {
    src: '/boda9.JPG',
    alt: 'Momento romántico de los novios',
    title: 'Instantes de Eternidad',
    description: 'Pequeños momentos que se convierten en recuerdos atesorados para toda la vida.',
    category: 'momentos'
  },
  {
    src: '/boda10.JPG',
    alt: 'Pasillo decorado para ceremonia',
    title: 'El Camino hacia el Destino',
    description: 'Pasillos elegantemente decorados que marcan el inicio de una nueva vida compartida.',
    category: 'espacios'
  },
  {
    src: '/boda11.JPG',
    alt: 'Brindis de los novios',
    title: 'Brindis por el Amor',
    description: 'Celebrando el comienzo de una vida juntos rodeados de sus seres queridos.',
    category: 'momentos'
  },
  {
    src: '/boda12.JPG',
    alt: 'Detalle de decoración de mesa',
    title: 'Arte en Cada Mesa',
    description: 'Diseños personalizados que transforman cada rincón en un espacio único y memorable.',
    category: 'decoracion'
  },
  {
    src: '/boda13.JPG',
    alt: 'Ceremonia en el jardín',
    title: 'Unión Sagrada',
    description: 'El momento en que dos familias se unen en un escenario de incomparable belleza natural.',
    category: 'ceremonia'
  },
  {
    src: '/boda14.JPG',
    alt: 'Baile en la recepción',
    title: 'Ritmos de Felicidad',
    description: 'Pistas de baile donde la alegría y el amor se expresan al compás de la música.',
    category: 'recepcion'
  },
  {
    src: '/boda15.JPG',
    alt: 'Intercambio de anillos',
    title: 'Símbolos de Amor Eterno',
    description: 'El intercambio de anillos, símbolo del compromiso eterno entre dos personas.',
    category: 'ceremonia'
  },
  {
    src: '/boda.JPG',
    alt: 'Vista panorámica de boda',
    title: 'Panorama de Ensueño',
    description: 'La majestuosidad de nuestra hacienda transformada en el escenario perfecto para su historia de amor.',
    category: 'espacios'
  },
  {
    src: '/boda16.JPG',
    alt: 'Decoración floral del altar',
    title: 'Altar de Ensueño',
    description: 'Altares decorados con arreglos florales que simbolizan la pureza y belleza del amor que se celebra.',
    category: 'decoracion'
  },
  {
    src: '/boda17.JPG',
    alt: 'Primer beso como esposos',
    title: 'El Primer Beso',
    description: 'Ese momento mágico que sella la unión de dos almas destinadas a compartir la vida.',
    category: 'momentos'
  },
  {
    src: '/boda18.JPG',
    alt: 'Detalles de la mesa de postres',
    title: 'Dulces Memorias',
    description: 'Exquisitas creaciones que deleitan tanto la vista como el paladar, añadiendo un toque de dulzura a su celebración.',
    category: 'decoracion'
  }
];

export default function GallerySection() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const galleryRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentCategory, setCurrentCategory] = useState('todas');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'slider'
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Categorías disponibles
  const categories = [
    { id: 'todas', label: 'Todas' },
    { id: 'ceremonia', label: 'Ceremonias' },
    { id: 'recepcion', label: 'Celebraciones' },
    { id: 'decoracion', label: 'Decoración' },
    { id: 'momentos', label: 'Momentos Especiales' },
    { id: 'espacios', label: 'Espacios' }
  ];
  
  // Filtrar fotos según la categoría seleccionada
  const filteredPhotos = currentCategory === 'todas' 
    ? weddingPhotos 
    : weddingPhotos.filter(photo => photo.category === currentCategory);
  
  // Manejar navegación en lightbox
  const handlePrevItem = () => {
    if (selectedItem === null) return;
    setIsAnimating(true);
    
    const newIndex = (selectedItem - 1 + weddingPhotos.length) % weddingPhotos.length;
    
    setTimeout(() => {
      setSelectedItem(newIndex);
      setIsAnimating(false);
    }, 300);
  };

  const handleNextItem = () => {
    if (selectedItem === null) return;
    setIsAnimating(true);
    
    const newIndex = (selectedItem + 1) % weddingPhotos.length;
    
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
    <section id="gallery" className="section-padding relative overflow-hidden bg-[var(--color-cream-light)]">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[url('/flores.svg')] bg-repeat-space opacity-5 z-0"></div>
      
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
          className="text-center mb-12"
        >
          <div className="inline-block relative mb-3">
            <FaHeart className="text-[var(--color-primary)] text-2xl absolute -top-3 -left-6 transform -rotate-12 opacity-70" />
            <FaHeart className="text-[var(--color-primary)] text-lg absolute -top-1 -right-5 transform rotate-12 opacity-60" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-accent)] mb-6 font-light">
            Bodas de <span className="text-[var(--color-primary)] font-semibold">Ensueño</span>
          </h2>
          
          <div className="relative gold-divider mx-auto mb-8">
            <div className="absolute -top-1 -left-2 w-4 h-4 border-l-2 border-t-2 border-[var(--color-primary)]"></div>
            <div className="absolute -bottom-1 -right-2 w-4 h-4 border-r-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
          
          <p className="text-xl md:text-2xl font-light mt-8 max-w-4xl mx-auto leading-relaxed text-gray-700">
            Momentos mágicos capturados en nuestra hacienda, donde cada celebración se transforma en un recuerdo eterno.
          </p>
        </motion.div>

        {/* Controles de categoría y vista */}
        <div className="mb-10">
          {/* Filtro de categorías */}
          <div className="flex flex-wrap justify-center mb-6">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => {
                  setCurrentCategory(category.id);
                  setCurrentSlide(0); // Resetear el slider al cambiar de categoría
                }}
                className={`px-4 py-2 mx-2 my-1 rounded-full transition-all duration-300 ${
                  currentCategory === category.id 
                    ? 'bg-[var(--color-primary)] text-white' 
                    : 'bg-white/80 text-[var(--color-accent-dark)] hover:bg-[var(--color-primary-10)]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
          
          {/* Selector de modo de visualización */}
          <div className="flex justify-center space-x-3 mb-6">
            <motion.button
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-4 py-2 rounded-l-full border ${
                viewMode === 'grid'
                  ? 'bg-[var(--color-primary-10)] border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'bg-white/80 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={viewMode !== 'grid' ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Cuadrícula
            </motion.button>
            <motion.button
              onClick={() => setViewMode('slider')}
              className={`flex items-center px-4 py-2 rounded-r-full border ${
                viewMode === 'slider'
                  ? 'bg-[var(--color-primary-10)] border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'bg-white/80 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={viewMode !== 'slider' ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              Presentación
            </motion.button>
          </div>

          {/* Estadísticas de imágenes */}
          <div className="text-center text-gray-600 mb-6">
            Mostrando {filteredPhotos.length} {filteredPhotos.length === 1 ? 'imagen' : 'imágenes'}
            {currentCategory !== 'todas' && ` de ${categories.find(c => c.id === currentCategory)?.label}`}
          </div>
        </div>

        {/* Galería de fotos con diseño condicional (cuadrícula o slider) */}
        <div ref={galleryRef} className="relative">
          {/* Modo cuadrícula */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredPhotos.map((photo, index) => {
                // Determinamos si la foto debe ocupar espacio doble para efecto visual
                const isLarge = index === 0 || index === 5 || index === 10;
                const spanCols = isLarge ? 'sm:col-span-2' : '';
                const spanRows = isLarge ? 'row-span-2' : '';
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.7, delay: index * 0.1 }}
                    className={`group relative overflow-hidden rounded-lg shadow-xl cursor-pointer transform transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl ${spanCols} ${spanRows}`}
                    style={{ height: isLarge ? '600px' : '400px' }}
                    onClick={() => setSelectedItem(weddingPhotos.findIndex(p => p.src === photo.src))}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Borde decorativo con efecto hover */}
                    <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 z-20 rounded-lg transition-all duration-500"></div>
                    
                    {/* Imagen con optimización de Next.js */}
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes={isLarge ? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 60vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw"}
                        className="object-cover"
                        priority={index < 6}
                      />
                    </div>
                    
                    {/* Categoría tag */}
                    <div className="absolute top-4 left-4 z-20 bg-[var(--color-primary)]/80 text-white text-xs py-1 px-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {categories.find(c => c.id === photo.category)?.label}
                    </div>
                    
                    {/* Overlay con efecto de degradado */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                    
                    {/* Contenido de texto con animación */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <h3 className="text-2xl font-[var(--font-display)] text-white drop-shadow-md mb-2">{photo.title}</h3>
                      <p className="text-white/90 text-sm line-clamp-2">{photo.description}</p>
                    </div>
                    
                    {/* Icono de cámara con animación */}
                    <div className="absolute top-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300">
                      <FaCamera className="text-white/70 text-xl" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* Modo slider */}
          {viewMode === 'slider' && (
            <div className="relative h-[600px] overflow-hidden rounded-xl shadow-2xl">
              {/* Slider principal */}
              <div className="relative w-full h-full">
                {filteredPhotos.map((photo, index) => (
                  <motion.div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      priority={index === currentSlide}
                      onClick={() => setSelectedItem(weddingPhotos.findIndex(p => p.src === photo.src))}
                    />
                    
                    {/* Overlay para texto */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-20"></div>
                    
                    {/* Información de la imagen */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-30 text-white">
                      <div className="mb-3">
                        <span className="bg-[var(--color-primary)]/80 text-white text-sm py-1 px-4 rounded-full backdrop-blur-sm">
                          {categories.find(c => c.id === photo.category)?.label}
                        </span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-[var(--font-display)] mb-2 drop-shadow-lg">{photo.title}</h3>
                      <p className="text-lg md:text-xl max-w-3xl drop-shadow-lg">{photo.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Botones de navegación */}
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-12 h-12 rounded-full flex items-center justify-center z-30 transition-colors backdrop-blur-sm"
                onClick={() => setCurrentSlide((currentSlide - 1 + filteredPhotos.length) % filteredPhotos.length)}
              >
                <FaAngleLeft className="text-2xl" />
              </button>
              
              <button 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-12 h-12 rounded-full flex items-center justify-center z-30 transition-colors backdrop-blur-sm"
                onClick={() => setCurrentSlide((currentSlide + 1) % filteredPhotos.length)}
              >
                <FaAngleRight className="text-2xl" />
              </button>
              
              {/* Indicadores de posición */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-30">
                {filteredPhotos.map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentSlide === i ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentSlide(i)}
                  ></button>
                ))}
              </div>
              
              {/* Miniaturas de navegación */}
              <div className="absolute bottom-24 left-0 right-0 flex justify-center z-30">
                <div className="flex space-x-2 overflow-x-auto max-w-full px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm">
                  {filteredPhotos.map((photo, i) => (
                    <button
                      key={i}
                      className={`w-16 h-10 flex-shrink-0 rounded-md overflow-hidden transition-all duration-300 ${
                        currentSlide === i ? 'ring-2 ring-[var(--color-primary)] scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      onClick={() => setCurrentSlide(i)}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={photo.src}
                          alt={photo.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox para visualización de imágenes */}
      <AnimatePresence>
        {selectedItem !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedItem(null)}
          >
            {/* Botón para cerrar */}
            <button 
              className="absolute top-6 right-6 text-white/80 hover:text-white z-50 text-4xl"
              onClick={() => setSelectedItem(null)}
            >
              <FaTimes />
            </button>
            
            {/* Imagen actual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isAnimating ? 0 : 1, scale: isAnimating ? 0.9 : 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl mx-auto aspect-video" 
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={weddingPhotos[selectedItem].src}
                alt={weddingPhotos[selectedItem].alt}
                fill
                sizes="(max-width: 1024px) 90vw, 80vw"
                className="object-contain"
                priority
              />
              
              {/* Categoría tag */}
              <div className="absolute top-4 left-4 z-30">
                <span className="bg-[var(--color-primary)]/80 text-white text-sm py-1 px-4 rounded-full backdrop-blur-sm">
                  {categories.find(c => c.id === weddingPhotos[selectedItem].category)?.label}
                </span>
              </div>
              
              {/* Información de la imagen */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white text-center">
                <h3 className="text-2xl md:text-3xl font-[var(--font-display)] mb-2">{weddingPhotos[selectedItem].title}</h3>
                <p className="md:text-lg opacity-80 max-w-2xl mx-auto">{weddingPhotos[selectedItem].description}</p>
              </div>
            </motion.div>
            
            {/* Botones de navegación */}
            <button 
              className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center z-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevItem();
              }}
            >
              <FaAngleLeft className="text-3xl" />
            </button>
            
            <button 
              className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center z-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleNextItem();
              }}
            >
              <FaAngleRight className="text-3xl" />
            </button>
            
            {/* Miniaturas de navegación */}
            <div className="absolute bottom-24 left-0 right-0 flex justify-center z-50 overflow-x-auto">
              <div className="flex space-x-2 p-2 bg-black/40 backdrop-blur-sm rounded-full">
                {weddingPhotos.filter(photo => currentCategory === 'todas' || photo.category === currentCategory)
                  .map((photo, i) => {
                    const photoIndex = weddingPhotos.findIndex(p => p.src === photo.src);
                    return (
                      <button
                        key={i}
                        className={`w-12 h-8 flex-shrink-0 rounded-md overflow-hidden transition-all duration-300 ${
                          selectedItem === photoIndex ? 'ring-2 ring-[var(--color-primary)] scale-110' : 'opacity-60 hover:opacity-100'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(photoIndex);
                        }}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={photo.src}
                            alt={photo.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
} 