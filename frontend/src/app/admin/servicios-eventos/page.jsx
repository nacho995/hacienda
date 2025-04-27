'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaCalendarAlt, FaPlus, FaTrash, FaSpinner, FaEye, FaConciergeBell } from 'react-icons/fa';
import { toast } from 'sonner';

import { 
  getEventoReservations,
  updateEventoReservation,
} from '@/services/reservationService';
import { 
  getAllServicios 
} from '@/services/servicios.service';

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
  const { isAuthenticated, isAdmin, loading: authLoading, user } = useAuth();

  const [eventos, setEventos] = useState([]);
  const [selectedEventoId, setSelectedEventoId] = useState(null);
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
          const params = { soloReservaEvento: true };
          const [eventosResponse, serviciosResponse] = await Promise.all([
            getEventoReservations(params),
            getAllServicios()
          ]);

          if (eventosResponse.success && Array.isArray(eventosResponse.data)) {
            setEventos(eventosResponse.data);
            if (eventosResponse.data.length > 0) {
              // Opcional: seleccionar el primer evento por defecto
              // setSelectedEventoId(eventosResponse.data[0]._id);
              // console.log("[DEBUG] Primer evento recibido del backend:", eventosResponse.data[0]);
            }
          } else {
            setError('Error al cargar los eventos agendados.');
            console.error("Respuesta inesperada de eventos:", eventosResponse);
          }
          
          if (serviciosResponse.success && Array.isArray(serviciosResponse.data)) {
            setAllServicios(serviciosResponse.data);
          } else {
            setError('Error al cargar la lista de servicios disponibles.');
            console.error("Respuesta inesperada de servicios:", serviciosResponse);
          }

        } catch (err) {
          console.error("Error cargando datos iniciales:", err);
          setError('Error de conexión al cargar datos.');
          toast.error('No se pudieron cargar los datos necesarios.');
        } finally {
          setLoadingEventos(false);
          setLoadingAllServicios(false);
        }
      }
    };
    loadInitialData();
  }, [isAuthenticated, isAdmin]);

  const eventosOrdenados = useMemo(() => {
    return [...eventos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [eventos]);

  const selectedEvento = useMemo(() => {
    return eventos.find(e => e._id === selectedEventoId);
  }, [eventos, selectedEventoId]);

  const serviciosDisponiblesParaAnadir = useMemo(() => {
    if (!selectedEvento || !allServicios) return [];
    
    const idsServiciosContratados = new Set(
        (selectedEvento.serviciosContratados || []).map(item => {
            // Manejar ambas estructuras posibles (objeto populado o solo ID)
            const servicioData = item.servicio || item;
            return servicioData?._id || servicioData;
        })
    );

    return allServicios.filter(s => !idsServiciosContratados.has(s._id));
  }, [selectedEvento, allServicios]);

  const handleEventoSelect = (eventoId) => {
    // console.log(`Evento seleccionado: ${eventoId}`);
    // Limpiar selección si se hace clic en el mismo evento? (Opcional)
    // if (selectedEventoId === eventoId) {
    //   setSelectedEventoId(null);
    // } else {
    setSelectedEventoId(eventoId);
    // }
  };

  const handleAddServicio = async (servicioIdToAdd) => {
    if (!selectedEvento || !servicioIdToAdd) return; // Usar selectedEvento en lugar de selectedEventoId

    // Evitar añadir duplicados (basado en IDs)
    const yaExiste = selectedEvento.serviciosContratados?.some(item => {
        const servicioData = item.servicio || item;
        return (servicioData?._id || servicioData) === servicioIdToAdd;
    });
    if (yaExiste) {
        toast.info('Este servicio ya está añadido al evento.');
        return;
    }

    setLoadingEventoDetails(true); // Iniciar carga

    const nuevoServicioEntry = { 
        servicio: servicioIdToAdd, // Guardar solo el ID, el populate se hará en el backend/lectura
        cantidad: 1 // Asumir cantidad 1 por defecto
    };

    // Obtener el array actual, asegurándose de que sea un array
    const currentServicios = Array.isArray(selectedEvento.serviciosContratados) 
                            ? selectedEvento.serviciosContratados 
                            : [];

    const newServiciosArray = [...currentServicios, nuevoServicioEntry];

    try {
      // Llamar a la función genérica de actualización
      const response = await updateEventoReservation(selectedEvento._id, { 
        serviciosContratados: newServiciosArray // Enviar el array completo actualizado
      });
      
      if (response.success && response.data) {
         // Actualizar el estado local con la reserva completa devuelta por el backend
         // Esto asegura que tenemos los datos más recientes, incluyendo los populados si el backend los devuelve
        setEventos(prevEventos => 
          prevEventos.map(e => 
            e._id === selectedEvento._id 
            ? response.data // Reemplazar el evento completo con la respuesta
            : e
          )
        );
        toast.success('Servicio añadido correctamente');
      } else {
        toast.error(response.message || 'Error al añadir el servicio');
      }
    } catch (err) {
      toast.error('Error de conexión al añadir servicio');
      console.error("Error en handleAddServicio:", err);
    } finally {
      setLoadingEventoDetails(false); // Finalizar carga
    }
  };

  const handleRemoveServicio = async (servicioIdToRemove) => {
    if (!selectedEvento || !servicioIdToRemove) return; // Usar selectedEvento
    if (!confirm('¿Está seguro de que desea quitar este servicio del evento?')) return;
    
    setLoadingEventoDetails(true); // Iniciar carga

    // Filtrar el servicio a eliminar
    const newServiciosArray = (selectedEvento.serviciosContratados || []).filter(item => {
       // Manejar ambas estructuras posibles (objeto populado o solo ID) al comparar
       const servicioData = item.servicio || item;
       return (servicioData?._id || servicioData) !== servicioIdToRemove;
    });

    try {
      // Llamar a la función genérica de actualización
      const response = await updateEventoReservation(selectedEvento._id, { 
        serviciosContratados: newServiciosArray // Enviar el array completo actualizado
      });
       
       if (response.success && response.data) {
         // Actualizar el estado local con la reserva completa devuelta por el backend
        setEventos(prevEventos => 
          prevEventos.map(e => 
            e._id === selectedEvento._id 
            ? response.data // Reemplazar el evento completo con la respuesta
            : e
          )
        );
        toast.success('Servicio eliminado correctamente');
      } else {
        toast.error(response.message || 'Error al eliminar el servicio');
      }
    } catch (err) {
      toast.error('Error de conexión al eliminar servicio');
      console.error("Error en handleRemoveServicio:", err);
    } finally {
      setLoadingEventoDetails(false); // Finalizar carga
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
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Eventos Agendados</h2>
          <div className="max-h-[70vh] overflow-y-auto space-y-2 pr-2">
            {loadingEventos ? (
              <div className="text-center py-4"><FaSpinner className="animate-spin mx-auto text-gray-400" /></div>
            ) : eventosOrdenados.length > 0 ? (
              eventosOrdenados.map((evento) => {
                const servicioCount = evento.serviciosContratados?.length || 0;
                const isSelected = evento._id === selectedEventoId;
                const colorClass = getColorClassForServiceCount(servicioCount);
                return (
                  <button
                    key={evento._id}
                    onClick={() => handleEventoSelect(evento._id)}
                    className={`w-full text-left p-3 border rounded-md transition-colors duration-150 ${colorClass} ${isSelected ? 'ring-2 ring-[var(--color-primary)] ring-offset-1' : 'border-gray-200'}`}
                  >
                    <p className="font-medium text-gray-900 text-sm">{evento.nombreEvento || 'Evento sin nombre'}</p>
                    <div className="flex items-center text-xs text-gray-600 mt-1">
                      <FaCalendarAlt className="mr-1.5" />
                      <span>{formatDate(evento.fecha)}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                       <FaConciergeBell className="mr-1.5" />
                       <span>{servicioCount} servicio(s) contratado(s)</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-4">No hay eventos agendados.</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          {selectedEvento ? (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Servicios para: <span className="text-[var(--color-primary)]">{selectedEvento.nombreEvento}</span></h2>
              <p className="text-sm text-gray-500 mb-4">({formatDate(selectedEvento.fecha)})</p>
              
              {loadingEventoDetails ? (
                 <div className="text-center py-6"><FaSpinner className="animate-spin mx-auto text-xl text-gray-500" /></div>
              ) : (
                <>
                  {/* Sección Servicios Contratados */}
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-700 mb-3">Servicios Contratados ({selectedEvento.serviciosContratados?.length || 0})</h3>
                    <div className="max-h-[35vh] overflow-y-auto pr-2 border rounded-md p-2 bg-gray-50">
                      {selectedEvento.serviciosContratados && selectedEvento.serviciosContratados.length > 0 ? (
                        selectedEvento.serviciosContratados.map((servicioContratado, index) => {
                          // Determinar cuál es el objeto real del servicio
                          const servicioData = servicioContratado.servicio || servicioContratado;
                          
                          // Obtener el ID de forma segura
                          const servicioId = servicioData?._id || servicioContratado;

                          // Obtener el nombre de forma segura
                          const servicioNombre = servicioData?.nombre || 'Servicio Desconocido'; 

                          // <<< LOG DE DIAGNÓSTICO >>>
                          console.log(`[Servicios Evento Render] Iteración ${index}:`, {
                            servicioContratadoOriginal: servicioContratado,
                            servicioDataIdentificado: servicioData,
                            idExtraido: servicioId,
                            nombreExtraido: servicioData?.nombre,
                            nombreFinal: servicioNombre
                          });
                          
                          return (
                            <div key={servicioId || `servicio-${index}`} className="flex items-center justify-between p-3 border rounded-md bg-white mb-2 shadow-sm">
                              <span className="text-sm text-gray-800">
                                {servicioNombre} {/* <-- Mostrar el nombre obtenido */} 
                              </span>
                              <button 
                                onClick={() => handleRemoveServicio(servicioId)} // <-- Usar el ID correcto
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                                title="Eliminar servicio del evento"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 italic text-center py-4">No hay servicios contratados para este evento.</p>
                      )}
                    </div>
                  </div>

                  {/* Sección Añadir Servicio */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-700 mb-3">Añadir Servicio a este Evento</h3>
                    {loadingAllServicios ? (
                      <div className="text-center py-2"><FaSpinner className="animate-spin mx-auto text-gray-400" /></div>
                    ) : serviciosDisponiblesParaAnadir.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <select 
                           onChange={(e) => e.target.value && handleAddServicio(e.target.value)}
                           className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                           defaultValue=""
                        >
                          <option value="" disabled>-- Seleccionar servicio a añadir --</option>
                          {serviciosDisponiblesParaAnadir.map(servicio => (
                            <option key={servicio._id} value={servicio._id}>
                              {servicio.nombre} (${servicio.precio})
                            </option>
                          ))}
                        </select>
                        {/* Botón de añadir podría ir aquí si no se añade al cambiar select */}
                      </div>
                    ) : (
                       <p className="text-sm text-gray-500 italic">Todos los servicios disponibles ya están añadidos a este evento.</p>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <FaEye size={24} className="mx-auto mb-2" />
              <p>Selecciona un evento de la lista para ver y gestionar sus servicios.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 