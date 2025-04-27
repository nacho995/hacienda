"use client";

import { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import { FaEdit, FaTrash, FaBed, FaUserFriends, FaCalendarAlt, FaSpinner, FaEye, 
         FaSync, FaUserPlus, FaUserMinus, FaUserCheck, FaFilter, FaSort, FaSearch,
         FaTimes, FaChevronDown, FaChevronRight, FaMapMarkerAlt, FaEuroSign, FaArrowUp, FaArrowDown, FaEllipsisV, FaCheck, FaExclamationTriangle, FaUserCircle, FaClock } from 'react-icons/fa';
import { assignEventoReservation, unassignEventoReservation } from '@/services/reservationService';
import { useAuth } from '@/context/AuthContext';
import { useReservation } from '@/context/ReservationContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';
import { useConfirmationModal } from '@/hooks/useConfirmationModal';
import userService from '@/services/userService';

export default function AdminEventRooms() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user, loading: authLoading } = useAuth();
  const { loadAllReservations, eventoReservations } = useReservation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [isAsignando, setIsAsignando] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState('todos');
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [showDropdownFilter, setShowDropdownFilter] = useState(false);
  const [showDropdownSort, setShowDropdownSort] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);

  const { showConfirmation } = useConfirmationModal();

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoadingUsuarios(true);
      const response = await userService.getAllUsers();
      
      if (response?.success && Array.isArray(response.data)) {
        setUsuarios(response.data);
      } else {
        console.warn('Respuesta inesperada o sin éxito al cargar usuarios:', response);
        setUsuarios([]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error.response?.data?.message || error.message);
      setUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    if (authLoading || !isAuthenticated || !isAdmin) return;

    setIsLoading(true);
    setError(null);
    try {
      await loadAllReservations(false); 
      await cargarUsuarios();
      setInitialLoadDone(true);
    } catch (err) {
      console.error("Error en carga inicial (Habitaciones Evento):", err);
      setError("Error cargando datos iniciales.");
      toast.error("Error al cargar datos iniciales.");
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, isAdmin, loadAllReservations, cargarUsuarios]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin && !initialLoadDone) {
      loadInitialData();
    }
  }, [loadInitialData, authLoading, isAuthenticated, isAdmin, initialLoadDone]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (!isLoading) {
         loadAllReservations(false);
      }
    }, 300000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, loadAllReservations]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const handleAsignarHabitacion = async (item, usuarioId) => {
    const eventoOriginalId = item.eventoOriginalId;
    const usuarioSeleccionado = usuarios.find(u => u._id === usuarioId);
    const nombreUsuario = usuarioSeleccionado ? `${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellidos || ''}`.trim() : 'este usuario';

    if (!eventoOriginalId || !usuarioId) {
      toast.error("Faltan datos para asignar el evento.");
      return;
    }

    setIsAsignando(true);
    try {
      const response = await assignEventoReservation(eventoOriginalId, usuarioId);
      if (response && response.success) {
        toast.success(`Evento ${item.tipoEvento || ''} asignado a ${nombreUsuario}`);
        setShowAsignarModal(false);
        setSelectedReserva(null);
        loadAllReservations(false);
      } else {
        throw new Error(response?.message || 'Error al asignar el evento');
      }
    } catch (error) {
      console.error(`Error asignando evento ${eventoOriginalId} a usuario ${usuarioId}:`, error);
      toast.error('Error al asignar evento: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsAsignando(false);
    }
  };

  const handleDesasignarHabitacion = (item) => {
    const eventoOriginalId = item.eventoOriginalId;
    const nombreAsignado = getNombreUsuarioAsignado(item);
    if (!eventoOriginalId || !item.asignadoA) {
      toast.warn("Este evento no está asignado actualmente.");
      return;
    }
    setOpenActionMenu(null);
    showConfirmation({
      title: 'Desasignar Evento',
      message: `¿Estás seguro de que quieres desasignar el evento ${item.tipoEvento || ''} de ${nombreAsignado}?`,
      iconType: 'warning',
      confirmText: 'Sí, desasignar',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const response = await unassignEventoReservation(eventoOriginalId);
          if (response && response.success) {
            toast.success(`Evento ${item.tipoEvento || ''} desasignado correctamente.`);
            loadAllReservations(false);
          } else {
            throw new Error(response?.message || 'Error al desasignar el evento');
          }
        } catch (error) {
          console.error(`Error desasignando evento ${eventoOriginalId}:`, error);
          toast.error('Error al desasignar evento: ' + (error.message || 'Error desconocido'));
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const abrirModalAsignar = (item) => {
    setSelectedReserva(item);
    setShowAsignarModal(true);
  };

  const toggleRoomExpand = (reservaId) => {
    setExpandedRoom(prev => (prev === reservaId ? null : reservaId));
  };

  const getStatusColor = (reserva) => {
    switch (reserva?.estadoReserva?.toLowerCase()) {
      case 'confirmada': return 'bg-blue-100 text-blue-800';
      case 'pagada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800 line-through';
      case 'completada': return 'bg-gray-100 text-gray-500';
      case 'pendiente':
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (reserva) => {
    return reserva?.estadoReserva?.charAt(0).toUpperCase() + reserva?.estadoReserva?.slice(1) || 'Desconocido';
  };

  const getNombreUsuarioAsignado = (reserva) => {
    if (!reserva?.asignadoA) return 'Sin asignar';
    if (loadingUsuarios) return 'Cargando...';
    if (typeof reserva.asignadoA === 'string') {
      const usuarioAsignado = usuarios.find(u => u._id === reserva.asignadoA);
      return usuarioAsignado ? `${usuarioAsignado.nombre} ${usuarioAsignado.apellidos || ''}` : 'Usuario desc.';
    }
    if (typeof reserva.asignadoA === 'object' && reserva.asignadoA !== null) {
      return `${reserva.asignadoA.nombre || ''} ${reserva.asignadoA.apellidos || ''}`.trim() || 'Usuario desc.';
    }
    return 'Sin asignar';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try { return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch (e) { console.error("Error formateando fecha:", fecha, e); return String(fecha); }
  };

  const usuariosFiltroOptions = useMemo(() => {
    const options = [
      { value: 'todos', label: 'Todos los usuarios' },
      { value: 'sinAsignar', label: 'Sin asignar' },
    ];
    const usuariosParaFiltrar = usuarios;
    usuariosParaFiltrar.forEach(u => {
      options.push({
        value: u._id,
        label: `${u.nombre} ${u.apellidos || ''}`.trim() || u.email
      });
    });
    return options;
  }, [usuarios]);

  const filteredAndSortedHabitaciones = useMemo(() => {
    const habitacionesAplanadas = eventoReservations.flatMap(evento => {
      const habitacionesPobladas = evento.serviciosAdicionales?.habitaciones || [];

      let nombreTipoEventoDelPadre = 'Evento';
      if (evento.tipoEventoDetails) {
        nombreTipoEventoDelPadre = evento.tipoEventoDetails.titulo || evento.tipoEventoDetails.nombre || String(evento.tipoEventoDetails._id) || '[Objeto Evento]';
      } else if (evento.tipoEvento) {
         if (typeof evento.tipoEvento === 'object' && evento.tipoEvento !== null) {
           nombreTipoEventoDelPadre = String(evento.tipoEvento._id) || '[Objeto Evento sin ID]';
         } else {
           nombreTipoEventoDelPadre = String(evento.tipoEvento);
         }
      }

      if (habitacionesPobladas.length === 0) {
        return [{
          ...evento,
          habitacionData: null,
          letraHabitacion: '-',
          id: `${evento._id}-no-room`,
          eventoOriginalId: evento._id,
          tipoEvento: nombreTipoEventoDelPadre,
          fechaEntrada: null,
          fechaSalida: null
        }];
      }

      return habitacionesPobladas.map((habRef, habIndex) => {
        const habitacionPoblada = (habRef.reservaHabitacionDetails && typeof habRef.reservaHabitacionDetails === 'object') 
                                  ? habRef.reservaHabitacionDetails 
                                  : null;

        const letraHabitacion = habitacionPoblada?.letraHabitacion || habRef.letraHabitacion || '?';
        const habitacionData = habitacionPoblada;
        const estadoReserva = habitacionPoblada?.estadoReserva || evento.estadoReserva || 'pendiente';
        const fechaEntrada = habitacionPoblada?.fechaEntrada;
        const fechaSalida = habitacionPoblada?.fechaSalida;

        const generatedId = habitacionPoblada?._id ? habitacionPoblada._id.toString()
                           : (typeof habRef.reservaHabitacionId === 'string' ? `${evento._id}-${habRef.reservaHabitacionId}-${habIndex}`
                             : `${evento._id}-${letraHabitacion}-${habIndex}`);

        return {
          ...evento,
          habitacionData: habitacionData,
          letraHabitacion: letraHabitacion,
          id: generatedId,
          eventoOriginalId: evento._id,
          tipoEvento: nombreTipoEventoDelPadre,
          estadoReserva: estadoReserva,
          fechaEntrada: fechaEntrada,
          fechaSalida: fechaSalida,
        };
      });
    });

    let currentList = habitacionesAplanadas.filter(item => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        item.nombreContacto?.toLowerCase().includes(lowerSearch) ||
        item.apellidosContacto?.toLowerCase().includes(lowerSearch) ||
        item.emailContacto?.toLowerCase().includes(lowerSearch) ||
        item.telefonoContacto?.includes(searchTerm) ||
        item.letraHabitacion?.toLowerCase().includes(lowerSearch) ||
        item.tipoEvento?.toLowerCase().includes(lowerSearch) ||
        item.estadoReserva?.toLowerCase().includes(lowerSearch);

      const matchesEstado = filterEstado === 'todos' || item.estadoReserva?.toLowerCase() === filterEstado;

      let matchesUsuario = selectedUsuarioId === 'todos';
      if (selectedUsuarioId === 'sinAsignar') {
        matchesUsuario = !item.asignadoA;
      } else if (selectedUsuarioId !== 'todos') {
        matchesUsuario = typeof item.asignadoA === 'string' ? item.asignadoA === selectedUsuarioId :
                         typeof item.asignadoA === 'object' && item.asignadoA !== null ? item.asignadoA._id === selectedUsuarioId :
                         false;
      }

      const result = matchesSearch && matchesEstado && matchesUsuario;
      return result;
    });

    currentList.sort((a, b) => {
      let valA, valB;

      switch (sortBy) {
        case 'letra':
          valA = a.letraHabitacion;
          valB = b.letraHabitacion;
          break;
        case 'tipoEvento':
          valA = a.tipoEvento;
          valB = b.tipoEvento;
          break;
        case 'nombre':
          valA = `${a.nombreContacto || ''} ${a.apellidosContacto || ''}`.trim().toLowerCase();
          valB = `${b.nombreContacto || ''} ${b.apellidosContacto || ''}`.trim().toLowerCase();
          break;
        case 'fecha':
          valA = new Date(a.fechaEntrada || a.fecha).getTime();
          valB = new Date(b.fechaEntrada || b.fecha).getTime();
          if (isNaN(valA)) valA = sortOrder === 'asc' ? Infinity : -Infinity;
          if (isNaN(valB)) valB = sortOrder === 'asc' ? Infinity : -Infinity;
          break;
        case 'estado':
          valA = a.estadoReserva;
          valB = b.estadoReserva;
          break;
        case 'asignado':
          valA = getNombreUsuarioAsignado(a);
          valB = getNombreUsuarioAsignado(b);
          if (valA === 'Sin asignar') valA = sortOrder === 'asc' ? '' : 'zzzz'; 
          if (valB === 'Sin asignar') valB = sortOrder === 'asc' ? '' : 'zzzz';
          break;
        default:
          return 0;
      }

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }
      return sortOrder === 'desc' ? (comparison * -1) : comparison;
    });

    return currentList;
  }, [eventoReservations, searchTerm, filterEstado, selectedUsuarioId, usuarios, sortBy, sortOrder]);

  const handleRetry = () => {
    loadInitialData();
  };

  const handleSortChange = (campo) => {
    if (sortBy === campo) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(campo);
      setSortOrder('asc');
    }
    setShowDropdownSort(false);
  };
  
  const renderSortIcon = (campo) => {
    if (sortBy !== campo) return null;
    
    return sortOrder === 'asc' ? <FaArrowUp className="ml-1 inline-block w-3 h-3" /> : <FaArrowDown className="ml-1 inline-block w-3 h-3" />;
  };

  const handleConfirmarReserva = (item) => {
    const habitacionId = item.habitacionData?._id;
    const letraHabitacion = item.letraHabitacion || 'esta habitación';
    if (!habitacionId) {
        toast.error('No se encontró ID para esta habitación.');
        console.error('Error: item.habitacionData._id no encontrado en handleConfirmarReserva', item);
        return;
    }
    setOpenActionMenu(null);
    showConfirmation({
      title: `Confirmar Habitación ${letraHabitacion}`,
      message: `¿Estás seguro de que quieres marcar la reserva de la habitación ${letraHabitacion} como confirmada?`,
      iconType: 'confirm',
      confirmText: 'Sí, confirmar habitación',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const url = `/api/reservas/habitaciones/${habitacionId}/estado`; 
          const response = await apiClient.patch(url, { estado: 'confirmada' });
          if (response && response.success === true) {
            toast.success(`Habitación ${letraHabitacion} confirmada`);
            await loadAllReservations(false);
          } else {
            throw new Error(response?.message || 'Error al confirmar la habitación');
          }
        } catch (error) {
          console.error(`Error confirmando habitación ${letraHabitacion} (ID: ${habitacionId}):`, error.response?.data || error.message || error);
          const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
          toast.error('Error al confirmar habitación: ' + errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleCancelarReserva = (item) => {
    const habitacionId = item.habitacionData?._id;
    const letraHabitacion = item.letraHabitacion || 'esta habitación';
    if (!habitacionId) {
        toast.error('No se encontró ID para esta habitación.');
        console.error('Error: item.habitacionData._id no encontrado en handleCancelarReserva', item);
        return;
    }
    setOpenActionMenu(null);
    showConfirmation({
      title: `Cancelar Habitación ${letraHabitacion}`,
      message: `¿Estás seguro de que quieres cancelar la reserva de la habitación ${letraHabitacion}? Esta acción podría ser irreversible.`,
      iconType: 'danger',
      confirmText: 'Sí, cancelar habitación',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const url = `/api/reservas/habitaciones/${habitacionId}/estado`; 
          const response = await apiClient.patch(url, { estado: 'cancelada' });
          if (response && response.success === true) {
            toast.success(`Habitación ${letraHabitacion} cancelada`);
            loadAllReservations(false);
          } else {
            throw new Error(response?.message || 'Error al cancelar la habitación');
          }
        } catch (error) {
          console.error(`Error cancelando habitación ${letraHabitacion} (ID: ${habitacionId}):`, error.response?.data || error.message || error);
          const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
          toast.error('Error al cancelar habitación: ' + errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };
  
  const handleMarcarPendiente = (item) => {
    const habitacionId = item.habitacionData?._id;
    const letraHabitacion = item.letraHabitacion || 'esta habitación';
    if (!habitacionId) {
        toast.error('No se encontró ID para esta habitación.');
        console.error('Error: item.habitacionData._id no encontrado en handleMarcarPendiente', item);
        return;
    }
    setOpenActionMenu(null);
    showConfirmation({
      title: `Marcar Habitación ${letraHabitacion} Pendiente`,
      message: `¿Estás seguro de que quieres marcar la reserva de la habitación ${letraHabitacion} como pendiente?`,
      iconType: 'info',
      confirmText: 'Sí, marcar pendiente',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const url = `/api/reservas/habitaciones/${habitacionId}/estado`; 
          const response = await apiClient.patch(url, { estado: 'pendiente' });
          if (response && response.success === true) {
            toast.success(`Habitación ${letraHabitacion} marcada como pendiente`);
            loadAllReservations(false);
          } else {
            throw new Error(response?.message || 'Error al marcar como pendiente');
          }
        } catch (error) {
          console.error(`Error marcando pendiente habitación ${letraHabitacion} (ID: ${habitacionId}):`, error.response?.data || error.message || error);
          const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
          toast.error('Error al marcar pendiente: ' + errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleEliminarReserva = (item) => {
    const eventoOriginalId = item.eventoOriginalId;
    if (!eventoOriginalId) {
      toast.error('ID de evento inválido para eliminar.');
      return;
    }
    setOpenActionMenu(null);
    showConfirmation({
      title: 'Eliminar Reserva de Evento',
      message: `¿Estás absolutamente seguro de que quieres eliminar la reserva completa del evento ${item.tipoEvento || ''} (${formatearFecha(item.fechaInicio)} - ${formatearFecha(item.fechaFin)})? Esta acción eliminará todas sus habitaciones asociadas y no se puede deshacer.`,
      iconType: 'danger',
      confirmText: 'Sí, eliminar permanentemente',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const url = `/api/reservas/eventos/${eventoOriginalId}`; 
          const response = await apiClient.delete(url);
          if (response && response.success) {
            toast.success(`Evento ${item.tipoEvento || ''} eliminado con éxito`);
            loadAllReservations(false);
          } else {
            throw new Error(response?.message || 'Error al eliminar el evento');
          }
        } catch (error) {
          console.error('Error eliminando reserva de evento:', error.response?.data || error.message || error);
          const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
          toast.error('Error al eliminar evento: ' + errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  if (authLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-purple-600 h-12 w-12" />
      </div>
    );
  }

  if (isLoading && !initialLoadDone) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Gestión de Habitaciones de Eventos</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <FaSpinner className="animate-spin text-purple-600 h-10 w-10 mb-4" />
          <p className="text-gray-600">Cargando reservas de eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
         <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Gestión de Habitaciones de Eventos</h1>
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow p-6 border border-red-200">
          <div className="text-red-500 mb-4">
            <FaBed className="w-12 h-12" />
          </div>
          <p className="text-gray-700 font-semibold mb-2">Error al cargar datos</p>
          <p className="text-gray-600 text-sm mb-4 text-center">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
          >
            <FaSync className="mr-2" />
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const estadosReservaOptions = [
      { value: 'todos', label: 'Todos los estados' },
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'confirmada', label: 'Confirmada' },
      { value: 'pagada', label: 'Pagada' },
      { value: 'cancelada', label: 'Cancelada' },
      { value: 'completada', label: 'Completada' },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Gestión de Habitaciones de Eventos</h1>

      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
          <div className="relative flex-grow w-full md:w-auto">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por contacto, email, tfno, letra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto flex-shrink-0 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center text-sm"
            aria-expanded={showFilters}
          >
            <FaFilter className="mr-2" />
            Filtros
            <FaChevronDown className={`ml-1 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => loadAllReservations(true)}
            disabled={isLoading}
            className="w-full md:w-auto flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
             <FaSync className={`mr-2 ${isLoading && initialLoadDone ? 'animate-spin' : ''}`} />
             {isLoading && initialLoadDone ? 'Recargando...' : 'Recargar'}
          </button>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label htmlFor="filter-estado" className="block text-sm font-medium text-gray-700 mb-1">Estado Reserva</label>
              <button
                 id="filter-estado"
                 onClick={() => setShowDropdownFilter(!showDropdownFilter)}
                 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left flex items-center justify-between shadow-sm text-sm"
                 aria-haspopup="listbox"
                 aria-expanded={showDropdownFilter}
              >
                <span>{estadosReservaOptions.find(o => o.value === filterEstado)?.label || 'Seleccionar'}</span>
                <FaChevronDown className={`text-gray-400 transition-transform ${showDropdownFilter ? 'rotate-180' : ''}`} />
              </button>
              {showDropdownFilter && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 py-1 max-h-60 overflow-y-auto">
                  {estadosReservaOptions.map(option => (
                     <button
                        key={option.value}
                        onClick={() => { setFilterEstado(option.value); setShowDropdownFilter(false); }}
                        className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${filterEstado === option.value ? 'font-semibold bg-gray-50' : ''}`}
                        role="option"
                        aria-selected={filterEstado === option.value}
                     >
                       {option.label}
                     </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="filter-usuario" className="block text-sm font-medium text-gray-700 mb-1">Usuario Asignado</label>
              <select
                 id="filter-usuario"
                 value={selectedUsuarioId}
                 onChange={(e) => setSelectedUsuarioId(e.target.value)}
                 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                {usuariosFiltroOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <button
                id="sort-by"
                onClick={() => setShowDropdownSort(!showDropdownSort)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left flex items-center justify-between shadow-sm text-sm"
                aria-haspopup="listbox"
                aria-expanded={showDropdownSort}
              >
                <span>
                  {sortBy === 'letra' ? 'Letra Hab.' :
                   sortBy === 'fecha' ? 'Fecha Entrada' :
                   sortBy === 'nombre' ? 'Nombre Contacto' :
                   sortBy === 'estado' ? 'Estado Reserva' :
                   sortBy === 'asignado' ? 'Admin Asignado' :
                   sortBy === 'tipoEvento' ? 'Tipo Evento' :
                   'Fecha Entrada'}
                  {renderSortIcon(sortBy)}
                </span>
                 <FaChevronDown className={`text-gray-400 transition-transform ${showDropdownSort ? 'rotate-180' : ''}`} />
              </button>
              {showDropdownSort && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 py-1">
                  {[
                    { value: 'fecha', label: 'Fecha Entrada' },
                    { value: 'letra', label: 'Letra Hab.' },
                    { value: 'tipoEvento', label: 'Tipo Evento' },
                    { value: 'nombre', label: 'Nombre Contacto' },
                    { value: 'estado', label: 'Estado Reserva' },
                    { value: 'asignado', label: 'Admin Asignado' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${sortBy === option.value ? 'font-semibold bg-gray-50' : ''}`}
                      role="option"
                      aria-selected={sortBy === option.value}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.value && renderSortIcon(option.value)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {(searchTerm || filterEstado !== 'todos' || selectedUsuarioId !== 'todos') && showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-start">
             <button
              onClick={() => {
                setSearchTerm('');
                setFilterEstado('todos');
                setSelectedUsuarioId('todos');
              }}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
            >
              <FaTimes className="mr-1" />
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {isLoading && !initialLoadDone ? (
           <div className="text-center py-10 text-gray-500">Cargando...</div>
      ) : filteredAndSortedHabitaciones.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-200">
          <FaBed className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron reservas de eventos</h3>
          <p className="mt-1 text-sm text-gray-500">
             No hay reservas de habitaciones asociadas a eventos que coincidan con los filtros actuales.
          </p>
        </div>
      ) : (
         <RoomTableView
           habitaciones={filteredAndSortedHabitaciones}
           getStatusText={getStatusText}
           getStatusColor={getStatusColor}
           formatearFecha={formatearFecha}
           user={user}
           usuarios={usuarios}
           getNombreUsuarioAsignado={getNombreUsuarioAsignado}
           expandedRoom={expandedRoom}
           toggleRoomExpand={toggleRoomExpand}
           handleSortChange={handleSortChange}
           renderSortIcon={renderSortIcon}
           sortBy={sortBy}
           sortOrder={sortOrder}
           totalReservationsCount={eventoReservations.length}
           loadingUsuarios={loadingUsuarios}
           openActionMenu={openActionMenu}
           setOpenActionMenu={setOpenActionMenu}
           onConfirmarReserva={handleConfirmarReserva}
           onCancelarReserva={handleCancelarReserva}
           onMarcarPendiente={handleMarcarPendiente}
           onEliminarReserva={handleEliminarReserva}
           onAsignarReserva={abrirModalAsignar}
           onDesasignarReserva={handleDesasignarHabitacion}
         />
      )}

      {showAsignarModal && selectedReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl p-5 max-w-lg w-full mx-auto">
             <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                 <h3 className="text-lg font-semibold text-gray-800">
                    Asignar Reserva Evento (Hab. {selectedReserva.letraHabitacion})
                 </h3>
                 <button onClick={() => setShowAsignarModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
             </div>

             {loadingUsuarios ? (
                 <div className="text-center py-4">
                    <FaSpinner className="animate-spin text-purple-600 mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm text-gray-600">Cargando administradores...</p>
                 </div>
             ) : usuarios.length > 0 ? (
                 <>
                    <p className="text-sm text-gray-600 mb-3">Selecciona un administrador para asignar esta reserva:</p>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 -mr-2">
                        {usuarios.filter(u => u.role === 'admin').map(u => (
                            <button
                                key={u._id}
                                onClick={() => handleAsignarHabitacion(selectedReserva, u._id)}
                                disabled={isAsignando}
                                className={`w-full p-3 border rounded-lg text-left flex items-center gap-3 transition duration-150 ${
                                    isAsignando ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-purple-50 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1'
                                }`}
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                                    {u.nombre?.charAt(0).toUpperCase()}{u.apellidos?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-grow">
                                    <span className="block font-medium text-sm text-gray-800">{u.nombre} {u.apellidos || ''}</span>
                                    <span className="block text-xs text-gray-500">{u.email}</span>
                                </div>
                                {isAsignando && <FaSpinner className="animate-spin text-purple-600 ml-auto h-4 w-4"/>}
                            </button>
                        ))}
                    </div>
                 </>
             ) : (
                 <p className="text-sm text-center text-gray-500 py-4">No se encontraron otros administradores.</p>
             )}

             <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end">
                 <button
                    onClick={() => setShowAsignarModal(false)}
                    disabled={isAsignando}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition duration-150 disabled:opacity-50"
                 >
                    Cancelar
                 </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomTableView({
  habitaciones,
  getStatusText,
  getStatusColor,
  formatearFecha,
  user,
  usuarios,
  getNombreUsuarioAsignado,
  expandedRoom,
  toggleRoomExpand,
  handleSortChange,
  renderSortIcon,
  sortBy,
  sortOrder,
  totalReservationsCount,
  loadingUsuarios,
  openActionMenu,
  setOpenActionMenu,
  onConfirmarReserva,
  onCancelarReserva,
  onMarcarPendiente,
  onEliminarReserva,
  onAsignarReserva,
  onDesasignarReserva
}) {
  const handleToggleMenu = (itemId) => {
    setOpenActionMenu(prev => (prev === itemId ? null : itemId));
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow ring-1 ring-black ring-opacity-5">
      <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 w-10"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 <button onClick={() => handleSortChange('letra')} className="flex items-center hover:text-gray-700">
                    Hab. {renderSortIcon('letra')}
                 </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('tipoEvento')} className="flex items-center hover:text-gray-700">
                     Evento {renderSortIcon('tipoEvento')}
                  </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('nombre')} className="flex items-center hover:text-gray-700">
                     Contacto {renderSortIcon('nombre')}
                  </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('fecha')} className="flex items-center hover:text-gray-700">
                     Fechas Habitación {renderSortIcon('fecha')}
                  </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('estado')} className="flex items-center hover:text-gray-700">
                    Estado {renderSortIcon('estado')}
                  </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <button onClick={() => handleSortChange('asignado')} className="flex items-center hover:text-gray-700">
                     Asignado {renderSortIcon('asignado')}
                   </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
          {habitaciones.map((item, index) => {
            try {
                const uniqueKey = item.id;
              const itemId = item.id;
              const isExpanded = expandedRoom === itemId;
              const statusColorClass = getStatusColor(item);
              const statusText = getStatusText(item);
              const letraHabitacion = item.letraHabitacion;
              const nombreAsignado = getNombreUsuarioAsignado(item);
              const estaAsignada = nombreAsignado !== 'Sin asignar' && nombreAsignado !== 'Cargando...';
              const asignadaAlUsuarioActual = estaAsignada && (
                  (typeof item.asignadoA === 'object' && item.asignadoA?._id === user?.id) ||
                  (typeof item.asignadoA === 'string' && item.asignadoA === user?.id)
              );
              const isMenuOpen = openActionMenu === itemId;

              const eventoOriginalId = item.eventoOriginalId;
              const habitacionData = item.habitacionData;
              const habitacionId = habitacionData?._id;

              const detalleUrl = eventoOriginalId ? `/admin/reservaciones/evento/${eventoOriginalId}` : '#';
              const canViewEventDetails = !!eventoOriginalId;

              const hasValidRoomData = !!item.habitacionData?._id;

              const canConfirm = hasValidRoomData && item.estadoReserva === 'pendiente';
              const canCancel = hasValidRoomData && item.estadoReserva !== 'cancelada' && item.estadoReserva !== 'completada';
              const canDelete = true; // Permitir eliminar el evento completo
              const canAssign = true; // Permitir asignar/desasignar el evento
              const canMarkPending = hasValidRoomData && item.estadoReserva !== 'pendiente' && item.estadoReserva !== 'completada';

              return (
                  <Fragment key={uniqueKey}>
                  <tr className={`hover:bg-gray-50 ${isExpanded ? 'bg-purple-50' : ''}`}>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                       <button
                         onClick={() => toggleRoomExpand(itemId)}
                         className={`text-gray-400 hover:text-purple-600 p-1 rounded ${isExpanded ? 'bg-purple-100 text-purple-700' : ''}`}
                         title={isExpanded ? "Ocultar detalles" : "Mostrar detalles"}
                         aria-expanded={isExpanded}
                       >
                         {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                       </button>
                    </td>
                     <td className="px-4 py-3 whitespace-nowrap">
                       <div className="flex items-center">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${statusColorClass.replace('text-', 'bg-').split(' ')[0].replace('bg-opacity-50','')} bg-opacity-20 mr-3 flex-shrink-0 ${statusColorClass.split(' ')[1]}`}>
                            {letraHabitacion}
                         </div>
                       </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-700">
                         {item.tipoEvento || 'Evento'}
                       </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900">{item.nombreContacto} {item.apellidosContacto}</div>
                       <div className="text-xs text-gray-500 truncate max-w-[150px]" title={item.emailContacto}>{item.emailContacto}</div>
                       <div className="text-xs text-gray-500">{item.telefonoContacto}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          <div><span className="font-medium text-gray-500 text-xs">Ent:</span> {formatearFecha(item.fechaEntrada)}</div>
                          <div><span className="font-medium text-gray-500 text-xs">Sal:</span> {formatearFecha(item.fechaSalida)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}>
                         {statusText}
                       </span>
                    </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                         {nombreAsignado}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                       <div className="relative inline-block text-left">
                          <button
                             onClick={() => handleToggleMenu(itemId)}
                             type="button"
                             className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-purple-500"
                             id={`menu-button-${itemId}`}
                             aria-expanded={isMenuOpen}
                             aria-haspopup="true"
                          >
                             <FaEllipsisV className="h-4 w-4" aria-hidden="true" />
                          </button>

                         {isMenuOpen && (
                           <div
                              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 focus:outline-none"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby={`menu-button-${itemId}`}
                              tabIndex="-1"
                           >
                             <div className="py-1" role="none">
                                {canViewEventDetails ? (
                                    // Usamos Link de Next.js para la navegación (sin legacyBehavior)
                                    <Link
                                        href={detalleUrl}
                                        role="menuitem" // Mover props al Link
                                        tabIndex="-1"
                                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 w-full text-left flex items-center"
                                        onClick={() => setOpenActionMenu(null)} // Mover onClick al Link
                                        passHref={false} // Ya no es necesario con App Router
                                    >
                                        {/* El contenido va directamente dentro de Link */}
                                        <FaEye className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                                        Ver Detalles de Evento
                                    </Link>
                                ) : (
                                    <span className="text-gray-400 block px-4 py-2 text-sm w-full text-left flex items-center cursor-not-allowed">
                                        <FaEye className="mr-3 h-4 w-4" aria-hidden="true" />
                                            Ver Detalles de Evento
                                    </span>
                                )}
                                <div className="border-t border-gray-100 my-1"></div>
                                {canConfirm ? (
                                    <button
                                        onClick={() => { onConfirmarReserva(item); setOpenActionMenu(null); }}
                                        className="text-green-700 block px-4 py-2 text-sm hover:bg-green-50 hover:text-green-900 w-full text-left flex items-center"
                                        role="menuitem"
                                        tabIndex="-1"
                                    >
                                        <FaCheck className="mr-3 h-4 w-4" aria-hidden="true" />
                                            Confirmar Reserva Hab.
                                    </button>
                                ) : (
                                    <span className="text-gray-400 block px-4 py-2 text-sm w-full text-left flex items-center cursor-not-allowed">
                                        <FaCheck className="mr-3 h-4 w-4" aria-hidden="true" />
                                            Confirmar Reserva Hab.
                                    </span>
                                )}
                                {canMarkPending ? (
                                    <button
                                        onClick={() => { onMarcarPendiente(item); setOpenActionMenu(null); }}
                                        className="text-yellow-700 block px-4 py-2 text-sm hover:bg-yellow-50 hover:text-yellow-900 w-full text-left flex items-center"
                                        role="menuitem"
                                        tabIndex="-1"
                                    >
                                        <FaClock className="mr-3 h-4 w-4" aria-hidden="true" />
                                            Marcar Pendiente Hab.
                                    </button>
                                ) : (
                                    <span className="text-gray-400 block px-4 py-2 text-sm w-full text-left flex items-center cursor-not-allowed">
                                        <FaClock className="mr-3 h-4 w-4" aria-hidden="true" />
                                            Marcar Pendiente Hab.
                                    </span>
                                )}
                                {canCancel ? (
                                    <button
                                        onClick={() => { onCancelarReserva(item); setOpenActionMenu(null); }}
                                        className="text-red-700 block px-4 py-2 text-sm hover:bg-red-50 hover:text-red-900 w-full text-left flex items-center"
                                        role="menuitem"
                                        tabIndex="-1"
                                    >
                                        <FaExclamationTriangle className="mr-3 h-4 w-4" aria-hidden="true" />
                                            Cancelar Reserva Hab.
                                    </button>
                                ) : (
                                    <span className="text-gray-400 block px-4 py-2 text-sm w-full text-left flex items-center cursor-not-allowed">
                                        <FaExclamationTriangle className="mr-3 h-4 w-4" aria-hidden="true" />
                                            Cancelar Reserva Hab.
                                    </span>
                                )}

                                {canAssign && (
                                   <>
                                     <div className="border-t border-gray-100 my-1"></div>
                                     {estaAsignada ? (
                                         <button
                                             onClick={() => { onDesasignarReserva(item); setOpenActionMenu(null); }}
                                             className="block px-4 py-2 text-sm w-full text-left flex items-center text-orange-700 hover:bg-orange-50"
                                             role="menuitem"
                                             tabIndex="-1"
                                         >
                                             <FaUserMinus className="mr-3 h-4 w-4" aria-hidden="true" />
                                             Desasignar Evento
                                         </button>
                                     ) : (
                                         <button
                                             onClick={() => { onAsignarReserva(item); setOpenActionMenu(null); }}
                                             className="text-blue-700 block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-900 w-full text-left flex items-center"
                                             role="menuitem"
                                             tabIndex="-1"
                                         >
                                             <FaUserPlus className="mr-3 h-4 w-4" aria-hidden="true" />
                                             Asignar Evento a...
                                         </button>
                                     )}
                                   </>
                                )}
                                <div className="border-t border-gray-100 my-1"></div>
                                {canDelete && (
                                    <button
                                        onClick={() => { onEliminarReserva(item); setOpenActionMenu(null); }}
                                        className="text-red-700 block px-4 py-2 text-sm hover:bg-red-50 hover:text-red-900 w-full text-left flex items-center"
                                        role="menuitem"
                                        tabIndex="-1"
                                    >
                                        <FaTrash className="mr-3 h-4 w-4" aria-hidden="true" />
                                            Eliminar Evento Completo
                                    </button>
                                )}
                             </div>
                           </div>
                         )}
                       </div>
                    </td>
                  </tr>
                </Fragment>
              );
            } catch (error) {
                console.error(`Error al procesar item ${index + 1}:`, error);
                // Renderizar una fila de error o simplemente devolver null para omitirla
                return (
                    <tr key={`error-${index}`}>
                        <td colSpan={8} className="px-4 py-3 text-center text-red-600 text-sm">
                            Error al renderizar esta fila. Detalles en la consola.
                        </td>
                    </tr>
                );
            }
            })}
          </tbody>
        </table>
    </div>
  );
} 