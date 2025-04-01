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
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[var(--color-accent)]/40 z-0"></div>
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
        
        <div className="relative z-10 container-custom flex flex-col md:flex-row items-center justify-between">
          {/* SVG Flores Izquierda */}
          <div className="w-full md:w-4/12 flex-shrink-0">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 600 600" style={{ transform: 'rotate(90deg)' }} className="w-full h-auto">
              <g>
                <g>
                  <path style={{ fill: '#8B0516' }} d="M538.281,369.396c0.44,1.499,0.856,2.917,1.062,4.382c0.091,0.637,0.556,1.159,1.181,1.324
                    c0.134,0.034,0.27,0.05,0.403,0.05c0.492,0,0.967-0.228,1.274-0.631c4.145-5.46,7.293-14.29,7.832-21.977
                    c0.289-4.123-0.492-7.178-2.386-9.336c-0.995-1.143-2.261-1.556-3.401-1.118c-0.679,0.272-1.082,0.778-1.295,1.043
                    c-5.488,6.831-7.443,16.32-5.102,24.763L538.281,369.396z M545.233,345.308c0.003,0,0.005,0.003,0.006,0.006
                    c1.287,1.468,1.827,3.823,1.604,7.006c-0.4,5.707-2.433,12.288-5.196,17.198c-0.097-0.344-0.197-0.684-0.297-1.021l-0.419-1.456
                    C538.887,359.669,540.546,351.398,545.233,345.308z"/>
                  <path style={{ fill: '#8B0516' }} d="M529.447,366.941c0.07,0.003,0.141,0.006,0.209,0.006c0.851,0,1.634-0.325,2.274-0.946
                    c1.682-1.637,2.363-5.407,2.143-11.86c-0.225-6.606-2.8-12.397-7.07-15.892c-0.286-0.234-0.95-0.703-1.907-0.771
                    c-0.754,0.012-1.805,0.372-2.529,1.999c-2.068,4.685-2.246,10.435-0.429,16.42C523.749,361.234,525.878,366.725,529.447,366.941z
                     M525.395,341.082c3.305,2.945,5.294,7.706,5.48,13.165c0.295,8.643-1.218,9.499-1.234,9.502
                    c-0.187-0.012-1.901-0.353-4.513-9.011C523.674,349.946,523.726,345.208,525.395,341.082z"/>
                  <path style={{ fill: '#8B0516' }} d="M683.893,405.378c0.931,0.54,1.723,1.003,2.276,1.359c2.549,1.649,5.546,3.504,8.858,4.648
                    c0.525,0.181,1.701,0.587,3.031,0.587c0.859,0,1.784-0.169,2.638-0.678c2.41-1.431,2.811-4.588,2.14-7.087
                    c-1.424-5.307-6.18-8.764-10.162-11.182c-0.002,0-0.002,0-0.002,0c-5.38-3.258-12.197-6.828-17.193-5.544
                    c-1.802,0.465-3.186,1.521-4.112,3.133C668.149,396.217,678.003,401.952,683.893,405.378z M674.14,392.207
                    c0.495-0.862,1.174-1.381,2.138-1.627c0.45-0.116,0.937-0.169,1.451-0.169c4.449,0,10.977,3.951,13.284,5.35
                    c3.472,2.105,7.604,5.066,8.735,9.277c0.356,1.328,0.236,2.961-0.686,3.508c-0.609,0.356-1.587,0.3-2.991-0.184
                    c-2.974-1.028-5.775-2.764-8.166-4.31c-0.584-0.378-1.42-0.865-2.404-1.437C681.947,400.546,672.506,395.052,674.14,392.207z"/>
                  <path style={{ fill: '#8B0516' }} d="M629.254,380.031c-0.67,2.196-1.126,14.377,2.988,16.776c0.386,0.225,0.94,0.447,1.632,0.447
                    c0.984,0,2.246-0.447,3.689-1.965c5.867-6.181,2.11-23.22,0.782-27.443c-0.189-0.603-0.712-1.034-1.337-1.109
                    c-0.625-0.094-1.234,0.222-1.559,0.762C633.086,371.417,630.642,375.471,629.254,380.031z"/>
                  <path style={{ fill: '#8B0516' }} d="M654.018,353.107c0.37,0.072,0.751,0.106,1.137,0.106c1.585,0,3.258-0.59,4.737-1.696
                    c0.954-0.715,1.609-1.477,1.997-2.327c0.829-1.802,0.476-4.089-0.967-6.266c-0.679-1.025-1.402-1.777-2.21-2.302
                    c-0.002,0-0.002-0.003-0.003-0.003c-2.799-1.812-6.208-0.275-8.463,1.765c-0.395,0.356-0.965,0.918-1.348,1.677
                    c-0.673,1.334-0.65,2.999,0.065,4.691C649.928,351.027,651.865,352.695,654.018,353.107z"/>
                </g>
              </g>
            </svg>
          </div>
          
          {/* Texto Central */}
          <div className="w-full md:w-4/12 my-8 md:my-0 flex-shrink-0 text-center">
            <div className="bg-white/80 px-8 py-6 rounded-xl shadow-md mb-6 backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-[#8B0516] mb-4">
                Su Evento <span className="font-semibold">Perfecto</span>
              </h2>
              <p className="text-lg text-[#3A3330] mb-4">
                Reserve su fecha especial y déjenos crear una experiencia inolvidable 
                diseñada exclusivamente para usted
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center bg-white/90 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <div className="w-8 h-8 flex items-center justify-center mr-2">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                      <path d="M12,2 C6.48,2 2,6.48 2,12 C2,17.52 6.48,22 12,22 C17.52,22 22,17.52 22,12 C22,6.48 17.52,2 12,2 Z M12,20 C7.59,20 4,16.41 4,12 C4,7.59 7.59,4 12,4 C16.41,4 20,7.59 20,12 C20,16.41 16.41,20 12,20 Z M12.5,7 L11,7 L11,13 L16.25,16.15 L17,14.92 L12.5,12.25 L12.5,7 Z" fill="#8B0516" opacity="0.8" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#3A3330]">Respuesta Rápida</span>
                </div>
                
                <div className="flex items-center bg-white/90 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <div className="w-8 h-8 flex items-center justify-center mr-2">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                      <path d="M21,6 L19,6 L19,15 L6,15 L6,17 C6,17.55 6.45,18 7,18 L18,18 L22,22 L22,7 C22,6.45 21.55,6 21,6 Z M17,12 L17,3 C17,2.45 16.55,2 16,2 L3,2 C2.45,2 2,2.45 2,3 L2,17 L6,13 L16,13 C16.55,13 17,12.55 17,12 Z" fill="#8B0516" opacity="0.8" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#3A3330]">Atención Personalizada</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* SVG Flores Derecha */}
          <div className="w-full md:w-4/12 flex-shrink-0">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 600 600" style={{ transform: 'rotate(-90deg)' }} className="w-full h-auto">
              <g>
                <g>
                  <path style={{ fill: '#8B0516' }} d="M538.281,369.396c0.44,1.499,0.856,2.917,1.062,4.382c0.091,0.637,0.556,1.159,1.181,1.324
                    c0.134,0.034,0.27,0.05,0.403,0.05c0.492,0,0.967-0.228,1.274-0.631c4.145-5.46,7.293-14.29,7.832-21.977
                    c0.289-4.123-0.492-7.178-2.386-9.336c-0.995-1.143-2.261-1.556-3.401-1.118c-0.679,0.272-1.082,0.778-1.295,1.043
                    c-5.488,6.831-7.443,16.32-5.102,24.763L538.281,369.396z M545.233,345.308c0.003,0,0.005,0.003,0.006,0.006
                    c1.287,1.468,1.827,3.823,1.604,7.006c-0.4,5.707-2.433,12.288-5.196,17.198c-0.097-0.344-0.197-0.684-0.297-1.021l-0.419-1.456
                    C538.887,359.669,540.546,351.398,545.233,345.308z"/>
                  <path style={{ fill: '#8B0516' }} d="M678.834,481.791c0.497,0.325,1.206,0.634,2.101,0.634c0.475,0,1.004-0.087,1.581-0.306
                    c4.69-1.771,9.2-6.047,12.606-9.573c2.408-2.493,4.204-4.866,5.49-7.262c2.492-4.648,3.347-9.836,4.174-14.855
                    c0.518-3.158,1.057-6.425,2.001-9.452c0.212-0.681-0.055-1.424-0.653-1.815c-0.601-0.393-1.387-0.331-1.926,0.134
                    c-2.73,2.383-5.83,4.535-8.83,6.616c-5.683,3.945-11.56,8.024-15.472,13.987c-1.571,2.396-2.827,5.11-3.732,8.071
                    c-0.404,1.327-0.859,3.089-0.767,4.913C675.489,474.5,675.979,479.923,678.834,481.791z"/>
                  <path style={{ fill: '#8B0516' }} d="M580.707,420.193c0.597-1.568,0.437-3.258-0.462-4.888c-3.551-6.447-17.974-3.842-22.309-2.892
                    c-9,1.968-17.301,6.872-23.368,13.809c-0.326,0.372-0.461,0.875-0.365,1.362c0.097,0.487,0.412,0.9,0.854,1.121
                    c4.192,2.093,9.016,3.139,14.34,3.139c5.781,0,12.149-1.234,18.928-3.695l0.8-0.284
                    C572.622,426.627,579.135,424.325,580.707,420.193z M568.057,424.85l-0.825,0.294c-6.08,2.207-14.071,4.157-21.802,3.261
                    c10.176-1.02,20.174-3.283,29.81-6.781C573.006,423.085,569.892,424.2,568.057,424.85z M577.718,419.053
                    c-0.125,0.326-0.325,0.642-0.572,0.95c-0.564,0.255-1.138,0.5-1.719,0.712c-10.734,3.943-21.931,6.302-33.323,7.137
                    c-0.418-0.097-0.823-0.266-1.238-0.384c0.209-0.136,0.422-0.27,0.629-0.406c2.875-1.865,5.591-3.626,8.802-4.713
                    c3.745-1.271,7.745-1.809,11.613-2.33c2.791-0.372,6.141-0.584,9.381-0.784c2.205-0.139,4.418-0.294,6.516-0.487
                    C577.781,418.858,577.751,418.965,577.718,419.053z M571.242,418.434c-3.255,0.203-6.619,0.415-9.438,0.79
                    c-3.906,0.525-7.946,1.071-11.763,2.368c-3.306,1.118-6.063,2.908-8.982,4.801c-0.393,0.254-0.801,0.507-1.199,0.762
                    c-0.465-0.153-0.942-0.253-1.399-0.434c5.454-5.575,12.535-9.517,20.159-11.185h0.001c7.778-1.699,16.986-2.018,18.824,1.312
                    c0.237,0.433,0.334,0.79,0.38,1.109C575.722,418.152,573.461,418.295,571.242,418.434z"/>
                  <path style={{ fill: '#8B0516' }} d="M497.768,394.808c0.8,2.243,3.161,3.876,6.016,4.16c0.35,0.037,0.7,0.053,1.048,0.053
                    c2.789,0,5.433-1.062,7.484-2.027c4.437-2.083,8.549-4.782,12.342-8.121c2.494-2.196,7.685-6.766,6.359-10.795
                    c-1.259-3.823-6.314-3.408-9.659-3.117c-0.593,0.05-1.132,0.094-1.571,0.106c-2.772,0.072-5.086,0.259-7.37,0.95
                    c-5.093,1.534-9.542,5.469-13.226,11.694c-0.896,1.513-1.949,3.669-1.691,5.883c-0.008,0.047-0.038,0.086-0.028,0.136
                    c0.006,0.031,0.033,0.048,0.044,0.075C497.567,394.14,497.648,394.474,497.768,394.808z M527.979,379.079
                    c0.305,0.924-0.392,2.955-5.554,7.499c-3.448,3.036-7.306,5.566-11.471,7.525c-2.054,0.968-4.476,1.93-6.851,1.687
                    c-1.337-0.134-2.883-0.821-3.322-2.055c-0.052-0.142-0.031-0.303-0.053-0.454c2.482-0.89,4.798-2.243,7.054-3.572
                    c0.946-0.556,1.893-1.115,2.849-1.637c1.46-0.793,2.989-1.527,4.467-2.24c1.601-0.768,3.256-1.562,4.84-2.443
                    c2.628-1.462,5.112-3.188,7.524-4.884C527.708,378.657,527.901,378.838,527.979,379.079z M501.943,389.342
                    c2.243-3.792,6.041-8.649,11.399-10.264c1.941-0.587,4.014-0.75,6.528-0.812c0,0,0,0,0.002,0c0.489-0.013,1.09-0.063,1.754-0.119
                    c0.801-0.066,1.872-0.156,2.909-0.156c0.723,0,1.413,0.056,2.001,0.181c-2.252,1.58-4.56,3.169-6.987,4.517
                    c-1.562,0.868-3.206,1.659-4.798,2.421c-1.487,0.715-3.025,1.456-4.502,2.261c-0.964,0.525-1.918,1.087-2.872,1.649
                    c-2.144,1.262-4.348,2.536-6.672,3.405C500.851,391.351,501.431,390.207,501.943,389.342z"/>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </section>
    </main>
  );
} 