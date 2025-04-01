"use client";

import { useState } from 'react';
import { FaCalendarAlt, FaBed, FaUsers, FaChartLine } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats] = useState({
    reservaciones: {
      total: 156,
      pendientes: 23,
      confirmadas: 133
    },
    habitaciones: {
      total: 20,
      ocupadas: 15,
      disponibles: 5
    },
    usuarios: {
      total: 450,
      nuevos: 45
    },
    ingresos: {
      mensual: '$250,000',
      anual: '$2,850,000'
    }
  });

  const cards = [
    {
      title: 'Reservaciones',
      icon: FaCalendarAlt,
      stats: [
        { label: 'Total', value: stats.reservaciones.total },
        { label: 'Pendientes', value: stats.reservaciones.pendientes },
        { label: 'Confirmadas', value: stats.reservaciones.confirmadas }
      ],
      color: 'bg-blue-500'
    },
    {
      title: 'Habitaciones',
      icon: FaBed,
      stats: [
        { label: 'Total', value: stats.habitaciones.total },
        { label: 'Ocupadas', value: stats.habitaciones.ocupadas },
        { label: 'Disponibles', value: stats.habitaciones.disponibles }
      ],
      color: 'bg-green-500'
    },
    {
      title: 'Usuarios',
      icon: FaUsers,
      stats: [
        { label: 'Total', value: stats.usuarios.total },
        { label: 'Nuevos', value: stats.usuarios.nuevos }
      ],
      color: 'bg-purple-500'
    },
    {
      title: 'Ingresos',
      icon: FaChartLine,
      stats: [
        { label: 'Mensual', value: stats.ingresos.mensual },
        { label: 'Anual', value: stats.ingresos.anual }
      ],
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
          Panel de Control
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenido al panel de administración de Hacienda San Carlos Borromeo
        </p>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className={`p-4 ${card.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-white text-lg font-medium">
                  {card.title}
                </span>
                <card.icon className="text-white/80 w-6 h-6" />
              </div>
            </div>
            <div className="p-4">
              {card.stats.map((stat, statIndex) => (
                <div
                  key={statIndex}
                  className={`${
                    statIndex > 0 ? 'mt-3 pt-3 border-t' : ''
                  }`}
                >
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <FaCalendarAlt className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Nueva reservación
                  </p>
                  <p className="text-xs text-gray-500">
                    Hace {index + 1} hora{index !== 0 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors">
                Ver detalles
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 