"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaBed, FaUsers, FaClipboardList, FaGlassCheers, FaSpa, FaEye, FaUserCircle, FaSync, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  getHabitacionReservations, 
  getEventoReservations, 
  getMasajeReservations,
  getAllReservationsForDashboard,
  assignEventoReservation,
  assignHabitacionReservation,
  assignMasajeReservation,
  unassignEventoReservation,
  unassignHabitacionReservation,
  unassignMasajeReservation
} from '@/services/reservationService';
import userService from '@/services/userService';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    totalRooms: 24,
    occupiedRooms: 0,
    totalUsers: 0
  });
  const [habitacionReservations, setHabitacionReservations] = useState([]);
  const [eventoReservations, setEventoReservations] = useState([]);
  const [masajeReservations, setMasajeReservations] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [assigningReservation, setAssigningReservation] = useState(false);
  
  // Referencia para el intervalo de actualización automática
  const autoRefreshInterval = useRef(null);

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      const usersResponse = await userService.getAllUsers();
      if (usersResponse.success && Array.isArray(usersResponse.data)) {
        setUsuarios(usersResponse.data);
      } else if (Array.isArray(usersResponse)) {
        setUsuarios(usersResponse);
      } else {
        console.error('Formato de respuesta inesperado para usuarios:', usersResponse);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  // Función para cargar los datos del dashboard (memoizada con useCallback)
  const loadDashboardData = useCallback(async (showToast = false) => {
    try {
      if (showToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      // Cargar usuarios primero
      await loadUsers();
      
      try {
        // Obtener todas las reservas con el nuevo método unificado
        const todasLasReservas = await getAllReservationsForDashboard();
        setAllReservations(todasLasReservas);
        
        // Separar por tipo para las estadísticas
        const habitaciones = todasLasReservas.filter(r => r.tipo === 'habitacion');
        const eventos = todasLasReservas.filter(r => r.tipo === 'evento');
        const masajes = todasLasReservas.filter(r => r.tipo === 'masaje');
        
        setHabitacionReservations(habitaciones);
        setEventoReservations(eventos);
        setMasajeReservations(masajes);
        
        // Calcular estadísticas
        const totalReservations = todasLasReservas.length;
        const pendingReservations = todasLasReservas.filter(
          r => r.estado && r.estado.toLowerCase() === 'pendiente'
        ).length;
        const confirmedReservations = todasLasReservas.filter(
          r => r.estado && r.estado.toLowerCase() === 'confirmada'
        ).length;
        
        const occupiedRooms = habitaciones.reduce((total, h) => {
          return total + (h.numeroHabitaciones || 1);
        }, 0);
        
        setStats({
          totalReservations,
          pendingReservations,
          confirmedReservations,
          totalRooms: 24,
          occupiedRooms,
          totalUsers: usuarios.length
        });
        
        // Actualizar la hora de última actualización
        setLastUpdate(new Date());
        
        if (showToast) {
          toast.success('Datos actualizados correctamente');
        }
      } catch (error) {
        console.error('Error cargando reservas:', error);
        setError('Error al cargar los datos de reservas');
        if (showToast) {
          toast.error('Error al actualizar los datos');
        }
      }
      
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      setError('Error al cargar los datos del dashboard');
      if (showToast) {
        toast.error('Error al actualizar los datos');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [usuarios.length]);

  // Función de actualización manual
  const handleManualRefresh = () => {
    loadDashboardData(true);
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (loading) return;
    loadDashboardData();
  }, [loading, filtroUsuario, loadDashboardData]);

  // Configurar actualización automática cada 2 minutos
  useEffect(() => {
    // Iniciar intervalo cuando el componente se monte
    autoRefreshInterval.current = setInterval(() => {
      loadDashboardData();
    }, 120000); // 2 minutos en milisegundos
    
    // Limpiar intervalo cuando el componente se desmonte
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [loadDashboardData]);

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
  
  // Obtener badge de estado con colores
  const getStatusBadge = (estado) => {
    if (!estado) return null;
    
    const estadoLower = estado.toLowerCase();
    let colorClass = 'bg-gray-100 text-gray-800';
    
    if (estadoLower === 'confirmada') {
      colorClass = 'bg-green-100 text-green-800';
    } else if (estadoLower === 'pendiente') {
      colorClass = 'bg-yellow-100 text-yellow-800';
    } else if (estadoLower === 'cancelada') {
      colorClass = 'bg-red-100 text-red-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {estado}
      </span>
    );
  };

  const dashboardCards = [
    {
      title: 'Reservaciones',
      icon: <FaCalendarAlt className="text-amber-500" size={24} />,
      stats: [
        { label: 'Total', value: stats.totalReservations },
        { label: 'Pendientes', value: stats.pendingReservations },
        { label: 'Confirmadas', value: stats.confirmedReservations }
      ],
      color: 'bg-amber-100 border-amber-200'
    },
    {
      title: 'Habitaciones',
      icon: <FaBed className="text-blue-500" size={24} />,
      stats: [
        { label: 'Total', value: stats.totalRooms },
        { label: 'Ocupadas', value: stats.occupiedRooms },
        { label: 'Disponibles', value: stats.totalRooms - stats.occupiedRooms }
      ],
      color: 'bg-blue-100 border-blue-200'
    },
    {
      title: 'Eventos',
      icon: <FaGlassCheers className="text-purple-500" size={24} />,
      stats: [
        { label: 'Reservados', value: eventoReservations.length },
        { label: 'Confirmados', value: eventoReservations.filter(e => e.estado && e.estado.toLowerCase() === 'confirmada').length },
        { label: 'Pendientes', value: eventoReservations.filter(e => e.estado && e.estado.toLowerCase() === 'pendiente').length }
      ],
      color: 'bg-purple-100 border-purple-200'
    },
    {
      title: 'Masajes',
      icon: <FaSpa className="text-green-500" size={24} />,
      stats: [
        { label: 'Reservados', value: masajeReservations.length },
        { label: 'Confirmados', value: masajeReservations.filter(m => m.estado && m.estado.toLowerCase() === 'confirmada').length },
        { label: 'Pendientes', value: masajeReservations.filter(m => m.estado && m.estado.toLowerCase() === 'pendiente').length }
      ],
      color: 'bg-green-100 border-green-200'
    }
  ];

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Formatear la hora para la última actualización
  const formatLastUpdate = () => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastUpdate) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'hace unos segundos';
    } else if (diffInMinutes === 1) {
      return 'hace 1 minuto';
    } else if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} minutos`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
  };

  // Función para abrir el modal de asignación
  const handleOpenAssignModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowAssignModal(true);
  };

  // Función para asignar una reserva a mí mismo
  const handleAssignToMe = async (reserva) => {
    try {
      setIsRefreshing(true);
      console.log('Asignando reserva:', reserva);
      console.log('Usuario actual:', user);
      
      let response;
      
      switch (reserva.tipo) {
        case 'evento':
          console.log('Asignando evento al usuario actual:', user._id);
          response = await assignEventoReservation(reserva._id || reserva.id);
          break;
        case 'habitacion':
          console.log('Asignando habitación al usuario actual:', user._id);
          response = await assignHabitacionReservation(reserva._id || reserva.id);
          break;
        case 'masaje':
          console.log('Asignando masaje al usuario actual:', user._id);
          response = await assignMasajeReservation(reserva._id || reserva.id);
          break;
        default:
          throw new Error('Tipo de reserva no válido');
      }
      
      console.log('Respuesta de asignación:', response);

      if (response && (response.success || response.data)) {
        toast.success('Reserva asignada exitosamente');
        
        // Actualizar el estado localmente
        const updateReservation = (list) => list.map(r => {
          if ((r._id === reserva._id) || (r.id === reserva.id)) {
            return { ...r, asignadoA: user._id };
          }
          return r;
        });

        setAllReservations(prev => updateReservation(prev));
        setEventoReservations(prev => updateReservation(prev));
        setHabitacionReservations(prev => updateReservation(prev));
        setMasajeReservations(prev => updateReservation(prev));
        
        // Recargar los datos para asegurar sincronización
        await loadDashboardData(false);
        setShowAssignModal(false);
      } else {
        const errorMsg = response?.message || response?.mensaje || 'Error al asignar la reserva';
        toast.error(errorMsg);
        console.error('Error en respuesta del servidor:', errorMsg);
      }
    } catch (error) {
      console.error('Error al asignar reserva:', error);
      toast.error(error.message || 'Error al asignar la reserva');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Función para desasignar una reserva
  const handleUnassign = async (reserva) => {
    try {
      setIsRefreshing(true);
      console.log('Desasignando reserva:', reserva);
      let response;
      
      switch (reserva.tipo) {
        case 'evento':
          response = await unassignEventoReservation(reserva._id || reserva.id);
          break;
        case 'habitacion':
          response = await unassignHabitacionReservation(reserva._id || reserva.id);
          break;
        case 'masaje':
          response = await unassignMasajeReservation(reserva._id || reserva.id);
          break;
        default:
          throw new Error('Tipo de reserva no válido');
      }
      
      console.log('Respuesta de desasignación:', response);

      if (response && (response.success || response.data)) {
        toast.success('Reserva desasignada exitosamente');
        
        // Actualizar el estado localmente
        const updateReservation = (list) => 
          list.map(r => {
            if ((r._id === reserva._id) || (r.id === reserva.id)) {
              return { 
                ...r, 
                asignadoA: null,
                estado: 'Pendiente' // Actualizar también el estado
              };
            }
            return r;
          });

        setAllReservations(prev => updateReservation(prev));
        setEventoReservations(prev => updateReservation(prev));
        setHabitacionReservations(prev => updateReservation(prev));
        setMasajeReservations(prev => updateReservation(prev));
        
        // Recargar los datos para asegurar sincronización
        await loadDashboardData(false);
      } else {
        const errorMsg = response?.message || response?.mensaje || 'Error al desasignar la reserva';
        toast.error(errorMsg);
        console.error('Error en respuesta del servidor:', errorMsg);
      }
    } catch (error) {
      console.error('Error al desasignar reserva:', error);
      toast.error(error.message || 'Error al desasignar la reserva');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Función para filtrar las reservas según el usuario seleccionado
  const getFilteredReservations = (reservations) => {
    return reservations.filter(reserva => {
      const reservaAsignadaId = typeof reserva.asignadoA === 'object' ? 
        reserva.asignadoA?._id : 
        reserva.asignadoA;

      if (filtroUsuario === 'todos') {
        return true;
      } else if (filtroUsuario === 'sin_asignar') {
        return !reservaAsignadaId;
      } else {
        return reservaAsignadaId === filtroUsuario;
      }
    });
  };

  // Aplicar filtros a cada tipo de reserva
  const filteredHabitacionReservations = getFilteredReservations(habitacionReservations);
  const filteredEventoReservations = getFilteredReservations(eventoReservations);
  const filteredMasajeReservations = getFilteredReservations(masajeReservations);
  const filteredAllReservations = getFilteredReservations(allReservations);

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl text-red-600 mb-4">Error al cargar el dashboard</h2>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={handleManualRefresh}
          className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center mx-auto"
        >
          <FaSync className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
            Panel de Control
          </h1>
          <p className="text-gray-600">
            Bienvenido, {user?.nombre || 'Administrador'} · {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Filtro por usuario asignado */}
          <select 
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            <option value="todos">Todas las reservas</option>
            <option value="sin_asignar">Sin asignar</option>
            {usuarios.filter(u => u._id !== user?._id).map(usuario => (
              <option key={usuario._id} value={usuario._id}>
                Asignadas a: {usuario.nombre} {usuario.apellidos || ''}
              </option>
            ))}
            <option value={user?._id}>Mis reservas</option>
          </select>
          
          {/* Botón de actualización manual */}
          <button 
            onClick={handleManualRefresh} 
            disabled={isRefreshing}
            className="px-3 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center whitespace-nowrap"
            title="Actualizar datos del dashboard"
          >
            <FaSync className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            Actualizar
          </button>
        </div>
      </div>
      
      {/* Indicador de última actualización */}
      <div className="flex justify-end">
        <p className="text-xs text-gray-500">
          Última actualización: {formatLastUpdate()}
        </p>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <div key={index} className={`${card.color} border rounded-xl p-6 shadow-sm`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{card.title}</h2>
              {card.icon}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {card.stats.map((stat, statIndex) => (
                <div key={statIndex} className="text-center">
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Todas las reservas unificadas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold flex items-center">
            <FaCalendarAlt className="mr-2 text-amber-500" />
            Todas las reservaciones recientes
          </h2>
          <Link 
            href="/admin/reservaciones" 
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] text-sm flex items-center"
          >
            <FaEye className="mr-1" /> Ver todas
          </Link>
        </div>
        <div className="p-4">
          {filteredAllReservations.length > 0 ? (
            <div className="space-y-3">
              {filteredAllReservations.slice(0, 10).map((reserva) => (
                <div key={reserva._id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <span className="inline-block w-24 font-medium text-sm px-2 py-1 bg-gray-100 rounded-full mr-2 text-center">
                        {reserva.tipoDisplay}
                      </span>
                      <span className="font-medium">{reserva.clienteDisplay}</span>
                    </div>
                    {getStatusBadge(reserva.estado)}
                  </div>
                  <div className="text-sm text-gray-600 flex justify-between">
                    <span>{reserva.fechaDisplay}</span>
                    <span>{reserva.tituloDisplay}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex justify-between">
                    <span className={`flex items-center ${
                      reserva.asignadoA ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <FaUserCircle className="mr-1" />
                      {getUsuarioAsignado(reserva)}
                    </span>
                    <div className="flex space-x-2">
                      <Link href={reserva.detallesUrl} className="text-[var(--color-primary)] hover:underline">
                        Ver detalles
                      </Link>
                      {!reserva.asignadoA ? (
                        <button 
                          onClick={() => handleAssignToMe(reserva)}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          Asignar a mí
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUnassign(reserva)}
                          className="text-amber-600 hover:underline"
                        >
                          Desasignar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No hay reservaciones recientes
            </div>
          )}
        </div>
      </div>
      
      {/* Contenedor de 3 columnas con las diferentes reservas por tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservaciones de habitaciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold flex items-center">
              <FaBed className="mr-2 text-blue-500" />
              Habitaciones Recientes
            </h2>
            <Link 
              href="/admin/reservaciones?tipo=habitacion" 
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] text-sm flex items-center"
            >
              <FaEye className="mr-1" /> Ver todas
            </Link>
          </div>
          <div className="p-4">
            {filteredHabitacionReservations.length > 0 ? (
              <div className="space-y-3">
                {filteredHabitacionReservations.slice(0, 5).map((reserva) => (
                  <div key={reserva._id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{reserva.clienteDisplay}</span>
                      {getStatusBadge(reserva.estado)}
                    </div>
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span>{formatDate(reserva.fechaEntrada)} - {formatDate(reserva.fechaSalida)}</span>
                      <span>{reserva.tipoHabitacion}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex justify-between">
                      <span className={`flex items-center ${
                        reserva.asignadoA ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        <FaUserCircle className="mr-1" />
                        {getUsuarioAsignado(reserva)}
                      </span>
                      <Link href={reserva.detallesUrl} className="text-[var(--color-primary)] hover:underline">
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No hay reservaciones de habitaciones recientes
              </div>
            )}
          </div>
        </div>
        
        {/* Reservaciones de eventos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold flex items-center">
              <FaGlassCheers className="mr-2 text-purple-500" />
              Eventos Recientes
            </h2>
            <Link 
              href="/admin/reservaciones?tipo=evento" 
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] text-sm flex items-center"
            >
              <FaEye className="mr-1" /> Ver todos
            </Link>
          </div>
          <div className="p-4">
            {filteredEventoReservations.length > 0 ? (
              <div className="space-y-3">
                {filteredEventoReservations.slice(0, 5).map((reserva) => (
                  <div key={reserva._id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <span className="inline-block w-24 font-medium text-sm px-2 py-1 bg-gray-100 rounded-full mr-2 text-center">
                          {reserva.tipoDisplay}
                        </span>
                        <span className="font-medium">{reserva.clienteDisplay}</span>
                      </div>
                      {getStatusBadge(reserva.estado)}
                    </div>
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span>{reserva.fechaDisplay}</span>
                      <span>{reserva.tituloDisplay}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex justify-between">
                      <span className={`flex items-center ${
                        reserva.asignadoA ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        <FaUserCircle className="mr-1" />
                        {getUsuarioAsignado(reserva)}
                      </span>
                      <div className="flex space-x-2">
                        <Link href={reserva.detallesUrl} className="text-[var(--color-primary)] hover:underline">
                          Ver detalles
                        </Link>
                        {!reserva.asignadoA ? (
                          <button 
                            onClick={() => handleAssignToMe(reserva)}
                            className="text-[var(--color-primary)] hover:underline"
                          >
                            Asignar a mí
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUnassign(reserva)}
                            className="text-amber-600 hover:underline"
                          >
                            Desasignar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No hay reservaciones de eventos recientes
              </div>
            )}
          </div>
        </div>
        
        {/* Reservaciones de masajes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold flex items-center">
              <FaSpa className="mr-2 text-green-500" />
              Masajes Recientes
            </h2>
            <Link 
              href="/admin/reservaciones?tipo=masaje" 
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] text-sm flex items-center"
            >
              <FaEye className="mr-1" /> Ver todos
            </Link>
          </div>
          <div className="p-4">
            {filteredMasajeReservations.length > 0 ? (
              <div className="space-y-3">
                {filteredMasajeReservations.slice(0, 5).map((reserva) => (
                  <div key={reserva._id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{reserva.clienteDisplay}</span>
                      {getStatusBadge(reserva.estado)}
                    </div>
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span>{formatDate(reserva.fecha)} - {reserva.hora}</span>
                      <span>{reserva.tipoMasaje}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex justify-between">
                      <span className={`flex items-center ${
                        reserva.asignadoA ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        <FaUserCircle className="mr-1" />
                        {getUsuarioAsignado(reserva)}
                      </span>
                      <Link href={reserva.detallesUrl} className="text-[var(--color-primary)] hover:underline">
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No hay reservaciones de masajes recientes
              </div>
            )}
          </div>
        </div>
      </div>

      {showAssignModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Asignar reserva</h3>
            <p className="mb-4">
              ¿Deseas asignar la reserva de <strong>{selectedReservation.clienteDisplay}</strong> a tu cuenta?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setShowAssignModal(false)}
                disabled={assigningReservation}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] transition-colors flex items-center"
                onClick={() => handleAssignToMe(selectedReservation)}
                disabled={assigningReservation}
              >
                {assigningReservation && <FaSpinner className="animate-spin mr-2" />}
                Confirmar asignación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}