"use client";

import { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import { FaEdit, FaTrash, FaBed, FaUserFriends, FaCalendarAlt, FaSpinner, FaEye,
         FaSync, FaUserPlus, FaUserMinus, FaUserCheck, FaFilter, FaSort, FaSearch,
         FaTimes, FaChevronDown, FaChevronRight, FaMapMarkerAlt, FaEuroSign, FaArrowUp, FaArrowDown,
         FaEllipsisV, FaCheck } from 'react-icons/fa';
import { assignHabitacionReservation, unassignHabitacionReservation } from '@/services/reservationService';
import { useAuth } from '@/context/AuthContext';
import { useReservation } from '@/context/ReservationContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';

// Copiar o importar definición de RoomTableView y helpers
// (Asumiendo que RoomTableView está definido más abajo o importado)

export default function AdminHotelReservations() {
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

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoadingUsuarios(true);
      const response = await apiClient.get('/users');
      if (response && response.data && Array.isArray(response.data)) {
        setUsuarios(response.data);
      } else {
        console.log('No se recibieron datos válidos de usuarios');
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
      console.error("Error en carga inicial (Reservas Hotel):", err);
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
        toast.error('Datos incompletos'); return;
      }
      const response = await assignHabitacionReservation(reservaId, usuarioId);
      if (response.success) {
        toast.success('Reserva asignada');
        loadAllReservations(false);
      } else {
        toast.error(response.message || 'Error al asignar');
      }
    } catch (error) {
      console.error('Error asignando:', error);
      toast.error('Error asignando reserva');
    } finally {
      setIsAsignando(false);
      setShowAsignarModal(false);
      setOpenActionMenu(null);
    }
  };

  const handleDesasignarHabitacion = async (reservaId) => {
    try {
      setIsAsignando(true);
      const response = await unassignHabitacionReservation(reservaId);
      if (response.success) {
        toast.success('Reserva desasignada');
        loadAllReservations(false);
      } else {
        toast.error(response.message || 'Error al desasignar');
      }
    } catch (error) {
      console.error('Error desasignando:', error);
      toast.error('Error desasignando reserva');
    } finally {
      setIsAsignando(false);
      setOpenActionMenu(null);
    }
  };

  const abrirModalAsignar = (reservaHabitacion) => {
    setSelectedReserva(reservaHabitacion);
    setShowAsignarModal(true);
  };

  const toggleRoomExpand = (reservaId) => {
    setExpandedRoom(prev => (prev === reservaId ? null : reservaId));
  };

  // Definir getLetraHabitacion aquí o importarlo
  const getLetraHabitacion = (reserva) => {
      return reserva?.letraHabitacion || reserva?.habitacion?.letra || (typeof reserva?.habitacion === 'string' ? reserva.habitacion : '?');
  };


  const filteredAndSortedReservations = useMemo(() => {
    let currentList = habitacionReservations.filter(r => r.tipoReserva === 'hotel' || !r.tipoReserva);

    if (searchTerm) {
       const lowerSearch = searchTerm.toLowerCase();
       currentList = currentList.filter(r =>
         r.nombreContacto?.toLowerCase().includes(lowerSearch) ||
         r.apellidosContacto?.toLowerCase().includes(lowerSearch) ||
         r.emailContacto?.toLowerCase().includes(lowerSearch) ||
         r.telefonoContacto?.includes(lowerSearch) ||
         getLetraHabitacion(r)?.toLowerCase().includes(lowerSearch)
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
          valA = a.fechaEntrada || a.fecha || '';
          valB = b.fechaEntrada || b.fecha || '';
          break;
        case 'nombre':
          valA = `${a.nombreContacto || ''} ${a.apellidosContacto || ''}`.trim();
          valB = `${b.nombreContacto || ''} ${b.apellidosContacto || ''}`.trim();
          break;
        case 'estado':
          valA = a.estadoReserva || '';
          valB = b.estadoReserva || '';
          break;
        default:
          return 0;
      }
      if (valA < valB || valA === undefined || valA === null) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB || valB === undefined || valB === null) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return currentList;
  }, [habitacionReservations, searchTerm, filterEstado, selectedPiso, sortBy, sortOrder]);

  // Definir helpers aquí o importarlos
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
     if (typeof reserva.asignadoA === 'string') {
       const usuarioAsignado = usuarios.find(u => u._id === reserva.asignadoA);
       return usuarioAsignado ? `${usuarioAsignado.nombre} ${usuarioAsignado.apellidos || ''}` : 'Usuario desc.';
     }
     if (typeof reserva.asignadoA === 'object') {
       return `${reserva.asignadoA.nombre || ''} ${reserva.asignadoA.apellidos || ''}`;
     }
     return 'Sin asignar';
  };
  const formatearFecha = (fecha) => {
     if (!fecha) return 'N/A';
     try { return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }); }
     catch (e) { return fecha; }
  };

  // --- Fin Helpers UI ---

  // --- Handlers (sin cambios) ---
  const handleRetry = () => { loadInitialData(); };
  const handleSortChange = (campo) => {
    if (sortBy === campo) { setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc')); }
    else { setSortBy(campo); setSortOrder('asc'); }
    setShowDropdownSort(false);
  };
  const renderSortIcon = (campo) => {
     if (sortBy !== campo) return null;
     return sortOrder === 'asc' ? <FaArrowUp className="ml-1 inline" /> : <FaArrowDown className="ml-1 inline" />;
  };
  // --- Fin Handlers ---

  // <<< MOVER ESTAS DEFINICIONES ANTES DE LOS RETURNS >>>
  const estadosReserva = ['pendiente', 'confirmada', 'pagada', 'cancelada', 'completada'];
  const pisosDisponibles = useMemo(() => {
     const pisos = habitacionReservations
       .filter(r => r.tipoReserva === 'hotel' || !r.tipoReserva) // Filtrar solo hotel aquí también
       .map(hab => hab.planta || 'No especificado') // Asumiendo que 'planta' está en ReservaHabitacion
       .filter((piso, index, self) => self.indexOf(piso) === index);
     return ['todos', ...pisos];
   }, [habitacionReservations]);
  // <<< FIN MOVIMIENTO >>>

  // --- Handlers de Reserva (Adaptar y añadir nuevos) ---
  const handleConfirmarReserva = async (reservaId) => {
    setOpenActionMenu(null);
    if (!reservaId) return;
    try {
      console.log(`Confirmando reserva ${reservaId}...`);
      // TODO: API call for hotel reservation confirmation
      toast.info('Funcionalidad "Confirmar" (Hotel) pendiente de API.');
    } catch (error) {
      toast.error('Error al confirmar la reserva de hotel');
      console.error('Error confirmando reserva hotel:', error);
    }
  };

  const handleCancelarReserva = async (reservaId) => {
    setOpenActionMenu(null);
    if (!reservaId) return;
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva de hotel?')) {
        try {
            console.log(`Cancelando reserva ${reservaId}...`);
            // TODO: API call for hotel reservation cancellation
            toast.info('Funcionalidad "Cancelar" (Hotel) pendiente de API.');
        } catch (error) {
            toast.error('Error al cancelar la reserva de hotel');
            console.error('Error cancelando reserva hotel:', error);
        }
    }
  };

  const handleEliminarReserva = async (reservaId) => {
    setOpenActionMenu(null);
    if (!reservaId) return;
    if (window.confirm('¡Acción irreversible! ¿Estás seguro de que quieres ELIMINAR esta reserva de hotel permanentemente?')) {
      try {
        console.log(`Eliminando reserva ${reservaId}...`);
        // TODO: API call for hotel reservation deletion
         toast.info('Funcionalidad "Eliminar" (Hotel) pendiente de API.');
      } catch (error) {
        toast.error('Error al eliminar la reserva de hotel');
        console.error('Error eliminando reserva hotel:', error);
      }
    }
  };

  // --- Renderizado principal ---
  if (authLoading || (isLoading && !initialLoadDone)) { 
      return <div className="p-6 text-center"><FaSpinner className="animate-spin mx-auto text-3xl"/></div>;
  }
  if (error) { 
      return <div className="p-6 text-center text-red-600">{error} <button onClick={handleRetry}>Reintentar</button></div>;
   }
  
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Gestión de Reservas de Hotel</h1>

      {/* Barra de Filtros */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
           {/* Búsqueda */}
           <div className="relative">
             <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="absolute inset-y-0 left-0 pl-3 pt-6 flex items-center pointer-events-none">
                 <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
             <input type="text" id="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"/>
           </div>
           {/* Filtro Estado */}
           <div className="relative">
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado Reserva</label>
              <select id="estado" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none">
                 <option value="todos">Todos</option>
                 {estadosReserva.map(estado => (<option key={estado} value={estado}>{estado.charAt(0).toUpperCase() + estado.slice(1)}</option>))}
              </select>
               <div className="absolute inset-y-0 right-0 pt-5 flex items-center px-2 pointer-events-none"> <FaChevronDown className="h-4 w-4 text-gray-400" /> </div>
           </div>
            {/* Filtro Piso */}
           <div className="relative">
               <label htmlFor="piso" className="block text-sm font-medium text-gray-700 mb-1">Piso</label>
               <select id="piso" value={selectedPiso} onChange={(e) => setSelectedPiso(e.target.value)} className="w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none">
                   <option value="todos">Todos</option>
                   <option value="baja">Planta Baja (A-F)</option>
                   <option value="alta">Planta Alta (G-O)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pt-5 flex items-center px-2 pointer-events-none"> <FaChevronDown className="h-4 w-4 text-gray-400" /> </div>
           </div>
           {/* Botón Recargar */}
           <div>
             <button onClick={() => loadAllReservations(true)} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
               <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> {isLoading ? 'Cargando...' : 'Recargar Datos'}
             </button>
           </div>
         </div>
      </div>

      {/* Vista de Resultados */}
      {filteredAndSortedReservations.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-200">
          <FaBed className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron reservas de hotel</h3>
          <p className="mt-1 text-sm text-gray-500">
             No hay reservas de hotel que coincidan con los filtros actuales.
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
           totalReservationsCount={habitacionReservations.filter(r => r.tipoReserva === 'hotel' || !r.tipoReserva).length}
           loadingUsuarios={loadingUsuarios}
           openActionMenu={openActionMenu}
           setOpenActionMenu={setOpenActionMenu}
           onConfirmarReserva={handleConfirmarReserva}
           onCancelarReserva={handleCancelarReserva}
           onEliminarReserva={handleEliminarReserva}
           onAsignarReserva={abrirModalAsignar}
           onDesasignarReserva={handleDesasignarHabitacion}
         />
      )}

      {/* Modal Asignar */}
      {showAsignarModal && selectedReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl p-5 max-w-lg w-full mx-auto">
               <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                   <h3 className="text-lg font-semibold text-gray-800">
                      Asignar Reserva Hotel (Hab. {getLetraHabitacion(selectedReserva)})
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

// ----- Definición de RoomTableView y Helpers -----
// (COPIA Y PEGA aquí las definiciones de RoomTableView, getStatusColor, getStatusText,
// getNombreUsuarioAsignado, getLetraHabitacion, formatearFecha desde
// frontend/src/app/admin/habitaciones/page.jsx si no están en un archivo compartido)

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

              // URL de detalle específica para reservas de hotel
              const detalleUrl = `/admin/reservas-hotel/${reservaId}`; // Asumiendo esta ruta
              const canViewDetails = true; // Asumiendo que siempre se pueden ver
              const canConfirm = reserva.estadoReserva === 'pendiente';
              const canCancel = !['cancelada', 'completada'].includes(reserva.estadoReserva);
              const canDelete = true; // Permitir eliminar por defecto
              const canAssign = reserva.estadoReserva !== 'cancelada';

              return (
                <Fragment key={reservaId}>
                   <tr className={`hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}>
                      {/* Celda Expander */}
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
                      {/* Celda Letra Habitación */}
                      <td className="px-4 py-3 whitespace-nowrap">
                         <div className="flex items-center">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColorClass.replace('text-', 'bg-').split(' ')[0].replace('bg-opacity-50','')} bg-opacity-20 mr-3 flex-shrink-0`}>
                              <span className={`font-bold text-sm ${statusColorClass.split(' ')[1]}`}>{letraHabitacion}</span>
                           </div>
                         </div>
                      </td>
                       {/* Celda Contacto */}
                      <td className="px-4 py-3 whitespace-nowrap">
                         <div className="text-sm font-medium text-gray-900">{reserva.nombreContacto} {reserva.apellidosContacto}</div>
                         <div className="text-xs text-gray-500">{reserva.emailContacto}</div>
                         <div className="text-xs text-gray-500">{reserva.telefonoContacto}</div>
                      </td>
                      {/* Celda Fechas */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          <div>Ent: {formatearFecha(reserva.fechaEntrada)}</div>
                          <div>Sal: {formatearFecha(reserva.fechaSalida)}</div>
                      </td>
                      {/* Celda Estado Reserva */}
                      <td className="px-4 py-3 whitespace-nowrap">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}>
                           {statusText}
                         </span>
                      </td>
                       {/* Celda Asignado A */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          <span className={`${!estaAsignada ? 'italic text-gray-400' : ''}`}>
                             {nombreAsignado}
                          </span>
                      </td>

                    {/* Celda de Acciones con Menú Desplegable */}
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
                                    <Link href={detalleUrl} legacyBehavior>
                                        <a
                                           role="menuitem"
                                           tabIndex="-1"
                                           className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 w-full text-left flex items-center"
                                           onClick={() => setOpenActionMenu(null)}
                                        >
                                            <FaEye className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                                            Ver Detalles
                                        </a>
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
                                       ) :
                                       asignadaAlUsuarioActual ? (
                                          <button
                                             onClick={() => { onDesasignarReserva(reservaId); setOpenActionMenu(null); }}
                                             className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 w-full text-left flex items-center"
                                             role="menuitem"
                                             tabIndex="-1"
                                          >
                                              <FaUserMinus className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                                              Desasignarme
                                          </button>
                                       ) :
                                       (
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

                  {/* Fila Expandida con Detalles (adaptada para hotel) */}
                  {isExpanded && (
                    <tr className="bg-white border-l-4 border-purple-200">
                      <td colSpan="7" className="px-4 py-3">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 text-xs p-2">
                            {/* Col 1: Detalles Contacto */}
                             <div>
                                <h4 className="font-semibold text-gray-600 mb-1">Detalles Contacto</h4>
                                <p><span className="text-gray-500">Nombre:</span> {reserva.nombreContacto} {reserva.apellidosContacto}</p>
                                <p><span className="text-gray-500">Email:</span> {reserva.emailContacto || 'N/A'}</p>
                                <p><span className="text-gray-500">Teléfono:</span> {reserva.telefonoContacto || 'N/A'}</p>
                                {reserva.dniContacto && <p><span className="text-gray-500">DNI:</span> {reserva.dniContacto}</p>}
                             </div>
                             {/* Col 2: Detalles Reserva */}
                             <div>
                                 <h4 className="font-semibold text-gray-600 mb-1">Detalles Reserva</h4>
                                 <p><span className="text-gray-500">ID Reserva:</span> <span className="font-mono text-[11px]">{reserva._id}</span></p>
                                 {/* <p><span className="text-gray-500">Tipo:</span> {reserva.tipoReserva || 'hotel'}</p> */} {/* Omitir si siempre es hotel */}
                                 <p><span className="text-gray-500">Estado:</span> {reserva.estadoReserva}</p>
                                 <p><span className="text-gray-500">Fecha Creación:</span> {formatearFecha(reserva.createdAt)}</p>
                                 <p><span className="text-gray-500">Num Huéspedes:</span> {reserva.numHuespedes || 'N/A'}</p>
                                 {typeof reserva.precioTotal === 'number' && <p><span className="text-gray-500">Precio:</span> {reserva.precioTotal.toFixed(2)} €</p>}
                             </div>
                             {/* Col 3: Notas (si existe el campo) */}
                              {reserva.notas && (
                                 <div>
                                    <h4 className="font-semibold text-gray-600 mb-1">Notas Adicionales</h4>
                                    <p className="text-gray-500 italic whitespace-pre-wrap">{reserva.notas}</p>
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
        {/* Footer de la tabla */}
       <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Mostrando {habitaciones.length} reservas de hotel
            {totalReservationsCount > habitaciones.length && ` (filtradas de ${totalReservationsCount} total)`}
        </div>
    </div>
  );
}