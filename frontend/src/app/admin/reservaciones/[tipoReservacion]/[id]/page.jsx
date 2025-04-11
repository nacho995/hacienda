'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import apiClient from '@/services/apiClient';
import { 
  updateHabitacionReservation, 
  updateEventoReservation, 
  deleteHabitacionReservation,
  deleteEventoReservation,
  asignarEventoAdmin,
  asignarHabitacionAdmin
} from '@/services/reservationService';

export default function ReservationDetail({ params }) {
  const router = useRouter();
  const { id, tipoReservacion } = params;
  const { user } = useAuth();
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusUpdated, setStatusUpdated] = useState(false);
  
  useEffect(() => {
    const fetchReservation = async () => {
      if (!id || !tipoReservacion) return;
      
      setLoading(true);
      setError(null);
      try {
        // Determinar el endpoint basado en el tipo de reservación
        let endpoint;
        switch (tipoReservacion) {
          case 'habitacion':
            endpoint = `/reservas/habitaciones/${id}`;
            break;
          case 'evento':
            endpoint = `/reservas/eventos/${id}`;
            break;
          case 'masaje':
            endpoint = `/reservas/masajes/${id}`;
            break;
          default:
            throw new Error(`Tipo de reserva '${tipoReservacion}' no soportado`);
        }
        
        // Hacer la petición
        const response = await apiClient.get(endpoint);
        
        // Verificar la respuesta y establecer los datos
        if (response?.data?.success && response.data.data) {
          setReservation(response.data.data);
        } else if (response?.data) {
          setReservation(response.data);
        } else {
          throw new Error('Respuesta del servidor inesperada');
        }
      } catch (err) {
        console.error('Error fetching reservation:', err);
        setError(`No se pudo cargar la información de la reserva de ${tipoReservacion}. Por favor, intenta de nuevo más tarde.`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservation();
  }, [id, tipoReservacion]);
  
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setStatusUpdated(false);
    try {
      let response;
      
      switch (tipoReservacion) {
        case 'habitacion':
          response = await updateHabitacionReservation(id, { estado: newStatus });
          break;
        case 'evento':
          response = await updateEventoReservation(id, { estado: newStatus });
          break;
        case 'masaje':
          // response = await updateMasajeReservation(id, { estado: newStatus });
          break;
        default:
          throw new Error(`Tipo de reserva '${tipoReservacion}' no soportado para actualización`);
      }
      
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
      let response;
      
      switch (tipoReservacion) {
        case 'habitacion':
          response = await deleteHabitacionReservation(id);
          break;
        case 'evento':
          response = await deleteEventoReservation(id);
          break;
        case 'masaje':
          // response = await deleteMasajeReservation(id);
          break;
        default:
          throw new Error(`Tipo de reserva '${tipoReservacion}' no soportado para eliminación`);
      }
      
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
  
  const getTipoReservacionTitle = () => {
    switch (tipoReservacion) {
      case 'habitacion':
        return 'Habitación';
      case 'evento':
        return 'Evento';
      case 'masaje':
        return 'Masaje';
      default:
        return 'Reservación';
    }
  };
  
  // Función para renderizar detalles específicos según el tipo de reserva
  const renderTipoDetails = () => {
    switch (tipoReservacion) {
      case 'habitacion':
        return (
          <div className="space-y-3">
            <p><span className="font-medium">Tipo de Habitación:</span> {reservation.tipoHabitacion || 'No especificado'}</p>
            <p><span className="font-medium">Fecha de Entrada:</span> {formatDate(reservation.fechaEntrada)}</p>
            <p><span className="font-medium">Fecha de Salida:</span> {formatDate(reservation.fechaSalida)}</p>
            <p><span className="font-medium">Número de Huéspedes:</span> {reservation.numHuespedes || 'No especificado'}</p>
          </div>
        );
      case 'evento':
        return (
          <div className="space-y-3">
            <p><span className="font-medium">Nombre del Evento:</span> {reservation.nombreEvento || 'No especificado'}</p>
            <p><span className="font-medium">Tipo de Evento:</span> {
              typeof reservation.tipoEvento === 'object' 
                ? reservation.tipoEvento?.titulo || 'No especificado' 
                : reservation.tipoEvento || 'No especificado'
            }</p>
            <p><span className="font-medium">Fecha del Evento:</span> {formatDate(reservation.fecha)}</p>
            <p><span className="font-medium">Número de Invitados:</span> {reservation.numInvitados || 'No especificado'}</p>
          </div>
        );
      case 'masaje':
        return (
          <div className="space-y-3">
            <p><span className="font-medium">Tipo de Masaje:</span> {
              typeof reservation.tipoMasaje === 'object' 
                ? reservation.tipoMasaje?.titulo || 'No especificado' 
                : reservation.tipoMasaje || 'No especificado'
            }</p>
            <p><span className="font-medium">Fecha del Masaje:</span> {formatDate(reservation.fecha)}</p>
            <p><span className="font-medium">Duración:</span> {reservation.duracion || 'No especificado'} minutos</p>
          </div>
        );
      default:
        return (
          <div className="space-y-3">
            <p><span className="font-medium">Tipo de Reserva:</span> {tipoReservacion}</p>
            <p><span className="font-medium">ID de Reserva:</span> {id}</p>
            <p className="text-yellow-600">Esta reserva es de un tipo no estándar. Se muestran detalles limitados.</p>
          </div>
        );
    }
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
            Detalles de la Reserva de {getTipoReservacionTitle()}
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
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Información de la Reserva</h3>
              <div className="mt-4 space-y-3">
                {renderTipoDetails()}
              </div>
            </div>
            
            {reservation.precio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Información Financiera</h3>
                <div className="mt-4 space-y-3">
                  <p><span className="font-medium">Precio:</span> ${reservation.precio.toLocaleString('es-MX')}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Información del Cliente</h3>
              <div className="mt-4 space-y-3">
                <p><span className="font-medium">Nombre:</span> {reservation.nombreContacto || reservation.nombre || ''} {reservation.apellidosContacto || reservation.apellidos || ''}</p>
                <p><span className="font-medium">Email:</span> {reservation.emailContacto || reservation.email || 'No especificado'}</p>
                <p><span className="font-medium">Teléfono:</span> {reservation.telefonoContacto || reservation.telefono || 'No especificado'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Acciones</h3>
              <div className="mt-4 space-y-3">
                <Link 
                  href={`/admin/reservaciones?tipo=${tipoReservacion}`}
                  className="block w-full bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Ver todas las reservaciones de {getTipoReservacionTitle()}
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
    </div>
  );
} 