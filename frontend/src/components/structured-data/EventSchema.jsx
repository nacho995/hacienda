import React from 'react';
import Script from 'next/script';

const EventSchema = ({ eventType, eventName }) => {
  // Adaptamos los datos estructurados según el tipo de evento
  // Siguiendo la estrategia de transparencia gradual de precios
  const getPriceRange = (type) => {
    switch (type) {
      case 'boda':
        return 'Desde €15,000';
      case 'corporativo':
        return 'Desde €8,000';
      case 'social':
        return 'Desde €10,000';
      default:
        return 'Consultar precios';
    }
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: eventName || `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} en Hacienda San Carlos Borromeo`,
    description: `Celebre su ${eventType} en un entorno único con elegancia colonial y servicios exclusivos en la Hacienda San Carlos Borromeo.`,
    image: `https://www.hdasancarlosborromeo.com/images/eventos/${eventType}.jpg`,
    url: `https://www.hdasancarlosborromeo.com/eventos/${eventType}`,
    // Usamos offers para mostrar rangos de precios, siguiendo la estrategia de transparencia gradual
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0],
      // Mostramos el rango de precios en la descripción para preservar la estrategia
      description: getPriceRange(eventType)
    },
    location: {
      '@type': 'Place',
      name: 'Hacienda San Carlos Borromeo',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'San Carlos',
        addressRegion: 'México',
        addressCountry: 'MX'
      }
    },
    organizer: {
      '@type': 'Organization',
      name: 'Hacienda San Carlos Borromeo',
      url: 'https://www.hdasancarlosborromeo.com'
    }
  };

  return (
    <Script id={`event-schema-${eventType}`} type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
  );
};

export default EventSchema;
