'use client';

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FaSort, FaSortUp, FaSortDown, FaSpinner, FaUserCircle,
  FaEye, FaTrashAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf
} from 'react-icons/fa';
import Link from 'next/link';

const TablaReservaciones = ({ 
  reservations,
  onSort,
  sortConfig,
  isLoading,
  usuarios = [],
  onDelete,
  onChangeStatus
}) => {
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

  const getReservationType = (reservation) => {
    if (reservation.tipo === 'habitacion') {
      return 'Habitación';
    } else if (reservation.tipo === 'evento') {
      return 'Evento';
    }
    return 'No especificado';
  };

  // Obtener datos del cliente de forma segura
  const getClienteInfo = (reservation) => {
    // Verificar estructura normalizada
    if (reservation.huesped) {
      return {
        nombre: reservation.huesped.nombre || 'No especificado',
        email: reservation.huesped.email || '',
        telefono: reservation.huesped.telefono || ''
      };
    }
    
    // Compatibilidad con estructura anterior
    return {
      nombre: reservation.nombreCompleto || 'No especificado',
      email: reservation.email || '',
      telefono: reservation.telefono || ''
    };
  };

  // Obtener el ID de forma segura
  const getReservationId = (reservation) => {
    return reservation._id || reservation.id;
  };
  
  // Obtener el nombre del usuario asignado
  const getUsuarioAsignado = (asignadoA) => {
    if (!asignadoA) return 'Sin asignar';
    
    const usuario = usuarios.find(u => u._id === asignadoA);
    return usuario ? (usuario.nombre || usuario.email || 'Usuario') : 'Usuario desconocido';
  };

  // Componente auxiliar para los botones de acción
  const ActionButton = ({ onClick, icon: Icon, colorClass, tooltip }) => (
    <button
      onClick={onClick}
      className={`p-1 rounded hover:opacity-75 transition ${colorClass}`}
      title={tooltip}
    >
      <Icon />
    </button>
  );

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
            
            // Obtener la información del cliente
            const cliente = getClienteInfo(reservation);
            const reservationId = getReservationId(reservation);
            const reservationType = reservation.tipo;
            const currentStatus = reservation.estadoReserva || reservation.estado;
            
            return (
              <tr key={reservation.uniqueId || `${reservation.tipo}_${reservationId}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatFecha(reservation.fechaEvento || reservation.fechaInicio)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {cliente.nombre}
                  </div>
                  <div className="text-sm text-gray-500">
                    {cliente.email}
                  </div>
                  {cliente.telefono && (
                    <div className="text-xs text-gray-500">
                      {cliente.telefono}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getReservationType(reservation)}
                  </div>
                  {reservation.modoReserva && (
                    <div className="text-xs text-gray-500">
                      {reservation.modoReserva === 'hacienda' ? 'Gestión: Hacienda' : 'Gestión: Cliente'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(currentStatus)}`}>
                    {currentStatus || 'No especificado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaUserCircle className="text-gray-400 mr-2" />
                    {getUsuarioAsignado(reservation.asignadoA)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={`/admin/reservaciones/${reservationType}/${reservationId}`}
                      className="p-1 rounded text-blue-600 hover:text-blue-800 transition" 
                      title="Ver Detalles"
                    >
                      <FaEye />
                    </Link>
                    
                    <ActionButton
                      onClick={() => onDelete(reservationType, reservationId)}
                      icon={FaTrashAlt}
                      colorClass="text-red-600 hover:text-red-800"
                      tooltip="Eliminar"
                    />

                    {currentStatus !== 'confirmada' && (
                      <ActionButton
                        onClick={() => onChangeStatus(reservationType, reservationId, 'confirmada')}
                        icon={FaCheckCircle}
                        colorClass="text-green-600 hover:text-green-800"
                        tooltip="Confirmar"
                      />
                    )}
                    {currentStatus !== 'cancelada' && (
                      <ActionButton
                        onClick={() => onChangeStatus(reservationType, reservationId, 'cancelada')}
                        icon={FaTimesCircle}
                        colorClass="text-orange-600 hover:text-orange-800"
                        tooltip="Cancelar"
                      />
                    )}
                    {currentStatus !== 'pendiente' && (
                      <ActionButton
                        onClick={() => onChangeStatus(reservationType, reservationId, 'pendiente')}
                        icon={FaHourglassHalf}
                        colorClass="text-yellow-600 hover:text-yellow-800"
                        tooltip="Marcar como Pendiente"
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TablaReservaciones; 