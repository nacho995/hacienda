'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FaSort, FaSortUp, FaSortDown, FaSpinner, FaUserCircle,
  FaEye, FaTrashAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
  FaHandPointer,
  FaUndo,
  FaEllipsisV
} from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ConfirmationModal from '../modals/ConfirmationModal';

// --- Componente para el botón de menú --- 
const MenuButton = ({ children, onClick }) => (
  <button 
    onClick={onClick}
    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  >
    {children}
  </button>
);

const TablaReservaciones = ({ 
  reservations,
  onSort,
  sortConfig,
  isLoading,
  usuarios = [],
  onDelete,
  onChangeStatus,
  onAssign,
  onUnassign
}) => {
  const { user } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: null, reservaId: null, accion: null });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    try {
      return format(new Date(fecha), 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener el ID de forma segura
  const getReservationId = (reservation) => {
    return reservation._id || reservation.id;
  };
  
  // Obtener el nombre del usuario asignado
  const getUsuarioAsignado = (asignadoA) => {
    if (!asignadoA) return 'Sin asignar';
    
    // --- Extraer ID de forma más robusta --- 
    const usuarioId = (typeof asignadoA === 'object' && asignadoA !== null) ? asignadoA._id : asignadoA;
    // ----------------------------------------
    
    const usuario = usuarios.find(u => u._id === usuarioId);
    return usuario ? (usuario.nombre || usuario.email || 'Usuario') : 'Usuario desconocido';
  };

  const openConfirmationModal = (reservaId, accion, title, message) => {
    const confirmAction = async () => {
      try {
        setModalState(prev => ({ ...prev, isLoading: true }));
        if (accion === 'eliminar') {
          await handleEliminarReserva(reservaId);
        } else if (accion === 'cancelar') {
          await handleActualizarEstado(reservaId, 'cancelada');
        } else if (accion === 'confirmar') {
          await handleActualizarEstado(reservaId, 'confirmada');
        }
        closeModal();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay reservaciones disponibles</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort('fechaEvento')}
              >
                <div className="flex items-center gap-2">
                  Fecha
                  {getSortIcon('fechaEvento')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort('nombreCompleto')}
              >
                <div className="flex items-center gap-2">
                  Cliente
                  {getSortIcon('nombreCompleto')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort('estado')}
              >
                <div className="flex items-center gap-2">
                  Estado
                  {getSortIcon('estado')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Asignado a
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => {
              // Verificar si la reserva tiene datos mínimos necesarios
              if (!reservation) return null;
              
              // Obtener la información del cliente (ahora viene en reservation.clientePrincipal)
              // const cliente = getClienteInfo(reservation);
              const reservationId = getReservationId(reservation);
              const reservationType = reservation.tipo;
              const currentStatus = reservation.estadoReserva || reservation.estado;
              
              // Datos para el log
              const reservationIdForLog = reservation._id || reservation.id || 'ID_DESCONOCIDO';
              // console.log(`[Render TablaReservaciones] Reserva ${reservationIdForLog}: asignadoA =`, reservation.asignadoA);

              const isAssigned = !!reservation.asignadoA; // Check if it's assigned to anyone
              
              const canPerformCriticalActions = reservation.asignadoA === user?.id || reservation.asignadoA?._id === user?.id;
              
              return (
                <tr key={reservation.uniqueId || `${reservation.tipo}_${reservationId}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {/* Usar fechaMostrada */} 
                      {formatFecha(reservation.fechaMostrada)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {/* Usar clientePrincipal */} 
                      {reservation.clientePrincipal || 'No especificado'}
                    </div>
                    {/* Mostrar email/teléfono si están disponibles en la reserva */} 
                    {reservation.huesped?.email && (
                      <div className="text-sm text-gray-500">
                        {reservation.huesped.email}
                      </div>
                    )}
                    {reservation.huesped?.telefono && (
                      <div className="text-xs text-gray-500">
                        {reservation.huesped.telefono}
                      </div>
                    )}
                    {/* Compatibilidad con campos antiguos si es necesario */}
                    {(!reservation.huesped?.email && reservation.email) && (
                      <div className="text-sm text-gray-500">
                        {reservation.email}
                      </div>
                    )}
                    {(!reservation.huesped?.telefono && reservation.telefono) && (
                      <div className="text-xs text-gray-500">
                        {reservation.telefono}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reservation.tipo === 'evento' ? (
                       // Si es evento, mostrar el nombreMostrado que ya viene formateado
                      <div className="text-sm text-gray-900">
                         {reservation.nombreMostrado || 'Evento no especificado'}
                      </div>
                    ) : (
                       // Si es habitación, aplicar formato especial
                      <div className="text-sm text-gray-900">
                         <span>Habitación {reservation.letraHabitacionReal && reservation.letraHabitacionReal !== '?' ? reservation.letraHabitacionReal : 'N/A'}</span>
                         {/* Si hay un evento asociado, mostrarlo al lado */} 
                         {reservation.nombreEventoAsociado && (
                           <span className="ml-2 text-xs text-gray-500">
                             / {reservation.nombreEventoAsociado}
                           </span>
                         )}
                       </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(currentStatus)}`}>
                      {currentStatus || 'Desconocido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUserCircle className="text-gray-400 mr-2" />
                      {getUsuarioAsignado(reservation.asignadoA)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="relative inline-block text-left">
                      <div>
                        <button
                          type="button"
                          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-[var(--color-primary)]"
                          id={`menu-button-${reservationId}`}
                          aria-expanded={openMenuId === reservationId}
                          aria-haspopup="true"
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === reservationId ? null : reservationId); }}
                        >
                          <FaEllipsisV />
                        </button>
                      </div>

                      {openMenuId === reservationId && (
                        <div 
                          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10" 
                          role="menu" 
                          aria-orientation="vertical" 
                          aria-labelledby={`menu-button-${reservationId}`} 
                          tabIndex="-1"
                          onClick={() => setOpenMenuId(null)}
                        >
                          <div className="py-1" role="none">
                            <Link 
                              href={`/admin/reservaciones/${reservation.tipo}/${reservationId}`} 
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" 
                              role="menuitem" 
                              tabIndex="-1"
                            >
                              <FaEye className="mr-3" /> Ver Detalles
                            </Link>
                            
                            {!isAssigned && (
                              <MenuButton onClick={() => { onAssign(reservationId, reservationType); setOpenMenuId(null); }}>
                                <FaHandPointer className="mr-3 inline-block" /> Asignarme
                              </MenuButton>
                            )}

                            {isAssigned && (
                              <MenuButton onClick={() => { onUnassign(reservationId, reservationType); setOpenMenuId(null); }}>
                                <FaUndo className="mr-3 inline-block" /> Desasignar
                              </MenuButton>
                            )}

                            {canPerformCriticalActions && (
                              <>
                                {currentStatus !== 'confirmada' && (
                                  <MenuButton onClick={() => { onChangeStatus(reservationType, reservationId, 'confirmada'); setOpenMenuId(null); }}>
                                    <FaCheckCircle className="mr-3 inline-block text-green-500" /> Marcar Confirmada
                                  </MenuButton>
                                )}
                                {currentStatus !== 'pendiente' && (
                                  <MenuButton onClick={() => { onChangeStatus(reservationType, reservationId, 'pendiente'); setOpenMenuId(null); }}>
                                     <FaHourglassHalf className="mr-3 inline-block text-yellow-500" /> Marcar Pendiente
                                  </MenuButton>
                                )}
                                {currentStatus !== 'cancelada' && (
                                  <MenuButton onClick={() => { onChangeStatus(reservationType, reservationId, 'cancelada'); setOpenMenuId(null); }}>
                                    <FaTimesCircle className="mr-3 inline-block text-red-500" /> Marcar Cancelada
                                  </MenuButton>
                                )}
                              </>
                            )}

                            {canPerformCriticalActions && (
                              <>
                                <div className="border-t border-gray-100 my-1"></div>
                                <MenuButton onClick={() => { onDelete(reservationType, reservationId); setOpenMenuId(null); }}>
                                  <FaTrashAlt className="mr-3 inline-block text-red-600" /> Eliminar Reserva
                                </MenuButton>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

export default TablaReservaciones; 