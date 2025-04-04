'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaUsers, 
  FaMoneyBillWave, 
  FaClipboardList, 
  FaComments, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEdit, 
  FaArrowLeft,
  FaUserPlus,
  FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

import { 
  asignarHabitacionReservation,
  asignarEventoReservation,
  asignarMasajeReservation
} from '@/services/reservationService';

import userService from '@/services/userService';

export default function ReservationDetails() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    // En una aplicación real, aquí harías una petición a tu API
    // Por ahora usamos datos simulados
    const getReservation = () => {
      setLoading(true);
      // Simulamos una carga de datos
      setTimeout(() => {
        setReservation({
          id: params.id,
          cliente: 'Juan Pérez',
          email: 'juan.perez@example.com',
          telefono: '+34 612 345 678',
          tipoEvento: 'Boda',
          fecha: '2024-05-15',
          horaInicio: '16:00',
          horaFin: '23:00',
          invitados: 150,
          estado: 'Pendiente',
          total: '$85,000',
          anticipo: '$25,500',
          saldo: '$59,500',
          comentarios: 'Necesitamos un espacio para la ceremonia y luego para la recepción. Preferimos decoración en tonos claros.',
          historial: [
            { fecha: '2024-02-10', accion: 'Reserva creada', usuario: 'Sistema' },
            { fecha: '2024-02-12', accion: 'Anticipo recibido', usuario: 'Admin' }
          ]
        });
        setLoading(false);
      }, 800);
    };

    getReservation();
  }, [params.id]);

  // Cargar usuarios para el diálogo de asignación
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getAllUsers();
        if (response.success) {
          setUsuarios(response.data);
        }
      } catch (err) {
        console.error('Error cargando usuarios:', err);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  const handleConfirm = () => {
    // Aquí iría la lógica para confirmar la reserva
    setReservation({
      ...reservation,
      estado: 'Confirmada',
      historial: [
        ...reservation.historial,
        { fecha: new Date().toISOString().split('T')[0], accion: `Reserva confirmada: ${statusNote}`, usuario: 'Admin' }
      ]
    });
    setShowConfirmDialog(false);
    setStatusNote('');
  };

  const handleCancel = () => {
    // Aquí iría la lógica para cancelar la reserva
    setReservation({
      ...reservation,
      estado: 'Cancelada',
      historial: [
        ...reservation.historial,
        { fecha: new Date().toISOString().split('T')[0], accion: `Reserva cancelada: ${statusNote}`, usuario: 'Admin' }
      ]
    });
    setShowCancelDialog(false);
    setStatusNote('');
  };

  // Función para asignar la reserva a un usuario
  const handleAssign = async () => {
    if (!selectedUser) {
      toast.error('Por favor, selecciona un usuario para asignar la reserva');
      return;
    }

    setAssignLoading(true);
    try {
      let response;
      
      if (reservationType === 'habitacion') {
        response = await asignarHabitacionReservation(params.id, selectedUser);
      } else if (reservationType === 'evento') {
        response = await asignarEventoReservation(params.id, selectedUser);
      } else if (reservationType === 'masaje') {
        response = await asignarMasajeReservation(params.id, selectedUser);
      }
      
      if (response.success) {
        // Actualizar la reserva en el estado
        setReservation({
          ...reservation,
          asignadoA: selectedUser,
          historial: [
            ...reservation.historial,
            { 
              fecha: new Date().toISOString().split('T')[0], 
              accion: `Reserva asignada a: ${usuarios.find(u => u._id === selectedUser)?.nombre || 'Usuario'}`, 
              usuario: 'Admin' 
            }
          ]
        });
        
        toast.success('Reserva asignada correctamente');
        setShowAssignDialog(false);
      } else {
        toast.error(response.message || 'Error al asignar la reserva');
      }
    } catch (error) {
      console.error('Error asignando reserva:', error);
      toast.error('Error al asignar la reserva');
    } finally {
      setAssignLoading(false);
    }
  };

  // Encontrar el usuario asignado a la reserva
  const getAssignedUserName = () => {
    if (!reservation.asignadoA) return 'Sin asignar';
    const assignedUser = usuarios.find(u => u._id === reservation.asignadoA);
    return assignedUser ? `${assignedUser.nombre} ${assignedUser.apellidos}` : 'Usuario desconocido';
  };

  const StatusBadge = ({ status }) => {
    let bgColor = 'bg-gray-100 text-gray-800';
    
    if (status === 'Confirmada') {
      bgColor = 'bg-green-100 text-green-800';
    } else if (status === 'Pendiente') {
      bgColor = 'bg-yellow-100 text-yellow-800';
    } else if (status === 'Cancelada') {
      bgColor = 'bg-red-100 text-red-800';
    }
    
    return (
      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${bgColor}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">No se encontró la reservación</h2>
        <button 
          onClick={() => router.push('/admin/reservaciones')}
          className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Volver a Reservaciones
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Encabezado con botón de regreso */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/admin/reservaciones')}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
              Detalles de Reservación
            </h1>
            <p className="text-gray-600 mt-1">
              ID: #{params.id} - {reservation.cliente}
            </p>
          </div>
        </div>
        <StatusBadge status={reservation.estado} />
      </div>

      {/* Grid con información detallada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna 1: Información principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <FaCalendarAlt className="mr-2 text-[var(--color-primary)]" />
                Detalles del Evento
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Tipo de Evento</p>
                  <p className="text-lg font-medium text-gray-800">{reservation.tipoEvento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="text-lg font-medium text-gray-800">
                    {new Date(reservation.fecha).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hora de Inicio</p>
                  <p className="text-lg font-medium text-gray-800">{reservation.horaInicio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hora de Finalización</p>
                  <p className="text-lg font-medium text-gray-800">{reservation.horaFin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Número de Invitados</p>
                  <p className="text-lg font-medium text-gray-800">{reservation.invitados}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <FaUser className="mr-2 text-[var(--color-primary)]" />
                Información del Cliente
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                    {reservation.cliente.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-medium text-gray-800">{reservation.cliente}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-2" />
                    <span className="text-gray-600">{reservation.email}</span>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="text-gray-400 mr-2" />
                    <span className="text-gray-600">{reservation.telefono}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <FaComments className="mr-2 text-[var(--color-primary)]" />
                Comentarios
              </h2>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{reservation.comentarios}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Columna 2: Información financiera e historial */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <FaMoneyBillWave className="mr-2 text-[var(--color-primary)]" />
                Información de Pago
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-semibold text-gray-800">{reservation.total}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Anticipo</p>
                    <p className="text-lg font-medium text-green-600">{reservation.anticipo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Saldo Pendiente</p>
                    <p className="text-lg font-medium text-red-600">{reservation.saldo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Acciones */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <FaClipboardList className="mr-2 text-[var(--color-primary)]" />
                Acciones
              </h2>
              
              <div className="space-y-3">
                {reservation.estado === 'Pendiente' && (
                  <>
                    <button 
                      onClick={() => setShowConfirmDialog(true)}
                      className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                    >
                      <FaCheckCircle className="mr-2" />
                      Confirmar Reservación
                    </button>
                    <button 
                      onClick={() => setShowCancelDialog(true)}
                      className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                    >
                      <FaTimesCircle className="mr-2" />
                      Cancelar Reservación
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setShowEditPanel(true)}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <FaEdit className="mr-2" />
                  Editar Reservación
                </button>
                <button 
                  onClick={() => setShowAssignDialog(true)}
                  className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
                >
                  <FaUserPlus className="mr-2" />
                  Asignar a Usuario
                </button>
              </div>
            </div>
          </div>
          
          {/* Historial */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <FaClipboardList className="mr-2 text-[var(--color-primary)]" />
                Historial de la Reservación
              </h2>
              
              <div className="space-y-4">
                {reservation.historial.map((item, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4 relative">
                      <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]"></div>
                      {index < reservation.historial.length - 1 && (
                        <div className="absolute top-3 bottom-0 left-1.5 -ml-px w-0.5 bg-gray-200"></div>
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-gray-500">{item.fecha}</p>
                      <p className="text-gray-700">{item.accion}</p>
                      <p className="text-xs text-gray-500">Por: {item.usuario}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Confirmación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirmar Reservación</h3>
            <p className="text-gray-600 mb-4">¿Estás seguro de que deseas confirmar esta reservación?</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nota (opcional)
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                rows="3"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Añade una nota a la confirmación..."
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Cancelación */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cancelar Reservación</h3>
            <p className="text-gray-600 mb-4">¿Estás seguro de que deseas cancelar esta reservación? Esta acción no se puede deshacer.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de cancelación
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                rows="3"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Indica el motivo de la cancelación..."
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Volver
              </button>
              <button 
                onClick={handleCancel}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                disabled={!statusNote.trim()}
              >
                Cancelar Reservación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Edición (se mostraría a un lado) */}
      {showEditPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
          <div className="bg-white h-full w-full md:max-w-xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Editar Reservación</h3>
              <button 
                onClick={() => setShowEditPanel(false)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <FaTimesCircle />
              </button>
            </div>
            
            <div className="space-y-6">
              <p className="text-gray-600">
                La funcionalidad de edición se implementará próximamente.
              </p>
              
              <button 
                onClick={() => setShowEditPanel(false)}
                className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para asignar la reserva a un usuario */}
      {showAssignDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Asignar Reserva a Usuario</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Asignación actual: <span className="font-medium">{getAssignedUserName()}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecciona un usuario:
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              >
                <option value="">-- Seleccionar usuario --</option>
                {usuarios.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.nombre} {user.apellidos} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssign}
                disabled={assignLoading || !selectedUser}
                className={`px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 ${(assignLoading || !selectedUser) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {assignLoading ? (
                  <>
                    <FaSpinner className="inline animate-spin mr-2" />
                    Asignando...
                  </>
                ) : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 