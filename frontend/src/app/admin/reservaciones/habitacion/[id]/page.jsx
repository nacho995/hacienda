'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getHabitacionReservation, 
  updateHabitacionReservation, 
  deleteHabitacionReservation, 
  updateReservaHabitacionHuespedes // Importar servicio específico
} from '@/services/reservationService';
import { FaArrowLeft, FaSpinner, FaCalendarAlt, FaUserFriends, FaBed, FaMoneyBillWave, FaEnvelope, FaPhone, FaClock, FaRuler, FaSave, FaTimes, FaEdit, FaPlus, FaTrashAlt, FaUserPlus, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import React from 'react';
// Importar el modal
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function HabitacionReservationDetail({ params }) {
  const router = useRouter();
  const id = React.use(params).id;
  const { user } = useAuth();
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ // Estado para datos editables
    fechaEntrada: '',
    fechaSalida: '',
    numHuespedes: 1, 
    nombres: [], // Ahora es un array
  });
  const [currentGuestName, setCurrentGuestName] = useState(''); // Estado para el input del nuevo huésped
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ 
    title: '', 
    message: '', 
    onConfirm: () => {}, 
    iconType: 'warning',
    confirmText: 'Confirmar'
  });
  
  const cargarReserva = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await getHabitacionReservation(id);
      if (response && response.success && response.data) {
        setReservation(response.data);
      } else if (response && !response.error) {
        if (response.data) {
          setReservation(response.data);
        } else {
          setReservation(response);
        }
      } else {
        throw new Error(response?.message || 'Error al cargar los datos de la reserva');
      }
      const fetchedData = response.data;
      setReservation(fetchedData);
      if (fetchedData) {
        // Inicializar estado de edición con datos de la reserva
        setEditedData({
          fechaEntrada: fetchedData.fechaEntrada ? new Date(fetchedData.fechaEntrada).toISOString().split('T')[0] : '',
          fechaSalida: fetchedData.fechaSalida ? new Date(fetchedData.fechaSalida).toISOString().split('T')[0] : '',
          numHuespedes: fetchedData.infoHuespedes?.nombres?.length || fetchedData.numHuespedes || 1, 
          nombres: fetchedData.infoHuespedes?.nombres || [] // Inicializar como array
        });
        setCurrentGuestName(''); // Limpiar input al cargar
        console.log('[cargarReserva] Estado "reservation" y "editedData" establecidos.');
      }
    } catch (err) {
      console.error('Error fetching reservation:', err);
      setError('No se pudo cargar la información de la reserva. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarReserva();
  }, [cargarReserva]);
  
  const handleEditToggle = () => {
    if (!reservation) return;
    if (!isEditing) {
      // Al entrar en modo edición, copiar datos actuales
      setEditedData({
        fechaEntrada: reservation.fechaEntrada ? new Date(reservation.fechaEntrada).toISOString().split('T')[0] : '',
        fechaSalida: reservation.fechaSalida ? new Date(reservation.fechaSalida).toISOString().split('T')[0] : '',
        numHuespedes: reservation.infoHuespedes?.nombres?.length || reservation.numHuespedes || 1,
        nombres: reservation.infoHuespedes?.nombres || []
      });
      setCurrentGuestName(''); // Limpiar input al entrar en edición
    }
    setIsEditing(!isEditing); 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCurrentGuestNameChange = (e) => {
      setCurrentGuestName(e.target.value);
  };

  const handleAddGuest = () => {
      const nameToAdd = currentGuestName.trim();
      if (!nameToAdd) {
          toast.warning("Por favor, ingrese un nombre de huésped.");
          return;
      }
      setEditedData(prev => {
          const newNombres = [...prev.nombres, nameToAdd];
          return {
              ...prev,
              nombres: newNombres,
              numHuespedes: newNombres.length // Actualizar contador
          };
      });
      setCurrentGuestName(''); // Limpiar input
  };
  
  const handleRemoveGuest = (indexToRemove) => {
      setEditedData(prev => {
          const newNombres = prev.nombres.filter((_, index) => index !== indexToRemove);
          return {
              ...prev,
              nombres: newNombres,
              numHuespedes: newNombres.length // Actualizar contador
          };
      });
  };

  const handleSaveChanges = async () => {
    if (!editedData) {
        toast.error("No hay datos editados para guardar.");
        return;
    }
    setUpdating(true);
    let success = true;
    let errors = [];

    // --- 1. Actualizar Fechas (si cambiaron) --- 
    const fechasPayload = {};
    let fechasChanged = false;
    const originalFechaEntrada = reservation.fechaEntrada ? new Date(reservation.fechaEntrada).toISOString().split('T')[0] : '';
    const originalFechaSalida = reservation.fechaSalida ? new Date(reservation.fechaSalida).toISOString().split('T')[0] : '';

    if (editedData.fechaEntrada !== originalFechaEntrada) {
        fechasPayload.fechaEntrada = editedData.fechaEntrada;
        fechasChanged = true;
    }
    if (editedData.fechaSalida !== originalFechaSalida) {
        fechasPayload.fechaSalida = editedData.fechaSalida;
        fechasChanged = true;
    }

    if (fechasChanged) {
        if (new Date(editedData.fechaSalida) <= new Date(editedData.fechaEntrada)) {
            toast.error("La fecha de salida debe ser posterior a la fecha de entrada.");
            setUpdating(false);
            return;
        }
        try {
            console.log("Actualizando fechas:", fechasPayload);
            // Usamos updateHabitacionReservation para fechas
            const responseFechas = await updateHabitacionReservation(id, fechasPayload);
            if (!responseFechas || !responseFechas.success) {
                success = false;
                errors.push(responseFechas?.message || 'Error al actualizar fechas.');
            }
        } catch (err) {
            success = false;
            errors.push('Error de red al actualizar fechas.');
        }
    }

    // --- 2. Actualizar Nombres y Número de Huéspedes (si cambiaron) --- 
    const originalNombres = reservation.infoHuespedes?.nombres || [];
    // Comparar arrays (longitud y contenido)
    const nombresChanged = editedData.nombres.length !== originalNombres.length || 
                           editedData.nombres.some((name, i) => name !== originalNombres[i]);

    if (nombresChanged) {
        const nombresPayload = {
            numHuespedes: editedData.nombres.length || 1, // Usar longitud del array
            infoHuespedes: {
                nombres: editedData.nombres,
            }
        };
        try {
            console.log("Actualizando infoHuespedes:", nombresPayload);
            // Usamos el endpoint específico para huéspedes
            const responseNombres = await updateReservaHabitacionHuespedes(id, nombresPayload);
            if (!responseNombres || !responseNombres.success) {
                success = false;
                errors.push(responseNombres?.message || 'Error al actualizar nombres.');
            }
        } catch (err) {
            success = false;
            errors.push('Error de red al actualizar nombres.');
        }
    }

    // --- Finalizar --- 
    setUpdating(false);
    if (success) {
        toast.success('Reserva actualizada correctamente');
        await cargarReserva(); 
        setIsEditing(false);
    } else {
        toast.error('Error al guardar algunos cambios:', { description: errors.join('; ') });
    }
  };

  // Función refactorizada para ejecutar la actualización de estado
  const executeStatusUpdate = async (statusToSend) => {
    setUpdating(true);
    try {
      const response = await updateHabitacionReservation(id, { estadoReserva: statusToSend }); 
      if (response && response.success) {
        const displayStatus = statusToSend.charAt(0).toUpperCase() + statusToSend.slice(1);
        toast.success(`Estado de la reserva cambiado a: ${displayStatus}`);
        await cargarReserva(); // Recargar datos
      } else {
        toast.error('Error al actualizar el estado: ' + (response?.message || 'Error desconocido'));
      }
    } catch (err) {
      toast.error('No se pudo actualizar el estado: ' + (err.message || 'Error desconocido'));
    } finally {
      setUpdating(false);
    }
  };

  // Modificado para usar modal en cancelación
  const handleStatusChange = async (newStatus) => {
    const statusToSend = String(newStatus).toLowerCase();

    if (statusToSend === 'cancelada') {
      setModalConfig({
        title: 'Cancelar Reserva',
        message: '¿Estás seguro de que deseas cancelar esta reserva de habitación?',
        onConfirm: () => executeStatusUpdate(statusToSend),
        iconType: 'danger',
        confirmText: 'Sí, Cancelar'
      });
      setIsModalOpen(true);
    } else {
      // Para otros estados (confirmada, pendiente), actualizar directamente
      executeStatusUpdate(statusToSend);
    }
  };
  
  // Modificado para usar modal
  const handleDeleteReservation = async () => {
    setModalConfig({
      title: 'Eliminar Reserva de Habitación',
      message: '¿Estás seguro de que deseas eliminar permanentemente esta reserva de habitación? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        setUpdating(true);
        try {
          const response = await deleteHabitacionReservation(id);
          if (response && response.success) {
            toast.success('Reserva de habitación eliminada exitosamente');
            router.push('/admin/reservaciones'); // O a la lista de reservas de hotel
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
  
  // --- Lógica para Añadir Nueva Reserva (Redirige) ---
  const handleAddNewReservation = () => {
    // Idealmente, ir a una ruta específica como /admin/reservaciones/nueva/habitacion
    // O abrir un modal con un formulario.
    // Por ahora, redirigimos a la lista general como ejemplo.
    router.push('/admin/reservaciones'); 
    toast.info('Redirigiendo para crear nueva reserva...'); // Opcional
  };
  
  // Obtener el estado correcto (campo puede variar)
  const estadoActual = reservation?.estadoReserva || reservation?.estado || 'Pendiente';
  
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

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Botón Volver */}
      <div className="mb-6">
        <Link href="/admin/reservaciones" className="inline-flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors">
          <FaArrowLeft className="mr-2" />
          Volver a Reservaciones
        </Link>
      </div>

      {/* Botón para añadir nueva reserva */}
      <div className="mb-6 text-right">
          <button 
            onClick={handleAddNewReservation} 
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow"
          >
              <FaPlus className="mr-2" /> Añadir Nueva Reserva de Habitación
          </button>
      </div>

      {/* Contenedor principal de detalles */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1">Detalle de Reserva de Habitación</h1>
            <p className="text-sm opacity-90">Número de Confirmación: <span className="font-mono bg-white bg-opacity-20 px-2 py-1 rounded">{reservation?.numeroConfirmacion || 'N/A'}</span></p>
          </div>
          <button 
            onClick={handleEditToggle}
            disabled={updating}
            className={`px-4 py-2 rounded-md flex items-center transition-colors ${isEditing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white disabled:opacity-50`}
          >
            {isEditing ? <><FaTimes className="mr-2" /> Cancelar Edición</> : <><FaEdit className="mr-2" /> Editar Reserva</>}
          </button>
        </div>

        {/* Cuerpo con Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna 1: Detalles Habitación y Fechas */}
            <div className="md:col-span-1 space-y-4 border-r pr-6 border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Habitación y Estancia</h2>
              <DetailItem icon={FaBed} label="Habitación" value={`${reservation?.habitacion} (${reservation?.tipoHabitacion || 'Estándar'})`} />
              <DetailItem icon={FaRuler} label="Categoría" value={reservation?.categoriaHabitacion || 'N/A'} />
              <DetailItem icon={FaMoneyBillWave} label="Precio" value={reservation?.precio ? `${reservation.precio.toFixed(2)} €` : 'N/A'} />
              
              <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Fecha de Entrada</p>
                  {isEditing ? (
                      <input 
                          type="date"
                          name="fechaEntrada"
                          value={editedData.fechaEntrada}
                          onChange={handleInputChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                      />
                  ) : (
                      <p className="text-lg font-medium text-gray-900 flex items-center"><FaCalendarAlt className="mr-2 text-[var(--color-accent)]" /> {formatDate(reservation?.fechaEntrada)}</p>
                  )}
              </div>
              <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Fecha de Salida</p>
                   {isEditing ? (
                      <input 
                          type="date"
                          name="fechaSalida"
                          value={editedData.fechaSalida}
                          onChange={handleInputChange}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                      />
                  ) : (
                    <p className="text-lg font-medium text-gray-900 flex items-center"><FaCalendarAlt className="mr-2 text-[var(--color-accent)]" /> {formatDate(reservation?.fechaSalida)}</p>
                  )}
              </div>
            </div>

            {/* Columna 2: Detalles Cliente y Huéspedes */}
            <div className="md:col-span-1 space-y-4 border-r pr-6 border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Cliente y Huéspedes</h2>
              <DetailItem icon={FaUserFriends} label="Cliente" value={`${reservation?.nombreContacto || 'N/A'} ${reservation?.apellidosContacto || ''}`} />
              <DetailItem icon={FaEnvelope} label="Email" value={reservation?.emailContacto || 'N/A'} />
              <DetailItem icon={FaPhone} label="Teléfono" value={reservation?.telefonoContacto || 'N/A'} />
              
              <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Huéspedes ({editedData.nombres?.length || 0})</p>
                  {isEditing ? (
                      <div className="space-y-2">
                          <ul className="list-disc list-inside mb-2 text-sm text-gray-600 max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                             {editedData.nombres?.length > 0 ? editedData.nombres.map((nombre, index) => (
                                <li key={index} className="flex justify-between items-center mb-1">
                                    <span>{nombre}</span>
                                    <button onClick={() => handleRemoveGuest(index)} className="text-red-500 hover:text-red-700 text-xs p-1"><FaTrashAlt /></button>
                                </li>
                             )) : <li className="text-gray-400 italic">No hay huéspedes registrados</li>}
                          </ul>
                          <div className="flex gap-2">
                              <input 
                                  type="text"
                                  placeholder="Añadir nombre huésped..."
                                  value={currentGuestName}
                                  onChange={handleCurrentGuestNameChange}
                                  className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                              />
                              <button 
                                  onClick={handleAddGuest}
                                  className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition text-sm flex items-center"
                              >
                                  <FaUserPlus className="mr-1"/> Añadir
                              </button>
                          </div>
                          <p className="text-xs text-gray-500 flex items-center mt-1"><FaInfoCircle className="mr-1" /> El número de huéspedes se actualiza automáticamente.</p>
                      </div>
                  ) : (
                      <ul className="list-disc list-inside text-gray-800">
                           {reservation?.infoHuespedes?.nombres?.length > 0 ? reservation.infoHuespedes.nombres.map((nombre, index) => (
                                <li key={index}>{nombre}</li>
                             )) : <li className="text-gray-500 italic">No hay huéspedes registrados</li>}
                      </ul>
                  )}
              </div>

            </div>

            {/* Columna 3: Estado y Acciones */}
            <div className="md:col-span-1 space-y-6">
                 <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Estado y Acciones</h2>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Estado Actual</p>
                  <span className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusStyles(reservation?.estadoReserva)}`}>
                    {reservation?.estadoReserva ? reservation.estadoReserva.charAt(0).toUpperCase() + reservation.estadoReserva.slice(1) : 'Pendiente'}
                  </span>
                </div>

                {!isEditing && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Cambiar Estado</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                       <ActionButton status="confirmada" currentStatus={reservation?.estadoReserva} onClick={handleStatusChange} updating={updating} />
                       <ActionButton status="pendiente" currentStatus={reservation?.estadoReserva} onClick={handleStatusChange} updating={updating} />
                       <ActionButton status="cancelada" currentStatus={reservation?.estadoReserva} onClick={handleStatusChange} updating={updating} />
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div>
                      <p className="text-sm text-gray-500 mb-2">Guardar Cambios</p>
                       <button
                          onClick={handleSaveChanges}
                          disabled={updating}
                          className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center"
                        >
                           {updating ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />} Guardar Cambios
                        </button>
                  </div>
                )}

                 <div>
                  <p className="text-sm text-gray-500 mb-2">Eliminar Reserva</p>
                  <button
                    onClick={handleDeleteReservation}
                    disabled={updating || isEditing} // Deshabilitar si está editando también
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {updating ? <FaSpinner className="animate-spin mr-2" /> : <FaTrashAlt className="mr-2" />} 
                    Eliminar Permanentemente
                  </button>
                </div>

            </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
       <ConfirmationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        {...modalConfig} 
      />
    </div>
  );
}

// Componente auxiliar para botones de estado
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
      className={`flex-1 ${color} text-white px-4 py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {updating ? <FaSpinner className="animate-spin mx-auto" /> : text}
    </button>
  );
};

// Componente auxiliar para mostrar detalles
const DetailItem = ({ icon: Icon, label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-lg font-medium text-gray-900 flex items-center">
      {Icon && <Icon className="mr-2 text-[var(--color-accent)]" />} 
      {value || 'N/A'}
    </p>
  </div>
);

// Función auxiliar para estilos de estado (igual que en evento)
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