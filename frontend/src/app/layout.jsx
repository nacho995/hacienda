import './globals.css';
import dynamic from 'next/dynamic';
import { AuthProvider } from '../context/AuthContext';
import { ReservationProvider } from '../context/ReservationContext';
import AnimatedBackground from '../components/layout/AnimatedBackground';
import { Toaster } from 'sonner';

// Componente de Breadcrumbs dinámica con soporte para SEO
const BreadcrumbsWrapper = dynamic(() => import('../components/layout/Breadcrumbs'), { ssr: true });

export const metadata = {
  metadataBase: new URL('https://www.hdasancarlosborromeo.com'),
  title: {
    default: 'Bodas y Eventos Exclusivos | Hacienda San Carlos Borromeo | México',
    template: '%s | Hacienda San Carlos Borromeo'
  },
  description: 'Celebra tu boda o evento en un entorno único con la elegancia colonial de Hacienda San Carlos Borromeo. Espacios exclusivos, gastronomía de autor y alojamiento de lujo en México.',
  keywords: ['bodas México', 'eventos exclusivos', 'hacienda colonial', 'San Carlos Borromeo', 'celebraciones de lujo', 'bodas elegantes', 'hotel hacienda'],
  authors: [{ name: 'Hacienda San Carlos Borromeo' }],
  creator: 'Hacienda San Carlos Borromeo',
  publisher: 'Hacienda San Carlos Borromeo',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://www.hdasancarlosborromeo.com/',
    title: 'Hacienda San Carlos Borromeo | Bodas y Eventos Exclusivos',
    description: 'Tu boda de ensueño en una hacienda colonial mexicana con servicios premium y alojamiento exclusivo.',
    siteName: 'Hacienda San Carlos Borromeo',
    images: [
      {
        url: '/images/og-image-hacienda.jpg',
        width: 1200,
        height: 630,
        alt: 'Hacienda San Carlos Borromeo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bodas y Eventos Exclusivos | Hacienda San Carlos Borromeo',
    description: 'Celebra tu evento en un entorno único con tradición y elegancia colonial.',
    images: ['/images/og-image-hacienda.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.hdasancarlosborromeo.com',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Favicon Links - Asegurar que el icono sea logo.png */}
        <link rel="icon" href="/logo.png" sizes="any" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" type="image/png" />
        
        {/* Fuentes de Google */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap" rel="stylesheet" />
        {/* ELIMINADO: Link a Tangerine */}
        {/* <link href="https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&display=swap" rel="stylesheet" /> */}
        <link href="https://fonts.googleapis.com/css2?family=Akaya+Kanadaka&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <ReservationProvider>
            <AnimatedBackground />
            <BreadcrumbsWrapper />
            {children}
            <Toaster richColors position="bottom-right" />
          </ReservationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}