"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUsers, FaChevronRight, FaCheck, FaRegClock, FaExclamationTriangle } from 'react-icons/fa';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createEventoReservation, checkEventoAvailability, getEventoOccupiedDates } from '@/services/reservationService';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

// Importar componentes
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Tipos de eventos disponibles
const tiposEvento = [
  {
    id: 'boda',
    titulo: 'Boda',
    descripcion: 'Ceremonias inolvidables en un entorno de ensueño',
    imagen: '/images/placeholder/gallery1.svg',
    capacidad: '50-300',
    precio: 'Desde $50,000'
  },
  {
    id: 'corporativo',
    titulo: 'Corporativo',
    descripcion: 'Reuniones ejecutivas, conferencias y presentaciones',
    imagen: '/images/placeholder/gallery2.svg',
    capacidad: '20-200',
    precio: 'Desde $35,000'
  },
  {
    id: 'cumpleanos',
    titulo: 'Cumpleaños',
    descripcion: 'Celebraciones especiales con amigos y familia',
    imagen: '/images/placeholder/gallery3.svg',
    capacidad: '30-250',
    precio: 'Desde $40,000'
  },
  {
    id: 'aniversario',
    titulo: 'Aniversario',
    descripcion: 'Conmemora tus momentos más importantes',
    imagen: '/images/placeholder/gallery1.svg',
    capacidad: '30-150',
    precio: 'Desde $30,000'
  }
];

