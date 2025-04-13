"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  FaCalendarAlt,
  FaBed,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartPie,
  FaBoxOpen,
  FaHotel,
  FaFileExcel,
  FaStar,
  FaBook
} from 'react-icons/fa';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { ConfirmationModalProvider, useConfirmationModalContext } from '@/context/ConfirmationModalContext';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

// Componente interno para renderizar el modal usando el contexto
const GlobalConfirmationModal = () => {
  const { isOpen, config, hideConfirmation, handleConfirm } = useConfirmationModalContext();

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={hideConfirmation}
      onConfirm={handleConfirm}
      title={config?.title}
      message={config?.message}
      confirmText={config?.confirmText}
      cancelText={config?.cancelText}
      iconType={config?.iconType}
    />
  );
}

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, loading, authError, logout } = useAuth();

  // Manejar la autenticación y redirección
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Debe iniciar sesión como administrador.');
      router.push('/admin/login');
      return;
    }

    if (!loading && isAuthenticated && !isAdmin) {
      toast.error('Acceso denegado. Se requieren permisos de administrador.');
      router.push('/admin/login');
      return;
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  // Manejar errores de autenticación
  useEffect(() => {
    if (authError) {
      toast.error(authError.message || 'Error de autenticación. Por favor inicie sesión nuevamente.');
    }
  }, [authError]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada correctamente');
      router.push('/admin/login');
    } catch (error) {
      console.error('Error en logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  // Si está cargando, mostrar pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-800">
        <div className="bg-slate-700 p-8 rounded-lg shadow-md text-white">
          <h1 className="text-2xl font-bold mb-4">Cargando...</h1>
          <p>Verificando tu sesión</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <button 
            onClick={() => router.push('/admin/login')} 
            className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded text-white transition-colors"
          >
            Ir a login
          </button>
        </div>
      </div>
    );
  }

  // Si hay error de autenticación
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-800">
        <div className="bg-slate-700 p-8 rounded-lg shadow-md text-white">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Error de autenticación</h1>
          <p>{authError.message || 'Se ha producido un error al verificar tu sesión'}</p>
          <button 
            onClick={() => router.push('/admin/login')} 
            className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded text-white transition-colors"
          >
            Ir a login
          </button>
        </div>
      </div>
    );
  }

  // Si es la página de login, mostrar sin layout
  if (pathname === '/admin/login') {
    return children;
  }

  // Si no está autenticado o no es admin, no mostrar nada mientras se redirige
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // Enlaces del sidebar
  const sidebarLinks = [  
    { name: 'Manual de Instrucciones', href: '/admin/manual', icon: <FaBook /> },
    { name: 'Vista General', href: '/admin/dashboard', icon: <FaChartPie /> },
    { name: 'Reservaciones', href: '/admin/reservaciones', icon: <FaCalendarAlt /> },
    { name: 'Habitaciones eventos', href: '/admin/habitaciones', icon: <FaBed /> },
    { name: 'Reservas Hotel', href: '/admin/reservas-hotel', icon: <FaHotel /> },
    { name: 'Servicios Eventos', href: '/admin/servicios-eventos', icon: <FaBoxOpen /> },
    { name: 'Sube tu Excel', href: '/admin/sube-tu-excel', icon: <FaFileExcel /> },
    { name: 'Reseñas', href: '/admin/reviews', icon: <FaStar /> },
    { name: 'Usuarios', href: '/admin/usuarios', icon: <UserGroupIcon className="h-6 w-6" /> },
    { name: 'Configuración', href: '/admin/configuracion', icon: <FaCog /> },
  ];

  return (
    <ConfirmationModalProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-100/90 to-zinc-100/80">
        {/* Sidebar para móvil - Toggle button */}
        <div className="md:hidden bg-white/60 backdrop-blur-md border-b border-gray-200/50 p-4 shadow-sm flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-[50px]"></div>
              <Image 
                src="/logo.png" 
                alt="Logo Hacienda San Carlos" 
                width={60} 
                height={60} 
                className="relative z-10"
              />
            </div>
            <span className="text-xl font-semibold text-gray-800 ml-4">Panel Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 rounded-lg hover:bg-white/70 transition-all duration-200">
            {isSidebarOpen ? <FaTimes size={24} className="text-gray-600" /> : <FaBars size={24} className="text-gray-600" />}
          </button>
        </div>

        {/* Sidebar */}
        <div className={`bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white w-full md:w-80 flex-shrink-0 transition-all duration-300 ease-in-out backdrop-blur-xl border-r border-white/5
                        ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
          
          <div className="p-6 border-b border-white/5 hidden md:block">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Forma de puerta de castillo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Puerta principal */}
                  <div className="absolute w-32 h-36 bg-white rounded-t-[100px] shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    {/* Líneas decorativas superiores */}
                    <div className="absolute top-4 left-4 right-4 h-[2px] bg-slate-200"></div>
                    <div className="absolute top-8 left-4 right-4 h-[2px] bg-slate-200"></div>
                    {/* Líneas verticales */}
                    <div className="absolute top-12 left-4 w-[2px] h-8 bg-slate-200"></div>
                    <div className="absolute top-12 right-4 w-[2px] h-8 bg-slate-200"></div>
                    {/* Líneas decorativas inferiores */}
                    <div className="absolute bottom-8 left-4 right-4 h-[2px] bg-slate-200"></div>
                    <div className="absolute bottom-4 left-4 right-4 h-[2px] bg-slate-200"></div>
                  </div>
                  {/* Torre izquierda */}
                  <div className="absolute w-8 h-40 bg-white left-6 rounded-t-lg shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    {/* Líneas decorativas torre izquierda */}
                    <div className="absolute top-4 left-1 right-1 h-[2px] bg-slate-200"></div>
                    <div className="absolute top-8 left-1 right-1 h-[2px] bg-slate-200"></div>
                    <div className="absolute bottom-8 left-1 right-1 h-[2px] bg-slate-200"></div>
                  </div>
                  {/* Torre derecha */}
                  <div className="absolute w-8 h-40 bg-white right-6 rounded-t-lg shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    {/* Líneas decorativas torre derecha */}
                    <div className="absolute top-4 left-1 right-1 h-[2px] bg-slate-200"></div>
                    <div className="absolute top-8 left-1 right-1 h-[2px] bg-slate-200"></div>
                    <div className="absolute bottom-8 left-1 right-1 h-[2px] bg-slate-200"></div>
                  </div>
                  {/* Almenas superiores con líneas */}
                  <div className="absolute top-0 w-full flex justify-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="relative w-4 h-6 bg-white rounded-t-lg shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        <div className="absolute top-2 left-1 right-1 h-[1px] bg-slate-200"></div>
                      </div>
                    ))}
                  </div>
                  {/* Arco decorativo */}
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 border-t-2 border-slate-200 rounded-full"></div>
                </div>
                <Image 
                  src="/logo.png" 
                  alt="Logo Hacienda San Carlos" 
                  width={100} 
                  height={100} 
                  className="relative z-10"
                />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-center text-white">Panel Admin</h1>
          </div>

          {/* Enlaces del sidebar */}
          <nav className="p-4">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  pathname === link.href
                    ? 'bg-gradient-to-l from-transparent to-[var(--color-primary)] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-4"
            >
              <FaSignOutAlt />
              <span>Cerrar Sesión</span>
            </button>
          </nav>
        </div>

        {/* Contenido principal */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-8">
            {children}
          </div>
        </main>

        {/* Renderizar el modal global aquí, dentro del provider y del div principal */}
        <GlobalConfirmationModal />
        
      </div>
    </ConfirmationModalProvider>
  );
} 