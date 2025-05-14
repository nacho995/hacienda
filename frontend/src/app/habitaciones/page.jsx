// Este archivo es un Page Server Component por defecto (sin "use client")
// para poder utilizar metadatos estáticos

import { HabitacionesClientPage } from '@/components/habitaciones/HabitacionesClientPage';

// Metadatos SEO para página de habitaciones
export const metadata = {
  title: 'Alojamiento de Lujo | Habitaciones Exclusivas | Hacienda San Carlos Borromeo',
  description: 'Disfrute de nuestras lujosas habitaciones en Hotel Hacienda San Carlos, ya sea como complemento a su evento o como experiencia hotelera independiente. Rodeado de jardines y elegancia colonial.',
  keywords: ['hotel exclusivo', 'alojamiento de lujo', 'habitaciones coloniales', 'hotel hacienda', 'hospedaje para eventos', 'hotel boutique México'],
  openGraph: {
    images: ['/images/habitaciones/habitaciones-portada.jpg'],
  },
  alternates: {
    canonical: 'https://www.hdasancarlosborromeo.com/habitaciones',
  },
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: 'Hacienda San Carlos Borromeo',
    description: 'Hotel boutique exclusivo en una hacienda colonial mexicana con alojamiento de lujo.',
    starRating: {
      '@type': 'Rating',
      ratingValue: '5'
    },
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Carlos',
      addressRegion: 'México',
      addressCountry: 'MX'
    },
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Jardines',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Wi-Fi',
        value: true
      }
    ]
  }
};

// Exportamos un componente default que renderiza el componente cliente
export default function HabitacionesPage() {
  return <HabitacionesClientPage />;
}
