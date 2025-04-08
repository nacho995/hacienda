"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaPhoneAlt } from 'react-icons/fa';

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
                href="tel:+527771234567" 
                className="px-8 py-4 bg-[var(--color-brown-medium)] text-black font-bold flex items-center justify-center gap-3 hover:bg-[var(--color-brown-dark)] transition-colors duration-300 min-w-[240px]"
              >
                <FaPhoneAlt />
                <span>+52 (777) 123-4567</span>
              </Link>
              
              <Link 
                href="https://wa.me/527771234567"
                className="px-8 py-4 border-2 border-[var(--color-brown-medium)] text-black font-bold flex items-center justify-center gap-3 hover:bg-[var(--color-brown-light-5)] transition-colors duration-300 min-w-[240px]"
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
    </>
  );
} 