"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
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
          className="text-white text-5xl md:text-6xl lg:text-7xl elegant-reveal font-script"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Contacta con <span style={{ color: 'var(--color-brown-medium)' }}>NOSOTROS</span>
        </motion.h1>
        <motion.div 
          className="w-32 h-[1px] bg-[var(--color-brown-medium)] my-6"
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
          Estamos ansiosos por ayudarte a planificar tu <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-brown-medium)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light)"}}>evento perfecto</span> en nuestra <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-brown-medium)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light)"}}>hacienda</span>
        </motion.p>
      </div>
    </section>
  );
} 