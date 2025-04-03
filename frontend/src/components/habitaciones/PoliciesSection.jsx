export default function PoliciesSection({ scrollY }) {
  return (
    <section className="py-12 relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 w-full h-[120%] -top-[10%]"
        style={{ 
          backgroundImage: "url('/textura.png')",
          backgroundSize: "cover",
          backgroundPosition: `center ${50 + scrollY * 0.03}%`,
          transition: "background-position 0.1s ease-out"
        }}
      >
      </div>
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center backdrop-blur-md bg-black/10 p-6 rounded-lg border border-white/10 shadow-xl transition-transform hover:scale-105 duration-300">
            <h3 className="font-[var(--font-display)] text-xl mb-4 font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">
              Política de Check-in
            </h3>
            <p className="text-white font-bold text-shadow">
              Check-in: 15:00 - 20:00<br />
              Check-out: 12:00<br />
              Se requiere identificación oficial
            </p>
          </div>
          
          <div className="text-center backdrop-blur-md bg-black/10 p-6 rounded-lg border border-white/10 shadow-xl transition-transform hover:scale-105 duration-300">
            <h3 className="font-[var(--font-display)] text-xl mb-4 font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">
              Política de Cancelación
            </h3>
            <p className="text-white font-bold text-shadow">
              Cancelación gratuita hasta 7 días antes<br />
              50% de penalización de 2 a 6 días antes<br />
              Sin reembolso dentro de las 48 hrs
            </p>
          </div>
          
          <div className="text-center backdrop-blur-md bg-black/10 p-6 rounded-lg border border-white/10 shadow-xl transition-transform hover:scale-105 duration-300">
            <h3 className="font-[var(--font-display)] text-xl mb-4 font-bold text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(190,150,50,0.7)]">
              Instalaciones y Servicios
            </h3>
            <p className="text-white font-bold text-shadow">
              Estacionamiento gratuito<br />
              Desayuno incluido (7:00 - 10:30)<br />
              Servicio a la habitación (cargo adicional)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 