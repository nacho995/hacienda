"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen">
      {/* Cabecera */}
      <section className="relative h-[40vh] overflow-hidden">
        <Image
          src="/images/placeholder/privacy-header.svg"
          alt="Política de Privacidad"
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
              Política de Privacidad
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
              Su privacidad es importante para nosotros
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-16 bg-[var(--color-cream-light)]">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-white shadow-md p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h2>Política de Privacidad de Hacienda San Carlos</h2>
              
              <p className="text-gray-600 mb-6">
                Última actualización: {new Date().toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'})}
              </p>
              
              <p>
                En Hacienda San Carlos, accesible desde haciendasancarlos.com, una de nuestras principales prioridades es la privacidad de nuestros visitantes. Este documento de Política de Privacidad contiene los tipos de información que recopila y registra Hacienda San Carlos y cómo la utilizamos.
              </p>
              
              <p>
                Si tiene preguntas adicionales o necesita más información sobre nuestra Política de Privacidad, no dude en contactarnos.
              </p>
              
              <h3>Información que recopilamos</h3>
              
              <p>
                La información personal que se le solicita proporcionar, y las razones por las que se le solicita proporcionarla, se le aclarará en el momento en que le pidamos que proporcione su información personal.
              </p>
              
              <p>
                Si se comunica con nosotros directamente, podemos recibir información adicional sobre usted, como su nombre, dirección de correo electrónico, número de teléfono, el contenido del mensaje y/o archivos adjuntos que pueda enviarnos, y cualquier otra información que decida proporcionar.
              </p>
              
              <p>
                Cuando se registra para una cuenta, podemos solicitar su información de contacto, incluidos elementos como nombre, nombre de la empresa, dirección, dirección de correo electrónico y número de teléfono.
              </p>
              
              <h3>Cómo utilizamos su información</h3>
              
              <p>Utilizamos la información que recopilamos de varias formas, incluyendo:</p>
              
              <ul>
                <li>Proporcionar, operar y mantener nuestro sitio web</li>
                <li>Mejorar, personalizar y expandir nuestro sitio web</li>
                <li>Entender y analizar cómo utiliza nuestro sitio web</li>
                <li>Desarrollar nuevos productos, servicios, características y funcionalidades</li>
                <li>Comunicarnos con usted, ya sea directamente o a través de uno de nuestros socios, para brindarle actualizaciones y otra información relacionada con el sitio web, y con fines de marketing y promocionales</li>
                <li>Enviarle correos electrónicos</li>
                <li>Encontrar y prevenir fraudes</li>
              </ul>
              
              <h3>Archivos de registro</h3>
              
              <p>
                Hacienda San Carlos sigue un procedimiento estándar de uso de archivos de registro. Estos archivos registran a los visitantes cuando visitan sitios web. Todas las empresas de alojamiento hacen esto como parte de los servicios de análisis de alojamiento. La información recopilada por los archivos de registro incluye direcciones de protocolo de Internet (IP), tipo de navegador, proveedor de servicios de Internet (ISP), marca de fecha y hora, páginas de referencia/salida y posiblemente el número de clics. Estos no están vinculados a ninguna información que sea personalmente identificable. El propósito de la información es analizar tendencias, administrar el sitio, rastrear el movimiento de los usuarios en el sitio web y recopilar información demográfica.
              </p>
              
              <h3>Cookies y balizas web</h3>
              
              <p>
                Como cualquier otro sitio web, Hacienda San Carlos utiliza "cookies". Estas cookies se utilizan para almacenar información, incluidas las preferencias de los visitantes y las páginas del sitio web que el visitante accedió o visitó. La información se utiliza para optimizar la experiencia de los usuarios al personalizar el contenido de nuestra página web según el tipo de navegador de los visitantes y/u otra información.
              </p>
              
              <h3>Políticas de privacidad de socios publicitarios</h3>
              
              <p>
                Puede consultar esta lista para encontrar la Política de Privacidad de cada uno de los socios publicitarios de Hacienda San Carlos.
              </p>
              
              <p>
                Los servidores de anuncios o redes de anuncios de terceros utilizan tecnologías como cookies, JavaScript o Web Beacons que se utilizan en sus respectivos anuncios y enlaces que aparecen en Hacienda San Carlos, que se envían directamente al navegador de los usuarios. Reciben automáticamente su dirección IP cuando esto ocurre. Estas tecnologías se utilizan para medir la efectividad de sus campañas publicitarias y/o para personalizar el contenido publicitario que ve en los sitios web que visita.
              </p>
              
              <p>
                Tenga en cuenta que Hacienda San Carlos no tiene acceso ni control sobre estas cookies que utilizan los anunciantes de terceros.
              </p>
              
              <h3>Políticas de privacidad de terceros</h3>
              
              <p>
                La Política de Privacidad de Hacienda San Carlos no se aplica a otros anunciantes o sitios web. Por lo tanto, le recomendamos que consulte las respectivas Políticas de Privacidad de estos servidores de anuncios de terceros para obtener información más detallada. Puede incluir sus prácticas e instrucciones sobre cómo excluirse de ciertas opciones.
              </p>
              
              <p>
                Puede optar por deshabilitar las cookies a través de las opciones de su navegador individual. Para conocer información más detallada sobre la gestión de cookies con navegadores web específicos, puede encontrarla en los respectivos sitios web de los navegadores.
              </p>
              
              <h3>Derechos de protección de datos GDPR</h3>
              
              <p>
                Nos gustaría asegurarnos de que conoce plenamente todos sus derechos de protección de datos. Todo usuario tiene derecho a lo siguiente:
              </p>
              
              <ul>
                <li>El derecho de acceso: tiene derecho a solicitar copias de sus datos personales.</li>
                <li>El derecho de rectificación: tiene derecho a solicitar que corrijamos cualquier información que crea que es inexacta. También tiene derecho a solicitar que completemos la información que cree que está incompleta.</li>
                <li>El derecho de supresión: tiene derecho a solicitar que borremos sus datos personales, bajo ciertas condiciones.</li>
                <li>El derecho a restringir el procesamiento: tiene derecho a solicitar que restrinjamos el procesamiento de sus datos personales, bajo ciertas condiciones.</li>
                <li>El derecho a oponerse al procesamiento: tiene derecho a oponerse a nuestro procesamiento de sus datos personales, bajo ciertas condiciones.</li>
                <li>El derecho a la portabilidad de datos: tiene derecho a solicitar que transfiramos los datos que hemos recopilado a otra organización, o directamente a usted, bajo ciertas condiciones.</li>
              </ul>
              
              <p>
                Si realiza una solicitud, tenemos un mes para responderle. Si desea ejercer alguno de estos derechos, contáctenos.
              </p>
              
              <h3>Información para niños</h3>
              
              <p>
                Otra parte de nuestra prioridad es agregar protección para los niños mientras usan Internet. Alentamos a los padres y tutores a observar, participar y/o monitorear y guiar su actividad en línea.
              </p>
              
              <p>
                Hacienda San Carlos no recopila a sabiendas ninguna información de identificación personal de niños menores de 13 años. Si cree que su hijo proporcionó este tipo de información en nuestro sitio web, le recomendamos encarecidamente que se comunique con nosotros de inmediato y haremos todo lo posible para eliminar rápidamente dicha información de nuestros registros.
              </p>
              
              <h3>Cambios a esta política de privacidad</h3>
              
              <p>
                Podemos actualizar nuestra Política de Privacidad de vez en cuando. Por lo tanto, le recomendamos que revise esta página periódicamente para cualquier cambio. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página. Estos cambios son efectivos inmediatamente después de que se publican en esta página.
              </p>
              
              <h3>Contáctenos</h3>
              
              <p>
                Si tiene alguna pregunta o sugerencia sobre nuestra Política de Privacidad, no dude en contactarnos.
              </p>
              
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