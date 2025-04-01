"use client";

import '../globals.css';
import AdminLayout from '@/components/admin/AdminLayout';
import { usePathname } from 'next/navigation';

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  
  // Si estamos en las páginas de autenticación, no mostrar el AdminLayout
  if (pathname === '/admin/login' || pathname === '/admin/registro') {
    return (
      <div className="admin-page">
        <div className="admin-auth-page">
          {children}
        </div>
      </div>
    );
  }
  
  // Para el resto de páginas admin, usar el AdminLayout
  return (
    <div className="admin-page">
      <AdminLayout>
        {children}
      </AdminLayout>
    </div>
  );
} 