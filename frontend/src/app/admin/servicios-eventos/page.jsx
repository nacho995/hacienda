'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaUsers, FaCalendarAlt, FaPlus, FaTrash, FaSpinner, FaEye, FaListAlt, FaBoxOpen } from 'react-icons/fa';
import { toast } from 'sonner';
import Link from 'next/link';

// Cambiar importaciones: Usar servicios de tiposEvento.service.js
// import { getEventoServicios, addEventoServicio, removeEventoServicio } from '@/services/reservationService'; // QUITAR
import { getAllTiposEvento } from '@/services/tiposEvento.service'; // AÑADIR
import { 
  getServiciosPorTipoEventoId, 
  addServicioATipoEvento, 
  removeServicioDeTipoEvento 
} from '@/services/tiposEvento.service'; // AÑADIR
import { getAllServicios } from '@/services/servicios.service';

export default function ServiciosEventosAdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [tiposEvento, setTiposEvento] = useState([]);
  const [selectedTipoEventoId, setSelectedTipoEventoId] = useState('');
  const [serviciosDelTipoEvento, setServiciosDelTipoEvento] = useState([]);
  const [allServicios, setAllServicios] = useState([]);
  
  const [loadingTiposEvento, setLoadingTiposEvento] = useState(true);
  const [loadingServiciosDelTipo, setLoadingServiciosDelTipo] = useState(false);
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
        setLoadingTiposEvento(true);
        setLoadingAllServicios(true);
        setError(null);
        try {
          const [tiposEventoResponse, serviciosResponse] = await Promise.all([
            getAllTiposEvento(),
            getAllServicios()
          ]);

          if (tiposEventoResponse.success && Array.isArray(tiposEventoResponse.data)) {
            setTiposEvento(tiposEventoResponse.data);
          } else {
            console.error("Error o formato inesperado al cargar tipos de evento:", tiposEventoResponse);
            setError('No se pudieron cargar los tipos de evento.');
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
           setLoadingTiposEvento(false);
           setLoadingAllServicios(false);
        }
      }
    };
    loadInitialData();
  }, [isAuthenticated, isAdmin]);

  // Cargar servicios del TIPO de evento seleccionado
  const handleTipoEventoSelect = useCallback(async (tipoEventoId) => {
    setSelectedTipoEventoId(tipoEventoId);
    if (!tipoEventoId) {
      setServiciosDelTipoEvento([]);
      return;
    }
    setLoadingServiciosDelTipo(true);
    setError(null);
    try {
      const response = await getServiciosPorTipoEventoId(tipoEventoId);
      if (response.success && Array.isArray(response.data)) {
        // Log para ver qué datos se van a setear
        console.log("[handleTipoEventoSelect] Datos recibidos para setear:", response.data);
        setServiciosDelTipoEvento(response.data);
      } else {
        toast.error(response.message || 'Error al cargar servicios del tipo de evento');
        setServiciosDelTipoEvento([]);
      }
    } catch (err) {
      toast.error('Error de conexión al cargar servicios del tipo de evento');
      setServiciosDelTipoEvento([]);
    } finally {
      setLoadingServiciosDelTipo(false);
    }
  }, []);

  // Añadir servicio al TIPO de evento
  const handleAddServicio = async (servicioIdToAdd) => {
    if (!selectedTipoEventoId || !servicioIdToAdd) return;
    setLoadingServiciosDelTipo(true);
    try {
      const response = await addServicioATipoEvento(selectedTipoEventoId, servicioIdToAdd);
      if (response.success && Array.isArray(response.data)) {
        setServiciosDelTipoEvento(response.data);
        toast.success('Servicio añadido correctamente');
      } else {
        toast.error(response.message || 'Error al añadir el servicio');
      }
    } catch (err) {
      toast.error('Error de conexión al añadir servicio');
    } finally {
      setLoadingServiciosDelTipo(false);
    }
  };

  // Eliminar servicio del TIPO de evento
  const handleRemoveServicio = async (servicioIdToRemove) => {
    if (!selectedTipoEventoId || !servicioIdToRemove) return;
    if (!confirm('¿Está seguro de que desea eliminar este servicio del tipo de evento?')) return;
    
    setLoadingServiciosDelTipo(true);
    try {
      const response = await removeServicioDeTipoEvento(selectedTipoEventoId, servicioIdToRemove);
       if (response.success && Array.isArray(response.data)) {
        setServiciosDelTipoEvento(response.data);
        toast.success('Servicio eliminado correctamente');
      } else {
        toast.error(response.message || 'Error al eliminar el servicio');
      }
    } catch (err) {
      toast.error('Error de conexión al eliminar servicio');
    } finally {
      setLoadingServiciosDelTipo(false);
    }
  };

  // Renderizado condicional mientras cargan los datos iniciales
  if (authLoading || loadingTiposEvento || loadingAllServicios) {
    return <div className="p-6 text-center"><FaSpinner className="animate-spin mx-auto text-2xl text-gray-500" /> Cargando datos iniciales...</div>;
  }

  // Log para verificar el estado antes de renderizar
  console.log("[Render] Estado tiposEvento:", tiposEvento);
  console.log("[Render] Estado allServicios:", allServicios);
  // Log específico para los servicios del tipo seleccionado
  console.log("[Render] Estado serviciosDelTipoEvento:", serviciosDelTipoEvento);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Servicios por Tipo de Evento</h1>
      
      {error && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
           <span className="block sm:inline">{error}</span>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna 1: Selección de TIPO de Evento */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Seleccionar Tipo de Evento</h2>
          <select 
            value={selectedTipoEventoId}
            onChange={(e) => handleTipoEventoSelect(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            disabled={loadingTiposEvento || loadingAllServicios}
          >
            <option value="">-- Seleccione un tipo de evento --</option>
            {tiposEvento.map(tipo => (
              <option key={tipo._id} value={tipo._id}>
                {tipo.titulo || tipo.nombre || `Tipo ID: ${tipo._id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Columna 2: Servicios Asociados y Añadir */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">
            Servicios Asociados a: {tiposEvento.find(t => t._id === selectedTipoEventoId)?.titulo || 'N/A'}
          </h2>
          
          {loadingServiciosDelTipo ? (
            <div className="text-center py-4"><FaSpinner className="animate-spin mx-auto text-indigo-600" /></div>
          ) : !selectedTipoEventoId ? (
            <p className="text-sm text-gray-500 text-center py-4">Seleccione un tipo de evento para ver sus servicios asociados.</p>
          ) : (
            <div className="space-y-3">
              {serviciosDelTipoEvento.length === 0 ? (
                <p className="text-sm text-gray-500">Este tipo de evento no tiene servicios asociados.</p>
              ) : (
                serviciosDelTipoEvento.map((servicio, index) => (
                  <div key={servicio._id || `servicio-${index}`} className="flex justify-between items-center p-2 border rounded bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">{servicio.nombre}</span>
                    <button 
                      onClick={() => handleRemoveServicio(servicio._id)}
                      className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                      disabled={loadingServiciosDelTipo}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              )}
              
              <div className="pt-4 border-t mt-4">
                 <h3 className="text-md font-semibold mb-2">Añadir Servicio al Tipo de Evento</h3>
                 <select 
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    onChange={(e) => e.target.value && handleAddServicio(e.target.value)}
                    value=""
                    disabled={loadingServiciosDelTipo || loadingAllServicios || !selectedTipoEventoId}
                 >
                     <option value="" disabled>-- Seleccionar servicio a añadir --</option>
                     {allServicios
                        .filter(s => !serviciosDelTipoEvento.some(se => se._id === s._id))
                        .map(s => (
                           <option key={s._id} value={s._id}>{s.nombre} ({s.precio})</option>
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