"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function TerminosPage() {
  return (
    <main className="min-h-screen">
      {/* Cabecera */}
      <section className="relative h-[40vh] overflow-hidden">
        <Image
          src="/images/placeholder/terms-header.svg"
          alt="Términos de Uso"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-[var(--font-display)] text-white mb-4"
            >
              Términos de Uso
            </motion.h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "120px" }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-[1px] bg-[var(--color-primary)] mx-auto mb-6"
            ></motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/90 text-lg max-w-2xl mx-auto"
            >
              Condiciones para el uso de nuestros servicios
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-16 bg-[var(--color-cream-light)]">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-white shadow-md p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h2>Términos y Condiciones de Uso de Hacienda San Carlos</h2>
              
              <p className="text-gray-600 mb-6">
                Última actualización: {new Date().toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'})}
              </p>
              
              <h3>1. Aceptación de los términos</h3>
              
              <p>
                Estos términos y condiciones rigen el uso del sitio web de Hacienda San Carlos ("nosotros", "nuestro" o "la Empresa"), accesible en www.haciendasancarlos.com. Al utilizar nuestro sitio web, usted acepta cumplir con estos términos y condiciones en su totalidad. Si no está de acuerdo con estos términos y condiciones o cualquier parte de ellos, no debe utilizar nuestro sitio web.
              </p>
              
              <h3>2. Reservaciones</h3>
              
              <p>
                Al realizar una reservación a través de nuestro sitio web, usted garantiza que:
              </p>
              
              <ul>
                <li>Tiene al menos 18 años de edad.</li>
                <li>Tiene la autoridad legal para utilizar este sitio y para crear una reservación para usted o para otra persona para la cual está autorizado a actuar.</li>
                <li>Toda la información que proporciona es verdadera, precisa, actual y completa.</li>
              </ul>
              
              <p>
                Hacienda San Carlos se reserva el derecho de rechazar cualquier reservación a nuestra discreción.
              </p>
              
              <h3>3. Política de cancelación y cambios</h3>
              
              <p>
                Nuestra política de cancelación y cambios es la siguiente:
              </p>
              
              <ul>
                <li>Las cancelaciones realizadas con más de 30 días de anticipación a la fecha de llegada recibirán un reembolso completo, menos una tarifa administrativa del 10%.</li>
                <li>Las cancelaciones realizadas entre 15 y 30 días antes de la fecha de llegada recibirán un reembolso del 50% del monto total.</li>
                <li>Las cancelaciones realizadas con menos de 15 días de anticipación no son reembolsables.</li>
                <li>Los cambios en las reservaciones están sujetos a disponibilidad y pueden incurrir en cargos adicionales.</li>
              </ul>
              
              <p>
                Nos reservamos el derecho de modificar nuestra política de cancelación para reservaciones específicas, lo cual se comunicará durante el proceso de reservación.
              </p>
              
              <h3>4. Precios y pagos</h3>
              
              <p>
                Todos los precios mostrados en nuestro sitio web son en pesos mexicanos (MXN) e incluyen IVA, a menos que se indique lo contrario. Los precios están sujetos a cambios sin previo aviso. Se requiere un depósito del 30% para confirmar cualquier reservación, con el saldo restante pagadero 14 días antes de la fecha de llegada.
              </p>
              
              <p>
                Aceptamos pagos a través de tarjetas de crédito/débito (Visa, MasterCard, American Express), transferencias bancarias y otros métodos de pago especificados durante el proceso de reservación.
              </p>
              
              <h3>5. Servicios y eventos</h3>
              
              <p>
                Hacienda San Carlos ofrece servicios de alojamiento, organización de eventos y servicios de alimentos y bebidas. Nos esforzamos por garantizar que toda la información proporcionada en nuestro sitio web con respecto a nuestros servicios sea precisa y esté actualizada. Sin embargo, nos reservamos el derecho de modificar o cancelar cualquier servicio o evento debido a circunstancias imprevistas, como el clima, problemas técnicos o fuerza mayor.
              </p>
              
              <p>
                Para eventos como bodas y celebraciones, se requiere un contrato separado que detallará los términos y condiciones específicos para dichos servicios.
              </p>
              
              <h3>6. Derechos de propiedad intelectual</h3>
              
              <p>
                El contenido de nuestro sitio web, incluyendo pero no limitado a textos, gráficos, logotipos, imágenes, clips de audio, descargas digitales y compilaciones de datos, es propiedad de Hacienda San Carlos o de nuestros proveedores de contenido y está protegido por las leyes de propiedad intelectual mexicanas e internacionales.
              </p>
              
              <p>
                No puede reproducir, distribuir, modificar, crear obras derivadas, exhibir públicamente, ejecutar públicamente, republicar, descargar, almacenar o transmitir ningún material de nuestro sitio web, excepto según lo permitido expresamente por escrito por nosotros.
              </p>
              
              <h3>7. Limitación de responsabilidad</h3>
              
              <p>
                En ningún caso Hacienda San Carlos, sus directores, empleados, socios o agentes serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, que incluyen pero no se limitan a la pérdida de datos, ingresos o ganancias, que surjan de o estén relacionados con su uso del sitio web, ya sea que dicha responsabilidad se afirme en base a un contrato, agravio o de otra manera, y si Hacienda San Carlos ha sido informada o no de la posibilidad de dicha pérdida o daño.
              </p>
              
              <p>
                Las limitaciones de daños establecidas anteriormente son elementos fundamentales de la base del acuerdo entre Hacienda San Carlos y usted.
              </p>
              
              <h3>8. Indemnización</h3>
              
              <p>
                Usted acepta indemnizar, defender y mantener indemne a Hacienda San Carlos, sus afiliados, funcionarios, directores, empleados, contratistas y proveedores de todas y cada una de las reclamaciones, responsabilidades, daños, pérdidas y gastos, incluidos los honorarios y costos legales razonables, que surjan de o estén relacionados de alguna manera con su acceso o uso de nuestro sitio web o su violación de estos términos y condiciones.
              </p>
              
              <h3>9. Ley aplicable</h3>
              
              <p>
                Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes de México, y usted se somete irrevocablemente a la jurisdicción exclusiva de los tribunales de [Jurisdicción] para la resolución de cualquier disputa que pueda surgir en relación con estos términos.
              </p>
              
              <h3>10. Modificaciones</h3>
              
              <p>
                Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos términos en cualquier momento. Si una revisión es material, proporcionaremos un aviso con al menos 30 días de anticipación antes de que los nuevos términos entren en vigencia. Lo que constituye un cambio material se determinará a nuestra sola discreción.
              </p>
              
              <p>
                Al continuar accediendo o utilizando nuestro sitio web después de que entren en vigencia las revisiones, usted acepta estar sujeto a los términos revisados. Si no está de acuerdo con los nuevos términos, deje de usar el sitio web.
              </p>
              
              <h3>11. Contacto</h3>
              
              <p>
                Si tiene alguna pregunta sobre estos términos y condiciones, por favor contáctenos en:
              </p>
              
              <ul>
                <li>Email: info@haciendasancarlos.com</li>
                <li>Teléfono: 735 1556114 / 5529199212</li>
                <li>Dirección: carretera federal Cuernavaca Cuautla km32. Localidad Los Arcos, Yautepec, Morelos</li>
              </ul>
              
              <div className="mt-12 text-center">
                <Link 
                  href="/" 
                  className="inline-block px-8 py-3 bg-[var(--color-primary)] text-white text-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 