import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ReservationProvider } from '../context/ReservationContext';
import AnimatedBackground from '../components/layout/AnimatedBackground';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Hacienda San Carlos Borromeo',
  description: 'Bodas y eventos exclusivos en una hacienda colonial en México',
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
        <AnimatedBackground />
        <AuthProvider>
          <ReservationProvider>
            {children}
          </ReservationProvider>
        </AuthProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
} 