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

export default function AdminLayout({ children }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Obtener información del usuario
  useEffect(() => {
    const checkSession = () => {
      try {
        // Obtener la cookie de sesión
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('adminSession='));
        
        if (!sessionCookie) {
          // No hay sesión, redirigir al login
          router.push('/admin/login');
          return;
        }
        
        // Extraer el valor de la cookie
        const sessionValue = sessionCookie.split('=')[1];
        // Intentar decodificar la cookie (puede estar codificada en URI)
        let sessionData;
        try {
          sessionData = JSON.parse(decodeURIComponent(sessionValue));
        } catch (e) {
          // Si falla el decodeURIComponent, intentar sin decodificar
          sessionData = JSON.parse(sessionValue);
        }
        
        // Verificar que la sesión sea válida
        if (!sessionData || !sessionData.authenticated) {
          router.push('/admin/login');
          return;
        }
        
        // Guardar datos del usuario
        setUserData(sessionData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error verificando sesión:', error);
        // Si hay algún error, redirigir al login
        router.push('/admin/login');
      }
    };
    
    checkSession();
  }, [router, pathname]);

  // Función para cerrar sesión
  const handleLogout = () => {
    // Eliminar la cookie
    document.cookie = 'adminSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Redirigir al login
    router.push('/admin/login');
  };

  // Si no hay datos de usuario, mostrar una pantalla de carga
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Cargando...</h1>
          <p>Verificando tu sesión</p>
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
              <span className="text-lg font-semibold">{userData.name?.charAt(0) || 'A'}</span>
            </div>
            <div>
              <div className="font-semibold">{userData.name || 'Administrador'}</div>
              <div className="text-sm text-slate-300">{userData.email}</div>
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