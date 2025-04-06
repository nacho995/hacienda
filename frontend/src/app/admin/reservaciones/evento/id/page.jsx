'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getEventoReservation, updateEventoReservation } from '@/services/reservationService';
import { FaArrowLeft, FaSpinner, FaCalendarAlt, FaUserFriends, FaGlassCheers, FaMoneyBillWave, FaEnvelope, FaPhone, FaClock, FaUtensils, FaSpa, FaBed, FaUser, FaWarehouse, FaComment } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function EventoReservationDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { user } = useAuth();
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusUpdated, setStatusUpdated] = useState(false);
  
  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await getEventoReservation(id);
        setReservation(data);
      } catch (err) {
        console.error('Error fetching reservation:', err);
        setError('No se pudo cargar la información de la reserva. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservation();
  }, [id]);
  
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setStatusUpdated(false);
    try {
      const updatedReservation = await updateEventoReservation(id, { estado: newStatus });
      setReservation(updatedReservation);
      setStatusUpdated(true);
      
      // Reset status message after 3 seconds
      setTimeout(() => {
        setStatusUpdated(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError('No se pudo actualizar el estado de la reserva. Por favor, intenta de nuevo más tarde.');
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
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const fecha = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida';
      }
      
      return fecha.toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return 'Hora no especificada';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error al formatear hora:', error);
      return timeString;
    }
  };
  
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    if (isNaN(parseFloat(amount))) return '$0.00';
    
    return `$${parseFloat(amount).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  const formatText = (text, defaultText = 'No disponible') => {
    if (!text || text.trim() === '') return defaultText;
    return text;
  };
  
  const getTipoEventoNombre = () => {
    const tipoEvento = reservation.tipoEvento;
    
    if (!tipoEvento) return 'Tipo de evento no especificado';
    
    // Si tipoEvento es un objeto (populado), usar su título
    if (typeof tipoEvento === 'object' && tipoEvento !== null) {
      return tipoEvento.titulo || 'Evento sin título';
    }
    
    // Si es un string, podría ser un ID o un nombre
    return tipoEvento;
  };
  
  const formatearServiciosAdicionales = () => {
    const servicios = reservation.serviciosAdicionales;
    
    if (!servicios) return [];
    
    const listaServicios = [];
    
    // Verificar masajes
    if (servicios.masajes && servicios.masajes.length > 0) {
      listaServicios.push({
        nombre: 'Masajes',
        cantidad: servicios.masajes.length,
        detalle: `${servicios.masajes.length} masaje(s) reservado(s)`
      });
    }
    
    // Verificar habitaciones
    if (servicios.habitaciones && servicios.habitaciones.length > 0) {
      listaServicios.push({
        nombre: 'Habitaciones',
        cantidad: servicios.habitaciones.length,
        detalle: `${servicios.habitaciones.length} habitación(es) reservada(s)`
      });
    }
    
    return listaServicios;
  };
  
  return (
    <div className="space-y-8">
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
                Reserva #{reservation._id.substring(0, 8)}
              </h2>
              <p className="text-gray-600 mt-1">Creada el {formatDate(reservation.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">Estado:</span>
              <span
                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  reservation.estado.toLowerCase() === 'confirmada'
                    ? 'bg-green-100 text-green-800'
                    : reservation.estado.toLowerCase() === 'pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {reservation.estado}
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
                    <p className="text-sm text-gray-500">Tipo de Evento</p>
                    <p className="font-medium">{reservation.tipoEvento}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre del Evento</p>
                    <p className="font-medium">{formatText(reservation.nombreEvento)}</p>
                    <p className="text-xs text-gray-500">{getTipoEventoNombre()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha del Evento</p>
                    <p className="font-medium">{formatDate(reservation.fecha)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaClock className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Horario</p>
                    <p className="font-medium">
                      {formatTime(reservation.horaInicio)} a {formatTime(reservation.horaFin)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaUserFriends className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Número de Invitados</p>
                    <p className="font-medium">{reservation.numInvitados || reservation.numeroInvitados || 'No especificado'}</p>
                  </div>
                </div>
                {reservation.tematica && (
                  <div className="flex items-start gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Temática</p>
                      <p className="font-medium">{reservation.tematica}</p>
                    </div>
                  </div>
                )}
                {reservation.serviciosAdicionales && reservation.serviciosAdicionales.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Servicios Adicionales</p>
                    <ul className="list-disc list-inside">
                      {reservation.serviciosAdicionales.map((servicio, idx) => (
                        <li key={idx} className="font-medium">{servicio}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {reservation.menuSeleccionado && (
                  <div className="flex items-start gap-3">
                    <FaUtensils className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Menú Seleccionado</p>
                      <p className="font-medium">{reservation.menuSeleccionado}</p>
                    </div>
                  </div>
                )}
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
                    <p className="font-medium">{reservation.nombre} {reservation.apellido}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaEnvelope className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{reservation.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaPhone className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{reservation.telefono}</p>
                  </div>
                </div>
                {reservation.solicitudesEspeciales && (
                  <div>
                    <p className="text-sm text-gray-500">Solicitudes Especiales</p>
                    <p className="font-medium">{reservation.solicitudesEspeciales || 'Ninguna'}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Resumen de Presupuesto</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Presupuesto Estimado:</span>
                  <span>${reservation.presupuestoEstimado.toLocaleString('es-MX')}</span>
                </div>
                {reservation.anticipo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Anticipo:</span>
                    <span>${reservation.anticipo.toLocaleString('es-MX')}</span>
                  </div>
                )}
                {reservation.descuento > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descuento:</span>
                    <span>-${reservation.descuento.toLocaleString('es-MX')}</span>
                  </div>
                )}
                {reservation.anticipo && (
                  <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2">
                    <span>Saldo Pendiente:</span>
                    <span>${(reservation.presupuestoEstimado - (reservation.anticipo || 0)).toLocaleString('es-MX')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cambiar Estado</h3>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => handleStatusChange('confirmada')}
              disabled={updating || reservation.estado.toLowerCase() === 'confirmada'}
              className={`px-4 py-2 rounded-lg transition ${
                reservation.estado.toLowerCase() === 'confirmada'
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {updating && reservation.estado.toLowerCase() !== 'confirmada' ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : null}
              Confirmar
            </button>
            <button
              onClick={() => handleStatusChange('pendiente')}
              disabled={updating || reservation.estado.toLowerCase() === 'pendiente'}
              className={`px-4 py-2 rounded-lg transition ${
                reservation.estado.toLowerCase() === 'pendiente'
                  ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              {updating && reservation.estado.toLowerCase() !== 'pendiente' ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : null}
              Poner en Pendiente
            </button>
            <button
              onClick={() => handleStatusChange('cancelada')}
              disabled={updating || reservation.estado.toLowerCase() === 'cancelada'}
              className={`px-4 py-2 rounded-lg transition ${
                reservation.estado.toLowerCase() === 'cancelada'
                  ? 'bg-red-100 text-red-800 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {updating && reservation.estado.toLowerCase() !== 'cancelada' ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : null}
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 