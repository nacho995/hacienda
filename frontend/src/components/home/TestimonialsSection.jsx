"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaQuoteRight, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import apiClient from '../../services/apiClient'; // Ajusta la ruta si es necesario

// Datos de testimonios eliminados

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);
  const slideRef = useRef(null);

  // Fetch Reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      console.log('[TestimonialsSection] Fetching approved reviews using apiClient...');
      try {
        // --- CAMBIADO: Usar apiClient y añadir /api explícitamente ---
        const responseData = await apiClient.get('/api/reviews/approved');
        console.log('[TestimonialsSection] apiClient response received:', responseData);

        // Verificar la estructura esperada { success: true, data: [...] }
        // La estructura puede variar dependiendo de tu interceptor de apiClient
        // Ajusta según cómo tu interceptor devuelve los datos
        if (responseData && responseData.success === true && Array.isArray(responseData.data)) {
            setReviews(responseData.data);
            console.log('[TestimonialsSection] Reviews loaded successfully via apiClient:', responseData.count);
        } else if (Array.isArray(responseData)) { // Fallback si devuelve directamente el array
             console.warn('[TestimonialsSection] apiClient devolvió un array directamente.');
             setReviews(responseData);
        } else {
            console.warn('[TestimonialsSection] Unexpected response format via apiClient:', responseData);
            throw new Error('Formato de respuesta inesperado del servidor.');
        }

      } catch (err) {
        // El interceptor de apiClient ya debería formatear el error
        console.error("[TestimonialsSection] Error fetching reviews via apiClient:", err);
        // Usar el mensaje del error formateado por el interceptor si existe
        setError(err.message || 'Ocurrió un error al obtener las reseñas.');
        setReviews([]); // Limpiar reseñas en caso de error
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []); // Ejecutar solo al montar

  // Autoplay
  useEffect(() => {
    if (isLoading || reviews.length <= 1) return; // No autoplay si carga o hay 0/1 reseñas

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % reviews.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isLoading, reviews.length]); // Depender de isLoading y reviews.length

  // Detectar cuando la sección está en el viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const goToPrevious = () => {
    if (reviews.length === 0) return;
    setCurrentIndex(prevIndex => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    if (reviews.length === 0) return;
    setCurrentIndex(prevIndex => (prevIndex + 1) % reviews.length);
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
  }

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <section className="py-24 bg-[var(--color-cream-light)] text-center">
        <div className="container-custom">
          <p className="text-xl text-[var(--color-accent)]">Cargando reseñas...</p>
          {/* Podríamos añadir un spinner aquí */}
        </div>
      </section>
    );
  }

  // Mostrar estado de error
  if (error) {
    return (
      <section className="py-24 bg-[var(--color-cream-light)] text-center">
        <div className="container-custom">
          <p className="text-xl text-red-600">Error: {error}</p>
          <p className="text-gray-600 mt-2">No se pudieron cargar las reseñas. Inténtalo de nuevo más tarde.</p>
        </div>
      </section>
    );
  }

  // Mostrar si no hay reseñas
  if (reviews.length === 0) {
    return (
      <section className="py-24 bg-[var(--color-cream-light)] text-center">
        <div className="container-custom">
           <h2 className={`text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-accent)] mb-12 font-light`}>
              Lo Que Dicen <span className="text-[var(--color-primary)] font-semibold">Nuestros Clientes</span>
           </h2>
           <div className="gold-divider mb-12"></div>
          <p className="text-xl text-gray-700 mb-8">Aún no hay reseñas disponibles. ¡Sé el primero en compartir tu experiencia!</p>
           {/* Botón para añadir reseña */}
           <Link
             href="/write-review"
             className="inline-flex items-center justify-center px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-black font-bold text-lg rounded-md transition-colors duration-300"
           >
             Escribe tu Reseña
           </Link>
        </div>
      </section>
    );
  }

  // Obtener la reseña actual una vez que sabemos que reviews no está vacío
  const currentReview = reviews[currentIndex];

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-[var(--color-cream-light)] relative overflow-hidden"
      id="testimonials" // Añadir ID para posible navegación interna
    >
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-[var(--color-primary-20)] opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-[var(--color-primary-20)] opacity-50"></div>

      {/* Elemento decorativo centrado */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-2 border-[var(--color-primary-5)] pointer-events-none opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[var(--color-primary-10)] pointer-events-none opacity-30"></div>

      <div className="container-custom relative">
        <div className="text-center mb-20">
          <h2 className={`text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-accent)] mb-12 font-light transition-all duration-1000 transform ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Lo Que Dicen <span className="text-[var(--color-primary)] font-semibold">Nuestros Clientes</span>
          </h2>
          <div className={`gold-divider transition-all duration-700 delay-100 transform ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}></div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Comilla decorativa */}
          <div className="absolute -top-12 left-0 text-[120px] text-[var(--color-primary-10)] pointer-events-none z-[1] opacity-50">
            <FaQuoteRight />
          </div>

          {/* Testimonial */}
          {currentReview && ( // Asegurarse que currentReview existe
            <div
              ref={slideRef}
              // Usar key para forzar re-render en cambio de slide y permitir animación
              key={currentIndex}
              className={`relative z-10 animate-fadeIn ${isInView ? '' : 'opacity-0'}`} // Animación simple de entrada
            >
              <div className="bg-white p-12 border-decorative shadow-xl">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* --- Contenido principal (nombre, rol, estrellas, comentario) --- */}
                  <div className="w-full flex flex-col items-center lg:items-start text-center lg:text-left">
                     <h3 className="text-xl font-[var(--font-display)] text-[var(--color-accent)] mb-1">
                       {currentReview.name}
                     </h3>
                     <p className="text-sm text-gray-500 mb-4 italic">
                       {currentReview.role || 'Cliente'} {/* Rol por defecto */}
                     </p>
                    {/* Mostrar estrellas basado en rating */}
                     <div className="flex space-x-1 text-[var(--color-primary)] mb-4">
                      {currentReview.rating && currentReview.rating > 0 ? (
                        [...Array(Math.min(Math.max(currentReview.rating, 1), 5))].map((_, i) => ( // Asegurar rating entre 1 y 5
                          <FaStar key={i} />
                        ))
                      ) : (
                         // Mostrar estrellas grises si no hay rating o es 0
                        [...Array(5)].map((_, i) => (
                           <FaStar key={i} className="text-gray-300"/>
                        ))
                      )}
                     </div>
                    <p className="text-xl md:text-2xl font-[var(--font-display)] text-gray-700 font-light italic leading-relaxed">
                      "{currentReview.comment || currentReview.quote || 'No hay comentario.'}" {/* Campo comentario o quote */}
                    </p>
                  </div>
                </div>
              </div>

              {/* Indicadores y controles */}
              <div className="flex justify-center items-center mt-12 space-x-8">
                <button
                  onClick={goToPrevious}
                  className="w-12 h-12 rounded-full border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Testimonio anterior"
                  disabled={reviews.length <= 1}
                >
                  <FaChevronLeft />
                </button>

                <div className="flex space-x-3">
                  {reviews.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToIndex(index)} // Usar goToIndex
                      className={`h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'w-10 bg-[var(--color-primary)]'
                          : 'w-3 bg-[var(--color-primary-30)] hover:bg-[var(--color-primary-50)]'
                      }`}
                      aria-label={`Ir al testimonio ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={goToNext}
                  className="w-12 h-12 rounded-full border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Siguiente testimonio"
                  disabled={reviews.length <= 1}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

         {/* Botón para añadir reseña (alternativa: al final de la sección) */}
         <div className="text-center mt-20">
           <Link
             href="/write-review"
             className="inline-flex items-center justify-center px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-black font-bold text-lg rounded-md transition-colors duration-300 shadow-md hover:shadow-lg"
           >
             Escribe tu Reseña
             <FaQuoteRight className="ml-2 h-4 w-4 opacity-80" />
           </Link>
         </div>

      </div>
    </section>
  );
}
// Añadir animación simple de fadeIn
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
`;
// Inject styles (consider moving to a global CSS or styled-components if preferred)
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
} 