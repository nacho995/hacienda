"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLoginForm from '@/components/admin/LoginForm';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function AdminLogin() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Redirigir al dashboard si ya está autenticado y es admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, isAdmin, router]);
  
  return (
    <div className="admin-auth-page">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black/70 via-black/50 to-black/70">
        <div className="absolute inset-0 z-[-1]">
          <Image 
            src="/imagendron.jpg" 
            alt="Hacienda San Carlos" 
            fill 
            className="object-cover opacity-40"
          />
        </div>
        
        <div className="max-w-md w-full mx-4 my-8">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-800">
            {/* Header */}
            <div className="relative h-32 bg-[var(--color-primary)]">
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-3xl font-[var(--font-display)] text-white text-center drop-shadow-lg">
                  Hacienda San Carlos
                </h1>
              </div>
            </div>

            {/* Formulario de Login */}
            <div className="p-8">
              <AdminLoginForm />
              
              <div className="mt-6 text-center">
                <div className="text-sm text-red-300 font-semibold drop-shadow-sm">
                  Acceso restringido solo para personal autorizado
                </div>
                <div className="mt-4">
                  <p className="text-gray-200 mb-4 drop-shadow-sm">
                    Sistema de administración interno
                  </p>
                  <div className="border-t border-white/20 pt-4">
                    <p className="text-gray-200 mb-2 drop-shadow-sm">¿No tienes una cuenta?</p>
                    <Link
                      href="/admin/registro"
                      className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Solicitar acceso
                    </Link>
                    <p className="text-xs text-gray-300 mt-2 drop-shadow-sm">
                      Tu solicitud será enviada a los administradores para aprobación
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-300 drop-shadow-sm">
            © {new Date().getFullYear()} Hacienda San Carlos Borromeo.
            <br />
            Todos los derechos reservados.
          </div>
        </div>
      </div>
    </div>
  );
} 