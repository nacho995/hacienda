'use client';

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaSort, FaSortUp, FaSortDown, FaSpinner, FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';

const TablaReservaciones = ({ reservations, onSort, sortConfig, isLoading, usuarios = [] }) => {
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
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.estado)}`}>
                    {reservation.estado || 'No especificado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaUserCircle className="text-gray-400 mr-2" />
                    {getUsuarioAsignado(reservation.asignadoA)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link 
                    href={`/admin/reservas/${reservationId}`}
                    className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium"
                  >
                    Ver detalles
                  </Link>
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