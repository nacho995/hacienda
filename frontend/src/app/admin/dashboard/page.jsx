"use client";

import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaBed, FaUsers, FaClipboardList } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    totalUsers: 0
  });

  useEffect(() => {
    // Simular carga de datos para el dashboard
    // En una implementación real, esto se reemplazaría con llamadas a la API
    const loadDashboardData = () => {
      // Datos simulados para propósitos de demostración
      setStats({
        totalReservations: 35,
        pendingReservations: 12,
        confirmedReservations: 23,
        totalRooms: 24,
        occupiedRooms: 18,
        totalUsers: 150
      });
    };

    loadDashboardData();
  }, []);

  const dashboardCards = [
    {
      title: 'Reservaciones',
      icon: <FaCalendarAlt className="text-amber-500" size={24} />,
      stats: [
        { label: 'Total', value: stats.totalReservations },
        { label: 'Pendientes', value: stats.pendingReservations },
        { label: 'Confirmadas', value: stats.confirmedReservations }
      ],
      color: 'bg-amber-100 border-amber-200'
    },
    {
      title: 'Habitaciones',
      icon: <FaBed className="text-blue-500" size={24} />,
      stats: [
        { label: 'Total', value: stats.totalRooms },
        { label: 'Ocupadas', value: stats.occupiedRooms },
        { label: 'Disponibles', value: stats.totalRooms - stats.occupiedRooms }
      ],
      color: 'bg-blue-100 border-blue-200'
    },
    {
      title: 'Usuarios',
      icon: <FaUsers className="text-green-500" size={24} />,
      stats: [
        { label: 'Registrados', value: stats.totalUsers }
      ],
      color: 'bg-green-100 border-green-200'
    },
    {
      title: 'Próximos Eventos',
      icon: <FaClipboardList className="text-purple-500" size={24} />,
      stats: [
        { label: 'Bodas', value: 8 },
        { label: 'Eventos corporativos', value: 3 },
        { label: 'Celebraciones', value: 5 }
      ],
      color: 'bg-purple-100 border-purple-200'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardCards.map((card, index) => (
          <div key={index} className={`rounded-lg shadow-sm p-5 ${card.color} border`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">{card.title}</h2>
              {card.icon}
            </div>
            <div className="space-y-2">
              {card.stats.map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className="font-semibold text-lg">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservaciones recientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold">Reservaciones Recientes</h2>
          </div>
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm">María López</td>
                  <td className="px-4 py-3 text-sm">23/05/2023</td>
                  <td className="px-4 py-3 text-sm"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmada</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Juan Pérez</td>
                  <td className="px-4 py-3 text-sm">17/05/2023</td>
                  <td className="px-4 py-3 text-sm"><span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Ana Gómez</td>
                  <td className="px-4 py-3 text-sm">12/05/2023</td>
                  <td className="px-4 py-3 text-sm"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmada</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Próximos eventos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold">Habitaciones Ocupadas</h2>
          </div>
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Habitación</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Huésped</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm">Suite Principal</td>
                  <td className="px-4 py-3 text-sm">Pedro Ramírez</td>
                  <td className="px-4 py-3 text-sm">25/05/2023</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Habitación 102</td>
                  <td className="px-4 py-3 text-sm">Sofia Torres</td>
                  <td className="px-4 py-3 text-sm">27/05/2023</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Habitación 204</td>
                  <td className="px-4 py-3 text-sm">Carlos Méndez</td>
                  <td className="px-4 py-3 text-sm">24/05/2023</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}