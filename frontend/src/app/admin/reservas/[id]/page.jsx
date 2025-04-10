'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { obtenerReservaEvento } from '@/services/reservas.service';
import { actualizarGestionHabitaciones } from '@/services/gestionHacienda.service';
import GestionHabitacionesReserva from '@/components/admin/GestionHabitacionesReserva';
import { toast } from 'sonner';

export default function DetalleReservaPage() {
  const { id } = useParams();
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReserva();
  }, [id]);

  const cargarReserva = async () => {
    try {
      setLoading(true);
      const response = await obtenerReservaEvento(id);
      if (response.success) {
        setReserva(response.data);
      } else {
        toast.error('Error al cargar la reserva', {
          description: response.message
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado', {
        description: 'No se pudo cargar la información de la reserva'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarHabitaciones = async (habitacionesData) => {
    try {
      const response = await actualizarGestionHabitaciones(id, habitacionesData);
      if (response.success) {
        await cargarReserva();
      }
    } catch (error) {
      console.error('Error al guardar habitaciones:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          No se encontró la reserva
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-[var(--color-primary)] mb-8">
        Detalles de la Reserva
      </h1>

      {/* Información básica de la reserva */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Tipo de Evento</p>
            <p className="font-medium">{reserva.tipoEvento}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha</p>
            <p className="font-medium">{new Date(reserva.fecha).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Modo de Reserva</p>
            <p className="font-medium">
              {reserva.modoReserva === 'hacienda' ? 'Gestionado por Hacienda' : 'Gestionado por Cliente'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Estado</p>
            <p className="font-medium">{reserva.estado}</p>
          </div>
        </div>
      </div>

      {/* Datos de contacto */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Datos de Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Nombre</p>
            <p className="font-medium">{reserva.datosContacto?.nombre}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{reserva.datosContacto?.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Teléfono</p>
            <p className="font-medium">{reserva.datosContacto?.telefono}</p>
          </div>
        </div>
      </div>

      {/* Gestión de habitaciones (solo si es gestionado por hacienda) */}
      {reserva.modoReserva === 'hacienda' && (
        <div className="mb-8">
          <GestionHabitacionesReserva
            reservaId={id}
            onSave={handleGuardarHabitaciones}
          />
        </div>
      )}

      {/* Servicios seleccionados */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Servicios Seleccionados</h2>
        {reserva.serviciosSeleccionados?.length > 0 ? (
          <ul className="space-y-2">
            {reserva.serviciosSeleccionados.map((servicio, index) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full mr-2"></span>
                {servicio.nombre}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No hay servicios seleccionados</p>
        )}
      </div>

      {/* Habitaciones seleccionadas (si es gestionado por cliente) */}
      {reserva.modoReserva === 'cliente' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Habitaciones Seleccionadas</h2>
          {reserva.habitacionesSeleccionadas?.length > 0 ? (
            <ul className="space-y-2">
              {reserva.habitacionesSeleccionadas.map((habitacion, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full mr-2"></span>
                  Habitación {habitacion.numero}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No hay habitaciones seleccionadas</p>
          )}
        </div>
      )}
    </div>
  );
} 