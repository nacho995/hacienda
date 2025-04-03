"use client";

import { FaGlassCheers, FaBirthdayCake, FaChurch, FaUsers } from 'react-icons/fa';

export default function EventsSection() {
  return (
    <section id="events" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="elegant-title centered fade-in text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-accent)] mb-12 font-light">
            Espacios para <span className="text-[var(--color-primary)] font-semibold">Celebrar</span>
          </h2>
          <div className="gold-divider fade-in animate-delay-100"></div>
          <p className="text-xl md:text-2xl font-light fade-in animate-delay-200 mt-10 max-w-4xl mx-auto leading-relaxed">
            Cada rincón de nuestra hacienda está diseñado para crear momentos inolvidables, adaptándose perfectamente a cualquier tipo de celebración.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="elegant-card p-8 text-center fade-in animate-delay-100">
            <div className="bg-[var(--color-primary-light)]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaGlassCheers className="text-[var(--color-primary)] w-8 h-8" />
            </div>
            <h3 className="text-xl font-[var(--font-display)] text-[var(--color-accent-dark)] mb-4">Bodas</h3>
            <p className="text-sm leading-relaxed">
              El escenario perfecto para celebrar su amor, con espacios íntimos y majestuosos que se adaptan a su visión.
            </p>
          </div>

          <div className="elegant-card p-8 text-center fade-in animate-delay-200">
            <div className="bg-[var(--color-primary-light)]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBirthdayCake className="text-[var(--color-primary)] w-8 h-8" />
            </div>
            <h3 className="text-xl font-[var(--font-display)] text-[var(--color-accent-dark)] mb-4">Eventos Sociales</h3>
            <p className="text-sm leading-relaxed">
              Desde cumpleaños hasta aniversarios, cada celebración encuentra su lugar especial en nuestra hacienda.
            </p>
          </div>

          <div className="elegant-card p-8 text-center fade-in animate-delay-300">
            <div className="bg-[var(--color-primary-light)]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaChurch className="text-[var(--color-primary)] w-8 h-8" />
            </div>
            <h3 className="text-xl font-[var(--font-display)] text-[var(--color-accent-dark)] mb-4">Ceremonias</h3>
            <p className="text-sm leading-relaxed">
              Nuestra capilla colonial ofrece un espacio sagrado para ceremonias religiosas de todo tipo.
            </p>
          </div>

          <div className="elegant-card p-8 text-center fade-in animate-delay-400">
            <div className="bg-[var(--color-primary-light)]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUsers className="text-[var(--color-primary)] w-8 h-8" />
            </div>
            <h3 className="text-xl font-[var(--font-display)] text-[var(--color-accent-dark)] mb-4">Eventos Corporativos</h3>
            <p className="text-sm leading-relaxed">
              Espacios versátiles para reuniones, conferencias y eventos empresariales con el toque distintivo de la hacienda.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 