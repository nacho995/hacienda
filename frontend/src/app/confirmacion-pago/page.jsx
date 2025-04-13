"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaHome } from 'react-icons/fa'; // Importar iconos
import Link from 'next/link'; // Para enlaces

// Carga tu clave pública de Stripe (asegúrate que esté en .env.local del frontend)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'TU_CLAVE_PUBLICA_AQUI');

function PaymentStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stripe, setStripe] = useState(null);
  const [message, setMessage] = useState('Verificando estado del pago...');
  const [status, setStatus] = useState('loading'); // 'loading', 'succeeded', 'failed', 'processing', 'error'
  const [reservaId, setReservaId] = useState(null);

  useEffect(() => {
    // Cargar instancia de Stripe
    stripePromise.then(stripeInstance => {
      setStripe(stripeInstance);
    });
  }, []);

  useEffect(() => {
    if (!stripe) {
      console.log("Stripe.js no ha cargado aún.");
      return;
    }

    const clientSecret = searchParams.get('payment_intent_client_secret');
    const redirectStatus = searchParams.get('redirect_status'); // Estado de la redirección en sí
    const paymentIntentId = searchParams.get('payment_intent'); // ID del PaymentIntent
    const reservaIdParam = searchParams.get('reserva_id'); // ID de nuestra reserva

    setReservaId(reservaIdParam); // Guardar ID para mostrarlo si es necesario

    console.log("Parámetros de URL:", { clientSecret, redirectStatus, paymentIntentId, reservaIdParam });

    if (!clientSecret) {
      console.error("Falta payment_intent_client_secret en la URL.");
      setMessage('Error: No se pudo verificar el pago (faltan datos).');
      setStatus('error');
      return;
    }

    // Recuperar el PaymentIntent desde Stripe para obtener el estado real
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent, error }) => {
      if (error) {
        console.error("Error recuperando PaymentIntent:", error);
        setMessage(`Error al verificar el pago: ${error.message}`);
        setStatus('error');
        return;
      }

      console.log("Estado del PaymentIntent recuperado:", paymentIntent?.status);

      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('¡Pago completado con éxito! Tu reserva está confirmada.');
          setStatus('succeeded');
          // Aquí podrías hacer una llamada a tu backend si necesitas confirmar algo más,
          // pero idealmente el webhook ya actualizó tu base de datos.
          break;
        case 'processing':
          setMessage('El pago se está procesando. Te notificaremos cuando se complete.');
          setStatus('processing');
          break;
        case 'requires_payment_method':
          setMessage('Pago fallido. Por favor, intenta con otro método de pago o tarjeta.');
          setStatus('failed');
          // Podrías redirigir de vuelta a la página de pago con un error
          // setTimeout(() => router.push(`/ruta/a/pago?reservaId=${reservaIdParam}&error=payment_failed`), 3000);
          break;
        case 'requires_action':
            setMessage('Se requiere una acción adicional para completar el pago.');
            setStatus('failed'); // Considerarlo fallido si la acción no se completó
            break;
        case 'canceled':
             setMessage('El pago fue cancelado.');
             setStatus('failed');
             break;
        default:
          setMessage('Algo salió mal con el pago. Por favor, contacta soporte.');
          setStatus('error');
          break;
      }
    });
  }, [stripe, searchParams, router]); // Dependencias del useEffect

  // Función para renderizar icono según el estado
  const renderIcon = () => {
    switch (status) {
      case 'succeeded':
        return <FaCheckCircle className="text-6xl text-green-500 mb-4" />;
      case 'failed':
      case 'error':
        return <FaTimesCircle className="text-6xl text-red-500 mb-4" />;
      case 'processing':
      case 'loading':
      default:
        return <FaSpinner className="text-6xl text-blue-500 mb-4 animate-spin" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {renderIcon()}
      <h1 className={`text-2xl md:text-3xl font-bold mb-4
        ${status === 'succeeded' ? 'text-green-700' : ''}
        ${status === 'failed' || status === 'error' ? 'text-red-700' : ''}
        ${status === 'processing' || status === 'loading' ? 'text-blue-700' : ''}
      `}>
        {status === 'succeeded' ? 'Pago Exitoso' :
         status === 'failed' ? 'Pago Fallido' :
         status === 'error' ? 'Error' :
         'Procesando Pago'}
      </h1>
      <p className="text-gray-600 text-lg mb-8 max-w-md">{message}</p>
      <Link href="/" className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700 transition-colors">
        <FaHome className="mr-2" />
        Volver al Inicio
      </Link>
      {/* Opcional: Mostrar ID de reserva */}
      {/* {reservaId && <p className="text-sm text-gray-500 mt-4">ID de Reserva: {reservaId}</p>} */}
    </div>
  );
}

// Usar Suspense para manejar la carga de searchParams
export default function ConfirmacionPagoPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>}>
            <PaymentStatus />
        </Suspense>
    );
}