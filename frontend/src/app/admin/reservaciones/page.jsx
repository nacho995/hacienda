'use client';

import { useState } from 'react';
import { FaSearch, FaFilter, FaEllipsisV } from 'react-icons/fa';

export default function AdminReservations() {
  const [reservations] = useState([
    {
      id: 1,
      cliente: 'Juan Pérez',
      tipoEvento: 'Boda',
      fecha: '2024-05-15',
      invitados: 150,
      estado: 'Confirmada',
      total: '$85,000'
    },
    {
      id: 2,
      cliente: 'María García',
      tipoEvento: 'Corporativo',
      fecha: '2024-06-20',
      invitados: 80,
      estado: 'Pendiente',
      total: '$45,000'
    },
    // Más reservaciones...
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || reservation.estado.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
            Reservaciones
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona todas las reservaciones de eventos
          </p>
        </div>
        <button className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors">
          Nueva Reservación
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de cliente..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select
              className="appearance-none bg-white pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="cancelada">Canceladas</option>
            </select>
            <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabla de Reservaciones */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invitados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reservation.cliente}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {reservation.tipoEvento}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(reservation.fecha).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.invitados}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reservation.estado === 'Confirmada'
                          ? 'bg-green-100 text-green-800'
                          : reservation.estado === 'Pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {reservation.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                      <FaEllipsisV />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 