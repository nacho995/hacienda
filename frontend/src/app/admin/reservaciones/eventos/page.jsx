'use client';

import { useState } from 'react';
import ReservaEventosList from '@/components/admin/ReservaEventosList';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function EventosReservacionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Administración de Reservas de Eventos
        </h1>
        <Link 
          href="/admin/reservaciones" 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" />
          Volver a Reservaciones
        </Link>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <p className="text-blue-700">
          En esta página puedes ver todas las reservas de eventos disponibles para ser asignadas, así como las reservas que ya tienes asignadas a tu cuenta. 
          Puedes asignar reservas a tu cuenta para trabajar en ellas y liberarlas si deseas que otro usuario pueda manejarlas.
        </p>
      </div>
      
      <ReservaEventosList />
    </div>
  );
} 