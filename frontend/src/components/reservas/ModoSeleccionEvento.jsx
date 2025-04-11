"use client";

import { useState, useEffect } from 'react';
import { obtenerTiposEventos } from '@/services/eventos.service';
import { toast } from 'sonner';

export default function ModoSeleccionEvento({ selectedEventType, onEventTypeSelect }) {
  const [tiposEventos, setTiposEventos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTiposEventos();
  }, []);

  const cargarTiposEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerTiposEventos();
      console.log('Tipos de eventos recibidos:', data);
      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setTiposEventos(data.data.filter(tipo => tipo.activo));
      } else {
        console.warn('No se recibieron tipos de eventos válidos o la respuesta no tuvo el formato esperado.');
        setTiposEventos([]);
      }
    } catch (error) {
      console.error('Error al cargar tipos de eventos:', error);
      setError(error.message || 'Error al cargar los tipos de eventos');
      toast.error('Error al cargar los tipos de eventos');
      setTiposEventos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!tiposEventos || tiposEventos.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">No hay tipos de eventos disponibles en este momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-8">
        Seleccione el tipo de evento
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiposEventos.map((tipo) => (
          <button
            key={tipo.id}
            onClick={() => onEventTypeSelect(tipo)}
            className={`
              relative p-6 rounded-xl transition-all duration-300
              ${
                selectedEventType?.id === tipo.id
                  ? 'bg-gradient-to-br from-[#E6DCC6] to-[#D1B59B] border-2 border-[#A5856A] shadow-lg scale-105'
                  : 'bg-white border-2 border-gray-200 hover:border-[#A5856A] hover:shadow-md'
              }
            `}
          >
            <div className="text-center">
              <h4 className="text-lg font-semibold text-[#0F0F0F] mb-2">
                {tipo.titulo}
              </h4>
              <p className="text-sm text-gray-600">
                {tipo.descripcion}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
