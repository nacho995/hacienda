'use client';

import { useState } from 'react';
import { 
  assignEventoReservation, 
  unassignEventoReservation
} from '@/services/reservationService';
import { FaCalendarAlt, FaSpinner, FaPlus, FaReply, FaUser, FaUserCheck, FaLock } from 'react-icons/fa';
import { toast } from 'sonner';
import ConfirmationModal from '../modals/ConfirmationModal';

const ReservaEventosList = ({ reservations, isAssignedToMe, onReservationUpdated }) => {
  const [loadingReservations, setLoadingReservations] = useState({});
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: null, reservaId: null, accion: null });

  // Asignar reserva al usuario actual
  const handleAssignReservation = async (id) => {
    try {
      setLoadingReservations(prev => ({ ...prev, [id]: true }));
      console.log('Asignando evento:', id);

      const response = await assignEventoReservation(id);
      
      console.log('Respuesta de asignación:', response);
      
      if (response && (response.success || response.data)) {
        toast.success('Reserva asignada exitosamente');
        
        // Ejecutar la función de actualización pasada como prop
        onReservationUpdated();
        
        // Forzar una recarga de la página para asegurar datos actualizados
        setTimeout(() => {
          window.location.href = '/admin/reservaciones/eventos#reload';
        }, 500);
      } else {
        toast.error(response?.message || 'Error al asignar la reserva');
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
      console.log('Desasignando evento:', id);
      const response = await unassignEventoReservation(id);
      
      console.log('Respuesta de desasignación:', response);
      
      if (response && (response.success || response.data)) {
        toast.success('Reserva liberada exitosamente');
        
        // Ejecutar la función de actualización pasada como prop
        onReservationUpdated();
        
        // La redirección ahora se maneja en unassignEventoReservation
      } else {
        toast.error(response?.message || 'Error al liberar la reserva');
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

  // Función auxiliar para obtener el texto del tipo de evento
  const getTipoEventoText = (tipoEvento) => {
    if (!tipoEvento) return 'Sin tipo';
    
    // Si es un objeto con título, mostrar el título
    if (typeof tipoEvento === 'object') {
      return tipoEvento.titulo || 'Tipo desconocido';
    }
    
    // Si es un string, devolverlo directamente
    return tipoEvento;
  };

  // Función para obtener el nombre del usuario asignado en formato legible
  const getNombreUsuarioAsignado = (reserva, esAsignadoAMi) => {
    if (!reserva.asignadoA) return null;
    
    if (esAsignadoAMi) {
      return 'Ti';
    }
    
    if (typeof reserva.asignadoA === 'object') {
      const nombre = reserva.asignadoA.nombre || '';
      const apellidos = reserva.asignadoA.apellidos || '';
      return `${nombre} ${apellidos}`.trim() || 'Usuario desconocido';
    }
    
    return 'Otro usuario';
  };

  // Depurar el estado de asignación de cada evento
  console.log('Eventos recibidos en lista:', reservations.map(r => ({
    id: r._id,
    nombre: r.nombreEvento,
    asignadoA: r.asignadoA,
    asignadoAMi: isAssignedToMe(r)
  })));

  const openConfirmationModal = (reservaId, accion, title, message) => {
    const confirmAction = async () => {
      try {
        setModalState(prev => ({ ...prev, isLoading: true }));
        if (accion === 'eliminar') {
          await handleEliminarReserva(reservaId); // Asumiendo función existente
        } else if (accion === 'cancelar') {
          await handleActualizarEstado(reservaId, 'cancelada'); // Asumiendo función existente
        } else if (accion === 'confirmar') {
          await handleActualizarEstado(reservaId, 'confirmada'); // Asumiendo función existente
        } // Añadir más acciones si es necesario
        closeModal();
        // Opcional: Refrescar datos
        if (onActionComplete) onActionComplete();
      } catch (error) { 
        console.error(`Error al ejecutar acción ${accion} para reserva ${reservaId}:`, error);
        setModalState(prev => ({ ...prev, error: error.message || 'Ocurrió un error', isLoading: false }));
      }
    };

    setModalState({
      isOpen: true,
      title: title,
      message: message,
      onConfirm: confirmAction,
      reservaId: reservaId,
      accion: accion,
      isLoading: false,
      error: null
    });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, title: '', message: '', onConfirm: null, reservaId: null, accion: null });
  };

  if (!reservations || reservations.length === 0) {
    return (
      <div className="text-center py-8 border border-gray-200 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-2">No hay eventos disponibles</h3>
        <p className="text-gray-500">No se encontraron eventos en esta categoría</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {reservations.map((reserva) => {
          // Determinar si está asignado a mí
          const esAsignadoAMi = isAssignedToMe(reserva);
          const nombreAsignado = getNombreUsuarioAsignado(reserva, esAsignadoAMi);
          
          return (
            <div 
              key={reserva._id} 
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                esAsignadoAMi ? 'border-purple-500 bg-purple-50' : 
                reserva.asignadoA ? 'border-gray-300 bg-gray-50' : 
                'border-gray-200'
              }`}
            >
              {/* Banner de asignación mejorado */}
              {reserva.asignadoA && (
                <div className={`mb-3 py-2 px-3 rounded-md flex items-center justify-between ${
                  esAsignadoAMi 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                }`}>
                  <div className="flex items-center">
                    {esAsignadoAMi ? (
                      <FaUserCheck className="mr-2 text-white" />
                    ) : (
                      <FaLock className="mr-2 text-white" />
                    )}
                    <span className="font-medium">
                      {esAsignadoAMi ? 'Asignado a ti' : 'No disponible'}
                    </span>
                  </div>
                  {!esAsignadoAMi && nombreAsignado && (
                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                      {nombreAsignado}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{reserva.nombreEvento}</h4>
                  <p className="text-sm text-gray-600">{getTipoEventoText(reserva.tipoEvento)}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  reserva.estadoReserva?.toLowerCase() === 'confirmada' ? 'bg-green-100 text-green-800' : 
                  reserva.estadoReserva?.toLowerCase() === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {reserva.estadoReserva || 'Pendiente'}
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
                {esAsignadoAMi ? (
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
                ) : reserva.asignadoA ? (
                  // Evento asignado a otro usuario con mejor estilo
                  <div className="w-full">
                    <div className="mb-2 text-sm text-center text-gray-500 italic">
                      Este evento ya ha sido asignado a otro usuario
                    </div>
                    <button
                      disabled={true}
                      className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md flex items-center justify-center"
                    >
                      <FaLock className="mr-2" />
                      No disponible
                    </button>
                  </div>
                ) : (
                  // Evento sin asignar
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
          );
        })}
      </div>
      <ConfirmationModal 
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        isLoading={modalState.isLoading}
        errorMessage={modalState.error}
      />
    </>
  );
};

export default ReservaEventosList; 