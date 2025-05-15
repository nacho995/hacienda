"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';

export default function MapSection() {
  return (
    <>
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
          <div className="w-32 h-[1px] bg-[var(--color-brown-medium)] mx-auto my-6"></div>
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
        <div className="bg-[var(--color-brown-light-5)] p-10 md:p-16 text-center">
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
                href="tel:+527351556114" 
                className="px-8 py-4 bg-[var(--color-brown-medium)] text-black font-bold flex items-center justify-center gap-3 hover:bg-[var(--color-brown-dark)] transition-colors duration-300 min-w-[240px]"
              >
                <FaPhoneAlt className="text-black" />
                <span>+52 735 155 6114</span>
              </Link>
              
              <Link 
                href="https://wa.me/527351556114"
                className="px-8 py-4 border-2 border-[var(--color-brown-medium)] text-black font-bold flex items-center justify-center gap-3 hover:bg-[var(--color-brown-light-5)] transition-colors duration-300 min-w-[240px]"
              >
                <FaWhatsapp className="text-black" />
                <span>WhatsApp</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
} 