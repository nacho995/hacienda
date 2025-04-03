export default function IntroSection() {
  return (
    <section className="py-16 bg-[var(--color-cream-light)]">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-[var(--font-display)] text-3xl md:text-4xl text-[var(--color-accent)] mb-6">
            Un Descanso con Historia
          </h2>
          <div className="w-16 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
          <p className="text-gray-700 mb-8">
            Nuestras habitaciones han sido cuidadosamente restauradas para preservar la esencia histórica de la hacienda, 
            mientras ofrecen todas las comodidades modernas que garantizan una estancia placentera. Cada habitación cuenta 
            con un carácter único, manteniendo elementos originales que relatan la historia centenaria de este lugar mágico.
          </p>
        </div>
      </div>
    </section>
  );
} 