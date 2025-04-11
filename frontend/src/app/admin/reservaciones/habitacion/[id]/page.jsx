'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getHabitacionReservation, 
  updateHabitacionReservation, 
  deleteHabitacionReservation, 
  updateReservaHabitacionHuespedes // Importar servicio específico
} from '@/services/reservationService';
import { FaArrowLeft, FaSpinner, FaCalendarAlt, FaUserFriends, FaBed, FaMoneyBillWave, FaEnvelope, FaPhone, FaClock, FaRuler, FaSave, FaTimes, FaEdit, FaPlus, FaTrashAlt, FaUserPlus, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import React from 'react';

export default function HabitacionReservationDetail({ params }) {
  const router = useRouter();
  const id = React.use(params).id;
  const { user } = useAuth();
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ // Estado para datos editables
    fechaEntrada: '',
    fechaSalida: '',
    numHuespedes: 1, 
    nombres: [], // Ahora es un array
  });
  const [currentGuestName, setCurrentGuestName] = useState(''); // Estado para el input del nuevo huésped
  
  const cargarReserva = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await getHabitacionReservation(id);
      if (response && response.success && response.data) {
        setReservation(response.data);
      } else if (response && !response.error) {
        if (response.data) {
          setReservation(response.data);
        } else {
          setReservation(response);
        }
      } else {
        throw new Error(response?.message || 'Error al cargar los datos de la reserva');
      }
      const fetchedData = response.data;
      setReservation(fetchedData);
      if (fetchedData) {
        // Inicializar estado de edición con datos de la reserva
        setEditedData({
          fechaEntrada: fetchedData.fechaEntrada ? new Date(fetchedData.fechaEntrada).toISOString().split('T')[0] : '',
          fechaSalida: fetchedData.fechaSalida ? new Date(fetchedData.fechaSalida).toISOString().split('T')[0] : '',
          numHuespedes: fetchedData.infoHuespedes?.nombres?.length || fetchedData.numHuespedes || 1, 
          nombres: fetchedData.infoHuespedes?.nombres || [] // Inicializar como array
        });
        setCurrentGuestName(''); // Limpiar input al cargar
        console.log('[cargarReserva] Estado "reservation" y "editedData" establecidos.');
      }
    } catch (err) {
      console.error('Error fetching reservation:', err);
      setError('No se pudo cargar la información de la reserva. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarReserva();
  }, [cargarReserva]);
  
  const handleEditToggle = () => {
    if (!reservation) return;
    if (!isEditing) {
      // Al entrar en modo edición, copiar datos actuales
      setEditedData({
        fechaEntrada: reservation.fechaEntrada ? new Date(reservation.fechaEntrada).toISOString().split('T')[0] : '',
        fechaSalida: reservation.fechaSalida ? new Date(reservation.fechaSalida).toISOString().split('T')[0] : '',
        numHuespedes: reservation.infoHuespedes?.nombres?.length || reservation.numHuespedes || 1,
        nombres: reservation.infoHuespedes?.nombres || []
      });
      setCurrentGuestName(''); // Limpiar input al entrar en edición
    }
    setIsEditing(!isEditing); 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCurrentGuestNameChange = (e) => {
      setCurrentGuestName(e.target.value);
  };

  const handleAddGuest = () => {
      const nameToAdd = currentGuestName.trim();
      if (!nameToAdd) {
          toast.warning("Por favor, ingrese un nombre de huésped.");
          return;
      }
      setEditedData(prev => {
          const newNombres = [...prev.nombres, nameToAdd];
          return {
              ...prev,
              nombres: newNombres,
              numHuespedes: newNombres.length // Actualizar contador
          };
      });
      setCurrentGuestName(''); // Limpiar input
  };
  
  const handleRemoveGuest = (indexToRemove) => {
      setEditedData(prev => {
          const newNombres = prev.nombres.filter((_, index) => index !== indexToRemove);
          return {
              ...prev,
              nombres: newNombres,
              numHuespedes: newNombres.length // Actualizar contador
          };
      });
  };

  const handleSaveChanges = async () => {
    if (!editedData) {
        toast.error("No hay datos editados para guardar.");
        return;
    }
    setUpdating(true);
    let success = true;
    let errors = [];

    // --- 1. Actualizar Fechas (si cambiaron) --- 
    const fechasPayload = {};
    let fechasChanged = false;
    const originalFechaEntrada = reservation.fechaEntrada ? new Date(reservation.fechaEntrada).toISOString().split('T')[0] : '';
    const originalFechaSalida = reservation.fechaSalida ? new Date(reservation.fechaSalida).toISOString().split('T')[0] : '';

    if (editedData.fechaEntrada !== originalFechaEntrada) {
        fechasPayload.fechaEntrada = editedData.fechaEntrada;
        fechasChanged = true;
    }
    if (editedData.fechaSalida !== originalFechaSalida) {
        fechasPayload.fechaSalida = editedData.fechaSalida;
        fechasChanged = true;
    }

    if (fechasChanged) {
        if (new Date(editedData.fechaSalida) <= new Date(editedData.fechaEntrada)) {
            toast.error("La fecha de salida debe ser posterior a la fecha de entrada.");
            setUpdating(false);
            return;
        }
        try {
            console.log("Actualizando fechas:", fechasPayload);
            // Usamos updateHabitacionReservation para fechas
            const responseFechas = await updateHabitacionReservation(id, fechasPayload);
            if (!responseFechas || !responseFechas.success) {
                success = false;
                errors.push(responseFechas?.message || 'Error al actualizar fechas.');
            }
        } catch (err) {
            success = false;
            errors.push('Error de red al actualizar fechas.');
        }
    }

    // --- 2. Actualizar Nombres y Número de Huéspedes (si cambiaron) --- 
    const originalNombres = reservation.infoHuespedes?.nombres || [];
    // Comparar arrays (longitud y contenido)
    const nombresChanged = editedData.nombres.length !== originalNombres.length || 
                           editedData.nombres.some((name, i) => name !== originalNombres[i]);

    if (nombresChanged) {
        const nombresPayload = {
            numHuespedes: editedData.nombres.length || 1, // Usar longitud del array
            infoHuespedes: {
                nombres: editedData.nombres,
            }
        };
        try {
            console.log("Actualizando infoHuespedes:", nombresPayload);
            // Usamos el endpoint específico para huéspedes
            const responseNombres = await updateReservaHabitacionHuespedes(id, nombresPayload);
            if (!responseNombres || !responseNombres.success) {
                success = false;
                errors.push(responseNombres?.message || 'Error al actualizar nombres.');
            }
        } catch (err) {
            success = false;
            errors.push('Error de red al actualizar nombres.');
        }
    }

    // --- Finalizar --- 
    setUpdating(false);
    if (success) {
        toast.success('Reserva actualizada correctamente');
        await cargarReserva(); 
        setIsEditing(false);
    } else {
        toast.error('Error al guardar algunos cambios:', { description: errors.join('; ') });
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      // Convertir estado a minúsculas antes de enviar
      const statusToSend = newStatus.toLowerCase(); 
      console.log(`[handleStatusChange] Intentando actualizar estado a: ${statusToSend}`); // Log para verificar
      
      const response = await updateHabitacionReservation(id, { estadoReserva: statusToSend }); 
      if (response && response.success) {
        toast.success(`Estado de la reserva cambiado a: ${newStatus}`);
        await cargarReserva();
      } else {
        toast.error('Error al actualizar el estado: ' + (response?.message || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error updating reservation status:', err);
      toast.error('No se pudo actualizar el estado: ' + (err.message || 'Error desconocido'));
    } finally {
      setUpdating(false);
    }
  };
  
  const handleDeleteReservation = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setUpdating(true);
    try {
      const response = await deleteHabitacionReservation(id);
      if (response && response.success) {
        toast.success('Reserva eliminada exitosamente');
        router.push('/admin/reservaciones');
      } else {
        toast.error('Error al eliminar la reserva: ' + (response?.message || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error deleting reservation:', err);
      toast.error('No se pudo eliminar la reserva: ' + (err.message || 'Error desconocido'));
    } finally {
      setUpdating(false);
    }
  };
  
  // --- Lógica para Añadir Nueva Reserva (Redirige) ---
  const handleAddNewReservation = () => {
    // Idealmente, ir a una ruta específica como /admin/reservaciones/nueva/habitacion
    // O abrir un modal con un formulario.
    // Por ahora, redirigimos a la lista general como ejemplo.
    router.push('/admin/reservaciones'); 
    toast.info('Redirigiendo para crear nueva reserva...'); // Opcional
  };
  
  // Obtener el estado correcto (campo puede variar)
  const estadoActual = reservation?.estadoReserva || reservation?.estado || 'Pendiente';
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)] mx-auto mb-4" />
        <p className="text-gray-600">Cargando detalles de la reserva...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition"
        >
          Volver
        </button>
      </div>
    );
  }
  
  if (!reservation) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
        <p className="text-yellow-700">No se encontró la reserva solicitada.</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition"
        >
          Volver
        </button>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors"
          >
            <FaArrowLeft /> Volver
          </button>
          <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
            Detalles de la Reservación de Habitación
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {updating && <FaSpinner className="animate-spin text-[var(--color-primary)] text-xl" />}
          
          {/* Botones de Edición */} 
          {isEditing ? (
            <>
              {/* Guardar y Cancelar aparecen cuando isEditing es true */}
              <button 
                onClick={handleSaveChanges}
                disabled={updating}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                 <FaSave /> Guardar
              </button>
              <button 
                onClick={handleEditToggle} // Botón para cancelar/salir de edición
                disabled={updating}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <FaTimes /> Cancelar
              </button>
            </>
          ) : (
            <>
              {/* Editar aparece cuando isEditing es false */}
              <button 
                onClick={handleEditToggle} // Botón para entrar en modo edición
                disabled={updating}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <FaEdit /> Editar
              </button>
              
              {/* Botones de Acción (solo si no se está editando) */} 
              {!isEditing && (
                <>
                  {/* Usar estadoActual para las condiciones */}
                  {estadoActual !== 'confirmada' && (
                     <button 
                      onClick={() => handleStatusChange('confirmada')}
                      disabled={updating}
                      className="bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                    >
                      Confirmar
                    </button>
                  )}
                  {estadoActual !== 'cancelada' && (
                     <button 
                      onClick={() => handleStatusChange('cancelada')}
                      disabled={updating}
                      className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  )}
                   {estadoActual !== 'pendiente' && (
                     <button
                       onClick={() => handleStatusChange('pendiente')}
                       disabled={updating}
                       className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
                     >
                       Pendiente
                     </button>
                   )}
                  {/* ... (Botón Eliminar) ... */}
                  <button 
                    onClick={handleDeleteReservation}
                    disabled={updating}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                     Eliminar
                  </button>
                  {/* ... (Botón Nueva) ... */} 
                  <button 
                    onClick={handleAddNewReservation}
                    disabled={updating}
                    className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1.5 disabled:opacity-50"
                    title="Crear una nueva reserva de habitación"
                  >
                    <FaPlus /> Nueva
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Detalles de la reserva */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Reserva #{reservation._id ? reservation._id.substring(0, 8) : 'Sin ID'}
              </h2>
              <p className="text-gray-600 mt-1">Creada el {formatDate(reservation.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">Estado:</span>
              {/* Usar estadoActual y su lógica de colores para el badge */}
              <span
                className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                  estadoActual === 'confirmada' ? 'bg-green-100 text-green-800' :
                  estadoActual === 'cancelada' ? 'bg-red-100 text-red-800' :
                  estadoActual === 'pagada' ? 'bg-blue-100 text-blue-800' :
                  estadoActual === 'completada' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800' // Pendiente por defecto
                }`}
              >
                {/* Mostrar estadoActual capitalizado */}
                {estadoActual.charAt(0).toUpperCase() + estadoActual.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Cuerpo */} 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 p-4 md:p-6">
          {/* Columna 1: Habitación y Estancia */} 
          <div className="space-y-5 lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Habitación y Estancia</h3>
            {/* --- INICIO: Información del Tipo de Reserva --- */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md border border-blue-200">
              <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" /> 
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Contexto de la Reserva</p>
                <p className="font-medium text-gray-800">
                  {reservation.tipoReserva === 'evento' && reservation.reservaEvento ? (
                    <>Habitación asociada al evento: <span className="font-semibold">{reservation.reservaEvento.nombreEvento || 'Evento sin nombre'}</span> ({reservation.reservaEvento.tipoEvento?.titulo || reservation.reservaEvento.tipoEvento?.nombre || 'Tipo no especificado'})</>
                  ) : (
                    'Reserva de hotel individual'
                  )}
                </p>
              </div>
            </div>
            {/* --- FIN: Información del Tipo de Reserva --- */}
            <div className="flex items-start gap-3">
              <FaBed className="text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Habitación</p>
                <p className="font-medium text-gray-800">
                  {reservation.habitacion?.nombre || reservation.letraHabitacion || 'N/A'}
                  {reservation.tipoHabitacion ? ` (${typeof reservation.tipoHabitacion === 'object' ? reservation.tipoHabitacion.nombre : reservation.tipoHabitacion})` : ''}
                </p>
              </div>
            </div>
             {/* --- Nombres Huéspedes (Editable) --- */} 
            <div className="flex items-start gap-3">
              <FaUserFriends className="text-gray-400 mt-1 flex-shrink-0" />
              <div className="w-full">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Huéspedes ({editedData.nombres.length})</p> 
                {isEditing ? (
                  <div className="mt-1 space-y-2">
                    {/* Input para nuevo huésped */}
                    <div className="flex items-center gap-2">
                        <input 
                            type="text"
                            value={currentGuestName}
                            onChange={handleCurrentGuestNameChange}
                            className="flex-grow px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Nombre Apellido"
                        />
                        <button 
                            type="button"
                            onClick={handleAddGuest}
                            className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            title="Aceptar Huésped"
                        >
                            <FaUserPlus />
                        </button>
                    </div>
                    {/* Lista de huéspedes añadidos */}
                    {editedData.nombres.length > 0 && (
                        <ul className="list-disc list-inside pl-1 text-sm space-y-1 max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
                            {editedData.nombres.map((name, index) => (
                                <li key={index} className="flex justify-between items-center text-gray-700">
                                    <span>{name}</span>
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveGuest(index)}
                                        className="p-1 text-red-500 hover:text-red-700"
                                        title="Eliminar Huésped"
                                    >
                                        <FaTrashAlt size={12}/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {editedData.nombres.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No hay huéspedes añadidos.</p>
                    )}
                  </div>
                ) : (
                  <div className="font-medium text-gray-800 whitespace-pre-wrap">
                    {/* Mostrar nombres guardados (vista) */}
                    {reservation.infoHuespedes?.nombres?.length > 0 
                        ? reservation.infoHuespedes.nombres.map((name, i) => <div key={i}>{name}</div>)
                        : 'N/A'
                    }
                  </div>
                )}
              </div>
            </div>
            {/* --- Fechas (Editable) --- */} 
            <div className="flex items-start gap-3">
              <FaCalendarAlt className="text-gray-400 mt-1 flex-shrink-0" />
              <div className="w-full">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Fechas</p>
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row gap-2 mt-1">
                    <input 
                      type="date"
                      name="fechaEntrada"
                      value={editedData.fechaEntrada || ''}
                      onChange={handleInputChange} // Reutilizamos handleInputChange
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input 
                      type="date"
                      name="fechaSalida"
                      value={editedData.fechaSalida || ''}
                      onChange={handleInputChange} // Reutilizamos handleInputChange
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                ) : (
                  <p className="font-medium text-gray-800">
                    {formatDate(reservation.fechaEntrada)} - {formatDate(reservation.fechaSalida)}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Información Financiera</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <FaMoneyBillWave className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Precio</p>
                    <p className="font-medium">
                      ${reservation.precio ? reservation.precio.toLocaleString('es-MX') : 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 