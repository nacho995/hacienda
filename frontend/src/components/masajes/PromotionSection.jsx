"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PromotionSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-no-repeat bg-cover">
        <Image
          src="/images/placeholder/spa-promo.svg"
          alt="Promoción especial de masajes"
          fill
          className="object-cover"
        />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-xl bg-white/90 p-8 rounded-lg shadow-lg">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-[var(--font-display)] text-black mb-6"
          >
            Oferta Especial <span className="text-[var(--color-primary)]">para Huéspedes</span>
          </motion.h2>
          
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "120px" }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="h-[2px] bg-[var(--color-primary)] mb-8"
          ></motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-black text-lg mb-10"
          >
            Reserva tu estancia en nuestra hacienda y disfruta de un 20% de descuento 
            en cualquiera de nuestros tratamientos de bienestar. Una experiencia 
            completa para el cuerpo y el alma.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Link
              href="/habitaciones"
              className="inline-block px-8 py-4 bg-[var(--color-primary)] text-white text-lg hover:bg-[var(--color-primary-dark)] transition-colors shadow-xl"
            >
              Reservar Habitación
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 