// Este archivo es un Page Server Component para metadatos

import { EventosClientPage } from '@/components/eventos/EventosClientPage';

// Metadatos específicos para la página de eventos
export const metadata = {
  title: 'Eventos Exclusivos y Celebraciones | Bodas, Corporativos y Sociales',
  description: 'Descubre nuestros espacios exclusivos para celebrar bodas, eventos corporativos y sociales. Hacienda San Carlos Borromeo ofrece una experiencia única con tradición y elegancia colonial.',
  keywords: ['bodas exclusivas', 'eventos corporativos', 'celebraciones sociales', 'hacienda para bodas', 'espacios para eventos', 'bodas en México'],
  openGraph: {
    images: ['/images/eventos/eventos-portada.jpg'],
  },
  alternates: {
    canonical: 'https://www.hdasancarlosborromeo.com/eventos',
  },
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'EventVenue',
    name: 'Hacienda San Carlos Borromeo',
    description: 'Espacio exclusivo para la celebración de bodas y eventos sociales y corporativos en un entorno colonial.',
    url: 'https://www.hdasancarlosborromeo.com/eventos',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Carlos',
      addressRegion: 'México',
      addressCountry: 'MX'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Eventos Exclusivos',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Bodas',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Ceremonia y Recepción',
                description: 'Espacios exclusivos para tu ceremonia y recepción de bodas'
              }
            }
          ]
        },
        {
          '@type': 'OfferCatalog',
          name: 'Eventos Corporativos',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Reuniones Empresariales',
                description: 'Espacios para conferencias y eventos corporativos'
              }
            }
          ]
        }
      ]
    }
  }
};

// Exportamos un componente default que renderiza el componente cliente
export default function EventosPage() {
  return <EventosClientPage />;
}
