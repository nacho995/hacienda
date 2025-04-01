'use client';

import { useState } from 'react';
import { FaSearch, FaFilter, FaEllipsisV, FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function AdminReservations() {
  const [usuarios] = useState([
    {
      id: 1,
      nombre: 'Admin Principal',
      email: 'admin@haciendasancarlos.com',
      rol: 'Administrador',
    },
    {
      id: 2,
      nombre: 'Juan García',
      email: 'juan@haciendasancarlos.com',
      rol: 'Cliente',
    },
    {
      id: 3,
      nombre: 'María López',
      email: 'maria@haciendasancarlos.com',
      rol: 'Cliente',
    },
  ]);
  
  const [reservations] = useState([
    {
      id: 1,
      cliente: 'Juan García',
      clienteId: 2,
      tipoEvento: 'Boda',
      fecha: '2024-05-15',
      invitados: 150,
      estado: 'Confirmada',
      total: '$85,000'
    },
    {
      id: 2,
      cliente: 'María López',
      clienteId: 3,
      tipoEvento: 'Corporativo',
      fecha: '2024-06-20',
      invitados: 80,
      estado: 'Pendiente',
      total: '$45,000'
    },
    {
      id: 3,
      cliente: 'Juan García',
      clienteId: 2,
      tipoEvento: 'Cumpleaños',
      fecha: '2024-07-10',
      invitados: 50,
      estado: 'Confirmada',
      total: '$35,000'
    },
    {
      id: 4,
      cliente: 'María López',
      clienteId: 3,
      tipoEvento: 'Aniversario',
      fecha: '2024-08-15',
      invitados: 100,
      estado: 'Pendiente',
      total: '$60,000'
    },
    {
      id: 5,
      cliente: 'Juan García',
      clienteId: 2,
      tipoEvento: 'Graduación',
      fecha: '2024-09-10',
      invitados: 70,
      estado: 'Confirmada',
      total: '$40,000'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         reservation.tipoEvento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || reservation.estado.toLowerCase() === filterStatus;
    const matchesUser = filterUser === 'all' || reservation.clienteId.toString() === filterUser;
    
    return matchesSearch && matchesStatus && matchesUser;
  });

  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
            Reservaciones
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona todas las reservaciones de eventos realizadas desde el sitio web
          </p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de cliente o tipo de evento..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 flex-wrap md:flex-nowrap">
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
          <div className="relative">
            <select
              className="appearance-none bg-white pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="all">Todos los usuarios</option>
              {usuarios.filter(u => u.rol === 'Cliente').map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
            <FaUserCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Información sobre las reservaciones */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <p className="text-blue-700">
          Las reservaciones mostradas aquí son generadas automáticamente a partir de las solicitudes realizadas por los usuarios en el sitio web principal.
        </p>
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
              {filteredReservations.length > 0 ? (
                filteredReservations.map((reservation) => (
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
                      <button 
                        onClick={() => router.push(`/admin/reservaciones/${reservation.id}`)}
                        className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] flex items-center"
                      >
                        <span className="mr-1">Ver detalles</span>
                        <FaEllipsisV />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron reservaciones con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 