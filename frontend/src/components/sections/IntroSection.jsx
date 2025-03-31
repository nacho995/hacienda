"use client";

import { GiCastle } from 'react-icons/gi';
import { FaHeart, FaGift } from 'react-icons/fa';

export default function IntroSection() {
  return (
    <section id="intro" className="section-padding bg-[var(--color-cream-light)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="elegant-title centered fade-in text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-accent)] mb-12 font-light">
            Un <span className="text-[var(--color-primary)] font-semibold">Legado</span> de Distinción
          </h2>
          <div className="gold-divider fade-in animate-delay-100"></div>
          <p className="text-xl md:text-2xl font-light fade-in animate-delay-200 mt-10 max-w-4xl mx-auto leading-relaxed">
            Hacienda San Carlos Borromeo no es solo un lugar, es la <span className="italic text-[var(--color-primary)]">manifestación de la elegancia clásica mexicana</span> donde los momentos especiales cobran vida en un entorno de incomparable belleza.
          </p>
        </div>
        
        {/* Características destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
          <div className="elegant-card p-10 text-center fade-in animate-delay-100">
            <div className="bg-[var(--color-primary-light)]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <GiCastle className="text-[var(--color-primary)] w-10 h-10" />
            </div>
            <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-accent-dark)] mb-4">Arquitectura Colonial</h3>
            <p className="text-base leading-relaxed">
              Muros centenarios e impecables jardines que traen a la vida la esencia atemporal de las haciendas mexicanas, creando un telón de fondo incomparable para su evento.
            </p>
          </div>
          
          <div className="elegant-card p-10 text-center fade-in animate-delay-200">
            <div className="bg-[var(--color-primary-light)]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeart className="text-[var(--color-primary)] w-9 h-9" />
            </div>
            <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-accent-dark)] mb-4">Servicio Personalizado</h3>
            <p className="text-base leading-relaxed">
              Cada detalle es tratado con la dedicación que merece. Nuestro equipo trabaja incansablemente para convertir su visión en una celebración excepcional.
            </p>
          </div>
          
          <div className="elegant-card p-10 text-center fade-in animate-delay-300">
            <div className="bg-[var(--color-primary-light)]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaGift className="text-[var(--color-primary)] w-9 h-9" />
            </div>
            <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-accent-dark)] mb-4">Experiencia Memorable</h3>
            <p className="text-base leading-relaxed">
              Combinamos la calidez de la hospitalidad mexicana con un servicio cinco estrellas para crear recuerdos que perdurarán para toda la vida.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 