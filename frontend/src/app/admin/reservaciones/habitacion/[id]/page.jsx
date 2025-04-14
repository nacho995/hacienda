'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getHabitacionReservation,
  updateHabitacionReservation,
  deleteHabitacionReservation,
  updateReservaHabitacionHuespedes,
  assignHabitacionReservation // <-- Importar servicio de asignación
} from '@/services/reservationService';
import apiClient from '@/services/apiClient'; // <-- Importar apiClient
import { FaArrowLeft, FaSpinner, FaCalendarAlt, FaUserFriends, FaBed, FaMoneyBillWave, FaEnvelope, FaPhone, FaClock, FaRuler, FaSave, FaTimes, FaEdit, FaPlus, FaTrashAlt, FaUserPlus, FaInfoCircle, FaUserShield, FaTag, FaDollarSign, FaGlassCheers, FaCalendarDay, FaUser, FaUsers } from 'react-icons/fa'; // <-- Añadir FaUserShield y FaTag
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import React from 'react';
// Importar el modal
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { FaChevronDown, FaUserCheck } from 'react-icons/fa'; // Para Dropdown y admin asignado

export default function HabitacionReservationDetail({ params }) {
  const router = useRouter();
  const id = React.use(params).id; // Corrección para obtener ID
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
      const response = await getHabitacionReservation(id); // Llama al servicio
       // Verifica la estructura de la respuesta del servicio
      if (response && response.success && response.data) {
         setReservation(response.data);
         // Inicializar estado de edición con datos de la reserva
         setEditedData({
           fechaEntrada: response.data.fechaEntrada ? new Date(response.data.fechaEntrada).toISOString().split('T')[0] : '',
           fechaSalida: response.data.fechaSalida ? new Date(response.data.fechaSalida).toISOString().split('T')[0] : '',
           // Usar infoHuespedes.nombres si existe, sino numHuespedes
           numHuespedes: response.data.infoHuespedes?.nombres?.length || response.data.numHuespedes || 1,
           nombres: response.data.infoHuespedes?.nombres || [] // Inicializar como array
         });
         setCurrentGuestName(''); // Limpiar input al cargar
         console.log('[cargarReserva] Estado "reservation" y "editedData" establecidos.');
      } else {
          console.error("Respuesta inesperada de getHabitacionReservation:", response);
          throw new Error(response?.message || 'Error al cargar los datos de la reserva. Formato inesperado.');
      }
    } catch (err) {
      console.error('Error fetching reservation:', err);
      setError('No se pudo cargar la información de la reserva. Por favor, intenta de nuevo más tarde.');
      setReservation(null); // Asegurarse que no hay datos viejos
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
    if (!editedData || !reservation) { // Añadir chequeo de reservation
        toast.error("No hay datos editados o reserva cargada para guardar.");
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

  const handleDeleteReservation = () => {
    setModalConfig({
      title: 'Eliminar Reserva de Habitación',
      message: '¿Estás seguro de que deseas eliminar permanentemente esta reserva de habitación? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        setUpdating(true);
        try {
          const response = await deleteHabitacionReservation(id);
          if (response && response.success) {
            toast.success('Reserva de habitación eliminada exitosamente');
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

  const handleAddNewReservation = () => {
    router.push('/admin/reservaciones');
    toast.info('Redirigiendo para crear nueva reserva...');
  };

  const estadoActual = reservation?.estadoReserva || 'Pendiente';

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
    try {
      // Intentar crear la fecha
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (e) {
      console.error("Error formateando fecha:", dateString, e);
      return "Fecha inválida";
    }
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

         {/* Contenido */}
        <div className="p-6 md:p-8">
          {/* Grid de detalles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* Columna Izquierda: Habitación y Estancia */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-600 border-b pb-2">Habitación y Estancia</h3>

              {isEditing ? (
                <>
                  {/* Campos de Edición Fechas */}
                   <div className="flex items-center space-x-4">
                      <div className="flex-1">
                          <label htmlFor="fechaEntrada" className="block text-sm font-medium text-gray-700 mb-1">Fecha Entrada</label>
                          <input
                            type="date"
                            name="fechaEntrada"
                            id="fechaEntrada"
                            value={editedData.fechaEntrada}
                            onChange={handleInputChange}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                      </div>
                       <div className="flex-1">
                           <label htmlFor="fechaSalida" className="block text-sm font-medium text-gray-700 mb-1">Fecha Salida</label>
                          <input
                            type="date"
                            name="fechaSalida"
                            id="fechaSalida"
                            value={editedData.fechaSalida}
                            onChange={handleInputChange}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                      </div>
                   </div>
                </>
              ) : (
                <>
                  {/* Vista Normal Fechas y Habitación */}
                  <DetailItem icon={FaBed} label="Habitación">
                    {reservation?.habitacion ?
                      `${reservation.habitacion.letra || ''} ${reservation.habitacion.nombre || ''}`.trim() || 'Detalles no disponibles'
                      : 'N/A'
                    }
                  </DetailItem>
                  <DetailItem icon={FaTag} label="Categoría">
                    {reservation?.categoriaHabitacion || 'N/A'}
                  </DetailItem>
                   <DetailItem icon={FaCalendarAlt} label="Estancia">
                    {formatDate(reservation?.fechaEntrada)} - {formatDate(reservation?.fechaSalida)}
                  </DetailItem>
                  {/* Añadir si se conoce la duración */}
                   {/* <DetailItem icon={FaClock} label="Duración">{calcularDuracion(reservation?.fechaEntrada, reservation?.fechaSalida)}</DetailItem> */}
                </>
              )}

               <DetailItem icon={FaDollarSign} label="Precio Total">
                {reservation?.precio?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) || 'N/A'}
              </DetailItem>
              <DetailItem icon={FaMoneyBillWave} label="Método Pago">
                {reservation?.metodoPago || 'N/A'}
              </DetailItem>

               {/* Mostrar detalles del evento si está asociado */}
              {reservation?.reservaEvento && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-md font-semibold text-gray-600 mb-2">Vinculada a Evento</h4>
                       <DetailItem icon={FaGlassCheers} label="Evento">
                          <Link href={`/admin/reservaciones/evento/${reservation.reservaEvento._id}`} className="text-blue-600 hover:underline">
                              {reservation.reservaEvento.nombreEvento || reservation.reservaEvento._id}
                          </Link>
                      </DetailItem>
                       <DetailItem icon={FaCalendarDay} label="Fecha Evento">
                          {formatDate(reservation.reservaEvento.fecha)}
                      </DetailItem>
                  </div>
              )}
            </div>

            {/* Columna Derecha: Cliente y Huéspedes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-600 border-b pb-2">Cliente y Huéspedes</h3>

              <DetailItem icon={FaUser} label="Cliente">
                {`${reservation?.nombreContacto || ''} ${reservation?.apellidosContacto || ''}`.trim() || 'N/A'}
              </DetailItem>
              <DetailItem icon={FaEnvelope} label="Email">
                {reservation?.emailContacto || 'N/A'}
              </DetailItem>
              <DetailItem icon={FaPhone} label="Teléfono">
                {reservation?.telefonoContacto || 'N/A'}
              </DetailItem>

              {/* Sección Huéspedes */}
              {isEditing ? (
                 <>
                    {/* Campo de entrada para añadir nuevo huésped */}
                     <div className="flex items-center space-x-2">
                         <input
                           type="text"
                           placeholder="Nombre del nuevo huésped"
                           value={currentGuestName}
                           onChange={handleCurrentGuestNameChange}
                           className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                         />
                         <button onClick={handleAddGuest} className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition text-sm flex items-center">
                           <FaUserPlus className="mr-1" /> Añadir
                         </button>
                     </div>

                    {/* Lista de huéspedes con botón de eliminar */}
                     <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Huéspedes ({editedData.nombres.length}):</label>
                        {editedData.nombres.length > 0 ? editedData.nombres.map((nombre, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-1 rounded">
                                <span className="text-sm text-gray-800">{nombre}</span>
                                <button
                                    className="text-red-500 hover:text-red-700 p-1"
                                    onClick={() => handleRemoveGuest(index)}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        )) : <p className="text-xs text-gray-500 italic">No hay huéspedes añadidos.</p>}
                     </div>
                 </>
              ) : (
                 <>
                    {/* Vista Normal Huéspedes */}
                     <DetailItem icon={FaUsers} label="Número de Huéspedes">
                       {reservation?.numHuespedes || 'N/A'}
                     </DetailItem>
                     {/* Mostrar lista de nombres si existen */}
                     {(reservation?.infoHuespedes?.nombres?.length > 0) && (
                         <div className="pl-6"> {/* Indentación para la lista */}
                             <p className="text-sm font-medium text-gray-700 mb-1">Nombres:</p>
                             <ul className="list-disc list-inside text-sm text-gray-600">
                                 {reservation.infoHuespedes.nombres.map((nombre, index) => (
                                     <li key={index}>{nombre}</li>
                                 ))}
                             </ul>
                         </div>
                     )}
                 </>
              )}
            </div>
          </div> {/* Fin Grid */}

        </div> {/* Fin Contenido p-6 */}
      </div> {/* Fin Contenedor principal */}

       {/* --- Modales --- */}
        <ConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              if (modalConfig.onConfirm) modalConfig.onConfirm();
              setIsModalOpen(false);
            }}
            title={modalConfig.title}
            message={modalConfig.message}
            confirmText={modalConfig.confirmText}
            cancelText="Cancelar"
            iconType={modalConfig.iconType}
        />

    </div> // Fin Container principal
  );
};

// --- Componente Auxiliar DetailItem (Se mantiene) ---
const DetailItem = ({ icon: Icon, label, children }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 flex items-center">
      {Icon && <Icon className="mr-2 h-4 w-4 text-gray-400" />}
      {label}
    </p>
    <div className="mt-1 text-md text-gray-900 pl-6">
      {children || 'N/A'}
    </div>
  </div>
);

