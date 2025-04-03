"use client";

import { motion } from 'framer-motion';
import { FaLeaf, FaHeart, FaRegGem, FaWater, FaSpa } from 'react-icons/fa';

export default function BenefitsSection() {
  const benefitsData = [
    {
      icon: <FaLeaf className="w-10 h-10 text-[var(--color-primary)]" />,
      title: "Reduce el Estrés",
      description: "Nuestros tratamientos están diseñados para activar tu respuesta de relajación, reduciendo los niveles de cortisol y promoviendo una sensación de calma profunda."
    },
    {
      icon: <FaHeart className="w-10 h-10 text-[var(--color-primary)]" />,
      title: "Bienestar Integral",
      description: "Combinamos técnicas ancestrales con innovaciones modernas para rejuvenecer tu cuerpo, clarificar tu mente y equilibrar tu energía."
    },
    {
      icon: <FaRegGem className="w-10 h-10 text-[var(--color-primary)]" />,
      title: "Experiencia Premium",
      description: "Cada detalle de nuestro spa está cuidadosamente diseñado para ofrecerte un momento de lujo y tranquilidad en un entorno exclusivo."
    },
    {
      icon: <FaWater className="w-10 h-10 text-[var(--color-primary)]" />,
      title: "Productos Naturales",
      description: "Utilizamos solo productos orgánicos de la más alta calidad, con ingredientes naturales que nutren tu piel y respetan el medio ambiente."
    },
    {
      icon: <FaSpa className="w-10 h-10 text-[var(--color-primary)]" />,
      title: "Terapeutas Expertos",
      description: "Nuestro equipo de profesionales altamente capacitados personalizará cada tratamiento según tus necesidades específicas."
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-5)] rounded-full opacity-30 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-primary-5)] rounded-full opacity-30 transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-[var(--font-display)] text-[var(--color-accent)] mb-4"
          >
            Beneficios para Tu Bienestar
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="w-20 h-[2px] bg-[var(--color-primary)] mx-auto mb-6"
          ></motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-700"
          >
            Descubre cómo nuestros tratamientos de spa pueden transformar tu bienestar físico y mental, 
            ofreciéndote una experiencia rejuvenecedora completa.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefitsData.map((benefit, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-[var(--color-accent)] mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <a 
            href="#" 
            className="inline-block bg-[var(--color-primary)] text-white px-8 py-3 rounded-sm hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Agenda Tu Sesión
          </a>
        </motion.div>
      </div>
    </section>
  );
} 