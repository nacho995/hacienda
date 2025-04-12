'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getEventoReservation, 
  updateEventoReservation, 
  deleteEventoReservation, 
  getEventoHabitaciones,
  updateReservaHabitacionHuespedes
} from '@/services/reservationService';
import { FaArrowLeft, FaSpinner, FaCalendarAlt, FaUserFriends, FaGlassCheers, FaMoneyBillWave, FaEnvelope, FaPhone, FaClock, FaUtensils, FaBed, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import React from 'react';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function EventoReservationDetail({ params }) {
  const router = useRouter();
  const id = React.use(params).id;
  const { user } = useAuth();
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusUpdated, setStatusUpdated] = useState(false);
  const [habitacionesEvento, setHabitacionesEvento] = useState([]);
  const [loadingHabitaciones, setLoadingHabitaciones] = useState(false);
  const [errorHabitaciones, setErrorHabitaciones] = useState(null);
  const [huespedesEditados, setHuespedesEditados] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ 
    title: '', 
    message: '', 
    onConfirm: () => {}, 
    iconType: 'warning',
    confirmText: 'Confirmar'
  });
  
  useEffect(() => {
    const fetchReservationAndHabitaciones = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      setLoadingHabitaciones(true);
      setErrorHabitaciones(null);
      
      try {
        const responseEvento = await getEventoReservation(id);
        if (responseEvento && responseEvento.success && responseEvento.data) {
          setReservation(responseEvento.data);
          
          try {
            const responseHabitaciones = await getEventoHabitaciones(id);
            if (responseHabitaciones && responseHabitaciones.success && Array.isArray(responseHabitaciones.data?.habitaciones)) {
              setHabitacionesEvento(responseHabitaciones.data.habitaciones);
              const initialEdits = {};
              responseHabitaciones.data.habitaciones.forEach(hab => {
                initialEdits[hab._id] = {
                  nombres: hab.infoHuespedes?.nombres || [],
                  currentGuestName: '',
                  detalles: hab.infoHuespedes?.detalles || ''
                };
              });
              setHuespedesEditados(initialEdits);
            } else {
              setErrorHabitaciones('No se pudieron cargar las habitaciones del evento.');
            }
          } catch (errHab) {
            console.error('Error fetching habitaciones del evento:', errHab);
            setErrorHabitaciones('Error al cargar las habitaciones del evento.');
          }
        } else {
          throw new Error(responseEvento?.message || 'Error al cargar los datos de la reserva');
        }
      } catch (err) {
        console.error('Error fetching reservation:', err);
        setError('No se pudo cargar la información de la reserva.');
      } finally {
        setLoading(false);
        setLoadingHabitaciones(false);
      }
    };
    
    fetchReservationAndHabitaciones();
  }, [id]);
  
  const executeStatusUpdate = async (statusToSend) => {
    setUpdating(true);
    setStatusUpdated(false);
    try {
      const response = await updateEventoReservation(id, { estadoReserva: statusToSend });
      if (response && response.success) {
        const displayStatus = statusToSend.charAt(0).toUpperCase() + statusToSend.slice(1);
        toast.success(`Estado de la reserva cambiado a: ${displayStatus}`);
        if (response.data) {
          setReservation(response.data);
        } else {
          setReservation(prev => ({...prev, estadoReserva: statusToSend}));
        }
        setStatusUpdated(true);
        setTimeout(() => setStatusUpdated(false), 3000);
      } else {
        toast.error('Error al actualizar el estado: ' + (response?.message || 'Error desconocido'));
      }
    } catch (err) {
      toast.error('No se pudo actualizar el estado: ' + (err.message || 'Error desconocido'));
    } finally {
      setUpdating(false);
    }
  };
  
  const handleStatusChange = async (newStatus) => {
    const statusToSend = String(newStatus).toLowerCase();

    if (statusToSend === 'cancelada') {
      setModalConfig({
        title: 'Cancelar Reserva',
        message: '¿Estás seguro de que deseas cancelar esta reserva? Esta acción podría notificar al cliente.',
        onConfirm: () => executeStatusUpdate(statusToSend),
        iconType: 'danger',
        confirmText: 'Sí, Cancelar'
      });
      setIsModalOpen(true);
    } else {
      executeStatusUpdate(statusToSend);
    }
  };
  
  const handleDeleteReservation = async () => {
    setModalConfig({
      title: 'Eliminar Reserva',
      message: '¿Estás seguro de que deseas eliminar permanentemente esta reserva? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        setUpdating(true);
        try {
          const response = await deleteEventoReservation(id);
          if (response && response.success) {
            toast.success('Reserva eliminada exitosamente');
            router.push('/admin/reservaciones');
          } else {
            toast.error('Error al eliminar la reserva: ' + (response?.message || 'Error desconocido'));
          }
        } catch (err) {
          toast.error('No se pudo eliminar la reserva: ' + (err.message || 'Error desconocido'));
        } finally {
          setUpdating(false);
        }
      },
      iconType: 'delete',
      confirmText: 'Sí, Eliminar'
    });
    setIsModalOpen(true);
  };
  
  const handleHuespedChange = (habitacionId, field, value) => {
    setHuespedesEditados(prev => ({
      ...prev,
      [habitacionId]: {
        ...prev[habitacionId],
        [field]: value
      }
    }));
  };
  
  const handleAddGuest = (habitacionId) => {
    const nameToAdd = huespedesEditados[habitacionId]?.currentGuestName?.trim();
    if (!nameToAdd) {
        toast.warning("Por favor, ingrese un nombre de huésped.");
        return;
    }
    setHuespedesEditados(prev => {
        const currentHabData = prev[habitacionId] || { nombres: [], currentGuestName: '', detalles: '' };
        const newNombres = [...currentHabData.nombres, nameToAdd];
        return {
            ...prev,
            [habitacionId]: {
                ...currentHabData,
                nombres: newNombres,
                currentGuestName: ''
            }
        };
    });
  };
  
  const handleRemoveGuest = (habitacionId, indexToRemove) => {
    setHuespedesEditados(prev => {
        const currentHabData = prev[habitacionId] || { nombres: [], currentGuestName: '', detalles: '' };
        const newNombres = currentHabData.nombres.filter((_, index) => index !== indexToRemove);
        return {
            ...prev,
            [habitacionId]: {
                ...currentHabData,
                nombres: newNombres,
            }
        };
    });
  };
  
  const handleGuardarHuespedes = async (habitacionId) => {
    const datosEditados = huespedesEditados[habitacionId];
    if (!datosEditados) return;
    
    const updateData = {
      numHuespedes: datosEditados.nombres.length || 1,
      infoHuespedes: {
        nombres: datosEditados.nombres || [],
        detalles: datosEditados.detalles || ''
      }
    };
    
    setUpdating(true);
    try {
      const response = await updateReservaHabitacionHuespedes(habitacionId, updateData);
      if (response && response.success) {
        toast.success('Información de huéspedes actualizada');
      } else {
        toast.error(response?.message || 'Error al actualizar huéspedes');
      }
    } catch (err) {
      toast.error('Error al guardar cambios: ' + (err.message || 'Error desconocido'));
    } finally {
      setUpdating(false);
    }
  };
  
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
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('es-ES', options);
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link href="/admin/reservaciones" className="inline-flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors">
          <FaArrowLeft className="mr-2" />
          Volver a Reservaciones
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Detalle de Reserva de Evento</h1>
          <p className="text-sm opacity-90">Número de Confirmación: <span className="font-mono bg-white bg-opacity-20 px-2 py-1 rounded">{reservation.numeroConfirmacion}</span></p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Información del Evento</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Evento</p>
                <p className="text-lg font-medium text-gray-900 flex items-center"><FaGlassCheers className="mr-2 text-[var(--color-accent)]" /> {reservation.tipoEvento?.titulo || reservation.nombreEvento || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="text-lg font-medium text-gray-900 flex items-center"><FaCalendarAlt className="mr-2 text-[var(--color-accent)]" /> {formatDate(reservation.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Horario</p>
                <p className="text-lg font-medium text-gray-900 flex items-center"><FaClock className="mr-2 text-[var(--color-accent)]" /> {reservation.horaInicio || 'N/A'} - {reservation.horaFin || 'N/A'}</p>
              </div>
               <div>
                <p className="text-sm text-gray-500">Nº Invitados</p>
                <p className="text-lg font-medium text-gray-900 flex items-center"><FaUserFriends className="mr-2 text-[var(--color-accent)]" /> {reservation.numeroInvitados || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Espacio</p>
                <p className="text-lg font-medium text-gray-900 flex items-center"><FaUtensils className="mr-2 text-[var(--color-accent)]" /> {reservation.espacioSeleccionado || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Precio Estimado</p>
                <p className="text-lg font-medium text-gray-900 flex items-center"><FaMoneyBillWave className="mr-2 text-[var(--color-accent)]" /> {reservation.precio ? `${reservation.precio.toFixed(2)} €` : 'N/A'}</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4 pt-6">Información de Contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                <p className="text-sm text-gray-500">Nombre Contacto</p>
                <p className="text-lg font-medium text-gray-900">{reservation.nombreContacto || 'N/A'} {reservation.apellidosContacto || ''}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium text-gray-900 flex items-center"><FaEnvelope className="mr-2 text-[var(--color-accent)]" /> {reservation.emailContacto || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="text-lg font-medium text-gray-900 flex items-center"><FaPhone className="mr-2 text-[var(--color-accent)]" /> {reservation.telefonoContacto || 'N/A'}</p>
              </div>
            </div>

             {reservation.peticionesEspeciales && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Peticiones Especiales</p>
                <p className="text-gray-700 bg-gray-100 p-3 rounded-md border border-gray-200">{reservation.peticionesEspeciales}</p>
              </div>
            )}

          </div>

          <div className="md:col-span-1 space-y-6 bg-gray-100 p-4 rounded-lg border border-gray-200">
             <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Estado y Acciones</h2>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Estado Actual</p>
              <span className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusStyles(reservation.estadoReserva)}`}>
                {reservation.estadoReserva ? reservation.estadoReserva.charAt(0).toUpperCase() + reservation.estadoReserva.slice(1) : 'Pendiente'}
              </span>
               {statusUpdated && <span className="ml-2 text-green-600 text-xs">(Actualizado!)</span>}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Cambiar Estado</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleStatusChange('confirmada')}
                  disabled={updating || reservation.estadoReserva === 'confirmada'}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? <FaSpinner className="animate-spin mx-auto" /> : 'Confirmar'}
                </button>
                <button
                  onClick={() => handleStatusChange('pendiente')}
                  disabled={updating || reservation.estadoReserva === 'pendiente'}
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? <FaSpinner className="animate-spin mx-auto" /> : 'Pendiente'}
                </button>
                <button
                  onClick={() => handleStatusChange('cancelada')}
                  disabled={updating || reservation.estadoReserva === 'cancelada'}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? <FaSpinner className="animate-spin mx-auto" /> : 'Cancelar'}
                </button>
              </div>
            </div>

             <div>
              <p className="text-sm text-gray-500 mb-2">Eliminar Reserva</p>
              <button
                onClick={handleDeleteReservation}
                disabled={updating}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center"
              >
                {updating ? <FaSpinner className="animate-spin mr-2" /> : <FaTrash className="mr-2" />} 
                Eliminar Permanentemente
              </button>
            </div>

          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
             <FaBed className="mr-2 text-[var(--color-accent)]" /> Habitaciones Asociadas ({habitacionesEvento.length})
          </h2>
          {loadingHabitaciones ? (
            <div className="text-center py-6">
              <FaSpinner className="animate-spin text-2xl text-[var(--color-primary)] mx-auto mb-2" />
              <p className="text-gray-500">Cargando habitaciones...</p>
            </div>
          ) : errorHabitaciones ? (
             <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
                <p className="text-red-700 text-sm">{errorHabitaciones}</p>
              </div>
          ) : habitacionesEvento.length > 0 ? (
            <div className="space-y-4">
              {habitacionesEvento.map((hab) => (
                <div key={hab._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">Habitación {hab.letraHabitacion || hab.habitacion}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyles(hab.estadoReserva)}`}>
                      {hab.estadoReserva ? hab.estadoReserva.charAt(0).toUpperCase() + hab.estadoReserva.slice(1) : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Tipo: {hab.tipoHabitacion} ({hab.categoriaHabitacion})</p>
                  <p className="text-sm text-gray-600 mb-3">Precio: {hab.precio ? `${hab.precio.toFixed(2)} €` : 'N/A'}</p>
                  
                  <div className="mt-3 border-t pt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Huéspedes ({huespedesEditados[hab._id]?.nombres?.length || 0})</label>
                      <ul className="list-disc list-inside mb-2 text-sm text-gray-600">
                        {huespedesEditados[hab._id]?.nombres?.map((nombre, index) => (
                          <li key={index} className="flex justify-between items-center mb-1">
                            <span>{nombre}</span>
                            <button onClick={() => handleRemoveGuest(hab._id, index)} className="text-red-500 hover:text-red-700 text-xs"><FaTrash /></button>
                          </li>
                        ))}
                         {huespedesEditados[hab._id]?.nombres?.length === 0 && <li className="text-gray-400 italic">No hay huéspedes registrados</li>}
                      </ul>
                      <div className="flex gap-2 mb-2">
                          <input 
                              type="text"
                              placeholder="Añadir nombre de huésped..."
                              value={huespedesEditados[hab._id]?.currentGuestName || ''}
                              onChange={(e) => handleHuespedChange(hab._id, 'currentGuestName', e.target.value)}
                              className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                          />
                          <button 
                              onClick={() => handleAddGuest(hab._id)}
                              className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition text-sm flex items-center"
                          >
                             <FaPlus className="mr-1"/> Añadir
                          </button>
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Detalles Adicionales (Opcional)</label>
                          <textarea
                              value={huespedesEditados[hab._id]?.detalles || ''}
                              onChange={(e) => handleHuespedChange(hab._id, 'detalles', e.target.value)}
                              rows="2"
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                              placeholder="Ej: Alergias, preferencias..."
                          />
                       </div>
                      <button 
                          onClick={() => handleGuardarHuespedes(hab._id)}
                          disabled={updating}
                          className="mt-3 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition text-sm w-full flex items-center justify-center disabled:opacity-50"
                      >
                         {updating ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />} Guardar Huéspedes
                      </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-4">No hay habitaciones directamente asociadas a este evento o la gestión es por parte del cliente.</p>
          )}
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        {...modalConfig}
      />

    </div>
  );
}

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmada':
      return 'bg-green-100 text-green-800';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelada':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 