'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getEventoReservation, 
  updateEventoReservation, 
  deleteEventoReservation, 
  getEventoHabitaciones,
  updateReservaHabitacionHuespedes,
  assignEventoAdmin
} from '@/services/reservationService';
import apiClient from '@/services/apiClient';
import { FaArrowLeft, FaSpinner, FaCalendarAlt, FaUserFriends, FaGlassCheers, FaMoneyBillWave, FaEnvelope, FaPhone, FaClock, FaUtensils, FaBed, FaSave, FaPlus, FaTrash, FaUserShield } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import React from 'react';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function EventoReservationDetail({ params }) {
  const router = useRouter();
  const id = React.use(params).id;
  const { user } = useAuth();
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusUpdated, setStatusUpdated] = useState(false);
  const [habitacionesEvento, setHabitacionesEvento] = useState([]);
  const [loadingHabitaciones, setLoadingHabitaciones] = useState(false);
  const [errorHabitaciones, setErrorHabitaciones] = useState(null);
  const [huespedesEditados, setHuespedesEditados] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ 
    title: '', 
    message: '', 
    onConfirm: () => {}, 
    iconType: 'warning',
    confirmText: 'Confirmar'
  });
  
  const [showAsignarAdminModal, setShowAsignarAdminModal] = useState(false);
  const [usuariosAdmin, setUsuariosAdmin] = useState([]);
  const [loadingUsuariosAdmin, setLoadingUsuariosAdmin] = useState(false);
  const [isAsignandoAdmin, setIsAsignandoAdmin] = useState(false);
  
  const cargarUsuariosAdmin = useCallback(async () => {
    setLoadingUsuariosAdmin(true);
    try {
      const response = await apiClient.get('/users?from_admin=true');
      if (response?.data && Array.isArray(response.data)) {
        const admins = response.data.filter(u => u.role === 'admin');
        setUsuariosAdmin(admins);
      } else {
        setUsuariosAdmin([]);
        console.error("Respuesta inválida al cargar usuarios");
      }
    } catch (err) {
      console.error('Error al cargar usuarios administradores:', err);
      setUsuariosAdmin([]);
    } finally {
      setLoadingUsuariosAdmin(false);
    }
  }, []);
  
  useEffect(() => {
    const fetchReservationAndHabitaciones = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      setLoadingHabitaciones(true);
      setErrorHabitaciones(null);
      
      try {
        const responseEvento = await getEventoReservation(id);
        if (responseEvento && responseEvento.success && responseEvento.data) {
          const fetchedData = responseEvento.data;
          setReservation(fetchedData);
          
          if (usuariosAdmin.length === 0) {
            cargarUsuariosAdmin();
          }
          
          try {
            const responseHabitaciones = await getEventoHabitaciones(id);
            if (responseHabitaciones && responseHabitaciones.success && Array.isArray(responseHabitaciones.data?.habitaciones)) {
              setHabitacionesEvento(responseHabitaciones.data.habitaciones);
              const initialEdits = {};
              responseHabitaciones.data.habitaciones.forEach(hab => {
                initialEdits[hab._id] = {
                  nombres: hab.infoHuespedes?.nombres || [],
                  currentGuestName: '',
                  detalles: hab.infoHuespedes?.detalles || ''
                };
              });
              setHuespedesEditados(initialEdits);
            } else {
              setErrorHabitaciones('No se pudieron cargar las habitaciones del evento.');
            }
          } catch (errHab) {
            console.error('Error fetching habitaciones del evento:', errHab);
            setErrorHabitaciones('Error al cargar las habitaciones del evento.');
          }
        } else {
          throw new Error(responseEvento?.message || 'Error al cargar los datos de la reserva');
        }
      } catch (err) {
        console.error('Error fetching reservation:', err);
        setError('No se pudo cargar la información de la reserva.');
      } finally {
        setLoading(false);
        setLoadingHabitaciones(false);
      }
    };
    
    fetchReservationAndHabitaciones();
  }, [id, usuariosAdmin.length, cargarUsuariosAdmin]);
  
  const executeStatusUpdate = async (statusToSend) => {
    setUpdating(true);
    setStatusUpdated(false);
    try {
      const response = await updateEventoReservation(id, { estadoReserva: statusToSend });
      if (response && response.success) {
        const displayStatus = statusToSend.charAt(0).toUpperCase() + statusToSend.slice(1);
        toast.success(`Estado de la reserva cambiado a: ${displayStatus}`);
        if (response.data) {
          setReservation(response.data);
        } else {
          setReservation(prev => ({...prev, estadoReserva: statusToSend}));
        }
        setStatusUpdated(true);
        setTimeout(() => setStatusUpdated(false), 3000);
      } else {
        toast.error('Error al actualizar el estado: ' + (response?.message || 'Error desconocido'));
      }
    } catch (err) {
      toast.error('No se pudo actualizar el estado: ' + (err.message || 'Error desconocido'));
    } finally {
      setUpdating(false);
    }
  };
  
  const handleStatusChange = async (newStatus) => {
    const statusToSend = String(newStatus).toLowerCase();

    if (statusToSend === 'cancelada') {
      setModalConfig({
        title: 'Cancelar Reserva',
        message: '¿Estás seguro de que deseas cancelar esta reserva? Esta acción podría notificar al cliente.',
        onConfirm: () => executeStatusUpdate(statusToSend),
        iconType: 'danger',
        confirmText: 'Sí, Cancelar'
      });
      setIsModalOpen(true);
    } else {
      executeStatusUpdate(statusToSend);
    }
  };
  
  const handleDeleteReservation = async () => {
    setModalConfig({
      title: 'Eliminar Reserva',
      message: '¿Estás seguro de que deseas eliminar permanentemente esta reserva? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        setUpdating(true);
        try {
          const response = await deleteEventoReservation(id);
          if (response && response.success) {
            toast.success('Reserva eliminada exitosamente');
            router.push('/admin/reservaciones');
          } else {
            toast.error('Error al eliminar la reserva: ' + (response?.message || 'Error desconocido'));
          }
        } catch (err) {
          toast.error('No se pudo eliminar la reserva: ' + (err.message || 'Error desconocido'));
        } finally {
          setUpdating(false);
        }
      },
      iconType: 'delete',
      confirmText: 'Sí, Eliminar'
    });
    setIsModalOpen(true);
  };
  
  const handleHuespedChange = (habitacionId, field, value) => {
    setHuespedesEditados(prev => ({
      ...prev,
      [habitacionId]: {
        ...prev[habitacionId],
        [field]: value
      }
    }));
  };
  
  const handleAddGuest = (habitacionId) => {
    const nameToAdd = huespedesEditados[habitacionId]?.currentGuestName?.trim();
    if (!nameToAdd) {
        toast.warning("Por favor, ingrese un nombre de huésped.");
        return;
    }
    setHuespedesEditados(prev => {
        const currentHabData = prev[habitacionId] || { nombres: [], currentGuestName: '', detalles: '' };
        const newNombres = [...currentHabData.nombres, nameToAdd];
        return {
            ...prev,
            [habitacionId]: {
                ...currentHabData,
                nombres: newNombres,
                currentGuestName: ''
            }
        };
    });
  };
  
  const handleRemoveGuest = (habitacionId, indexToRemove) => {
    setHuespedesEditados(prev => {
        const currentHabData = prev[habitacionId] || { nombres: [], currentGuestName: '', detalles: '' };
        const newNombres = currentHabData.nombres.filter((_, index) => index !== indexToRemove);
        return {
            ...prev,
            [habitacionId]: {
                ...currentHabData,
                nombres: newNombres,
            }
        };
    });
  };
  
  const handleGuardarHuespedes = async (habitacionId) => {
    const datosEditados = huespedesEditados[habitacionId];
    if (!datosEditados) return;
    
    const updateData = {
      numHuespedes: datosEditados.nombres.length || 1,
      infoHuespedes: {
        nombres: datosEditados.nombres || [],
        detalles: datosEditados.detalles || ''
      }
    };
    
    setUpdating(true);
    try {
      const response = await updateReservaHabitacionHuespedes(habitacionId, updateData);
      if (response && response.success) {
        toast.success('Información de huéspedes actualizada');
      } else {
        toast.error(response?.message || 'Error al actualizar huéspedes');
      }
    } catch (err) {
      toast.error('Error al guardar cambios: ' + (err.message || 'Error desconocido'));
    } finally {
      setUpdating(false);
    }
  };
  
  const abrirModalAsignarAdmin = () => {
    if (!reservation) return;
    cargarUsuariosAdmin();
    setShowAsignarAdminModal(true);
  };

  const handleAsignarAdmin = async (adminId) => {
    if (!reservation || !adminId) {
      toast.error('Faltan datos para asignar.');
      return;
    }
    setIsAsignandoAdmin(true);
    try {
      const response = await assignEventoAdmin(reservation._id, adminId);
      if (response.success) {
        toast.success('Reserva de evento asignada al administrador correctamente.');
        setReservation(prev => ({ ...prev, asignadoA: usuariosAdmin.find(u => u._id === adminId) }));
        setShowAsignarAdminModal(false);
      } else {
        toast.error(response.message || 'Error al asignar la reserva de evento.');
      }
    } catch (error) {
      console.error('Error asignando reserva de evento a admin:', error);
      toast.error('Error de red al asignar la reserva de evento.');
    } finally {
      setIsAsignandoAdmin(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)] mx-auto mb-4" />
        <p className="text-gray-600">Cargando detalles de la reserva...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition"
        >
          Volver
        </button>
      </div>
    );
  }
  
  if (!reservation) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
        <p className="text-yellow-700">No se encontró la reserva solicitada.</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition"
        >
          Volver
        </button>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('es-ES', options);
  };
  
  const status = reservation.estadoReserva || 'pendiente';
  const statusStyles = getStatusStyles(status);
  
  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link href="/admin/reservaciones" className="inline-flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors">
          <FaArrowLeft className="mr-2" />
          Volver a Reservaciones
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white p-6 flex justify-between items-center">
              <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1">Detalle de Reserva de Evento</h1>
            <p className="text-sm opacity-90">Evento: <span className="font-semibold">{reservation.nombreEvento || 'Sin nombre'}</span> - Confirmación: <span className="font-mono bg-white bg-opacity-20 px-2 py-1 rounded">{reservation.numeroConfirmacion || 'N/A'}</span></p>
          </div>
           <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusStyles(reservation?.estadoReserva)}`}>
               {reservation?.estadoReserva ? reservation.estadoReserva.charAt(0).toUpperCase() + reservation.estadoReserva.slice(1) : 'Pendiente'}
              </span>
            </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6 border-r lg:pr-8 border-gray-200">
              <DetailItem icon={FaCalendarAlt} label="Fecha del Evento" value={formatDate(reservation.fecha)} />
              <DetailItem icon={FaUserFriends} label="Cliente" value={`${reservation.nombreContacto || 'N/A'} ${reservation.apellidosContacto || ''}`} />
              <DetailItem icon={FaEnvelope} label="Email" value={reservation.emailContacto || 'N/A'} />
              <DetailItem icon={FaPhone} label="Teléfono" value={reservation.telefonoContacto || 'N/A'} />
              <DetailItem icon={FaGlassCheers} label="Tipo de Evento" value={reservation.tipoEvento?.titulo || 'No especificado'} />
              <DetailItem icon={FaUserFriends} label="Número de Invitados" value={reservation.numInvitados || 'No especificado'} />
              <DetailItem icon={FaClock} label="Creada el" value={formatDateTime(reservation.createdAt)} />
              
              <div className="pt-4 border-t border-gray-100">
                 <h3 className="text-sm font-medium text-gray-500 mb-2">Asignado a Administrador</h3>
                 <div className="flex items-center justify-between">
                     <span className="text-base font-medium text-gray-800">
                         {reservation.asignadoA ? (
                             `${reservation.asignadoA.nombre || ''} ${reservation.asignadoA.apellidos || ''}`.trim() || 'Admin sin nombre'
                         ) : (
                             <span className="italic text-gray-500">Sin asignar</span>
                         )}
                     </span>
                <button
                       onClick={abrirModalAsignarAdmin} 
                       className="px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded hover:bg-indigo-600 disabled:opacity-50"
                       disabled={loadingUsuariosAdmin || isAsignandoAdmin}
                     >
                       {loadingUsuariosAdmin ? <FaSpinner className="animate-spin"/> : (reservation.asignadoA ? 'Reasignar' : 'Asignar')}
                </button>
              </div>
          </div>
        </div>

          <div className="lg:col-span-2 space-y-6">
             <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
               <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Habitaciones Incluidas</h2>
          {loadingHabitaciones ? (
                 <div className="text-center py-4"><FaSpinner className="animate-spin mx-auto text-gray-500" /></div>
          ) : errorHabitaciones ? (
                 <p className="text-red-600 text-sm">{errorHabitaciones}</p>
               ) : habitacionesEvento.length > 0 ? (
                 <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                   {habitacionesEvento.map(hab => (
                     <div key={hab._id} className="p-3 border rounded-md bg-white shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                         <h3 className="font-medium text-gray-700">Habitación {hab.habitacion || '?'} ({hab.tipoHabitacion || 'Estándar'})</h3>
                         <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyles(hab.estadoReserva)}`}>{hab.estadoReserva || 'Pendiente'}</span>
              </div>
                       <div className="text-xs text-gray-600 mb-2">
                         <p><strong>Fechas:</strong> {formatDate(hab.fechaEntrada)} - {formatDate(hab.fechaSalida)}</p>
                  </div>
                       <div>
                         <p className="text-xs font-medium text-gray-500 mb-1">Huéspedes ({huespedesEditados[hab._id]?.nombres?.length || 0})</p>
                         <ul className="list-disc list-inside mb-1 text-xs text-gray-600 pl-4">
                           {(huespedesEditados[hab._id]?.nombres?.length > 0) ? 
                             huespedesEditados[hab._id].nombres.map((nombre, index) => (
                               <li key={index} className="flex justify-between items-center">
                            <span>{nombre}</span>
                                 <button onClick={() => handleRemoveGuest(hab._id, index)} className="text-red-400 hover:text-red-600 p-0.5"><FaTrash size={10} /></button>
                          </li>
                             )) : <li className="text-gray-400 italic text-xs">No registrados</li>}
                      </ul>
                         <div className="flex gap-1 mt-1">
                          <input 
                              type="text"
                             placeholder="Añadir huésped..."
                              value={huespedesEditados[hab._id]?.currentGuestName || ''}
                              onChange={(e) => handleHuespedChange(hab._id, 'currentGuestName', e.target.value)}
                             className="flex-grow px-2 py-1 border border-gray-300 rounded-md text-xs"
                           />
                           <button onClick={() => handleAddGuest(hab._id)} className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs"><FaPlus /></button>
                           <button onClick={() => handleGuardarHuespedes(hab._id)} disabled={updating} className="bg-green-500 text-white px-2 py-1 rounded-md text-xs"><FaSave /></button>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
                 <p className="text-sm text-gray-500 italic">No hay habitaciones asignadas a este evento.</p>
               )}
             </div>

             <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                 <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Servicios Adicionales</h2>
                 <dl className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                   {reservation.serviciosContratados && reservation.serviciosContratados.length > 0 ? (
                     <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                       {reservation.serviciosContratados.map((item, index) => (
                         <li key={index} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                           <div className="flex w-0 flex-1 items-center">
                             <span className="ml-2 flex-1 w-0 truncate">{item.servicio?.nombre || 'Nombre no disponible'} (Cantidad: {item.cantidad})</span>
                           </div>
                           <div className="ml-4 flex-shrink-0">
                             <span className="font-medium">{item.servicio?.precio ? `$${formatNumber(item.servicio.precio * item.cantidad)}` : 'Precio no disponible'}</span>
                           </div>
                         </li>
                       ))}
                     </ul>
                   ) : (
                     'No hay servicios adicionales contratados.'
                   )}
                 </dl>
             </div>
              
             <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                 <h2 className="text-lg font-semibold text-gray-800 mb-3">Acciones Rápidas</h2>
                 <div className="grid grid-cols-2 gap-2">
                   <ActionButton status="confirmada" currentStatus={status} onClick={handleStatusChange} updating={updating} />
                   <ActionButton status="pendiente" currentStatus={status} onClick={handleStatusChange} updating={updating} />
                   <ActionButton status="cancelada" currentStatus={status} onClick={handleStatusChange} updating={updating} />
                   <button 
                     onClick={handleDeleteReservation} 
                     disabled={updating}
                     className="col-span-2 mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center w-full"
                   >
                     {updating ? <FaSpinner className="animate-spin mr-2" /> : <FaTrash className="mr-1"/>} Eliminar Reserva Evento
                   </button>
                 </div>
             </div>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={() => {
          modalConfig.onConfirm();
          setIsModalOpen(false);
        }}
        iconType={modalConfig.iconType}
        confirmText={modalConfig.confirmText}
      />

      {/* Modal Asignar Admin */} 
      {showAsignarAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl p-5 max-w-lg w-full mx-auto">
               <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                   <h3 className="text-lg font-semibold text-gray-800">
                      Asignar Evento a Administrador
                   </h3>
                   <button onClick={() => setShowAsignarAdminModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
               </div>
                {loadingUsuariosAdmin ? (
                    <div className="text-center py-4">
                       <FaSpinner className="animate-spin text-indigo-600 mx-auto h-8 w-8 mb-2" /> 
                       <p className="text-sm text-gray-600">Cargando administradores...</p>
                    </div>
                ) : usuariosAdmin.length > 0 ? (
                    <>
                       <p className="text-sm text-gray-600 mb-3">Selecciona un administrador para asignar este evento:</p>
                       <div className="max-h-60 overflow-y-auto space-y-2 pr-2 -mr-2">
                           {usuariosAdmin.map(admin => (
                               <button
                                   key={admin._id}
                                   onClick={() => handleAsignarAdmin(admin._id)}
                                   disabled={isAsignandoAdmin}
                                   className={`w-full p-3 border rounded-lg text-left flex items-center gap-3 transition duration-150 ${
                                       isAsignandoAdmin ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1' // Cambiar color a indigo
                                   }`}
                               >
                                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                                       {admin.nombre?.charAt(0).toUpperCase()}{admin.apellidos?.charAt(0).toUpperCase()}
                                   </div>
                                   <div className="flex-grow">
                                       <span className="block font-medium text-sm text-gray-800">{admin.nombre} {admin.apellidos || ''}</span>
                                       <span className="block text-xs text-gray-500">{admin.email}</span>
                                   </div>
                                   {isAsignandoAdmin && <FaSpinner className="animate-spin text-indigo-600 ml-auto h-4 w-4"/>}
                               </button>
                           ))}
                       </div>
                    </>
                ) : (
                    <p className="text-sm text-center text-gray-500 py-4">No se encontraron otros administradores.</p>
                )}
               <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end">
                   <button
                       onClick={() => setShowAsignarAdminModal(false)}
                       disabled={isAsignandoAdmin}
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

// Helper Components
const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="mb-2">
    <p className="text-sm font-medium text-gray-500 flex items-center">
      {Icon && <Icon className="mr-2 text-gray-400" />} 
      {label}
    </p>
    <p className="text-base text-gray-800 pl-6">{value || '-'}</p>
  </div>
);

const ActionButton = ({ status, currentStatus, onClick, updating }) => {
  const texts = { confirmada: 'Confirmar', pendiente: 'Pendiente', cancelada: 'Cancelar' };
  const colors = {
    confirmada: 'bg-green-500 hover:bg-green-600',
    pendiente: 'bg-yellow-500 hover:bg-yellow-600',
    cancelada: 'bg-red-500 hover:bg-red-600'
  };
  const text = texts[status];
  const color = colors[status];
  const isDisabled = updating || currentStatus === status;

  return (
    <button
      onClick={() => onClick(status)}
      disabled={isDisabled}
      className={`flex-1 ${color} text-white px-3 py-1.5 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {updating ? <FaSpinner className="animate-spin mx-auto" /> : text}
    </button>
  );
};

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmada':
      return 'bg-green-100 text-green-800';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelada':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 