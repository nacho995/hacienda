// ARCHIVO MODIFICADO PARA PROBAR CAMBIOS EN EL FRONTEND - REVISAR PROBLEMA DE ACTUALIZACIONES
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { FaSearch, FaFilter, FaEllipsisV, FaUserCircle, FaSpinner, FaSyncAlt, FaEye, FaCalendarAlt } from 'react-icons/fa';
import { 
  getHabitacionReservations, 
  getEventoReservations,
  updateHabitacionReservation,
  updateEventoReservation,
  deleteHabitacionReservation,
  deleteEventoReservation,
  unassignHabitacionReservation,
  unassignEventoReservation,
  assignHabitacionReservation,
  assignEventoReservation
} from '../../../services/reservationService';
import apiClient from '../../../services/apiClient';
import userService from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';
import { useReservationSync } from '../../../context/ReservationSyncContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Función para verificar si el usuario puede gestionar una reservación
export const canManageReservation = (reservation, currentUser) => {
  if (!reservation || !currentUser) return false;
  
  // Los administradores pueden gestionar todas las reservaciones
  if (currentUser.role === 'admin') return true;
  
  // Los empleados solo pueden gestionar las reservaciones que les fueron asignadas
  if (currentUser.role === 'empleado') {
    return reservation.asignadoA === currentUser._id;
  }
  
  // Por defecto, no se permite gestionar la reservación
  return false;
};

