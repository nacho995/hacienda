import React from 'react';
import Script from 'next/script';

// Componente para implementar FAQPage Schema.org, importante para SEO
const FAQSchema = ({ faqs, pageName }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <Script id={`faq-schema-${pageName}`} type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
  );
};

// Preguntas frecuentes específicas sobre la estrategia de transparencia de precios
export const reservationFAQs = [
  {
    question: "¿Cómo puedo conocer el precio exacto de mi evento?",
    answer: "Nuestro sistema le muestra un rango estimado inicial y un desglose detallado a medida que selecciona servicios específicos. El panel lateral siempre muestra el total actualizado en tiempo real."
  },
  {
    question: "¿Por qué no veo precios individuales en los servicios?",
    answer: "Nuestra filosofía se centra en la experiencia global. Mostramos el costo total actualizado en el panel lateral mientras explora opciones, permitiéndole enfocarse en elegir los elementos que realmente desea para su evento."
  },
  {
    question: "¿Existe un mínimo de gasto para reservar la hacienda?",
    answer: "Sí, dependiendo del tipo de evento y temporada. Al seleccionar su tipo de evento, puede ver el rango aproximado y consultar disponibilidad sin compromiso."
  },
  {
    question: "¿Puedo reservar solo habitaciones sin contratar un evento?",
    answer: "Sí, ofrecemos reservas de habitaciones independientes. Los precios se muestran claramente en la sección de alojamiento."
  },
  {
    question: "¿Cómo puedo ver el desglose detallado de mi presupuesto?",
    answer: "Durante todo el proceso de reserva, nuestro panel lateral le muestra un resumen detallado de costos. Puede expandirlo en cualquier momento para ver el desglose completo por categorías."
  }
];

export default FAQSchema;
