// ARCHIVO MODIFICADO PARA PROBAR CAMBIOS EN EL FRONTEND - REVISAR PROBLEMA DE ACTUALIZACIONES
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useReservation } from '@/context/ReservationContext';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaSearch, FaFilter, FaCalendarAlt, FaExclamationTriangle, FaUserCircle } from 'react-icons/fa';
import { toast } from 'sonner';
import TablaReservaciones from '@/components/admin/TablaReservaciones';
import userService from '@/services/userService';
// --- Importar funciones de servicio necesarias ---
import {
  updateEventoReservation,
  updateHabitacionReservation,
  deleteEventoReservation,
  deleteHabitacionReservation
} from '@/services/reservationService';

export default function ReservacionesPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: authLoading, user } = useAuth();
  const { 
    reservations,
    habitacionReservations,
    eventoReservations,
    loading: reservationsLoading,
    loadAllReservations,
    error
  } = useReservation();

  const [isLoading, setIsLoading] = useState(true);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterUsuario, setFilterUsuario] = useState('all');
  const [usuarios, setUsuarios] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaEvento', direction: 'asc' });
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
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
  }, []);

  // Función para aplicar filtros y ordenamiento
  const applyFiltersAndSort = useCallback(() => {
    console.log('Aplicando filtros con datos:', {
      habitacionReservations,
      eventoReservations
    });

    // Verificar que los datos sean válidos
    if (!Array.isArray(habitacionReservations) || !Array.isArray(eventoReservations)) {
      console.error('Datos de reservaciones inválidos:', { habitacionReservations, eventoReservations });
      setFilteredReservations([]);
      return;
    }

    // Crear un Set con los IDs de las habitaciones asociadas a eventos
    const habitacionesEventosIds = new Set();
    eventoReservations.forEach(evento => {
      if (evento.serviciosAdicionales && Array.isArray(evento.serviciosAdicionales)) {
        evento.serviciosAdicionales.forEach(servicio => {
          // Asegurarse de que reservaHabitacionId existe y es un string o puede ser convertido
          const habitacionId = servicio?.reservaHabitacion?._id || servicio?.reservaHabitacionId;
          if (habitacionId) {
            habitacionesEventosIds.add(habitacionId.toString());
          }
        });
      }
    });
    
    // Log para verificar los IDs recolectados
    console.log('IDs de habitaciones asociadas a eventos:', Array.from(habitacionesEventosIds));

    // Ya no filtramos, usamos todas las habitaciones
    // const habitacionesIndependientes = habitacionReservations.filter(hab => { ... });

    // Combinar eventos y TODAS las habitaciones
    const allReservations = [
      ...eventoReservations.map(res => ({
        ...res,
        tipo: 'evento',
        fechaMostrada: res.fechaEvento, // Fecha principal para eventos
        // Usar nombreContacto para el cliente del evento
        clientePrincipal: res.nombreContacto || res.usuario?.nombre || 'No especificado',
        nombreMostrado: `Evento: ${res.nombreEvento || 'Sin nombre'}`, // Nombre para la columna TIPO
        uniqueId: `evento_${res._id || res.id}`
      })),
      ...habitacionReservations.map(res => {
        const habId = (res._id || res.id)?.toString();
        // Verificar si serviciosAdicionales y la reserva populada existen
        const servicioAsociado = eventoReservations.find(evento => 
          Array.isArray(evento.serviciosAdicionales) && evento.serviciosAdicionales.some(servicio => 
            servicio.reservaHabitacionId?._id?.toString() === habId
          )
        );
        const asociada = !!servicioAsociado;
        
        const letra = res.letraHabitacion || res.habitacion?.nombre || 'N/A';
        // Intentar obtener el primer huésped o el nombre general
        const primerHuesped = res.infoHuespedes?.nombres?.[0] || res.nombreHuespedes || res.huesped?.nombre;
        // Usar email como fallback si no hay nombre
        const clienteFinal = primerHuesped || res.huesped?.email || res.email || 'No especificado';
        let nombreTipo = `Habitación ${letra}`;
        if (asociada) {
          // Podríamos buscar el evento asociado si fuera necesario mostrar más info aquí
          nombreTipo += ' (Evento)'; 
        }
        
        return {
          ...res,
          tipo: 'habitacion',
          fechaMostrada: res.fechaEntrada, // Fecha principal para habitaciones
          clientePrincipal: clienteFinal, // Cliente principal de la habitación (con fallback de email)
          nombreMostrado: nombreTipo, // Nombre para la columna TIPO
          asociadaAEvento: asociada, // Marcar si está asociada
          letraHabitacionReal: letra, // Guardar la letra para posible uso futuro
          uniqueId: `habitacion_${habId}`
        };
      })
    ];

    console.log('Reservas combinadas:', allReservations.length);

    // Aplicar filtros
    let filtered = allReservations.filter(reservation => {
      // Verificar si la reserva tiene los campos mínimos necesarios
      if (!reservation) return false;
      
      // Buscar en el cliente principal
      const matchesSearch = searchTerm ? (
        reservation.clientePrincipal && reservation.clientePrincipal.toLowerCase().includes(searchTerm.toLowerCase())
      ) : true;

      // Usar estadoReserva o estado
      const currentStatus = reservation.estadoReserva || reservation.estado;
      const matchesStatus = filterStatus === 'all' || currentStatus?.toLowerCase() === filterStatus;
      const matchesType = filterType === 'all' || reservation.tipo === filterType;
      
      // Filtrar por usuario asignado
      let matchesUsuario = true;
      if (filterUsuario !== 'all') {
        if (filterUsuario === 'mine') {
          // Mostrar solo reservas asignadas al usuario actual
          matchesUsuario = reservation.asignadoA === user?.id;
        } else if (filterUsuario === 'unassigned') {
          // Mostrar solo reservas sin asignar
          matchesUsuario = !reservation.asignadoA;
        } else {
          // Mostrar reservas asignadas a un usuario específico
          matchesUsuario = reservation.asignadoA === filterUsuario;
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesUsuario;
    });

    // Ordenar reservaciones
    filtered.sort((a, b) => {
      // Usar la fecha principal definida al combinar
      const aValue = a.fechaMostrada;
      const bValue = b.fechaMostrada;

      if (!aValue || !bValue) return 0;

      const dateA = new Date(aValue);
      const dateB = new Date(bValue);

      if (sortConfig.direction === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    console.log('Reservas filtradas:', filtered.length);
    setFilteredReservations(filtered);
  }, [searchTerm, filterStatus, filterType, filterUsuario, sortConfig, habitacionReservations, eventoReservations, user?.id]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const initializeData = async () => {
      if (!authLoading && isAuthenticated && !initialLoadDone) {
        try {
          setIsLoading(true);
          await loadAllReservations();
          await loadUsers();
          setInitialLoadDone(true);
        } catch (error) {
          console.error('Error al cargar las reservaciones:', error);
          toast.error('Error al cargar las reservaciones');
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeData();
  }, [authLoading, isAuthenticated, initialLoadDone, loadAllReservations, loadUsers]);

  // Efecto para aplicar filtros cuando cambian los datos
  useEffect(() => {
    if (initialLoadDone) {
      applyFiltersAndSort();
    }
  }, [initialLoadDone, applyFiltersAndSort, habitacionReservations, eventoReservations]);

  // Efecto para redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // Manejadores de filtros y búsqueda
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
  };

  const handleTypeFilter = (type) => {
    setFilterType(type);
  };
  
  const handleUsuarioFilter = (usuarioId) => {
    setFilterUsuario(usuarioId);
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // --- INICIO: Nuevas funciones Handler para acciones ---

  const handleDeleteReservation = useCallback(async (tipo, id) => {
    if (!id) {
      toast.error('ID de reserva inválido.');
      return;
    }
    
    const userConfirmed = window.confirm('¿Estás seguro de que deseas eliminar esta reservación permanentemente?');
    
    if (userConfirmed) {
      setIsLoading(true);
      try {
        let response;
        if (tipo === 'evento') {
          response = await deleteEventoReservation(id);
        } else { // tipo === 'habitacion'
          response = await deleteHabitacionReservation(id);
        }

        if (response && response.success) {
          toast.success('Reservación eliminada correctamente');
          await loadAllReservations(); // Recarga los datos
        } else {
          // Usar el mensaje de error de la respuesta si existe
          throw new Error(response?.message || 'Error al eliminar la reservación'); 
        }
      } catch (error) {
        console.error('Error al eliminar reservación:', error);
        toast.error('Error al eliminar la reservación: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [loadAllReservations]);

  const handleChangeReservationStatus = useCallback(async (tipo, id, newStatus) => {
    if (!id || !newStatus) {
      toast.error('Datos inválidos para actualizar estado.');
      return;
    }
    
    setIsLoading(true);
    try {
      let response;
      const payload = { estadoReserva: newStatus.toLowerCase() };
      
      if (tipo === 'evento') {
        response = await updateEventoReservation(id, payload);
      } else { // tipo === 'habitacion'
        response = await updateHabitacionReservation(id, payload);
      }

      if (response && response.success) {
        toast.success(`Estado de la reserva actualizado a ${newStatus}`);
        await loadAllReservations(); // Recarga los datos
      } else {
        // Usar el mensaje de error de la respuesta si existe
        throw new Error(response?.message || 'Error al actualizar estado'); 
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar estado: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [loadAllReservations]);

  // --- FIN: Nuevas funciones Handler ---

  // Manejo de estados de carga
  if (authLoading || (isLoading && !initialLoadDone)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Manejo de errores
  if (error) {
    return (
      <div className="text-red-500 text-center p-4 space-y-4">
        <FaExclamationTriangle className="mx-auto text-3xl" />
        <h2 className="text-xl font-semibold">Error al cargar las reservaciones</h2>
        <p>{error}</p>
        <button 
          onClick={() => loadAllReservations()}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Reservaciones</h1>
        
        {/* Filtros y búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filtro por tipo */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none"
            >
              <option value="all">Todos los tipos</option>
              <option value="evento">Eventos</option>
              <option value="habitacion">Habitaciones</option>
            </select>
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Filtro por usuario asignado */}
          <div className="relative">
            <select
              value={filterUsuario}
              onChange={(e) => handleUsuarioFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none"
            >
              <option value="all">Todos los usuarios</option>
              <option value="mine">Mis reservas</option>
              <option value="unassigned">Sin asignar</option>
              {usuarios.map(usuario => (
                <option key={usuario._id} value={usuario._id}>
                  {usuario.nombre || usuario.email}
                </option>
              ))}
            </select>
            <FaUserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Tabla de reservaciones */}
        <TablaReservaciones
          reservations={filteredReservations}
          onSort={handleSort}
          sortConfig={sortConfig}
          isLoading={isLoading || reservationsLoading}
          usuarios={usuarios}
          onDelete={handleDeleteReservation}
          onChangeStatus={handleChangeReservationStatus}
        />

        {/* Mensaje cuando no hay resultados para los filtros aplicados */}
        {filteredReservations.length === 0 && !reservationsLoading && (
          <div className="text-center py-8 border border-gray-200 bg-gray-50 rounded-lg mt-4">
            <p className="text-gray-500">No se encontraron reservaciones que coincidan con los filtros aplicados</p>
            <div className="mt-2 space-x-2">
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Limpiar búsqueda
                </button>
              )}
              {filterStatus !== 'all' && (
                <button 
                  onClick={() => setFilterStatus('all')}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Resetear filtro de estado
                </button>
              )}
              {filterType !== 'all' && (
                <button 
                  onClick={() => setFilterType('all')}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Resetear filtro de tipo
                </button>
              )}
              {filterUsuario !== 'all' && (
                <button 
                  onClick={() => setFilterUsuario('all')}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Resetear filtro de usuario
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}