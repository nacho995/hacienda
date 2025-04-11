"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaCalendarAlt, FaBed, FaUsers, FaClipboardList, FaGlassCheers, FaEye, 
  FaUserCircle, FaSync, FaSpinner, FaFilter, FaSearch, FaTimes, 
  FaChartLine, FaMoneyBillWave, FaMapMarkedAlt, FaChevronDown, 
  FaChevronRight, FaArrowUp, FaArrowDown, FaHotel, FaListAlt, FaChevronLeft, FaListUl
} from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useReservation } from '../../../context/ReservationContext';
import Link from 'next/link';
import { 
  getHabitacionReservations, 
  getEventoReservations,
  getAllReservationsForDashboard,
  assignEventoReservation,
  assignHabitacionReservation,
  unassignEventoReservation,
  unassignHabitacionReservation
} from '../../../services/reservationService';
import userService from '../../../services/userService';
import { toast } from 'sonner';
import { obtenerHabitaciones } from '../../../services/habitaciones.service';
import { format, addDays, subDays, isSameDay, parseISO, isValid, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

// Define la paleta de colores pastel piedra
const COLORES_PASTEL_PIEDRA = {
  fondoPrincipal: 'bg-stone-50', // Fondo general
  fondoContenedor: 'bg-white', // Contenedores como cards
  textoPrincipal: 'text-stone-800', // Texto general
  textoSecundario: 'text-stone-600', // Texto secundario, labels
  borde: 'border-stone-200', // Bordes
  resaltado: 'bg-stone-100', // Hover, elementos activos suaves
  primario: 'bg-stone-500', // Botones principales, acentos
  primarioHover: 'bg-stone-600',
  textoPrimario: 'text-white', // Texto sobre primario
  estadoConfirmado: 'bg-green-100 text-green-800 border-green-200', // Verde pastel
  estadoPendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200', // Amarillo pastel
  estadoCancelado: 'bg-red-100 text-red-800 border-red-200', // Rojo pastel
  estadoOcupado: 'bg-stone-200 text-stone-700 border-stone-300', // Gris piedra para ocupado
  calendarioHeader: 'bg-stone-100',
  calendarioBorde: 'border-stone-200',
  calendarioTextoDia: 'text-stone-500',
  calendarioTextoNumero: 'text-stone-700',
  calendarioHoy: 'bg-stone-200 font-semibold',
  letraHabitacion: 'bg-stone-300 text-stone-800 font-semibold', // Estilo para la letra
};

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, loading: authLoading, user } = useAuth();
  const { 
    reservations, 
    habitacionReservations, 
    eventoReservations, 
    loading: reservationsLoading,
    loadAllReservations,
    updateReservation,
    removeReservation,
    error: reservationError
  } = useReservation();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    totalRooms: 14,
    occupiedRoomsToday: 0,
    availableRoomsToday: 14,
    occupiedRoomsNext7Days: 0,
    availableRoomsNext7Days: 14,
    occupiedRoomsNext30Days: 0,
    availableRoomsNext30Days: 14,
    totalUsers: 0,
    eventosHoy: 0,
    eventosNext7Days: 0,
    eventosNext30Days: 0
  });
  const [allReservations, setAllReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [assigningReservation, setAssigningReservation] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // Para controlar el mes/semana del calendario
  const [calendarView, setCalendarView] = useState('month'); // 'month' o 'week'
  const [ocupacionPorFecha, setOcupacionPorFecha] = useState([]); // Estado para ocupación por fecha
  const [rangoFechaOcupacion, setRangoFechaOcupacion] = useState('ultimos7dias'); // Estado para el rango
  
  // Referencia para el intervalo de actualización automática
  const autoRefreshInterval = useRef(null);

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

  // Función para calcular ocupación por fecha
  const calcularOcupacionPorFecha = useCallback(() => {
    const hoy = new Date();
    let fechaInicioFiltro;
    let fechaFinFiltro = endOfDay(hoy);

    switch (rangoFechaOcupacion) {
      case 'hoy':
        fechaInicioFiltro = startOfDay(hoy);
        fechaFinFiltro = endOfDay(hoy);
        break;
      case 'proximos7dias':
        fechaInicioFiltro = startOfDay(addDays(hoy, 1)); // Empezar desde mañana
        fechaFinFiltro = endOfDay(addDays(hoy, 7)); // Hasta 7 días desde hoy
        break;
      case 'proximoMes': // Lógica ajustada: Próximos 30 días desde mañana
        fechaInicioFiltro = startOfDay(addDays(hoy, 1)); // Empezar desde mañana
        fechaFinFiltro = endOfDay(addDays(hoy, 30)); // Hasta 30 días desde hoy
        break;
      case 'ultimos7dias':
      default:
        fechaInicioFiltro = startOfDay(subDays(hoy, 6));
        fechaFinFiltro = endOfDay(hoy); // Incluye hoy
        break;
    }

    const reservasFiltradas = [];

    // Filtrar reservas de habitaciones
    if (Array.isArray(habitacionReservations)) {
      habitacionReservations.forEach(reserva => {
        const fechaEntrada = reserva.fechaEntrada ? parseISO(reserva.fechaEntrada) : null;
        const fechaSalida = reserva.fechaSalida ? parseISO(reserva.fechaSalida) : null;
        if (isValid(fechaEntrada) && isValid(fechaSalida) && reserva.estado?.toLowerCase() !== 'cancelada') {
          // La reserva solapa con el rango si: reserva.entrada < filtro.fin Y reserva.salida > filtro.inicio
          if (fechaEntrada < fechaFinFiltro && fechaSalida > fechaInicioFiltro) {
            reservasFiltradas.push({ ...reserva, tipo: 'habitacion' });
          }
        }
      });
    }
    
    // Filtrar reservas de eventos
    if (Array.isArray(eventoReservations)) {
      eventoReservations.forEach(reserva => {
         const fechaEvento = reserva.fecha ? startOfDay(parseISO(reserva.fecha)) : null;
         if (isValid(fechaEvento) && reserva.estado?.toLowerCase() !== 'cancelada') {
           if (fechaEvento >= fechaInicioFiltro && fechaEvento <= fechaFinFiltro) {
             reservasFiltradas.push({ ...reserva, tipo: 'evento' });
           }
         }
      });
    }
    
    // Ordenar por fecha de inicio
    reservasFiltradas.sort((a, b) => {
      const fechaA = parseISO(a.fechaEntrada || a.fecha);
      const fechaB = parseISO(b.fechaEntrada || b.fecha);
      if (!isValid(fechaA)) return 1;
      if (!isValid(fechaB)) return -1;
      return fechaA - fechaB;
    });

    setOcupacionPorFecha(reservasFiltradas);

  }, [habitacionReservations, eventoReservations, rangoFechaOcupacion]);

  // Efecto para recalcular ocupación por fecha cuando cambien las reservas o el rango
  useEffect(() => {
    // Solo calcular si las reservas ya están cargadas (evitar cálculo inicial con datos vacíos)
    if (habitacionReservations?.length > 0 || eventoReservations?.length > 0) {
        calcularOcupacionPorFecha();
    }
  }, [habitacionReservations, eventoReservations, rangoFechaOcupacion, calcularOcupacionPorFecha]);

  // Función para cargar los datos del dashboard
  const loadDashboardData = useCallback(async (showToast = false) => {
    if (!isAuthenticated || authLoading) return;

    try {
      setRefreshing(true);
      setError(null);
      
      console.log('Iniciando carga de datos del dashboard');
      
      // Cargar usuarios primero
      await loadUsers();

      // Cargar todas las reservas
      await loadAllReservations(false);
      
      console.log('Datos de reservas disponibles:', { 
        reservations: reservations?.length || 0,
        habitacionReservations: habitacionReservations?.length || 0, 
        eventoReservations: eventoReservations?.length || 0 
      });
      
      // Calcular estadísticas usando los datos del contexto
      let totalReservations = 0;
      let pendingReservations = 0;
      let confirmedReservations = 0;
      let cancelledReservations = 0;
      
      // Procesar reservas de eventos
      if (Array.isArray(eventoReservations)) {
        totalReservations += eventoReservations.length;
        
        // ---> DEBUG: Log de eventos antes de contar <---
        console.log('[loadDashboardData] EventoReservations para contar:', eventoReservations.map(r => ({ id: r._id, estado: r.estadoReserva || r.estado })));

        eventoReservations.forEach(reserva => {
          const estado = (reserva.estadoReserva || reserva.estado)?.toLowerCase() || ''; // Usar estadoReserva primero
          if (estado === 'pendiente') pendingReservations++;
          else if (estado === 'confirmada') confirmedReservations++;
          else if (estado === 'cancelada') cancelledReservations++;
        });

        // ---> DEBUG: Log del resultado del conteo <---
        console.log('[loadDashboardData] Conteo de pendientes (eventos): ', pendingReservations);

      }
      
      // Procesar reservas de habitaciones independientes (que no pertenecen a eventos)
      if (Array.isArray(habitacionReservations)) {
        const habitacionesIndependientes = habitacionReservations.filter(
          hab => !hab.eventoId && !hab.reservaEvento
        );
        
        totalReservations += habitacionesIndependientes.length;
        
        habitacionesIndependientes.forEach(reserva => {
          const estado = reserva.estado?.toLowerCase() || '';
          if (estado === 'pendiente') pendingReservations++;
          else if (estado === 'confirmada') confirmedReservations++;
          else if (estado === 'cancelada') cancelledReservations++;
        });
      }
      
      // Obtener el número real de habitaciones físicas
      let totalPhysicalRooms = 14; // Valor por defecto
      try {
        const habitacionesData = await obtenerHabitaciones(); // Usa la función del servicio
        if (habitacionesData && Array.isArray(habitacionesData.data)) {
            totalPhysicalRooms = habitacionesData.data.length > 0 ? habitacionesData.data.length : 14;
        } else if (habitacionesData && typeof habitacionesData.count === 'number') {
            totalPhysicalRooms = habitacionesData.count > 0 ? habitacionesData.count : 14;
        } else {
           console.warn("No se pudo determinar el número total de habitaciones físicas desde la API.");
        }
      } catch (err) {
        console.error('Error al obtener el número total de habitaciones físicas:', err);
      }
      
      // Calcular habitaciones ocupadas HOY
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today); // Considerar hasta el final del día

      let occupiedTodayCount = 0;
      if (Array.isArray(habitacionReservations)) {
        const uniqueOccupiedRoomsToday = new Set(); // Para no contar la misma habitación dos veces si tiene múltiples reservas hoy

        habitacionReservations.forEach(h => {
          // Asegurarse de que las fechas son válidas
          const fechaEntrada = h.fechaEntrada ? parseISO(h.fechaEntrada) : null;
          const fechaSalida = h.fechaSalida ? parseISO(h.fechaSalida) : null;

          if (isValid(fechaEntrada) && isValid(fechaSalida) && h.estado?.toLowerCase() !== 'cancelada') {
            // Una habitación está ocupada hoy si la fecha de hoy está entre la entrada (inclusive) y la salida (exclusive)
            if (startOfToday < fechaSalida && endOfToday >= fechaEntrada) {
               // Usar letraHabitacion o _id como identificador único de la habitación física
               const habitacionIdentifier = h.letraHabitacion || h.habitacion || h._id;
               uniqueOccupiedRoomsToday.add(habitacionIdentifier);
            }
          }
        });
        occupiedTodayCount = uniqueOccupiedRoomsToday.size;
      }
      
      // Calcular ocupación PRÓXIMOS 7 DÍAS (desde mañana)
      const startOfNext7Days = startOfDay(addDays(today, 1));
      const endOfNext7Days = endOfDay(addDays(today, 7));
      const uniqueOccupiedRoomsNext7Days = new Set();
      if (Array.isArray(habitacionReservations)) {
        habitacionReservations.forEach(h => {
          const fechaEntrada = h.fechaEntrada ? parseISO(h.fechaEntrada) : null;
          const fechaSalida = h.fechaSalida ? parseISO(h.fechaSalida) : null;
          if (isValid(fechaEntrada) && isValid(fechaSalida) && h.estado?.toLowerCase() !== 'cancelada') {
            // Solapa si: reserva.entrada < periodo.fin Y reserva.salida > periodo.inicio
            if (fechaEntrada < endOfNext7Days && fechaSalida > startOfNext7Days) {
              const idHab = h.letraHabitacion || h.habitacion || h._id;
              uniqueOccupiedRoomsNext7Days.add(idHab);
            }
          }
        });
      }
      const occupiedNext7DaysCount = uniqueOccupiedRoomsNext7Days.size;

      // Calcular ocupación PRÓXIMOS 30 DÍAS (desde mañana)
      const startOfNext30Days = startOfDay(addDays(today, 1));
      const endOfNext30Days = endOfDay(addDays(today, 30));
      const uniqueOccupiedRoomsNext30Days = new Set();
      if (Array.isArray(habitacionReservations)) {
        habitacionReservations.forEach(h => {
          const fechaEntrada = h.fechaEntrada ? parseISO(h.fechaEntrada) : null;
          const fechaSalida = h.fechaSalida ? parseISO(h.fechaSalida) : null;
          if (isValid(fechaEntrada) && isValid(fechaSalida) && h.estado?.toLowerCase() !== 'cancelada') {
            if (fechaEntrada < endOfNext30Days && fechaSalida > startOfNext30Days) {
              const idHab = h.letraHabitacion || h.habitacion || h._id;
              uniqueOccupiedRoomsNext30Days.add(idHab);
            }
          }
        });
      }
      const occupiedNext30DaysCount = uniqueOccupiedRoomsNext30Days.size;
      
      // Calcular recuentos de EVENTOS
      let eventosHoyCount = 0;
      let eventosNext7DaysCount = 0;
      let eventosNext30DaysCount = 0;

      if (Array.isArray(eventoReservations)) {
        eventoReservations.forEach(e => {
          const fechaEvento = e.fecha ? parseISO(e.fecha) : null;
          if (isValid(fechaEvento) && e.estado?.toLowerCase() !== 'cancelada') {
            const startOfFechaEvento = startOfDay(fechaEvento);
            
            // Evento Hoy?
            if (isSameDay(today, fechaEvento)) {
              eventosHoyCount++;
            }
            // Evento Próx 7 días? (entre mañana y +7d)
            if (startOfFechaEvento >= startOfNext7Days && startOfFechaEvento <= endOfNext7Days) {
              eventosNext7DaysCount++;
            }
             // Evento Próx 30 días? (entre mañana y +30d)
            if (startOfFechaEvento >= startOfNext30Days && startOfFechaEvento <= endOfNext30Days) {
              eventosNext30DaysCount++;
            }
          }
        });
      }

      // Actualizar estadísticas
      const newStats = {
        totalReservations,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        totalRooms: totalPhysicalRooms, 
        occupiedRoomsToday: occupiedTodayCount, 
        availableRoomsToday: totalPhysicalRooms - occupiedTodayCount, 
        occupiedRoomsNext7Days: occupiedNext7DaysCount,
        availableRoomsNext7Days: totalPhysicalRooms - occupiedNext7DaysCount,
        occupiedRoomsNext30Days: occupiedNext30DaysCount,
        availableRoomsNext30Days: totalPhysicalRooms - occupiedNext30DaysCount,
        totalUsers: usuarios?.length || 0,
        eventosHoy: eventosHoyCount,
        eventosNext7Days: eventosNext7DaysCount,
        eventosNext30Days: eventosNext30DaysCount
      };
      
      console.log('Estadísticas calculadas:', newStats);
      setStats(newStats);
      
      setLastUpdate(new Date());
      
      if (showToast) {
        toast.success('Dashboard actualizado correctamente');
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      setError('Error al cargar los datos del dashboard');
      if (showToast) {
        toast.error('Error al cargar los datos del dashboard');
      }
    } finally {
      setRefreshing(false);
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  }, [authLoading, isAuthenticated, loadAllReservations, loadUsers, usuarios?.length, eventoReservations, habitacionReservations]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const initializeData = async () => {
      if (!authLoading && isAuthenticated && isAdmin && !initialLoadDone) {
        setIsLoading(true);
        await loadDashboardData();
      }
    };

    initializeData();
  }, [authLoading, isAuthenticated, isAdmin, initialLoadDone, loadDashboardData]);

  // Configurar actualización automática cada 2 minutos
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      if (!refreshing && !isLoading) {
        await loadDashboardData(false);
      }
    }, 120000);

    autoRefreshInterval.current = interval;
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshing, isLoading, loadDashboardData]);

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // Actualizar cuando cambien las reservas en el contexto
  useEffect(() => {
    if (!isLoading && reservations && reservations.length > 0) {
      loadDashboardData();
    }
  }, [reservations.length]);

  // Función para obtener el nombre del usuario asignado
  const getAssignedUserName = (reserva) => {
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

  // Obtener badge de estado con colores pastel piedra
  const getStatusBadge = (estado) => {
    if (!estado) return null;
    const estadoNormalizado = estado.toLowerCase();

    let badgeClass = '';
    let text = '';

    switch (estadoNormalizado) {
      case 'confirmada':
      case 'confirmado':
        badgeClass = COLORES_PASTEL_PIEDRA.estadoConfirmado;
        text = 'Confirmada';
        break;
      case 'pendiente':
        badgeClass = COLORES_PASTEL_PIEDRA.estadoPendiente;
        text = 'Pendiente';
        break;
      case 'cancelada':
      case 'cancelado':
        badgeClass = COLORES_PASTEL_PIEDRA.estadoCancelado;
        text = 'Cancelada';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'; // Default fallback
        text = estado;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}>
        {text}
      </span>
    );
  };

  const dashboardCards = [
    {
      title: 'Reservaciones',
      icon: <FaCalendarAlt className="text-amber-600" size={24} />,
      stats: [
        { label: 'Total', value: stats.totalReservations },
        { label: 'Pendientes', value: stats.pendingReservations },
        { label: 'Confirmadas', value: stats.confirmedReservations },
        { label: 'Canceladas', value: stats.cancelledReservations }
      ],
      color: 'bg-amber-50 border-amber-200'
    },
    {
      title: 'Habitaciones',
      icon: <FaBed className="text-emerald-600" size={24} />,
      stats: [
        { label: 'Total', value: stats.totalRooms },
        { label: 'Ocupadas', value: stats.occupiedRoomsToday },
        { label: 'Disponibles', value: stats.availableRoomsToday }
      ],
      color: 'bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Eventos',
      icon: <FaGlassCheers className="text-stone-600" size={24} />,
      stats: [
        { label: 'Reservados', value: eventoReservations.length },
        { label: 'Confirmados', value: eventoReservations.filter(e => e.estado && e.estado.toLowerCase() === 'confirmada').length },
        { label: 'Cancelados', value: eventoReservations.filter(e => e.estado && e.estado.toLowerCase() === 'cancelada').length }
      ],
      color: 'bg-stone-50 border-stone-200'
    }
  ];

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no válida';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Fecha inválida';
      return format(date, 'PPp', { locale: es }); // Formato: 15 jul 2024, 14:30
    } catch (error) {
      console.error("Error formateando fecha:", dateString, error);
      return 'Error de fecha';
    }
  };

  // Formatear la hora para la última actualización
  const formatLastUpdate = () => {
    if (!lastUpdate || !isValid(lastUpdate)) return 'N/A';
    return format(lastUpdate, 'PPPp', { locale: es }); // Formato más completo: Miércoles, 17 de julio de 2024, 10:30:00
  };

  // Manejar actualización manual
  const handleManualRefresh = () => {
    if (!refreshing) {
      loadDashboardData(true);
    }
  };

  // Función para abrir el modal de asignación
  const handleOpenAssignModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowAssignModal(true);
  };

  // Función para asignar una reserva a mí mismo
  const handleAssignToMe = async (reserva) => {
    if (!user || !user.id) {
      toast.error("No se pudo identificar al usuario actual.");
      return;
    }
    if (!reserva || (!reserva._id && !reserva.id)) {
      toast.error("Reserva inválida para asignar.");
      return;
    }

    setAssigningReservation(true);
    const reservaId = reserva._id || reserva.id;
    const userId = user.id;

    try {
      let response;
      if (reserva.tipo === 'evento' || reserva.eventoId || reserva.reservaEvento) {
        response = await assignEventoReservation(reservaId, userId);
      } else if (reserva.tipo === 'habitacion' || reserva.habitacionId || reserva.habitacionReservada) {
        response = await assignHabitacionReservation(reservaId, userId);
      } else {
        // Intenta deducir el tipo si no está explícito
        if (reserva.fechaEvento) {
           response = await assignEventoReservation(reservaId, userId);
        } else if (reserva.fechaEntrada) {
           response = await assignHabitacionReservation(reservaId, userId);
        } else {
          toast.error("No se pudo determinar el tipo de reserva para asignar.");
          setAssigningReservation(false);
          return;
        }
      }

      if (response && response.success) {
        toast.success(`Reserva ${reserva.nombreContacto || reserva.nombreCompleto || reservaId} asignada a ti.`);
        
        // Actualizar el estado local inmediatamente
        const updateReservation = (list) => list.map(r => {
           const currentReservaId = r._id || r.id;
           if (currentReservaId === reservaId) {
             return { ...r, asignadoA: userId }; // O asignar el objeto usuario si la API lo devuelve
           }
           return r;
         });

        if (reserva.tipo === 'evento' || reserva.eventoId || reserva.reservaEvento || reserva.fechaEvento) {
          // No tenemos un setter directo para eventoReservations desde useReservation
          // Forzar recarga completa para reflejar el cambio
           await loadDashboardData(false);
        } else {
           // Asumiendo que existe un setter para habitacionReservations o que loadAllReservations actualiza todo
           await loadDashboardData(false); // Recargar datos para asegurar consistencia
        }
        
        setShowAssignModal(false);
      } else {
        toast.error(response?.message || "Error al asignar la reserva.");
      }
    } catch (error) {
      console.error("Error asignando reserva:", error);
      toast.error("Error al asignar la reserva.");
    } finally {
      setAssigningReservation(false);
    }
  };

  // Función para desasignar una reserva
  const handleUnassign = async (reserva) => {
     if (!reserva || (!reserva._id && !reserva.id)) {
      toast.error("Reserva inválida para desasignar.");
      return;
    }
    
    setAssigningReservation(true);
    const reservaId = reserva._id || reserva.id;

    try {
      let response;
       if (reserva.tipo === 'evento' || reserva.eventoId || reserva.reservaEvento) {
        response = await unassignEventoReservation(reservaId);
      } else if (reserva.tipo === 'habitacion' || reserva.habitacionId || reserva.habitacionReservada) {
        response = await unassignHabitacionReservation(reservaId);
      } else {
         // Intenta deducir el tipo si no está explícito
         if (reserva.fechaEvento) {
            response = await unassignEventoReservation(reservaId);
         } else if (reserva.fechaEntrada) {
            response = await unassignHabitacionReservation(reservaId);
         } else {
           toast.error("No se pudo determinar el tipo de reserva para desasignar.");
           setAssigningReservation(false);
           return;
         }
      }

      if (response && response.success) {
        toast.success(`Reserva ${reserva.nombreContacto || reserva.nombreCompleto || reservaId} desasignada.`);
        
         // Actualizar el estado local inmediatamente
         const updateLocalReservation = (list) => list.map(r => {
           const currentReservaId = r._id || r.id;
           if (currentReservaId === reservaId) {
             // Crear un nuevo objeto sin la propiedad asignadoA
             const { asignadoA, ...rest } = r;
             return rest;
           }
           return r;
         });

         // Como antes, forzar recarga por falta de setters específicos
         await loadDashboardData(false);

      } else {
        toast.error(response?.message || "Error al desasignar la reserva.");
      }
    } catch (error) {
      console.error("Error desasignando reserva:", error);
      toast.error("Error al desasignar la reserva.");
    } finally {
      setAssigningReservation(false);
    }
  };

  // Obtener filtro de usuario
  const handleFilterUsuario = (e) => {
    setFiltroUsuario(e.target.value);
  };
  
  // Función para filtrar reservaciones según el filtro seleccionado
  const getFilteredReservations = (reservations) => {
    if (!Array.isArray(reservations)) return [];
    if (filtroUsuario === 'all') {
      return reservations;
    }
    if (filtroUsuario === 'me') {
      return reservations.filter(res => res.asignadoA && (res.asignadoA === user?.id || res.asignadoA?._id === user?.id));
    }
    if (filtroUsuario === 'unassigned') {
      return reservations.filter(res => !res.asignadoA);
    }
    return reservations.filter(res => res.asignadoA && (res.asignadoA === filtroUsuario || res.asignadoA?._id === filtroUsuario));
  };

  // Aplicar filtros a cada tipo de reserva
  // Memo-izar esto para evitar recálculos innecesarios
  const filteredHabitacionReservations = useMemo(() => 
    getFilteredReservations(habitacionReservations), 
    [habitacionReservations, filtroUsuario, user?.id]
  );
  
  const filteredEventoReservations = useMemo(() => 
    getFilteredReservations(eventoReservations), 
    [eventoReservations, filtroUsuario, user?.id]
  );
  
  const filteredAllReservations = useMemo(() => 
    getFilteredReservations(allReservations), 
    [allReservations, filtroUsuario, user?.id]
  );

  // --- Lógica del Calendario ---

  const nextPeriod = () => {
    if (calendarView === 'month') {
      setCurrentDate(addDays(currentDate, 31)); // Aproximado para cambiar mes
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  const prevPeriod = () => {
     if (calendarView === 'month') {
      setCurrentDate(subDays(currentDate, 31)); // Aproximado para cambiar mes
    } else {
      setCurrentDate(subDays(currentDate, 7));
    }
  };

  const getCalendarDays = () => {
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    const firstDayOfGrid = startOfWeek(firstDayOfMonth, { locale: es });
    const lastDayOfGrid = endOfWeek(lastDayOfMonth, { locale: es });
    
    return eachDayOfInterval({ start: firstDayOfGrid, end: lastDayOfGrid });
  };

  const getWeekDays = () => {
    const firstDayOfWeek = startOfWeek(currentDate, { locale: es });
    const lastDayOfWeek = endOfWeek(currentDate, { locale: es });
    return eachDayOfInterval({ start: firstDayOfWeek, end: lastDayOfWeek });
  };

  const getReservationsForDay = (day) => {
    const startOfDaySelected = startOfDay(day);
    const endOfDaySelected = endOfDay(day);
    const dayReservations = [];

    // Revisar reservas de habitaciones
    if (Array.isArray(habitacionReservations)) {
      habitacionReservations.forEach(reserva => {
        const fechaEntrada = reserva.fechaEntrada ? parseISO(reserva.fechaEntrada) : null;
        const fechaSalida = reserva.fechaSalida ? parseISO(reserva.fechaSalida) : null;
        
        if (isValid(fechaEntrada) && isValid(fechaSalida) && reserva.estado?.toLowerCase() !== 'cancelada') {
           // La reserva afecta al día si el día está entre la entrada (inclusive) y la salida (exclusive)
           if (startOfDaySelected < fechaSalida && endOfDaySelected >= fechaEntrada) {
             dayReservations.push({ ...reserva, tipo: 'habitacion' });
           }
        }
      });
    }

    // Revisar reservas de eventos
    if (Array.isArray(eventoReservations)) {
      eventoReservations.forEach(reserva => {
         // Los eventos suelen ser de un solo día, comparar la fecha del evento
         const fechaEvento = reserva.fecha ? startOfDay(parseISO(reserva.fecha)) : null;
         if (isValid(fechaEvento) && isSameDay(day, fechaEvento) && reserva.estado?.toLowerCase() !== 'cancelada') {
            dayReservations.push({ ...reserva, tipo: 'evento' });
         }
         // Si los eventos pudieran durar varios días, necesitaríamos fechaInicio/fechaFin aquí también
      });
    }
    
    return dayReservations;
  };
  
  // Renderizar letra de habitación o indicador de evento (MODIFICADO)
  const renderReservationIndicator = (reserva) => {
    const idReserva = reserva._id || 'temp-' + Math.random();
    let indicator = null; // Por defecto, no renderizar nada

    // --- 1. Mostrar Indicador de EVENTO ---
    if (reserva.tipo === 'evento') {
      const nombreEvento = reserva.nombreEvento || 'Evento';
      const tooltipText = `Evento: ${nombreEvento} (${reserva.nombreContacto || 'Cliente Desc.'})`;
      indicator = (
        <div
          key={`event-${idReserva}`}
          className="relative group cursor-pointer my-1 flex-shrink-0 w-full" // Ocupa ancho
          title={tooltipText} // Tooltip básico del navegador
        >
          {/* Estilo más prominente para eventos */}
          <div className={`p-1.5 rounded ${COLORES_PASTEL_PIEDRA.estadoConfirmado} text-center shadow-sm border ${COLORES_PASTEL_PIEDRA.borde}`}>
            <FaGlassCheers className="inline-block mr-1" size={10}/>
            <span className="font-semibold text-[10px] leading-tight">{nombreEvento}</span>
          </div>
          {/* Tooltip detallado (opcional, si se mantiene el estilo anterior) */}
          {/* <div className="absolute ...">{tooltipText}</div> */}
        </div>
      );
    }
    // --- 2. Mostrar Indicador de Habitación de HOTEL (Independiente) ---
    else if (reserva.tipo === 'habitacion' && !reserva.reservaEvento) {
        const letraHabitacion = reserva.letraHabitacion || reserva.habitacion || '?';
        const tooltipText = `Hab. Hotel ${letraHabitacion}: ${reserva.nombreContacto || 'Sin contacto'}`;
        indicator = (
          <div
            key={`room-${idReserva}`}
            className="relative group cursor-pointer m-0.5 flex-shrink-0"
            title={tooltipText}
          >
            {/* Estilo diferente y más grande para habitaciones de hotel */}
            <span
              className={`w-7 h-7 rounded ${COLORES_PASTEL_PIEDRA.letraHabitacion} flex items-center justify-center text-xs font-bold shadow border ${COLORES_PASTEL_PIEDRA.borde}`}
            >
              {letraHabitacion}
            </span>
             {/* Tooltip detallado (opcional) */}
            {/* <div className="absolute ...">{tooltipText}</div> */}
          </div>
        );
    }
    // --- 3. Habitaciones de Evento: No se renderizan (indicator sigue siendo null) ---

    return indicator;
  };

  // --- Fin Lógica del Calendario ---

  // Si está cargando, mostrar spinner
  if (authLoading || (isLoading && !initialLoadDone)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center max-w-md mx-auto">
          <div className="w-16 h-16 border-4 border-t-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Cargando dashboard</h2>
          <p className="text-gray-500 text-center">Estamos preparando los datos del panel de control.</p>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error || reservationError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-full text-stone-500 mb-4">
              <FaTimes size={24} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error al cargar los datos</h2>
            <p className="text-gray-600">{error || reservationError}</p>
          </div>
          
          <button 
            onClick={handleManualRefresh}
            className="w-full bg-stone-600 hover:bg-stone-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" />
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // Renderizar contenido principal
  return (
    <div className={`p-4 md:p-6 ${COLORES_PASTEL_PIEDRA.fondoPrincipal} min-h-screen ${COLORES_PASTEL_PIEDRA.textoPrincipal}`}>
      {/* Header con título y actualización */}
      <header className={`${COLORES_PASTEL_PIEDRA.fondoContenedor} rounded-xl shadow-sm mb-6`}>
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleManualRefresh} 
                disabled={refreshing}
                className={`${COLORES_PASTEL_PIEDRA.primario} ${COLORES_PASTEL_PIEDRA.textoPrimario} hover:${COLORES_PASTEL_PIEDRA.primarioHover} font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> 
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
          <p className={`${COLORES_PASTEL_PIEDRA.textoSecundario} text-sm`}>
            Última actualización: {formatLastUpdate()}
          </p>
        </div>
      </header>

      {/* Estadísticas */}
      <DashboardStats stats={stats} COLORES_PASTEL_PIEDRA={COLORES_PASTEL_PIEDRA} />

      {/* Calendario de Ocupación */}
       <div className={`${COLORES_PASTEL_PIEDRA.fondoContenedor} rounded-xl shadow-sm mb-6 p-4 md:p-6`}>
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Calendario de Ocupación</h2>
             <div className="flex items-center gap-2">
                 <button onClick={prevPeriod} className={`p-2 rounded ${COLORES_PASTEL_PIEDRA.resaltado} hover:bg-stone-200`}><FaChevronLeft /></button>
                 <span className="font-medium text-lg capitalize">
                  {format(currentDate, calendarView === 'month' ? 'MMMM yyyy' : "'Semana del' dd MMMM", { locale: es })}
                </span>
                 <button onClick={nextPeriod} className={`p-2 rounded ${COLORES_PASTEL_PIEDRA.resaltado} hover:bg-stone-200`}><FaChevronRight /></button>
                 <select 
                     value={calendarView} 
                     onChange={(e) => setCalendarView(e.target.value)}
                     className={`ml-4 p-2 border ${COLORES_PASTEL_PIEDRA.borde} rounded ${COLORES_PASTEL_PIEDRA.fondoContenedor}`}
                 >
                     <option value="month">Mes</option>
                     <option value="week">Semana</option>
                 </select>
             </div>
         </div>

         {calendarView === 'month' ? (
            <CalendarMonthView 
                currentDate={currentDate}
                getCalendarDays={getCalendarDays}
                getReservationsForDay={getReservationsForDay}
                renderReservationIndicator={renderReservationIndicator}
                COLORES_PASTEL_PIEDRA={COLORES_PASTEL_PIEDRA}
            />
          ) : (
            <CalendarWeekView
                currentDate={currentDate}
                getWeekDays={getWeekDays}
                getReservationsForDay={getReservationsForDay}
                renderReservationIndicator={renderReservationIndicator}
                COLORES_PASTEL_PIEDRA={COLORES_PASTEL_PIEDRA}
             />
          )}
      </div>

      {/* Listado de Próximas Reservas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal - Reservas de eventos recientes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sección de reservas de eventos */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaCalendarAlt className="text-stone-500 mr-2" />
                Próximos Eventos
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar evento..."
                    className="pl-8 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                  <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                </div>
                <Link 
                  href="/admin/reservaciones"
                  className="text-stone-600 hover:text-stone-800 flex items-center text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Ver todos <FaChevronRight className="ml-1" size={12} />
                </Link>
              </div>
            </div>
            
            {/* Tabla de eventos */}
            {!Array.isArray(eventoReservations) || eventoReservations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50">
                <FaCalendarAlt className="mx-auto text-gray-300 text-4xl mb-3" />
                <p className="text-gray-500">No hay reservas de eventos disponibles</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {eventoReservations.slice(0, 5).map((reserva) => {
                      const fecha = reserva.fechaEvento || reserva.fecha;
                      const nombreEvento = typeof reserva.tipoEvento === 'object' 
                        ? (reserva.tipoEvento?.nombre || reserva.tipoEvento?.titulo || 'Evento') 
                        : (reserva.tipoEvento || 'Evento');
                      
                      return (
                        <tr key={reserva._id || reserva.id} className="hover:bg-gray-50 transition-all">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                                <FaGlassCheers />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{nombreEvento}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{format(new Date(fecha), 'dd MMM yyyy', { locale: es })}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {`${reserva.nombreContacto || ''} ${reserva.apellidosContacto || ''}`.trim() || 'Sin nombre'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {reserva.emailContacto || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                (reserva.estadoReserva || reserva.estado)?.toLowerCase() === 'confirmada' ? COLORES_PASTEL_PIEDRA.estadoConfirmado :
                                (reserva.estadoReserva || reserva.estado)?.toLowerCase() === 'pendiente' ? COLORES_PASTEL_PIEDRA.estadoPendiente :
                                (reserva.estadoReserva || reserva.estado)?.toLowerCase() === 'cancelada' ? COLORES_PASTEL_PIEDRA.estadoCancelado :
                                'bg-gray-100 text-gray-800 border-gray-200' // Fallback
                            }`}>
                              {(reserva.estadoReserva || reserva.estado) ? ((reserva.estadoReserva || reserva.estado).charAt(0).toUpperCase() + (reserva.estadoReserva || reserva.estado).slice(1)) : 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Link 
                              href={`/admin/reservaciones/evento/${reserva._id || reserva.id}`}
                              className="text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 p-2 rounded-lg inline-flex transition-colors"
                            >
                              <FaEye />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral - Secciones apiladas */}
        <div className="space-y-6">
          {/* Widget de habitaciones recientes */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaBed className="text-stone-500 mr-2" />
                Próximas Reservas
              </h3>
              <Link 
                href="/admin/habitaciones"
                className="text-stone-600 hover:text-stone-800 flex items-center text-sm font-medium"
              >
                Ver todas <FaChevronRight className="ml-1" size={12} />
              </Link>
            </div>
            
            {!Array.isArray(habitacionReservations) || habitacionReservations.length === 0 ? (
              <div className="text-center py-10 bg-gray-50">
                <FaBed className="mx-auto text-gray-300 text-3xl mb-2" />
                <p className="text-gray-500">No hay reservas de habitaciones</p>
              </div>
            ) : (
              <div className="p-4">
                <ul className="space-y-3">
                  {habitacionReservations.slice(0, 5).map((reserva) => {
                    // Lógica más robusta para obtener la letra, comprobando el tipo
                    let letraHabitacion = '?';
                    if (reserva.habitacion) {
                      if (typeof reserva.habitacion === 'string') {
                        letraHabitacion = reserva.habitacion; // Usar directamente si es string
                      } else if (typeof reserva.habitacion === 'object' && reserva.habitacion.letra) {
                        // Manejar si inesperadamente es un objeto populado
                        letraHabitacion = reserva.habitacion.letra; 
                      } else {
                        // Log para depurar otros tipos inesperados
                        console.warn('[Dashboard] Tipo inesperado para reserva.habitacion:', typeof reserva.habitacion, reserva.habitacion);
                      }
                    }
                    
                    return (
                      <li key={reserva._id || reserva.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors">
                        <div className="flex items-center">
                          <div className="text-xl text-stone-800 flex items-center justify-center font-bold mr-3"> 
                            {letraHabitacion}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Habitación {letraHabitacion !== '?' ? letraHabitacion : 'Desconocida'}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <FaCalendarAlt className="mr-1 text-gray-400" size={10} />
                              {reserva.fechaEntrada && format(new Date(reserva.fechaEntrada), 'dd MMM', { locale: es })}
                              {reserva.fechaSalida && ` - ${format(new Date(reserva.fechaSalida), 'dd MMM', { locale: es })}`}
                            </p>
                          </div>
                        </div>
                        <Link 
                          href={`/admin/reservaciones/habitacion/${reserva._id || reserva.id}`}
                          className="text-stone-600 hover:text-stone-900 bg-white border border-gray-200 shadow-sm p-1.5 rounded-lg"
                        >
                          <FaEye size={14} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila Inferior (Lista de Ocupación por fecha y Resumen Actividad CORRECTO) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Ocupación por fecha (Columna Izquierda) */}
        <div className={`lg:col-span-2 ${COLORES_PASTEL_PIEDRA.fondoContenedor} rounded-xl shadow p-4 ${COLORES_PASTEL_PIEDRA.borde} border`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${COLORES_PASTEL_PIEDRA.textoPrincipal} flex items-center`}><FaListAlt className="mr-2" /> Ocupación por fecha</h3>
            {/* Selector de Rango */}
            <select 
              value={rangoFechaOcupacion} 
              onChange={(e) => setRangoFechaOcupacion(e.target.value)}
              className={`text-sm p-1 border rounded ${COLORES_PASTEL_PIEDRA.borde} ${COLORES_PASTEL_PIEDRA.textoSecundario} bg-transparent focus:outline-none focus:ring-1 focus:ring-stone-400`}
            >
              <option value="ultimos7dias">Últimos 7 días</option>
              <option value="hoy">Hoy</option>
              <option value="proximos7dias">Próximos 7 días</option>
              <option value="proximoMes">Próximo mes</option>
            </select>
          </div>
          
          {/* Lista de Reservas */}
          {reservationsLoading ? (
             <div className="text-center py-6">
                <FaSpinner className="animate-spin text-xl text-stone-500 mx-auto mb-2" />
             </div>
          ) : ocupacionPorFecha.length === 0 ? (
            <p className={`${COLORES_PASTEL_PIEDRA.textoSecundario} text-sm text-center py-6`}>No hay ocupación en el periodo seleccionado.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {ocupacionPorFecha.map((reserva) => {
                const id = reserva._id || reserva.id || `res-${Math.random()}`;
                const esHabitacion = reserva.tipo === 'habitacion';
                const fechaInicio = parseISO(reserva.fechaEntrada || reserva.fecha);
                const fechaFin = parseISO(reserva.fechaSalida || reserva.fecha);
                const titulo = esHabitacion ? `Hab. ${reserva.letraHabitacion || reserva.habitacion}` : (reserva.nombreEvento || 'Evento');
                const contacto = esHabitacion ? `${reserva.nombreContacto || ''} ${reserva.apellidosContacto || ''}`.trim() : (reserva.nombreContacto || 'Sin contacto');
                const url = esHabitacion ? `/admin/reservaciones/habitacion/${id}` : `/admin/reservaciones/evento/${id}`;
                
                return (
                  <Link href={url} key={id} className={`block p-3 rounded-lg border hover:shadow-sm transition-shadow ${COLORES_PASTEL_PIEDRA.resaltado} ${COLORES_PASTEL_PIEDRA.borde}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-semibold text-sm ${COLORES_PASTEL_PIEDRA.textoPrincipal}`}>{titulo}</p>
                        <p className={`text-xs ${COLORES_PASTEL_PIEDRA.textoSecundario}`}>{contacto || 'Invitado evento'}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${reserva.estado === 'confirmada' ? COLORES_PASTEL_PIEDRA.estadoConfirmado : COLORES_PASTEL_PIEDRA.estadoPendiente}`}>{reserva.estado}</span>
                    </div>
                    <div className={`mt-1 text-xs ${COLORES_PASTEL_PIEDRA.textoSecundario} flex items-center gap-1`}>
                      <FaCalendarAlt size={10}/> 
                      <span>{isValid(fechaInicio) ? format(fechaInicio, 'dd MMM', { locale: es }) : '--'}</span>
                      {isValid(fechaFin) && !isSameDay(fechaInicio, fechaFin) && (
                         <><span>-</span> <span>{format(fechaFin, 'dd MMM', { locale: es })}</span></>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumen de Actividad (Columna derecha - ESTE ES EL QUE SE QUEDA) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaUsers className="text-stone-500 mr-2" />
                Resumen de Actividad
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-stone-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Usuarios activos</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-lg">{stats.totalUsers}</span>
                    <FaUsers className="text-stone-500" />
                  </div>
                </div>
                
                <div className="bg-stone-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Eventos pendientes</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-lg">{stats.pendingReservations}</span>
                    <FaListAlt className="text-amber-500" />
                  </div>
                </div>

                <div className="bg-stone-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Eventos Totales</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-lg">{eventoReservations?.length ?? 0}</span>
                    <FaGlassCheers className="text-indigo-500" />
                  </div>
                </div>

              </div>

              <Link
                href="/admin/reservaciones"
                className="block text-center bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 px-4 rounded-lg mt-2 transition-colors"
              >
                Ver todas las reservas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardStats({ stats, COLORES_PASTEL_PIEDRA }) {
  const StatCard = ({ icon: Icon, title, value, colorClass }) => (
    <div className={`${COLORES_PASTEL_PIEDRA.fondoContenedor} rounded-xl shadow p-4 flex items-center space-x-4 ${COLORES_PASTEL_PIEDRA.borde} border`}>
      <div className={`p-3 rounded-full ${colorClass}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className={`text-sm font-medium ${COLORES_PASTEL_PIEDRA.textoSecundario}`}>{title}</p>
        <p className={`text-2xl font-semibold ${COLORES_PASTEL_PIEDRA.textoPrincipal}`}>{value ?? 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <StatCard 
        icon={FaHotel} 
        title="Hab. Disponibles Hoy" 
        value={stats.availableRoomsToday} 
        colorClass="bg-green-500" 
      />
      <StatCard 
        icon={FaHotel}
        title="Hab. Disponibles Próx. 7d" 
        value={stats.availableRoomsNext7Days} 
        colorClass="bg-teal-500"
      />
       <StatCard 
        icon={FaHotel}
        title="Hab. Disponibles Próx. 30d" 
        value={stats.availableRoomsNext30Days} 
        colorClass="bg-cyan-500"
      />
      <StatCard 
        icon={FaBed} 
        title="Hab. Ocupadas Hoy" 
        value={stats.occupiedRoomsToday} 
        colorClass="bg-orange-500" 
      />
      <StatCard 
        icon={FaBed}
        title="Hab. Ocupadas Próx. 7d" 
        value={stats.occupiedRoomsNext7Days}
        colorClass="bg-red-500"
      />
      <StatCard 
        icon={FaBed}
        title="Hab. Ocupadas Próx. 30d" 
        value={stats.occupiedRoomsNext30Days}
        colorClass="bg-pink-500"
      />
      <StatCard 
        icon={FaGlassCheers}
        title="Eventos Hoy" 
        value={stats.eventosHoy}
        colorClass="bg-indigo-500"
      />
      <StatCard 
        icon={FaGlassCheers}
        title="Eventos Próx. 7d" 
        value={stats.eventosNext7Days}
        colorClass="bg-purple-500"
      />
      <StatCard 
        icon={FaGlassCheers}
        title="Eventos Próx. 30d" 
        value={stats.eventosNext30Days}
        colorClass="bg-fuchsia-500"
      />
    </div>
  );
}

// --- Componentes del Calendario ---

function CalendarMonthView({ currentDate, getCalendarDays, getReservationsForDay, renderReservationIndicator, COLORES_PASTEL_PIEDRA }) {
  const days = getCalendarDays();
  const dayHeaders = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  return (
    <div className={`${COLORES_PASTEL_PIEDRA.fondoContenedor} rounded-xl shadow-lg overflow-hidden ${COLORES_PASTEL_PIEDRA.borde} border`}>
      {/* ... (cabecera del calendario) ... */}
      <div className="grid grid-cols-7 border-t ${COLORES_PASTEL_PIEDRA.calendarioBorde}">
        {/* Headers de días */}
        {dayHeaders.map((header) => (
          <div key={header} className={`text-center py-2 text-xs font-medium ${COLORES_PASTEL_PIEDRA.calendarioTextoDia} border-b ${COLORES_PASTEL_PIEDRA.calendarioBorde}`}>
            {header}
          </div>
        ))}
        
        {/* Días del mes */}
        {days.map((day, index) => {
          const dayReservations = getReservationsForDay(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={index}
              className={`relative border-b border-r ${COLORES_PASTEL_PIEDRA.calendarioBorde} p-1 min-h-[100px] ${isCurrentMonth ? '' : 'bg-stone-50 opacity-70'} ${index % 7 === 6 ? 'border-r-0' : ''}`}
            >
              <span className={`absolute top-1 right-1 text-xs ${isToday ? 'font-bold text-red-600' : COLORES_PASTEL_PIEDRA.calendarioTextoNumero}`}>
                {format(day, 'd')}
              </span>
              {/* Contenedor de indicadores con flex-wrap */}
              <div className="mt-4 flex flex-wrap items-start justify-start gap-0.5">
                {/* Procesar TODAS las reservas del día; renderReservationIndicator decidirá qué mostrar */}
                {dayReservations.map(reserva => renderReservationIndicator(reserva))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function CalendarWeekView({ currentDate, getWeekDays, getReservationsForDay, renderReservationIndicator, COLORES_PASTEL_PIEDRA }) {
    const days = getWeekDays();
    const today = new Date();
    
    return (
         <div>
            {/* Header de días de la semana */}
             <div className={`grid grid-cols-7 gap-px ${COLORES_PASTEL_PIEDRA.calendarioHeader} rounded-t-lg border-l border-r border-t ${COLORES_PASTEL_PIEDRA.calendarioBorde}`}>
                 {days.map(day => (
                    <div key={day.toISOString()} className={`py-2 text-center text-xs font-medium ${COLORES_PASTEL_PIEDRA.textoDia} uppercase ${isSameDay(day, today) ? 'font-bold' : ''}`}>
                         {format(day, 'EEE d', { locale: es })} {/* Muestra día y número */}
                     </div>
                 ))}
             </div>
             {/* Grid de días */}
             <div className={`grid grid-cols-7 gap-px border ${COLORES_PASTEL_PIEDRA.calendarioBorde} rounded-b-lg bg-stone-100`}>
                 {days.map(day => {
                     const isToday = isSameDay(day, today);
                     const reservations = getReservationsForDay(day);
                     const cellClasses = `
                         ${COLORES_PASTEL_PIEDRA.fondoContenedor} p-2 min-h-[150px] relative
                         ${isToday ? COLORES_PASTEL_PIEDRA.calendarioHoy : ''}
                     `;

                     return (
                         <div key={day.toISOString()} className={cellClasses}>
                             {/* Ya no necesitamos mostrar el número aquí ya que está en el header */}
                             <div className="mt-1 flex flex-wrap">
                                 {reservations.map(res => renderReservationIndicator(res))}
                             </div>
                         </div>
                     );
                 })}
             </div>
         </div>
    );
}