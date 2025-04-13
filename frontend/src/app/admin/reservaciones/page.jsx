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
  deleteHabitacionReservation,
  // --- Importar funciones de asignación a admin --- 
  assignEventoReservation,
  assignHabitacionReservation,
  // --- Importar funciones de desasignación --- 
  unassignEventoReservation,
  unassignHabitacionReservation
} from '@/services/reservationService';
import { useConfirmationModal } from '@/hooks/useConfirmationModal';

// <<< INICIO FUNCION getLetraHabitacion MOVIDA AFUERA >>>
const getLetraHabitacion = (reserva) => {
  // Prioridad 1: Campo directo en la reserva (ej. si se denormaliza al crear la reserva)
  if (reserva?.letraHabitacion) return reserva.letraHabitacion.toUpperCase();

  // Prioridad 2: Objeto 'habitacion' populado
  if (typeof reserva?.habitacion === 'object' && reserva.habitacion?.letra) {
    return reserva.habitacion.letra.toUpperCase();
  }

  // Prioridad 3: Objeto 'habitacionId' populado (nombre común para referencias)
  if (typeof reserva?.habitacionId === 'object' && reserva.habitacionId?.letra) {
    return reserva.habitacionId.letra.toUpperCase();
  }

  // Prioridad 4: Objeto 'habitacion_id' populado (otra convención)
  if (typeof reserva?.habitacion_id === 'object' && reserva.habitacion_id?.letra) {
      return reserva.habitacion_id.letra.toUpperCase();
  }

  // Fallback 1: Si 'habitacion' es una string, verificar si es una letra válida
  if (typeof reserva?.habitacion === 'string') {
      const habString = reserva.habitacion.trim().toUpperCase();
      // Check if it's a single uppercase letter A-O (typical room letters)
      if (habString.length === 1 && habString >= 'A' && habString <= 'O') {
          return habString;
      }
      // If not a letter, it might be an ID, return '?'
  }

  // Fallback 2: Si 'habitacionId' es un string (probablemente ID)
  if (typeof reserva?.habitacionId === 'string') {
    // No podemos obtener la letra solo del ID aquí, devolvemos '?'
  }

  // Fallback final si no se encontró nada
  // console.warn(`getLetraHabitacion: No se pudo determinar la letra para la reserva ID: ${reserva?._id}`);
  return '?';
};
// <<< FIN FUNCION getLetraHabitacion MOVIDA AFUERA >>>

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

  // LOG: Verificar datos recibidos del hook useReservation
  useEffect(() => {
    // Solo loguear si no está cargando para evitar logs excesivos
    if (!reservationsLoading) { 
        console.log('%c[ReservacionesPage] Datos recibidos de useReservation:', 'color: blue; font-weight: bold;', {
          habitacionReservations: habitacionReservations ? JSON.parse(JSON.stringify(habitacionReservations)) : [], // Clonar para inspección segura
          eventoReservations: eventoReservations ? JSON.parse(JSON.stringify(eventoReservations)) : [], // Clonar
          loading: reservationsLoading,
          error
        });
    }
  }, [habitacionReservations, eventoReservations, reservationsLoading, error]);

  const [isLoading, setIsLoading] = useState(true);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterUsuario, setFilterUsuario] = useState('all');
  const [usuarios, setUsuarios] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaEvento', direction: 'asc' });
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const { showConfirmation } = useConfirmationModal();

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

    // --- Log para inspeccionar eventoReservations y sus servicios --- 
    if (eventoReservations && eventoReservations.length > 0) {
      console.log('[Debug Filtro] Primer evento:', eventoReservations[0]);
      if (eventoReservations[0].serviciosAdicionales && eventoReservations[0].serviciosAdicionales.length > 0) {
        console.log('[Debug Filtro] Primer servicio del primer evento:', eventoReservations[0].serviciosAdicionales[0]);
      }
    }
    // ---------------------------------------------------------------

    // Verificar que los datos sean válidos
    if (!Array.isArray(habitacionReservations) || !Array.isArray(eventoReservations)) {
      console.error('Datos de reservaciones inválidos:', { habitacionReservations, eventoReservations });
      setFilteredReservations([]);
      return;
    }

    // Combinar eventos y TODAS las habitaciones
    const allReservations = [
      ...eventoReservations.map(res => {
        return {
          ...res,
          tipo: 'evento',
          fechaMostrada: res.fecha,
          clientePrincipal: res.nombreContacto || res.usuario?.nombre || 'No especificado',
          nombreMostrado: `Evento: ${res.nombreEvento || 'Sin nombre'}`,
          uniqueId: `evento_${res._id || res.id}`,
        };
      }),
      ...habitacionReservations.map(res => {
        const habId = (res._id || res.id)?.toString();
        let asociada = false;
        let eventoEncontrado = null;
        
        // LOG: Verificar si la habitación tiene referencia a evento
        console.log(`[applyFilters-Hab] Habitación ID: ${habId}, reservaEvento ID: ${res.reservaEvento}`);
        
        if (res.reservaEvento) { 
           // --- CORREGIDO: Extraer ID si res.reservaEvento es un objeto --- 
           const eventoIdDeHabitacion = typeof res.reservaEvento === 'object' && res.reservaEvento !== null
             ? String(res.reservaEvento._id || res.reservaEvento.id)
             : String(res.reservaEvento);
           // -------------------------------------------------------------

           eventoEncontrado = eventoReservations.find(evento => 
                // Comparar IDs como strings
                String(evento._id || evento.id) === eventoIdDeHabitacion
           );
           asociada = !!eventoEncontrado;
           // LOG: Resultado de la búsqueda del evento asociado
           if (asociada) {
               console.log(`[applyFilters-Hab] Evento asociado ENCONTRADO para hab ${habId}:`, eventoEncontrado);
           } else {
               // --- LOG MEJORADO: Mostrar el ID que se buscó --- 
               console.warn(`[applyFilters-Hab] Evento asociado NO ENCONTRADO para hab ${habId} con ID evento buscado: ${eventoIdDeHabitacion}`);
               // ---------------------------------------------
           }
        } else {
            // LOG: No hay referencia a evento
            console.log(`[applyFilters-Hab] Habitación ID: ${habId} no tiene reservaEvento.`);
        }
        
        const letra = getLetraHabitacion(res);
        // <<< INICIO LOG ASIGNADOA HABITACION >>>
        console.log(`[applyFilters-Hab] Procesando hab ${habId}, Asociada: ${asociada}, Asignado a (raw):`, res.asignadoA);
        // <<< FIN LOG ASIGNADOA HABITACION >>>
        const letraMostrada = letra === '?' ? 'N/A' : letra;
        const primerHuesped = res.infoHuespedes?.nombres?.[0] || res.nombreHuespedes || res.huesped?.nombre;
        const clienteFinal = primerHuesped || res.huesped?.email || res.email || 'No especificado';
        let nombreTipo = `Habitación ${letraMostrada}`;
        
        // LOG: Antes de añadir nombre de evento
        console.log(`[applyFilters-Hab] Nombre base para hab ${habId}: ${nombreTipo}, asociada: ${asociada}`);
        
        if (asociada && eventoEncontrado) {
          const nombreEventoAsociado = eventoEncontrado.nombreEvento || 'Sin nombre';
          nombreTipo += ` (Evento: ${nombreEventoAsociado})`;
          // LOG: Nombre final con evento
          console.log(`[applyFilters-Hab] Nombre final para hab ${habId}: ${nombreTipo}`);
        }
        
        return {
          ...res,
          tipo: 'habitacion',
          fechaMostrada: res.fechaEntrada,
          clientePrincipal: clienteFinal,
          nombreMostrado: nombreTipo,
          asociadaAEvento: asociada,
          letraHabitacionReal: letra,
          uniqueId: `habitacion_${habId}`,
          // Pasar el nombre del evento asociado si se encontró
          nombreEventoAsociado: asociada && eventoEncontrado ? (eventoEncontrado.nombreEvento || 'Sin nombre') : null
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
          matchesUsuario = reservation.asignadoA?._id === user?.id;
        } else if (filterUsuario === 'unassigned') {
          // Mostrar solo reservas sin asignar
          matchesUsuario = !reservation.asignadoA;
        } else {
          // Mostrar reservas asignadas a un usuario específico
          matchesUsuario = reservation.asignadoA?._id === filterUsuario;
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesUsuario;
    });

    // Ordenar reservaciones
    filtered.sort((a, b) => {
      // Usar la fecha principal definida al combinar
      const aValue = a.fechaMostrada;
      const bValue = b.fechaMostrada;

      if (!aValue || !bValue) {
        console.warn('Valores de fecha inválidos para ordenar:', { aValue, bValue });
        return 0; // No ordenar si falta alguna fecha
      }

      // Convertir a fechas si son strings
      const dateA = new Date(aValue);
      const dateB = new Date(bValue);

      // Validar fechas
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        console.warn('Fechas inválidas detectadas en ordenamiento:', { aValue, bValue });
        // Decidir cómo manejar fechas inválidas, por ejemplo, moverlas al final
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1; // a después de b
        if (isNaN(dateB.getTime())) return -1; // a antes de b
      }

      let comparison = 0;
      if (dateA < dateB) {
        comparison = -1;
      } else if (dateA > dateB) {
        comparison = 1;
      }

      return sortConfig.direction === 'asc' ? comparison : comparison * -1;
    });

    setFilteredReservations(filtered);
    console.log('Reservaciones filtradas y ordenadas:', filtered.length);
  }, [
    habitacionReservations, 
    eventoReservations, 
    searchTerm, 
    filterStatus, 
    filterType, 
    filterUsuario, 
    sortConfig, 
    user?.id // Añadir user.id como dependencia si se usa en el filtro 'mine'
  ]);

  // <<< INICIO NUEVAS FUNCIONES HANDLEASIGNAR/DESASIGNAR >>>
  const handleAsignar = useCallback(async (reservationId, reservationType) => {
    if (!user || !user.id) {
      toast.error('No se pudo obtener la información del administrador.');
      return;
    }
    const adminId = user.id;
    const toastId = toast.loading('Asignando reserva...');

    try {
      let assignPromise;

      if (reservationType === 'evento') {
        assignPromise = assignEventoReservation(reservationId, adminId);
      } else if (reservationType === 'habitacion') {
        assignPromise = assignHabitacionReservation(reservationId, adminId);
      } else {
        throw new Error('Tipo de reserva inválido');
      }

      const result = await assignPromise;

      if (!result || !result.success) {
        throw new Error(result?.message || 'Error asignando la reserva principal.');
      }
      
      // --- REINTRODUCIDO: Buscar y asignar habitaciones asociadas explícitamente --- 
      let roomErrors = [];
      if (reservationType === 'evento') {
        // Buscar habitaciones asociadas en el estado actual del frontend
        const associatedRooms = habitacionReservations.filter(
          hab => String(hab.reservaEvento?._id || hab.reservaEvento) === String(reservationId)
        );
        
        if (associatedRooms.length > 0) {
          toast.loading(`Asignando ${associatedRooms.length} habitacion(es) asociada(s)...`, { id: toastId });
          const roomPromises = associatedRooms.map(room => 
            assignHabitacionReservation(room._id || room.id, adminId)
              .catch(err => ({ // Capturar errores individuales
                success: false, 
                roomId: room._id || room.id, 
                message: err.message || 'Error desconocido' 
              }))
          );
          
          const roomResults = await Promise.all(roomPromises);
          roomErrors = roomResults.filter(res => !res.success);
          
          if (roomErrors.length > 0) {
             console.error('Errores al asignar habitaciones asociadas:', roomErrors);
             // No sobreescribir el toast principal todavía, esperar a la recarga
          }
        }
      }
      // --- FIN REINTRODUCIDO ---
      
      await loadAllReservations(); // Recargar todas las reservas

      // Mostrar éxito o advertencia DESPUÉS de recargar
      if (roomErrors.length > 0) {
        toast.warning(
          `Reserva principal asignada, pero falló la asignación de ${roomErrors.length} habitacion(es). Revisar consola.`,
          { id: toastId, duration: 5000 }
        );
      } else {
         toast.success("Reserva asignada correctamente (y asociadas si aplica).", { id: toastId });
      }

    } catch (error) {
      console.error('Error en handleAsignar:', error);
      toast.error(`Error al asignar: ${error.message}`, { id: toastId });
    }
  }, [user, loadAllReservations, habitacionReservations]);

  const handleDesasignar = useCallback(async (reservationId, reservationType) => {
    const toastId = toast.loading('Desasignando reserva...');

    try {
      let unassignPromise;

      if (reservationType === 'evento') {
        unassignPromise = unassignEventoReservation(reservationId);
      } else if (reservationType === 'habitacion') {
        unassignPromise = unassignHabitacionReservation(reservationId);
      } else {
        throw new Error('Tipo de reserva inválido');
      }

      const result = await unassignPromise;

      if (!result || !result.success) {
        throw new Error(result?.message || 'Error desasignando la reserva principal.');
      }

      // --- REINTRODUCIDO: Buscar y desasignar habitaciones asociadas explícitamente --- 
      let roomErrors = [];
      if (reservationType === 'evento') {
        // Buscar habitaciones asociadas en el estado actual del frontend
        const associatedRooms = habitacionReservations.filter(
          hab => String(hab.reservaEvento?._id || hab.reservaEvento) === String(reservationId)
        );
        
        if (associatedRooms.length > 0) {
          toast.loading(`Desasignando ${associatedRooms.length} habitacion(es) asociada(s)...`, { id: toastId });
          const roomPromises = associatedRooms.map(room => 
            unassignHabitacionReservation(room._id || room.id)
              .catch(err => ({ // Capturar errores individuales
                success: false, 
                roomId: room._id || room.id, 
                message: err.message || 'Error desconocido' 
              }))
          );
          
          const roomResults = await Promise.all(roomPromises);
          roomErrors = roomResults.filter(res => !res.success);

          if (roomErrors.length > 0) {
             console.error('Errores al desasignar habitaciones asociadas:', roomErrors);
             // No sobreescribir el toast principal todavía, esperar a la recarga
          }
        }
      }
      // --- FIN REINTRODUCIDO ---

      await loadAllReservations(); // Recargar todas las reservas

      // Mostrar éxito o advertencia DESPUÉS de recargar
      if (roomErrors.length > 0) {
        toast.warning(
          `Reserva principal desasignada, pero falló la desasignación de ${roomErrors.length} habitacion(es). Revisar consola.`,
          { id: toastId, duration: 5000 }
        );
      } else {
         toast.success("Reserva desasignada correctamente (y asociadas si aplica).", { id: toastId });
      }

    } catch (error) {
      console.error('Error en handleDesasignar:', error);
      toast.error(`Error al desasignar: ${error.message}`, { id: toastId });
    }
  }, [loadAllReservations, habitacionReservations]);
  // <<< FIN NUEVAS FUNCIONES HANDLEASIGNAR/DESASIGNAR >>>

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

  // Efecto para aplicar filtros cuando cambian los datos o los filtros
  useEffect(() => {
    if (initialLoadDone) {
      applyFiltersAndSort();
    }
  }, [initialLoadDone, habitacionReservations, eventoReservations, searchTerm, filterStatus, filterType, filterUsuario, sortConfig, applyFiltersAndSort]);

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

  // --- INICIO: Funciones Handler para acciones --- 

  const handleDeleteReservation = useCallback((tipo, id) => {
    if (!id) {
      toast.error('ID de reserva inválido.');
      return;
    }
    
    showConfirmation({
      title: 'Eliminar Reservación',
      message: '¿Estás seguro de que deseas eliminar esta reservación permanentemente? Esta acción no se puede deshacer.',
      iconType: 'danger',
      confirmText: 'Sí, eliminar',
      onConfirm: async () => {
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
            await loadAllReservations();
          } else {
            throw new Error(response?.message || 'Error al eliminar la reservación'); 
          }
        } catch (error) {
          console.error('Error al eliminar reservación:', error);
          toast.error('Error al eliminar la reservación: ' + error.message);
        } finally {
          setIsLoading(false);
        }
      }
    });
  }, [loadAllReservations, showConfirmation]);

  const handleChangeReservationStatus = useCallback((tipo, id, newStatus) => {
    if (!id || !newStatus) {
      toast.error('Datos inválidos para actualizar estado.');
      return;
    }
    
    // Mapeo de estados a configuración del modal
    const statusConfig = {
      confirmada: { title: 'Confirmar Reserva', message: '¿Marcar esta reserva como confirmada?', icon: 'confirm', confirm: 'Sí, confirmar' },
      cancelada: { title: 'Cancelar Reserva', message: '¿Cancelar esta reserva? Esto podría ser irreversible.', icon: 'danger', confirm: 'Sí, cancelar' },
      pendiente: { title: 'Marcar Pendiente', message: '¿Marcar esta reserva como pendiente?', icon: 'info', confirm: 'Sí, marcar pendiente' },
      // Añadir otros estados si es necesario
    };
    
    const config = statusConfig[newStatus.toLowerCase()];
    if (!config) {
        toast.error(`Estado objetivo desconocido: ${newStatus}`);
        return;
    }

    showConfirmation({
      title: config.title,
      message: config.message,
      iconType: config.icon,
      confirmText: config.confirm,
      onConfirm: async () => {
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
            await loadAllReservations();
          } else {
            throw new Error(response?.message || 'Error al actualizar estado'); 
          }
        } catch (error) {
          console.error('Error al actualizar estado:', error);
          toast.error('Error al actualizar estado: ' + error.message);
        } finally {
          setIsLoading(false);
        }
      }
    });
  }, [loadAllReservations, showConfirmation]);

  // --- FIN: Nuevas funciones Handler para acciones ---

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
    <div className="container mx-auto p-4 md:p-6">
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
              disabled={!isAdmin}
            >
              <option value="all">Todos los usuarios</option>
              <option value="mine">Mis reservas</option>
              <option value="unassigned">Sin asignar</option>
              {usuarios
                .filter(u => u._id !== user?.id)
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.nombre ? `${u.nombre} ${u.apellidos || ''}`.trim() : u.email}
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
          onAssign={handleAsignar}
          onUnassign={handleDesasignar}
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