'use client';

import React, { useState, Fragment, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FaSort, FaSortUp, FaSortDown, FaSpinner, FaUserCircle,
  FaEye, FaTrashAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
  FaHandPointer,
  FaUndo,
  FaEllipsisV,
  FaEdit,
  FaUserPlus,
  FaUserMinus,
  FaUserCheck,
  FaUserSlash,
  FaBed,
  FaGlassCheers,
  FaHotel
} from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Componente para el botón de menú --- 
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
  onConfirmar,
  onCancelar,
  onMarcarPendiente,
  onAssign,
  onUnassign,
  user,
  highlightId
}) => {
  const { user: authUser } = useAuth();
  const router = useRouter();

  const [openMenuId, setOpenMenuId] = useState(null);
  const tbodyRef = useRef(null);

  const toggleMenu = (id) => {
    setOpenMenuId(prevId => (prevId === id ? null : id));
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />;
  };

  const requestSort = (key) => {
    if (onSort) {
      onSort(key);
    } else {
      console.warn("onSort prop is missing from TablaReservaciones");
    }
  };

  const getReservationId = (reservation) => reservation?._id || null;
  const getReservationType = (reservation) => reservation?.tipo || null;

  const getUsuarioAsignado = (asignadoAId, asignadoADetails, allAdmins) => {
    if (asignadoADetails && asignadoADetails._id) {
      const nombreCompleto = `${asignadoADetails.nombre || ''} ${asignadoADetails.apellidos || ''}`.trim();
      return nombreCompleto || asignadoADetails.email || 'Admin';
    }
    if (asignadoAId) {
      const usuario = allAdmins.find(u => u._id === asignadoAId);
      if (usuario) {
          const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim();
          return nombreCompleto || usuario.email || 'Admin';
      }
    }
    return 'Sin asignar';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (error) {
      console.error("Error formateando fecha:", fecha, error);
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
      case 'pagada':
        return 'bg-blue-100 text-blue-800';
      case 'completada':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    // Check if highlightId is present, tbody ref is available, and there are reservations
    if (highlightId && tbodyRef.current && reservations.length > 0) {
      console.log(`[TablaReservaciones Effect] Highlight ID detected: ${highlightId}. Scheduling DOM check.`);

      // Use setTimeout to allow the DOM to update after reservations prop changes
      const findAndHighlightTimer = setTimeout(() => {
        console.log(`[TablaReservaciones Effect - setTimeout] Running DOM check for ID: ${highlightId}`);
        
        // Ensure tbodyRef.current still exists inside the timeout
        if (!tbodyRef.current) {
          console.warn("[TablaReservaciones Effect - setTimeout] tbodyRef became null. Aborting highlight.");
          return;
        }

        const selector = `tr[data-reservation-id="${highlightId}"]`;
        console.log(`[TablaReservaciones Effect - setTimeout] Searching with selector: ${selector}`);
        const element = tbodyRef.current.querySelector(selector); 
        
        if (element) {
          console.log(`[TablaReservaciones Effect - setTimeout] Element found:`, element);
          
          // Scroll into view
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          console.log(`[TablaReservaciones Effect - setTimeout] scrollIntoView called.`);
          
          // --- Apply NEW permanent highlight class --- 
          // Remove potentially conflicting old classes first (optional but safer)
          element.classList.remove('bg-yellow-100', 'transition-colors', 'duration-1000'); 
          // Add the new gradient class
          element.classList.add('highlight-gradient-row');
          console.log(`[TablaReservaciones Effect - setTimeout] Permanent gradient highlight class added.`);
          // --- End Apply NEW class --- 

          // The outer cleanup function (clearTimeout(findAndHighlightTimer)) is still relevant
          // if the effect re-runs *before* the findAndHighlightTimer finishes.

        } else {
          console.warn(`[TablaReservaciones Effect - setTimeout] Element with selector ${selector} not found in tbody.`);
        }
      }, 100); // Small delay (e.g., 100ms) to wait for DOM render

      // Cleanup function for the main useEffect
      return () => {
        console.log(`[TablaReservaciones Effect - Cleanup] Clearing findAndHighlightTimer.`);
        clearTimeout(findAndHighlightTimer);
        // Note: We can't easily clear the *inner* removeHighlightTimer here if it was already set.
        // If this becomes an issue (e.g., highlight sticks), we'll need a more complex cleanup.
      };

    } else {
       console.log(`[TablaReservaciones Effect] Conditions not met for highlighting. highlightId: ${highlightId}, tbodyRef: ${tbodyRef.current ? 'exists' : 'null'}, reservations: ${reservations.length}`);
    }
  }, [highlightId, reservations]); // Dependencies remain the same

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return <p className="text-center text-gray-500 py-4">No se encontraron reservaciones.</p>;
  }

  console.log("[TablaReservaciones RENDER] Rendering table with reservations (first 5):", reservations.slice(0,5).map(r => ({id: r?._id, type: r?.tipo, client: r?.clientePrincipal})));

  return (
    <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('fechaMostrada')}
            >
              <div className="flex items-center gap-1">
                Fecha
                {getSortIcon('fechaMostrada')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('clientePrincipal')}
            >
              <div className="flex items-center gap-1">
                Cliente
                {getSortIcon('clientePrincipal')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Tipo / Nombre
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('estadoReserva')}
            >
              <div className="flex items-center gap-1">
                Estado
                {getSortIcon('estadoReserva')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('asignadoA')}
            >
              <div className="flex items-center gap-1">
                Asignado a
                {getSortIcon('asignadoA')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody ref={tbodyRef} className="bg-white divide-y divide-gray-100">
          {reservations.map((reservation) => {
            const reservationId = getReservationId(reservation);
            const reservationType = getReservationType(reservation);
            
            if (!reservationId) {
              console.warn('[TablaReservaciones MAP] Skipping row due to missing ID:', reservation);
              return null;
            }

            const detailPath = reservationType === 'habitacion' 
                ? `/admin/reservaciones/habitacion/${reservationId}` 
                : `/admin/reservaciones/evento/${reservationId}`;

            console.log(`[TablaReservaciones MAP] Renderizando fila: Tipo=${reservationType}, ID=${reservationId}, Path=${detailPath}`);

            const isMenuOpen = openMenuId === reservationId;
            const estadoActual = reservation.estadoReserva || reservation.estado || 'pendiente';
            const estaAsignada = !!(reservation.asignadoA || reservation.asignadoADetails?._id);
            const asignadaAlUsuarioActual = authUser && (
                (reservation.asignadoA === authUser.id) || 
                (reservation.asignadoADetails?._id === authUser.id)
            );

            const rowId = `reservation-row-${reservation.uniqueId}`;

            return (
              <tr 
                key={reservation.uniqueId || reservationId} 
                id={rowId}
                data-reservation-id={reservationId}
                className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatFecha(reservation.fechaMostrada)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reservation.clientePrincipal || 'No especificado'}
                  </div>
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
                       {reservation.nombreMostrado || 'Detalle no disponible'}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(estadoActual)} capitalize`}>
                    {estadoActual}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <FaUserCircle className={estaAsignada ? "text-blue-500" : "text-gray-400"} />
                    {getUsuarioAsignado(reservation.asignadoA?._id || reservation.asignadoA, reservation.asignadoADetails, usuarios)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="relative inline-block text-left">
                      <button
                          onClick={() => toggleMenu(reservationId)}
                          type="button"
                          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
                          id={`menu-button-${reservationId}`}
                          aria-expanded={isMenuOpen}
                          aria-haspopup="true"
                      >
                          <FaEllipsisV className="h-5 w-5" aria-hidden="true" />
                      </button>

                      {isMenuOpen && (
                          <div
                              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-30 focus:outline-none"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby={`menu-button-${reservationId}`}
                              tabIndex="-1"
                          >
                              <div className="py-1" role="none">
                                  <Link
                                      href={detailPath}
                                      passHref
                                      legacyBehavior
                                  >
                                      <a 
                                          role="menuitem"
                                          tabIndex="-1"
                                          className="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                                          onClick={() => setOpenMenuId(null)}
                                      >
                                          <FaEye className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                                          Ver Detalles
                                      </a>
                                  </Link>

                                  <div className="border-t border-gray-100 my-1"></div>

                                  {onConfirmar && estadoActual === 'pendiente' && (
                                      <button onClick={() => { onConfirmar(reservationId, reservationType); setOpenMenuId(null); }} className="text-green-700 group flex items-center px-4 py-2 text-sm hover:bg-green-50 hover:text-green-900 w-full text-left" role="menuitem" tabIndex="-1">
                                          <FaCheckCircle className="mr-3 h-5 w-5" aria-hidden="true" />
                                          Confirmar
                                      </button>
                                  )}

                                  {onMarcarPendiente && estadoActual !== 'pendiente' && estadoActual !== 'cancelada' && estadoActual !== 'completada' && (
                                      <button onClick={() => { onMarcarPendiente(reservationId, reservationType); setOpenMenuId(null); }} className="text-yellow-700 group flex items-center px-4 py-2 text-sm hover:bg-yellow-50 hover:text-yellow-900 w-full text-left" role="menuitem" tabIndex="-1">
                                          <FaHourglassHalf className="mr-3 h-5 w-5" aria-hidden="true" />
                                          Marcar Pendiente
                                      </button>
                                  )}

                                  {onCancelar && estadoActual !== 'cancelada' && estadoActual !== 'completada' && (
                                      <button onClick={() => { onCancelar(reservationId, reservationType); setOpenMenuId(null); }} className="text-red-700 group flex items-center px-4 py-2 text-sm hover:bg-red-50 hover:text-red-900 w-full text-left" role="menuitem" tabIndex="-1">
                                          <FaTimesCircle className="mr-3 h-5 w-5" aria-hidden="true" />
                                          Cancelar
                                      </button>
                                  )}

                                  {(onAssign || onUnassign) && authUser && (
                                      <div className="border-t border-gray-100 my-1"></div>
                                  )}
                                  {onAssign && !estaAsignada && (
                                      <button onClick={() => { onAssign(reservationId, reservationType); setOpenMenuId(null); }} className="text-blue-700 group flex items-center px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-900 w-full text-left" role="menuitem" tabIndex="-1">
                                          <FaUserPlus className="mr-3 h-5 w-5" aria-hidden="true" />
                                          Asignar a mí
                                      </button>
                                  )}
                                  {onUnassign && estaAsignada && asignadaAlUsuarioActual && (
                                       <button onClick={() => { onUnassign(reservationId, reservationType); setOpenMenuId(null); }} className="text-orange-700 group flex items-center px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-900 w-full text-left" role="menuitem" tabIndex="-1">
                                           <FaUserMinus className="mr-3 h-5 w-5" aria-hidden="true" />
                                           Desasignar
                                       </button>
                                  )}

                                  {onDelete && (
                                      <>
                                          <div className="border-t border-gray-100 my-1"></div>
                                          <button onClick={() => { onDelete(reservationId, reservationType); setOpenMenuId(null); }} className="text-red-700 group flex items-center px-4 py-2 text-sm hover:bg-red-50 hover:text-red-900 w-full text-left" role="menuitem" tabIndex="-1">
                                              <FaTrashAlt className="mr-3 h-5 w-5" aria-hidden="true" />
                                              Eliminar
                                          </button>
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
  );
};

export default TablaReservaciones; 