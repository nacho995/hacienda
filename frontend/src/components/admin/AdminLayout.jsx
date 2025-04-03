"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  FaCalendarAlt,
  FaBed,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaEye,
  FaUserShield,
  FaChartPie
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();
  
  // Redirigir al login si no está autenticado o no es admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        toast.success('Sesión cerrada correctamente');
        router.push('/admin/login');
      } else {
        toast.error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error en logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  // Si está cargando o no hay usuario autenticado, mostrar una pantalla de carga
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-800">
        <div className="bg-slate-700 p-8 rounded-lg shadow-md text-white">
          <h1 className="text-2xl font-bold mb-4">Cargando...</h1>
          <p>Verificando tu sesión</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  // Enlaces del sidebar
  const sidebarLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <FaChartPie /> },
    { name: 'Reservaciones', href: '/admin/reservaciones', icon: <FaCalendarAlt /> },
    { name: 'Habitaciones', href: '/admin/habitaciones', icon: <FaBed /> },
    { name: 'Usuarios', href: '/admin/usuarios', icon: <FaUsers /> },
    { name: 'Configuración', href: '/admin/configuracion', icon: <FaCog /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      {/* Sidebar para móvil - Toggle button */}
      <div className="md:hidden bg-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="Logo Hacienda San Carlos" 
            width={40} 
            height={40} 
            className="mr-2"
          />
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`bg-slate-800 text-white w-full md:w-64 flex-shrink-0 transition-all duration-300 ease-in-out 
                      ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        {/* Logo y título */}
        <div className="p-4 border-b border-slate-700 hidden md:flex items-center">
          <Image 
            src="/logo.png" 
            alt="Logo Hacienda San Carlos" 
            width={40} 
            height={40} 
            className="mr-2"
          />
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>
        
        {/* Información del usuario */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center">
            <div className="bg-slate-600 w-10 h-10 rounded-full flex items-center justify-center mr-2">
              <span className="text-lg font-semibold">{user.nombre?.charAt(0) || user.email?.charAt(0) || 'A'}</span>
            </div>
            <div>
              <div className="font-semibold">{user.nombre || 'Administrador'}</div>
              <div className="text-sm text-slate-300">{user.email}</div>
            </div>
          </div>
        </div>
        
        {/* Enlaces de navegación */}
        <nav className="py-4">
          <ul>
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} 
                  className={`flex items-center px-4 py-3 hover:bg-slate-700 transition-colors 
                  ${pathname === link.href ? 'bg-slate-700 border-l-4 border-amber-500' : ''}`}>
                  <span className="mr-3">{link.icon}</span>
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <button 
                onClick={handleLogout}
                className="w-full text-left flex items-center px-4 py-3 hover:bg-slate-700 transition-colors text-red-300 hover:text-red-200"
              >
                <span className="mr-3"><FaSignOutAlt /></span>
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        {/* Header móvil cuando sidebar está cerrado */}
        {!isSidebarOpen && (
          <div className="md:hidden bg-white p-4 shadow-md">
            <h1 className="text-xl font-semibold">
              {sidebarLinks.find(link => link.href === pathname)?.name || 'Panel de Administración'}
            </h1>
          </div>
        )}
        
        {/* Contenido */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 