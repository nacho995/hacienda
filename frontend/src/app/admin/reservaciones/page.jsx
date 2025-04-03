'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEllipsisV, FaUserCircle, FaSpinner } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getHabitacionReservations, 
  getEventoReservations, 
  getMasajeReservations 
} from '@/services/reservationService';
import userService from '@/api/services/userService';
import { useAuth } from '@/context/AuthContext';

export default function AdminReservations() {
  const { user } = useAuth();
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
  
  // Cargar reservaciones al montar el componente
  useEffect(() => {
    loadReservations();
  }, [filterType]);
  
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
  
  // Función para cargar todas las reservaciones
  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar lista de usuarios primero
      try {
        const usersResponse = await userService.getAllUsers();
        if (usersResponse.success) {
          setUsuarios(usersResponse.data);
        }
      } catch (userError) {
        console.error('Error al cargar usuarios:', userError);
      }
      
      // Cargar las reservas según el tipo seleccionado
      const [habitacionData, eventoData, masajeData] = await Promise.all([
        filterType === 'all' || filterType === 'habitacion' ? getHabitacionReservations() : Promise.resolve([]),
        filterType === 'all' || filterType === 'evento' ? getEventoReservations() : Promise.resolve([]),
        filterType === 'all' || filterType === 'masaje' ? getMasajeReservations() : Promise.resolve([])
      ]);
      
      // Formatear los datos para la tabla
      const habitacionReservations = Array.isArray(habitacionData) ? habitacionData.map(h => ({
        id: h._id,
        cliente: `${h.nombre} ${h.apellidos}`,
        tipo: 'habitacion',
        fecha: h.fechaEntrada,
        fechaSalida: h.fechaSalida,
        invitados: h.numeroAdultos + (h.numeroNinos || 0),
        estado: h.estado || 'Pendiente',
        total: h.precio || 0,
        datosCompletos: h,
        asignadoA: h.asignadoA
      })) : [];
      
      const eventoReservations = Array.isArray(eventoData) ? eventoData.map(e => ({
        id: e._id,
        cliente: `${e.nombreContacto} ${e.apellidosContacto}`,
        tipo: 'evento',
        fecha: e.fecha,
        invitados: e.numeroInvitados || 0,
        estado: e.estado || 'Pendiente',
        total: e.precio || 0,
        datosCompletos: e,
        asignadoA: e.asignadoA
      })) : [];
      
      const masajeReservations = Array.isArray(masajeData) ? masajeData.map(m => ({
        id: m._id,
        cliente: `${m.nombre} ${m.apellidos}`,
        tipo: 'masaje',
        fecha: m.fecha,
        invitados: 1,
        estado: m.estado || 'Pendiente',
        total: m.precio || 0,
        datosCompletos: m,
        asignadoA: m.asignadoA
      })) : [];
      
      // Combinar y ordenar por fecha (más reciente primero)
      const combinedReservations = [
        ...habitacionReservations,
        ...eventoReservations,
        ...masajeReservations
      ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      setAllReservations(combinedReservations);
    } catch (error) {
      console.error('Error al cargar reservaciones:', error);
      setError('Error al cargar las reservaciones. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar reservaciones según los filtros aplicados
  const getFilteredReservations = () => {
    return allReservations.filter(reservation => {
      // Filtrado por búsqueda
      const matchesSearch =
        reservation.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reservation.datosCompletos.tipoHabitacion && 
          reservation.datosCompletos.tipoHabitacion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.datosCompletos.tipoEvento && 
          reservation.datosCompletos.tipoEvento.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.datosCompletos.tipoMasaje && 
          reservation.datosCompletos.tipoMasaje.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtrado por estado
      const matchesStatus = filterStatus === 'all' || 
        (reservation.estado && reservation.estado.toLowerCase() === filterStatus.toLowerCase());
      
      // Filtrado por tipo
      const matchesType = filterType === 'all' || reservation.tipo === filterType;
      
      // Filtrado por usuario asignado
      const matchesUser = filterUser === 'all' ? true :
        filterUser === 'sin_asignar' ? !reservation.asignadoA :
        reservation.asignadoA === filterUser;
      
      return matchesSearch && matchesStatus && matchesType && matchesUser;
    });
  };
  
  // Obtener reservaciones filtradas
  const filteredReservations = getFilteredReservations();
  
  // Function to get appropriate status badge
  const getStatusBadge = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'confirmada' || statusLower === 'confirmado') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmada</span>;
    } else if (statusLower === 'pendiente') {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>;
    } else if (statusLower === 'cancelada' || statusLower === 'cancelado') {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelada</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
  };
  
  // Function to get badges for reservation types
  const getTipoBadge = (tipo) => {
    if (tipo === 'habitacion') {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Habitación</span>;
    } else if (tipo === 'evento') {
      return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Evento</span>;
    } else if (tipo === 'masaje') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Masaje</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{tipo}</span>;
  };
  
  const getTipoReservacionLabel = (tipo, detalles) => {
    if (tipo === 'habitacion') return `Habitación ${detalles.tipoHabitacion || ''}`;
    if (tipo === 'evento') return `Evento: ${detalles.tipoEvento || ''}`;
    if (tipo === 'masaje') return `Masaje ${detalles.tipoMasaje || ''}`;
    return tipo;
  };

  const getReservationPath = (tipo, id) => {
    if (tipo === 'habitacion') return `/admin/reservaciones/habitacion/id?id=${id}`;
    if (tipo === 'evento') return `/admin/reservaciones/evento/id?id=${id}`;
    if (tipo === 'masaje') return `/admin/reservaciones/masaje/id?id=${id}`;
    return `/admin/reservaciones/${id}`;
  };

  // Función para mostrar el título adecuado según el filtro
  const getFilteredTitle = () => {
    switch (filterType) {
      case 'habitacion':
        return 'Reservaciones de Habitaciones';
      case 'evento':
        return 'Reservaciones de Eventos';
      case 'masaje':
        return 'Reservaciones de Masajes';
      default:
        return 'Todas las Reservaciones';
    }
  };

  // Función para obtener el nombre del usuario asignado
  const getUsuarioAsignado = (reserva) => {
    if (!reserva.asignadoA) return 'Sin asignar';
    const usuarioAsignado = usuarios.find(u => u._id === reserva.asignadoA);
    return usuarioAsignado ? `${usuarioAsignado.nombre} ${usuarioAsignado.apellidos}` : 'Usuario desconocido';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          {getFilteredTitle()}
        </h1>
        
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
              {usuarios.map(usuario => (
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
              <option value="masaje">Masajes</option>
            </select>
            <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Información sobre las reservaciones */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
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
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.cliente}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {getTipoReservacionLabel(reservation.tipo, reservation.datosCompletos)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(reservation.fecha).toLocaleDateString()}
                          {reservation.fechaSalida && (
                            <span className="block text-xs">
                              hasta {new Date(reservation.fechaSalida).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.invitados}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(reservation.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {reservation.asignadoA ? 
                            getUsuarioAsignado(reservation) : 
                            <span className="text-gray-400">Sin asignar</span>
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {typeof reservation.total === 'number' ? 
                          `$${reservation.total.toLocaleString('es-MX')}` : 
                          reservation.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative group">
                          <button className="text-gray-400 hover:text-gray-900 focus:outline-none">
                            <FaEllipsisV />
                          </button>
                          <div className="absolute right-0 z-10 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                            <div className="py-1">
                              <a 
                                href={getReservationPath(reservation.tipo, reservation.id)}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Ver detalles
                              </a>
                              {reservation.estado.toLowerCase() === 'pendiente' && (
                                <>
                                  <a 
                                    href="#" 
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Confirmar
                                  </a>
                                  <a 
                                    href="#" 
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Cancelar
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
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
    </div>
  );
} 