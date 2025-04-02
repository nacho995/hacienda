"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaRegEnvelope, FaMapMarkerAlt, FaClock, FaInstagram, FaFacebookF, FaPinterestP, FaCheck } from 'react-icons/fa';

export default function ContactPage() {
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores al editar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
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
    
    // Simular envío de formulario
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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
    <main className="min-h-screen pb-20">
      {/* Hero de la página de contacto */}
      <section className="relative h-[100vh] overflow-hidden">
        <Image
          src="/imagenintro.JPG" 
          alt="Contáctanos para tu evento especial"
          fill
          className="object-cover image-zoom"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <motion.h1 
            className="text-white font-[var(--font-display)] text-5xl md:text-6xl lg:text-7xl elegant-reveal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Contacta con Nosotros
          </motion.h1>
          <motion.div 
            className="w-32 h-[1px] bg-[var(--color-primary)] my-6"
            initial={{ width: 0 }}
            animate={{ width: 128 }}
            transition={{ duration: 1, delay: 0.6 }}
          ></motion.div>
          <motion.p 
            className="text-white/90 max-w-2xl font-light tracking-wide text-lg md:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Estamos ansiosos por ayudarte a planificar tu evento perfecto en nuestra hacienda
          </motion.p>
        </div>
      </section>
      
      {/* Información y formulario */}
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
                <div className="bg-[var(--color-primary)] text-white p-3 rounded-full">
                  <FaPhoneAlt />
                </div>
                <div>
                  <p className="font-medium text-lg text-[var(--color-accent)]">Teléfono</p>
                  <p className="mt-1 text-gray-600">+52 (777) 123-4567</p>
                  <p className="text-gray-600">+52 (777) 765-4321</p>
                </div>
              </motion.li>
              
              <motion.li variants={itemAnimation} className="flex items-start space-x-4">
                <div className="bg-[var(--color-primary)] text-white p-3 rounded-full">
                  <FaRegEnvelope />
                </div>
                <div>
                  <p className="font-medium text-lg text-[var(--color-accent)]">Email</p>
                  <p className="mt-1 text-gray-600">eventos@haciendasancarlos.com</p>
                  <p className="text-gray-600">info@haciendasancarlos.com</p>
                </div>
              </motion.li>
              
              <motion.li variants={itemAnimation} className="flex items-start space-x-4">
                <div className="bg-[var(--color-primary)] text-white p-3 rounded-full">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="font-medium text-lg text-[var(--color-accent)]">Ubicación</p>
                  <p className="mt-1 text-gray-600">Camino a la Hacienda #123</p>
                  <p className="text-gray-600">Cuernavaca, Morelos, México</p>
                </div>
              </motion.li>
              
              <motion.li variants={itemAnimation} className="flex items-start space-x-4">
                <div className="bg-[var(--color-primary)] text-white p-3 rounded-full">
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
                          className="w-full px-4 py-3 border border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors duration-300"
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
                          className={`w-full px-4 py-3 border ${errors.tipoEvento ? 'border-red-500' : 'border-gray-300'} focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors duration-300 bg-white`}
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
                          className="w-full px-4 py-3 border border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors duration-300 bg-white"
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
                        className="w-full px-4 py-3 border border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors duration-300"
                        placeholder="Cuéntanos más detalles sobre tu evento..."
                      ></textarea>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full px-8 py-4 bg-[var(--color-primary)] text-white font-medium text-lg uppercase tracking-wider hover:bg-[var(--color-primary-dark)] transition-colors duration-300 flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      
      {/* Mapa y ubicación */}
      <section className="container-custom my-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-[var(--font-display)] text-3xl md:text-4xl text-[var(--color-accent)]">
            Visítanos en Persona
          </h2>
          <div className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto my-6"></div>
          <p className="text-gray-600">
            Te invitamos a conocer nuestra hermosa hacienda. Agenda una cita para un recorrido personalizado y déjate envolver por la magia del lugar.
          </p>
        </motion.div>
        
        <div className="aspect-w-16 aspect-h-9 overflow-hidden shadow-xl">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241398.17088148932!2d-99.33688185!3d18.9242567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce0dd7c39580e9%3A0x1b905f64556dd547!2sCuernavaca%2C%20Morelos%2C%20M%C3%A9xico!5e0!3m2!1ses!2smx!4v1710070868569!5m2!1ses!2smx"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de Hacienda San Carlos"
          ></iframe>
        </div>
      </section>
      
      {/* CTA para otras formas de contacto */}
      <section className="container-custom mt-24 mb-16">
        <div className="bg-[var(--color-primary-5)] p-10 md:p-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-[var(--font-display)] text-3xl md:text-4xl text-[var(--color-accent)] mb-6">
              ¿Prefieres Llamarnos?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-10">
              Si lo prefieres, puedes contactarnos directamente por teléfono o WhatsApp. Estamos disponibles para resolver todas tus dudas y comenzar a planificar tu evento de ensueño.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link 
                href="tel:+527771234567" 
                className="px-8 py-4 bg-[var(--color-primary)] text-white flex items-center justify-center gap-3 hover:bg-[var(--color-primary-dark)] transition-colors duration-300 min-w-[240px]"
              >
                <FaPhoneAlt />
                <span>+52 (777) 123-4567</span>
              </Link>
              
              <Link 
                href="https://wa.me/527771234567"
                className="px-8 py-4 border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center gap-3 hover:bg-[var(--color-primary-5)] transition-colors duration-300 min-w-[240px]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375c-.99-1.576-1.516-3.391-1.516-5.26 0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
                </svg>
                <span>WhatsApp</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
} 