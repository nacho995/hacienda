"use client";

import { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import { FaEdit, FaTrash, FaBed, FaUserFriends, FaCalendarAlt, FaSpinner, FaEye, 
         FaSync, FaUserPlus, FaUserMinus, FaUserCheck, FaFilter, FaSort, FaSearch,
         FaTimes, FaChevronDown, FaChevronRight, FaMapMarkerAlt, FaEuroSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { obtenerHabitacionesConReservas } from '@/services/habitaciones.service';
import { assignHabitacionReservation, unassignHabitacionReservation } from '@/services/reservationService';
import { useAuth } from '@/context/AuthContext';
import { useReservation } from '@/context/ReservationContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';

export default function AdminRooms() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user, loading: authLoading } = useAuth();
  const { loadAllReservations } = useReservation();
  const [habitaciones, setHabitaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [selectedHabitacion, setSelectedHabitacion] = useState(null);
  const [isAsignando, setIsAsignando] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [sortBy, setSortBy] = useState('letra');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('grid'); // grid o tabla
  const [selectedPiso, setSelectedPiso] = useState('todos');
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [showDropdownFilter, setShowDropdownFilter] = useState(false);
  const [showDropdownSort, setShowDropdownSort] = useState(false);

  // Cargar usuarios para asignación
  const cargarUsuarios = useCallback(async () => {
    try {
      setLoadingUsuarios(true);
      // Usar apiClient para la petición
      const response = await apiClient.get('/users');
      
      if (response && response.data && Array.isArray(response.data)) {
        setUsuarios(response.data);
      } else {
        console.log('No se recibieron datos válidos de usuarios o la API no está disponible');
        setUsuarios([]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error.response?.data?.message || error.message);
      // No mostrar toast para no molestar al usuario
      setUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
    }
  }, []);

  // Cargar habitaciones y sus reservas
  const fetchRooms = useCallback(async () => {
    if (authLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Primero, cargar todas las reservas al contexto
      await loadAllReservations(false);
      
      // Luego, obtener las habitaciones con sus reservas
      const habitacionesConReservas = await obtenerHabitacionesConReservas();
      
      // --- DEBUG: Log detallado de cada habitación recibida ---
      if (Array.isArray(habitacionesConReservas)) {
        // Log para verificar los datos ANTES de setear el estado
        console.log('[Habitaciones Page] Datos recibidos del servicio:', JSON.stringify(habitacionesConReservas.map(h => ({id: h._id || h.id, letra: h.letra, nombre: h.nombre, disponible: h.disponible, estado: h.estado, reservas: h.reservas?.length})), null, 2));
        setHabitaciones(habitacionesConReservas);
      } else {
        console.warn('[Habitaciones Page] La respuesta de obtenerHabitacionesConReservas no es un array:', habitacionesConReservas);
      }
      
      if (Array.isArray(habitacionesConReservas)) {
        setHabitaciones(habitacionesConReservas);
      } else {
        console.error('Formato de respuesta inválido para habitaciones:', habitacionesConReservas);
        setError('Formato de respuesta inválido al cargar habitaciones');
        toast.error('Error al procesar los datos de habitaciones');
      }
    } catch (error) {
      console.error('Error al cargar habitaciones:', error);
      setError(error.message || 'No se pudieron cargar las habitaciones y sus reservas');
      toast.error('Error al cargar las habitaciones');
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  }, [authLoading, loadAllReservations]);

  // Efectos para cargar datos, actualización automática y redireccionamiento
  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin && !initialLoadDone) {
      fetchRooms();
      cargarUsuarios();
    }
  }, [fetchRooms, cargarUsuarios, authLoading, isAuthenticated, isAdmin, initialLoadDone]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (!isLoading) {
        fetchRooms();
      }
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, fetchRooms]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const handleAsignarHabitacion = async (habitacionId, usuarioId) => {
    try {
      setIsAsignando(true);
      
      if (!habitacionId || !usuarioId) {
        toast.error('Datos incompletos para la asignación');
        return;
      }
      
      const response = await assignHabitacionReservation(habitacionId, usuarioId);
      
      if (response.success) {
        toast.success('Habitación asignada correctamente');
        // Actualizar la lista de habitaciones
        fetchRooms();
      } else {
        toast.error(response.message || 'Error al asignar la habitación');
      }
    } catch (error) {
      console.error('Error al asignar habitación:', error);
      toast.error('No se pudo asignar la habitación');
    } finally {
      setIsAsignando(false);
      setShowAsignarModal(false);
    }
  };

  const handleDesasignarHabitacion = async (habitacionId) => {
    try {
      setIsAsignando(true);
      
      const response = await unassignHabitacionReservation(habitacionId);
      
      if (response.success) {
        toast.success('Habitación desasignada correctamente');
        // Actualizar la lista de habitaciones
        fetchRooms();
      } else {
        toast.error(response.message || 'Error al desasignar la habitación');
      }
    } catch (error) {
      console.error('Error al desasignar habitación:', error);
      toast.error('No se pudo desasignar la habitación');
    } finally {
      setIsAsignando(false);
    }
  };

  const abrirModalAsignar = (habitacion) => {
    setSelectedHabitacion(habitacion);
    setShowAsignarModal(true);
  };

  const toggleRoomExpand = (habitacionId) => {
    if (expandedRoom === habitacionId) {
      setExpandedRoom(null);
    } else {
      setExpandedRoom(habitacionId);
    }
  };

  const getStatusColor = (habitacion) => {
    if (habitacion.estado === 'Mantenimiento') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (habitacion.estado === 'No Disponible') {
      return 'bg-red-100 text-red-800';
    } else if (!habitacion.disponible) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (habitacion) => {
    if (habitacion.estado === 'Mantenimiento') {
      return 'En Mantenimiento';
    } else if (habitacion.estado === 'No Disponible') {
      return 'No Disponible';
    } else if (!habitacion.disponible) {
      return 'Ocupada';
    }
    return 'Disponible';
  };

  const getNombreUsuarioAsignado = (habitacion) => {
    if (!habitacion || !habitacion.reservas || habitacion.reservas.length === 0) {
      return 'Sin asignar';
    }
    
    const reservaActiva = habitacion.reservas.find(r => r.asignadoA);
    
    if (!reservaActiva || !reservaActiva.asignadoA) {
      return 'Sin asignar';
    }
    
    // Si asignadoA es un ID
    if (typeof reservaActiva.asignadoA === 'string') {
      const usuarioAsignado = usuarios.find(u => u._id === reservaActiva.asignadoA || u.id === reservaActiva.asignadoA);
      return usuarioAsignado ? `${usuarioAsignado.nombre} ${usuarioAsignado.apellidos || ''}` : 'Usuario desconocido';
    }
    
    // Si asignadoA es un objeto
    if (typeof reservaActiva.asignadoA === 'object' && reservaActiva.asignadoA !== null) {
      return `${reservaActiva.asignadoA.nombre || ''} ${reservaActiva.asignadoA.apellidos || ''}`;
    }
    
    return 'Sin asignar';
  };

  // Función robusta para obtener la letra de la habitación de todas las posibles fuentes
  const getLetraHabitacion = (habitacion) => {
    // Si la habitación tiene una propiedad letra, usarla directamente
    if (habitacion?.letra) { // Añadido optional chaining por seguridad
      return habitacion.letra;
    }

    // Si tiene una propiedad habitacion que es un string, usarla
    if (habitacion?.habitacion && typeof habitacion.habitacion === 'string') { // Añadido optional chaining
      return habitacion.habitacion;
    }

    // Si tiene una propiedad habitacion que es un objeto, buscar letra dentro
    if (habitacion?.habitacion && typeof habitacion.habitacion === 'object' && habitacion.habitacion !== null) { // Añadido optional chaining
      if (habitacion.habitacion.letra) {
        return habitacion.habitacion.letra;
      }
    }

    // Intentar letraHabitacion
    if (habitacion?.letraHabitacion) { // Añadido optional chaining
      return habitacion.letraHabitacion;
    }

    // Intentar extraer del identificador
    if (habitacion?.identificador) { // Añadido optional chaining
      return habitacion.identificador;
    }

    // Si tiene tipo de habitación, usar la primera letra
    if (habitacion?.tipoHabitacion && typeof habitacion.tipoHabitacion === 'string') { // Añadido optional chaining
      const firstChar = habitacion.tipoHabitacion.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) {
        return firstChar;
      }
    }

    // Como último recurso, intentar extraer una letra del ID
    const id = habitacion?._id || habitacion?.id; // Añadido optional chaining
    if (id) {
      const match = String(id).match(/([A-Z])/);
      if (match) return match[1];
    }

    // Si todo falla, devolver ?
    console.warn('[getLetraHabitacion] No se pudo determinar la letra para la habitación:', habitacion);
    return '?'; // Devolver '?' como string para evitar errores en .toLowerCase()
  };

  // Mejorar la visualización de las reservas
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  // Obtener pisos únicos para filtrado
  const pisosDisponibles = useMemo(() => {
    const pisos = habitaciones
      .map(hab => hab.planta || 'No especificado')
      .filter((piso, index, self) => self.indexOf(piso) === index);
    return ['todos', ...pisos];
  }, [habitaciones]);

  // Filtrar y ordenar habitaciones
  const habitacionesFiltradas = habitaciones
    .filter(habitacion => {
      // Obtener letra de habitación para búsqueda y ordenamiento
      const letraHabitacion = getLetraHabitacion(habitacion); // Asegurarse que devuelve string

      // Filtrar por término de búsqueda
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        (letraHabitacion && letraHabitacion.toLowerCase().includes(searchTermLower)) || // Verificar que letraHabitacion no sea null/undefined
        (habitacion.nombre && habitacion.nombre.toLowerCase().includes(searchTermLower)) ||
        (habitacion.descripcion && habitacion.descripcion.toLowerCase().includes(searchTermLower));

      // Filtrar por estado
      const matchesEstado =
        filterEstado === 'todos' ||
        (filterEstado === 'disponible' && habitacion.disponible === true) || // Comparación explícita
        (filterEstado === 'ocupada' && habitacion.disponible === false) || // Comparación explícita
        (filterEstado === 'mantenimiento' && habitacion.estado === 'Mantenimiento');

      // Filtrar por piso
      const matchesPiso =
        selectedPiso === 'todos' ||
        (habitacion.planta && habitacion.planta === selectedPiso) ||
        (!habitacion.planta && selectedPiso === 'No especificado');

      return matchesSearch && matchesEstado && matchesPiso;
    })
    .sort((a, b) => {
      // Ordenar por el campo seleccionado
      let comparacion = 0;

      switch (sortBy) {
        case 'letra':
          comparacion = getLetraHabitacion(a).localeCompare(getLetraHabitacion(b));
          break;
        case 'estado':
          comparacion = getStatusText(a).localeCompare(getStatusText(b));
          break;
        case 'capacidad':
          comparacion = (a.capacidad || 0) - (b.capacidad || 0);
          break;
        case 'precio':
          comparacion = (a.precioPorNoche || 0) - (b.precioPorNoche || 0);
          break;
        case 'reservas':
          comparacion = (a.reservas?.length || 0) - (b.reservas?.length || 0);
          break;
        default:
          comparacion = getLetraHabitacion(a).localeCompare(getLetraHabitacion(b));
      }

      // Aplicar orden (ascendente o descendente)
      return sortOrder === 'asc' ? comparacion : -comparacion;
    });

  const handleRetry = () => {
    fetchRooms();
  };

  const handleSortChange = (campo) => {
    if (sortBy === campo) {
      // Si ya estamos ordenando por este campo, cambiamos el orden
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Si cambiamos el campo, empezamos en orden ascendente
      setSortBy(campo);
      setSortOrder('asc');
    }
    setShowDropdownSort(false);
  };
  
  const renderSortIcon = (campo) => {
    if (sortBy !== campo) return null;
    
    return sortOrder === 'asc' ? <FaArrowUp className="ml-1 inline-block" /> : <FaArrowDown className="ml-1 inline-block" />;
  };

  // Mostrar carga durante autenticación
  if (authLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Habitaciones</h1>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin text-purple-600">
            <FaSpinner className="h-12 w-12" />
          </div>
        </div>
      </div>
    );
  }

  // Mostrar indicador de carga
  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Habitaciones</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin text-purple-600 mb-4">
            <FaSpinner className="h-12 w-12" />
          </div>
          <p className="text-gray-600">Cargando habitaciones...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error si hay algún problema
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Habitaciones</h1>
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow p-6">
          <div className="text-red-500 mb-4">
            <FaBed className="w-12 h-12" />
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // Renderizar contenido principal
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Log antes de filtrar */}
      {console.log('[Habitaciones Page] Estado actual de habitaciones (antes de filtrar):', JSON.stringify(habitaciones.map(h => ({id: h._id || h.id, letra: h.letra, nombre: h.nombre, disponible: h.disponible, estado: h.estado, planta: h.planta, reservas: h.reservas?.length})), null, 2))}
      {console.log('[Habitaciones Page] Filtros actuales:', { searchTerm, filterEstado, selectedPiso })}
      
      {/* Cabecera */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Habitaciones</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVistaActiva(vistaActiva === 'grid' ? 'tabla' : 'grid')}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                {vistaActiva === 'grid' ? 'Vista de Tabla' : 'Vista de Tarjetas'}
              </button>
              <button 
                onClick={() => fetchRooms()} 
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
              >
                <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
                Actualizar
              </button>
            </div>
          </div>
          
          {/* Barra de búsqueda y botón de filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar habitación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FaTimes className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
            >
              <FaFilter className="mr-2" />
              Filtros {showFilters ? '▲' : '▼'}
            </button>
          </div>
          
          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro de Estado */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <button
                  onClick={() => setShowDropdownFilter(!showDropdownFilter)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between shadow-sm"
                >
                  <span>
                    {filterEstado === 'todos' ? 'Todos los estados' : 
                     filterEstado === 'disponible' ? 'Disponible' :
                     filterEstado === 'ocupada' ? 'Ocupada' : 'En mantenimiento'}
                  </span>
                  <FaChevronDown className={`transition-transform ${showDropdownFilter ? 'rotate-180' : ''}`} />
                </button>
                
                {showDropdownFilter && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 py-1">
                    <button 
                      onClick={() => { setFilterEstado('todos'); setShowDropdownFilter(false); }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Todos los estados
                    </button>
                    <button 
                      onClick={() => { setFilterEstado('disponible'); setShowDropdownFilter(false); }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Disponible
                    </button>
                    <button 
                      onClick={() => { setFilterEstado('ocupada'); setShowDropdownFilter(false); }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Ocupada
                    </button>
                    <button 
                      onClick={() => { setFilterEstado('mantenimiento'); setShowDropdownFilter(false); }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      En mantenimiento
                    </button>
                  </div>
                )}
              </div>
              
              {/* Filtro de Piso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Piso/Planta</label>
                <select
                  value={selectedPiso}
                  onChange={(e) => setSelectedPiso(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {pisosDisponibles.map(piso => (
                    <option key={piso} value={piso}>
                      {piso === 'todos' ? 'Todos los pisos' : piso}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Orden */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                <button
                  onClick={() => setShowDropdownSort(!showDropdownSort)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between shadow-sm"
                >
                  <span>
                    {sortBy === 'letra' ? 'Letra' : 
                     sortBy === 'estado' ? 'Estado' :
                     sortBy === 'capacidad' ? 'Capacidad' :
                     sortBy === 'precio' ? 'Precio' : 'Reservas'}
                    {renderSortIcon(sortBy)}
                  </span>
                  <FaChevronDown className={`transition-transform ${showDropdownSort ? 'rotate-180' : ''}`} />
                </button>
                
                {showDropdownSort && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 py-1">
                    <button 
                      onClick={() => handleSortChange('letra')}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>Letra</span>
                      {sortBy === 'letra' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                    </button>
                    <button 
                      onClick={() => handleSortChange('estado')}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>Estado</span>
                      {sortBy === 'estado' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                    </button>
                    <button 
                      onClick={() => handleSortChange('capacidad')}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>Capacidad</span>
                      {sortBy === 'capacidad' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                    </button>
                    <button 
                      onClick={() => handleSortChange('precio')}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>Precio</span>
                      {sortBy === 'precio' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                    </button>
                    <button 
                      onClick={() => handleSortChange('reservas')}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>Reservas</span>
                      {sortBy === 'reservas' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Resumen de resultados */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando {habitacionesFiltradas.length} de {habitaciones.length} habitaciones
            </p>
            {(searchTerm || filterEstado !== 'todos' || selectedPiso !== 'todos') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterEstado('todos');
                  setSelectedPiso('todos');
                }}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Contenido principal - Sin habitaciones */}
      {habitacionesFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <FaBed className="mx-auto text-gray-400 text-5xl mb-4" />
          <h2 className="text-lg font-medium text-gray-900">No hay habitaciones disponibles</h2>
          <p className="text-gray-500 mt-2">
            {searchTerm || filterEstado !== 'todos' || selectedPiso !== 'todos'
              ? 'No se encontraron habitaciones con los filtros aplicados.' 
              : 'No se encontraron habitaciones en el sistema.'}
          </p>
        </div>
      ) : (
        // Contenido principal - Se muestra vista grid o tabla según selección
        vistaActiva === 'grid' ? (
          // Vista de tarjetas grid
          <RoomGridView 
            habitaciones={habitacionesFiltradas} 
            getStatusText={getStatusText}
            getStatusColor={getStatusColor}
            getNombreUsuarioAsignado={getNombreUsuarioAsignado}
            getLetraHabitacion={getLetraHabitacion}
            formatearFecha={formatearFecha}
            expandedRoom={expandedRoom}
            toggleRoomExpand={toggleRoomExpand}
            abrirModalAsignar={abrirModalAsignar}
            handleDesasignarHabitacion={handleDesasignarHabitacion}
          />
        ) : (
          // Vista de tabla
          <RoomTableView 
            habitaciones={habitacionesFiltradas}
            getStatusText={getStatusText}
            getStatusColor={getStatusColor}
            getNombreUsuarioAsignado={getNombreUsuarioAsignado}
            getLetraHabitacion={getLetraHabitacion}
            formatearFecha={formatearFecha}
            abrirModalAsignar={abrirModalAsignar}
            handleDesasignarHabitacion={handleDesasignarHabitacion}
          />
        )
      )}
      
      {/* Modal para asignar */}
      {showAsignarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Asignar habitación {selectedHabitacion?.letra}</h3>
              <button 
                onClick={() => setShowAsignarModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4">
              {loadingUsuarios ? (
                <div className="text-center py-4">
                  <div className="animate-spin text-stone-600 mx-auto mb-2">
                    <FaSpinner className="h-8 w-8" />
                  </div>
                  <p className="mt-2">Cargando usuarios...</p>
                </div>
              ) : (
                <>
                  <p className="mb-4">
                    Selecciona un usuario para asignar la habitación {selectedHabitacion?.letra}
                  </p>
                  {usuarios.length === 0 ? (
                    <div className="text-center py-4">
                      <p>No hay usuarios disponibles</p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {usuarios.map(usuario => (
                        <button
                          key={usuario._id || usuario.id}
                          className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 text-left transition duration-200"
                          onClick={() => {
                            if (selectedHabitacion?.reservas?.length > 0) {
                              const reservaActiva = selectedHabitacion.reservas[0];
                              handleAsignarHabitacion(
                                reservaActiva._id || reservaActiva.id, 
                                usuario._id || usuario.id
                              );
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mr-3">
                              {usuario.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{usuario.nombre} {usuario.apellidos || ''}</div>
                              <div className="text-xs text-gray-500">{usuario.email}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="border-t p-4 flex justify-end">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                onClick={() => setShowAsignarModal(false)}
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

// Componente para vista de tarjetas
function RoomGridView({ 
  habitaciones, 
  getStatusText, 
  getStatusColor, 
  getNombreUsuarioAsignado,
  getLetraHabitacion,
  formatearFecha,
  expandedRoom,
  toggleRoomExpand,
  abrirModalAsignar,
  handleDesasignarHabitacion 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habitaciones.map((habitacion) => {
        const roomId = habitacion._id || habitacion.id || `habitacion-${habitacion.letra}`;
        const isExpanded = expandedRoom === roomId;
        const hasReservas = habitacion.reservas && habitacion.reservas.length > 0;
        const statusColor = getStatusColor(habitacion);
        const statusText = getStatusText(habitacion);
        const usuarioAsignado = getNombreUsuarioAsignado(habitacion);
        const isAsignado = usuarioAsignado !== 'Sin asignar';
        const letraHabitacion = getLetraHabitacion(habitacion);
        
        return (
          <div
            key={roomId}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-stone-300 text-stone-800 font-bold text-xl mr-3">
                    {letraHabitacion}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {habitacion.nombre || `Habitación ${letraHabitacion}`}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-1"
                  onClick={() => toggleRoomExpand(roomId)}
                >
                  {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Capacidad</p>
                  <div className="flex items-center">
                    <FaUserFriends className="mr-2 text-stone-500" />
                    <span className="font-semibold">{habitacion.capacidad ? `${habitacion.capacidad} personas` : 'N/A'}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Precio</p>
                  <div className="flex items-center">
                    <FaEuroSign className="mr-1 text-stone-500" />
                    <span className="font-semibold">{habitacion.precioPorNoche ? `${habitacion.precioPorNoche} / noche` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Ubicación</p>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-stone-500" />
                  <p className="font-semibold">
                    {habitacion.planta || 'Planta no especificada'}{habitacion.ubicacion && ` - ${habitacion.ubicacion}`}
                  </p>
                </div>
              </div>
              
              {habitacion.descripcion && isExpanded && (
                <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Descripción</p>
                  <p className="text-sm text-gray-600">{habitacion.descripcion}</p>
                </div>
              )}
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium text-gray-700 text-sm">Asignado a:</p>
                  
                  {isAsignado ? (
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mr-2 text-xs">
                        {usuarioAsignado.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{usuarioAsignado}</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Sin asignar
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between gap-2">
                  <button 
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-1.5 px-3 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center"
                    onClick={() => abrirModalAsignar(habitacion)}
                  >
                    <FaUserPlus className="mr-1.5" /> Asignar
                  </button>
                  
                  {isAsignado && (
                    <button 
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 px-3 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center"
                      onClick={() => {
                        const reservaAsignada = habitacion.reservas.find(r => r.asignadoA);
                        if (reservaAsignada) {
                          handleDesasignarHabitacion(reservaAsignada._id || reservaAsignada.id);
                        }
                      }}
                    >
                      <FaUserMinus className="mr-1.5" /> Desasignar
                    </button>
                  )}
                </div>
              </div>
              
              {hasReservas && (
                <div className={`mt-4 border-t pt-4 ${!isExpanded && 'max-h-24 overflow-hidden relative'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Próximas reservas:</h4>
                    <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                      {habitacion.reservas.length}
                    </span>
                  </div>
                  
                  {isExpanded ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {habitacion.reservas.map((reserva, index) => {
                        // Determinar la URL correcta según el tipo de reserva
                        const reservaId = reserva._id || reserva.id;
                        const reservaUrl = reserva.eventoId || reserva.reservaEvento 
                          ? `/admin/reservas/${reserva.eventoId || reserva.reservaEvento}` 
                          : `/admin/reservaciones/habitacion/${reservaId}`;
                        
                        return (
                          <div key={reservaId || index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded flex justify-between items-center hover:bg-gray-100">
                            <div>
                              <div className="font-medium">{reserva.nombreCompleto || reserva.nombreContacto || (reserva.huesped?.nombre || 'Sin información')}</div>
                              <div className="flex items-center text-gray-500 mt-1">
                                <div className="flex items-center mr-2">
                                  <FaCalendarAlt size={10} className="text-stone-400 mr-1" />
                                  <span>Entrada:</span>
                                </div>
                                <span className="font-medium">
                                  {formatearFecha(reserva.fechaInicio || reserva.fechaEvento || reserva.fechaEntrada)}
                                </span>
                              </div>
                              {(reserva.fechaFin || reserva.fechaSalida) && (
                                <div className="flex items-center text-gray-500 mt-1">
                                  <div className="flex items-center mr-2">
                                    <FaCalendarAlt size={10} className="text-stone-400 mr-1" />
                                    <span>Salida:</span>
                                  </div>
                                  <span className="font-medium">
                                    {formatearFecha(reserva.fechaFin || reserva.fechaSalida)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Link 
                              href={reservaUrl}
                              className="text-stone-500 hover:text-stone-700 p-1 rounded-full hover:bg-gray-200"
                            >
                              <FaEye />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {habitacion.reservas.slice(0, 1).map((reserva, index) => {
                          const reservaId = reserva._id || reserva.id;
                          const reservaUrl = reserva.eventoId || reserva.reservaEvento 
                            ? `/admin/reservas/${reserva.eventoId || reserva.reservaEvento}` 
                            : `/admin/reservaciones/habitacion/${reservaId}`;
                          
                          return (
                            <div key={reservaId || index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded flex justify-between items-center hover:bg-gray-100">
                              <div>
                                <div className="font-medium">{reserva.nombreCompleto || reserva.nombreContacto || (reserva.huesped?.nombre || 'Sin información')}</div>
                                <div className="flex items-center text-gray-500 mt-1">
                                  <div className="flex items-center mr-2">
                                    <FaCalendarAlt size={10} className="text-stone-400 mr-1" />
                                    <span>Entrada:</span>
                                  </div>
                                  <span className="font-medium">
                                    {formatearFecha(reserva.fechaInicio || reserva.fechaEvento || reserva.fechaEntrada)}
                                  </span>
                                </div>
                                {(reserva.fechaFin || reserva.fechaSalida) && (
                                  <div className="flex items-center text-gray-500 mt-1">
                                    <div className="flex items-center mr-2">
                                      <FaCalendarAlt size={10} className="text-stone-400 mr-1" />
                                      <span>Salida:</span>
                                    </div>
                                    <span className="font-medium">
                                      {formatearFecha(reserva.fechaFin || reserva.fechaSalida)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <Link 
                                href={reservaUrl}
                                className="text-stone-500 hover:text-stone-700 p-1 rounded-full hover:bg-gray-200"
                              >
                                <FaEye />
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                      {habitacion.reservas.length > 1 && (
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent flex justify-center items-end">
                          <button 
                            onClick={() => toggleRoomExpand(roomId)}
                            className="text-xs text-stone-600 hover:text-stone-800"
                          >
                            Ver todas ({habitacion.reservas.length})
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Componente para vista de tabla
function RoomTableView({ 
  habitaciones, 
  getStatusText, 
  getStatusColor, 
  getNombreUsuarioAsignado,
  getLetraHabitacion,
  formatearFecha,
  abrirModalAsignar,
  handleDesasignarHabitacion 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Habitación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asignado a
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reservas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {habitaciones.map((habitacion) => {
              const roomId = habitacion._id || habitacion.id || `habitacion-${habitacion.letra}`;
              const hasReservas = habitacion.reservas && habitacion.reservas.length > 0;
              const statusColorClass = getStatusColor(habitacion);
              const statusText = getStatusText(habitacion);
              const usuarioAsignado = getNombreUsuarioAsignado(habitacion);
              const isAsignado = usuarioAsignado !== 'Sin asignar';
              const letraHabitacion = getLetraHabitacion(habitacion);
              
              return (
                <tr key={roomId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-300 text-stone-800 font-bold text-sm mr-3">
                        {letraHabitacion}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {habitacion.nombre || `Habitación ${letraHabitacion}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}>
                      {statusText}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {habitacion.capacidad ? `${habitacion.capacidad} personas` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {habitacion.precioPorNoche ? `${habitacion.precioPorNoche}€ / noche` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isAsignado ? (
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mr-2 text-xs">
                          {usuarioAsignado.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">{usuarioAsignado}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Sin asignar
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hasReservas ? (
                      <div className="flex items-center">
                        <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full mr-2">
                          {habitacion.reservas.length}
                        </span>
                        {habitacion.reservas[0] && (
                          <div className="flex flex-col">
                            <div className="text-xs font-medium">
                              {habitacion.reservas[0].nombreCompleto || habitacion.reservas[0].nombreContacto || 'Sin información'}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <FaCalendarAlt size={8} className="mr-1 text-stone-400" />
                              {formatearFecha(habitacion.reservas[0].fechaEntrada || habitacion.reservas[0].fechaInicio)}
                            </div>
                            <Link 
                              href={
                                habitacion.reservas[0].eventoId || habitacion.reservas[0].reservaEvento 
                                  ? `/admin/reservas/${habitacion.reservas[0].eventoId || habitacion.reservas[0].reservaEvento}` 
                                  : `/admin/reservaciones/habitacion/${habitacion.reservas[0]._id || habitacion.reservas[0].id}`
                              }
                              className="text-stone-500 hover:text-stone-700 mt-1 text-xs underline"
                            >
                              Ver detalles
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Sin reservas</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => abrirModalAsignar(habitacion)}
                      className="text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 p-1.5 rounded"
                    >
                      <FaUserPlus />
                    </button>
                    
                    {isAsignado && (
                      <button 
                        onClick={() => {
                          const reservaAsignada = habitacion.reservas.find(r => r.asignadoA);
                          if (reservaAsignada) {
                            handleDesasignarHabitacion(reservaAsignada._id || reservaAsignada.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded"
                      >
                        <FaUserMinus />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 