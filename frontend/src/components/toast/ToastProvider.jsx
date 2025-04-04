"use client";

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: '#333',
          color: '#fff',
        },
        success: {
          style: {
            background: 'green',
          },
        },
        error: {
          style: {
            background: 'red',
          },
        },
      }}
    />
  );
} 