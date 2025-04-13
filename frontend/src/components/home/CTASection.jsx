"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

export default function CTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  const [formState, setFormState] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipoEvento: '',
    mensaje: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (serverError) setServerError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formState.nombre.trim()) newErrors.nombre = "Nombre requerido";
    if (!formState.email.trim()) {
      newErrors.email = "Email requerido";
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = "Email inválido";
    }
    // --- VALIDACIÓN TELÉFONO MX/ES --- 
    const telefonoLimpio = formState.telefono?.trim().replace(/\s+/g, '') || '';
    const mexicoRegex = /^\d{10}$/;
    const españaRegex = /^[6789]\d{8}$/;
    if (telefonoLimpio && !mexicoRegex.test(telefonoLimpio) && !españaRegex.test(telefonoLimpio)) { 
      newErrors.telefono = "Teléfono inválido (10 dígitos MX o 9 ES)";
    }
    // ---------------------------------
    // Añadir más validaciones si se desea (tipo evento)
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('>>> CTA handleSubmit INICIADO');
    
    // --- VALIDACIÓN TELÉFONO MX/ES (en handleSubmit) ---
    const telefonoLimpioSubmit = formState.telefono?.trim().replace(/\s+/g, '') || '';
    const mexicoRegexSubmit = /^\d{10}$/;
    const españaRegexSubmit = /^[6789]\d{8}$/;
    if (telefonoLimpioSubmit && !mexicoRegexSubmit.test(telefonoLimpioSubmit) && !españaRegexSubmit.test(telefonoLimpioSubmit)) {
        // Añadir error al estado de errores para mostrarlo visualmente
        setErrors(prev => ({ ...prev, telefono: "Teléfono inválido (10 dígitos MX o 9 ES)" }));
        return; // Detener envío si el teléfono es inválido (incluso si es opcional)
    }
    // -----------------------------------------------------

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    setSubmitted(false);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/contacto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Hubo un problema al enviar la solicitud');
      }

      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ nombre: '', email: '', telefono: '', tipoEvento: '', mensaje: '' });
      setErrors({});
      // Opcional: ocultar mensaje de éxito después de unos segundos
      // setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('>>> ERROR en CTA handleSubmit:', error);
      setIsSubmitting(false);
      setServerError(error.message || 'Error enviando. Intente más tarde.');
    }
  };
  
  // Detectar cuando la sección es visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
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
    <section 
      ref={sectionRef} 
      className="py-0 relative overflow-hidden bg-white"
    >
      <div className="relative">
        {/* Fondo con overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/platopresentacion.JPG"
            alt="Exquisita presentación gastronómica de Hacienda San Carlos"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15, 15, 15, 0.75)' }}></div>
        </div>
        
        {/* Patrón decorativo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-primary)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--color-primary)]"></div>
        
        {/* Contenido principal */}
        <div className="relative z-10 py-24 lg:py-32">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Columna izquierda - Contenido */}
              <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'}`}>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-[var(--font-display)] font-light text-white mb-8 leading-tight perspective-[1000px] transform-style-preserve-3d">
                  Haz Realidad <span className="font-semibold transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>El Evento</span> De Tus <span className="font-semibold transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>Sueños</span>
                </h2>
                
                <div className="w-32 h-[1px] bg-[var(--color-primary)] mb-10"></div>
                
                <p className="text-xl text-white/90 font-light mb-10 leading-relaxed">
                  Desde <span className="text-white/100 font-medium">bodas de ensueño</span> hasta <span className="text-white/100 font-medium">eventos corporativos excepcionales</span>, 
                  ponemos a tu disposición un lugar con <span className="text-white/100 font-medium">historia, elegancia y servicio 
                  de clase mundial</span> para crear momentos inolvidables.
                </p>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
                  <div className="flex items-center space-x-4 group hover:transform hover:scale-105 transition-all duration-300">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-black shadow-lg transform group-hover:rotate-3 transition-all duration-300 ring-2 ring-white/10 group-hover:ring-white/30">
                      <FaCalendarAlt className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg group-hover:translate-x-1 transition-transform duration-300">Agenda una visita</h3>
                      <p className="text-white/80 text-sm group-hover:translate-x-1 transition-transform duration-300">Conoce nuestras instalaciones</p>
                    </div>
                  </div>
                  <div className="border-l border-white/20 pl-6 hidden sm:block"></div>
                  <div className="flex items-center space-x-4 group hover:transform hover:scale-105 transition-all duration-300">
                    <div className="w-14 h-14 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center text-black bg-[var(--color-primary)] backdrop-blur-sm shadow-lg transform group-hover:rotate-3 transition-all duration-300">
                      <span className="text-xl font-semibold text-black">15+</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg group-hover:translate-x-1 transition-transform duration-300">Años de experiencia</h3>
                      <p className="text-white/80 text-sm group-hover:translate-x-1 transition-transform duration-300">Creando eventos inolvidables</p>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href="/contact" 
                  className="group inline-flex items-center bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-black px-8 py-4 uppercase tracking-wider text-sm font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300 shadow-lg transform hover:scale-105 rounded-sm border border-white/10 hover:border-white/30"
                >
                  <span className="text-black">Reserva tu fecha</span>
                  <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300 text-black" />
                </Link>
              </div>
              
              {/* Columna derecha - Formulario */}
              <div className={`bg-white p-8 lg:p-12 shadow-2xl border-l-4 border-[var(--color-primary)] transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0'}`}>
                <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
                  Solicita Información
                </h3>
                
                {submitted && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded flex items-center">
                    <FaCheck className="mr-2" /> ¡Solicitud enviada con éxito!
                  </motion.div>
                )}
                {serverError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded flex items-center">
                    <FaExclamationTriangle className="mr-2" /> {serverError}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <input 
                        type="text" 
                        name="nombre"
                        value={formState.nombre}
                        onChange={handleChange}
                        className={`w-full border-b-2 ${errors.nombre ? 'border-red-500' : 'border-gray-300'} py-3 px-4 focus:border-[var(--color-primary)] focus:outline-none transition-colors`}
                        placeholder="Tu nombre"
                      />
                      {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className={`w-full border-b-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} py-3 px-4 focus:border-[var(--color-primary)] focus:outline-none transition-colors`}
                        placeholder="correo@ejemplo.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                      <input 
                        type="tel" 
                        name="telefono"
                        value={formState.telefono}
                        onChange={handleChange}
                        className={`w-full border-b-2 ${errors.telefono ? 'border-red-500' : 'border-gray-300'} py-3 px-4 focus:border-[var(--color-primary)] focus:outline-none transition-colors`}
                        placeholder="Tu teléfono"
                      />
                      {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento</label>
                      <select 
                        name="tipoEvento"
                        value={formState.tipoEvento}
                        onChange={handleChange}
                        className="w-full border-b-2 border-gray-300 py-3 px-4 focus:border-[var(--color-primary)] focus:outline-none transition-colors appearance-none bg-transparent">
                        <option value="">Seleccionar...</option>
                        <option value="boda">Boda</option>
                        <option value="corporativo">Evento Corporativo</option>
                        <option value="social">Evento Social</option>
                        <option value="ceremonia">Ceremonia Religiosa</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                    <textarea 
                      name="mensaje"
                      value={formState.mensaje}
                      onChange={handleChange}
                      className="w-full border-b-2 border-gray-300 py-3 px-4 focus:border-[var(--color-primary)] focus:outline-none transition-colors min-h-[100px]"
                      placeholder="Cuéntanos sobre tu evento..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-dark)] transition-colors tracking-wider uppercase text-sm font-medium ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-black">
                        {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 