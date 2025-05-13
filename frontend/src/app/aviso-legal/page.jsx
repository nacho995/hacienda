"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function AvisoLegalPage() {
  return (
    <main className="min-h-screen">
      {/* Cabecera */}
      <section className="relative h-[40vh] overflow-hidden">
        <Image
          src="/images/placeholder/legal-header.svg"
          alt="Aviso Legal"
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
              Aviso Legal
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
              Información legal sobre nuestro sitio
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-16 bg-[var(--color-cream-light)]">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-white shadow-md p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h2>Aviso Legal de Hacienda San Carlos</h2>
              
              <p className="text-gray-600 mb-6">
                Última actualización: {new Date().toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'})}
              </p>
              
              <h3>1. Información legal del titular</h3>
              
              <p>
                De conformidad con la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico, se informa al usuario que el titular del sitio web es Hacienda San Carlos (en adelante, "la Empresa"), con la siguiente información:
              </p>
              
              <ul>
                <li>Denominación social: Hacienda San Carlos S.A. de C.V.</li>
                <li>CIF/NIF: [Número fiscal]</li>
                <li>Domicilio social: carretera federal Cuernavaca Cuautla km32. Localidad Los Arcos, Yautepec, Morelos</li>
                <li>Teléfono: 735 1556114 / 5529199212</li>
                <li>Email: info@haciendasancarlos.com</li>
                <li>Datos de inscripción en el Registro Mercantil: [Datos de registro]</li>
              </ul>
              
              <h3>2. Objeto y ámbito de aplicación</h3>
              
              <p>
                El presente aviso legal regula el uso del sitio web www.haciendasancarlos.com (en adelante, "el sitio web"), del que es titular Hacienda San Carlos.
              </p>
              
              <p>
                La navegación por el sitio web atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas las disposiciones incluidas en este aviso legal, que pueden sufrir modificaciones.
              </p>
              
              <p>
                El usuario se obliga a hacer un uso correcto del sitio web de conformidad con las leyes, la buena fe, el orden público, los usos del tráfico y el presente aviso legal. El usuario responderá frente a la Empresa o frente a terceros, de cualesquiera daños y perjuicios que pudieran causarse como consecuencia del incumplimiento de dicha obligación.
              </p>
              
              <h3>3. Condiciones de acceso y utilización</h3>
              
              <p>
                El sitio web y sus servicios son de acceso libre y gratuito. No obstante, la Empresa puede condicionar la utilización de algunos de los servicios al previo registro del usuario. El usuario garantiza la autenticidad y actualidad de todos aquellos datos que comunique a la Empresa y será el único responsable de las manifestaciones falsas o inexactas que realice.
              </p>
              
              <p>
                El usuario se compromete expresamente a hacer un uso adecuado de los contenidos y servicios de la Empresa y a no emplearlos para, entre otros:
              </p>
              
              <ul>
                <li>Difundir contenidos delictivos, violentos, pornográficos, racistas, xenófobos, ofensivos, de apología del terrorismo o, en general, contrarios a la ley o al orden público.</li>
                <li>Introducir en la red virus informáticos o realizar actuaciones susceptibles de alterar, estropear, interrumpir o generar errores o daños en los documentos electrónicos, datos o sistemas físicos y lógicos de la Empresa o de terceras personas; así como obstaculizar el acceso de otros usuarios al sitio web y a sus servicios.</li>
                <li>Intentar acceder a las cuentas de correo electrónico de otros usuarios o a áreas restringidas de los sistemas informáticos de la Empresa o de terceros y, en su caso, extraer información.</li>
                <li>Vulnerar los derechos de propiedad intelectual o industrial, así como violar la confidencialidad de la información de la Empresa o de terceros.</li>
                <li>Suplantar la identidad de otro usuario, de las administraciones públicas o de un tercero.</li>
                <li>Reproducir, copiar, distribuir, poner a disposición o de cualquier otra forma comunicar públicamente, transformar o modificar los contenidos, a menos que se cuente con la autorización del titular de los correspondientes derechos o ello resulte legalmente permitido.</li>
                <li>Recabar datos con finalidad publicitaria y de remitir publicidad de cualquier clase y comunicaciones con fines de venta u otras de naturaleza comercial sin que medie su previa solicitud o consentimiento.</li>
              </ul>
              
              <h3>4. Propiedad intelectual e industrial</h3>
              
              <p>
                Todos los contenidos del sitio web, entendiendo por estos a título meramente enunciativo los textos, fotografías, gráficos, imágenes, iconos, tecnología, software, links y demás contenidos audiovisuales o sonoros, así como su diseño gráfico y códigos fuente, son propiedad intelectual de la Empresa o de terceros, sin que puedan entenderse cedidos al usuario ninguno de los derechos de explotación reconocidos por la normativa vigente en materia de propiedad intelectual.
              </p>
              
              <p>
                Las marcas, nombres comerciales o signos distintivos son titularidad de la Empresa o terceros, sin que pueda entenderse que el acceso al sitio web atribuya ningún derecho sobre las citadas marcas, nombres comerciales y/o signos distintivos.
              </p>
              
              <h3>5. Exclusión de garantías y responsabilidad</h3>
              
              <p>
                La Empresa no otorga ninguna garantía ni se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran traer causa de:
              </p>
              
              <ul>
                <li>La falta de disponibilidad, mantenimiento y efectivo funcionamiento del sitio web o de sus servicios y contenidos.</li>
                <li>La falta de utilidad, adecuación o validez del sitio web o de sus servicios y contenidos para satisfacer necesidades, actividades o resultados concretos o expectativas de los usuarios.</li>
                <li>La existencia de virus, programas maliciosos o lesivos en los contenidos.</li>
                <li>La recepción, obtención, almacenamiento, difusión o transmisión, por parte de los usuarios, de los contenidos.</li>
                <li>El uso ilícito, negligente, fraudulento, contrario a las presentes condiciones, a la buena fe, a los usos generalmente aceptados o al orden público, del sitio web, sus servicios o contenidos, por parte de los usuarios.</li>
                <li>La falta de legalidad, calidad, fiabilidad, utilidad y disponibilidad de los servicios prestados por terceros y puestos a disposición de los usuarios en el sitio web.</li>
                <li>El incumplimiento por parte de terceros de sus obligaciones o compromisos en relación con los servicios prestados a los usuarios a través del sitio web.</li>
              </ul>
              
              <h3>6. Enlaces a otros sitios web</h3>
              
              <p>
                El sitio web puede incluir enlaces a sitios web o contenidos de terceros. Estos enlaces se facilitan únicamente con fines informativos, sin que la Empresa tenga control alguno sobre dichos sitios o su contenido. Por ello, la Empresa no asumirá responsabilidad alguna por los daños o perjuicios derivados de su uso, ni garantiza la disponibilidad técnica, calidad, fiabilidad, exactitud, amplitud, veracidad y validez de cualquier material o información contenida en dichos sitios web.
              </p>
              
              <h3>7. Legislación aplicable y jurisdicción</h3>
              
              <p>
                Las presentes condiciones de uso se rigen por la legislación mexicana. Cualquier controversia será resuelta ante los tribunales de [Jurisdicción], con renuncia expresa de las partes a cualquier otro fuero que pudiera corresponderles.
              </p>
              
              <p>
                En caso de que cualquier estipulación de las presentes condiciones de uso resultara inexigible o nula en virtud de la legislación aplicable o como consecuencia de una resolución judicial o administrativa, dicha inexigibilidad o nulidad no hará que las presentes condiciones de uso resulten inexigibles o nulas en su conjunto. En dichos casos, la Empresa procederá a la modificación o sustitución de dicha estipulación por otra que sea válida y exigible y que, en la medida de lo posible, consiga el objetivo y pretensión reflejados en la estipulación original.
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