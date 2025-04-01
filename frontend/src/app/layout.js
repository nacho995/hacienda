import './globals.css';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Hacienda San Carlos Borromeo',
  description: 'Bodas y eventos exclusivos en una hacienda colonial en México',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" />
      </head>
      <body>
        <AnimatedBackground />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
} 