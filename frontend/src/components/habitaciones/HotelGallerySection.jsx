"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaTimes, FaAngleLeft, FaAngleRight, FaCamera, FaTree, FaSwimmingPool } from 'react-icons/fa'; // Iconos relevantes
import { motion, AnimatePresence } from 'framer-motion';

// Datos de las imágenes del hotel - CORREGIR RUTAS
const hotelPhotos = [
  { src: '/Entrada-hotel.jpeg', alt: 'Entrada principal de la Hacienda', title: 'Bienvenida Majestuosa', description: 'El histórico portal que da la bienvenida a nuestros huéspedes.', category: 'entrada' },
  { src: '/Areas-exteriores-hotel.jpeg', alt: 'Patio con arcos y piscina', title: 'Serenidad Acuática', description: 'Nuestra piscina rodeada de la arquitectura colonial.', category: 'exteriores' },
  { src: '/Areas-exteriores-hotel1.jpeg', alt: 'Terraza comedor exterior bajo árbol', title: 'Sabores al Aire Libre', description: 'Disfrute de un momento relajante en nuestras terrazas.', category: 'exteriores' },
  { src: '/Areas-exteriores-hotel3.jpeg', alt: 'Fachada con hiedra', title: 'Muros con Historia', description: 'La naturaleza abraza la arquitectura centenaria.', category: 'exteriores' },
  { src: '/Areas-exteriores-hotel4.jpeg', alt: 'Pasillo exterior con arcos', title: 'Paseo Colonial', description: 'Corredores que invitan a explorar la hacienda.', category: 'exteriores' },
  { src: '/Areas-exteriores-hote2.jpeg', alt: 'Terraza exterior bajo techo', title: 'Refugio Elegante', description: 'Espacios exteriores cubiertos para disfrutar del clima.', category: 'exteriores' },
  { src: '/Areas-libres.jpeg', alt: 'Jardín con kiosko', title: 'Rincones Verdes', description: 'Nuestros jardines, un oasis de tranquilidad y belleza.', category: 'jardines' },
  { src: '/Areas-libres1.jpeg', alt: 'Jardín con flores y camino', title: 'Naturaleza Viva', description: 'Caminos que serpentean entre la exuberante vegetación.', category: 'jardines' },
  { src: '/Pasillo-habitaciones.jpeg', alt: 'Pasillo interior con muebles', title: 'Corredores con Encanto', description: 'Pasillos interiores decorados con estilo tradicional.', category: 'pasillos' },
  { src: '/Pasillo-habitaciones1.jpeg', alt: 'Pasillo interior con luz natural', title: 'Ecos del Pasado', description: 'La luz baña los corredores llenos de historia.', category: 'pasillos' },
  { src: '/Pasillo-habitaciones2.jpeg', alt: 'Pasillo de piedra con arco', title: 'Arcos Testigos del Tiempo', description: 'La arquitectura original presente en cada detalle.', category: 'pasillos' },
  { src: '/Pasillo-habitaciones3.jpeg', alt: 'Camino de piedra entre muros', title: 'Senderos Históricos', description: 'Explore los caminos que conectan los espacios de la hacienda.', category: 'pasillos' },
  { src: '/Pasillo-habitaciones4.jpeg', alt: 'Pasillo con sombras y luz', title: 'Juego de Luces', description: 'Contrastes que resaltan la belleza arquitectónica.', category: 'pasillos' },
  { src: '/Pasillo-habitaciones5.jpeg', alt: 'Pasillo interior con vista a puerta', title: 'Perspectivas Elegantes', description: 'Descubra la armonía de los espacios interiores.', category: 'pasillos' },
  { src: '/Pasillo-habitaciones6.jpeg', alt: 'Pasillo exterior con vista a jardín', title: 'Conexión Natural', description: 'Los interiores se fusionan con la belleza exterior.', category: 'pasillos' },
  { src: '/Comedor.jpeg', alt: 'Comedor exterior con gente', title: 'Convivencia Tradicional', description: 'Espacios para compartir momentos y sabores.', category: 'comedor' },
  { src: '/Comedor1.jpeg', alt: 'Comedor exterior cubierto', title: 'Ambiente Acogedor', description: 'Nuestro comedor, perfecto para disfrutar la gastronomía.', category: 'comedor' },
  { src: '/Comedor2.jpeg', alt: 'Comedor interior con lámpara', title: 'Cenas Íntimas', description: 'Un espacio cálido para veladas memorables.', category: 'comedor' },
  { src: '/Recepcion.jpeg', alt: 'Arcos interiores con fuente', title: 'Corazón de la Hacienda', description: 'Patios interiores que invitan a la calma y la contemplación.', category: 'interiores' },
];

