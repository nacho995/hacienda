"use client"; // Necesario para hooks

import React, { useState, useEffect } from 'react'; // Importar hooks
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCamera, FaVideo, FaCheck, FaStar } from 'react-icons/fa';

const FotoVideoSection = () => {
  // Estado para los testimonios, carga y errores
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect para cargar los testimonios al montar el componente
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- CORREGIDO: Construir URL completa del backend --- 
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; // Asumiendo puerto 3001
        
        // Cambiado al endpoint correcto para reviews aprobadas
        const response = await fetch(`${backendUrl}/reviews/approved`); 
        if (!response.ok) {
          // Leer el cuerpo de la respuesta para más detalles del error
          const errorBody = await response.text();
          let errorMsg = `Error ${response.status}: Error al cargar los testimonios.`;
           try { 
               const errorData = JSON.parse(errorBody);
               errorMsg = errorData.message || errorMsg; 
           } catch(e) { 
               if(errorBody.length < 200) { errorMsg += ` Detalles: ${errorBody}`;} 
           }
          console.error("[FotoVideoSection] Fetch error:", errorMsg);
          throw new Error(errorMsg);
        }
        const data = await response.json();
         // Verificar la estructura esperada { success: true, data: [...] }
         if (data && data.success === true && Array.isArray(data.data)) {
           setReviews(data.data);
         } else {
            console.warn('[FotoVideoSection] Unexpected response format:', data);
            throw new Error('Formato de respuesta inesperado del servidor.');
         }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching reviews:", err);
        // Opcional: Mantener datos hardcodeados como fallback en caso de error
        // setReviews(fallbackTestimonios); 
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Introducción */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6">Servicios de Foto y Video</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-[var(--color-brown-text)]">
              Capturamos cada momento especial de tu evento con un equipo profesional de fotógrafos y videógrafos,
              para que puedas revivir esos recuerdos por siempre.
            </p>
          </div>
        </div>

        {/* Sección de Fotografía */}
        <div className="mb-16">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-full min-h-[300px]">
                <Image 
                  src="/fotografia.jpg" 
                  alt="Servicio de Fotografía" 
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <FaCamera className="text-2xl text-[var(--color-brown-dark)]" />
                  <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)]">Fotografía</h3>
                </div>
                
                <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">¿Qué incluye mi paquete de foto?</h4>
                <ul className="space-y-3 mb-6">
                  {serviciosFotografia.map((item, index) => (
                    <motion.li 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-2"
                    >
                      <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                      <span className="text-[var(--color-brown-text)]">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <p className="text-[var(--color-brown-text)]">
                  Tiempo de servicio de 10 a 12 hrs<br />
                  Edición y retoque de material fotográfico<br />
                  Entrega de material en USB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Video */}
        <div className="mb-16">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="order-2 md:order-1 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <FaVideo className="text-2xl text-[var(--color-brown-dark)]" />
                  <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)]">Video</h3>
                </div>
                
                <h4 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">¿Qué incluye mi paquete de video?</h4>
                <ul className="space-y-3 mb-6">
                  {serviciosVideo.map((item, index) => (
                    <motion.li 
                      key={index} 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-2"
                    >
                      <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                      <span className="text-[var(--color-brown-text)]">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="order-1 md:order-2 relative h-full min-h-[300px]">
                <Image 
                  src="/fotografovideo.jpg"
                  alt="Servicio de Video" 
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Galería de ejemplos */}
        <div className="mb-16">
          <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6 text-center">
            Ejemplos de nuestro trabajo
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galeriaEjemplos.map((src, index) => (
              <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                <Image 
                  src={src} 
                  alt={`Ejemplo de fotografía ${index + 1}`} 
                  layout="fill"
                  objectFit="cover"
                  className="hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Testimonios - Ahora desde el estado */}
        <div className="mb-16">
          <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6 text-center">
            Lo que dicen nuestros clientes
          </h3>
          
          {loading && <p className="text-center text-[var(--color-brown-text)]">Cargando testimonios...</p>}
          {error && <p className="text-center text-red-600">Error al cargar testimonios: {error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <motion.div 
                    key={review.id || index} // Usar ID de la review si existe
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white p-6 rounded-lg shadow-md"
                  >
                    <div className="mb-4">
                      <h4 className="font-semibold text-[var(--color-brown-dark)]">{review.name || 'Cliente Anónimo'}</h4>
                      <div className="flex space-x-1 text-[var(--color-primary)] my-2">
                        {review.rating && review.rating > 0 ? (
                          [...Array(Math.min(Math.max(review.rating, 1), 5))].map((_, i) => (
                            <FaStar key={i} />
                          ))
                        ) : (
                          [...Array(5)].map((_, i) => (
                            <FaStar key={i} className="text-gray-300"/>
                          ))
                        )}
                      </div>
                    </div>
                    <p className="text-[var(--color-brown-text)] italic">"{review.comment || review.quote || 'No hay comentario.'}"</p>
                  </motion.div>
                ))
              ) : (
                 <p className="text-center text-[var(--color-brown-text)] col-span-full">No hay testimonios disponibles por el momento.</p>
              )}
            </div>
          )}
        </div>

        {/* Llamada a la acción */}
        <div className="text-center">
          <a 
            href="/reservar?servicio=fotovideo" 
            className="inline-flex items-center space-x-2 bg-[var(--color-brown-medium)] text-white px-8 py-4 rounded-lg hover:bg-[var(--color-brown-dark)] transition-colors"
          >
            <FaCamera />
            <span>Reserva nuestros servicios de foto y video</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Datos de servicios
const serviciosFotografia = [
  "Shooting de novios el mismo día",
  "Shooting con familiares, damas y padrinos",
  "Arreglo de novios",
  "Ceremonia religiosa y civil (siempre y cuando sea el mismo día)",
  "Recepción",
  "Fotógrafos profesionales"
];

const serviciosVideo = [
  "Producción de cortometraje (Tu boda en corto)",
  "Cámaras fotográficas (DSRL) que graban en video y formato HD",
  "Estabilizador de cámara DJI Ronin",
  "Grabadora de audio independiente",
  "Cobertura de arreglo de novios",
  "Llegada de los novios",
  "Making off de sesión fotográfica (mismo día)",
  "Acto religioso y/o civil",
  "Momentos emotivos o importantes de la fiesta",
  "Diferentes clips (Arreglos, civil, sesiones, fiesta, dron)",
  "Entrega de todo el material recopilado en USB",
  "Dron Phantom DJI 4"
];

// Galería de ejemplos (se mantiene la definición)
const galeriaEjemplos = [
  '/ejemplofoto.png',
  '/ejemplofoto1.png',
  '/ejemplofoto2.png',
  '/ejemplofoto3.png',
  '/ejemplofoto4.png',
  '/ejemplofoto5.png',
  '/ejemplofoto6.png',
  '/ejemplofoto7.png',
];

export default FotoVideoSection;
