'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaUsers, FaCalendarAlt, FaPlus, FaTrash, FaSpinner, FaEye, FaListAlt, FaBoxOpen } from 'react-icons/fa';
import { toast } from 'sonner';
import Link from 'next/link';

// Importar funciones reales de los servicios
import { getEventoReservations, getEventoServicios, addEventoServicio, removeEventoServicio } from '@/services/reservationService';
import { getAllServicios } from '@/services/servicios.service';

export default function ServiciosEventosAdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [eventos, setEventos] = useState([]);
  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [serviciosEvento, setServiciosEvento] = useState([]);
  const [allServicios, setAllServicios] = useState([]);
  
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingServiciosEvento, setLoadingServiciosEvento] = useState(false);
  const [loadingAllServicios, setLoadingAllServicios] = useState(true);
  const [error, setError] = useState(null);
  
  // Redirigir si no es admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // Cargar eventos y todos los servicios disponibles al montar
  useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated && isAdmin) {
        setLoadingEventos(true);
        setLoadingAllServicios(true);
        setError(null);
        try {
          const [eventosResponse, serviciosResponse] = await Promise.all([
            getEventoReservations(), // Obtener todos los eventos
            getAllServicios()      // Obtener todos los servicios disponibles
          ]);

          if (eventosResponse.success && Array.isArray(eventosResponse.data)) {
            setEventos(eventosResponse.data);
          } else {
            console.error("Error o formato inesperado al cargar eventos:", eventosResponse);
            setError('No se pudieron cargar los eventos.');
          }
          
          if (serviciosResponse.success && Array.isArray(serviciosResponse.data)) {
            setAllServicios(serviciosResponse.data);
          } else {
             console.error("Error o formato inesperado al cargar servicios:", serviciosResponse);
             setError('No se pudieron cargar los servicios disponibles.');
          }

        } catch (err) {
          console.error("Error cargando datos iniciales:", err);
          setError('Error al cargar datos iniciales.');
        } finally {
           setLoadingEventos(false);
           setLoadingAllServicios(false);
        }
      }
    };
    loadInitialData();
  }, [isAuthenticated, isAdmin]);

  // Cargar servicios del evento seleccionado
  const handleEventoSelect = useCallback(async (eventoId) => {
    setSelectedEventoId(eventoId);
    if (!eventoId) {
      setServiciosEvento([]);
      return;
    }
    setLoadingServiciosEvento(true);
    setError(null);
    try {
      const response = await getEventoServicios(eventoId);
      if (response.success && Array.isArray(response.data)) {
        setServiciosEvento(response.data);
      } else {
        toast.error(response.message || 'Error al cargar servicios del evento');
        setServiciosEvento([]);
      }
    } catch (err) {
      toast.error('Error de conexión al cargar servicios del evento');
      setServiciosEvento([]);
    } finally {
      setLoadingServiciosEvento(false);
    }
  }, []); // Dependencia vacía si getEventoServicios no depende de otros estados cambiantes aquí

  // Añadir servicio al evento
  const handleAddServicio = async (servicioIdToAdd) => {
    if (!selectedEventoId || !servicioIdToAdd) return;
    setLoadingServiciosEvento(true); // Indicar carga mientras se actualiza
    try {
      const response = await addEventoServicio(selectedEventoId, { servicioId: servicioIdToAdd });
      if (response.success && Array.isArray(response.data)) {
        setServiciosEvento(response.data); // Actualizar con la lista que devuelve la API
        toast.success('Servicio añadido correctamente');
      } else {
        toast.error(response.message || 'Error al añadir el servicio');
      }
    } catch (err) {
      toast.error('Error de conexión al añadir servicio');
    } finally {
      setLoadingServiciosEvento(false);
    }
  };

  // Eliminar servicio del evento
  const handleRemoveServicio = async (servicioIdToRemove) => {
    if (!selectedEventoId || !servicioIdToRemove) return;
    if (!confirm('¿Está seguro de que desea eliminar este servicio del evento?')) return;
    
    setLoadingServiciosEvento(true); // Indicar carga mientras se actualiza
    try {
      const response = await removeEventoServicio(selectedEventoId, servicioIdToRemove);
       if (response.success && Array.isArray(response.data)) {
        setServiciosEvento(response.data); // Actualizar con la lista que devuelve la API
        toast.success('Servicio eliminado correctamente');
      } else {
        toast.error(response.message || 'Error al eliminar el servicio');
      }
    } catch (err) {
      toast.error('Error de conexión al eliminar servicio');
    } finally {
      setLoadingServiciosEvento(false);
    }
  };

  // Renderizado condicional mientras cargan los datos iniciales
  if (authLoading || loadingEventos || loadingAllServicios) {
    return <div className="p-6 text-center"><FaSpinner className="animate-spin mx-auto text-2xl text-gray-500" /> Cargando datos iniciales...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Servicios por Evento</h1>
      
      {error && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
           <span className="block sm:inline">{error}</span>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna 1: Selección de Evento */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Seleccionar Evento</h2>
          <select 
            value={selectedEventoId}
            onChange={(e) => handleEventoSelect(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            disabled={loadingEventos || loadingAllServicios} // Deshabilitar mientras carga
          >
            <option value="">-- Seleccione un evento --</option>
            {eventos.map(evento => (
              <option key={evento._id} value={evento._id}>
                {evento.nombreEvento} ({evento.fecha ? new Date(evento.fecha).toLocaleDateString() : 'Sin fecha'})
              </option>
            ))}
          </select>
        </div>

        {/* Columna 2: Servicios Contratados y Añadir */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">
            Servicios Contratados para: {eventos.find(e => e._id === selectedEventoId)?.nombreEvento || 'N/A'}
          </h2>
          
          {loadingServiciosEvento ? (
            <div className="text-center py-4"><FaSpinner className="animate-spin mx-auto text-indigo-600" /></div>
          ) : !selectedEventoId ? (
            <p className="text-sm text-gray-500 text-center py-4">Seleccione un evento para ver sus servicios.</p>
          ) : (
            <div className="space-y-3">
              {/* Lista de servicios contratados */} 
              {serviciosEvento.length === 0 ? (
                <p className="text-sm text-gray-500">Este evento no tiene servicios contratados.</p>
              ) : (
                serviciosEvento.map(servicio => (
                  <div key={servicio._id} className="flex justify-between items-center p-2 border rounded bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">{servicio.nombre}</span>
                    <button 
                      onClick={() => handleRemoveServicio(servicio._id)}
                      className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                      disabled={loadingServiciosEvento} // Deshabilitar mientras carga
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              )}
              
              {/* Sección para Añadir Servicio */}  
              <div className="pt-4 border-t mt-4">
                 <h3 className="text-md font-semibold mb-2">Añadir Servicio al Evento</h3>
                 <select 
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    onChange={(e) => e.target.value && handleAddServicio(e.target.value)}
                    value="" // Resetear selección después de añadir
                    disabled={loadingServiciosEvento || loadingAllServicios || !selectedEventoId} // Deshabilitar si carga o no hay evento
                 >
                     <option value="" disabled>-- Seleccionar servicio a añadir --</option>
                     {allServicios
                        .filter(s => !serviciosEvento.some(se => se._id === s._id)) // Excluir ya añadidos
                        .map(s => (
                           <option key={s._id} value={s._id}>{s.nombre} ({s.precio})</option> // Mostrar precio si existe
                        ))}
                 </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 