"use client";

import { useState, useEffect, useCallback } from 'react';
import { FaUserCog, FaUsers, FaChevronRight, FaEnvelope, FaBed, FaTimes, FaSpinner, FaList, FaMapMarkedAlt, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { useReservation } from '@/context/ReservationContext';
import { obtenerHabitaciones, obtenerHabitacionesDisponibles } from '@/services/habitaciones.service';
import { toast } from 'sonner';
import EventoMapaHabitaciones from './EventoMapaHabitacionesNuevo';

const ModoGestionHabitaciones = ({ onModeSelect, numeroHabitaciones = 7 }) => {
  const { formData, updateFormSection } = useReservation();
  const [selectedMode, setSelectedMode] = useState(formData.modoGestionHabitaciones || null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [tiposHabitaciones, setTiposHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarListaHabitaciones, setMostrarListaHabitaciones] = useState(false);
  
  useEffect(() => {
    const shouldUpdate = formData.numeroHabitaciones !== numeroHabitaciones;
    if (shouldUpdate) {
      updateFormSection('numeroHabitaciones', numeroHabitaciones);
    }
  }, [numeroHabitaciones, formData.numeroHabitaciones, updateFormSection]);

  const handleRoomsChange = useCallback((data) => {
    if (data && data.action === 'remove') {
      const letraToRemove = data.letra;
      const currentAsignaciones = formData.asignacionHabitaciones || [];
      const nuevasAsignaciones = currentAsignaciones.filter(h => h.letra !== letraToRemove);
      updateFormSection('asignacionHabitaciones', nuevasAsignaciones);

      const currentSeleccionadas = formData.habitacionesSeleccionadas || [];
      let encontrada = false;
      const nuevasSeleccionadasRemove = currentSeleccionadas.filter(h => {
        if (h.letra === letraToRemove && !encontrada) {
          encontrada = true;
          return false;
        }
        return true;
      });
      updateFormSection('habitacionesSeleccionadas', nuevasSeleccionadasRemove);
      return;
    }
    
    if (data && data.action === 'add') {
      const habitacion = data.habitacion;
      const currentAsignacionesAdd = formData.asignacionHabitaciones || [];
      const habitacionExisteEnAsignacion = currentAsignacionesAdd.find(h => 
        (h.id && habitacion.id && h.id === habitacion.id) || 
        (h.letra && habitacion.letra && h.letra === habitacion.letra)
      );
      if (!habitacionExisteEnAsignacion) {
        updateFormSection('asignacionHabitaciones', [...currentAsignacionesAdd, habitacion]);
      }

      const currentSeleccionadasAdd = formData.habitacionesSeleccionadas || [];
      const nuevaHabitacion = tiposHabitaciones.find(h => 
        (h.id && habitacion.id && h.id === habitacion.id) || 
        (h.letra && habitacion.letra && h.letra === habitacion.letra)
      ) || habitacion;
      const habitacionConId = {
        ...nuevaHabitacion,
        uniqueId: `${nuevaHabitacion.letra}-${currentSeleccionadasAdd.length}-${Date.now()}`
      };
      const habitacionExisteEnSeleccionadas = currentSeleccionadasAdd.find(h => h.uniqueId === habitacionConId.uniqueId);
      if (!habitacionExisteEnSeleccionadas) {
         updateFormSection('habitacionesSeleccionadas', [...currentSeleccionadasAdd, habitacionConId]);
      }
      return;
    }
    
    if (data) {
      const habitacion = Array.isArray(data) ? data[0] : data;
      const currentAsignacionesDef = formData.asignacionHabitaciones || [];
      const habitacionExisteAsignacionDef = currentAsignacionesDef.find(h => 
        (h.id && habitacion.id && h.id === habitacion.id) || 
        (h.letra && habitacion.letra && h.letra === habitacion.letra)
      );
      if (!habitacionExisteAsignacionDef) {
        updateFormSection('asignacionHabitaciones', [...currentAsignacionesDef, habitacion]);
      }
      
      const currentSeleccionadasDef = formData.habitacionesSeleccionadas || [];
      const nuevaHabitacionDef = tiposHabitaciones.find(h => 
        (h.id && habitacion.id && h.id === habitacion.id) || 
        (h.letra && habitacion.letra && h.letra === habitacion.letra)
      ) || habitacion;
      const habitacionConIdDef = {
        ...nuevaHabitacionDef,
        uniqueId: `${nuevaHabitacionDef.letra}-${currentSeleccionadasDef.length}-${Date.now()}`
      };
      const habitacionExisteSeleccionadasDef = currentSeleccionadasDef.find(h => h.uniqueId === habitacionConIdDef.uniqueId);
      if (!habitacionExisteSeleccionadasDef) {
         updateFormSection('habitacionesSeleccionadas', [...currentSeleccionadasDef, habitacionConIdDef]);
      }
    }
  }, [tiposHabitaciones, updateFormSection, formData.habitacionesSeleccionadas, formData.asignacionHabitaciones]);
  
  const handleHabitacionesLoad = useCallback((habitaciones) => {
    if (habitaciones && habitaciones.length > 0) {
      setTiposHabitaciones(habitaciones);
    }
  }, []);

  const toggleListaHabitaciones = () => {
    setMostrarListaHabitaciones(!mostrarListaHabitaciones);
  };

  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        if (formData.fecha) {
          const fechaInicio = formData.fecha;
          const fechaFin = formData.fecha;
          response = await obtenerHabitacionesDisponibles(fechaInicio, fechaFin);
        } else {
          response = await obtenerHabitaciones();
        }
        
        let habitacionesData = [];
        if (response && response.success && Array.isArray(response.data)) {
          habitacionesData = response.data;
        } else {
           console.warn('La respuesta de la API de habitaciones no tiene el formato esperado o falló:', response);
        }

        const habitacionesFormateadas = habitacionesData.map(hab => ({
          id: hab.id || hab._id,
          letra: hab.letra || (hab.id ? hab.id.toString().charAt(0).toUpperCase() : ''),
          nombre: hab.nombre || `Habitación ${hab.numeroHabitacion || hab.numero || hab.letra}`,
          capacidad: hab.capacidad || 2,
          precio: hab.precio || 120,
          descripcion: hab.descripcion || `${hab.tipo || 'Estándar'} - ${hab.planta || '1'}ª planta`,
          tipo: hab.tipo || 'Estándar',
          planta: hab.planta || 1,
          estado: hab.estado || 'Disponible'
        }));
        
        setTiposHabitaciones(habitacionesFormateadas);
      } catch (err) {
        console.error('Error al cargar habitaciones:', err);
        setError('No se pudieron cargar las habitaciones. Por favor, inténtelo de nuevo más tarde.');
        toast.error('No se pudieron cargar las habitaciones');
        setTiposHabitaciones([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHabitaciones();
  }, [formData.fecha]);

  const handleSelectMode = (mode) => {
    setSelectedMode(mode);
    updateFormSection('modoGestionHabitaciones', mode);
    
    if (mode === 'hacienda') {
      onModeSelect();
    }
  };

  const toggleHabitacion = (habitacionId) => {
    const habitacion = tiposHabitaciones.find(h => h.id === habitacionId || h.letra === habitacionId);
    if (!habitacion) {
      toast.error(`No se encontró la habitación ${habitacionId}. Puede que no esté disponible.`);
      return;
    }
    const currentSeleccionadas = formData.habitacionesSeleccionadas || [];
    const habitacionIndex = currentSeleccionadas.findIndex(h => h.id === habitacion.id || h.letra === habitacion.letra);
    let updatedHabitaciones;
    if (habitacionIndex >= 0) {
      updatedHabitaciones = currentSeleccionadas.filter((_, index) => index !== habitacionIndex);
      toast.success(`Habitación ${habitacion.letra || habitacion.id} eliminada`);
    } else {
      updatedHabitaciones = [...currentSeleccionadas, habitacion];
      toast.success(`Habitación ${habitacion.letra || habitacion.id} seleccionada`);
    }
    updateFormSection('habitacionesSeleccionadas', updatedHabitaciones);
  };

  const eliminarHabitacion = (habitacionId) => {
    const currentSeleccionadas = formData.habitacionesSeleccionadas || [];
    const updatedHabitaciones = currentSeleccionadas.filter(h => h.id !== habitacionId && h.letra !== habitacionId);
    updateFormSection('habitacionesSeleccionadas', updatedHabitaciones);
    toast.success(`Habitación eliminada`);
  };

  const handleContinue = () => {
    if (!selectedMode) {
      setShowErrorModal(true);
      setErrorMessage('Por favor, seleccione un modo de gestión de habitaciones');
      return;
    }
    if (selectedMode === 'usuario' && (!formData.habitacionesSeleccionadas || formData.habitacionesSeleccionadas.length === 0)) {
      setShowErrorModal(true);
      setErrorMessage('Por favor, seleccione al menos una habitación');
      return;
    }
    if (selectedMode === 'usuario' && (!formData.asignacionHabitaciones || formData.asignacionHabitaciones.length === 0)) {
      setShowErrorModal(true);
      setErrorMessage('Por favor, asigne al menos una habitación para los huéspedes');
      return;
    }
    if (typeof onModeSelect === 'function') {
         onModeSelect();
    } else {
        console.warn("onModeSelect no es una función en ModoGestionHabitaciones");
    }
  };

  const getButtonStyle = (habitacionLetra) => {
    const baseStyle = 'p-1 rounded-full transition-all duration-200 text-xs font-bold w-8 h-8 flex items-center justify-center mx-auto focus:outline-none focus:ring-2 focus:ring-offset-1';
    const isSelected = formData.habitacionesSeleccionadas?.some(h => h.letra === habitacionLetra);

    if (['A', 'B'].includes(habitacionLetra)) {
      return `${baseStyle} ${
        isSelected
          ? 'bg-[#9DDFD3] hover:bg-[#7DCFC3] border-2 border-[#6DBFB3] text-[#0F0F0F] ring-[#6DBFB3]'
          : 'bg-[#E5F6F3] hover:bg-[#D2EDE8] border-2 border-[#9DDFD3] text-[#368578] ring-[#9DDFD3]'
      }`;
    }
    if (['C', 'D', 'E', 'F'].includes(habitacionLetra)) {
      return `${baseStyle} ${
        isSelected
          ? 'bg-[#B5D8C7] hover:bg-[#95C8B7] border-2 border-[#75B8A7] text-[#0F0F0F] ring-[#75B8A7]'
          : 'bg-[#EAF5F0] hover:bg-[#D7ECE5] border-2 border-[#B5D8C7] text-[#468C78] ring-[#B5D8C7]'
      }`;
    }
    return `${baseStyle} ${
      isSelected
        ? 'bg-[#C7E2B7] hover:bg-[#B7D2A7] border-2 border-[#97C287] text-[#0F0F0F] ring-[#97C287]'
        : 'bg-[#F0F7EB] hover:bg-[#E0EDD6] border-2 border-[#C7E2B7] text-[#6A9456] ring-[#C7E2B7]'
    }`;
  };

  return (
    <div className="space-y-8">
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">Error</h2>
              <button
                onClick={() => setShowErrorModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <p className="text-gray-700 mb-4">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div
          onClick={() => handleSelectMode('usuario')}
          className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
            selectedMode === 'usuario'
              ? 'bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] border-[#A5856A] text-[#0F0F0F] shadow-md'
              : 'border-gray-200 hover:border-[var(--color-primary)]/50'
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
              <FaUsers className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gestión por el Organizador</h3>
              <p className="text-sm text-gray-500">Usted asigna las habitaciones y huéspedes</p>
            </div>
          </div>

          <ul className="space-y-2 text-gray-600 mb-4">
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              </span>
              <span>Usted asigna las habitaciones para cada huésped</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              </span>
              <span>Usted establece las fechas de entrada y salida</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              </span>
              <span>Información completa en la confirmación de reserva</span>
            </li>
          </ul>

          <div className="text-sm text-gray-500 italic">
            Recomendado si ya tiene la información de todos los huéspedes
          </div>
        </div>

        <div
          onClick={() => handleSelectMode('hacienda')}
          className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
            selectedMode === 'hacienda'
              ? 'bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] border-[#A5856A] text-[#0F0F0F] shadow-md'
              : 'border-gray-200 hover:border-[var(--color-primary)]/50'
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-4">
              <FaUserCog className="w-8 h-8 text-[var(--color-accent)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gestión por la Hacienda</h3>
              <p className="text-sm text-gray-500">El personal de la hacienda gestiona los detalles</p>
            </div>
          </div>

          <ul className="space-y-2 text-gray-600 mb-4">
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
              </span>
              <span>El personal asignará las habitaciones según disponibilidad</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
              </span>
              <span>Recibirá un email con un enlace para proporcionar los datos de huéspedes</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
              </span>
              <span>Posibilidad de editar datos en el panel de administración</span>
            </li>
          </ul>

          <div className="text-sm text-gray-500 italic">
            Recomendado si aún no tiene la información completa de los huéspedes
          </div>
        </div>
      </div>

      {selectedMode === 'hacienda' && (
        <div className="p-4 bg-black border border-gray-700 rounded-lg">
          <div className="flex items-start">
            <FaEnvelope className="text-white mt-1 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white">Información importante</h4>
              <p className="text-sm text-gray-300 mt-1">
                Al seleccionar esta opción, se enviará un correo electrónico al personal de la hacienda con los detalles de su reserva.
                Ellos se pondrán en contacto con usted para gestionar la asignación de habitaciones y recopilar la información de los huéspedes. Todos los datos proporcionados en este formulario estarán disponibles para su edición en el panel de administración.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedMode === 'usuario' && (
        <div>
          <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-4">
            Seleccione las habitaciones ({formData.habitacionesSeleccionadas?.length} de {numeroHabitaciones})
          </h3>

          <div className="mb-8 border border-[#D1B59B] rounded-lg p-4 bg-white shadow-md">
            <h5 className="text-lg font-semibold text-[#7B5C44] mb-4">Plano de habitaciones</h5>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)]" />
                <span className="ml-3 text-lg">Cargando habitaciones disponibles...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : (
              <EventoMapaHabitaciones
                onRoomsChange={handleRoomsChange}
                eventDate={formData.fecha || new Date().toISOString().split('T')[0]}
                onHabitacionesLoad={handleHabitacionesLoad}
              />
            )}
          </div>

          <div className="mt-6 mb-8">
            <h5 className="text-lg font-semibold text-[#7B5C44] mb-4">Habitaciones seleccionadas</h5>
            {formData.habitacionesSeleccionadas?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.habitacionesSeleccionadas.map((habitacion, index) => (
                  <div
                    key={`lista-habitacion-${habitacion.letra}-${index}`}
                    className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm relative"
                  >
                    <button
                      onClick={() => eliminarHabitacion(habitacion.letra || habitacion.id)}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Eliminar habitación"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>

                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-[#9DDFD3] text-gray-800">
                        <span className="font-bold">{habitacion.letra || habitacion.id.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{habitacion.nombre}</h4>
                        <p className="text-sm text-gray-600">
                          {habitacion.tipo || 'Estándar'} • {habitacion.planta || 'Planta principal'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Capacidad:</span>
                        <span className="font-medium">{habitacion.capacidad || 2} personas</span>
                      </div>
                      
                      {habitacion.descripcion && (
                        <div className="mt-2 text-xs text-gray-500">
                          {habitacion.descripcion.substring(0, 100)}{habitacion.descripcion.length > 100 ? '...' : ''}
                        </div>
                      )}
                      <div className="mt-2 bg-[#E5F6F3] p-2 rounded text-xs">
                        <FaCheckCircle className="inline-block mr-1 text-[#9DDFD3]" /> Habitación seleccionada
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <FaBed className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No hay habitaciones seleccionadas
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Seleccione habitaciones en el mapa para asignarlas al evento.
                </p>
              </div>
            )}
          </div>

        
        </div>
      )}

      {selectedMode === 'usuario' && formData.habitacionesSeleccionadas?.length > 0 && (
        <div className="mt-8 p-6 bg-white border border-[#D1B59B] rounded-lg shadow-md">
          <h4 className="text-xl font-semibold text-[#7B5C44] mb-4">Asignación de huéspedes</h4>
          <p className="text-[#8A6E52] mb-6">Asigne a los huéspedes a las habitaciones seleccionadas</p>

          {/* Botón para mostrar/ocultar la lista de habitaciones */}
          <div className="flex justify-center mb-6">
            <button
              onClick={toggleListaHabitaciones}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-[#E6DCC6] text-[#0F0F0F] hover:bg-[#D1B59B] transition-colors"
            >
              {mostrarListaHabitaciones ? (
                <>
                  <FaMapMarkedAlt className="mr-2" /> Ver mapa
                </>
              ) : (
                <>
                  <FaList className="mr-2" /> Ver lista de habitaciones
                </>
              )}
            </button>
          </div>

          {/* Lista de habitaciones seleccionadas (visible solo cuando se hace clic en "Ver lista") */}
          {mostrarListaHabitaciones && (
            <div className="mt-6 mb-8">
              <h5 className="text-lg font-semibold text-[#7B5C44] mb-4">Lista de habitaciones</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.habitacionesSeleccionadas.map((habitacion, index) => (
                  <div
                    key={`lista-habitacion-${habitacion.letra}-${index}`}
                    className="p-4 rounded-lg border-2 border-[#E6B89C] bg-[#F8E8E0]/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-[#E6B89C] text-gray-800">
                          <span className="font-bold">{habitacion.letra || habitacion.id.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{habitacion.nombre}</h4>
                          <p className="text-sm text-gray-600">
                            {habitacion.tipo || 'Estándar'} • {habitacion.planta || 'Planta principal'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Capacidad:</span>
                        <span className="font-medium">{habitacion.capacidad || 2} personas</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Precio:</span>
                        <span className="font-medium">{habitacion.precioPorNoche || habitacion.precio || '2400€/noche'}</span>
                      </div>
                      {habitacion.descripcion && (
                        <div className="mt-2 text-xs text-gray-500">
                          {habitacion.descripcion.substring(0, 100)}{habitacion.descripcion.length > 100 ? '...' : ''}
                        </div>
                      )}
                      <div className="mt-2 bg-[#E6B89C]/20 p-2 rounded text-xs">
                        <FaCheckCircle className="inline-block mr-1 text-[#E6B89C]" /> Habitación seleccionada
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-center mt-8">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedMode}
          className={`px-8 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
            selectedMode 
              ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white' 
              : 'bg-gray-200 cursor-not-allowed text-gray-500'
          }`}
        >
          <span className="font-medium">Continuar</span>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ModoGestionHabitaciones;