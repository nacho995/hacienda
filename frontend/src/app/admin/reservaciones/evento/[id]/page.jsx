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
            if (responseHabitaciones && responseHabitaciones.success && Array.isArray(responseHabitaciones.data)) {
              setHabitacionesEvento(responseHabitaciones.data);
              const initialEdits = {};
              responseHabitaciones.data.forEach(hab => {
                initialEdits[hab._id] = {
                  numHuespedes: hab.numHuespedes || 1,
                  nombres: (hab.infoHuespedes?.nombres || []).join('\n'),
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
  
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setStatusUpdated(false);
    try {
      const response = await updateEventoReservation(id, { estado: newStatus });
      if (response && response.success) {
        toast.success(`Estado de la reserva cambiado a: ${newStatus}`);
        if (response.data) {
          setReservation(response.data);
        } else {
          setReservation(prev => ({...prev, estado: newStatus}));
        }
        setStatusUpdated(true);
        
        setTimeout(() => {
          setStatusUpdated(false);
        }, 3000);
      } else {
        toast.error('Error al actualizar el estado de la reserva: ' + (response?.message || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error updating reservation status:', err);
      toast.error('No se pudo actualizar el estado de la reserva: ' + (err.message || 'Error desconocido'));
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
      const response = await deleteEventoReservation(id);
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
  
  const handleHuespedChange = (habitacionId, field, value) => {
    setHuespedesEditados(prev => ({
      ...prev,
      [habitacionId]: {
        ...prev[habitacionId],
        [field]: value
      }
    }));
  };
  
  const handleGuardarHuespedes = async (habitacionId) => {
    const datosEditados = huespedesEditados[habitacionId];
    if (!datosEditados) return;

    const nombresArray = datosEditados.nombres.split('\n').map(n => n.trim()).filter(n => n); 
    
    const updateData = {
      numHuespedes: parseInt(datosEditados.numHuespedes, 10) || 1,
      infoHuespedes: {
        nombres: nombresArray,
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors"
          >
            <FaArrowLeft /> Volver
          </button>
          <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
            Detalles de la Reservación de Evento
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {updating ? (
            <FaSpinner className="animate-spin text-[var(--color-primary)]" />
          ) : (
            <>
              {reservation.estado !== 'Confirmada' && (
                <button 
                  onClick={() => handleStatusChange('Confirmada')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Confirmar
                </button>
              )}
              {reservation.estado !== 'Cancelada' && (
                <button 
                  onClick={() => handleStatusChange('Cancelada')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                >
                  Cancelar
                </button>
              )}
              <button 
                onClick={handleDeleteReservation}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Notificación de actualización */}
      {statusUpdated && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">Estado de la reserva actualizado correctamente.</p>
        </div>
      )}
      
      {/* Detalles de la reserva */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
              <span
                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  reservation.estado === 'Confirmada'
                    ? 'bg-green-100 text-green-800'
                    : reservation.estado === 'Pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {reservation.estado || 'Pendiente'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Información del Evento</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <FaGlassCheers className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre del Evento</p>
                    <p className="font-medium">{reservation.nombreEvento || 'No especificado'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaGlassCheers className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Evento</p>
                    <p className="font-medium">
                      {typeof reservation.tipoEvento === 'object' 
                        ? reservation.tipoEvento?.titulo || 'No especificado'
                        : reservation.tipoEvento || 'No especificado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">{formatDate(reservation.fecha)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaClock className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Horario</p>
                    <p className="font-medium">
                      {reservation.horaInicio} - {reservation.horaFin}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaUserFriends className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Número de Invitados</p>
                    <p className="font-medium">{reservation.numeroInvitados}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaUserFriends className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Espacio Seleccionado</p>
                    <p className="font-medium">{reservation.espacioSeleccionado || 'No especificado'}</p>
                  </div>
                </div>
                {reservation.peticionesEspeciales && (
                  <div className="flex items-start gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Peticiones Especiales</p>
                      <p className="font-medium">{reservation.peticionesEspeciales}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Información Financiera</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <FaMoneyBillWave className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Presupuesto Estimado</p>
                    <p className="font-medium">
                      ${reservation.presupuestoEstimado ? reservation.presupuestoEstimado.toLocaleString('es-MX') : 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Información del Cliente</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <FaUserFriends className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{reservation.nombreContacto} {reservation.apellidosContacto}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaEnvelope className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{reservation.emailContacto}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaPhone className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{reservation.telefonoContacto}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Acciones</h3>
              <div className="mt-4 space-y-3">
                <Link 
                  href={`/admin/reservaciones`}
                  className="block w-full bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Ver todas las reservaciones
                </Link>
                
                <Link 
                  href="/admin/dashboard"
                  className="block w-full bg-[var(--color-primary)] text-white text-center py-2 px-4 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Ir al Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección para Habitaciones del Evento */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaBed /> Habitaciones Asociadas al Evento
          </h3>
        </div>
        <div className="p-6">
          {loadingHabitaciones ? (
            <div className="text-center py-6">
              <FaSpinner className="animate-spin text-2xl text-[var(--color-primary)] mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Cargando habitaciones...</p>
            </div>
          ) : errorHabitaciones ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700">
              {errorHabitaciones}
            </div>
          ) : habitacionesEvento.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay habitaciones asociadas a este evento.</p>
          ) : (
            <div className="space-y-6">
              {habitacionesEvento.map((hab) => (
                <div key={hab._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Habitación: {hab.letraHabitacion || hab.tipoHabitacion || hab._id.substring(0, 6)}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Número de Huéspedes */}
                    <div>
                      <label htmlFor={`numHuespedes_${hab._id}`} className="block text-sm font-medium text-gray-600 mb-1">Nº Huéspedes</label>
                      <input 
                        type="number"
                        id={`numHuespedes_${hab._id}`}
                        min="1"
                        value={huespedesEditados[hab._id]?.numHuespedes || ''}
                        onChange={(e) => handleHuespedChange(hab._id, 'numHuespedes', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    
                    {/* Nombres Huéspedes */}
                    <div className="md:col-span-2">
                      <label htmlFor={`nombresHuespedes_${hab._id}`} className="block text-sm font-medium text-gray-600 mb-1">Nombres Huéspedes (uno por línea)</label>
                      <textarea 
                        id={`nombresHuespedes_${hab._id}`}
                        rows="3"
                        value={huespedesEditados[hab._id]?.nombres || ''}
                        onChange={(e) => handleHuespedChange(hab._id, 'nombres', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder="Ej:
Juan Pérez
Maria García"
                      />
                    </div>

                    {/* (Opcional) Detalles Huéspedes */}
                    {/* 
                    <div className="md:col-span-3">
                      <label htmlFor={`detallesHuespedes_${hab._id}`} className="block text-sm font-medium text-gray-600 mb-1">Detalles Adicionales</label>
                      <textarea 
                        id={`detallesHuespedes_${hab._id}`}
                        rows="2"
                        value={huespedesEditados[hab._id]?.detalles || ''}
                        onChange={(e) => handleHuespedChange(hab._id, 'detalles', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    */}
                  </div>
                  
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => handleGuardarHuespedes(hab._id)}
                      disabled={updating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {updating ? <FaSpinner className="animate-spin mr-2"/> : <FaSave className="mr-2"/>} Guardar Huéspedes Hab. {hab.letraHabitacion || ''}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 