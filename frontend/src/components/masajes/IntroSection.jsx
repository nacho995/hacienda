"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaLeaf, FaHeart, FaWater } from 'react-icons/fa';

export default function IntroSection({ scrollYProgress }) {
  const sectionRef = useRef(null);

  return (
    <section 
      ref={sectionRef} 
      className="py-20 bg-[var(--color-cream-light)] relative overflow-hidden"
    >
      {/* Elementos decorativos con parallax */}
      <motion.div 
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[var(--color-primary)]/5"
        style={{
          y: useTransform(scrollYProgress, [0, 1], ["100px", "-100px"]),
          x: useTransform(scrollYProgress, [0, 1], ["-50px", "50px"]),
        }}
      ></motion.div>
      
      <motion.div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[var(--color-primary)]/10"
        style={{
          y: useTransform(scrollYProgress, [0, 1], ["150px", "-50px"]),
          x: useTransform(scrollYProgress, [0, 1], ["50px", "-30px"]),
        }}
      ></motion.div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
            El Arte del Bienestar
          </h2>
          <div className="w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-10"></div>
          <p className="text-lg text-gray-700 mb-12 leading-relaxed">
            En Hacienda San Carlos, el bienestar es un pilar fundamental de nuestra filosofía. 
            Nuestro Santuario de Bienestar ofrece una colección de terapias cuidadosamente diseñadas 
            para reconectar con uno mismo en un entorno de lujo rústico y natural.
          </p>
        </div>
        
        {/* Beneficios destacados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center p-8 bg-white shadow-xl relative overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full 
                            transition-transform duration-500 group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaLeaf className="text-3xl text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-accent)] mb-4">Ambiente Natural</h3>
              <p className="text-gray-600">
                Un entorno que fusiona la arquitectura colonial con la naturaleza para crear una atmósfera de serenidad absoluta.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center p-8 bg-white shadow-xl relative overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full 
                            transition-transform duration-500 group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeart className="text-3xl text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-accent)] mb-4">Terapeutas Expertos</h3>
              <p className="text-gray-600">
                Profesionales certificados con experiencia en técnicas tradicionales y modernas para un cuidado excepcional.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center p-8 bg-white shadow-xl relative overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full 
                            transition-transform duration-500 group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaWater className="text-3xl text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-accent)] mb-4">Productos Naturales</h3>
              <p className="text-gray-600">
                Utilizamos exclusivamente productos orgánicos y aceites esenciales puros para tratamientos efectivos y sustentables.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 