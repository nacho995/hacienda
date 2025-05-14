import React from 'react';
import Script from 'next/script';

const HomePageSchema = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hacienda San Carlos Borromeo',
    url: 'https://www.hdasancarlosborromeo.com',
    logo: 'https://www.hdasancarlosborromeo.com/logo.png',
    sameAs: [
      'https://www.facebook.com/HaciendaSanCarlosBorromeo',
      'https://www.instagram.com/hdasancarlosborromeo'
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Carlos',
      addressRegion: 'México',
      postalCode: '00000',
      addressCountry: 'MX'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+52-000-000-0000',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English']
    },
    // Agregar información relevante para bodas y eventos
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Bodas Exclusivas',
          description: 'Celebra tu boda de ensueño con un servicio personalizado en nuestro entorno colonial'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Eventos Corporativos',
          description: 'Espacios elegantes para reuniones corporativas, conferencias y eventos empresariales'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Alojamiento de Lujo',
          description: 'Habitaciones exclusivas con una experiencia única para complementar su evento'
        }
      }
    ]
  };

  return (
    <Script id="organization-schema" type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
  );
};

export default HomePageSchema;
