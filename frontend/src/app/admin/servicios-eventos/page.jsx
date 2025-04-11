'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaCalendarAlt, FaPlus, FaTrash, FaSpinner, FaEye, FaConciergeBell } from 'react-icons/fa';
import { toast } from 'sonner';

import { 
  getEventoReservations,
  addEventoServicio,
  removeEventoServicio
} from '@/services/reservationService';
import { getAllServicios } from '@/services/servicios.service';

const formatDate = (dateString) => {
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  } catch (error) {
    // console.warn("Error formateando fecha:", dateString, error);
    return dateString;
  }
};

export default function ServiciosPorEventoAdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [eventos, setEventos] = useState([]);
  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [allServicios, setAllServicios] = useState([]);
  
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingAllServicios, setLoadingAllServicios] = useState(true);
  const [loadingEventoDetails, setLoadingEventoDetails] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated && isAdmin) {
        setLoadingEventos(true);
        setLoadingAllServicios(true);
        setError(null);
        try {
          const [eventosResponse, serviciosResponse] = await Promise.all([
            getEventoReservations(),
            getAllServicios()
          ]);

          // LOG MUY ESPECÍFICO: Mostrar el primer evento recibido del backend
          if (eventosResponse.success && Array.isArray(eventosResponse.data) && eventosResponse.data.length > 0) {
            console.log('[DEBUG] Primer evento recibido del backend:', JSON.stringify(eventosResponse.data[0], null, 2));
          } else if (eventosResponse.success) {
            console.log('[DEBUG] El backend devolvió 0 eventos.');
          } else {
            console.log('[DEBUG] La petición de eventos al backend falló o tuvo formato inesperado:', eventosResponse);
          }

          if (eventosResponse.success && Array.isArray(eventosResponse.data)) {
            // Usar serviciosContratados y asegurar que es un array
            const processedEventos = eventosResponse.data.map(evento => ({
              ...evento,
              serviciosContratados: Array.isArray(evento.serviciosContratados) ? evento.serviciosContratados : []
            }));
            setEventos(processedEventos);
          } else {
            console.error("Error o formato inesperado al cargar eventos:", eventosResponse);
            setError('No se pudieron cargar los eventos.');
            toast.error('Error al cargar eventos.')
          }
          
          // console.log('[loadInitialData] Raw allServicios response:', serviciosResponse);

          if (serviciosResponse.success && Array.isArray(serviciosResponse.data)) {
            setAllServicios(serviciosResponse.data);
          } else {
             console.error("Error o formato inesperado al cargar servicios:", serviciosResponse);
             setError(prev => prev ? `${prev} No se pudieron cargar los servicios disponibles.` : 'No se pudieron cargar los servicios disponibles.');
             toast.warn('No se pudieron cargar todos los servicios para añadir.')
          }

        } catch (err) {
          console.error("Error cargando datos iniciales:", err);
          setError('Error de conexión al cargar datos iniciales.');
          toast.error('Error de conexión al cargar datos.')
        } finally {
           setLoadingEventos(false);
           setLoadingAllServicios(false);
        }
      }
    };
    loadInitialData();
  }, [isAuthenticated, isAdmin]);

  const eventosOrdenados = useMemo(() => {
    if (!eventos || eventos.length === 0) {
      return [];
    }
    // console.log('[useMemo eventosOrdenados] Sorting data:', eventos);
    return [...eventos].sort((a, b) => {
      // Usar serviciosContratados.length
      const countA = Array.isArray(a.serviciosContratados) ? a.serviciosContratados.length : 0;
      const countB = Array.isArray(b.serviciosContratados) ? b.serviciosContratados.length : 0;
      
      if (countB !== countA) { 
        return countB - countA;
      }
      
      try {
          const dateA = a.fechaEvento || a.fecha; 
          const dateB = b.fechaEvento || b.fecha;
          const timeA = new Date(dateA).getTime();
          const timeB = new Date(dateB).getTime();
          if (isNaN(timeA) || isNaN(timeB)) return 0;
          return timeB - timeA;
      } catch (e) {
          // console.warn("Error comparando fechas:", a.fechaEvento || a.fecha, b.fechaEvento || b.fecha, e);
          return 0;
      }
    });
  }, [eventos]);

  const selectedEvento = useMemo(() => {
    const found = eventos.find(e => e._id === selectedEventoId) || null;
    // console.log('[useMemo selectedEvento] Found:', found);
    return found;
  }, [eventos, selectedEventoId]);

  const serviciosDisponiblesParaAnadir = useMemo(() => {
    if (!selectedEvento || !allServicios.length) return [];
    // Usar serviciosContratados
    const serviciosContratadosActuales = Array.isArray(selectedEvento.serviciosContratados) 
                                        ? selectedEvento.serviciosContratados 
                                        : [];
    const idsContratados = serviciosContratadosActuales.map(s => typeof s === 'object' ? s._id : s);
    const disponibles = allServicios.filter(s => !idsContratados.includes(s._id));
    // console.log('[useMemo serviciosDisponibles] Available to add:', disponibles);
    return disponibles;
  }, [selectedEvento, allServicios]);

  const handleEventoSelect = (eventoId) => {
    // console.log(`[handleEventoSelect] Selecting evento ID: ${eventoId}`);
    setSelectedEventoId(eventoId);
  };

  const handleAddServicio = async (servicioIdToAdd) => {
    if (!selectedEventoId || !servicioIdToAdd) return;
    setLoadingEventoDetails(true);
    try {
      // console.log(`[handleAddServicio] Adding servicio ${servicioIdToAdd} to evento ${selectedEventoId}`);
      const response = await addEventoServicio(selectedEventoId, { servicioId: servicioIdToAdd });
      // console.log('[handleAddServicio] Response from backend:', response);
      
      if (response.success && response.data) {
        // Esperamos que la respuesta devuelva la lista actualizada en response.data
        // o dentro de response.data.serviciosContratados
        const updatedServicios = Array.isArray(response.data.serviciosContratados) 
                                  ? response.data.serviciosContratados 
                                  : (Array.isArray(response.data) ? response.data : []);

        if (!Array.isArray(updatedServicios)) {
           console.warn("[handleAddServicio] Backend response did not contain a valid services array:", response.data);
           toast.error('Respuesta inesperada del servidor al añadir servicio.');
        } else {
          setEventos(prevEventos => 
            prevEventos.map(e => 
              e._id === selectedEventoId 
              // Actualizar serviciosContratados
              ? { ...e, serviciosContratados: updatedServicios } 
              : e
            )
          );
          toast.success('Servicio añadido correctamente al evento');
        }
      } else {
        toast.error(response.message || 'Error al añadir el servicio al evento');
      }
    } catch (err) {
      toast.error('Error de conexión al añadir servicio al evento');
      console.error("Error en handleAddServicio:", err);
    } finally {
      setLoadingEventoDetails(false);
    }
  };

  const handleRemoveServicio = async (servicioIdToRemove) => {
    if (!selectedEventoId || !servicioIdToRemove) return;
    if (!confirm('¿Está seguro de que desea quitar este servicio del evento?')) return;
    
    setLoadingEventoDetails(true);
    try {
      // console.log(`[handleRemoveServicio] Removing servicio ${servicioIdToRemove} from evento ${selectedEventoId}`);
      const response = await removeEventoServicio(selectedEventoId, servicioIdToRemove);
       // console.log('[handleRemoveServicio] Response from backend:', response);
       
       if (response.success && response.data) {
         // Esperamos la lista actualizada en response.data.serviciosContratados o response.data
         const updatedServicios = Array.isArray(response.data.serviciosContratados) 
                                   ? response.data.serviciosContratados 
                                   : (Array.isArray(response.data) ? response.data : []);
                                  
         if (!Array.isArray(updatedServicios)) {
           console.warn("[handleRemoveServicio] Backend response did not contain a valid services array:", response.data);
           toast.error('Respuesta inesperada del servidor al eliminar servicio.');
         } else {
           setEventos(prevEventos => 
            prevEventos.map(e => 
              e._id === selectedEventoId 
              // Actualizar serviciosContratados
              ? { ...e, serviciosContratados: updatedServicios }
              : e
            )
          );
          toast.success('Servicio eliminado correctamente del evento');
         }
      } else {
        toast.error(response.message || 'Error al eliminar el servicio del evento');
      }
    } catch (err) {
      toast.error('Error de conexión al eliminar servicio del evento');
      console.error("Error en handleRemoveServicio:", err);
    } finally {
      setLoadingEventoDetails(false);
    }
  };

  const getColorClassForServiceCount = (count) => {
    if (count >= 5) return 'bg-green-100 hover:bg-green-200 border-green-300';
    if (count > 0) return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300';
    return 'bg-gray-100 hover:bg-gray-200 border-gray-300';
  };

  if (authLoading || loadingEventos || loadingAllServicios) {
    return <div className="p-6 text-center"><FaSpinner className="animate-spin mx-auto text-2xl text-gray-500" /> Cargando datos iniciales...</div>;
  }

  // console.log('[Render] Current eventos state:', eventos);
  // console.log('[Render] Current selectedEvento state:', selectedEvento);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Servicios por Evento</h1>
      
      {error && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
           <span className="block sm:inline">{error}</span>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow overflow-y-auto max-h-[80vh]">
          <h2 className="text-lg font-semibold mb-3 sticky top-0 bg-white pb-2">Eventos Agendados</h2>
          {eventosOrdenados.length === 0 ? (
            <p className="text-sm text-gray-500">No hay eventos encontrados.</p>
          ) : (
            <div className="space-y-2">
              {eventosOrdenados.map(evento => {
                // Usar serviciosContratados.length
                const numServicios = Array.isArray(evento.serviciosContratados) ? evento.serviciosContratados.length : 0;
                const colorClass = getColorClassForServiceCount(numServicios);
                const isSelected = evento._id === selectedEventoId;
                const tituloEvento = evento.nombreEvento || evento.tipoEvento?.titulo || 'Evento sin título';
                const fechaEvento = evento.fechaEvento || evento.fecha;
                return (
                  <button 
                    key={evento._id}
                    onClick={() => handleEventoSelect(evento._id)}
                    className={`w-full text-left p-3 border rounded-md transition-colors duration-150 ${colorClass} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                  >
                    <div className="font-semibold text-sm text-gray-800">{tituloEvento}</div>
                    <div className="text-xs text-gray-600 flex items-center">
                      <FaCalendarAlt className="mr-1" /> {formatDate(fechaEvento)}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center mt-1">
                       <FaConciergeBell className="mr-1" /> {numServicios} servicio(s) contratado(s)
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          {!selectedEvento ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FaEye className="text-4xl mb-3" />
              <p>Seleccione un evento de la lista para ver y editar sus servicios contratados.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-3 border-b pb-2">
                Servicios para: <span className="text-indigo-700">{selectedEvento.nombreEvento || selectedEvento.tipoEvento?.titulo}</span>
                <span className="text-sm text-gray-500 ml-2">({formatDate(selectedEvento.fechaEvento || selectedEvento.fecha)})</span>
              </h2>
              
              {loadingEventoDetails && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
                </div>
              )} 

              <div className="mb-4">
                 {/* Usar serviciosContratados */} 
                 <h3 className="text-md font-semibold mb-2">Servicios Contratados ({(Array.isArray(selectedEvento.serviciosContratados) ? selectedEvento.serviciosContratados.length : 0)})</h3>
                 <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {/* // console.log(`[Render] selectedEvento.serviciosContratados for ${selectedEvento._id}:`, selectedEvento.serviciosContratados) */} 
                   {/* Usar serviciosContratados */} 
                   {(!Array.isArray(selectedEvento.serviciosContratados) || selectedEvento.serviciosContratados.length === 0) ? (
                     <p className="text-sm text-gray-500 italic">Este evento no tiene servicios contratados.</p>
                   ) : (
                     selectedEvento.serviciosContratados.map((servicio, index) => {
                       // console.log(`[Render] Mapping servicioContratado[${index}]:`, servicio);
                       // Asumimos que 'servicio' es ahora el objeto poblado o al menos tiene _id y nombre
                       const servicioId = typeof servicio === 'object' && servicio !== null ? servicio._id : servicio;
                       const servicioNombre = typeof servicio === 'object' && servicio !== null ? servicio.nombre : `ID: ${servicio}`; // Mostrar ID si no hay nombre
                       
                       // Podríamos intentar buscar el nombre en allServicios si solo tenemos el ID
                       let finalNombre = servicioNombre;
                       if (typeof servicio === 'string' && allServicios.length > 0) {
                         const servicioCompleto = allServicios.find(s => s._id === servicio);
                         if (servicioCompleto) finalNombre = servicioCompleto.nombre;
                       }

                       return (
                         <div key={servicioId || `servicio-${index}`} className="flex justify-between items-center p-2 border rounded bg-gray-50">
                           <span className="text-sm font-medium text-gray-700">{finalNombre}</span>
                           <button 
                             onClick={() => handleRemoveServicio(servicioId)}
                             className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                             disabled={loadingEventoDetails}
                             aria-label={`Quitar servicio ${finalNombre}`}
                           >
                             <FaTrash />
                           </button>
                         </div>
                       );
                     })
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                 <h3 className="text-md font-semibold mb-2">Añadir Servicio a este Evento</h3>
                 {loadingAllServicios ? (
                   <p className="text-sm text-gray-500">Cargando servicios disponibles...</p>
                 ) : serviciosDisponiblesParaAnadir.length === 0 ? (
                   <p className="text-sm text-gray-500 italic">No hay más servicios disponibles para añadir o ya están todos contratados.</p>
                 ) : (
                   <div className="flex items-center space-x-2">
                      <select 
                          className="flex-grow mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          onChange={(e) => { 
                            if (e.target.value) handleAddServicio(e.target.value); 
                            e.target.value = "";
                          }}
                          value=""
                          disabled={loadingEventoDetails || loadingAllServicios}
                      >
                          <option value="" disabled>-- Seleccionar servicio a añadir --</option>
                          {serviciosDisponiblesParaAnadir.map(s => (
                              <option key={s._id} value={s._id}>{s.nombre} ({s.precio ? `${s.precio}€` : 'Precio no especificado'})</option>
                          ))}
                      </select>
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 