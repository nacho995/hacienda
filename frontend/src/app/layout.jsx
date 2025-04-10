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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" />
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