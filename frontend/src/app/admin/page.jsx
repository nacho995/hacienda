"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaChartPie, FaCalendarAlt, FaBed, FaUsers, FaCog } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';

export default function AdminIndexPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Solo redirigir si el usuario intenta acceder a /admin directamente
    // y no está navegando internamente
    if (pathname === '/admin' && !isRedirecting) {
      // Si el usuario ya está autenticado, mostrar el dashboard directamente
      if (!loading && isAuthenticated && isAdmin) {
        setIsRedirecting(true);
        router.push('/admin/dashboard');
      } else if (!loading && (!isAuthenticated || !isAdmin)) {
        // Si no está autenticado o no es admin, redirigir al login
        setIsRedirecting(true);
        router.push('/admin/login');
      }
    }
  }, [pathname, isRedirecting, loading, isAuthenticated, isAdmin, router]);

  // Si está cargando o redirigiendo, mostrar pantalla de carga
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-bold mb-2">Redirigiendo...</h1>
          <p className="text-gray-600">Te estamos llevando al panel de administración</p>
        </div>
      </div>
    );
  }

  // Si el usuario está en /admin/alguna-ruta y es admin autenticado, permitir que el layout maneje la navegación
  if (pathname !== '/admin' && isAuthenticated && isAdmin) {
    return null;
  }

  // Mostrar un menú de navegación para el admin como fallback
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 flex items-center justify-center bg-gradient-to-r from-slate-800 to-slate-900">
            <Image 
              src="/logo.png" 
              alt="Logo Hacienda San Carlos" 
              width={120} 
              height={120}
              className="mr-4"
            />
            <div>
              <h1 className="text-3xl font-semibold text-white">Panel de Administración</h1>
              <p className="text-white/80">Hacienda San Carlos Borromeo</p>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Navegación rápida</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/dashboard" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
                <FaChartPie className="text-[var(--color-primary)] mr-3 text-xl" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link href="/admin/reservaciones" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
                <FaCalendarAlt className="text-[var(--color-primary)] mr-3 text-xl" />
                <span className="font-medium">Reservaciones</span>
              </Link>
              
              <Link href="/admin/habitaciones" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
                <FaBed className="text-[var(--color-primary)] mr-3 text-xl" />
                <span className="font-medium">Habitaciones</span>
              </Link>
              
              <Link href="/admin/usuarios" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
                <FaUsers className="text-[var(--color-primary)] mr-3 text-xl" />
                <span className="font-medium">Usuarios</span>
              </Link>
              
              <Link href="/admin/configuracion" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
                <FaCog className="text-[var(--color-primary)] mr-3 text-xl" />
                <span className="font-medium">Configuración</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-4 text-gray-500 text-sm">
          © {new Date().getFullYear()} Hacienda San Carlos Borromeo · Panel de Administración
        </div>
      </div>
    </div>
  );
} 