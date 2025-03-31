"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUsers, FaChevronRight, FaCheck, FaRegClock } from 'react-icons/fa';

// Importar componentes
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Tipos de eventos disponibles
const tiposEvento = [
  {
    id: 'boda',
    titulo: 'Bodas',
    descripcion: 'Ceremonias inolvidables en un entorno de ensueño',
    imagen: '/images/placeholder/gallery1.svg',
    capacidad: '50-300',
    precio: 'Desde $50,000'
  },
  {
    id: 'corporativo',
    titulo: 'Eventos Corporativos',
    descripcion: 'Reuniones ejecutivas, conferencias y presentaciones',
    imagen: '/images/placeholder/gallery2.svg',
    capacidad: '20-200',
    precio: 'Desde $35,000'
  },
  {
    id: 'social',
    titulo: 'Eventos Sociales',
    descripcion: 'Cumpleaños, aniversarios y celebraciones especiales',
    imagen: '/images/placeholder/gallery3.svg',
    capacidad: '30-250',
    precio: 'Desde $40,000'
  },
  {
    id: 'ceremonia',
    titulo: 'Ceremonias',
    descripcion: 'Ceremonias religiosas y actos solemnes',
    imagen: '/images/placeholder/gallery1.svg',
    capacidad: '30-150',
    precio: 'Desde $30,000'
  }
];

// Fechas no disponibles (simular base de datos)
const fechasOcupadas = [
  new Date(2023, 5, 10),
  new Date(2023, 5, 11),
  new Date(2023, 5, 20),
  new Date(2023, 6, 5),
  new Date(2023, 6, 6),
  new Date(2023, 6, 15),
  new Date(2023, 7, 10),
  new Date(2023, 7, 11)
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
    setPaso(4);
    document.getElementById('paso-4').scrollIntoView({ behavior: 'smooth' });
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
    <main className="min-h-screen bg-[var(--color-cream-light)]">
      {/* Hero section con imagen de fondo */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/placeholder/gallery1.svg"
            alt="Hacienda San Carlos - Reservaciones"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/70 to-[var(--color-accent)]/40 z-0"></div>
        </div>
        
        <div className="relative z-10 container-custom text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-[var(--font-display)] mb-6 shadow-text-strong"
          >
            Reserve su <span className="text-[var(--color-primary)]">Evento</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"
          ></motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-12 shadow-text"
          >
            Haga realidad su evento soñado en nuestra exclusiva hacienda. Seleccione una fecha y deje que nuestro equipo se encargue de todos los detalles.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <a 
              href="#paso-1" 
              className="inline-block bg-[var(--color-primary)] text-white px-10 py-4 text-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg"
            >
              Comenzar Reservación
            </a>
          </motion.div>
        </div>
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
                  className="w-full bg-[var(--color-primary)] text-white py-4 text-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors rounded-lg shadow-lg"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </section>
        
        {/* Paso 4: Confirmación */}
        <section id="paso-4" className={`container-custom transition-opacity duration-500 ${paso >= 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={paso >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
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
      </div>
    </main>
  );
} 