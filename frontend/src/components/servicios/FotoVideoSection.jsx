import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCamera, FaVideo, FaCheck } from 'react-icons/fa';

const FotoVideoSection = () => {
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
                  src="/images/servicio-fotografia.jpg" 
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
                  src="/images/servicio-video.jpg" 
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
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div key={num} className="relative h-48 rounded-lg overflow-hidden">
                <Image 
                  src={`/images/ejemplo-foto-${num}.jpg`} 
                  alt={`Ejemplo de fotografía ${num}`} 
                  layout="fill"
                  objectFit="cover"
                  className="hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Testimonios */}
        <div className="mb-16">
          <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6 text-center">
            Lo que dicen nuestros clientes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonios.map((testimonio, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image 
                      src={`/images/testimonio-${index + 1}.jpg`} 
                      alt={testimonio.nombre} 
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--color-brown-dark)]">{testimonio.nombre}</h4>
                    <p className="text-sm text-[var(--color-brown-text)]">{testimonio.evento}</p>
                  </div>
                </div>
                <p className="text-[var(--color-brown-text)] italic">"{testimonio.comentario}"</p>
              </motion.div>
            ))}
          </div>
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

const testimonios = [
  {
    nombre: "María y Carlos",
    evento: "Boda - Marzo 2025",
    comentario: "Las fotografías quedaron espectaculares. Capturaron cada momento especial de nuestra boda y el video es una verdadera obra de arte."
  },
  {
    nombre: "Alejandra Rodríguez",
    evento: "XV Años - Enero 2025",
    comentario: "El equipo de foto y video fue muy profesional. Las fotos son hermosas y el video superó nuestras expectativas."
  },
  {
    nombre: "Familia Hernández",
    evento: "Aniversario - Febrero 2025",
    comentario: "Contratamos el servicio para nuestro aniversario de bodas y quedamos encantados con el resultado. Recomendamos ampliamente."
  }
];

export default FotoVideoSection;