// Categorías para el filtro
const hotelCategories = [
  { id: 'todas', label: 'Todas' },
  { id: 'entrada', label: 'Entrada' },
  { id: 'exteriores', label: 'Exteriores' },
  { id: 'jardines', label: 'Jardines' },
  { id: 'pasillos', label: 'Pasillos' },
  { id: 'comedor', label: 'Comedor' },
  { id: 'interiores', label: 'Interiores' },
];


export default function HotelGallerySection() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const galleryRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentCategory, setCurrentCategory] = useState('todas');
  const [viewMode, setViewMode] = useState('slider'); // Cambiar a 'slider' por defecto
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Filtrar fotos según la categoría seleccionada
  const filteredPhotos = currentCategory === 'todas' 
    ? hotelPhotos 
    : hotelPhotos.filter(photo => photo.category === currentCategory);
  
  // Manejar navegación en lightbox
  const handlePrevItem = () => {
    if (selectedItem === null) return;
    setIsAnimating(true);
    
    // Encontrar el índice actual dentro de las fotos filtradas
    const currentPhotoSrc = hotelPhotos[selectedItem].src;
    const currentIndexInFiltered = filteredPhotos.findIndex(p => p.src === currentPhotoSrc);
    
    // Calcular nuevo índice basado en las fotos filtradas
    const newIndexInFiltered = (currentIndexInFiltered - 1 + filteredPhotos.length) % filteredPhotos.length;
    const newGlobalIndex = hotelPhotos.findIndex(p => p.src === filteredPhotos[newIndexInFiltered].src);

    setTimeout(() => {
      setSelectedItem(newGlobalIndex);
      setIsAnimating(false);
    }, 300);
  };

  const handleNextItem = () => {
    if (selectedItem === null) return;
    setIsAnimating(true);

    const currentPhotoSrc = hotelPhotos[selectedItem].src;
    const currentIndexInFiltered = filteredPhotos.findIndex(p => p.src === currentPhotoSrc);
    
    const newIndexInFiltered = (currentIndexInFiltered + 1) % filteredPhotos.length;
    const newGlobalIndex = hotelPhotos.findIndex(p => p.src === filteredPhotos[newIndexInFiltered].src);
    
    setTimeout(() => {
      setSelectedItem(newGlobalIndex);
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
  }, [selectedItem, currentCategory]); // Añadir currentCategory como dependencia

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

  // Resetear slide del slider al cambiar categoría
   useEffect(() => {
      setCurrentSlide(0);
   }, [currentCategory]);

  return (
    <section id="hotel-gallery" className="section-padding relative overflow-hidden bg-white">
      {/* Fondo decorativo suave */}
      {/* <div className="absolute inset-0 bg-[url('/path/to/soft-pattern.svg')] bg-repeat opacity-5 z-0"></div> */}
      
      {/* Elementos decorativos */}
      {/* <div className="absolute top-10 right-10 h-32 w-32 border-r-2 border-t-2 border-[var(--color-primary-20)] opacity-50"></div> */}
      
      <div 
        className="container-custom relative z-10"
        style={{
          transform: `translate(${mousePosition.x * -3}px, ${mousePosition.y * -3}px)`, // Reducir efecto parallax
          transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16" // Aumentar margen inferior
        >
          {/* Iconos decorativos */}
          <div className="inline-block relative mb-4">
            <FaTree className="text-[var(--color-primary)] text-2xl absolute -top-3 -left-6 transform -rotate-12 opacity-70" />
            <FaSwimmingPool className="text-[var(--color-primary)] text-lg absolute -top-1 -right-5 transform rotate-12 opacity-60" />
          </div>
          
          {/* Título actualizado */}
          <h2 className="text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-accent)] mb-6 font-bold">
            Descubre <span className="text-[var(--color-primary)]">Nuestros Espacios</span>
          </h2>
          
          {/* Línea divisora */}
          <div className="relative gold-divider mx-auto mb-8">
            <div className="absolute -top-1 -left-2 w-4 h-4 border-l-2 border-t-2 border-[var(--color-primary)]"></div>
            <div className="absolute -bottom-1 -right-2 w-4 h-4 border-r-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
          
          {/* Descripción actualizada */}
          <p className="text-xl md:text-2xl font-light mt-8 max-w-4xl mx-auto leading-relaxed text-gray-700">
            Explora la belleza y el encanto de cada rincón de la Hacienda San Carlos Borromeo.
          </p>
        </motion.div>

        {/* Controles de categoría y vista */}
        <div className="mb-10">
          {/* Filtro de categorías */}
          <div className="flex flex-wrap justify-center mb-6">
            {hotelCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setCurrentCategory(category.id)}
                className={`px-4 py-2 mx-2 my-1 rounded-full transition-all duration-300 text-sm font-medium ${
                  currentCategory === category.id 
                    ? 'bg-[var(--color-primary)] text-black shadow-md' 
                    : 'bg-white text-[var(--color-accent-dark)] hover:bg-[var(--color-primary-light)] border border-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
          
          {/* Selector de modo de visualización (Opcional: mantener o simplificar) */}
          <div className="flex justify-center space-x-3 mb-6">
             {/* ... (código del selector de vista igual que en GallerySection) ... */}
              <motion.button
              onClick={() => setViewMode('slider')}
              className={`flex items-center px-4 py-2 rounded-l-full border text-sm ${
                viewMode === 'slider'
                  ? 'bg-[var(--color-primary-10)] border-[var(--color-primary)] text-[var(--color-primary-dark)] font-semibold'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
              whileHover={viewMode !== 'slider' ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              Presentación
            </motion.button>
            <motion.button
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-4 py-2 rounded-r-full border text-sm ${
                viewMode === 'grid'
                  ? 'bg-[var(--color-primary-10)] border-[var(--color-primary)] text-[var(--color-primary-dark)] font-semibold'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
              whileHover={viewMode !== 'grid' ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Cuadrícula
            </motion.button>
          </div>

          {/* Estadísticas de imágenes */}
          <div className="text-center text-gray-600 mb-6 text-sm">
            Mostrando {filteredPhotos.length} {filteredPhotos.length === 1 ? 'imagen' : 'imágenes'}
            {currentCategory !== 'todas' && ` de ${hotelCategories.find(c => c.id === currentCategory)?.label}`}
          </div>
        </div>

        {/* Galería de fotos */}
        <div ref={galleryRef} className="relative">
          {/* Modo cuadrícula */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredPhotos.map((photo, index) => {
                // Ajustar lógica para tamaño si se desea, o mantener simple
                 const isLarge = index % 5 === 0; // Ejemplo: hacer más grande cada 5ta foto
                 const spanCols = isLarge ? 'sm:col-span-2' : '';
                 const spanRows = isLarge ? 'lg:row-span-2' : ''; // Span de fila solo en pantallas grandes
                 const heightClass = isLarge ? 'h-[400px] md:h-[600px]' : 'h-[300px] md:h-[400px]'; // Alturas responsivas

                return (
                  <motion.div
                    key={photo.src} // Usar src como key si es único
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.5, delay: index * 0.05 }} // Delay más corto
                    className={`group relative overflow-hidden rounded-lg shadow-lg cursor-pointer transform transition-all duration-500 hover:scale-[1.03] hover:shadow-xl ${spanCols} ${spanRows} ${heightClass}`}
                    onClick={() => setSelectedItem(hotelPhotos.findIndex(p => p.src === photo.src))}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Borde sutil */}
                    <div className="absolute inset-0 border border-black/5 group-hover:border-black/10 z-20 rounded-lg transition-all duration-300 pointer-events-none"></div>
                    
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes={isLarge ? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 60vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw"}
                        className="object-cover"
                        priority={index < 6} // Prioridad para las primeras imágenes
                         onError={(e) => { e.target.src = '/images/placeholder/default-landscape.svg'; }} // Fallback genérico
                      />
                    </div>
                    
                     {/* Categoría tag */}
                    <div className="absolute top-3 left-3 z-20 bg-[var(--color-primary)]/90 text-white text-[10px] font-semibold py-0.5 px-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {hotelCategories.find(c => c.id === photo.category)?.label.toUpperCase()}
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    
                    {/* Contenido de texto */}
                     <div className="absolute bottom-0 left-0 right-0 p-4 z-20 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <h3 className="text-lg font-semibold text-white drop-shadow mb-1">{photo.title}</h3>
                      <p className="text-white/80 text-xs line-clamp-2">{photo.description}</p>
                    </div>
                    
                    {/* Icono cámara */}
                     <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <FaCamera className="text-white/60 text-base" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* Modo slider */}
           {viewMode === 'slider' && (
             <div className="relative h-[500px] md:h-[650px] overflow-hidden rounded-xl shadow-xl border border-gray-100">
               {/* Slider principal */}
              <div className="relative w-full h-full">
                 <AnimatePresence initial={false}>
                   <motion.div
                     key={currentSlide}
                     className="absolute inset-0"
                     initial={{ opacity: 0, x: 30 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -30 }}
                     transition={{ duration: 0.4, ease: "easeInOut" }}
                     onClick={() => setSelectedItem(hotelPhotos.findIndex(p => p.src === filteredPhotos[currentSlide].src))} // Abrir lightbox al hacer clic
                   >
                     <Image
                       src={filteredPhotos[currentSlide].src}
                       alt={filteredPhotos[currentSlide].alt}
                       fill
                       sizes="100vw"
                       className="object-cover cursor-pointer"
                       priority
                       onError={(e) => { e.target.src = '/images/placeholder/default-landscape.svg'; }}
                     />
                     
                     {/* Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
                     
                     {/* Información */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 text-white pointer-events-none">
                        <div className="mb-2">
                          <span className="bg-[var(--color-primary)]/80 text-white text-xs font-medium py-1 px-3 rounded-full backdrop-blur-sm">
                            {hotelCategories.find(c => c.id === filteredPhotos[currentSlide].category)?.label}
                          </span>
                        </div>
                       <h3 className="text-xl md:text-3xl font-semibold mb-1 drop-shadow">{filteredPhotos[currentSlide].title}</h3>
                       <p className="text-sm md:text-base max-w-xl opacity-90 drop-shadow">{filteredPhotos[currentSlide].description}</p>
                     </div>
                   </motion.div>
                 </AnimatePresence>
               </div>
               
               {/* Botones de navegación */}
                <button 
                 className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center z-30 transition-all duration-200 backdrop-blur-sm"
                 onClick={() => setCurrentSlide((currentSlide - 1 + filteredPhotos.length) % filteredPhotos.length)}
                 aria-label="Anterior"
               >
                 <FaAngleLeft className="text-xl md:text-2xl" />
               </button>
               
               <button 
                 className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center z-30 transition-all duration-200 backdrop-blur-sm"
                 onClick={() => setCurrentSlide((currentSlide + 1) % filteredPhotos.length)}
                 aria-label="Siguiente"
               >
                 <FaAngleRight className="text-xl md:text-2xl" />
               </button>
               
               {/* Indicadores */}
                <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-1.5 z-30">
                 {filteredPhotos.map((_, i) => (
                   <button
                     key={i}
                     className={`h-1.5 rounded-full transition-all duration-300 ${
                       currentSlide === i ? 'bg-white w-6' : 'bg-white/50 w-4'
                     }`}
                     onClick={() => setCurrentSlide(i)}
                     aria-label={`Ir a imagen ${i + 1}`}
                   ></button>
                 ))}
               </div>
               
             </div>
           )}
        </div>
      </div>

       {/* Lightbox (igual que en GallerySection, pero usa hotelPhotos) */}
       <AnimatePresence>
         {selectedItem !== null && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.3 }}
             className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
             onClick={() => setSelectedItem(null)}
           >
             {/* Botón cerrar */}
              <button 
               className="absolute top-4 right-4 text-white/70 hover:text-white z-[101] text-3xl transition-colors"
               onClick={() => setSelectedItem(null)}
               aria-label="Cerrar"
             >
               <FaTimes />
             </button>
             
             {/* Contenedor de imagen con animación */}
              <motion.div 
               key={selectedItem} // Key cambia para forzar re-render en navegación
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ duration: 0.3 }}
               className="relative w-full max-w-4xl h-[80vh] mx-auto" 
               onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic en la imagen
             >
               <Image
                 src={hotelPhotos[selectedItem].src}
                 alt={hotelPhotos[selectedItem].alt}
                 fill
                 sizes="(max-width: 1024px) 90vw, 80vw"
                 className="object-contain"
                 priority
                 onError={(e) => { e.target.src = '/images/placeholder/default-landscape.svg'; }}
               />
               
                {/* Información superpuesta */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white text-center pointer-events-none">
                 <span className="bg-[var(--color-primary)]/80 text-white text-xs font-medium py-0.5 px-2 rounded-full backdrop-blur-sm mb-2 inline-block">
                   {hotelCategories.find(c => c.id === hotelPhotos[selectedItem].category)?.label}
                 </span>
                 <h3 className="text-xl font-semibold">{hotelPhotos[selectedItem].title}</h3>
                 <p className="text-sm opacity-80">{hotelPhotos[selectedItem].description}</p>
               </div>
             </motion.div>
             
             {/* Botones de navegación Lightbox */}
              <button 
               className="absolute left-2 sm:left-5 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center z-[101] transition-colors"
               onClick={(e) => { e.stopPropagation(); handlePrevItem(); }}
               aria-label="Anterior"
             >
               <FaAngleLeft className="text-2xl" />
             </button>
             
             <button 
               className="absolute right-2 sm:right-5 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center z-[101] transition-colors"
               onClick={(e) => { e.stopPropagation(); handleNextItem(); }}
               aria-label="Siguiente"
             >
               <FaAngleRight className="text-2xl" />
             </button>
             
           </motion.div>
         )}
       </AnimatePresence>
    </section>
  );
} 