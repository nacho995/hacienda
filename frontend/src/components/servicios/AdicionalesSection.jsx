import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaMusic, FaGuitar, FaFireAlt, FaShoppingBag, FaCheck } from 'react-icons/fa';

const AdicionalesSection = () => {
  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Introducción */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6">Servicios Adicionales</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-[var(--color-brown-text)]">
              Complementa tu evento con nuestros servicios adicionales para crear una experiencia única y personalizada.
            </p>
          </div>
        </div>

        {/* Audio y DJ */}
        <div className="mb-16">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-full min-h-[300px]">
                <Image 
                  src="/images/servicio-dj.jpg" 
                  alt="Servicio de DJ" 
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <FaMusic className="text-2xl text-[var(--color-brown-dark)]" />
                  <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)]">¿Del paquete de audio que incluye el DJ?</h3>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {servicioDJ.map((item, index) => (
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
            </div>
          </div>
        </div>

        {/* Lista de servicios adicionales */}
        <div className="mb-16">
          <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
            Servicios Adicionales para el Evento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviciosAdicionales.map((servicio, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h4 className="font-semibold text-[var(--color-brown-dark)] mb-3">{servicio.nombre}</h4>
                <p className="text-sm text-[var(--color-brown-text)]">{servicio.descripcion}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-[var(--color-brown-text)] italic">
              **LA CONTRATACIÓN DE CARPAS DEBERÁ DE CONFIRMARSE AL MENOS 2 SEMANAS ANTES DEL EVENTO
              PARA ASEGURAR LA DISPONIBILIDAD.
            </p>
            <p className="text-[var(--color-brown-text)] italic mt-2">
              EN CASO DE REQUERIR, UN SERVICIO ADICIONAL, FAVOR DE NOTIFICARLO A LA BREVEDAD PARA
              INCLUIRLO EN EL PRESUPUESTO
            </p>
          </div>
        </div>

        {/* Opciones de entretenimiento */}
        <div className="mb-16">
          <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6 text-center">
            Opciones de Entretenimiento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opcionesEntretenimiento.map((opcion, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden group">
                <div className="relative h-64">
                  <Image 
                    src={`/images/entretenimiento-${index + 1}.jpg`} 
                    alt={opcion.nombre} 
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                    <div className="p-6 text-white w-full">
                      <div className="flex items-center space-x-3 mb-2">
                        {opcion.icono}
                        <h4 className="text-xl font-[var(--font-display)]">{opcion.nombre}</h4>
                      </div>
                      <p className="text-sm opacity-90">{opcion.descripcion}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referencias */}
        <div className="mb-16">
          <div className="bg-[var(--color-cream-light)] p-8 rounded-xl">
            <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6 text-center">
              Referencias
            </h3>
            
            <p className="text-[var(--color-brown-text)] text-center mb-8">
              Solicitamos revisar parte del Trabajo de nuestros proveedores para que tengas la certeza de que
              trabajamos con los mejores profesionales de la industria:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-[var(--color-primary)]" />
                    <span className="text-[var(--color-brown-medium)]">Foto y video @Tubodaencorto/@Luvinais</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-[var(--color-primary)]" />
                    <span className="text-[var(--color-brown-medium)]">Audio E Iluminación @Mmsoundsystem/@Yaxkinretrodisko</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-[var(--color-primary)]" />
                    <span className="text-[var(--color-brown-medium)]">Decoración @Zahro_bodas / @Eljardinfrancesgaleria</span>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-[var(--color-primary)]" />
                    <span className="text-[var(--color-brown-medium)]">Barra Libre Y Mixología @Mixerbarmx</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-[var(--color-primary)]" />
                    <span className="text-[var(--color-brown-medium)]">Barras De Café Y Puros @Cigars.D77</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-[var(--color-primary)]" />
                    <span className="text-[var(--color-brown-medium)]">Entretenimiento Infantil @Ludopaidos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Llamada a la acción */}
        <div className="text-center">
          <a 
            href="/reservar?servicio=adicionales" 
            className="inline-flex items-center space-x-2 bg-[var(--color-brown-medium)] text-white px-8 py-4 rounded-lg hover:bg-[var(--color-brown-dark)] transition-colors"
          >
            <FaShoppingBag />
            <span>Cotiza servicios adicionales</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Datos de servicios
const servicioDJ = [
  "Expertos en bodas versátiles, dos discos duros con más de 30,000 canciones de todos los géneros, lo que garantiza que nunca dejará de haber música y baile durante tu evento",
  "Cabina de madera o blanca",
  "Sistema de audio profesional Pro HK",
  "Bocinas de alto nivel acústico que al subir los decibeles, no molestan al platicar",
  "Sonorización para cocktail de bienvenida",
  "Sistema de control de luminarias operado por un Ing. En Iluminación para darle un toque especial a tu evento",
  "6 cabezas robóticas tipo Beam 2R",
  "4 estructuras para iluminación",
  "2 luces tipo wash",
  "Micrófono",
  "Cotillón para invitados (dependiendo el número de personas para tu evento)"
];

const serviciosAdicionales = [
  {
    nombre: "Tacos al Pastor",
    descripcion: "Servicio de taquiza con tacos al pastor frescos preparados en el momento. Precio según cantidad requerida."
  },
  {
    nombre: "Carro de Churros",
    descripcion: "Deliciosos churros recién hechos con diferentes opciones de relleno y cobertura. Precio según cantidad requerida."
  },
  {
    nombre: "Carro de Papas",
    descripcion: "Papas a la francesa con variedad de aderezos y toppings. Precio según cantidad requerida."
  },
  {
    nombre: "Mampara de Donas",
    descripcion: "Exhibidor de donas decorativas para que tus invitados disfruten de un dulce postre. Precio según cantidad requerida."
  },
  {
    nombre: "Sandalias y Pantuflas",
    descripcion: "Cómodas opciones para tus invitados después de bailar. Cotiza según modelo (Mínimo 50 pzas)."
  },
  {
    nombre: "Abanicos",
    descripcion: "Abanicos personalizados para tus invitados. Cotiza según modelo (Mínimo 50 pzas)."
  },
  {
    nombre: "Kits Anticruda",
    descripcion: "Kit de recuperación para tus invitados después de la fiesta. Cotiza según modelo (Mínimo 50 pzas)."
  },
  {
    nombre: "Carpas",
    descripcion: "Carpas para eventos al aire libre. Precio depende de las medidas requeridas."
  },
  {
    nombre: "Tarimas",
    descripcion: "Tarimas para escenarios o pistas elevadas. Precio depende de las medidas requeridas."
  },
  {
    nombre: "Carro Shots",
    descripcion: "Servicio de shots variados para animar la fiesta."
  },
  {
    nombre: "Papeles Metálicos",
    descripcion: "Efectos especiales con papeles metálicos para momentos culminantes."
  },
  {
    nombre: "Ludoteca Móvil",
    descripcion: "Entretenimiento infantil con juegos y actividades supervisadas."
  },
  {
    nombre: "Cabina de Fotos",
    descripcion: "Cabina para que tus invitados se lleven un recuerdo fotográfico del evento."
  },
  {
    nombre: "Cotillón",
    descripcion: "Accesorios divertidos para animar la pista de baile."
  },
  {
    nombre: "Ventiladores",
    descripcion: "Ventiladores para eventos en temporada de calor."
  },
  {
    nombre: "Calentadores",
    descripcion: "Calentadores para eventos en temporada de frío."
  },
  {
    nombre: "Trámite Civil",
    descripcion: "Asistencia para realizar el trámite civil de tu boda."
  },
  {
    nombre: "Trámite Religioso",
    descripcion: "Asistencia para el trámite religioso directamente con la parroquia de San Carlos Borromeo."
  }
];

const opcionesEntretenimiento = [
  {
    nombre: "Música en Vivo",
    descripcion: "Mariachi, banda, saxofonista, trío o marimba para ambientar tu evento.",
    icono: <FaGuitar className="text-white text-xl" />
  },
  {
    nombre: "Pirotecnia",
    descripcion: "Espectáculo de pirotecnia fría (no aérea) para momentos especiales.",
    icono: <FaFireAlt className="text-white text-xl" />
  },
  {
    nombre: "Entretenimiento Infantil",
    descripcion: "Ludoteca móvil y actividades para mantener entretenidos a los más pequeños.",
    icono: <FaMusic className="text-white text-xl" />
  }
];

export default AdicionalesSection;
