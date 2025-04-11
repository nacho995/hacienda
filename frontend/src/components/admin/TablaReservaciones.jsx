'use client';

import React, { useState } from 'react';
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
            
            // Obtener la información del cliente (ahora viene en reservation.clientePrincipal)
            // const cliente = getClienteInfo(reservation);
            const reservationId = getReservationId(reservation);
            const reservationType = reservation.tipo;
            const currentStatus = reservation.estadoReserva || reservation.estado;
            
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
                  <div className="text-sm text-gray-900">
                    {/* Usar nombreMostrado */} 
                    {reservation.nombreMostrado || 'No especificado'}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === reservationId ? null : reservationId)}
                      className="p-2 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FaEllipsisV />
                    </button>

                    {openMenuId === reservationId && (
                      <div 
                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                        role="menu" 
                        aria-orientation="vertical" 
                        aria-labelledby="menu-button"
                      >
                        <div className="py-1" role="none">
                          <Link href={`/admin/reservaciones/${reservationType}/${reservationId}`} passHref>
                            <MenuButton onClick={() => setOpenMenuId(null)}> 
                              <FaEye className="inline mr-2"/> Ver Detalles
                            </MenuButton>
                          </Link>
                          
                          {onAssign && !reservation.asignadoA && (
                            <MenuButton onClick={() => { onAssign(reservationType, reservationId); setOpenMenuId(null); }}>
                              <FaHandPointer className="inline mr-2"/> Asignar a mi cuenta
                            </MenuButton>
                          )}
                          
                          {onUnassign && reservation.asignadoA?._id && String(reservation.asignadoA._id) === user?.id && (
                             <MenuButton onClick={() => { onUnassign(reservationType, reservationId); setOpenMenuId(null); }}>
                              <FaUndo className="inline mr-2"/> Desasignar de mi cuenta
                            </MenuButton>
                          )}
                          
                          {currentStatus !== 'confirmada' && (
                            <MenuButton onClick={() => { onChangeStatus(reservationType, reservationId, 'confirmada'); setOpenMenuId(null); }}>
                               <FaCheckCircle className="inline mr-2"/> Confirmar
                            </MenuButton>
                          )}
                          {currentStatus !== 'cancelada' && (
                             <MenuButton onClick={() => { onChangeStatus(reservationType, reservationId, 'cancelada'); setOpenMenuId(null); }}>
                               <FaTimesCircle className="inline mr-2"/> Cancelar
                            </MenuButton>
                          )}
                           {currentStatus !== 'pendiente' && (
                             <MenuButton onClick={() => { onChangeStatus(reservationType, reservationId, 'pendiente'); setOpenMenuId(null); }}>
                               <FaHourglassHalf className="inline mr-2"/> Marcar Pendiente
                            </MenuButton>
                          )}
                          
                          <MenuButton onClick={() => { onDelete(reservationType, reservationId); setOpenMenuId(null); }}>
                             <FaTrashAlt className="inline mr-2 text-red-600"/> Eliminar
                          </MenuButton>
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
  );
};

export default TablaReservaciones; 