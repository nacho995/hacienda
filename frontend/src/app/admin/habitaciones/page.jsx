"use client";

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaBed, FaBath, FaWifi, FaUsers, FaInfoCircle, FaCalendar } from 'react-icons/fa';
import Image from 'next/image';
import { obtenerHabitacionesConReservas } from '@/services/habitacionService';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReservas, setShowReservas] = useState({});
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    const fetchRooms = async () => {
      try {
        const habitacionesData = await obtenerHabitacionesConReservas();
        setRooms(habitacionesData);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar habitaciones:', error);
        setError('No se pudieron cargar las habitaciones y sus reservas');
        setLoading(false);
      }
    };

    fetchRooms();
  }, [isAuthenticated, isAdmin, router]);

  const getIconForFeature = (feature) => {
    if (feature.includes('Cama')) return FaBed;
    if (feature.includes('Baño')) return FaBath;
    if (feature.includes('WiFi')) return FaWifi;
    return FaUsers;
  };

  const toggleReservas = (roomId) => {
    setShowReservas(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando habitaciones...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center text-red-500">
        <FaInfoCircle className="text-4xl mx-auto mb-4" />
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
          Habitaciones
        </h1>
        <p className="text-gray-600 mt-2">
          Gestión de habitaciones y visualización de reservas activas
        </p>
      </div>

      {/* Grid de Habitaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <div
            key={room._id}
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
                {room.amenidades.map((feature, index) => {
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
                    ${room.precio}
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

              {/* Botón para mostrar reservas */}
              <div className="mt-4">
                <button
                  onClick={() => toggleReservas(room._id)}
                  className="flex items-center space-x-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
                >
                  <FaCalendar />
                  <span>
                    {showReservas[room._id] ? 'Ocultar reservas' : 
                      room.reservasActivas?.length > 0 
                        ? `Ver ${room.reservasActivas.length} reservas activas`
                        : 'Sin reservas activas'
                    }
                  </span>
                </button>

                {/* Lista de reservas */}
                {showReservas[room._id] && room.reservasActivas?.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {room.reservasActivas.map((reserva) => (
                      <div
                        key={reserva._id}
                        className="p-4 bg-gray-50 rounded-sm border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">
                              {reserva.nombreContacto} {reserva.apellidosContacto}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatFecha(reserva.fecha)} - {formatFecha(reserva.fechaSalida)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {reserva.numHuespedes} huésped(es)
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-sm ${
                            reserva.estadoReserva === 'confirmada' ? 'bg-green-100 text-green-800' :
                            reserva.estadoReserva === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reserva.estadoReserva}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 