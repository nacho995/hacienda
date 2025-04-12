"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaRegEnvelope, FaMapMarkerAlt, FaClock, FaInstagram, FaFacebookF, FaPinterestP, FaCheck } from 'react-icons/fa';

export default function ContactForm() {
  const [formState, setFormState] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha: '',
    tipoEvento: '',
    invitados: '',
    mensaje: '',
  });
  
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores al editar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Limpiar error de servidor cuando se edita cualquier campo
    if (serverError) {
      setServerError(null);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formState.nombre.trim()) newErrors.nombre = "Por favor ingrese su nombre";
    if (!formState.email.trim()) {
      newErrors.email = "Por favor ingrese su email";
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = "Por favor ingrese un email válido";
    }
    if (!formState.telefono.trim()) newErrors.telefono = "Por favor ingrese su teléfono";
    if (!formState.tipoEvento) newErrors.tipoEvento = "Por favor seleccione un tipo de evento";
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      // Obtener la URL base del backend desde una variable de entorno o usar un valor por defecto
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/contacto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Hubo un problema al enviar el formulario');
      }
      
      // Éxito
      setIsSubmitting(false);
      setSubmitted(true);
      
      // Reiniciar estado después de 5 segundos
      setTimeout(() => {
        setSubmitted(false);
        setFormState({
          nombre: '',
          email: '',
          telefono: '',
          fecha: '',
          tipoEvento: '',
          invitados: '',
          mensaje: '',
        });
      }, 5000);
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setIsSubmitting(false);
      setServerError(error.message || 'Hubo un problema al enviar el formulario. Intente nuevamente más tarde.');
    }
  };
  
  const formAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };
  
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <section className="container-custom mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Información de contacto */}
        <motion.div 
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="border-decorative p-8 md:p-12"
        >
          <motion.h2 
            variants={itemAnimation}
            className="font-[var(--font-display)] text-3xl md:text-4xl mb-8 text-[var(--color-accent)]"
          >
            Información de Contacto
          </motion.h2>
          
          <ul className="space-y-8">
            <motion.li variants={itemAnimation} className="flex items-start space-x-4">
              <div className="bg-[var(--color-brown-medium)] text-white p-3 rounded-full">
                <FaPhoneAlt />
              </div>
              <div>
                <p className="font-medium text-lg text-[var(--color-accent)]">Teléfono</p>
                <p className="mt-1 text-gray-600">+52 (777) 123-4567</p>
                <p className="text-gray-600">+52 (777) 765-4321</p>
              </div>
            </motion.li>
            
            <motion.li variants={itemAnimation} className="flex items-start space-x-4">
              <div className="bg-[var(--color-brown-medium)] text-white p-3 rounded-full">
                <FaRegEnvelope />
              </div>
              <div>
                <p className="font-medium text-lg text-[var(--color-accent)]">Email</p>
                <p className="mt-1 text-gray-600">eventos@haciendasancarlos.com</p>
                <p className="text-gray-600">info@haciendasancarlos.com</p>
              </div>
            </motion.li>
            
            <motion.li variants={itemAnimation} className="flex items-start space-x-4">
              <div className="bg-[var(--color-brown-medium)] text-white p-3 rounded-full">
                <FaMapMarkerAlt />
              </div>
              <div>
                <p className="font-medium text-lg text-[var(--color-accent)]">Ubicación</p>
                <p className="mt-1 text-gray-600">Camino a la Hacienda #123</p>
                <p className="text-gray-600">Cuernavaca, Morelos, México</p>
              </div>
            </motion.li>
            
            <motion.li variants={itemAnimation} className="flex items-start space-x-4">
              <div className="bg-[var(--color-brown-medium)] text-white p-3 rounded-full">
                <FaClock />
              </div>
              <div>
                <p className="font-medium text-lg text-[var(--color-accent)]">Horarios</p>
                <p className="mt-1 text-gray-600">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                <p className="text-gray-600">Sábados: 10:00 AM - 3:00 PM</p>
              </div>
            </motion.li>
          </ul>
          
          <motion.div 
            variants={itemAnimation}
            className="mt-12 border-t border-gray-200 pt-8"
          >
            <p className="font-medium text-lg text-[var(--color-accent)] mb-4">Síguenos</p>
            <div className="flex space-x-4">
              <a href="#" className="bg-[var(--color-accent)] text-white p-3 rounded-full hover:bg-[var(--color-primary)] transition-colors duration-300">
                <FaFacebookF />
              </a>
              <a href="#" className="bg-[var(--color-accent)] text-white p-3 rounded-full hover:bg-[var(--color-primary)] transition-colors duration-300">
                <FaInstagram />
              </a>
              <a href="#" className="bg-[var(--color-accent)] text-white p-3 rounded-full hover:bg-[var(--color-primary)] transition-colors duration-300">
                <FaPinterestP />
              </a>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Formulario de contacto */}
        <motion.div
          variants={formAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="bg-white shadow-xl relative">
            {/* Elemento decorativo del formulario */}
            <div className="absolute -top-4 -left-4 w-20 h-20 border-t-2 border-l-2 border-[var(--color-primary)]"></div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-2 border-r-2 border-[var(--color-primary)]"></div>
            
            <div className="p-8 md:p-12 relative">
              <h2 className="font-[var(--font-display)] text-3xl md:text-4xl mb-2 text-[var(--color-accent)]">
                ¿Listo para Celebrar?
              </h2>
              <p className="text-gray-600 mb-8">
                Cuéntanos sobre el evento que estás planeando y nos pondremos en contacto contigo a la brevedad
              </p>
              
              {submitted ? (
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
                >
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FaCheck className="text-green-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-medium text-green-800 mb-2">¡Mensaje Enviado!</h3>
                  <p className="text-green-700">
                    Gracias por contactarnos. Uno de nuestros organizadores se comunicará contigo pronto.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {serverError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
                      {serverError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nombre" className="block text-gray-700 mb-2">Nombre Completo *</label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formState.nombre}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors duration-300`}
                        placeholder="Tu nombre"
                      />
                      {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors duration-300`}
                        placeholder="tu@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="telefono" className="block text-gray-700 mb-2">Teléfono *</label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formState.telefono}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.telefono ? 'border-red-500' : 'border-gray-300'} focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors duration-300`}
                        placeholder="+52 (777) 123-4567"
                      />
                      {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="fecha" className="block text-gray-700 mb-2">Fecha Tentativa</label>
                      <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        value={formState.fecha}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-[var(--color-brown-medium)] focus:ring-1 focus:ring-[var(--color-brown-medium)] outline-none transition-colors duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="tipoEvento" className="block text-gray-700 mb-2">Tipo de Evento *</label>
                      <select
                        id="tipoEvento"
                        name="tipoEvento"
                        value={formState.tipoEvento}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.tipoEvento ? 'border-red-500' : 'border-gray-300'} focus:border-[var(--color-brown-medium)] focus:ring-1 focus:ring-[var(--color-brown-medium)] outline-none transition-colors duration-300 bg-white`}
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="boda">Boda</option>
                        <option value="aniversario">Aniversario</option>
                        <option value="corporativo">Evento Corporativo</option>
                        <option value="cumpleanos">Cumpleaños</option>
                        <option value="otro">Otro</option>
                      </select>
                      {errors.tipoEvento && <p className="text-red-500 text-sm mt-1">{errors.tipoEvento}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="invitados" className="block text-gray-700 mb-2">Número de Invitados</label>
                      <select
                        id="invitados"
                        name="invitados"
                        value={formState.invitados}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-[var(--color-brown-medium)] focus:ring-1 focus:ring-[var(--color-brown-medium)] outline-none transition-colors duration-300 bg-white"
                      >
                        <option value="">Seleccionar cantidad</option>
                        <option value="1-50">1-50 personas</option>
                        <option value="51-100">51-100 personas</option>
                        <option value="101-150">101-150 personas</option>
                        <option value="151-200">151-200 personas</option>
                        <option value="200+">Más de 200 personas</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="mensaje" className="block text-gray-700 mb-2">Tu Mensaje</label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formState.mensaje}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 focus:border-[var(--color-brown-medium)] focus:ring-1 focus:ring-[var(--color-brown-medium)] outline-none transition-colors duration-300"
                      placeholder="Cuéntanos más detalles sobre tu evento..."
                    ></textarea>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full px-8 py-4 bg-[var(--color-brown-medium)] text-black text-lg uppercase tracking-wider hover:bg-[var(--color-brown-dark)] transition-colors duration-300 flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : "Enviar Mensaje"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 