'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { obtenerReservaPublica } from '@/services/reservas.service';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaUsers, FaBuilding, FaBed, FaEnvelope, FaPhone, FaInfoCircle, FaHome, FaSpinner } from 'react-icons/fa';

export default function VerReservaPage() {
  const params = useParams();
  const { id } = params;
  const [reserva, setReserva] = useState(null);
  const [tipoReserva, setTipoReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchReserva = async () => {
        setLoading(true);
        setError(null);
        try {
          const result = await obtenerReservaPublica(id);
          if (result.success) {
            setReserva(result.data);
            setTipoReserva(result.tipo);
          } else {
            setError(result.message || 'No se pudo cargar la reserva.');
          }
        } catch (err) {
          console.error("Error fetching reserva:", err);
          setError('Error al conectar con el servidor. Inténtelo más tarde.');
        } finally {
          setLoading(false);
        }
      };
      fetchReserva();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
        const date = new Date(dateString);
        // Ajustar por zona horaria si es necesario
        // const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        // const localDate = new Date(date.getTime() + userTimezoneOffset);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString; // Devolver el string original si falla
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Hora no disponible';
    // Simple formato HH:MM
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-lg text-gray-600">Cargando detalles de la reserva...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md border border-red-200">
          <FaInfoCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-red-700 mb-2">Error al Cargar la Reserva</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-secondary)] transition">
            <FaHome className="mr-2" /> Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-600">No se encontró información de la reserva.</p>
          <Link href="/" className="mt-4 inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-secondary)] transition">
            <FaHome className="mr-2" /> Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  // Renderizado condicional basado en tipoReserva
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[var(--color-primary)] p-6 text-white">
          <h1 className="text-3xl font-bold text-center">
            Detalles de tu Reserva - {tipoReserva === 'evento' ? 'Evento' : 'Habitación'}
          </h1>
        </div>

        <div className="p-8 space-y-6">
          {/* Sección Contacto */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <p><FaUser className="inline mr-2 text-[var(--color-primary)]" /> Nombre: <strong>{reserva.nombreContacto} {reserva.apellidosContacto}</strong></p>
              <p><FaEnvelope className="inline mr-2 text-[var(--color-primary)]" /> Email: <strong>{reserva.emailContacto}</strong></p>
              {/* Podríamos añadir teléfono si está en los datos públicos */} 
            </div>
          </div>

          {/* Sección Detalles Específicos */}
          {tipoReserva === 'evento' && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Detalles del Evento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p><FaBuilding className="inline mr-2 text-[var(--color-primary)]" /> Tipo: <strong>{reserva.tipoEvento?.titulo || 'Evento Especial'}</strong></p>
                <p><FaCalendarAlt className="inline mr-2 text-[var(--color-primary)]" /> Fecha: <strong>{formatDate(reserva.fecha)}</strong></p>
                <p><FaClock className="inline mr-2 text-[var(--color-primary)]" /> Hora Inicio: <strong>{formatTime(reserva.horaInicio)}</strong></p>
                <p><FaClock className="inline mr-2 text-[var(--color-primary)]" /> Hora Fin: <strong>{formatTime(reserva.horaFin)}</strong></p>
                <p><FaUsers className="inline mr-2 text-[var(--color-primary)]" /> Invitados: <strong>{reserva.numeroInvitados || reserva.numInvitados || 'No especificado'}</strong></p>
                <p><FaInfoCircle className="inline mr-2 text-[var(--color-primary)]" /> Espacio: <strong>{reserva.espacioSeleccionado || 'No especificado'}</strong></p>
                <p><FaInfoCircle className="inline mr-2 text-[var(--color-primary)]" /> Estado: <strong className={`capitalize px-2 py-1 rounded-full text-sm ${reserva.estadoReserva === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{reserva.estadoReserva || 'Pendiente'}</strong></p>
              </div>
            </div>
          )}

          {tipoReserva === 'habitacion' && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4">Detalles de la Habitación</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                 <p><FaBed className="inline mr-2 text-[var(--color-primary)]" /> Habitación: <strong>{reserva.habitacion?.letra || reserva.habitacion?.nombre || 'No asignada'}</strong></p>
                 <p><FaBed className="inline mr-2 text-[var(--color-primary)]" /> Tipo: <strong>{reserva.tipoHabitacion?.nombre || 'No especificado'}</strong></p>
                 <p><FaCalendarAlt className="inline mr-2 text-[var(--color-primary)]" /> Llegada: <strong>{formatDate(reserva.fechaEntrada)}</strong></p>
                 <p><FaCalendarAlt className="inline mr-2 text-[var(--color-primary)]" /> Salida: <strong>{formatDate(reserva.fechaSalida)}</strong></p>
                 <p><FaUsers className="inline mr-2 text-[var(--color-primary)]" /> Huéspedes: <strong>{reserva.numeroHuespedes || 'No especificado'}</strong></p>
                 <p><FaInfoCircle className="inline mr-2 text-[var(--color-primary)]" /> Estado: <strong className={`capitalize px-2 py-1 rounded-full text-sm ${reserva.estadoReserva === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{reserva.estadoReserva || 'Pendiente'}</strong></p>
               </div>
            </div>
          )}

          {/* Pie de Página */}
          <div className="text-center pt-6">
            <p className="text-sm text-gray-500 mb-4">Si tienes alguna pregunta sobre tu reserva, por favor contáctanos.</p>
            <Link href="/contacto" className="inline-flex items-center px-6 py-3 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-[var(--color-brown-dark)] transition shadow">
              <FaPhone className="mr-2" /> Contactar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 