"use client";

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FaEdit, FaTrash, FaBed, FaBath, FaWifi, FaUsers } from 'react-icons/fa';
import Image from 'next/image';

export default function AdminRooms() {
  const [rooms] = useState([
    {
      id: 1,
      nombre: 'Suite Principal',
      descripcion: 'Una suite espaciosa con vista panorámica a los jardines.',
      capacidad: 2,
      precio: '$3,500',
      estado: 'Disponible',
      caracteristicas: ['Cama King Size', 'Baño Privado', 'WiFi', 'Vista a Jardines'],
      imagen: '/images/placeholder/room1.svg'
    },
    {
      id: 2,
      nombre: 'Habitación Colonial',
      descripcion: 'Ambiente tradicional con detalles arquitectónicos coloniales.',
      capacidad: 2,
      precio: '$2,800',
      estado: 'Ocupada',
      caracteristicas: ['Cama Queen Size', 'Baño Privado', 'WiFi', 'Balcón'],
      imagen: '/images/placeholder/room2.svg'
    },
    // Más habitaciones...
  ]);

  const getIconForFeature = (feature) => {
    if (feature.includes('Cama')) return FaBed;
    if (feature.includes('Baño')) return FaBath;
    if (feature.includes('WiFi')) return FaWifi;
    return FaUsers;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
              Habitaciones
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona las habitaciones y suites disponibles
            </p>
          </div>
          <button className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-none hover:bg-[var(--color-primary-dark)] transition-colors">
            Agregar Habitación
          </button>
        </div>

        {/* Grid de Habitaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-none shadow-lg overflow-hidden border border-gray-100"
            >
              {/* Imagen de la habitación */}
              <div className="relative h-48">
                <Image
                  src={room.imagen}
                  alt={room.nombre}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 space-x-2">
                  <button className="p-2 bg-white rounded-none shadow-lg hover:bg-gray-100 transition-colors">
                    <FaEdit className="w-4 h-4 text-[var(--color-primary)]" />
                  </button>
                  <button className="p-2 bg-white rounded-none shadow-lg hover:bg-gray-100 transition-colors">
                    <FaTrash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Información de la habitación */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-accent)]">
                      {room.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {room.descripcion}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-none ${
                      room.estado === 'Disponible'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {room.estado}
                  </span>
                </div>

                {/* Características */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {room.caracteristicas.map((feature, index) => {
                    const Icon = getIconForFeature(feature);
                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm text-gray-600"
                      >
                        <Icon className="w-4 h-4 text-[var(--color-primary)]" />
                        <span>{feature}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Precio y capacidad */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">
                      {room.precio}
                    </span>{' '}
                    / noche
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <FaUsers className="w-4 h-4" />
                    <span>Máx. {room.capacidad} personas</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
} 