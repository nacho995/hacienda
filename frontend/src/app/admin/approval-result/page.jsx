"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function ApprovalResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState({
    success: null,
    message: '',
    email: '',
    role: '',
    denied: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const successParam = searchParams.get('success');
    const messageParam = searchParams.get('message');
    const emailParam = searchParams.get('email');
    const roleParam = searchParams.get('role');
    const deniedParam = searchParams.get('denied');

    const success = successParam === 'true';
    const denied = deniedParam === 'true';
    let displayMessage = '';

    if (success) {
      if (denied) {
        displayMessage = `La solicitud de acceso para \"${emailParam || 'el usuario'}\" ha sido denegada correctamente.`;
      } else if (roleParam) {
        displayMessage = `¡Éxito! La cuenta para \"${emailParam || 'el usuario'}\" ha sido aprobada con el rol de ${roleParam}.`;
      } else {
        displayMessage = 'Operación completada con éxito.'; // Mensaje genérico si falta info
      }
    } else {
      displayMessage = messageParam || 'Ha ocurrido un error al procesar la solicitud.';
    }

    setResult({
      success,
      message: displayMessage,
      email: emailParam || '',
      role: roleParam || '',
      denied,
    });
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-xl max-w-lg w-full text-center border-t-4 ${
        result.success ? 'border-green-500' : 'border-red-500'
      }">
        {result.success ? (
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
        ) : (
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-6" />
        )}

        <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${
          result.success ? 'text-gray-800' : 'text-red-700'
        }`}>
          {result.success ? 'Operación Completada' : 'Error en la Operación'}
        </h1>

        <p className="text-gray-600 mb-8 text-lg">
          {result.message}
        </p>

        <Link href="/admin/dashboard">
          <span className="inline-block px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors cursor-pointer shadow-md">
            Volver al Dashboard
          </span>
        </Link>
      </div>
    </div>
  );
} 