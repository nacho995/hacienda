"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaBed, FaUsers, FaClipboardList, FaGlassCheers, FaSpa, FaEye, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  getHabitacionReservations, 
  getEventoReservations, 
  getMasajeReservations 
} from '@/services/reservationService';
import userService from '@/services/userService';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState('todos');

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    // Cargar usuarios
    const loadUsers = async () => {
      try {
        const response = await userService.getAllUsers();
        if (response.success && Array.isArray(response.data)) {
          setUsuarios(response.data);
          setStats(prevStats => ({
            ...prevStats,
            totalUsers: response.data.length
          }));
        } else {
          // Si no hay datos o no es array, inicializar con array vacío
          setUsuarios([]);
          console.warn('No se pudieron cargar los usuarios o formato incorrecto:', response);
        }
      } catch (err) {
        console.error('Error cargando usuarios:', err);
        // Si hay error 401, el apiClient ya limpiará el token y user
        if (err.status === 401) {
          // No hacer nada aquí, el router se encargará de la redirección
          console.log('Error de autenticación al cargar usuarios');
        }
        setUsuarios([]);
      }
    };

    // Cargar datos reales desde la API
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar usuarios primero
        await loadUsers();
        
        try {
          // Obtener reservas de habitaciones, eventos y masajes
          const [habitacionesData, eventosData, masajesData] = await Promise.all([
            getHabitacionReservations(),
            getEventoReservations(),
            getMasajeReservations()
          ]);
          
          // Filtrar por usuario asignado si se selecciona uno específico
          const habitacionesFiltradas = filtroUsuario === 'todos' 
            ? habitacionesData 
            : filtroUsuario === 'sin_asignar'
              ? habitacionesData.filter(reserva => !reserva.asignadoA)
              : habitacionesData.filter(reserva => reserva.asignadoA === filtroUsuario);
              
          const eventosFiltrados = filtroUsuario === 'todos' 
            ? eventosData 
            : filtroUsuario === 'sin_asignar'
              ? eventosData.filter(reserva => !reserva.asignadoA)
              : eventosData.filter(reserva => reserva.asignadoA === filtroUsuario);
              
          const masajesFiltrados = filtroUsuario === 'todos' 
            ? masajesData 
            : filtroUsuario === 'sin_asignar'
              ? masajesData.filter(reserva => !reserva.asignadoA)
              : masajesData.filter(reserva => reserva.asignadoA === filtroUsuario);
          
          // Guardar los datos de reservas
          setHabitacionReservations(habitacionesFiltradas);
          setEventoReservations(eventosFiltrados);
          setMasajeReservations(masajesFiltrados);
          
          // Calcular estadísticas
          const totalReservations = habitacionesData.length + eventosData.length + masajesData.length;
          const pendingReservations = [...habitacionesData, ...eventosData, ...masajesData].filter(
            reserva => reserva.estado && reserva.estado.toLowerCase() === 'pendiente'
          ).length;
          const confirmedReservations = [...habitacionesData, ...eventosData, ...masajesData].filter(
            reserva => reserva.estado && reserva.estado.toLowerCase() === 'confirmada'
          ).length;
          
          // Actualizar estadísticas
          setStats(prevStats => ({
            ...prevStats,
            totalReservations,
            pendingReservations,
            confirmedReservations,
            occupiedRooms: habitacionesData.filter(h => 
              h.estado && h.estado.toLowerCase() === 'confirmada'
            ).length
          }));
        } catch (reservationError) {
          console.error('Error cargando reservas:', reservationError);
          if (reservationError.status === 401) {
            console.log('Error de autenticación al cargar reservas');
          } else {
            setError('Error al cargar reservas. Por favor, recarga la página.');
          }
        }
        
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err);
        setError('Error al cargar datos. Por favor, recarga la página.');
      } finally {
        setIsLoading(false);
      }
    };

    // Solo cargar datos si el usuario está autenticado
    if (isAuthenticated && isAdmin) {
      loadDashboardData();
    }
  }, [isAuthenticated, isAdmin, filtroUsuario]);

  // Si está cargando, no mostrar contenido
  if (loading || !isAuthenticated || !isAdmin) {
    return null; // El AdminLayout se encargará de la redirección
  }

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

  // Obtener estado con color para las tablas
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'confirmada') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmada</span>;
    } else if (statusLower === 'pendiente') {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>;
    } else if (statusLower === 'cancelada') {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelada</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status || 'Desconocido'}</span>;
  };

  // Encontrar nombre de usuario asignado
  const getUsuarioAsignado = (reserva) => {
    if (!reserva.asignadoA) return 'Sin asignar';
    const usuarioAsignado = usuarios.find(u => u._id === reserva.asignadoA);
    return usuarioAsignado ? `${usuarioAsignado.nombre} ${usuarioAsignado.apellidos}` : 'Usuario desconocido';
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-[var(--font-display)] text-gray-800 mb-2">
        Bienvenido, {user?.name || 'Administrador'}
      </h1>
      <p className="text-gray-600">Aquí tienes un resumen de la actividad reciente.</p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Filtro de usuario */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <label htmlFor="filtroUsuario" className="text-gray-700 font-medium">
            Ver reservas asignadas a:
          </label>
          <div className="relative">
            <select
              id="filtroUsuario"
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              className="appearance-none pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            >
              <option value="todos">Todas las reservas</option>
              <option value="sin_asignar">Sin asignar</option>
              {usuarios.map(usuario => (
                <option key={usuario._id} value={usuario._id}>
                  {usuario.nombre} {usuario.apellidos}
                </option>
              ))}
            </select>
            <FaUserCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Selecciona un usuario para ver solo las reservas asignadas a él, o 'Sin asignar' para ver las reservas pendientes de asignación.
        </p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {dashboardCards.map((card, index) => (
              <div key={index} className={`rounded-lg shadow-sm p-5 ${card.color} border transition-transform hover:shadow-md`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-800">{card.title}</h2>
                  {card.icon}
                </div>
                <div className="space-y-2">
                  {card.stats.map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{stat.label}</span>
                      <span className="font-semibold text-lg">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
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
                {habitacionReservations.length > 0 ? (
                  <div className="space-y-3">
                    {habitacionReservations.slice(0, 5).map((reserva) => (
                      <div key={reserva._id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{reserva.nombre} {reserva.apellidos}</span>
                          {getStatusBadge(reserva.estado)}
                        </div>
                        <div className="text-sm text-gray-600 flex justify-between">
                          <span>{formatDate(reserva.fechaEntrada)} - {formatDate(reserva.fechaSalida)}</span>
                          <span>{reserva.tipoHabitacion}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex justify-between">
                          <span>Asignado a: {getUsuarioAsignado(reserva)}</span>
                          <Link href={`/admin/reservaciones/habitacion/${reserva._id}`} className="text-[var(--color-primary)] hover:underline">
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
                {eventoReservations.length > 0 ? (
                  <div className="space-y-3">
                    {eventoReservations.slice(0, 5).map((reserva) => (
                      <div key={reserva._id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{reserva.nombreEvento || `Evento de ${reserva.nombreContacto}`}</span>
                          {getStatusBadge(reserva.estado)}
                        </div>
                        <div className="text-sm text-gray-600 flex justify-between">
                          <span>{formatDate(reserva.fecha)}</span>
                          <span>{reserva.horaInicio} - {reserva.horaFin}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex justify-between">
                          <span>Asignado a: {getUsuarioAsignado(reserva)}</span>
                          <Link href={`/admin/reservaciones/evento/${reserva._id}`} className="text-[var(--color-primary)] hover:underline">
                            Ver detalles
                          </Link>
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
                {masajeReservations.length > 0 ? (
                  <div className="space-y-3">
                    {masajeReservations.slice(0, 5).map((reserva) => (
                      <div key={reserva._id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{reserva.nombre} {reserva.apellidos}</span>
                          {getStatusBadge(reserva.estado)}
                        </div>
                        <div className="text-sm text-gray-600 flex justify-between">
                          <span>{formatDate(reserva.fecha)}</span>
                          <span>{reserva.hora} - {reserva.tipoMasaje}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex justify-between">
                          <span>Asignado a: {getUsuarioAsignado(reserva)}</span>
                          <Link href={`/admin/reservaciones/masaje/${reserva._id}`} className="text-[var(--color-primary)] hover:underline">
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
        </>
      )}
    </div>
  );
}