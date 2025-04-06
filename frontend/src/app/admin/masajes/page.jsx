"use client";

import { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaUser, FaEnvelope, FaPhone, FaMoneyBillWave, FaTrash, FaEdit, FaSearch } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getMasajeReservations, deleteMasajeReservation } from '@/services/reservationService';
import { getTiposMasaje } from '@/services/masajeService';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminMasajes() {
  const [masajes, setMasajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [tiposMasaje, setTiposMasaje] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Solicitando datos de masajes...');
        
        // Cargar tipos de masaje y reservas de masaje en paralelo
        const [tiposResponse, reservasResponse] = await Promise.all([
          getTiposMasaje(),
          getMasajeReservations()
        ]);
        
        console.log('Tipos de masaje cargados:', tiposResponse);
        // Guardar tipos de masaje
        setTiposMasaje(tiposResponse || []);
        
        if (reservasResponse && reservasResponse.data) {
          // Procesar reservas para asignar nombres reales de los masajes
          const masajesProcesados = reservasResponse.data.map(masaje => {
            // Si el masaje tiene un ID como tipoMasaje, buscar su nombre real
            if (masaje.tipoMasaje && typeof masaje.tipoMasaje === 'string' && 
                masaje.tipoMasaje.length === 24 && /^[0-9a-f]{24}$/i.test(masaje.tipoMasaje)) {
              // Buscar el tipo de masaje por ID
              const tipoMasajeObj = tiposResponse.find(tipo => tipo._id === masaje.tipoMasaje);
              if (tipoMasajeObj) {
                masaje.nombreTipoMasaje = tipoMasajeObj.titulo;
              }
            }
            return masaje;
          });
          
          setMasajes(masajesProcesados);
          console.log('Masajes procesados con nombres reales:', masajesProcesados);
        } else {
          console.error('Formato de respuesta inválido en masajes:', reservasResponse);
          setMasajes([]);
        }
      } catch (error) {
        console.error('Error al cargar masajes:', error);
        toast.error('Error al cargar las reservas de masajes');
        setMasajes([]);
      } finally {
        setLoading(false);
      }
    };

    // Verificar autenticación
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [isAuthenticated, isAdmin, router]);

  const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error al formatear fecha:', e);
      return 'Fecha inválida';
    }
  };

  const getTipoMasajeNombre = (masajeId) => {
    // Si no tenemos ID o tipos de masaje, devolver valor por defecto
    if (!masajeId || !tiposMasaje || tiposMasaje.length === 0) return 'Masaje';
    
    // Buscar el tipo de masaje por ID
    const tipoMasaje = tiposMasaje.find(tipo => tipo._id === masajeId);
    return tipoMasaje ? tipoMasaje.titulo : 'Masaje';
  };

  const getMasajeDisplayName = (masaje) => {
    // Si tenemos un nombre de tipo de masaje ya procesado, usarlo
    if (masaje.nombreTipoMasaje) {
      return masaje.nombreTipoMasaje;
    }
    
    // Si tenemos un nombreEvento, usamos ese
    if (masaje.nombreEvento) {
      return masaje.nombreEvento;
    }
    
    // Verificar si tipoMasaje es un valor válido
    if (masaje.tipoMasaje) {
      // Si es un objeto, intentar usar el título
      if (typeof masaje.tipoMasaje === 'object' && masaje.tipoMasaje.titulo) {
        return masaje.tipoMasaje.titulo;
      }
      
      // Si es una cadena, verificar si es un ID de MongoDB (24 caracteres hexadecimales)
      if (typeof masaje.tipoMasaje === 'string') {
        if (masaje.tipoMasaje.length === 24 && /^[0-9a-f]{24}$/i.test(masaje.tipoMasaje)) {
          // Buscar el nombre real del tipo de masaje
          return getTipoMasajeNombre(masaje.tipoMasaje);
        }
        return masaje.tipoMasaje;
      }
    }
    
    // Si tenemos el título del masaje
    if (masaje.titulo) {
      return masaje.titulo;
    }
    
    // Valor por defecto
    return 'Masaje';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservas de masajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
            Reservas de Masajes
          </h1>
          <p className="text-gray-600 mt-2">
            Gestión de reservas de servicios de masajes
          </p>
        </div>
        <button 
          onClick={() => {
            const fetchData = async () => {
              try {
                setLoading(true);
                setError(null);
                
                // Cargar tipos de masaje y reservas de masaje en paralelo
                const [tiposResponse, reservasResponse] = await Promise.all([
                  getTiposMasaje(),
                  getMasajeReservations()
                ]);
                
                // Guardar tipos de masaje
                setTiposMasaje(tiposResponse || []);
                
                if (reservasResponse && reservasResponse.data) {
                  // Procesar reservas para asignar nombres reales de los masajes
                  const masajesProcesados = reservasResponse.data.map(masaje => {
                    // Si el masaje tiene un ID como tipoMasaje, buscar su nombre real
                    if (masaje.tipoMasaje && typeof masaje.tipoMasaje === 'string' && 
                        masaje.tipoMasaje.length === 24 && /^[0-9a-f]{24}$/i.test(masaje.tipoMasaje)) {
                      // Buscar el tipo de masaje por ID
                      const tipoMasajeObj = tiposResponse.find(tipo => tipo._id === masaje.tipoMasaje);
                      if (tipoMasajeObj) {
                        masaje.nombreTipoMasaje = tipoMasajeObj.titulo;
                      }
                    }
                    return masaje;
                  });
                  
                  setMasajes(masajesProcesados);
                } else {
                  console.error('Formato de respuesta inválido en masajes:', reservasResponse);
                  setMasajes([]);
                }
              } catch (error) {
                console.error('Error al cargar masajes:', error);
                toast.error('Error al cargar las reservas de masajes');
                setMasajes([]);
              } finally {
                setLoading(false);
              }
            };
            
            fetchData();
            toast.success('Actualizando datos...');
          }}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {masajes.length === 0 && !error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700">No hay reservas de masajes registradas. Si crees que esto es un error, haz clic en "Actualizar".</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {masajes.map((masaje, index) => (
          <div
            key={masaje._id || index}
            className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-accent)]">
                    {getMasajeDisplayName(masaje)}
                  </h3>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  masaje.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                  masaje.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {masaje.estado || 'Estado desconocido'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaCalendar className="text-[var(--color-primary)]" />
                  <span>Fecha: {formatFecha(masaje.fecha)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaClock className="text-[var(--color-primary)]" />
                  <span>Hora: {masaje.horaInicio || 'No especificada'} - {masaje.horaFin || 'No especificada'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaUser className="text-[var(--color-primary)]" />
                  <span>{masaje.nombreContacto || 'Sin nombre'} {masaje.apellidosContacto || ''}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaEnvelope className="text-[var(--color-primary)]" />
                  <span>{masaje.emailContacto || 'Sin email'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaPhone className="text-[var(--color-primary)]" />
                  <span>{masaje.telefonoContacto || 'Sin teléfono'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaMoneyBillWave className="text-[var(--color-primary)]" />
                  <span className="font-semibold text-gray-800">
                    Precio: ${masaje.precio || 0}
                  </span>
                </div>
                <div>
                  {masaje.asignadoA ? (
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      Asignado a: {masaje.asignadoA.nombre || 'Usuario'}
                    </span>
                  ) : (
                    <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      Sin asignar
                    </span>
                  )}
                </div>
              </div>

              {/* Información del evento asociado */}
              {masaje.eventoAsociado && (
                <div className="mt-4 p-4 bg-[var(--color-accent-light)] rounded-lg">
                  <h4 className="text-lg font-semibold text-[var(--color-accent)] mb-2">
                    Evento Asociado
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Tipo de Evento:</span> {masaje.eventoAsociado.tipo || 'No especificado'}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Nombre del Evento:</span> {masaje.eventoAsociado.nombre || 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Fecha del Evento:</span> {formatFecha(masaje.eventoAsociado.fecha)}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Número de Invitados:</span> {masaje.eventoAsociado.numeroInvitados || 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {masaje.peticionesEspeciales && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Peticiones especiales:</span> {masaje.peticionesEspeciales}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}