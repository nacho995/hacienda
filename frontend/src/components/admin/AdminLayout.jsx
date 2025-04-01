"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  FaCalendarAlt,
  FaBed,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/admin/reservaciones',
      label: 'Reservaciones',
      icon: FaCalendarAlt
    },
    {
      href: '/admin/habitaciones',
      label: 'Habitaciones',
      icon: FaBed
    },
    {
      href: '/admin/usuarios',
      label: 'Usuarios',
      icon: FaUsers
    },
    {
      href: '/admin/configuracion',
      label: 'Configuración',
      icon: FaCog
    }
  ];

  const handleLogout = () => {
    // Aquí iría la lógica de cierre de sesión
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100" style={{ zIndex: 50, position: 'relative' }}>
      {/* Sidebar para móvil */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        >
          {isSidebarOpen ? (
            <FaTimes className="w-6 h-6 text-[var(--color-primary)]" />
          ) : (
            <FaBars className="w-6 h-6 text-[var(--color-primary)]" />
          )}
        </button>
      </div>

      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-white shadow-xl`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link
              href="/admin"
              className="text-2xl font-[var(--font-display)] text-[var(--color-accent)]"
            >
              Panel Admin
            </Link>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Botón de cierre de sesión */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
} 