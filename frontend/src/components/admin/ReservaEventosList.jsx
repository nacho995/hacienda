'use client';

import { useState, useEffect } from 'react';
import { 
  getUnassignedEventoReservations, 
  assignEventoReservation, 
  unassignEventoReservation,
  getEventoReservations
} from '@/services/reservationService';
import { useAuth } from '@/context/AuthContext';
import { FaCalendarAlt, FaUserClock, FaSpinner, FaPlus, FaReply } from 'react-icons/fa';
import { toast } from 'sonner';

const ReservaEventosList = () => {
  const { user } = useAuth();
  const [unassignedReservations, setUnassignedReservations] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('unassigned');

  // Cargar reservas
  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener reservas sin asignar
      const unassignedData = await getUnassignedEventoReservations();
      setUnassignedReservations(
        Array.isArray(unassignedData.data) ? unassignedData.data : []
      );

      // Obtener todas las reservas y filtrar las asignadas al usuario actual
      const allReservationsData = await getEventoReservations();
      const myAssignedReservations = Array.isArray(allReservationsData.data)
        ? allReservationsData.data.filter(
            (res) => res.asignadoA && res.asignadoA === user.id
          )
        : [];
      setMyReservations(myAssignedReservations);
    } catch (err) {
      console.error('Error cargando reservas:', err);
      setError('Error al cargar las reservas. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar reservas al montar el componente
  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user]);

  // Asignar reserva al usuario actual
  const handleAssignReservation = async (id) => {
    try {
      await assignEventoReservation(id);
      toast.success('Reserva asignada exitosamente');
      loadReservations(); // Recargar para actualizar las listas
    } catch (error) {
      console.error('Error al asignar reserva:', error);
      toast.error('Error al asignar la reserva');
    }
  };

  // Desasignar reserva
  const handleUnassignReservation = async (id) => {
    try {
      await unassignEventoReservation(id);
      toast.success('Reserva liberada exitosamente');
      loadReservations(); // Recargar para actualizar las listas
    } catch (error) {
      console.error('Error al liberar reserva:', error);
      toast.error('Error al liberar la reserva');
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-[var(--color-primary)] text-4xl mb-4" />
        <p className="text-gray-600">Cargando reservas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={loadReservations}
          className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-3 flex items-center ${
            activeTab === 'unassigned'
              ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('unassigned')}
        >
          <FaCalendarAlt className="mr-2" />
          Reservas Disponibles
          {unassignedReservations.length > 0 && (
            <span className="ml-2 bg-[var(--color-primary)] text-white rounded-full text-xs px-2 py-1">
              {unassignedReservations.length}
            </span>
          )}
        </button>
        <button
          className={`px-4 py-3 flex items-center ${
            activeTab === 'assigned'
              ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('assigned')}
        >
          <FaUserClock className="mr-2" />
          Mis Reservas
          {myReservations.length > 0 && (
            <span className="ml-2 bg-[var(--color-primary)] text-white rounded-full text-xs px-2 py-1">
              {myReservations.length}
            </span>
          )}
        </button>
      </div>

      {/* Lista de Reservas sin Asignar */}
      {activeTab === 'unassigned' && (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Reservas de Eventos Disponibles</h3>
          {unassignedReservations.length === 0 ? (
            <p className="text-gray-500 py-4">No hay reservas disponibles para asignar.</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {unassignedReservations.map((reserva) => (
                <div 
                  key={reserva._id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{reserva.nombreEvento}</h4>
                      <p className="text-sm text-gray-600">{reserva.tipoEvento}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {reserva.estadoReserva}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Cliente:</span>{" "}
                      {reserva.nombreContacto} {reserva.apellidosContacto}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Fecha:</span> {formatDate(reserva.fecha)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Horario:</span> {reserva.horaInicio} - {reserva.horaFin}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Invitados:</span> {reserva.numeroInvitados}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Espacio:</span> {reserva.espacioSeleccionado}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAssignReservation(reserva._id)}
                    className="mt-4 w-full bg-[var(--color-primary)] text-white py-2 px-4 rounded-md hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center"
                  >
                    <FaPlus className="mr-2" />
                    Asignar a mi cuenta
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista de Mis Reservas Asignadas */}
      {activeTab === 'assigned' && (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Mis Reservas de Eventos</h3>
          {myReservations.length === 0 ? (
            <p className="text-gray-500 py-4">No tienes reservas asignadas.</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {myReservations.map((reserva) => (
                <div 
                  key={reserva._id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{reserva.nombreEvento}</h4>
                      <p className="text-sm text-gray-600">{reserva.tipoEvento}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {reserva.estadoReserva}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Cliente:</span>{" "}
                      {reserva.nombreContacto} {reserva.apellidosContacto}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Fecha:</span> {formatDate(reserva.fecha)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Horario:</span> {reserva.horaInicio} - {reserva.horaFin}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Invitados:</span> {reserva.numeroInvitados}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Espacio:</span> {reserva.espacioSeleccionado}
                    </p>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <a
                      href={`/admin/reservaciones/evento/id?id=${reserva._id}`}
                      className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      Ver detalles
                    </a>
                    <button
                      onClick={() => handleUnassignReservation(reserva._id)}
                      className="flex-1 bg-amber-100 text-amber-800 py-2 px-4 rounded-md hover:bg-amber-200 transition-colors flex items-center justify-center"
                    >
                      <FaReply className="mr-2" />
                      Liberar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservaEventosList; 