export default function ReservarPage() {
  const [formData, setFormData] = useState({
    tipoEvento: '',
    fecha: null,
    invitados: 50,
    nombre: '',
    email: '',
    telefono: '',
    comentarios: ''
  });
  
  const [paso, setPaso] = useState(1);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [fechasOcupadas, setFechasOcupadas] = useState([]);
  
  // Cargar fechas ocupadas desde el backend al montar el componente
  useEffect(() => {
    const cargarFechasOcupadas = async () => {
      try {
        // Obtener fechas ocupadas de eventos
        const fechas = await getEventoOccupiedDates();
        if (Array.isArray(fechas) && fechas.length > 0) {
          // Convertir a fechas simples para el calendario
          const fechasSimples = fechas.map(item => item.fecha);
          setFechasOcupadas(fechasSimples);
        }
      } catch (error) {
        console.error("Error al cargar fechas ocupadas:", error);
        toast.error("No se pudieron cargar las fechas ocupadas");
      }
    };
    
    cargarFechasOcupadas();
  }, []);
  
  const handleSelectTipoEvento = (tipo) => {
    setFormData(prev => ({ ...prev, tipoEvento: tipo }));
    setPaso(2);
    // Hacer scroll suave hacia la siguiente sección
    document.getElementById('paso-2').scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleFechaChange = (date) => {
    setFechaSeleccionada(date);
    setFormData(prev => ({ ...prev, fecha: date }));
  };
  
  const handleInvitadosChange = (e) => {
    const valor = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, invitados: valor }));
  };
  
  const handleProceedToPaso3 = () => {
    setPaso(3);
    document.getElementById('paso-3').scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    
    try {
      // Convertir el tipo de evento para el backend
      const tipoSeleccionado = tiposEvento.find(t => t.id === formData.tipoEvento);
      
      // Validar los datos obligatorios
      if (!tipoSeleccionado || !formData.fecha || formData.invitados < 10 || !formData.nombre || !formData.email || !formData.telefono) {
        setSubmitError('Por favor, completa todos los campos obligatorios. El número mínimo de invitados es 10.');
        toast.error('Faltan datos obligatorios');
        setIsSubmitting(false);
        return;
      }
      
      // Formatear fecha para el backend (si no es un objeto Date)
      const fechaEvento = formData.fecha instanceof Date ? formData.fecha : new Date(formData.fecha);
      
      // Extraer nombre y apellidos del campo nombre completo
      const nombreCompleto = formData.nombre.trim().split(' ');
      const nombre = nombreCompleto[0] || '';
      // Asegurar que apellidos no esté vacío
      const apellidos = nombreCompleto.slice(1).join(' ') || nombre; // Usar nombre como apellido si no hay apellido
      
      try {
        // Verificar disponibilidad primero
        const disponibilidadData = {
          fechaEvento: fechaEvento.toISOString().split('T')[0],
          horaInicio: '12:00',
          horaFin: '18:00',
          espacioSeleccionado: 'Jardín Principal'
        };
        
        const disponibilidadResponse = await checkEventoAvailability(disponibilidadData);
        console.log('Respuesta de disponibilidad:', disponibilidadResponse);
        
        // Verificar si la respuesta es undefined o no tiene la estructura esperada
        if (!disponibilidadResponse || !disponibilidadResponse.success || 
            !disponibilidadResponse.disponible || !disponibilidadResponse.disponible.disponible) {
          
          // Extraer el mensaje de error de la respuesta correctamente
          let mensaje = 'El espacio no está disponible para la fecha y hora seleccionadas';
          
          if (disponibilidadResponse && disponibilidadResponse.disponible && disponibilidadResponse.disponible.mensaje) {
            mensaje = disponibilidadResponse.disponible.mensaje;
          } else if (disponibilidadResponse && disponibilidadResponse.message) {
            mensaje = disponibilidadResponse.message;
          }
            
          setSubmitError(`No se puede reservar: ${mensaje}`);
          toast.error('Horario no disponible');
          setIsSubmitting(false);
          
          // Agregar la fecha a fechasOcupadas si no está ya
          const fechaNueva = new Date(fechaEvento);
          fechaNueva.setHours(0, 0, 0, 0);
          
          // Verificar si la fecha ya está en el array de fechas ocupadas
          const yaExiste = fechasOcupadas.some(f => 
            f.getDate() === fechaNueva.getDate() && 
            f.getMonth() === fechaNueva.getMonth() && 
            f.getFullYear() === fechaNueva.getFullYear()
          );
          
          if (!yaExiste) {
            setFechasOcupadas(prev => [...prev, fechaNueva]);
          }
          
          return;
        }
        
        // Si está disponible, crear la reserva
        const reservaData = {
          nombreEvento: `${tipoSeleccionado.titulo} - ${formData.nombre}`,
          tipoEvento: tipoSeleccionado.titulo,
          nombreContacto: nombre,
          apellidosContacto: apellidos,
          emailContacto: formData.email,
          telefonoContacto: formData.telefono,
          fecha: fechaEvento,
          horaInicio: '12:00',
          horaFin: '18:00',
          espacioSeleccionado: 'Jardín Principal',
          numeroInvitados: parseInt(formData.invitados),
          peticionesEspeciales: formData.comentarios || '',
          presupuestoEstimado: parseInt(tipoSeleccionado.precio.replace(/[^0-9]/g, '')) || 0
        };
        
        console.log('Enviando datos de reserva:', reservaData);
        
        // Enviar al backend
        const response = await createEventoReservation(reservaData);
        console.log('Respuesta del servidor:', response);
        
        // Guardar datos de confirmación
        setConfirmationData(response.data);
        
        // Avanzar al paso de confirmación
        setPaso(4);
        
        // Esperar a que el componente se renderice antes de hacer scroll
        setTimeout(() => {
          const paso4Element = document.getElementById('paso-4');
          if (paso4Element) {
            paso4Element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        
      } catch (apiError) {
        console.error('Error en la API:', apiError);
        let errorMessage = 'Error desconocido al procesar la solicitud';
        
        if (apiError.status) {
          // Este es un error formateado por nuestro interceptor de apiClient
          errorMessage = apiError.message || errorMessage;
        } else if (apiError.response && apiError.response.data) {
          // Error de respuesta de axios tradicional
          errorMessage = apiError.response.data.message || errorMessage;
        } else if (apiError.message) {
          // Error general con mensaje
          errorMessage = apiError.message;
        }
        
        setSubmitError(`Error del servidor: ${errorMessage}`);
        toast.error('Error al procesar la reserva. Contacte a soporte técnico.');
      }
    } catch (error) {
      console.error('Error general al crear reserva:', error);
      setSubmitError('Ha ocurrido un error al procesar su reserva. Por favor, inténtelo de nuevo o contacte con nosotros directamente.');
      toast.error('Error al procesar la reserva: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Deshabilitar fechas pasadas y fechas ocupadas
  const esDisponible = (date) => {
    // Deshabilitar fechas pasadas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (date < hoy) return false;
    
    // Deshabilitar días ocupados
    return !fechasOcupadas.some(fechaOcupada => 
      date.getDate() === fechaOcupada.getDate() && 
      date.getMonth() === fechaOcupada.getMonth() && 
      date.getFullYear() === fechaOcupada.getFullYear()
    );
  };
  
  return (  
    <>
    <Navbar />
    <main className="min-h-screen bg-[var(--color-cream-light)]">
      {/* Hero section con imagen de fondo */}
      <section className="relative h-[85vh] min-h-[700px] flex items-center justify-center pt-32">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/reserve.png"
            alt="Hacienda San Carlos - Reservaciones"
            fill
            sizes="100vw"
            className="object-cover transform scale-[1.15] animate-ken-burns"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[var(--color-accent)]/60 to-black/50 z-0"></div>
        </div>
        
        {/* Overlay decorativo */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
        </div>
        
        {/* Medallón decorativo */}
        <div 
          className="absolute top-[140px] md:top-[150px] lg:top-[180px] left-[10px] md:left-[40px] lg:left-[80px] transform z-20 pointer-events-none w-[180px] h-[180px] md:w-[220px] md:h-[220px] lg:w-[260px] lg:h-[260px] hidden sm:block"
          style={{ 
            transition: 'transform 0.4s ease-out, opacity 0.4s ease-out'
          }}
        >
          <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Definiciones para filtros */}
            <defs>
              <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="black" floodOpacity="0.8" />
              </filter>
            </defs>
            
            {/* Fondo semitransparente del medallón */}
            <circle cx="250" cy="250" r="225" fill="rgba(0,0,0,0.3)" />
            
            {/* Círculos decorativos externos */}
            <circle cx="250" cy="250" r="245" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="8,8" opacity="0.3" />
            <circle cx="250" cy="250" r="230" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" />
            
            {/* Forma de medallón radiante */}
            <path d="M250,30 
                   C330,30 400,90 430,170
                   C460,250 440,350 370,410
                   C300,470 200,470 130,410
                   C60,350 40,250 70,170
                   C100,90 170,30 250,30 Z" 
                fill="none" stroke="#800020" strokeWidth="2" opacity="0.5" />
            
            {/* Adorno medallón interno */}
            <circle cx="250" cy="250" r="150" fill="none" stroke="#800020" strokeWidth="1" opacity="0.3" />
            <circle cx="250" cy="250" r="120" fill="none" stroke="#800020" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
            
            {/* Rayos decorativos */}
            <line x1="250" y1="100" x2="250" y2="25" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="100" y1="250" x2="25" y2="250" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="250" y1="400" x2="250" y2="475" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="400" y1="250" x2="475" y2="250" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="175" y1="175" x2="125" y2="125" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="325" y1="175" x2="375" y2="125" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="175" y1="325" x2="125" y2="375" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="325" y1="325" x2="375" y2="375" stroke="#800020" strokeWidth="1" opacity="0.5" />
            
            {/* Elementos decorativos de celebración */}
            <path d="M250,180 
                   C270,150 310,150 310,180 
                   C310,210 250,240 250,240 
                   C250,240 190,210 190,180 
                   C190,150 230,150 250,180 Z" 
                fill="none" stroke="#800020" strokeWidth="2" opacity="0.6" />
            
            {/* Calendario decorativo */}
            <rect x="200" y="270" width="100" height="90" rx="5" fill="none" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.8" />
            <line x1="220" y1="270" x2="220" y2="260" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.8" />
            <line x1="280" y1="270" x2="280" y2="260" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.8" />
            <line x1="200" y1="295" x2="300" y2="295" stroke="#FFFAF0" strokeWidth="1" opacity="0.6" />
            <text x="250" y="330" textAnchor="middle" fontFamily="serif" fontSize="32" fill="#FFFAF0" fontWeight="bold" opacity="0.9" filter="url(#textShadow)">
              ✓
            </text>
            
            {/* Texto elegante en el centro */}
            <g transform="translate(250, 200)">
              <text textAnchor="middle" fontFamily="serif" fontSize="26" fill="#FFFAF0" fontWeight="light" opacity="0.95" letterSpacing="3" filter="url(#textShadow)">
                RESERVA
              </text>
            </g>
          </svg>
        </div>
        
        <div className="relative z-10 container-custom text-center text-white">
          {/* Decorador superior elegante */}
          <div className="flex flex-col items-center mb-6 md:mb-8 animate-delay-100">
            <div className="w-24 md:w-32 lg:w-40 h-[1px] bg-[var(--color-primary)] mx-auto mb-3"></div>
            <div className="relative inline-block mb-2 text-sm md:text-base uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--color-primary)] font-extrabold z-10 transform-style-preserve-3d">
              <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "white", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(10px)", display: "inline-block"}}>
                Eventos Exclusivos
              </span>
              <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -6px -6px round 6px)' }}></div>
            </div>
            <div className="relative inline-block text-base md:text-lg text-white tracking-wide font-medium drop-shadow-[0_0_3px_rgba(110,70,20,0.9)] z-10">
              Celebraciones Inolvidables
              <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -8px -6px round 6px)' }}></div>
            </div>
            <div className="w-24 md:w-32 lg:w-40 h-[1px] bg-[var(--color-primary)] mx-auto mt-3"></div>
          </div>
          
          {/* Título principal - Reserve su Evento */}
          <div className="relative inline-block mb-8 z-10 w-full text-center perspective-[1000px]">
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-[var(--font-display)] leading-tight tracking-tight relative px-3 md:px-4 mb-6 inline-block transform-style-preserve-3d"
            >
              <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Reserve su</span> <span className="font-bold text-[var(--color-primary)] transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>Evento</span>
              <div className="absolute inset-0 filter blur-[8px] bg-white/15 -z-10" style={{ clipPath: 'inset(-15px -25px -35px -25px round 16px)' }}></div>
            </motion.h1>
          </div>
          
          {/* Subtítulo debajo del título principal */}
          <div className="relative inline-block text-lg sm:text-xl md:text-2xl font-[var(--font-display)] font-medium mb-12 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto z-10 tracking-wide px-4 text-center perspective-[1000px]">
            <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Haga realidad su evento soñado en nuestra exclusiva hacienda. Seleccione una fecha y deje que nuestro </span><span className="font-bold transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "white", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>equipo</span><span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]"> se encargue de todos los detalles.</span>
            <div className="absolute inset-0 filter blur-[6px] bg-white/15 -z-10" style={{ clipPath: 'inset(-10px -20px -25px -20px round 10px)' }}></div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            <a 
              href="#paso-1" 
              className="px-10 py-4 bg-[var(--color-primary)] text-white text-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors inline-block shadow-xl transform hover:scale-105 transition-transform duration-300"
            >
              Comenzar Reservación
            </a>
          </motion.div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-48 h-48 border border-[var(--color-primary)]/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-40 w-20 h-20 border border-[var(--color-primary)]/40 rounded-full animate-pulse delay-500"></div>
      </section>
      
      {/* Sistema de reservas en pasos */}
      <div className="py-16 relative z-10 bg-[var(--color-cream-light)]">
        {/* Indicador de progreso */}
        <div className="container-custom mb-16">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center mb-4 md:mb-0">
                <div 
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold border-2 transition-all ${
                    paso >= stepNum 
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' 
                      : 'bg-white text-gray-500 border-gray-300'
                  }`}
                >
                  {paso > stepNum ? <FaCheck className="text-white" /> : stepNum}
                </div>
                
                <span className={`ml-3 font-medium transition-colors ${
                  paso >= stepNum ? 'text-[var(--color-primary)]' : 'text-gray-500'
                }`}>
                  {stepNum === 1 ? 'Tipo de Evento' : 
                   stepNum === 2 ? 'Fecha y Detalles' : 
                   stepNum === 3 ? 'Sus Datos' :
                   'Confirmación'}
                </span>
                
                {stepNum < 4 && (
                  <div className="hidden md:block w-12 border-t-2 border-gray-300 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Paso 1: Selección de tipo de evento */}
        <section id="paso-1" className="container-custom mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
              Elija su <span className="text-[var(--color-primary)] font-semibold">Tipo de Evento</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-700">
              Seleccione el tipo de evento que desea realizar en nuestra hacienda
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tiposEvento.map((tipo, index) => (
              <motion.div 
                key={tipo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`relative overflow-hidden cursor-pointer group shadow-xl transition-all duration-500 ${
                  formData.tipoEvento === tipo.id ? 'ring-2 ring-[var(--color-primary)] scale-105' : ''
                } ${paso > 1 && formData.tipoEvento !== tipo.id ? 'opacity-50' : ''}`}
                onMouseEnter={() => setHoveredCard(tipo.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleSelectTipoEvento(tipo.id)}
              >
                <div className="relative h-60">
                  <Image 
                    src={tipo.imagen}
                    alt={tipo.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className={`object-cover transition-transform duration-700 ${
                      hoveredCard === tipo.id ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-[var(--font-display)] mb-2 shadow-text-strong">{tipo.titulo}</h3>
                  <p className="text-white/90 text-sm mb-2 shadow-text line-clamp-2">{tipo.descripcion}</p>
                  
                  <div className="flex justify-between items-center pt-2 opacity-90">
                    <div className="flex items-center space-x-1 text-xs">
                      <FaUsers className="text-[var(--color-primary)]" />
                      <span>{tipo.capacidad} invitados</span>
                    </div>
                    <div className="text-sm font-medium">{tipo.precio}</div>
                  </div>
                </div>
                
                {formData.tipoEvento === tipo.id && (
                  <div className="absolute top-3 right-3 w-7 h-7 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                    <FaCheck className="text-white text-sm" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Paso 2: Selección de fecha y detalles */}
        <section id="paso-2" className={`container-custom mb-24 transition-opacity duration-500 ${paso >= 2 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={paso >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
              Seleccione la <span className="text-[var(--color-primary)] font-semibold">Fecha y Detalles</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-700">
              Elija la fecha para su {formData.tipoEvento && tiposEvento.find(t => t.id === formData.tipoEvento).titulo.toLowerCase()} y el número de invitados
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calendario */}
            <div className="bg-white p-8 shadow-xl">
              <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-accent)] mb-6 text-center">Seleccionar Fecha</h3>
              
              <div className="mb-8">
                <div 
                  className="relative cursor-pointer border border-gray-300 p-4 rounded-lg flex items-center"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                >
                  <FaCalendarAlt className="text-[var(--color-primary)] mr-3" />
                  <input 
                    type="text"
                    className="w-full border-none focus:outline-none pointer-events-none bg-transparent"
                    value={fechaSeleccionada ? fechaSeleccionada.toLocaleDateString() : 'Seleccionar fecha'}
                    readOnly
                  />
                  <FaChevronRight className={`transition-transform duration-300 ${isCalendarOpen ? 'rotate-90' : ''}`} />
                </div>
                
                <div className={`mt-2 transition-all duration-300 overflow-hidden ${isCalendarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 border border-gray-200 rounded-lg shadow-md">
                    <DatePicker
                      selected={fechaSeleccionada}
                      onChange={handleFechaChange}
                      inline
                      filterDate={esDisponible}
                      minDate={new Date()}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between items-center mt-4 text-xs text-gray-500 border-t border-gray-200 pt-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-[var(--color-primary)]/20 border border-[var(--color-primary)] mr-2"></div>
                        <span>Disponible</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-200 border border-gray-300 mr-2"></div>
                        <span>No disponible</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-6 text-sm">
                <div className="flex items-center text-[var(--color-primary)]">
                  <FaRegClock className="mr-2" />
                  <span>Horario disponible: 9:00 AM - 11:00 PM</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Invitados
                </label>
                <div className="relative">
                  <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-primary)]" />
                  <input 
                    type="number"
                    name="invitados"
                    value={formData.invitados}
                    onChange={handleInvitadosChange}
                    min="10"
                    max="300"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Mínimo: 10 invitados</span>
                  <span>Máximo: 300 invitados</span>
                </div>
              </div>
            </div>
            
            {/* Resumen */}
            <div className="bg-[var(--color-accent)] text-white p-8 shadow-xl">
              <h3 className="text-2xl font-[var(--font-display)] mb-6 text-center">Resumen de su Evento</h3>
              
              {formData.tipoEvento && (
                <div className="space-y-6">
                  <div className="p-4 border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10">
                    <h4 className="text-xl font-[var(--font-display)] mb-4">
                      {tiposEvento.find(t => t.id === formData.tipoEvento).titulo}
                    </h4>
                    <p className="text-white/80 mb-4">
                      {tiposEvento.find(t => t.id === formData.tipoEvento).descripcion}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--color-primary)]">Precio:</span>
                        <p className="font-medium">{tiposEvento.find(t => t.id === formData.tipoEvento).precio}</p>
                      </div>
                      <div>
                        <span className="text-[var(--color-primary)]">Capacidad:</span>
                        <p className="font-medium">{tiposEvento.find(t => t.id === formData.tipoEvento).capacidad} invitados</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 p-4 border border-white/20">
                    <div className="flex justify-between">
                      <span className="text-white/80">Fecha seleccionada:</span>
                      <span className="font-medium">{fechaSeleccionada ? fechaSeleccionada.toLocaleDateString() : 'No seleccionada'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Número de invitados:</span>
                      <span className="font-medium">{formData.invitados}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleProceedToPaso3}
                    disabled={!fechaSeleccionada}
                    className={`w-full py-4 px-6 text-center font-medium text-lg transition-all duration-300 ${
                      fechaSeleccionada 
                        ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] cursor-pointer' 
                        : 'bg-gray-500 cursor-not-allowed opacity-70'
                    }`}
                  >
                    Continuar
                  </button>
                  
                  {!fechaSeleccionada && (
                    <p className="text-center text-sm text-[var(--color-primary)]/80 mt-2">
                      Por favor, seleccione una fecha para continuar.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Paso 3: Información personal */}
        <section id="paso-3" className={`container-custom mb-24 transition-opacity duration-500 ${paso >= 3 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={paso >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
              Complete sus <span className="text-[var(--color-primary)] font-semibold">Datos</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-700">
              Proporcione su información de contacto para confirmar su reserva
            </p>
          </motion.div>
          
          <div className="max-w-2xl mx-auto bg-white p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios o peticiones especiales
                </label>
                <textarea
                  id="comentarios"
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                ></textarea>
              </div>
              
              <div className="mt-10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-[var(--color-primary)] text-white py-4 text-lg font-medium transition-colors rounded-lg shadow-lg ${
                    isSubmitting 
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:bg-[var(--color-primary-dark)]'
                  }`}
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
                </button>
                
                {submitError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
                    <FaExclamationTriangle className="flex-shrink-0 mt-1 mr-2" />
                    <p>{submitError}</p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>
        
        {/* Paso 4: Confirmación - Solo se muestra cuando paso es 4 */}
        {paso === 4 && (
          <section id="paso-4" className="container-custom mb-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: 'auto' }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto text-center bg-white p-12 shadow-xl"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-8">
                <FaCheck className="text-green-600 text-3xl" />
              </div>
              
              <h2 className="text-4xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
                ¡Reserva Enviada!
              </h2>
              
              <p className="text-xl text-gray-700 mb-8">
                Gracias por su interés en la Hacienda San Carlos. Hemos recibido su solicitud de reserva y nos pondremos en contacto con usted a la brevedad.
              </p>
              
              <div className="bg-gray-50 p-6 mb-8 text-left rounded-lg">
                <h3 className="text-lg font-medium mb-4 text-[var(--color-primary)]">Detalles de su reserva:</h3>
                
                <div className="space-y-2 text-gray-700">
                  <p><strong>Número de confirmación:</strong> {confirmationData?.numeroConfirmacion || 'Pendiente'}</p>
                  <p><strong>Tipo de evento:</strong> {formData.tipoEvento && tiposEvento.find(t => t.id === formData.tipoEvento).titulo}</p>
                  <p><strong>Fecha:</strong> {formData.fecha && formData.fecha.toLocaleDateString()}</p>
                  <p><strong>Invitados:</strong> {formData.invitados}</p>
                  <p><strong>Nombre:</strong> {formData.nombre}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Teléfono:</strong> {formData.telefono}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8">
                Un representante se comunicará con usted en un plazo máximo de 24 horas para confirmar la disponibilidad y proporcionarle más información.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/"
                  className="px-8 py-3 bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors rounded-lg"
                >
                  Volver a inicio
                </Link>
                
                <button
                  onClick={() => window.print()}
                  className="px-8 py-3 bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-dark)] transition-colors rounded-lg"
                >
                  Imprimir detalles
                </button>
              </div>
            </motion.div>
          </section>
        )}
      </div>
      
      {/* Sección decorativa con flores SVG */}
      <section className="relative py-16 bg-[var(--color-cream-light)] overflow-hidden">
        {/* Fondo con gradiente suave */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F4F1] via-[#F5EDE8] to-[#F8F4F1] opacity-90"></div>
        
        <div className="relative z-10 container-custom">
          {/* Estructura SVG - texto - SVG */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
            {/* Primer bloque SVG (izquierda) */}
            <div className="w-full md:w-1/3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 800 600" className="w-full h-auto" style={{ fill: '#8B0516' }}>
                <g>
                  <path d="M538.281,369.396c0.44,1.499,0.856,2.917,1.062,4.382c0.091,0.637,0.556,1.159,1.181,1.324
                    c0.134,0.034,0.27,0.05,0.403,0.05c0.492,0,0.967-0.228,1.274-0.631c4.145-5.46,7.293-14.29,7.832-21.977
                    c0.289-4.123-0.492-7.178-2.386-9.336c-0.995-1.143-2.261-1.556-3.401-1.118c-0.679,0.272-1.082,0.778-1.295,1.043
                    c-5.488,6.831-7.443,16.32-5.102,24.763L538.281,369.396z"/>
                  <path d="M529.447,366.941c0.07,0.003,0.141,0.006,0.209,0.006c0.851,0,1.634-0.325,2.274-0.946
                    c1.682-1.637,2.363-5.407,2.143-11.86c-0.225-6.606-2.8-12.397-7.07-15.892c-0.286-0.234-0.95-0.703-1.907-0.771
                    c-0.754,0.012-1.805,0.372-2.529,1.999c-2.068,4.685-2.246,10.435-0.429,16.42C523.749,361.234,525.878,366.725,529.447,366.941z"/>
                  <path d="M683.893,405.378c0.931,0.54,1.723,1.003,2.276,1.359c2.549,1.649,5.546,3.504,8.858,4.648
                    c0.525,0.181,1.701,0.587,3.031,0.587c0.859,0,1.784-0.169,2.638-0.678c2.41-1.431,2.811-4.588,2.14-7.087
                    c-1.424-5.307-6.18-8.764-10.162-11.182c-0.002,0-0.002,0-0.002,0c-5.38-3.258-12.197-6.828-17.193-5.544
                    c-1.802,0.465-3.186,1.521-4.112,3.133C668.149,396.217,678.003,401.952,683.893,405.378z"/>
                  <path d="M580.707,420.193c0.597-1.568,0.437-3.258-0.462-4.888c-3.551-6.447-17.974-3.842-22.309-2.892
                    c-9,1.968-17.301,6.872-23.368,13.809c-0.326,0.372-0.461,0.875-0.365,1.362c0.097,0.487,0.412,0.9,0.854,1.121
                    c4.192,2.093,9.016,3.139,14.34,3.139c5.781,0,12.149-1.234,18.928-3.695l0.8-0.284
                    C572.622,426.627,579.135,424.325,580.707,420.193z"/>
                  <path d="M497.768,394.808c0.8,2.243,3.161,3.876,6.016,4.16c0.35,0.037,0.7,0.053,1.048,0.053
                    c2.789,0,5.433-1.062,7.484-2.027c4.437-2.083,8.549-4.782,12.342-8.121c2.494-2.196,7.685-6.766,6.359-10.795
                    c-1.259-3.823-6.314-3.408-9.659-3.117c-0.593,0.05-1.132,0.094-1.571,0.106c-2.772,0.072-5.086,0.259-7.37,0.95
                    c-5.093,1.534-9.542,5.469-13.226,11.694c-0.896,1.513-1.949,3.669-1.691,5.883c-0.008,0.047-0.038,0.086-0.028,0.136
                    c0.006,0.031,0.033,0.048,0.044,0.075C497.567,394.14,497.648,394.474,497.768,394.808z"/>
                  <path d="M629.254,380.031c-0.67,2.196-1.126,14.377,2.988,16.776c0.386,0.225,0.94,0.447,1.632,0.447
                    c0.984,0,2.246-0.447,3.689-1.965c5.867-6.181,2.11-23.22,0.782-27.443c-0.189-0.603-0.712-1.034-1.337-1.109
                    c-0.625-0.094-1.234,0.222-1.559,0.762C633.086,371.417,630.642,375.471,629.254,380.031z"/>
                  <path d="M654.018,353.107c0.37,0.072,0.751,0.106,1.137,0.106c1.585,0,3.258-0.59,4.737-1.696
                    c0.954-0.715,1.609-1.477,1.997-2.327c0.829-1.802,0.476-4.089-0.967-6.266c-0.679-1.025-1.402-1.777-2.21-2.302
                    c-0.002,0-0.002-0.003-0.003-0.003c-2.799-1.812-6.208-0.275-8.463,1.765c-0.395,0.356-0.965,0.918-1.348,1.677
                    c-0.673,1.334-0.65,2.999,0.065,4.691C649.928,351.027,651.865,352.695,654.018,353.107z"/>
                  <path d="M678.834,481.791c0.497,0.325,1.206,0.634,2.101,0.634c0.475,0,1.004-0.087,1.581-0.306
                    c4.69-1.771,9.2-6.047,12.606-9.573c2.408-2.493,4.204-4.866,5.49-7.262c2.492-4.648,3.347-9.836,4.174-14.855
                    c0.518-3.158,1.057-6.425,2.001-9.452c0.212-0.681-0.055-1.424-0.653-1.815c-0.601-0.393-1.387-0.331-1.926,0.134
                    c-2.73,2.383-5.83,4.535-8.83,6.616c-5.683,3.945-11.56,8.024-15.472,13.987c-1.571,2.396-2.827,5.11-3.732,8.071
                    c-0.404,1.327-0.859,3.089-0.767,4.913C675.489,474.5,675.979,479.923,678.834,481.791z"/>
                  <path d="M466.502,351.144c0.37,0.072,0.751,0.106,1.137,0.106c1.585,0,3.258-0.59,4.737-1.696
                    c0.954-0.715,1.609-1.477,1.997-2.327c0.829-1.802,0.476-4.089-0.967-6.266c-0.679-1.025-1.402-1.777-2.21-2.302
                    c-0.002,0-0.002-0.003-0.003-0.003c-2.799-1.812-6.208-0.275-8.463,1.765c-0.395,0.356-0.965,0.918-1.348,1.677
                    c-0.673,1.334-0.65,2.999,0.065,4.691C462.412,349.064,464.349,350.732,466.502,351.144z"/>
                  <path d="M553.742,371.433c0.44,1.499,0.856,2.917,1.062,4.382c0.091,0.637,0.556,1.159,1.181,1.324
                    c0.134,0.034,0.27,0.05,0.403,0.05c0.492,0,0.967-0.228,1.274-0.631c4.145-5.46,7.293-14.29,7.832-21.977
                    c0.289-4.123-0.492-7.178-2.386-9.336c-0.995-1.143-2.261-1.556-3.401-1.118c-0.679,0.272-1.082,0.778-1.295,1.043
                    c-5.488,6.831-7.443,16.32-5.102,24.763L553.742,371.433z"/>
                  <path d="M644.908,435.23c0.597-1.568,0.437-3.258-0.462-4.888c-3.551-6.447-17.974-3.842-22.309-2.892
                    c-9,1.968-17.301,6.872-23.368,13.809c-0.326,0.372-0.461,0.875-0.365,1.362c0.097,0.487,0.412,0.9,0.854,1.121
                    c4.192,2.093,9.016,3.139,14.34,3.139c5.781,0,12.149-1.234,18.928-3.695l0.8-0.284
                    C636.823,441.664,643.336,439.362,644.908,435.23z"/>
                  <path d="M589.167,477.792c0.497,0.325,1.206,0.634,2.101,0.634c0.475,0,1.004-0.087,1.581-0.306
                    c4.69-1.771,9.2-6.047,12.606-9.573c2.408-2.493,4.204-4.866,5.49-7.262c2.492-4.648,3.347-9.836,4.174-14.855
                    c0.518-3.158,1.057-6.425,2.001-9.452c0.212-0.681-0.055-1.424-0.653-1.815c-0.601-0.393-1.387-0.331-1.926,0.134
                    c-2.73,2.383-5.83,4.535-8.83,6.616c-5.683,3.945-11.56,8.024-15.472,13.987c-1.571,2.396-2.827,5.11-3.732,8.071
                    c-0.404,1.327-0.859,3.089-0.767,4.913C585.822,470.501,586.312,475.924,589.167,477.792z"/>
                </g>
              </svg>
            </div>
            
            {/* Texto central */}
            <div className="w-full md:w-1/3 bg-white/80 px-6 py-6 rounded-xl shadow-md backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-[#8B0516] mb-4 text-center">
                Su Evento <span className="font-semibold">Perfecto</span>
              </h2>
              <p className="text-lg text-[#3A3330] mb-4 text-center">
                Reserve su fecha especial y déjenos crear una experiencia inolvidable 
                diseñada exclusivamente para usted
              </p>
              <div className="flex justify-center mt-4">
                <Link
                  href="/contacto"
                  className="px-6 py-2 bg-[#8B0516] text-white font-medium hover:bg-[#6b0411] transition-colors rounded-lg"
                >
                  Contáctenos
                </Link>
              </div>
            </div>
            
            {/* Segundo bloque SVG (derecha) */}
            <div className="w-full md:w-1/3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 800 600" className="w-full h-auto" style={{ fill: '#8B0516' }}>
                <g>
                  <path d="M654.018,353.107c0.37,0.072,0.751,0.106,1.137,0.106c1.585,0,3.258-0.59,4.737-1.696
                    c0.954-0.715,1.609-1.477,1.997-2.327c0.829-1.802,0.476-4.089-0.967-6.266c-0.679-1.025-1.402-1.777-2.21-2.302
                    c-0.002,0-0.002-0.003-0.003-0.003c-2.799-1.812-6.208-0.275-8.463,1.765c-0.395,0.356-0.965,0.918-1.348,1.677
                    c-0.673,1.334-0.65,2.999,0.065,4.691C649.928,351.027,651.865,352.695,654.018,353.107z"/>
                  <path d="M683.893,405.378c0.931,0.54,1.723,1.003,2.276,1.359c2.549,1.649,5.546,3.504,8.858,4.648
                    c0.525,0.181,1.701,0.587,3.031,0.587c0.859,0,1.784-0.169,2.638-0.678c2.41-1.431,2.811-4.588,2.14-7.087
                    c-1.424-5.307-6.18-8.764-10.162-11.182c-0.002,0-0.002,0-0.002,0c-5.38-3.258-12.197-6.828-17.193-5.544
                    c-1.802,0.465-3.186,1.521-4.112,3.133C668.149,396.217,678.003,401.952,683.893,405.378z"/>
                  <path d="M629.254,380.031c-0.67,2.196-1.126,14.377,2.988,16.776c0.386,0.225,0.94,0.447,1.632,0.447
                    c0.984,0,2.246-0.447,3.689-1.965c5.867-6.181,2.11-23.22,0.782-27.443c-0.189-0.603-0.712-1.034-1.337-1.109
                    c-0.625-0.094-1.234,0.222-1.559,0.762C633.086,371.417,630.642,375.471,629.254,380.031z"/>
                  <path d="M678.834,481.791c0.497,0.325,1.206,0.634,2.101,0.634c0.475,0,1.004-0.087,1.581-0.306
                    c4.69-1.771,9.2-6.047,12.606-9.573c2.408-2.493,4.204-4.866,5.49-7.262c2.492-4.648,3.347-9.836,4.174-14.855
                    c0.518-3.158,1.057-6.425,2.001-9.452c0.212-0.681-0.055-1.424-0.653-1.815c-0.601-0.393-1.387-0.331-1.926,0.134
                    c-2.73,2.383-5.83,4.535-8.83,6.616c-5.683,3.945-11.56,8.024-15.472,13.987c-1.571,2.396-2.827,5.11-3.732,8.071
                    c-0.404,1.327-0.859,3.089-0.767,4.913C675.489,474.5,675.979,479.923,678.834,481.791z"/>
                  <path d="M466.502,351.144c0.37,0.072,0.751,0.106,1.137,0.106c1.585,0,3.258-0.59,4.737-1.696
                    c0.954-0.715,1.609-1.477,1.997-2.327c0.829-1.802,0.476-4.089-0.967-6.266c-0.679-1.025-1.402-1.777-2.21-2.302
                    c-0.002,0-0.002-0.003-0.003-0.003c-2.799-1.812-6.208-0.275-8.463,1.765c-0.395,0.356-0.965,0.918-1.348,1.677
                    c-0.673,1.334-0.65,2.999,0.065,4.691C462.412,349.064,464.349,350.732,466.502,351.144z"/>
                  <path d="M553.742,371.433c0.44,1.499,0.856,2.917,1.062,4.382c0.091,0.637,0.556,1.159,1.181,1.324
                    c0.134,0.034,0.27,0.05,0.403,0.05c0.492,0,0.967-0.228,1.274-0.631c4.145-5.46,7.293-14.29,7.832-21.977
                    c0.289-4.123-0.492-7.178-2.386-9.336c-0.995-1.143-2.261-1.556-3.401-1.118c-0.679,0.272-1.082,0.778-1.295,1.043
                    c-5.488,6.831-7.443,16.32-5.102,24.763L553.742,371.433z"/>
                  <path d="M644.908,435.23c0.597-1.568,0.437-3.258-0.462-4.888c-3.551-6.447-17.974-3.842-22.309-2.892
                    c-9,1.968-17.301,6.872-23.368,13.809c-0.326,0.372-0.461,0.875-0.365,1.362c0.097,0.487,0.412,0.9,0.854,1.121
                    c4.192,2.093,9.016,3.139,14.34,3.139c5.781,0,12.149-1.234,18.928-3.695l0.8-0.284
                    C636.823,441.664,643.336,439.362,644.908,435.23z"/>
                  <path d="M589.167,477.792c0.497,0.325,1.206,0.634,2.101,0.634c0.475,0,1.004-0.087,1.581-0.306
                    c4.69-1.771,9.2-6.047,12.606-9.573c2.408-2.493,4.204-4.866,5.49-7.262c2.492-4.648,3.347-9.836,4.174-14.855
                    c0.518-3.158,1.057-6.425,2.001-9.452c0.212-0.681-0.055-1.424-0.653-1.815c-0.601-0.393-1.387-0.331-1.926,0.134
                    c-2.73,2.383-5.83,4.535-8.83,6.616c-5.683,3.945-11.56,8.024-15.472,13.987c-1.571,2.396-2.827,5.11-3.732,8.071
                    c-0.404,1.327-0.859,3.089-0.767,4.913C585.822,470.501,586.312,475.924,589.167,477.792z"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
} 