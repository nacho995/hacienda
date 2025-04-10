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
      if (evento.habitacionesIds && Array.isArray(evento.habitacionesIds)) {
        evento.habitacionesIds.forEach(id => {
          if (id) habitacionesEventosIds.add(id);
        });
      }
    });

    // Filtrar habitaciones que no están asociadas a eventos
    const habitacionesIndependientes = habitacionReservations.filter(hab => {
      const habId = hab._id || hab.id;
      return habId && !habitacionesEventosIds.has(habId);
    });

    // Combinar eventos y habitaciones independientes
    const allReservations = [
      ...eventoReservations.map(res => ({
        ...res,
        tipo: 'evento',
        uniqueId: `evento_${res._id || res.id}`
      })),
      ...habitacionesIndependientes.map(res => ({
        ...res,
        tipo: 'habitacion',
        uniqueId: `habitacion_${res._id || res.id}`
      }))
    ];

    console.log('Reservas combinadas:', allReservations.length);

    // Aplicar filtros
    let filtered = allReservations.filter(reservation => {
      // Verificar si la reserva tiene los campos mínimos necesarios
      if (!reservation) return false;
      
      // Buscar en diferentes campos según la estructura normalizada
      const matchesSearch = searchTerm ? (
        // Buscar en datos de huésped (estructura normalizada)
        (reservation.huesped?.nombre && reservation.huesped.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.huesped?.email && reservation.huesped.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.huesped?.telefono && reservation.huesped.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
        // Compatibilidad con estructura anterior
        (reservation.nombreCompleto && reservation.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.email && reservation.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.telefono && reservation.telefono.toLowerCase().includes(searchTerm.toLowerCase()))
      ) : true;

      const matchesStatus = filterStatus === 'all' || reservation.estado === filterStatus;
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
      const aValue = a[sortConfig.key] || a.fechaInicio || a.fechaEvento;
      const bValue = b[sortConfig.key] || b.fechaInicio || b.fechaEvento;

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
          isLoading={reservationsLoading}
          usuarios={usuarios}
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