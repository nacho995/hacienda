'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { apiClient } from '@/services/apiClient';
import HabitacionesEventoForm from '@/components/eventos/HabitacionesEventoForm';
import Link from 'next/link';

export default function HabitacionesEventoPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchEvento = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/reservas/eventos/${id}`);
        
        if (response.data?.success && response.data.data) {
          setEvento(response.data.data);
        } else {
          throw new Error('No se pudo obtener la información del evento');
        }
      } catch (err) {
        console.error('Error al cargar el evento:', err);
        setError('No se pudo cargar la información del evento. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvento();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)]" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
          {error}
          <div className="mt-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              <FaArrowLeft className="inline mr-2" /> Volver
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!evento) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-700">
          No se encontró el evento solicitado.
          <div className="mt-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
            >
              <FaArrowLeft className="inline mr-2" /> Volver
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href={`/eventos/${id}`}
          className="flex items-center text-[var(--color-primary)] hover:underline"
        >
          <FaArrowLeft className="mr-2" /> Volver al evento
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">
          {evento.nombreEvento}
        </h1>
        <p className="text-gray-600">
          {new Date(evento.fecha).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <HabitacionesEventoForm eventoId={id} />
      </div>
    </div>
  );
} 