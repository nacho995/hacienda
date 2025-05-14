import React from 'react';
import Script from 'next/script';

// Componente para implementar datos estructurados de servicios
const ServiceSchema = ({ serviceName, serviceDescription, serviceImage, serviceCategory }) => {
  // Mantenemos la estrategia de transparencia gradual de precios
  // No incluimos precios exactos en el esquema, solo indicamos rangos en la descripción
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: serviceDescription,
    provider: {
      '@type': 'Organization',
      name: 'Hacienda San Carlos Borromeo',
      url: 'https://www.hdasancarlosborromeo.com'
    },
    serviceType: serviceCategory,
    image: serviceImage,
    // Usamos un enfoque de Category para agrupar servicios similares
    category: serviceCategory
  };

  // ID único para evitar conflictos con múltiples instancias de Schema en la página
  const schemaId = `service-schema-${serviceName.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <Script id={schemaId} type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
  );
};

export default ServiceSchema;
