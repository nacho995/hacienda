// Este archivo es un componente servidor (sin "use client") para los metadatos

import { HomeClientPage } from '../components/home/HomeClientPage';

// Metadatos SEO específicos para la página principal
export const metadata = {
  title: 'Hacienda San Carlos Borromeo | Bodas y Eventos Exclusivos en México',
  description: 'Celebra tu boda o evento exclusivo en la Hacienda San Carlos Borromeo. Espacios únicos, gastronomía de autor y un servicio personalizado en un entorno colonial mexicano.',
  keywords: ['hacienda bodas', 'eventos exclusivos México', 'bodas hacienda colonial', 'San Carlos Borromeo', 'celebraciones de lujo'],
  alternates: {
    canonical: 'https://www.hdasancarlosborromeo.com',
  },
  openGraph: {
    images: ['/images/home/portada-home.jpg'],
  },
};

// Exportamos un componente default que renderiza el componente cliente
export default function Home() {
  return <HomeClientPage />;
}