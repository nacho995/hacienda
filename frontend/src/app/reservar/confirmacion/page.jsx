'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { obtenerReservaEvento } from '@/services/reservas.service';
import { FaCalendarAlt, FaBed, FaUtensils, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import NavbarReservar from '@/components/layout/NavbarReservar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';

// Componente Loading específico para el contenido de la reserva
const LoadingReserva = () => (
  <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
      <div className="h-16 bg-gray-100 rounded mt-8"></div>
    </div>
  </div>
);

// Componente principal que usa useSearchParams
function ConfirmacionContenido() {
  const searchParams = useSearchParams();
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      cargarReserva(id);
    } else {
      setError('No se proporcionó ID de reserva');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const cargarReserva = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await obtenerReservaEvento(id);
      if (response.success) {
        setReserva(response.data);
      } else {
        throw new Error(response.message || 'Error al cargar la reserva');
      }
    } catch (err) {
      console.error('Error al cargar la reserva:', err);
      setError(err.message || 'Error al cargar los detalles de la reserva');
      toast.error('Error al cargar los detalles de la reserva');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingReserva />; 
  }

  if (error || !reserva) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Reserva</h2>
        <p className="text-gray-600">{error || 'Lo sentimos, no pudimos encontrar los detalles de la reserva.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#8B6B4F] mb-2">¡Reserva Confirmada!</h1>
        <p className="text-gray-600">Gracias por confiar en nosotros para tu evento especial</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#8B6B4F] mb-4">Detalles del Evento</h2>
          
          <div className="flex items-center space-x-3">
            <FaCalendarAlt className="text-[#A5856A]" />
            <div>
              <p className="font-medium">Fecha del Evento</p>
              <p className="text-gray-600">{new Date(reserva.fecha).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FaUser className="text-[#A5856A]" />
            <div>
              <p className="font-medium">Tipo de Evento</p>
              <p className="text-gray-600">{reserva.tipoEvento?.titulo || reserva.tipoEvento?.nombre || 'No especificado'}</p>
            </div>
          </div>

          {reserva.habitaciones?.length > 0 && (
            <div className="flex items-center space-x-3">
              <FaBed className="text-[#A5856A]" />
              <div>
                <p className="font-medium">Habitaciones Reservadas</p>
                <p className="text-gray-600">{reserva.habitaciones.length} habitaciones</p>
              </div>
            </div>
          )}

          {reserva.servicios_adicionales?.length > 0 && (
            <div className="flex items-center space-x-3">
              <FaUtensils className="text-[#A5856A]" />
              <div>
                <p className="font-medium">Servicios Adicionales</p>
                <ul className="text-gray-600">
                  {reserva.servicios_adicionales.map((servicio, index) => (
                    <li key={index}>{servicio}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#8B6B4F] mb-4">Información de Contacto</h2>
          
          <div className="flex items-center space-x-3">
            <FaUser className="text-[#A5856A]" />
            <div>
              <p className="font-medium">Nombre Completo</p>
              <p className="text-gray-600">{reserva.nombreContacto} {reserva.apellidosContacto}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FaEnvelope className="text-[#A5856A]" />
            <div>
              <p className="font-medium">Correo Electrónico</p>
              <p className="text-gray-600">{reserva.emailContacto}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FaPhone className="text-[#A5856A]" />
            <div>
              <p className="font-medium">Teléfono</p>
              <p className="text-gray-600">{reserva.telefonoContacto}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-[#F9F5F2] rounded-lg">
        <p className="text-center text-gray-700">
          Hemos enviado un correo electrónico de confirmación a {reserva.emailContacto} con todos los detalles de tu reserva.
          <br />
          Si tienes alguna pregunta, no dudes en contactarnos.
        </p>
      </div>
    </div>
  );
}

// Página principal que envuelve el contenido con Suspense
export default function ConfirmacionReservaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarReservar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingReserva />}>
          <ConfirmacionContenido />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
} 