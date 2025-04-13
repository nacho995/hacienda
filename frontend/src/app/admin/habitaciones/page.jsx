"use client";

import { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import { FaEdit, FaTrash, FaBed, FaUserFriends, FaCalendarAlt, FaSpinner, FaEye, 
         FaSync, FaUserPlus, FaUserMinus, FaUserCheck, FaFilter, FaSort, FaSearch,
         FaTimes, FaChevronDown, FaChevronRight, FaMapMarkerAlt, FaEuroSign, FaArrowUp, FaArrowDown, FaEllipsisV, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { assignHabitacionReservation, unassignHabitacionReservation } from '@/services/reservationService';
import { useAuth } from '@/context/AuthContext';
import { useReservation } from '@/context/ReservationContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';
import { useConfirmationModal } from '@/hooks/useConfirmationModal';

export default function AdminEventRooms() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user, loading: authLoading } = useAuth();
  const { loadAllReservations, habitacionReservations } = useReservation();
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
  const [selectedPiso, setSelectedPiso] = useState('todos');
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [showDropdownFilter, setShowDropdownFilter] = useState(false);
  const [showDropdownSort, setShowDropdownSort] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);

  const { showConfirmation } = useConfirmationModal();

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoadingUsuarios(true);
      const response = await apiClient.get('/users');
      
      if (response && response.data && Array.isArray(response.data)) {
        setUsuarios(response.data);
      } else {
        // console.log('No se recibieron datos válidos de usuarios o la API no está disponible');
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

  const handleAsignarHabitacion = async (reservaId, usuarioId) => {
    try {
      setIsAsignando(true);
      if (!reservaId || !usuarioId) {
        toast.error('Datos incompletos para la asignación.'); return;
      }
      const response = await assignHabitacionReservation(reservaId, usuarioId);
      if (response.success) {
        toast.success('Reserva de evento asignada correctamente');
        loadAllReservations(false);
      } else {
        toast.error(response.message || 'Error al asignar la reserva del evento');
      }
    } catch (error) {
      console.error('Error asignando reserva de evento:', error);
      toast.error('No se pudo asignar la reserva del evento');
    } finally {
      setIsAsignando(false);
      setShowAsignarModal(false);
      setOpenActionMenu(null);
    }
  };

  const handleDesasignarHabitacion = (reservaId) => {
    setOpenActionMenu(null); // Cerrar menú antes de mostrar modal
    showConfirmation({
      title: 'Desasignar Habitación de Evento',
      message: '¿Estás seguro de que quieres desasignar esta habitación del evento? El usuario asignado dejará de estar asociado.',
      iconType: 'warning',
      confirmText: 'Sí, desasignar',
      onConfirm: async () => {
        // La lógica original de desasignar va aquí
        setIsAsignando(true); 
        try {
          const response = await unassignHabitacionReservation(reservaId);
          if (response.success) {
            toast.success('Habitación desasignada del evento');
            loadAllReservations(false);
          } else {
            toast.error(response.message || 'Error al desasignar la habitación del evento');
          }
        } catch (error) {
          console.error('[handleDesasignar HabitaciónEvento] Error en catch:', error);
          toast.error('No se pudo desasignar la habitación del evento');
        } finally {
          setIsAsignando(false); 
        }
      }
    });
  };

  const abrirModalAsignar = (reservaHabitacion) => {
    setSelectedReserva(reservaHabitacion);
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

  const getLetraHabitacion = (reserva) => {
    // 1. Priorizar letraHabitacion si existe
    if (reserva?.letraHabitacion) {
      return reserva.letraHabitacion;
    }

    // 2. Comprobar el campo 'habitacion' - solo si parece una letra
    if (reserva?.habitacion && typeof reserva.habitacion === 'string') {
        // Verificar si es una sola letra mayúscula (o minúscula)
        if (reserva.habitacion.length === 1 && /^[A-Z]$/i.test(reserva.habitacion)) {
            return reserva.habitacion.toUpperCase();
        }
        // Podría ser un ID o un nombre más largo, lo ignoramos por ahora
    }

    // 3. Intentar con el campo 'letra' (si existe en algún caso)
    if (reserva?.letra) {
      return reserva.letra;
    }
    
    // 4. Intentar obtener de un objeto habitacion populado (caso menos probable aquí)
    if (reserva?.habitacion && typeof reserva.habitacion === 'object' && reserva.habitacion !== null) {
      if (reserva.habitacion.letra) {
        return reserva.habitacion.letra;
      }
    }

    // 5. Fallback final
    console.warn('[getLetraHabitacion] No se pudo determinar la letra para la reserva:', reserva);
    return '?';
  };

  const pisosDisponibles = useMemo(() => {
    const pisos = [...new Set(habitacionReservations
      .filter(r => r.tipoReserva === 'evento')
      .map(r => {
        const letra = getLetraHabitacion(r);
        if (!letra || letra === '?') return null;
        return (['A', 'B', 'C', 'D', 'E', 'F'].includes(letra.toUpperCase())) ? 'baja' : 'alta';
      })
      .filter(p => p !== null)
    )];
    pisos.sort((a, b) => a === 'baja' ? -1 : (b === 'baja' ? 1 : 0));
    return ['todos', ...pisos];
  }, [habitacionReservations]);

  const filteredAndSortedReservations = useMemo(() => {
    let currentList = habitacionReservations.filter(r => r.tipoReserva === 'evento'); 

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      currentList = currentList.filter(r =>
        r.nombreContacto?.toLowerCase().includes(lowerSearch) ||
        r.apellidosContacto?.toLowerCase().includes(lowerSearch) ||
        r.emailContacto?.toLowerCase().includes(lowerSearch) ||
        r.telefonoContacto?.includes(lowerSearch) ||
        getLetraHabitacion(r)?.toLowerCase().includes(lowerSearch) ||
        getNombreUsuarioAsignado(r)?.toLowerCase().includes(lowerSearch)
      );
    }

    if (filterEstado !== 'todos') {
      currentList = currentList.filter(r => r.estadoReserva === filterEstado);
    }
    
    if (selectedPiso !== 'todos') {
      currentList = currentList.filter(r => {
        const letra = getLetraHabitacion(r);
        if (!letra) return false;
        const piso = (['A', 'B', 'C', 'D', 'E', 'F'].includes(letra.toUpperCase())) ? 'baja' : 'alta';
        return piso === selectedPiso;
      });
    }

    currentList.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'letra':
          valA = getLetraHabitacion(a) || '';
          valB = getLetraHabitacion(b) || '';
          break;
        case 'fecha':
          valA = a.fechaEntrada || a.fecha ? new Date(a.fechaEntrada || a.fecha).getTime() : 0;
          valB = b.fechaEntrada || b.fecha ? new Date(b.fechaEntrada || b.fecha).getTime() : 0;
          break;
        case 'nombre':
          valA = `${a.nombreContacto || ''} ${a.apellidosContacto || ''}`.trim().toLowerCase();
          valB = `${b.nombreContacto || ''} ${b.apellidosContacto || ''}`.trim().toLowerCase();
          break;
        case 'estado':
          valA = a.estadoReserva || '';
          valB = b.estadoReserva || '';
          break;
        case 'asignado':
           valA = getNombreUsuarioAsignado(a)?.toLowerCase() || '';
           valB = getNombreUsuarioAsignado(b)?.toLowerCase() || '';
           break;
        default:
          valA = a.fechaEntrada || a.fecha ? new Date(a.fechaEntrada || a.fecha).getTime() : 0;
          valB = b.fechaEntrada || b.fecha ? new Date(b.fechaEntrada || b.fecha).getTime() : 0;
          if (valA < valB) return sortOrder === 'asc' ? 1 : -1;
          if (valA > valB) return sortOrder === 'asc' ? -1 : 1;
          return 0;
      }
      if (valA < valB || valA === undefined || valA === null || valA === '') return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB || valB === undefined || valB === null || valB === '') return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return currentList;
  }, [habitacionReservations, searchTerm, filterEstado, selectedPiso, sortBy, sortOrder, usuarios, loadingUsuarios]);

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

  const handleConfirmarReserva = (reservaId) => {
    if (!reservaId) return;
    setOpenActionMenu(null); // Cerrar menú antes de mostrar modal
    showConfirmation({
      title: 'Confirmar Reserva',
      message: '¿Estás seguro de que quieres marcar esta reserva como confirmada?',
      iconType: 'confirm',
      confirmText: 'Sí, confirmar',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const url = `/reservas/habitaciones/${reservaId}/estado`;
          const response = await apiClient.patch(url, { estado: 'confirmada' });
          if (response && response.success === true) {
            toast.success('Reserva confirmada correctamente');
            loadAllReservations(false);
          } else {
            throw new Error(response?.message || 'Error al confirmar la reserva');
          }
        } catch (error) {
          console.error('Error confirmando reserva (evento):', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          toast.error('Error al confirmar reserva: ' + errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleCancelarReserva = (reservaId) => {
    if (!reservaId) return;
    setOpenActionMenu(null);
    showConfirmation({
      title: 'Cancelar Reserva',
      message: '¿Estás seguro de que quieres cancelar esta reserva? Esta acción podría ser irreversible.',
      iconType: 'danger',
      confirmText: 'Sí, cancelar reserva',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const url = `/reservas/habitaciones/${reservaId}/estado`;
          const response = await apiClient.patch(url, { estado: 'cancelada' });
          if (response && response.success === true) {
            toast.success('Reserva cancelada correctamente');
            loadAllReservations(false);
          } else {
            throw new Error(response?.message || 'Error al cancelar la reserva');
          }
        } catch (error) {
          console.error('Error cancelando reserva (evento):', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          toast.error('Error al cancelar reserva: ' + errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };
  
  const handleMarcarPendiente = (reservaId) => {
    if (!reservaId) return;
    setOpenActionMenu(null);
    showConfirmation({
      title: 'Marcar como Pendiente',
      message: '¿Estás seguro de que quieres marcar esta reserva como pendiente?',
      iconType: 'info',
      confirmText: 'Sí, marcar pendiente',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const url = `/reservas/habitaciones/${reservaId}/estado`;
          const response = await apiClient.patch(url, { estado: 'pendiente' });
          if (response && response.success === true) {
            toast.success('Reserva marcada como pendiente');
            loadAllReservations(false);
          } else {
            throw new Error(response?.message || 'Error al marcar como pendiente');
          }
        } catch (error) {
          console.error('Error marcando pendiente reserva (evento):', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          toast.error('Error al marcar pendiente: ' + errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleEliminarReserva = (reservaId) => {
    if (!reservaId) {
      toast.error('ID inválido para eliminar.');
      return;
    }
    setOpenActionMenu(null);
    showConfirmation({
      title: 'Eliminar Reserva',
      message: '¿Estás absolutamente seguro de que quieres eliminar esta reserva de habitación? Esta acción no se puede deshacer.',
      iconType: 'danger',
      confirmText: 'Sí, eliminar permanentemente',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const url = `/reservas/habitaciones/${reservaId}`;
          const response = await apiClient.delete(url);
          if (response && response.success) {
            toast.success('Reserva eliminada con éxito');
            loadAllReservations(false);
          } else {
            // Si el delete falla pero devuelve un mensaje (ej. por estar asociada a evento)
            if (response?.message) {
              toast.error(response.message);
            } else {
              throw new Error(response?.message || 'Error al eliminar');
            }
          }
        } catch (error) {
          console.error('Error eliminando reserva (evento):', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          toast.error('Error al eliminar: ' + errorMessage);
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
              <label htmlFor="filter-piso" className="block text-sm font-medium text-gray-700 mb-1">Piso</label>
              <select
                 id="filter-piso"
                 value={selectedPiso}
                 onChange={(e) => setSelectedPiso(e.target.value)}
                 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                {pisosDisponibles.map(piso => (
                  <option key={piso} value={piso}>
                    {piso === 'todos' ? 'Todos los pisos' : (piso === 'baja' ? 'Planta Baja' : 'Planta Alta')}
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
                   sortBy === 'asignado' ? 'Admin Asignado' : 'Fecha Entrada'}
                  {renderSortIcon(sortBy)}
                </span>
                 <FaChevronDown className={`text-gray-400 transition-transform ${showDropdownSort ? 'rotate-180' : ''}`} />
              </button>
              {showDropdownSort && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 py-1">
                  {[
                    { value: 'fecha', label: 'Fecha Entrada' },
                    { value: 'letra', label: 'Letra Hab.' },
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

        {(searchTerm || filterEstado !== 'todos' || selectedPiso !== 'todos') && showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-start">
             <button
              onClick={() => {
                setSearchTerm('');
                setFilterEstado('todos');
                setSelectedPiso('todos');
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
      ) : filteredAndSortedReservations.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-200">
          <FaBed className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron reservas de eventos</h3>
          <p className="mt-1 text-sm text-gray-500">
             No hay reservas de habitaciones asociadas a eventos que coincidan con los filtros actuales.
          </p>
        </div>
      ) : (
         <RoomTableView
           habitaciones={filteredAndSortedReservations}
           getStatusText={getStatusText}
           getStatusColor={getStatusColor}
           getLetraHabitacion={getLetraHabitacion}
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
           totalReservationsCount={habitacionReservations.length}
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
                    Asignar Reserva Evento (Hab. {getLetraHabitacion(selectedReserva)})
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
                                onClick={() => handleAsignarHabitacion(selectedReserva._id, u._id)}
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
  getLetraHabitacion,
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
  const handleToggleMenu = (reservaId) => {
    setOpenActionMenu(prev => (prev === reservaId ? null : reservaId));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 w-10"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 <button onClick={() => handleSortChange('letra')} className="flex items-center hover:text-gray-700">
                    Hab. {renderSortIcon('letra')}
                 </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('nombre')} className="flex items-center hover:text-gray-700">
                     Contacto {renderSortIcon('nombre')}
                  </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('fecha')} className="flex items-center hover:text-gray-700">
                     Fechas {renderSortIcon('fecha')}
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
            {habitaciones.map((reserva) => {
              const reservaId = reserva._id;
              const isExpanded = expandedRoom === reservaId;
              const statusColorClass = getStatusColor(reserva);
              const statusText = getStatusText(reserva);
              const letraHabitacion = getLetraHabitacion(reserva);
              const nombreAsignado = getNombreUsuarioAsignado(reserva);
              const estaAsignada = nombreAsignado !== 'Sin asignar' && nombreAsignado !== 'Cargando...';
              const asignadaAlUsuarioActual = estaAsignada && (
                  (typeof reserva.asignadoA === 'object' && reserva.asignadoA?._id === user?.id) ||
                  (typeof reserva.asignadoA === 'string' && reserva.asignadoA === user?.id)
              );
              const isMenuOpen = openActionMenu === reservaId;
              const canPerformCriticalActions = asignadaAlUsuarioActual || !estaAsignada;

              // Datos para el log
              const reservaIdForLog = reserva._id || reserva.id || 'ID_DESCONOCIDO';
              // console.log(`[Render HabitaciónEvento] Reserva ${reservaIdForLog}: asignadoA =`, reserva.asignadoA);

              const eventoId = reserva.eventoId?._id || reserva.eventoId || (typeof reserva.reservaEvento === 'object' ? reserva.reservaEvento?._id : reserva.reservaEvento);
              const detalleUrl = eventoId ? `/admin/reservaciones/evento/${eventoId}` : '#';
              const canViewDetails = eventoId;
              const canConfirm = reserva.estadoReserva !== 'confirmada' && reserva.estadoReserva !== 'completada';
              const canCancel = reserva.estadoReserva !== 'cancelada' && reserva.estadoReserva !== 'completada';
              const canDelete = true;
              const canAssign = reserva.estadoReserva !== 'cancelada';
              const canMarkPending = reserva.estadoReserva !== 'pendiente' && reserva.estadoReserva !== 'completada';

              return (
                <Fragment key={reservaId}>
                  <tr className={`hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                       <button
                         onClick={() => toggleRoomExpand(reservaId)}
                         className={`text-gray-400 hover:text-purple-600 p-1 rounded ${isExpanded ? 'bg-purple-100 text-purple-700' : ''}`}
                         title={isExpanded ? "Ocultar detalles" : "Mostrar detalles"}
                         aria-expanded={isExpanded}
                       >
                         {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                       </button>
                    </td>
                     <td className="px-4 py-3 whitespace-nowrap">
                       <div className="flex items-center">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColorClass.replace('text-', 'bg-').split(' ')[0].replace('bg-opacity-50','')} bg-opacity-20 mr-3 flex-shrink-0`}>
                            <span className={`font-bold text-sm ${statusColorClass.split(' ')[1]}`}>{letraHabitacion}</span>
                         </div>
                       </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900">{reserva.nombreContacto} {reserva.apellidosContacto}</div>
                       <div className="text-xs text-gray-500">{reserva.emailContacto}</div>
                       <div className="text-xs text-gray-500">{reserva.telefonoContacto}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <div>Ent: {formatearFecha(reserva.fechaEntrada)}</div>
                        <div>Sal: {formatearFecha(reserva.fechaSalida)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}>
                         {statusText}
                       </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <span className={`${!estaAsignada ? 'italic text-gray-400' : ''}`}>
                           {nombreAsignado}
                        </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                       <div className="relative inline-block text-left">
                          <button
                             onClick={() => handleToggleMenu(reservaId)}
                             type="button"
                             className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-purple-500"
                             id={`menu-button-${reservaId}`}
                             aria-expanded={isMenuOpen}
                             aria-haspopup="true"
                          >
                             <FaEllipsisV className="h-4 w-4" aria-hidden="true" />
                          </button>

                         {isMenuOpen && (
                           <div
                              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 focus:outline-none"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby={`menu-button-${reservaId}`}
                              tabIndex="-1"
                           >
                             <div className="py-1" role="none">
                                {canViewDetails && (
                                    <Link 
                                        href={detalleUrl} 
                                        role="menuitem" 
                                        tabIndex="-1" 
                                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 w-full text-left flex items-center"
                                        onClick={() => setOpenActionMenu(null)}
                                    >
                                        <FaEye className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                                        Ver Detalles
                                    </Link>
                                )}
                                {canConfirm && (
                                    <button
                                        onClick={() => onConfirmarReserva(reservaId)}
                                        className="text-green-700 block px-4 py-2 text-sm hover:bg-green-50 hover:text-green-900 w-full text-left flex items-center"
                                        role="menuitem"
                                        tabIndex="-1"
                                    >
                                        <FaCheck className="mr-3 h-4 w-4" aria-hidden="true" />
                                        Confirmar
                                    </button>
                                )}
                                {canCancel && (
                                    <button
                                        onClick={() => onCancelarReserva(reservaId)}
                                        className="text-red-700 block px-4 py-2 text-sm hover:bg-red-50 hover:text-red-900 w-full text-left flex items-center"
                                        role="menuitem"
                                        tabIndex="-1"
                                    >
                                        <FaTimes className="mr-3 h-4 w-4" aria-hidden="true" />
                                        Cancelar
                                    </button>
                                )}
                                {canDelete && (
                                    <button
                                        onClick={() => onEliminarReserva(reservaId)}
                                        className="text-red-700 block px-4 py-2 text-sm hover:bg-red-50 hover:text-red-900 w-full text-left flex items-center"
                                        role="menuitem"
                                        tabIndex="-1"
                                    >
                                         <FaTrash className="mr-3 h-4 w-4" aria-hidden="true" />
                                         Eliminar
                                    </button>
                                )}
                                {canMarkPending && (
                                     <button
                                         onClick={() => {
                                             onMarcarPendiente(reservaId);
                                         }}
                                         className="text-yellow-700 block px-4 py-2 text-sm hover:bg-yellow-50 hover:text-yellow-900 w-full text-left flex items-center"
                                         role="menuitem"
                                         tabIndex="-1"
                                     >
                                          <FaExclamationTriangle className="mr-3 h-4 w-4" aria-hidden="true" />
                                          Marcar Pendiente
                                     </button>
                                )}
                                <div className="border-t border-gray-100 my-1"></div>
                                {canAssign && (
                                    <>
                                        {!estaAsignada ? (
                                            <button
                                                onClick={() => { onAsignarReserva(reserva); setOpenActionMenu(null); }}
                                                disabled={loadingUsuarios}
                                                className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 w-full text-left flex items-center disabled:opacity-50"
                                                role="menuitem"
                                                tabIndex="-1"
                                            >
                                                 <FaUserPlus className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                                                 Asignar Admin
                                            </button>
                                        ) : asignadaAlUsuarioActual ? (
                                            <button
                                                onClick={() => { onDesasignarReserva(reservaId); setOpenActionMenu(null); }}
                                                className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 w-full text-left flex items-center"
                                                role="menuitem"
                                                tabIndex="-1"
                                            >
                                                <FaUserMinus className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                                                Desasignarme
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => { onAsignarReserva(reserva); setOpenActionMenu(null); }}
                                                disabled={loadingUsuarios}
                                                className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 w-full text-left flex items-center disabled:opacity-50"
                                                role="menuitem"
                                                tabIndex="-1"
                                            >
                                                <FaUserCheck className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                                                Reasignar Admin
                                            </button>
                                        )}
                                    </>
                                )}
                             </div>
                           </div>
                         )}
                       </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-white border-l-4 border-purple-200">
                      <td colSpan="7" className="px-4 py-3">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 text-xs p-2">
                            <div>
                               <h4 className="font-semibold text-gray-600 mb-1">Detalles Contacto</h4>
                               <p><span className="text-gray-500">Nombre:</span> {reserva.nombreContacto} {reserva.apellidosContacto}</p>
                               <p><span className="text-gray-500">Email:</span> {reserva.emailContacto || 'N/A'}</p>
                               <p><span className="text-gray-500">Teléfono:</span> {reserva.telefonoContacto || 'N/A'}</p>
                               {reserva.dniContacto && <p><span className="text-gray-500">DNI:</span> {reserva.dniContacto}</p>}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-600 mb-1">Detalles Reserva</h4>
                                <p><span className="text-gray-500">ID Reserva:</span> <span className="font-mono text-[11px]">{reserva._id}</span></p>
                                <p><span className="text-gray-500">Tipo:</span> {reserva.tipoReserva}</p>
                                <p><span className="text-gray-500">Estado:</span> {reserva.estadoReserva}</p>
                                <p><span className="text-gray-500">Fecha Creación:</span> {formatearFecha(reserva.createdAt)}</p>
                                <p><span className="text-gray-500">Num Huéspedes:</span> {reserva.numHuespedes || 'N/A'}</p>
                                {typeof reserva.precioTotal === 'number' && <p><span className="text-gray-500">Precio:</span> {reserva.precioTotal.toFixed(2)} €</p>}
                            </div>
                            {eventoId && reserva.eventoId && (
                                <div>
                                     <h4 className="font-semibold text-gray-600 mb-1">Evento Asociado</h4>
                                     <p><span className="text-gray-500">ID Evento:</span> <span className="font-mono text-[11px]">{eventoId}</span></p>
                                     {typeof reserva.eventoId === 'object' && reserva.eventoId !== null ? (
                                         <>
                                             <p><span className="text-gray-500">Nombre Evento:</span> {reserva.eventoId.nombreEvento || 'N/A'}</p>
                                             <p><span className="text-gray-500">Fecha Evento:</span> {formatearFecha(reserva.eventoId.fechaEvento)}</p>
                                             <p><span className="text-gray-500">Tipo Evento:</span> {reserva.eventoId.tipoEvento || 'N/A'}</p>
                                             <Link href={`/admin/reservaciones/evento/${eventoId}`} legacyBehavior>
                                                 <a className="text-blue-600 hover:underline text-xs mt-1 inline-block">Ver detalles del evento &rarr;</a>
                                             </Link>
                                         </>
                                     ) : (
                                          <Link href={`/admin/reservaciones/evento/${eventoId}`} legacyBehavior>
                                              <a className="text-blue-600 hover:underline text-xs mt-1 inline-block">Ver detalles del evento &rarr;</a>
                                          </Link>
                                     )}
                                </div>
                            )}
                         </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
       <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Mostrando {habitaciones.length} reservas de eventos
            {totalReservationsCount > habitaciones.length && ` (filtradas de ${totalReservationsCount} total)`}
        </div>
    </div>
  );
} 