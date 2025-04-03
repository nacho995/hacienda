"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ToastContainer } from 'react-toastify';

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  
  // No mostrar Navbar ni Footer en rutas de admin
  const isAdminPage = pathname?.startsWith('/admin');
  
  return (
    <>
      {!isAdminPage && <Navbar />}
      {children}
      {!isAdminPage && <Footer />}
      {!isAdminPage && (
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
      )}
    </>
  );
} 