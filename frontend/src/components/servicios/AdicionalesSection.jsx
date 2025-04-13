"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaMusic, FaGuitar, FaFireAlt, FaShoppingBag, FaCheck, FaUtensils, FaCamera, FaWineGlassAlt } from 'react-icons/fa';
import { MdOutlineFestival, MdOutlineLocalFlorist } from 'react-icons/md';
import { IoMusicalNotes } from 'react-icons/io5';
import { BsCameraVideo } from 'react-icons/bs';
import { getAllServicios } from '@/services/servicios.service';

// Componente de tarjeta de servicio
const ServicioCard = ({ servicio, index }) => {
  // Determinar el icono según el tipo
  let icon;
  switch (servicio.iconType) {
    case 'restaurante':
      icon = <FaUtensils className="text-[var(--color-brown-dark)] text-xl mr-2" />;
      break;
    case 'decoracion':
      icon = <MdOutlineFestival className="text-[var(--color-brown-dark)] text-xl mr-2" />;
      break;
    case 'musica':
      icon = <IoMusicalNotes className="text-[var(--color-brown-dark)] text-xl mr-2" />;
      break;
    case 'fotografia':
      icon = <FaCamera className="text-[var(--color-brown-dark)] text-xl mr-2" />;
      break;
    case 'video':
      icon = <BsCameraVideo className="text-[var(--color-brown-dark)] text-xl mr-2" />;
      break;
    case 'bebidas':
    case 'barra':
      icon = <FaWineGlassAlt className="text-[var(--color-brown-dark)] text-xl mr-2" />;
      break;
    case 'flores':
      icon = <MdOutlineLocalFlorist className="text-[var(--color-brown-dark)] text-xl mr-2" />;
      break;
    case 'paquete':
      icon = <FaCheck className="text-[var(--color-brown-dark)] text-xl mr-2" />;
      break;
    case 'coctel':
    case 'brunch':
      icon = <FaUtensils className="text-[var(--color-brown-dark)] text-xl mr-2" />;
      break;
    case 'montaje':
      icon = <MdOutlineFestival className="text-[var(--color-brown-dark)] text-xl mr-2" />;
      break;
    case 'coordinacion':
      icon = <FaCheck className="text-[var(--color-brown-dark)] text-xl mr-2" />;
      break;
    default:
      icon = <FaCheck className="text-[var(--color-brown-dark)] text-xl mr-2" />;
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-lg shadow-md border border-[var(--color-brown-light)] hover:shadow-lg transition-all duration-300"
      style={{ borderColor: servicio.color || '#D1B59B' }}
    >
      <div className="flex items-center mb-3">
        {icon}
        <h4 className="font-semibold text-[var(--color-brown-dark)]">{servicio.nombre}</h4>
      </div>
      <p className="text-sm text-[var(--color-brown-text)] mb-3">{servicio.descripcion}</p>
      <p className="text-sm font-medium text-[var(--color-primary)]">{servicio.precio}</p>
      
      {servicio.incluye && servicio.incluye.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--color-cream)]">
          <p className="text-xs font-medium mb-2">Incluye:</p>
          <ul className="text-xs text-[var(--color-brown-text)] max-h-40 overflow-y-auto">
            {servicio.incluye.slice(0, 5).map((item, idx) => (
              <li key={idx} className="flex items-start space-x-1 mb-1">
                <FaCheck className="text-[var(--color-primary)] flex-shrink-0 mt-1" size={10} />
                <span>{item}</span>
              </li>
            ))}
            {servicio.incluye.length > 5 && (
              <li className="text-xs italic text-[var(--color-primary)] mt-2">
                Y {servicio.incluye.length - 5} elementos más...
              </li>
            )}
          </ul>
        </div>
      )}
      
      {servicio.preciosPorRango && servicio.preciosPorRango.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--color-cream)]">
          <p className="text-xs font-medium mb-2">Precios por número de personas:</p>
          <ul className="text-xs text-[var(--color-brown-text)] max-h-40 overflow-y-auto">
            {servicio.preciosPorRango.slice(0, 3).map((rango, idx) => (
              <li key={idx} className="mb-1">
                <span className="font-medium">{rango.rango.min} a {rango.rango.max} personas:</span> {rango.precioFormateado} por persona
              </li>
            ))}
            {servicio.preciosPorRango.length > 3 && (
              <li className="text-xs italic text-[var(--color-primary)] mt-2">
                Ver más rangos de precios...
              </li>
            )}
          </ul>
        </div>
      )}
      
      {servicio.notas && servicio.notas.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--color-cream)]">
          <p className="text-xs font-medium mb-2">Notas importantes:</p>
          <ul className="text-xs text-[var(--color-brown-text)]">
            {servicio.notas.map((nota, idx) => (
              <li key={idx} className="italic mb-1">
                {nota}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

const AdicionalesSection = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para servicios agrupados por categorías
  const [serviciosPorCategoria, setServiciosPorCategoria] = useState({
    paquete_evento: [],
    servicio_adicional: [],
    coctel_brunch: [],
    bebidas: [],
    montaje: [],
    foto_video: [],
    coordinacion: []
  });

  // Cargar servicios desde la API
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        const response = await getAllServicios(); // Obtener la respuesta completa

        // Verificar si la respuesta tiene la estructura esperada y extraer el array
        let serviciosArray = []; 
        if (response && response.success && Array.isArray(response.data)) {
          serviciosArray = response.data;
        } else if (Array.isArray(response)) { 
          // Si la respuesta es directamente el array (menos común pero posible)
          serviciosArray = response;
        } else {
          // Si no es un array o la estructura no es la esperada, lanzar un error o manejarlo
          console.error('Respuesta inesperada de getAllServicios:', response);
          throw new Error('Formato de datos inesperado al cargar servicios.');
        }

        setServicios(serviciosArray); // Guardar el array extraído
        
        // Agrupar servicios por categoría
        const serviciosAgrupados = {
          paquete_evento: [],
          servicio_adicional: [],
          coctel_brunch: [],
          bebidas: [],
          montaje: [],
          foto_video: [],
          coordinacion: []
        };
        
        // Iterar sobre el array extraído
        serviciosArray.forEach(servicio => {
          if (servicio.categoria && serviciosAgrupados[servicio.categoria]) {
            serviciosAgrupados[servicio.categoria].push(servicio);
          }
        });
        
        setServiciosPorCategoria(serviciosAgrupados);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        setError('No se pudieron cargar los servicios. Por favor, inténtelo de nuevo más tarde.');
        setLoading(false);
      }
    };

    fetchServicios();
  }, []);

  // Array de imágenes para la sección de entretenimiento
  const entretenimientoImages = [
    '/Mariachis.png', // Nueva imagen para Música en Vivo
    '/pirotecnia.jpg', // Actualizar imagen para Pirotecnia
    '/ludotecainfantil.jpeg' // Actualizar imagen para Entretenimiento Infantil
  ];

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
                  src="/serviciodedj.jpg"
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
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          ) : (
            <div className="space-y-16">
              {/* Paquetes de Eventos */}
              {serviciosPorCategoria.paquete_evento.length > 0 && (
                <div>
                  <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
                    Paquetes para Eventos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviciosPorCategoria.paquete_evento.map((servicio, index) => (
                      <ServicioCard key={servicio.id} servicio={servicio} index={index} />  
                    ))}
                  </div>
                </div>
              )}
              
              {/* Servicios Adicionales */}
              {serviciosPorCategoria.servicio_adicional.length > 0 && (
                <div>
                  <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
                    Servicios Adicionales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviciosPorCategoria.servicio_adicional.map((servicio, index) => (
                      <ServicioCard key={servicio.id} servicio={servicio} index={index} />  
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cóctel y Brunch */}
              {serviciosPorCategoria.coctel_brunch.length > 0 && (
                <div>
                  <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
                    Opciones de Cóctel y Brunch
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviciosPorCategoria.coctel_brunch.map((servicio, index) => (
                      <ServicioCard key={servicio.id} servicio={servicio} index={index} />  
                    ))}
                  </div>
                </div>
              )}
              
              {/* Bebidas */}
              {serviciosPorCategoria.bebidas.length > 0 && (
                <div>
                  <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
                    Opciones de Bebidas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviciosPorCategoria.bebidas.map((servicio, index) => (
                      <ServicioCard key={servicio.id} servicio={servicio} index={index} />  
                    ))}
                  </div>
                </div>
              )}
              
              {/* Montaje */}
              {serviciosPorCategoria.montaje.length > 0 && (
                <div>
                  <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
                    Opciones de Montaje
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviciosPorCategoria.montaje.map((servicio, index) => (
                      <ServicioCard key={servicio.id} servicio={servicio} index={index} />  
                    ))}
                  </div>
                </div>
              )}
              
              {/* Fotografía y Video */}
              {serviciosPorCategoria.foto_video.length > 0 && (
                <div>
                  <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
                    Servicios de Fotografía y Video
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviciosPorCategoria.foto_video.map((servicio, index) => (
                      <ServicioCard key={servicio.id} servicio={servicio} index={index} />  
                    ))}
                  </div>
                </div>
              )}
              
              {/* Coordinación */}
              {serviciosPorCategoria.coordinacion.length > 0 && (
                <div>
                  <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-8 text-center">
                    Servicios de Coordinación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviciosPorCategoria.coordinacion.map((servicio, index) => (
                      <ServicioCard key={servicio.id} servicio={servicio} index={index} />  
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
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
                    src={entretenimientoImages[index]} // Usar el array de imágenes
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
            className="inline-flex items-center space-x-2 bg-[var(--color-brown-medium)] text-black px-8 py-4 rounded-lg hover:bg-[var(--color-brown-dark)] hover:text-black transition-colors"
          >
            <FaShoppingBag className="text-black" />
            <span>Cotiza servicios adicionales</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Datos de servicios para el DJ (mantenemos esta parte estática ya que es específica)
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