export default function AdminReservations() {
  const { user } = useAuth();
  const reservationSync = useReservationSync();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialFilterType = searchParams.get('tipo') || 'all';
  
  const [usuarios, setUsuarios] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterType, setFilterType] = useState(initialFilterType);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [assigningReservation, setAssigningReservation] = useState(false);
  const [updatingReservation, setUpdatingReservation] = useState(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  
  // Cargar reservaciones al montar el componente
  useEffect(() => {
    loadReservations();
  }, [filterType]);
  
  // Establecer el filtro de usuario como 'mis_reservas' por defecto
  useEffect(() => {
    if (user && user.id) {
      setFilterUser('mis_reservas');
    }
  }, [user]);
  
  // Actualizar URL cuando cambia el filtro de tipo
  const handleFilterTypeChange = (e) => {
    const newFilterType = e.target.value;
    setFilterType(newFilterType);
    
    // Actualizar la URL sin recargar la página
    const newUrl = newFilterType === 'all' 
      ? '/admin/reservaciones' 
      : `/admin/reservaciones?tipo=${newFilterType}`;
    
    router.push(newUrl, { scroll: false });
  };
  
  // Función para obtener el nombre del usuario asignado
  const getUsuarioAsignado = (reserva) => {
    if (!reserva.asignadoA) return 'Sin asignar';
    
    // Si la reserva tiene los datos del usuario populados
    if (typeof reserva.asignadoA === 'object' && reserva.asignadoA.nombre) {
      return `${reserva.asignadoA.nombre} ${reserva.asignadoA.apellidos}`;
    }
    
    // Si solo tenemos el ID, buscamos en la lista de usuarios
    const usuarioAsignado = usuarios.find(u => u._id === reserva.asignadoA);
    return usuarioAsignado ? 
      `${usuarioAsignado.nombre} ${usuarioAsignado.apellidos}` : 
      'Usuario asignado';
  };
  
  // Función para normalizar IDs (maneja tanto _id como id)
  const normalizeId = (obj) => {
    if (!obj) return null;
    // Si tiene una propiedad id pero no _id, añadir _id usando id
    if (obj.id && !obj._id) {
      obj._id = obj.id;
    }
    // Si tiene una propiedad _id pero no id, añadir id usando _id
    if (obj._id && !obj.id) {
      obj.id = obj._id;
    }
    return obj;
  };
  
  // Función para verificar si el usuario puede gestionar una reservación
  const canManageReservation = (reservation, currentUser) => {
    if (!reservation || !currentUser) return false;
    
    // Los administradores pueden gestionar todas las reservaciones
    if (currentUser.role === 'admin') return true;
    
    // Los empleados solo pueden gestionar las reservaciones que les fueron asignadas
    if (currentUser.role === 'empleado') {
      return reservation.asignadoA === currentUser._id;
    }
    
    // Por defecto, no se permite gestionar la reservación
    return false;
  };
  
  // Función para cargar todas las reservaciones
  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar lista de usuarios primero
      try {
        const usersResponse = await userService.getAllUsers();
        if (usersResponse.success && Array.isArray(usersResponse.data)) {
          setUsuarios(usersResponse.data);
        } else {
          setUsuarios([]);
        }
      } catch (userError) {
        console.error('Error al cargar usuarios:', userError.message || userError);
        setUsuarios([]);
      }
      
      // Obtener todas las reservas desde el servidor
      console.log('Cargando reservas desde el servidor...');
      const result = await reservationSync.loadAllReservations(false);
      
      // Normalizar los IDs para evitar problemas de comparación
      const normalizedReservations = result.allReservations.map(normalizeId);
      
      console.log(`Reservas cargadas: ${normalizedReservations.length}`);
      
      // Primero, organizar los eventos y sus habitaciones asociadas
      const eventoMap = new Map();
      
      // Identificar todos los eventos
      normalizedReservations.forEach(reserva => {
        if (reserva.tipo === 'evento') {
          eventoMap.set(reserva.id, {
            evento: reserva,
            habitaciones: []
          });
        }
      });
      
      // Asociar habitaciones a sus eventos
      normalizedReservations.forEach(reserva => {
        if (reserva.tipo === 'habitacion' && (reserva.eventoId || reserva.reservaEvento)) {
          const eventoId = reserva.eventoId || reserva.reservaEvento;
          
          if (eventoMap.has(eventoId)) {
            eventoMap.get(eventoId).habitaciones.push(reserva);
          }
        }
      });
      
      // Procesar las relaciones entre eventos y habitaciones
      // y asegurarse de que tengan el mismo estado de asignación
      const procesadas = normalizedReservations.map(reserva => {
        // Si es una habitación asociada a un evento
        if (reserva.tipo === 'habitacion' && (reserva.eventoId || reserva.reservaEvento)) {
          const eventoId = reserva.eventoId || reserva.reservaEvento;
          
          // Buscar el evento asociado
          const eventoAsociado = normalizedReservations.find(ev => 
            ev.tipo === 'evento' && (ev.id === eventoId || ev._id === eventoId)
          );
          
          // Si encontramos el evento, asegurarnos de que tengan el mismo usuario asignado
          if (eventoAsociado) {
            // La habitación siempre debe heredar la asignación del evento
            reserva.asignadoA = eventoAsociado.asignadoA;
            reserva.asignadoAMi = eventoAsociado.asignadoA === user?.id;
          }
        }
        
        // Si es un evento, verificar si tiene habitaciones asignadas y asegurar que tengan la misma asignación
        if (reserva.tipo === 'evento' && eventoMap.has(reserva.id)) {
          const habitacionesEvento = eventoMap.get(reserva.id).habitaciones;
          
          // Actualizar todas las habitaciones con la asignación del evento
          habitacionesEvento.forEach(hab => {
            hab.asignadoA = reserva.asignadoA;
            hab.asignadoAMi = reserva.asignadoA === user?.id;
          });
        }
        
        return reserva;
      });
      
      setAllReservations(procesadas);
      console.log('Reservas procesadas y almacenadas en el estado', procesadas.length);
      
      // Aplicar filtros a las reservaciones cargadas
      const filtered = procesadas.filter(reservation => {
        // Filtrar por tipo si es necesario
        if (filterType !== 'all' && reservation.tipo !== filterType) {
          return false;
        }
        return true;
      });
      
      setFilteredReservations(filtered);
      console.log('Reservas filtradas según criterios actuales:', filtered.length);
      
      setLoading(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error cargando reservaciones:', error);
      setError('Error al cargar las reservaciones');
      setLoading(false);
    }
  };
  
  // Filtrar reservaciones según los filtros aplicados
  const getFilteredReservations = (reservations = allReservations) => {
    return reservations.filter(reservation => {
      // Obtener el ID del usuario asignado, manejando tanto objetos como IDs directos
      const reservaAsignadaId = typeof reservation.asignadoA === 'object' ? 
        reservation.asignadoA?._id : 
        reservation.asignadoA;

      // Filtrado por búsqueda
      const matchesSearch = searchTerm === '' ? true :
        (reservation.cliente && reservation.cliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.tipo && reservation.tipo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.datosCompletos?.tipoHabitacion && 
          reservation.datosCompletos.tipoHabitacion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.datosCompletos?.tipoEvento && 
          (typeof reservation.datosCompletos.tipoEvento === 'string' ? 
            reservation.datosCompletos.tipoEvento.toLowerCase().includes(searchTerm.toLowerCase()) :
            (reservation.datosCompletos.tipoEvento?.titulo && 
              reservation.datosCompletos.tipoEvento.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
          ));

      // Filtrado por estado
      const matchesStatus = filterStatus === 'all' || 
        (reservation.estado && reservation.estado.toLowerCase() === filterStatus.toLowerCase());
      
      // Filtrado por tipo - esto ya se filtra en loadReservations, pero lo mantenemos por si cambia la lógica
      const matchesType = filterType === 'all' || reservation.tipo === filterType;
      
      // Filtrado por usuario asignado
      let matchesUser = false;
      
      if (filterUser === 'all') {
        // Mostrar todas las reservas independientemente de la asignación
        matchesUser = true;
      } else if (filterUser === 'sin_asignar') {
        // Mostrar solo reservas sin asignar
        matchesUser = !reservaAsignadaId;
      } else if (filterUser === 'mis_reservas') {
        // MODIFICACIÓN: Mostrar tanto reservas directamente asignadas al usuario como 
        // habitaciones de eventos asignados al usuario actual
        
        // Verificar si esta reserva está directamente asignada al usuario actual
        const asignadaDirectamente = reservaAsignadaId === user?.id;
        
        // Si la reserva es una habitación asociada a un evento, verificar si el evento está asignado al usuario
        let asignadaIndirectamente = false;
        if (reservation.tipo === 'habitacion' && (reservation.eventoId || reservation.reservaEvento)) {
          const eventoId = reservation.eventoId || reservation.reservaEvento;
          // Buscar el evento asociado en todas las reservas
          const eventoAsociado = allReservations.find(r => 
            r.tipo === 'evento' && (r.id === eventoId || r._id === eventoId)
          );
          // Si el evento existe y está asignado al usuario actual, mostrar la habitación
          if (eventoAsociado) {
            const eventoAsignadoId = typeof eventoAsociado.asignadoA === 'object' ?
              eventoAsociado.asignadoA?._id : eventoAsociado.asignadoA;
            asignadaIndirectamente = eventoAsignadoId === user?.id;
          }
        }
        
        // Mostrar la reserva si está asignada directamente o indirectamente al usuario
        matchesUser = asignadaDirectamente || asignadaIndirectamente;
      } else {
        // Filtrado por usuario específico
        matchesUser = reservaAsignadaId === filterUser;
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesUser;
    });
  };
  

  
  // Definir estado para las reservaciones filtradas
  const [filteredReservations, setFilteredReservations] = useState([]);
  
  // Aplicar filtros cuando cambien
  useEffect(() => {
    if (allReservations.length > 0) {
      const filtered = getFilteredReservations();
      setFilteredReservations(filtered);
    }
  }, [filterType, filterStatus, searchTerm, filterUser, allReservations]);
  
  
  // Function to get appropriate status badge
  const getStatusBadge = (status) => {
    if (!status) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Sin estado</span>;
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'confirmada' || statusLower === 'confirmado') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center justify-center space-x-1">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        <span>Confirmada</span>
      </span>;
    } else if (statusLower === 'pendiente') {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center space-x-1">
        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
        <span>Pendiente</span>
      </span>;
    } else if (statusLower === 'cancelada' || statusLower === 'cancelado') {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center justify-center space-x-1">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        <span>Cancelada</span>
      </span>;
    } else if (statusLower === 'completada' || statusLower === 'completado') {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center justify-center space-x-1">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        <span>Completada</span>
      </span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
  };
  
  // Función para formatear fechas en español
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'UTC'
      };
      
      const fechaObj = new Date(fecha);
      
      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha inválida';
      }
      
      return fechaObj.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  };
  
  // Función para formatear hora en 12 horas
  const formatearHora = (horaStr) => {
    if (!horaStr) return '';
    
    try {
      // Convertir formato "HH:MM" a un objeto Date
      const [horas, minutos] = horaStr.split(':').map(Number);
      const fecha = new Date();
      fecha.setHours(horas, minutos, 0);
      
      return fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return horaStr;
    }
  };
  
  // Function to get badges for reservation types
  const getTipoBadge = (tipo) => {
    if (tipo === 'habitacion') {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Habitación</span>;
    } else if (tipo === 'evento') {
      return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Evento</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{tipo}</span>;
  };
  
  const getTipoReservacionLabel = (tipo, detalles = {}) => {
    if (!detalles) {
      return tipo ? `${tipo.charAt(0).toUpperCase()}${tipo.slice(1)}` : 'Reserva';
    }
    
    if (tipo === 'habitacion') {
      // Verificar si es una habitación asociada a un evento
      if (detalles?.eventoAsociado || detalles?.reservaEvento) {
        const nombreEvento = detalles.eventoAsociado?.nombreEvento || 
                           detalles.eventoAsociado?.nombre || 
                           'Evento sin nombre';
        return `Habitación para Evento: ${nombreEvento}`;
      }
      
      // Combinar información de tipo y nombre
      let tipoHabitacion = '';
      if (detalles?.tipoHabitacion) {
        if (typeof detalles.tipoHabitacion === 'object') {
          tipoHabitacion = detalles.tipoHabitacion.nombre || detalles.tipoHabitacion.tipo || '';
        } else {
          tipoHabitacion = detalles.tipoHabitacion;
        }
      }
      
      let nombreHabitacion = detalles?.habitacionNombre || detalles?.nombre || '';
      let letraHabitacion = detalles?.letraHabitacion ? `Habitación ${detalles.letraHabitacion}` : '';
      let categoriaHabitacion = detalles?.categoriaHabitacion ? 
        `(${detalles.categoriaHabitacion.charAt(0).toUpperCase()}${detalles.categoriaHabitacion.slice(1)})` : '';
      
      // Construir el string final
      let label = [];
      if (tipoHabitacion) label.push(tipoHabitacion);
      if (letraHabitacion) label.push(letraHabitacion);
      if (nombreHabitacion && nombreHabitacion !== tipoHabitacion) label.push(nombreHabitacion);
      if (categoriaHabitacion) label.push(categoriaHabitacion);
      
      return label.join(' - ') || 'Habitación sin especificar';
    }
    
    if (tipo === 'evento') {
      const nombreEvento = detalles?.nombreEvento || '(Sin nombre)';
      const tipoEvento = detalles?.tipoEvento ? 
        (typeof detalles.tipoEvento === 'object' ? 
          detalles.tipoEvento?.titulo || 'Evento' : 
          detalles.tipoEvento || 'Evento'
        ) : 'Evento';
      
      // Incluir información de habitaciones si las hay
      const habitacionesInfo = detalles?.habitacionesAsociadas > 0 ? 
        ` (${detalles.habitacionesAsociadas} hab.)` : '';
      
      return `${nombreEvento} - ${tipoEvento}${habitacionesInfo}`;
    }
    
    return tipo || 'Reserva';
  };

  const getReservationPath = (tipo, id, reservation) => {
    // Agregar depuración para verificar los valores
    console.log('Construyendo ruta para:', { tipo, id, reservation });
    
    // Asegurar que tipo sea un string y verificar su valor exacto
    const tipoStr = String(tipo).toLowerCase().trim();
    
    if (tipoStr === 'habitacion') {
      console.log('Redirigiendo a página de habitación');
      // Construir los parámetros de query
      const params = new URLSearchParams();
      if (reservation?.habitacion?.nombre) {
        params.append('habitacion', reservation.habitacion.nombre);
      }
      if (reservation?.tipoHabitacion?.nombre) {
        params.append('tipoHabitacion', reservation.tipoHabitacion.nombre);
      }
      const queryString = params.toString();
      return `/admin/reservaciones/habitacion/${id}${queryString ? `?${queryString}` : ''}`;
    }
    
    if (tipoStr === 'evento') {
      console.log('Redirigiendo a página de evento');
      return `/admin/reservaciones/evento/${id}`;
    }
    
    return `/admin/reservaciones/${tipo}/${id}`;
  };

  // Función para mostrar el título adecuado según el filtro
  const getFilteredTitle = () => {
    switch (filterType) {
      case 'habitacion':
        return 'Reservaciones de Habitaciones';
      case 'evento':
        return 'Reservaciones de Eventos';
      default:
        return 'Todas las Reservaciones';
    }
  };
  
  // Función auxiliar para verificar si una reserva está asignada al usuario actual
  const isAssignedToMe = (reservation) => {
    // Si no hay usuario actual o la reserva no está asignada, devuelve false
    if (!user || !reservation.asignadoA) return false;
    
    // Obtener el ID del usuario asignado, manejando tanto strings como objetos
    let reservationUserId;
    
    if (typeof reservation.asignadoA === 'object') {
      // Si es un objeto, extraer el _id o id
      reservationUserId = reservation.asignadoA._id || reservation.asignadoA.id;
    } else {
      // Si es un string o valor primitivo, usarlo directamente
      reservationUserId = reservation.asignadoA;
    }
    
    // Obtener el ID del usuario actual
    const currentUserId = user.id;
    
    // Comprobar si coinciden
    return String(reservationUserId) === String(currentUserId);
  };
  
  // Función para forzar recarga de reservaciones con la UI actualizada
  const forceReload = () => {
    // Primero cargar desde el contexto de sincronización
    reservationSync.loadAllReservations(false)
      .then((result) => {
        if (result?.allReservations?.length > 0) {
          console.log('Actualizando UI con datos recientes del contexto', {
            total: result.allReservations.length,
            habitaciones: result.habitaciones.length,
            eventos: result.eventos.length
          });
          
          // Procesar las listas para asegurar que se muestran los datos más recientes
          const procesadas = result.allReservations.map(normalizeId);
          setAllReservations(procesadas);
          setFilteredReservations(getFilteredReservations(procesadas));
          
          toast.success('Reservaciones actualizadas');
        }
      })
      .catch(error => {
        console.error('Error actualizando reservaciones:', error);
      });
  };

  // Función para confirmar una reserva
  const handleConfirmReservation = async (id, tipo) => {
    try {
      setUpdatingReservation(`confirm-${id}`);
      
      let response;
      switch(tipo) {
        case 'habitacion':
          response = await updateHabitacionReservation(id, { estado: 'confirmada' });
          break;
        case 'evento':
          response = await updateEventoReservation(id, { estado: 'confirmada' });
          break;
        default:
          throw new Error('Tipo de reserva no válido');
      }
      
      if (response && response.success) {
        toast.success(`Reserva de ${tipo} confirmada exitosamente`);
        
        // Actualizar el estado localmente sin necesidad de recargar todo
        setAllReservations(prevReservations => {
          return prevReservations.map(reserva => {
            if (reserva.id === id) {
              // Mantener la primera letra en mayúscula para la visualización
              return { ...reserva, estado: 'Confirmada' };
            }
            return reserva;
          });
        });
        
        // Aplicar filtros a las reservaciones actualizadas
        const filtered = getFilteredReservations(
          allReservations.map(reserva => 
            reserva.id === id ? { ...reserva, estado: 'Confirmada' } : reserva
          )
        );
        setFilteredReservations(filtered);
        
        // Actualizar en el contexto de sincronización para que se refleje en todas las páginas
        reservationSync.updateReservationState(id, tipo, 'confirmada');
      } else {
        const errorMsg = response?.message || 'Error desconocido al confirmar la reserva';
        toast.error('Error al confirmar la reserva: ' + errorMsg);
        console.error('Error en la respuesta del servidor:', response);
      }
    } catch (error) {
      console.error('Error confirmando reserva:', error);
      toast.error('Error al confirmar la reserva: ' + (error.message || 'Error desconocido'));
    } finally {
      setUpdatingReservation(null);
    }
  };
  
  // Función para cancelar una reserva
  const handleCancelReservation = async (id, tipo) => {
    try {
      setUpdatingReservation(`cancel-${id}`);
      
      let response;
      switch(tipo) {
        case 'habitacion':
          response = await updateHabitacionReservation(id, { estado: 'cancelada' });
          break;
        case 'evento':
          response = await updateEventoReservation(id, { estado: 'cancelada' });
          break;
        default:
          throw new Error('Tipo de reserva no válido');
      }
      
      if (response && response.success) {
        toast.success(`Reserva de ${tipo} cancelada exitosamente`);
        
        // Actualizar el estado localmente sin necesidad de recargar todo
        setAllReservations(prevReservations => {
          return prevReservations.map(reserva => {
            if (reserva.id === id) {
              return { ...reserva, estado: 'Cancelada' };
            }
            return reserva;
          });
        });
        
        // Aplicar filtros a las reservaciones actualizadas
        const filtered = getFilteredReservations(
          allReservations.map(reserva => 
            reserva.id === id ? { ...reserva, estado: 'Cancelada' } : reserva
          )
        );
        setFilteredReservations(filtered);
        
        // Actualizar en el contexto de sincronización para que se refleje en todas las páginas
        reservationSync.updateReservationState(id, tipo, 'cancelada');
      } else {
        const errorMsg = response?.message || 'Error desconocido al cancelar la reserva';
        toast.error('Error al cancelar la reserva: ' + errorMsg);
        console.error('Error en la respuesta del servidor:', response);
      }
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      toast.error('Error al cancelar la reserva: ' + (error.message || 'Error desconocido'));
    } finally {
      setUpdatingReservation(null);
    }
  };
  
  // Función para eliminar una reserva
  const handleDeleteReservation = async (id, tipo) => {
    try {
      // Verificar si es una habitación asociada a un evento
      if (tipo === 'habitacion') {
        const reserva = allReservations.find(r => r.id === id || r._id === id);
        if (reserva && (reserva.eventoId || reserva.reservaEvento)) {
          const eventoId = reserva.eventoId || reserva.reservaEvento;
          const confirmarEliminar = confirm(
            `Esta habitación está asociada al evento #${eventoId}. ` +
            `Si desea eliminarla, debe hacerlo desde la página del evento. ` +
            `¿Desea ir a la página del evento para administrar sus habitaciones?`
          );
          
          if (confirmarEliminar) {
            router.push(`/admin/reservaciones/evento/${eventoId}`);
          }
          
          return;
        }
      }
      
      if (!confirm(`¿Está seguro que desea eliminar esta reserva de ${tipo === 'habitacion' ? 'habitación' : 'evento'}? Esta acción no se puede deshacer.`)) {
        return;
      }
      
      setUpdatingReservation(`delete-${id}`);
      
      let response;
      switch(tipo) {
        case 'habitacion':
          response = await deleteHabitacionReservation(id);
          break;
        case 'evento':
          response = await deleteEventoReservation(id);
          break;
        default:
          throw new Error('Tipo de reserva no válido');
      }
      
      if (response && response.success) {
        // Notificar al usuario
        toast.success(`Reserva de ${tipo} eliminada exitosamente`);
        
        // Mostrar información adicional si eliminamos un evento con habitaciones asociadas
        if (tipo === 'evento' && response.resultadosAdicionales?.habitacionesDesvinculadas > 0) {
          toast.info(`Se desvincularon ${response.resultadosAdicionales.habitacionesDesvinculadas} habitaciones asociadas`);
        }
        
        // Actualizar el estado localmente
        setAllReservations(prevReservations => {
          return prevReservations.filter(reserva => 
            !(reserva.id === id || reserva._id === id)
          );
        });
        
        // También actualizar las reservas filtradas
        setFilteredReservations(prevFiltered => {
          return prevFiltered.filter(reserva => 
            !(reserva.id === id || reserva._id === id)
          );
        });
        
        // Si eliminamos un evento, también eliminar sus habitaciones asociadas de la vista
        if (tipo === 'evento') {
          setAllReservations(prevReservations => {
            return prevReservations.filter(reserva => 
              !(reserva.tipo === 'habitacion' && 
                (reserva.eventoId === id || reserva.reservaEvento === id))
            );
          });
          
          setFilteredReservations(prevFiltered => {
            return prevFiltered.filter(reserva => 
              !(reserva.tipo === 'habitacion' && 
                (reserva.eventoId === id || reserva.reservaEvento === id))
            );
          });
        }
        
        // Notificar al contexto de sincronización
        if (reservationSync && reservationSync.removeReservation) {
          reservationSync.removeReservation(id, tipo);
          
          // Si es un evento, también eliminar sus habitaciones asociadas
          if (tipo === 'evento') {
            const habitacionesAsociadas = allReservations.filter(reserva => 
              reserva.tipo === 'habitacion' && 
              (reserva.eventoId === id || reserva.reservaEvento === id)
            );
            
            habitacionesAsociadas.forEach(habitacion => {
              reservationSync.removeReservation(habitacion.id, 'habitacion');
            });
          }
        }
        
        // Recargar después de un breve retraso
        setTimeout(() => {
          loadReservations();
        }, 500);
      } else {
        // Si la habitación está asociada a un evento, ofrecer ir al evento
        if (response && 
            !response.success && 
            response.data?.evento && 
            response.data?.eventoId) {
          
          toast.error(response.message);
          
          // Preguntar si quiere ir al evento
          if (confirm('¿Desea ir a la página del evento para gestionar esta habitación?')) {
            router.push(`/admin/reservaciones/evento/${response.data.eventoId}`);
          }
        } else {
          const errorMsg = response?.message || 'Error desconocido al eliminar la reserva';
          toast.error('Error al eliminar la reserva: ' + errorMsg);
        }
      }
    } catch (error) {
      console.error('Error eliminando reserva:', error);
      toast.error('Error al eliminar la reserva: ' + (error.message || 'Error desconocido'));
    } finally {
      setUpdatingReservation(null);
    }
  };
  
  // Función para desasignar una reserva
  const handleUnassignReservation = async (id, tipo) => {
    try {
      setUpdatingReservation(`unassign-${id}`);
      
      // Verificar si es una habitación asociada a un evento
      // En ese caso, debemos desasignar el evento primero
      if (tipo === 'habitacion') {
        const habitacion = allReservations.find(r => r.id === id || r._id === id);
        
        if (habitacion && (habitacion.eventoId || habitacion.reservaEvento)) {
          const eventoId = habitacion.eventoId || habitacion.reservaEvento;
          const evento = allReservations.find(r => 
            (r.id === eventoId || r._id === eventoId) && r.tipo === 'evento'
          );
          
          if (evento) {
            // Si el evento existe, desasignar el evento en lugar de la habitación
            console.log('Esta habitación está asociada a un evento, desasignando el evento en su lugar');
            toast.info('Esta habitación forma parte de un evento. Se desasignará todo el evento con sus habitaciones.');
            
            // Llamar recursivamente para desasignar el evento
            setUpdatingReservation(null);
            
            // Pequeño retraso para evitar problemas
            setTimeout(() => {
              handleUnassignReservation(eventoId, 'evento');
            }, 100);
            
            return;
          }
        }
      }
      
      let response;
      switch(tipo) {
        case 'habitacion':
          response = await unassignHabitacionReservation(id);
          break;
        case 'evento':
          response = await unassignEventoReservation(id);
          break;
        default:
          throw new Error('Tipo de reserva no válido');
      }
      
      if (response && response.success) {
        toast.success(`Reserva de ${tipo} desasignada exitosamente`);
        
        // Verificar si hay resultados adicionales (habitaciones desasignadas)
        if (response.resultadosAdicionales) {
          const { habitaciones, totalDesasignados } = response.resultadosAdicionales;
          if (habitaciones > 0) {
            toast.success(`También se desasignaron ${habitaciones} habitaciones relacionadas a este evento`);
          }
        }
        
        // Actualizar inmediatamente algunas propiedades clave en la UI
        const procesarReserva = (reserva) => {
          // Si es el objeto principal o una habitación/evento relacionado
          const esReservaDirecta = (reserva.id === id || reserva._id === id) && reserva.tipo === tipo;
          const esHabitacionAsociada = reserva.tipo === 'habitacion' && 
            tipo === 'evento' && (reserva.eventoId === id || reserva.reservaEvento === id);
            
          if (esReservaDirecta || esHabitacionAsociada) {
            return {
              ...reserva,
              asignadoA: null,
              asignadoAMi: false
            };
          }
          return reserva;
        };
        
        // Actualizar localmente
        setAllReservations(prevReservations => 
          prevReservations.map(procesarReserva)
        );
        
        setFilteredReservations(prevFiltered => 
          prevFiltered.map(procesarReserva)
        );
        
        // Notificar al contexto global de sincronización
        reservationSync.updateReservation(id, tipo, { 
          asignadoA: null, 
          usuarioAsignado: null 
        });
        
        // Forzar recarga completa después de un pequeño retraso
        setTimeout(forceReload, 500);
      } else {
        const errorMsg = response?.message || 'Error desconocido al desasignar la reserva';
        toast.error('Error al desasignar la reserva: ' + errorMsg);
      }
    } catch (error) {
      console.error('Error desasignando reserva:', error);
      toast.error('Error al desasignar la reserva: ' + (error.message || 'Error desconocido'));
    } finally {
      setUpdatingReservation(null);
    }
  };
  
  // Función para asignar una reserva al usuario actual
  const handleAssignToMe = async (id, tipo) => {
    if (assigningReservation) return;
    
    try {
      setAssigningReservation(true);
      setUpdatingReservation(`assign-${id}`);
      console.log('Asignando reserva al usuario actual:', id, tipo);
      
      // Verificar si es una habitación asociada a un evento
      // En ese caso, debemos asignar el evento primero
      if (tipo === 'habitacion') {
        const habitacion = allReservations.find(r => r.id === id || r._id === id);
        
        if (habitacion && (habitacion.eventoId || habitacion.reservaEvento)) {
          const eventoId = habitacion.eventoId || habitacion.reservaEvento;
          const evento = allReservations.find(r => 
            (r.id === eventoId || r._id === eventoId) && r.tipo === 'evento'
          );
          
          if (evento) {
            // Si el evento existe, asignar el evento en lugar de la habitación
            console.log('Esta habitación está asociada a un evento, asignando el evento en su lugar');
            toast.info('Esta habitación forma parte de un evento. Se asignará todo el evento con sus habitaciones.');
            
            // Llamar recursivamente para asignar el evento
            setAssigningReservation(false);
            setUpdatingReservation(null);
            
            // Pequeño retraso para evitar problemas
            setTimeout(() => {
              handleAssignToMe(eventoId, 'evento');
            }, 100);
            
            return;
          }
        }
      }
      
      let response;
      
      switch(tipo) {
        case 'habitacion':
          response = await assignHabitacionReservation(id, user?.id);
          break;
        case 'evento':
          response = await assignEventoReservation(id, user?.id);
          break;
        default:
          throw new Error('Tipo de reserva no válido');
      }
      
      if (response && response.success) {
        toast.success(`Reserva asignada exitosamente`);
        
        // Verificar si hay resultados adicionales (habitaciones asociadas asignadas)
        if (response.resultadosAdicionales) {
          const { habitaciones, totalAsignados } = response.resultadosAdicionales;
          if (habitaciones > 0) {
            toast.success(`También se asignaron ${habitaciones} habitaciones relacionadas a este evento`);
          }
        }
        
        // Actualizar inmediatamente algunas propiedades clave en la UI
        const procesarReserva = (reserva) => {
          // Si es el objeto principal o una habitación/evento relacionado
          const esReservaDirecta = (reserva.id === id || reserva._id === id) && reserva.tipo === tipo;
          const esHabitacionAsociada = reserva.tipo === 'habitacion' && 
            tipo === 'evento' && (reserva.eventoId === id || reserva.reservaEvento === id);
            
          if (esReservaDirecta || esHabitacionAsociada) {
            return {
              ...reserva,
              asignadoA: user?.id,
              asignadoAMi: true
            };
          }
          return reserva;
        };
        
        // Actualizar localmente
        setAllReservations(prevReservations => 
          prevReservations.map(procesarReserva)
        );
        
        setFilteredReservations(prevFiltered => 
          prevFiltered.map(procesarReserva)
        );
        
        // Notificar al contexto global de sincronización
        reservationSync.updateReservation(id, tipo, { 
          asignadoA: user?.id, 
          usuarioAsignado: user?.id 
        });
        
        // Forzar recarga completa después de un pequeño retraso
        setTimeout(forceReload, 500);
      } else {
        const errorMsg = response?.message || 'Error desconocido al asignar la reserva';
        toast.error('Error al asignar la reserva: ' + errorMsg);
        console.error('Error en la respuesta del servidor:', response);
      }
    } catch (error) {
      console.error('Error asignando reserva:', error);
      toast.error('Error al asignar la reserva: ' + (error.message || 'Error desconocido'));
    } finally {
      setAssigningReservation(false);
      setUpdatingReservation(null);
    }
  };
  
  // Función para formatear la hora
  const formatearHoraActual = (fecha) => {
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Función para manejar el menú desplegable
  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };
  
  // Función para asignar un evento a una habitación
  const handleAssignEvent = async (habitacion, evento) => {
    try {
      setLoading(true);
      console.log('Asignando evento a habitación', habitacion, evento);
      
      // Obtener IDs
      const habitacionId = habitacion.id || habitacion._id;
      const eventoId = evento.id || evento._id;
      
      // Actualizar la habitación en el backend
      await apiClient.put(`/reservas/habitaciones/${habitacionId}/actualizar`, {
        eventoId: eventoId,
        reservaEvento: eventoId,
        estado: 'ocupada'
      });
      
      // Encontrar el evento actual para actualizar su cantidad de habitaciones asociadas
      const eventoActual = allReservations.find(r => 
        r.tipo === 'evento' && (r.id === eventoId || r._id === eventoId)
      );
      
      if (eventoActual) {
        const habitacionesAsociadas = allReservations.filter(r => 
          r.tipo === 'habitacion' && (r.eventoId === eventoId || r.reservaEvento === eventoId)
        ).length;
        
        const cantidadPrevia = eventoActual.cantidadHabitaciones || 0;
        const nuevaCantidad = habitacionesAsociadas + 1; // +1 porque aún no hemos actualizado el estado local
        
        console.log(`Evento ${eventoId} - cantidad previa: ${cantidadPrevia}, nueva cantidad: ${nuevaCantidad}`);
        
        // Actualizar el evento en el backend
        await apiClient.put(`/reservas/eventos/${eventoId}/actualizar`, {
          cantidadHabitaciones: nuevaCantidad
        });
      }
      
      // Utilizar el contexto de sincronización para actualizar la habitación y el evento
      // Esto actualizará automáticamente todas las entidades relacionadas en toda la aplicación
      reservationSync.updateReservation({
        ...habitacion,
        eventoId: eventoId,
        reservaEvento: eventoId,
        estado: 'ocupada'
      }, 'habitacion');
      
      toast.success(`Habitación ${habitacion.numero || habitacionId} asignada al evento correctamente`);
    } catch (error) {
      console.error('Error al asignar evento a habitación:', error);
      toast.error('Error al asignar evento: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Función para eliminar una habitación específica de un evento
  const handleRemoveRoomFromEvent = async (habitacion, evento) => {
    setLoading(true);
    console.log('Eliminando habitación', habitacion, 'del evento', evento);
    
    try {
      const habitacionId = habitacion.id || habitacion._id;
      const eventoId = evento.id || evento._id;
      
      console.log(`Eliminando habitación ${habitacionId} del evento ${eventoId}`);
      
      // Actualizar la habitación en el backend para desvincularla del evento
      await apiClient.put(`/reservas/habitaciones/${habitacionId}/actualizar`, {
        eventoId: null,
        reservaEvento: null,
        estado: 'disponible'
      });
      
      // Buscar el evento actual para actualizar su conteo de habitaciones
      const eventoActual = allReservations.find(
        r => (r.id === eventoId || r._id === eventoId) && r.tipo === 'evento'
      );
      
      const habitacionesActuales = eventoActual?.habitacionesAsociadas || 1;
      const nuevoConteo = Math.max(0, habitacionesActuales - 1);
      
      console.log(`Evento tenía ${habitacionesActuales} habitaciones, nuevo conteo: ${nuevoConteo}`);
      
      // Actualizar el evento en el backend
      await apiClient.put(`/reservas/eventos/${eventoId}/actualizar`, {
        habitacionesAsociadas: nuevoConteo
      });
      
      // Actualizar la habitación en el contexto de sincronización global
      // Esto automáticamente actualizará también el evento gracias a la lógica mejorada
      reservationSync.updateReservation(habitacionId, 'habitacion', {
        eventoId: null,
        reservaEvento: null,
        estado: 'disponible',
        eventoAsociado: null
      });
      
      // No es necesario actualizar el evento por separado, ya que la función
      // updateReservation ya lo maneja correctamente, pero por claridad lo dejamos:
      reservationSync.updateReservation(eventoId, 'evento', {
        habitacionesAsociadas: nuevoConteo
      });
      
      console.log(`Habitación ${habitacionId} removida correctamente del evento ${eventoId}`);
      
      // No necesitamos actualizar estado local manualmente ya que el contexto se encarga de eso
      // y todas las páginas que usan el contexto serán actualizadas automáticamente
      
      // Notificar éxito
      toast.success(`Habitación removida correctamente del evento ${evento.nombre || evento.titulo}`);
      
    } catch (error) {
      console.error('Error al remover habitación del evento:', error);
      toast.error('Error al remover habitación: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Función para eliminar un evento y actualizar sus habitaciones asociadas
  const handleRemoveEvent = async (evento) => {
    try {
      setLoading(true);
      console.log('Eliminando evento', evento);
      
      // Obtener ID del evento
      const eventoId = evento.id || evento._id;
      
      // Filtrar habitaciones asociadas al evento
      const habitacionesAsociadas = allReservations.filter(r => 
        r.tipo === 'habitacion' && (r.eventoId === eventoId || r.reservaEvento === eventoId)
      );
      
      // Confirmar antes de proceder
      if (!confirm(`¿Está seguro que desea eliminar este evento? ${habitacionesAsociadas.length > 0 ? 
        `Se desasociarán ${habitacionesAsociadas.length} habitaciones.` : ''}`)) {
        setLoading(false);
        return;
      }
      
      console.log(`Desasociando ${habitacionesAsociadas.length} habitaciones del evento ${eventoId}`);
      
      // Actualizar cada habitación asociada
      for (const habitacion of habitacionesAsociadas) {
        const habitacionId = habitacion.id || habitacion._id;
        
        await apiClient.put(`/reservas/habitaciones/${habitacionId}/actualizar`, {
          eventoId: null,
          reservaEvento: null,
          estado: 'disponible'
        });
        
        console.log(`Habitación ${habitacionId} desasociada del evento ${eventoId}`);
      }
      
      // Eliminar el evento del backend
      await apiClient.delete(`/reservas/eventos/${eventoId}`);
      
      // Eliminar del contexto de sincronización
      reservationSync.removeReservation(eventoId, 'evento');
      
      // Notificar éxito
      const mensaje = habitacionesAsociadas.length > 0 ? 
        `Evento eliminado y ${habitacionesAsociadas.length} habitaciones desasociadas correctamente.` : 
        'Evento eliminado correctamente.';
      
      toast.success(mensaje);
      
      // Forzar recarga de reservaciones para sincronizar el estado
      loadReservations();
      
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      toast.error('Error al eliminar evento: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Función para abrir el modal de edición de precio
  const handleOpenPriceModal = (reservation) => {
    setSelectedReservation(reservation);
    setNewPrice(reservation.precio?.toString() || '0');
    setShowPriceModal(true);
  };

  // Función para actualizar el precio de una habitación
  const handleUpdatePrice = async () => {
    if (!selectedReservation || !newPrice) return;
    
    try {
      setUpdatingReservation(`price-${selectedReservation.id}`);
      
      const response = await apiClient.put(`/reservas/habitaciones/${selectedReservation.id}/actualizar`, {
        precio: parseFloat(newPrice),
        precioTotal: parseFloat(newPrice)
      });
      
      if (response.success) {
        toast.success('Precio actualizado correctamente');
        
        // Actualizar el estado local
        setAllReservations(prevReservations => 
          prevReservations.map(reserva => 
            reserva.id === selectedReservation.id ? 
              { ...reserva, precio: parseFloat(newPrice), precioTotal: parseFloat(newPrice) } : 
              reserva
          )
        );
        
        // Actualizar las reservas filtradas
        setFilteredReservations(prevFiltered => 
          prevFiltered.map(reserva => 
            reserva.id === selectedReservation.id ? 
              { ...reserva, precio: parseFloat(newPrice), precioTotal: parseFloat(newPrice) } : 
              reserva
          )
        );
        
        setShowPriceModal(false);
      } else {
        toast.error('Error al actualizar el precio');
      }
    } catch (error) {
      console.error('Error actualizando precio:', error);
      toast.error('Error al actualizar el precio: ' + (error.message || 'Error desconocido'));
    } finally {
      setUpdatingReservation(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          ⚠️ {getFilteredTitle()} ⚠️
        </h1>
        
        <div className="flex items-center gap-2">
          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar reservaciones..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={loadReservations}
            className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-1"
            title="Recargar reservaciones"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 flex-wrap md:flex-nowrap">
          <div className="relative">
            <select
              className="appearance-none bg-white pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="cancelada">Canceladas</option>
            </select>
            <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-white pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="all">Todos los usuarios</option>
              <option value="sin_asignar">Sin asignar</option>
              <option value="mis_reservas">Mis reservas</option>
              {usuarios
                .filter(usuario => usuario._id !== user?.id) // Filtrar el usuario actual
                .map(usuario => (
                  <option key={usuario._id} value={usuario._id}>
                    {usuario.nombre} {usuario.apellidos}
                  </option>
              ))}
            </select>
            <FaUserCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-white pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              value={filterType}
              onChange={handleFilterTypeChange}
            >
              <option value="all">Todos los tipos</option>
              <option value="habitacion">Habitaciones</option>
              <option value="evento">Eventos</option>
            </select>
            <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        {/* Resumen de resultados */}
        <div className="text-sm text-gray-600 flex flex-wrap justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
          <div>
            Se encontraron <span className="font-medium">{filteredReservations.length}</span> reservaciones
            {filterType !== 'all' && <span> de tipo <span className="font-medium">{filterType}</span></span>}
            {filterStatus !== 'all' && <span> con estado <span className="font-medium">{filterStatus}</span></span>}
            {filterUser !== 'all' && (
              <span> {filterUser === 'mis_reservas' 
                ? 'asignadas a ti' 
                : filterUser === 'sin_asignar' 
                  ? 'sin asignar' 
                  : `asignadas a ${usuarios.find(u => u._id === filterUser)?.nombre || 'un usuario'}`}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            Última actualización: {formatearHoraActual(lastUpdated)}
          </div>
        </div>
      </div>

      {/* Notificación sobre las reservaciones */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md mb-4 shadow-sm">
        <p className="text-blue-700">
          Las reservaciones mostradas aquí son generadas automáticamente a partir de las solicitudes realizadas por los usuarios en el sitio web principal.
        </p>
      </div>

      {/* Estado de carga o error */}
      {loading && (
        <div className="text-center py-12">
          <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-gray-600">Cargando reservaciones...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabla de Reservaciones */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invitados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                  {filteredReservations && filteredReservations.length > 0 ? (
                    filteredReservations.map((reservation, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{reservation.cliente}</p>
                          {reservation.datosCompletos?.emailContacto && (
                            <p className="text-xs text-gray-600 truncate max-w-[200px]">
                              {reservation.datosCompletos.emailContacto}
                            </p>
                          )}
                          {reservation.datosCompletos?.telefonoContacto && (
                            <p className="text-xs text-gray-600">
                              {reservation.datosCompletos.telefonoContacto}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {getTipoBadge(reservation.tipo)}
                          <p className="mt-1 text-gray-700 font-medium">
                            {getTipoReservacionLabel(reservation.tipo, reservation.datosCompletos)}
                          </p>
                          {reservation.tipo === 'evento' && (
                            <>
                              {reservation.datosCompletos?.nombreEvento && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Nombre: <span className="font-medium">{reservation.datosCompletos.nombreEvento}</span>
                                </p>
                              )}
                              {reservation.datosCompletos?.tipoEvento && (
                                <p className="text-xs text-gray-600">
                                  Tipo: {typeof reservation.datosCompletos?.tipoEvento === 'object' 
                                    ? reservation.datosCompletos?.tipoEvento?.titulo || 'Evento' : 
                                    reservation.datosCompletos?.tipoEvento}
                                </p>
                              )}
                            </>
                          )}
                          {reservation.tipo === 'habitacion' && (
                            <>
                              {reservation.datosCompletos?.nombre && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Nombre: <span className="font-medium">{reservation.datosCompletos.nombre}</span>
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-700 font-medium capitalize">
                            {formatearFecha(reservation.fecha).split(',')[0]}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatearFecha(reservation.fecha).split(',').slice(1).join(',')}
                          </p>
                          
                          {reservation.fechaSalida && (
                            <div className="mt-1 pt-1 border-t border-gray-200">
                              <p className="text-xs text-gray-700">Salida:</p>
                              <p className="text-xs text-gray-600">
                                {formatearFecha(reservation.fechaSalida)}
                              </p>
                            </div>
                          )}
                          
                          {reservation.datosCompletos?.horaInicio && (
                            <div className="mt-1 text-xs text-gray-600">
                              {formatearHora(reservation.datosCompletos?.horaInicio)}
                              {reservation.datosCompletos?.horaFin && (
                                <span> - {formatearHora(reservation.datosCompletos?.horaFin)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {reservation.tipo === 'evento' ? (
                          <span className="font-medium">{reservation.invitados} invitados</span>
                        ) : reservation.tipo === 'habitacion' ? (
                          <div>
                            <p>{reservation.invitados} {reservation.invitados > 1 ? 'huéspedes' : 'huésped'}</p>
                            {reservation.datosCompletos?.numeroHabitaciones && reservation.datosCompletos?.numeroHabitaciones > 1 && (
                              <p className="text-xs text-gray-600">{reservation.datosCompletos?.numeroHabitaciones} habitaciones</p>
                            )}
                          </div>
                        ) : (
                          <span>{reservation.invitados}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(reservation.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {reservation.asignadoA ? (
                            <div className="flex items-center">
                              <FaUserCircle className="text-gray-400 mr-2" />
                              <span className="text-gray-700">{getUsuarioAsignado(reservation)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 flex items-center">
                              <FaUserCircle className="mr-2" />
                              Sin asignar
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {reservation.tipo === 'habitacion' ? (
                            <>
                              <p className="text-sm font-semibold text-gray-900">
                                ${(reservation.datosCompletos?.precio || reservation.precio || reservation.precioTotal || 0).toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </p>
                              {(reservation.datosCompletos?.precioPorNoche || reservation.precioPorNoche) && (
                                <p className="text-xs text-gray-500">
                                  ${(reservation.datosCompletos?.precioPorNoche || reservation.precioPorNoche).toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})} por noche
                                </p>
                              )}
                            </>
                          ) : reservation.tipo === 'evento' ? (
                            <>
                              <p className="text-sm font-semibold text-gray-900">
                                ${(reservation.datosCompletos?.total || reservation.datosCompletos?.precio || reservation.total || reservation.precio || reservation.precioTotal || 0).toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </p>
                              {reservation.datosCompletos?.presupuestoEstimado && (
                                <p className="text-xs text-gray-500">
                                  Presupuesto inicial: ${parseFloat(reservation.datosCompletos.presupuestoEstimado).toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">$0.00</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2 justify-end">
                          <Link
                            href={getReservationPath(reservation.tipo, reservation.id, reservation)}
                            className={`rounded-full p-1 transition-colors ${
                              !isAssignedToMe(reservation) && reservation.asignadoA
                                ? 'text-gray-300 cursor-not-allowed pointer-events-none' 
                                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                            }`}
                            title={!isAssignedToMe(reservation) && reservation.asignadoA ? "No tienes permiso para ver los detalles de esta reserva" : "Ver detalles"}
                            onClick={(e) => {
                              if (!isAssignedToMe(reservation) && reservation.asignadoA) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <FaEye size={16} />
                          </Link>
                          
                          {reservation.asignadoA ? (
                            <button 
                              onClick={() => handleUnassignReservation(reservation.id, reservation.tipo)}
                              disabled={!isAssignedToMe(reservation) || updatingReservation === `unassign-${reservation.id}`}
                              className={`rounded-full p-1 transition-colors ${
                                !isAssignedToMe(reservation)
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-amber-600 hover:text-amber-800 hover:bg-amber-100'
                              }`}
                              title={!isAssignedToMe(reservation) ? "Solo quien tiene asignada la reserva puede desasignarla" : "Desasignar reserva"}
                            >
                              {updatingReservation === `unassign-${reservation.id}` ? (
                                <FaSpinner className="w-4 h-4 animate-spin" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.046 15.253c-.058.468.172.92.57 1.175A9.953 9.953 0 008 18c1.982 0 3.83-.578 5.38-1.573.398-.254.628-.707.57-1.175a6.001 6.001 0 00-11.904 0z" />
                                  <path d="M12.75 7.75a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5z" />
                                </svg>
                              )}
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleAssignToMe(reservation.id, reservation.tipo)}
                              disabled={updatingReservation === `assign-${reservation.id}`}
                              className="rounded-full p-1 transition-colors text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                              title="Asignar reserva a mí"
                            >
                              {updatingReservation === `assign-${reservation.id}` ? (
                                <FaSpinner className="w-4 h-4 animate-spin" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.57-1.41a7.002 7.002 0 00-13.074.003z" />
                                </svg>
                              )}
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleConfirmReservation(reservation.id, reservation.tipo)}
                            disabled={
                              (reservation.estado && reservation.estado.toLowerCase() === 'confirmada') || 
                              !isAssignedToMe(reservation) ||
                              updatingReservation === `confirm-${reservation.id}`
                            }
                            className={`rounded-full p-1 transition-colors ${
                              (reservation.estado && reservation.estado.toLowerCase() === 'confirmada') || 
                              !isAssignedToMe(reservation)
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
                            }`}
                            title={
                              reservation.estado && reservation.estado.toLowerCase() === 'confirmada'
                                ? "La reserva ya está confirmada"
                                : !isAssignedToMe(reservation)
                                  ? "No tienes permisos para gestionar esta reserva"
                                  : "Confirmar reserva"
                            }
                          >
                            {updatingReservation === `confirm-${reservation.id}` ? (
                              <FaSpinner className="w-4 h-4 animate-spin" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" />
                              </svg>
                            )}
                          </button>
                          
                          <button 
                            onClick={() => handleCancelReservation(reservation.id, reservation.tipo)}
                            disabled={
                              (reservation.estado && reservation.estado.toLowerCase() === 'cancelada') || 
                              !isAssignedToMe(reservation) ||
                              updatingReservation === `cancel-${reservation.id}`
                            }
                            className={`rounded-full p-1 transition-colors ${
                              (reservation.estado && reservation.estado.toLowerCase() === 'cancelada') || 
                              !isAssignedToMe(reservation)
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-orange-600 hover:text-orange-800 hover:bg-orange-100'
                            }`}
                            title={
                              reservation.estado && reservation.estado.toLowerCase() === 'cancelada'
                                ? "La reserva ya está cancelada"
                                : !isAssignedToMe(reservation)
                                  ? "No tienes permisos para gestionar esta reserva"
                                  : "Cancelar reserva"
                            }
                          >
                            {updatingReservation === `cancel-${reservation.id}` ? (
                              <FaSpinner className="w-4 h-4 animate-spin" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                              </svg>
                            )}
                          </button>
                          
                          {reservation.tipo === 'habitacion' && (reservation.reservaEvento || reservation.eventoId) && (
                            <button 
                              onClick={() => handleOpenPriceModal(reservation)}
                              disabled={!isAssignedToMe(reservation) || updatingReservation === `price-${reservation.id}`}
                              className={`rounded-full p-1 transition-colors ${
                                !isAssignedToMe(reservation)
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-purple-600 hover:text-purple-800 hover:bg-purple-100'
                              }`}
                              title={!isAssignedToMe(reservation) ? "Solo quien tiene asignada la reserva puede editar el precio" : "Editar precio de la habitación"}
                            >
                              {updatingReservation === `price-${reservation.id}` ? (
                                <FaSpinner className="w-4 h-4 animate-spin" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
                                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleDeleteReservation(reservation.id, reservation.tipo)}
                            disabled={!isAssignedToMe(reservation) || updatingReservation === `delete-${reservation.id}`}
                            className={`rounded-full p-1 transition-colors ${
                              !isAssignedToMe(reservation)
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                            }`}
                            title={!isAssignedToMe(reservation) ? "Solo quien tiene asignada la reserva puede eliminarla" : "Eliminar reserva"}
                          >
                            {updatingReservation === `delete-${reservation.id}` ? (
                              <FaSpinner className="w-4 h-4 animate-spin" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron reservaciones que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para editar precio */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Editar Precio de Habitación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Precio
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">MXN</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPriceModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdatePrice}
                  disabled={!newPrice || parseFloat(newPrice) < 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-md disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 