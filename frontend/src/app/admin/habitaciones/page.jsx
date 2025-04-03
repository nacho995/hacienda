"use client";

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaBed, FaBath, FaWifi, FaUsers, FaInfoCircle } from 'react-icons/fa';
import Image from 'next/image';
import { checkHabitacionAvailability } from '@/services/reservationService';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Datos base de las habitaciones según el modelo
        const habitacionesBase = [
          {
            tipo: 'Individual',
            descripcion: 'Habitación individual cómoda y funcional.',
            capacidad: 1,
            precio: '$1,800',
            caracteristicas: ['Cama Individual', 'Baño Privado', 'WiFi', 'Escritorio'],
            imagen: '/images/placeholder/room1.jpg.svg',
            totalDisponibles: 10
          },
          {
            tipo: 'Doble',
            descripcion: 'Habitación doble con espacio para dos personas.',
            capacidad: 2,
            precio: '$2,500',
            caracteristicas: ['Cama Queen Size', 'Baño Privado', 'WiFi', 'Balcón'],
            imagen: '/images/placeholder/room2.jpg.svg',
            totalDisponibles: 15
          },
          {
            tipo: 'Suite',
            descripcion: 'Suite espaciosa con sala de estar separada.',
            capacidad: 2,
            precio: '$3,500',
            caracteristicas: ['Cama King Size', 'Baño Privado', 'WiFi', 'Sala de Estar'],
            imagen: '/images/placeholder/room3.jpg.svg',
            totalDisponibles: 5
          },
          {
            tipo: 'Premium',
            descripcion: 'Nuestra mejor suite con todas las comodidades.',
            capacidad: 4,
            precio: '$4,200',
            caracteristicas: ['Cama King Size + Sofá Cama', '2 Baños', 'WiFi', 'Terraza Privada'],
            imagen: '/images/placeholder/room1.jpg.svg',
            totalDisponibles: 3
          }
        ];

        // Fecha actual para comprobar disponibilidad
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        // Array para almacenar las promesas de disponibilidad
        const availabilityPromises = habitacionesBase.map(habitacion => 
          checkHabitacionAvailability({
            tipoHabitacion: habitacion.tipo,
            fechaEntrada: today.toISOString().split('T')[0],
            fechaSalida: nextWeek.toISOString().split('T')[0],
            numeroHabitaciones: 1
          }).catch(err => {
            console.error(`Error al comprobar disponibilidad para ${habitacion.tipo}:`, err);
            // Retornamos un valor por defecto en caso de error
            return { disponible: true, habitacionesRestantes: habitacion.totalDisponibles };
          })
        );

        // Esperamos todas las promesas
        const availabilityResults = await Promise.all(availabilityPromises);

        // Combinamos los datos base con la información de disponibilidad
        const roomsWithAvailability = habitacionesBase.map((habitacion, index) => {
          const availability = availabilityResults[index] || { 
            disponible: true, 
            habitacionesRestantes: habitacion.totalDisponibles 
          };

          return {
            id: index + 1,
            nombre: habitacion.tipo,
            descripcion: habitacion.descripcion,
            capacidad: habitacion.capacidad,
            precio: habitacion.precio,
            estado: availability.disponible ? 'Disponible' : 'No disponible',
            caracteristicas: habitacion.caracteristicas,
            imagen: habitacion.imagen,
            disponibles: availability.habitacionesRestantes || 0,
            totalDisponibles: habitacion.totalDisponibles
          };
        });

        setRooms(roomsWithAvailability);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('No se pudieron cargar las habitaciones');
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const getIconForFeature = (feature) => {
    if (feature.includes('Cama')) return FaBed;
    if (feature.includes('Baño')) return FaBath;
    if (feature.includes('WiFi')) return FaWifi;
    return FaUsers;
  };

  if (loading) return <div className="text-center py-10">Cargando habitaciones...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

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
              
              {/* Disponibilidad */}
              <div className="mt-2 text-sm text-gray-600">
                <span>Disponibles: {room.disponibles} de {room.totalDisponibles}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 