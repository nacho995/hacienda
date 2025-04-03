"use client";

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  
  // Verificar si estamos en páginas de autenticación
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/registro';
  
  return (
    <>
      {isAuthPage ? (
        // Para páginas de autenticación, mostrar solo el contenido
        <div className="min-h-screen flex items-center justify-center">
          {children}
        </div>
      ) : (
        // Para el resto de páginas admin, usar el AdminLayout
        <AdminLayout>
          {children}
        </AdminLayout>
      )}
      
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
} 