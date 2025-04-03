"use client";

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-16 bg-[var(--color-primary-5)] relative">
      <div className="container mx-auto px-6 text-center relative z-20">
        <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
          Reserva Tu <span className="text-[var(--color-primary)]">Experiencia de Bienestar</span>
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-10">
          Permítete un momento de indulgencia y transformación. Nuestros terapeutas están listos para guiarte en un viaje de renovación completa.
        </p>
        <Link
          href="/contact"
          className="inline-block px-8 py-4 bg-[var(--color-primary)] text-white text-lg hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg relative z-30"
        >
          Contactar Ahora
        </Link>
      </div>
    </section>
  );
} 