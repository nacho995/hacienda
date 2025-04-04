'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { getEventoReservations } from '@/services/reservationService';
import { useAuth } from '@/context/AuthContext';
import ReservaEventosList from '@/components/admin/ReservaEventosList';

export default function EventosReservacionesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('disponibles');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar las reservas al montar el componente
  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user]);

  // Función para cargar las reservas
  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEventoReservations();
      if (response.success) {
        setReservations(response.data || []);
      } else {
        setError('Error al cargar las reservas');
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setError('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si una reserva está asignada al usuario actual
  const isAssignedToMe = (reserva) => {
    const reservaAsignadaId = typeof reserva.asignadoA === 'object' ? 
      reserva.asignadoA?._id : 
      reserva.asignadoA;
    return reservaAsignadaId === user?._id;
  };

  // Filtrar reservas según la pestaña activa
  const getFilteredReservations = () => {
    return reservations.filter(reserva => {
      const reservaAsignadaId = typeof reserva.asignadoA === 'object' ? 
        reserva.asignadoA?._id : 
        reserva.asignadoA;

      if (activeTab === 'disponibles') {
        return !reservaAsignadaId;
      } else {
        return reservaAsignadaId === user?._id;
      }
    });
  };

  const filteredReservations = getFilteredReservations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Administración de Reservas de Eventos
        </h1>
        <Link 
          href="/admin/reservaciones" 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" />
          Volver a Reservaciones
        </Link>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <p className="text-blue-700">
          En esta página puedes ver todas las reservas de eventos disponibles para ser asignadas, así como las reservas que ya tienes asignadas a tu cuenta. 
          Puedes asignar reservas a tu cuenta para trabajar en ellas y liberarlas si deseas que otro usuario pueda manejarlas.
        </p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('disponibles')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'disponibles'
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Reservas Disponibles
        </button>
        <button
          onClick={() => setActiveTab('mis_reservas')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'mis_reservas'
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Mis Reservas
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <p>Cargando reservas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={loadReservations}
            className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
          >
            Intentar nuevamente
          </button>
        </div>
      ) : (
        <ReservaEventosList 
          reservations={filteredReservations}
          isAssignedToMe={isAssignedToMe}
          onReservationUpdated={loadReservations}
        />
      )}
    </div>
  );
} 