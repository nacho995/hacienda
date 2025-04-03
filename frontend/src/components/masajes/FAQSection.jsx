"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "¿Es necesario reservar con anticipación?",
      answer: "Sí, recomendamos reservar con al menos 24-48 horas de anticipación para garantizar disponibilidad, especialmente durante fines de semana y temporada alta. Puedes reservar por teléfono o a través de nuestro sistema de reservas en línea."
    },
    {
      question: "¿Qué debo llevar para mi sesión de masaje?",
      answer: "No necesitas traer nada especial. Proporcionamos batas, toallas y pantuflas. Solo te recomendamos llegar 15 minutos antes de tu cita para completar un breve cuestionario de salud y prepararte para tu tratamiento."
    },
    {
      question: "¿Puedo cancelar o reprogramar mi cita?",
      answer: "Sí, aceptamos cancelaciones o cambios con al menos 24 horas de anticipación sin cargo. Las cancelaciones con menos de 24 horas pueden estar sujetas a un cargo del 50% del servicio."
    },
    {
      question: "¿Ofrecen paquetes o promociones especiales?",
      answer: "Sí, contamos con diversos paquetes de spa y promociones estacionales. Te recomendamos consultar nuestra sección de promociones o preguntar a nuestro personal sobre las ofertas actuales al momento de tu reserva."
    },
    {
      question: "¿Qué precauciones debo tomar antes y después del masaje?",
      answer: "Antes del masaje, evita comidas pesadas y alcohol. Después, te recomendamos mantenerte hidratado, evitar actividades intensas por algunas horas y, si es posible, continuar el estado de relajación en casa con un baño tibio."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
            Preguntas Frecuentes
          </h2>
          <div className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium text-[var(--color-accent)] mb-3">¿Es necesario reservar con anticipación?</h3>
            <p className="text-gray-600">
              Sí, recomendamos hacer una reserva con al menos 24-48 horas de anticipación para garantizar la disponibilidad de nuestros terapeutas y servicios.
            </p>
          </div>
          
          <div className="border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium text-[var(--color-accent)] mb-3">¿Qué debo usar durante el masaje?</h3>
            <p className="text-gray-600">
              Proporcionamos batas y ropa interior desechable para todos nuestros tratamientos. Nuestros terapeutas están capacitados para preservar tu privacidad en todo momento.
            </p>
          </div>
          
          <div className="border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium text-[var(--color-accent)] mb-3">¿Ofrecen masajes para parejas?</h3>
            <p className="text-gray-600">
              Sí, contamos con una sala especial para masajes en pareja. Esta experiencia incluye dos terapeutas que trabajan simultáneamente en un ambiente romántico.
            </p>
          </div>
          
          <div className="border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium text-[var(--color-accent)] mb-3">¿Hay alguna contraindicación para recibir masajes?</h3>
            <p className="text-gray-600">
              Algunos tratamientos pueden no ser recomendables en casos de embarazo, presión arterial alta, o ciertas condiciones médicas. Por favor, infórmanos sobre cualquier condición de salud al momento de reservar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 