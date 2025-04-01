"use client";

import { useState } from 'react';
import { FaEdit, FaTrash, FaBed, FaBath, FaWifi, FaUsers, FaInfoCircle } from 'react-icons/fa';
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
      imagen: '/images/placeholder/room1.jpg.svg'
    },
    {
      id: 2,
      nombre: 'Habitación Colonial',
      descripcion: 'Ambiente tradicional con detalles arquitectónicos coloniales.',
      capacidad: 2,
      precio: '$2,800',
      estado: 'Ocupada',
      caracteristicas: ['Cama Queen Size', 'Baño Privado', 'WiFi', 'Balcón'],
      imagen: '/images/placeholder/room2.jpg.svg'
    },
    {
      id: 3,
      nombre: 'Suite Familiar',
      descripcion: 'Espaciosa suite para familias con áreas separadas.',
      capacidad: 4,
      precio: '$4,200',
      estado: 'Disponible',
      caracteristicas: ['Cama King Size + Sofá Cama', '2 Baños', 'WiFi', 'Terraza'],
      imagen: '/images/placeholder/room3.jpg.svg'
    },
  ]);

  const getIconForFeature = (feature) => {
    if (feature.includes('Cama')) return FaBed;
    if (feature.includes('Baño')) return FaBath;
    if (feature.includes('WiFi')) return FaWifi;
    return FaUsers;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
          Habitaciones
        </h1>
        <p className="text-gray-600 mt-2">
          Visualiza las habitaciones y suites disponibles en la hacienda
        </p>
      </div>

      {/* Mensaje informativo */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaInfoCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Las habitaciones se gestionan directamente desde el sistema principal. Las reservas de habitaciones se mostrarán aquí cuando los usuarios las realicen desde la página principal.
            </p>
          </div>
        </div>
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
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 to-black/40"></div>
              <div className="absolute bottom-4 left-4">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-none ${
                    room.estado === 'Disponible'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {room.estado}
                </span>
              </div>
            </div>

            {/* Información de la habitación */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-[var(--color-accent)]">
                  {room.nombre}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {room.descripcion}
                </p>
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
  );
} 