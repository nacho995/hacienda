'use client';

import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header con logo */}
      <header className="py-4 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="w-40 mx-auto md:mx-0">
            <Image
              src="/images/logo.png"
              alt="Hacienda San Carlos Borromeo"
              width={160}
              height={50}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 bg-gray-800 text-gray-400 text-sm text-center">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Hacienda San Carlos Borromeo. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
} 