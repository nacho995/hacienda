"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function CookiesPage() {
  return (
    <main className="min-h-screen">
      {/* Cabecera */}
      <section className="relative h-[40vh] overflow-hidden">
        <Image
          src="/images/placeholder/cookies-header.svg"
          alt="Política de Cookies"
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
              Política de Cookies
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
              Información sobre el uso de cookies en nuestro sitio
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-16 bg-[var(--color-cream-light)]">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-white shadow-md p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h2>Política de Cookies de Hacienda San Carlos</h2>
              
              <p className="text-gray-600 mb-6">
                Última actualización: {new Date().toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'})}
              </p>
              
              <p>
                Esta Política de Cookies explica qué son las cookies y cómo las utilizamos en el sitio web de Hacienda San Carlos. Debe leer esta política para entender qué son las cookies, cómo las usamos, los tipos de cookies que usamos, la información que recopilamos usando cookies y cómo se utiliza esa información, y cómo controlar las preferencias de cookies.
              </p>
              
              <h3>¿Qué son las cookies?</h3>
              
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en su ordenador o dispositivo móvil cuando visita un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen, o funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
              </p>
              
              <p>
                Las cookies pueden ser "cookies persistentes" o "cookies de sesión". Las cookies persistentes permanecen en su ordenador personal o dispositivo móvil cuando se desconecta, mientras que las cookies de sesión se eliminan tan pronto como cierra su navegador web.
              </p>
              
              <h3>¿Cómo utilizamos las cookies?</h3>
              
              <p>
                Hacienda San Carlos utiliza cookies para varios propósitos. Algunas cookies son necesarias por razones técnicas para que nuestro sitio web funcione, y nos referimos a ellas como cookies "esenciales" o "estrictamente necesarias". Otras cookies también nos permiten rastrear y dirigir los intereses de nuestros usuarios para mejorar la experiencia en nuestro sitio. Los terceros sirven cookies a través de nuestro sitio web para publicidad, análisis y otras finalidades.
              </p>
              
              <p>Los tipos específicos de cookies de primera y tercera parte que servimos a través de nuestro sitio web y los propósitos que cumplen se describen a continuación:</p>
              
              <h3>Tipos de cookies que utilizamos</h3>
              
              <h4>Cookies esenciales</h4>
              
              <p>
                Estas cookies son estrictamente necesarias para proporcionarle servicios disponibles a través de nuestro sitio web y para utilizar algunas de sus características, como el acceso a áreas seguras. Debido a que estas cookies son estrictamente necesarias para la entrega del sitio web, no puede rechazarlas sin impactar en cómo funciona nuestro sitio.
              </p>
              
              <ul>
                <li>Gestión de sesiones</li>
                <li>Recordar las preferencias del usuario</li>
                <li>Equilibrar la carga del servidor</li>
              </ul>
              
              <h4>Cookies de rendimiento y funcionalidad</h4>
              
              <p>
                Estas cookies se utilizan para mejorar el rendimiento y la funcionalidad de nuestro sitio web, pero no son esenciales para su uso. Sin embargo, sin estas cookies, ciertas funcionalidades pueden volverse indisponibles.
              </p>
              
              <ul>
                <li>Recordar sus preferencias de idioma</li>
                <li>Personalización de la experiencia del usuario</li>
                <li>Formularios mejorados</li>
              </ul>
              
              <h4>Cookies analíticas y de personalización</h4>
              
              <p>
                Estas cookies recopilan información que se utiliza en forma agregada para ayudarnos a entender cómo se utiliza nuestro sitio web o qué tan efectivas son nuestras campañas de marketing, o para ayudarnos a personalizar nuestro sitio web para usted.
              </p>
              
              <ul>
                <li>Google Analytics (para análisis de visitantes)</li>
                <li>Hotjar (para análisis de comportamiento)</li>
                <li>Optimizely (para pruebas A/B)</li>
              </ul>
              
              <h4>Cookies de marketing</h4>
              
              <p>
                Estas cookies se utilizan para hacer que los mensajes publicitarios sean más relevantes para usted. Realizan funciones como evitar que el mismo anuncio reaparezca continuamente, asegurándose de que los anuncios se muestren correctamente a los anunciantes, y en algunos casos seleccionando anuncios que se basan en sus intereses.
              </p>
              
              <ul>
                <li>Google Ads</li>
                <li>Facebook Pixel</li>
                <li>LinkedIn Insight Tag</li>
              </ul>
              
              <h3>¿Cómo puede controlar las preferencias de cookies?</h3>
              
              <p>
                Puede configurar su navegador para rechazar todas las cookies, aceptar solo cookies de origen, o indicarle cuando se envía una cookie. Sin embargo, si no acepta cookies, es posible que no pueda utilizar algunas partes de nuestro servicio.
              </p>
              
              <p>
                La mayoría de los navegadores le permiten: ver qué cookies tiene y eliminarlas individualmente, bloquear cookies de terceros, bloquear cookies de sitios particulares, bloquear todas las cookies, y eliminar todas las cookies cuando cierra su navegador.
              </p>
              
              <h4>¿Cómo deshabilitar las cookies?</h4>
              
              <p>
                Algunos navegadores web proporcionan configuraciones que le permiten controlar o rechazar cookies o alertarlo cuando se está enviando una cookie a su ordenador. Los procedimientos para administrar cookies son diferentes para cada navegador, puede verificar las instrucciones específicas en los siguientes enlaces:
              </p>
              
              <ul>
                <li>Microsoft Internet Explorer</li>
                <li>Microsoft Edge</li>
                <li>Mozilla Firefox</li>
                <li>Google Chrome</li>
                <li>Apple Safari</li>
                <li>Opera</li>
              </ul>
              
              <p>
                Tenga en cuenta que si elige eliminar las cookies, las preferencias o la configuración controladas por esas cookies, incluidas las preferencias publicitarias, se eliminarán y tendrá que volver a crearlas.
              </p>
              
              <h3>Cookies que utilizamos</h3>
              
              <table className="min-w-full border-collapse border border-gray-300 my-8">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3">Nombre</th>
                    <th className="border border-gray-300 p-3">Proveedor</th>
                    <th className="border border-gray-300 p-3">Propósito</th>
                    <th className="border border-gray-300 p-3">Caducidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">_ga</td>
                    <td className="border border-gray-300 p-3">Google Analytics</td>
                    <td className="border border-gray-300 p-3">Registra un ID único que se utiliza para generar datos estadísticos acerca de cómo utiliza el visitante el sitio web.</td>
                    <td className="border border-gray-300 p-3">2 años</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">_gid</td>
                    <td className="border border-gray-300 p-3">Google Analytics</td>
                    <td className="border border-gray-300 p-3">Registra un ID único que se utiliza para generar datos estadísticos acerca de cómo utiliza el visitante el sitio web.</td>
                    <td className="border border-gray-300 p-3">24 horas</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">_gat</td>
                    <td className="border border-gray-300 p-3">Google Analytics</td>
                    <td className="border border-gray-300 p-3">Se utiliza para limitar la velocidad de solicitud.</td>
                    <td className="border border-gray-300 p-3">1 minuto</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">_fbp</td>
                    <td className="border border-gray-300 p-3">Facebook</td>
                    <td className="border border-gray-300 p-3">Utilizado por Facebook para proporcionar una serie de productos publicitarios como ofertas en tiempo real de anunciantes terceros.</td>
                    <td className="border border-gray-300 p-3">3 meses</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">sessionid</td>
                    <td className="border border-gray-300 p-3">Hacienda San Carlos</td>
                    <td className="border border-gray-300 p-3">Mantiene el estado de la sesión del usuario a través de las páginas del sitio.</td>
                    <td className="border border-gray-300 p-3">Sesión</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Actualizaciones de nuestra política de cookies</h3>
              
              <p>
                Podemos actualizar esta Política de Cookies de vez en cuando para reflejar, por ejemplo, cambios en las cookies que utilizamos o por otras razones operativas, legales o regulatorias. Por lo tanto, revise periódicamente esta Política de Cookies para mantenerse informado sobre nuestro uso de cookies y tecnologías relacionadas.
              </p>
              
              <p>
                La fecha en la parte superior de esta Política de Cookies indica cuándo se actualizó por última vez.
              </p>
              
              <h3>¿Dónde puedo obtener más información?</h3>
              
              <p>
                Si tiene alguna pregunta sobre nuestro uso de cookies u otras tecnologías, por favor contacte con nosotros a través de los métodos indicados en nuestra página de contacto.
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