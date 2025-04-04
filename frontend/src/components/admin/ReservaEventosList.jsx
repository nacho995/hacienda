'use client';

import { useState } from 'react';
import { 
  assignEventoReservation, 
  unassignEventoReservation
} from '@/services/reservationService';
import { FaCalendarAlt, FaSpinner, FaPlus, FaReply } from 'react-icons/fa';
import { toast } from 'sonner';

const ReservaEventosList = ({ reservations, isAssignedToMe, onReservationUpdated }) => {
  const [loadingReservations, setLoadingReservations] = useState({});

  // Asignar reserva al usuario actual
  const handleAssignReservation = async (id) => {
    try {
      setLoadingReservations(prev => ({ ...prev, [id]: true }));
      const response = await assignEventoReservation(id);
      
      if (response.success) {
        toast.success('Reserva asignada exitosamente');
        onReservationUpdated();
      } else {
        toast.error(response.message || 'Error al asignar la reserva');
      }
    } catch (error) {
      console.error('Error al asignar reserva:', error);
      toast.error(error.message || 'Error al asignar la reserva');
    } finally {
      setLoadingReservations(prev => ({ ...prev, [id]: false }));
    }
  };

  // Desasignar reserva
  const handleUnassignReservation = async (id) => {
    try {
      setLoadingReservations(prev => ({ ...prev, [id]: true }));
      const response = await unassignEventoReservation(id);
      
      if (response.success) {
        toast.success('Reserva liberada exitosamente');
        onReservationUpdated();
      } else {
        toast.error(response.message || 'Error al liberar la reserva');
      }
    } catch (error) {
      console.error('Error al liberar reserva:', error);
      toast.error(error.message || 'Error al liberar la reserva');
    } finally {
      setLoadingReservations(prev => ({ ...prev, [id]: false }));
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

  if (!reservations || reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay reservas disponibles.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {reservations.map((reserva) => (
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
            {isAssignedToMe(reserva) ? (
              <>
                <a
                  href={`/admin/reservaciones/evento/${reserva._id}`}
                  className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  Ver detalles
                </a>
                <button
                  onClick={() => handleUnassignReservation(reserva._id)}
                  disabled={loadingReservations[reserva._id]}
                  className="flex-1 bg-amber-100 text-amber-800 py-2 px-4 rounded-md hover:bg-amber-200 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {loadingReservations[reserva._id] ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <FaReply className="mr-2" />
                      Liberar
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => handleAssignReservation(reserva._id)}
                disabled={loadingReservations[reserva._id]}
                className="w-full bg-[var(--color-primary)] text-white py-2 px-4 rounded-md hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {loadingReservations[reserva._id] ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <FaPlus className="mr-2" />
                    Asignar a mi cuenta
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReservaEventosList; 