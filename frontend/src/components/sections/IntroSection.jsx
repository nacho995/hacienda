"use client";

import { useEffect, useRef, useState } from 'react';
import { GiCastle } from 'react-icons/gi';
import { FaHeart, FaGift, FaPlayCircle, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaQuoteLeft, FaChevronDown } from 'react-icons/fa';
import { MdReplay10, MdForward10 } from 'react-icons/md';

export default function IntroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  // ID del video de YouTube
  const youtubeVideoId = 'bKKyopab1C4';
  
  // Estado para video y controles
  const [showControls, setShowControls] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} id="intro" className="section-padding bg-[var(--color-cream-light)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="elegant-title centered fade-in text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-accent)] mb-12 font-light">
            Un <span className="text-[var(--color-primary)] font-semibold">Legado</span> de Distinción
          </h2>
          <div className="gold-divider fade-in animate-delay-100"></div>
          <p className="text-xl md:text-2xl font-light fade-in animate-delay-200 mt-10 max-w-4xl mx-auto leading-relaxed">
            Hacienda San Carlos Borromeo no es solo un lugar, es la <span className="italic text-[var(--color-primary)]">manifestación de la elegancia clásica mexicana</span> donde los momentos especiales cobran vida en un entorno de incomparable belleza.
          </p>
        </div>
        
        {/* Video de YouTube */}
        <div className="my-20 fade-in animate-delay-200">
          <div 
            className="relative overflow-hidden rounded-lg shadow-2xl aspect-video"
            ref={videoContainerRef}
          >
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&showinfo=0&autoplay=0&mute=1`}
              title="Hacienda San Carlos Borromeo"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </div>
        
        {/* Cita destacada */}
        <div className="my-16 px-8 py-10 bg-[var(--color-primary)]/5 rounded-lg border-l-4 border-[var(--color-primary)] fade-in animate-delay-300">
          <div className="flex">
            <FaQuoteLeft className="text-[var(--color-primary)] w-8 h-8 mr-4 flex-shrink-0" />
            <p className="text-xl md:text-2xl italic font-light text-[var(--color-accent-dark)]">
              "Cada piedra de esta hacienda cuenta una historia, cada rincón guarda un recuerdo, y ahora, ustedes pueden ser parte de este legado centenario de elegancia y tradición."
            </p>
          </div>
        </div>
        
        {/* Historia de la Hacienda - Formato renovado */}
        <div className="my-20 fade-in animate-delay-300">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-[var(--font-display)] text-[var(--color-accent-dark)] mb-6 font-semibold">
              Historia y Tradición
            </h3>
            <div className="w-32 h-1 bg-[var(--color-primary)] mx-auto mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Primera columna con imagen y texto */}
            <div className="space-y-6">
              <div className="overflow-hidden rounded-lg shadow-md">
                <img 
                  src="/imagenintro.JPG" 
                  alt="Hacienda San Carlos Borromeo" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="bg-white/80 p-6 rounded-lg shadow-sm border border-[var(--color-accent)]/10">
                <h4 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Orígenes Virreinales</h4>
                <p className="leading-relaxed text-[var(--color-accent-dark)]">
                  Fundada durante la época virreinal del siglo XVII, esta joya arquitectónica fue originalmente establecida como una hacienda productora de caña de azúcar y pulque. Sus gruesos muros de cantera, patios con fuentes ornamentales y elegantes arcos fusionan perfectamente la arquitectura colonial española con elementos indígenas locales.
                </p>
              </div>
              
              <div className="bg-[var(--color-primary-light)]/5 p-6 rounded-lg shadow-sm border border-[var(--color-primary)]/10">
                <h4 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Testigo de la Independencia</h4>
                <p className="leading-relaxed text-[var(--color-accent-dark)]">
                  Durante la Guerra de Independencia, la hacienda sirvió como refugio temporal para insurgentes. Sus paredes fueron testigos de conversaciones secretas y planes que ayudaron a forjar el México libre que conocemos hoy.
                </p>
              </div>
            </div>
            
            {/* Segunda columna con texto e imagen */}
            <div className="space-y-6">
              <div className="bg-[var(--color-accent-light)]/5 p-6 rounded-lg shadow-sm border border-[var(--color-accent)]/10">
                <h4 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Época Revolucionaria</h4>
                <p className="leading-relaxed text-[var(--color-accent-dark)]">
                  En la época revolucionaria, la hacienda fue escenario de reuniones clandestinas que determinarían el rumbo del país. Figuras históricas recorrieron estos pasillos, dejando su huella imborrable en cada rincón de este monumento histórico.
                </p>
              </div>
              
              <div className="overflow-hidden rounded-lg shadow-md">
                <img 
                  src="/imagenintro2.JPG" 
                  alt="Restauración de la Hacienda San Carlos Borromeo" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="bg-white/80 p-6 rounded-lg shadow-sm border border-[var(--color-accent)]/10">
                <h4 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Renacimiento y Esplendor</h4>
                <p className="leading-relaxed text-[var(--color-accent-dark)]">
                  Tras décadas de abandono después de la Revolución Mexicana, la hacienda fue meticulosamente restaurada a finales del siglo XX. Cada rincón fue rehabilitado respetando técnicas tradicionales y materiales originales, preservando su autenticidad histórica mientras se adaptaba para convertirse en un extraordinario recinto para eventos.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legado Actual */}
        <div className="my-20 fade-in animate-delay-400 bg-gradient-to-r from-[var(--color-cream)] to-[var(--color-cream-light)] p-8 rounded-lg shadow-inner">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-accent-dark)] mb-4 font-semibold">
              Legado Actual
            </h3>
            <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-6"></div>
          </div>
          
          <div className="space-y-4 text-lg leading-relaxed max-w-4xl mx-auto">
            <p>
              Hoy, la <span className="font-semibold text-[var(--color-primary)]">Hacienda San Carlos Borromeo</span> se alza como un símbolo de elegancia atemporal y preservación cultural. Sus jardines centenarios, con árboles que han sido testigos silenciosos de la historia, crean un ambiente de serenidad mágica inigualable.
            </p>
            <p>
              Cada celebración que tiene lugar entre sus muros continúa la tradición de momentos significativos que han definido a esta hacienda a lo largo de los siglos, permitiendo a sus visitantes:
            </p>
            
            <ul className="list-none space-y-3 pl-4 mt-4">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 mr-3"></span>
                <span>Ser parte de un legado histórico único en México</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 mr-3"></span>
                <span>Escribir su propio capítulo en esta majestuosa propiedad</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 mr-3"></span>
                <span>Experimentar la fusión perfecta entre historia y modernidad</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 mr-3"></span>
                <span>Disfrutar de un entorno donde cada detalle tiene significado</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Características destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
          <div className="relative group elegant-card p-8 md:p-10 text-center fade-in animate-delay-100 overflow-hidden border border-[var(--color-primary-20)] rounded-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-5)] via-transparent to-[var(--color-primary-10)] opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-6 flex flex-col items-center">
                <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-20)] to-[var(--color-primary-5)] text-[var(--color-primary)] border border-[var(--color-primary-30)] shadow-inner group-hover:shadow-[var(--color-primary-20)] transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-[var(--color-primary)] relative">
                  Arquitectura Colonial
                  <span className="block h-1 w-20 mx-auto mt-2 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></span>
                </h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed text-[var(--color-accent-dark)]">
                Muros centenarios e impecables jardines que traen a la vida la esencia atemporal de las haciendas mexicanas, creando un telón de fondo incomparable para su evento.
              </p>
            </div>
          </div>
          
          <div className="relative group elegant-card p-8 md:p-10 text-center fade-in animate-delay-200 overflow-hidden border border-[var(--color-primary-20)] rounded-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-5)] via-transparent to-[var(--color-primary-10)] opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-6 flex flex-col items-center">
                <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-20)] to-[var(--color-primary-5)] text-[var(--color-primary)] border border-[var(--color-primary-30)] shadow-inner group-hover:shadow-[var(--color-primary-20)] transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-[var(--color-primary)] relative">
                  Servicio Personalizado
                  <span className="block h-1 w-20 mx-auto mt-2 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></span>
                </h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed text-[var(--color-accent-dark)]">
                Cada detalle es tratado con la dedicación que merece. Nuestro equipo trabaja incansablemente para convertir su visión en una celebración excepcional.
              </p>
            </div>
          </div>
          
          <div className="relative group elegant-card p-8 md:p-10 text-center fade-in animate-delay-300 overflow-hidden border border-[var(--color-primary-20)] rounded-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-5)] via-transparent to-[var(--color-primary-10)] opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-6 flex flex-col items-center">
                <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-20)] to-[var(--color-primary-5)] text-[var(--color-primary)] border border-[var(--color-primary-30)] shadow-inner group-hover:shadow-[var(--color-primary-20)] transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-[var(--color-primary)] relative">
                  Experiencia Memorable
                  <span className="block h-1 w-20 mx-auto mt-2 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></span>
                </h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed text-[var(--color-accent-dark)]">
                Combinamos la calidez de la hospitalidad mexicana con un servicio cinco estrellas para crear recuerdos que perdurarán para toda la vida.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 