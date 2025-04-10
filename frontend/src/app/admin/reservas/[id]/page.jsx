'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { obtenerReservaEvento, actualizarReservaEvento, actualizarReservaHabitacion } from '@/services/reservas.service';
import { actualizarGestionHabitaciones } from '@/services/gestionHacienda.service';
import GestionHabitacionesReserva from '@/components/admin/GestionHabitacionesReserva';
import { toast } from 'sonner';
import { FaEdit, FaSave, FaTimes, FaBed } from 'react-icons/fa';

export default function DetalleReservaPage() {
  const { id } = useParams();
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReserva, setEditedReserva] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const cargarReserva = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`[cargarReserva] Iniciando carga para ID: ${id}`);
      const response = await obtenerReservaEvento(id);
      console.log('[cargarReserva] Respuesta de obtenerReservaEvento:', response);

      if (response.success && response.data) {
        console.log("[cargarReserva] Datos recibidos (stringify):", JSON.stringify(response.data, null, 2));
        console.log("[cargarReserva] Datos recibidos (objeto):", response.data);
        setReserva(response.data);
        setEditedReserva(response.data);
        console.log('[cargarReserva] Estado "reserva" y "editedReserva" establecidos.');
      } else {
        const errorMessage = response.data?.message || response.message || 'No se pudo obtener la reserva o faltan datos.';
        toast.error('Error al cargar la reserva', {
          description: errorMessage
        });
        console.error('[cargarReserva] Error o datos faltantes:', errorMessage, 'Respuesta completa:', response);
        setReserva(null);
        setEditedReserva(null);
      }
    } catch (error) {
      console.error('[cargarReserva] Error en catch:', error);
      toast.error('Error inesperado al cargar la reserva');
      setReserva(null);
      setEditedReserva(null);
    } finally {
      setLoading(false);
      console.log('[cargarReserva] Carga finalizada.');
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      cargarReserva();
    }
  }, [id, cargarReserva]);

  const handleEdit = () => {
    if (!reserva) return;
    setEditedReserva({ ...reserva });
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!reserva) return;
    setEditedReserva({ ...reserva });
    setIsEditing(false);
  };

  const handleGuardarCambios = async () => {
    if (!editedReserva || !reserva) {
      toast.error("No hay datos para guardar.");
      return;
    }

    setIsSaving(true);

    try {
      const eventoUpdateData = {
        fecha: editedReserva.fecha,
        nombreContacto: editedReserva.nombreContacto,
        apellidosContacto: editedReserva.apellidosContacto,
        emailContacto: editedReserva.emailContacto,
        telefonoContacto: editedReserva.telefonoContacto,
        estadoReserva: editedReserva.estadoReserva,
      };

      const habitacionesUpdatesPromises = editedReserva.habitaciones
        .map((editedHab, index) => {
          const originalHab = reserva.habitaciones.find(orig => orig._id === editedHab._id);
          if (!originalHab) return null;

          const changedFields = {};
          let hasChanged = false;

          const fieldsToCompare = ['fechaEntrada', 'fechaSalida', 'numHuespedes', 'nombreHuespedes'];

          fieldsToCompare.forEach(field => {
            let originalValue = originalHab[field];
            let editedValue = editedHab[field];

            if (field === 'fechaEntrada' || field === 'fechaSalida') {
              originalValue = originalValue ? new Date(originalValue).toISOString().split('T')[0] : null;
              editedValue = editedValue ? new Date(editedValue).toISOString().split('T')[0] : null;
            }
            if (field === 'numHuespedes') {
              originalValue = parseInt(originalValue, 10) || 0;
              editedValue = parseInt(editedValue, 10) || 0;
            }
            if (field === 'nombreHuespedes') {
              originalValue = originalValue || '';
              editedValue = editedValue || '';
            }

            if (originalValue !== editedValue) {
              changedFields[field] = editedHab[field];
              hasChanged = true;
            }
          });

          if (hasChanged && editedHab._id) {
            console.log(`Preparando actualización para Habitación ID: ${editedHab._id}`, changedFields);
            return actualizarReservaHabitacion(editedHab._id, changedFields);
          }
          return null;
        })
        .filter(promise => promise !== null);

      const updatePromises = [];

      console.log("Preparando actualización para Evento ID:", id, eventoUpdateData);
      updatePromises.push(actualizarReservaEvento(id, eventoUpdateData));

      updatePromises.push(...habitacionesUpdatesPromises);

      const results = await Promise.allSettled(updatePromises);

      const failedUpdates = results.filter(result => result.status === 'rejected');

      if (failedUpdates.length > 0) {
        console.error("Fallos al guardar:", failedUpdates);
        failedUpdates.forEach(fail => console.error(fail.reason));
        toast.error(`Error al guardar ${failedUpdates.length} ${failedUpdates.length > 1 ? 'cambios' : 'cambio'}. Revise la consola.`);
      } else {
        toast.success("Cambios guardados correctamente");
        setIsEditing(false);
        await cargarReserva();
      }

    } catch (error) {
      console.error('Error general al guardar cambios:', error);
      toast.error('Error inesperado al guardar los cambios. Verifique la conexión y los datos.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setEditedReserva(prev => {
      if (!prev) return null;
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [name]: val
          }
        };
      }
      if (type === 'date') {
         return { ...prev, [name]: value ? new Date(value).toISOString() : null };
      }
      return { ...prev, [name]: val };
    });
  };

  const handleHabitacionInputChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setEditedReserva(prev => {
      if (!prev || !prev.habitaciones) return prev;

      const nuevasHabitaciones = [...prev.habitaciones];
      if (!nuevasHabitaciones[index]) {
          nuevasHabitaciones[index] = {};
      }
      
      nuevasHabitaciones[index] = {
        ...nuevasHabitaciones[index],
        [name]: val
      };
      
      if (type === 'date' && name === 'fechaEntrada') {
         nuevasHabitaciones[index].fechaEntrada = value ? new Date(value).toISOString() : null;
      }
      if (type === 'date' && name === 'fechaSalida') {
         nuevasHabitaciones[index].fechaSalida = value ? new Date(value).toISOString() : null;
      }
      if (name === 'numHuespedes') {
          nuevasHabitaciones[index].numHuespedes = parseInt(val, 10) || 0;
      }

      return {
        ...prev,
        habitaciones: nuevasHabitaciones
      };
    });
  };

  // Log para ver el estado en cada renderizado (sintaxis corregida)
  console.log('[Render] Estado actual ->', 'loading:', loading, 'isSaving:', isSaving, 'Reserva:', reserva ? `Existe (ID: ${reserva._id})` : reserva);

  if (loading && !isSaving) {
    console.log('[Render] Mostrando indicador de carga...');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!reserva) {
    console.log('[Render] Renderizando "No encontrado" porque "reserva" es:', reserva);
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          No se encontró la reserva o hubo un error al cargarla.
        </div>
      </div>
    );
  }

  // Si llegamos aquí, la reserva existe y no estamos cargando
  console.log('[Render] Renderizando detalles de la reserva...');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[var(--color-primary)]">
          Detalles de la Reserva #{reserva.numeroConfirmacion || reserva._id}
        </h1>
        <div>
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={handleGuardarCambios}
                className={`px-4 py-2 text-white rounded-md flex items-center shadow transition duration-150 ease-in-out ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                disabled={isSaving}
                aria-label="Guardar Cambios"
              >
                {isSaving ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                   <FaSave className="mr-2" />
                )}
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={handleCancel}
                className={`px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center shadow transition duration-150 ease-in-out ${isSaving ? 'cursor-not-allowed opacity-50' : ''}`}
                 disabled={isSaving}
                 aria-label="Cancelar Edición"
             >
                <FaTimes className="mr-2" /> Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center shadow transition duration-150 ease-in-out"
              aria-label="Editar Datos"
            >
              <FaEdit className="mr-2" /> Editar Datos
            </button>
          )}
        </div>
      </div>

      {/* --- Sección Información General --- */}
      {/* Estilo modo edición: Borde izquierdo primario, fondo beige muy claro */}
      <div className={`bg-white rounded-lg shadow p-6 mb-8 transition-all duration-300 ease-in-out ${isEditing ? 'bg-amber-50/50 border-l-4 border-[var(--color-primary)] pl-5' : 'pl-6'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${isEditing ? 'text-gray-800' : 'text-gray-700'}`}>Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <div>
            <label className={`block text-sm mb-1 ${isEditing ? 'font-medium text-gray-700' : 'text-gray-600'}`}>Tipo de Evento</label>
            {isEditing ? (
              <input
                type="text"
                name="nombreEvento" 
                value={editedReserva?.nombreEvento || editedReserva?.tipoEvento?.nombre || editedReserva?.tipoEvento?.titulo || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border bg-white rounded-md shadow-sm transition-colors duration-150 ease-in-out ${isEditing ? 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]' : 'border-transparent bg-gray-50'}`}
                readOnly={!!editedReserva?.tipoEvento}
             />
            ) : (
              <p className="font-medium mt-1 text-gray-900">{reserva.nombreEvento || reserva.tipoEvento?.nombre || reserva.tipoEvento?.titulo || 'No especificado'}</p>
            )}
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isEditing ? 'font-medium text-gray-700' : 'text-gray-600'}`}>Fecha</label>
            {isEditing ? (
              <input
                type="date"
                name="fecha"
                value={editedReserva?.fecha ? new Date(editedReserva.fecha).toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border bg-white rounded-md shadow-sm transition-colors duration-150 ease-in-out ${isEditing ? 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]' : 'border-transparent bg-gray-50'}`}
              />
            ) : (
              <p className="font-medium mt-1 text-gray-900">{reserva.fecha ? new Date(reserva.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
            )}
          </div>
           <div>
             <label className={`block text-sm mb-1 ${isEditing ? 'font-medium text-gray-700' : 'text-gray-600'}`}>Estado</label>
             {isEditing ? (
               <select
                 name="estadoReserva"
                 value={editedReserva?.estadoReserva || 'pendiente'}
                 onChange={handleInputChange}
                 className={`w-full px-3 py-2 border bg-white rounded-md shadow-sm transition-colors duration-150 ease-in-out ${isEditing ? 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]' : 'border-transparent bg-gray-50'}`}
               >
                 <option value="pendiente">Pendiente</option>
                 <option value="confirmada">Confirmada</option>
                 <option value="cancelada">Cancelada</option>
                 <option value="completada">Completada</option>
               </select>
             ) : (
               <p className={`font-medium capitalize mt-1 px-2 py-0.5 inline-block rounded-full text-sm ${ 
                 reserva.estadoReserva === 'confirmada' ? 'bg-green-100 text-green-800' :
                 reserva.estadoReserva === 'cancelada' ? 'bg-red-100 text-red-800' :
                 reserva.estadoReserva === 'completada' ? 'bg-blue-100 text-blue-800' :
                 'bg-yellow-100 text-yellow-800'
               }`}>{reserva.estadoReserva?.replace('_', ' ') || 'Pendiente'}</p>
             )}
           </div>
        </div>
      </div>

      {/* --- Sección Datos de Contacto --- */}
      {/* Estilo modo edición: Borde izquierdo primario, fondo beige muy claro */}
      <div className={`bg-white rounded-lg shadow p-6 mb-8 transition-all duration-300 ease-in-out ${isEditing ? 'bg-amber-50/50 border-l-4 border-[var(--color-primary)] pl-5' : 'pl-6'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${isEditing ? 'text-gray-800' : 'text-gray-700'}`}>Datos de Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className={`block text-sm mb-1 ${isEditing ? 'font-medium text-gray-700' : 'text-gray-600'}`}>Nombre</label>
            {isEditing ? (
              <input
                type="text"
                name="nombreContacto"
                value={editedReserva?.nombreContacto || ''}
                onChange={(e) => handleInputChange(e)} 
                className={`w-full px-3 py-2 border bg-white rounded-md shadow-sm transition-colors duration-150 ease-in-out ${isEditing ? 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]' : 'border-transparent bg-gray-50'}`}
              />
            ) : (
              <p className="font-medium mt-1 text-gray-900">{reserva.nombreContacto || 'N/A'}</p>
            )}
          </div>
           <div>
            <label className={`block text-sm mb-1 ${isEditing ? 'font-medium text-gray-700' : 'text-gray-600'}`}>Apellidos</label>
            {isEditing ? (
              <input
                type="text"
                name="apellidosContacto"
                value={editedReserva?.apellidosContacto || ''}
                onChange={(e) => handleInputChange(e)}
                className={`w-full px-3 py-2 border bg-white rounded-md shadow-sm transition-colors duration-150 ease-in-out ${isEditing ? 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]' : 'border-transparent bg-gray-50'}`}
              />
            ) : (
              <p className="font-medium mt-1 text-gray-900">{reserva.apellidosContacto || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isEditing ? 'font-medium text-gray-700' : 'text-gray-600'}`}>Email</label>
            {isEditing ? (
              <input
                type="email"
                name="emailContacto"
                value={editedReserva?.emailContacto || ''}
                onChange={(e) => handleInputChange(e)}
                className={`w-full px-3 py-2 border bg-white rounded-md shadow-sm transition-colors duration-150 ease-in-out ${isEditing ? 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]' : 'border-transparent bg-gray-50'}`}
              />
            ) : (
              <p className="font-medium mt-1 text-gray-900">{reserva.emailContacto || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isEditing ? 'font-medium text-gray-700' : 'text-gray-600'}`}>Teléfono</label>
            {isEditing ? (
              <input
                type="tel"
                name="telefonoContacto"
                value={editedReserva?.telefonoContacto || ''}
                onChange={(e) => handleInputChange(e)}
                className={`w-full px-3 py-2 border bg-white rounded-md shadow-sm transition-colors duration-150 ease-in-out ${isEditing ? 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]' : 'border-transparent bg-gray-50'}`}
              />
            ) : (
              <p className="font-medium mt-1 text-gray-900">{reserva.telefonoContacto || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {/* --- Sección Habitaciones Asociadas --- */}
      {/* Estilo modo edición: Borde izquierdo primario, fondo beige muy claro */}
      <div className={`bg-white rounded-lg shadow p-6 mb-8 transition-all duration-300 ease-in-out ${isEditing ? 'bg-amber-50/50 border-l-4 border-[var(--color-primary)] pl-5' : 'pl-6'}`}>
        <h2 className={`text-xl font-semibold mb-4 flex items-center ${isEditing ? 'text-gray-800' : 'text-gray-700'}`}>
           <FaBed className="mr-3 text-[var(--color-primary)]"/> 
           Habitaciones Asociadas ({editedReserva?.habitaciones?.length || 0})
        </h2>

        {editedReserva?.habitaciones && editedReserva.habitaciones.length > 0 ? (
          <div className="space-y-6">
            {editedReserva.habitaciones.map((hab, index) => (
              /* Estilo bloque habitación: Borde sutil ámbar, fondo más oscuro */
              <div key={hab._id || index} className={`rounded-md p-4 transition-all duration-300 ease-in-out ${isEditing ? 'bg-amber-100/40 border border-amber-200' : 'bg-gray-50/50 border border-transparent'}`}>
                <h3 className="text-lg font-medium mb-3 text-gray-700">
                  <span className="font-semibold text-blue-700">Habitación {hab.letraHabitacion || `(${index + 1})`}</span>
                  <span className="text-gray-500 text-sm mx-1">(ID: {hab._id?.toString().slice(-6) || 'N/A'})</span> - 
                  <span className={`font-semibold ${ 
                    hab.tipoHabitacion?.toLowerCase() === 'sencilla' ? 'text-teal-700' : 
                    hab.tipoHabitacion?.toLowerCase() === 'doble' ? 'text-indigo-700' : 
                    'text-gray-700' // Color por defecto
                  }`}>
                    {hab.tipoHabitacion || 'Tipo no especificado'}
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                   {/* Fecha Entrada */}
                   <div>
                      <label className={`block text-sm mb-1 ${isEditing ? 'font-medium text-gray-700' : 'text-gray-600'}`}>Check-in</label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="fechaEntrada"
                          value={hab.fechaEntrada ? new Date(hab.fechaEntrada).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleHabitacionInputChange(e, index)}
                          className={`w-full px-3 py-2 border bg-white rounded-md shadow-sm transition-colors duration-150 ease-in-out ${isEditing ? 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]' : 'border-transparent bg-gray-50'}`}
                        />
                      ) : (
                        <p className="font-medium mt-1 text-gray-900">{hab.fechaEntrada ? new Date(hab.fechaEntrada).toLocaleDateString('es-ES') : 'N/A'}</p>
                      )}
                    </div>

                    {/* Fecha Salida */}
                    <div>
                      <label className={`block text-sm mb-1 ${isEditing ? 'font-medium text-gray-700' : 'text-gray-600'}`}>Check-out</label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="fechaSalida"
                          value={hab.fechaSalida ? new Date(hab.fechaSalida).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleHabitacionInputChange(e, index)}
                          className={`w-full px-3 py-2 border bg-white rounded-md shadow-sm transition-colors duration-150 ease-in-out ${isEditing ? 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]' : 'border-transparent bg-gray-50'}`}
                        />
                      ) : (
                        <p className="font-medium mt-1 text-gray-900">{hab.fechaSalida ? new Date(hab.fechaSalida).toLocaleDateString('es-ES') : 'N/A'}</p>
                      )}
                    </div>

                     {/* Número de Huéspedes */}
                     <div>
                       <label className={`block text-sm mb-1 ${isEditing ? 'font-medium text-gray-700' : 'text-gray-600'}`}>Nº Huéspedes</label>
                       {isEditing ? (
                         <input
                           type="number"
                           name="numHuespedes"
                           value={hab.numHuespedes || ''}
                           onChange={(e) => handleHabitacionInputChange(e, index)}
                           min="1"
                           className={`w-full px-3 py-2 border bg-white rounded-md shadow-sm transition-colors duration-150 ease-in-out ${isEditing ? 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]' : 'border-transparent bg-gray-50'}`}
                         />
                       ) : (
                         <p className="font-medium mt-1 text-gray-900">{hab.numHuespedes || 'N/A'}</p>
                       )}
                     </div>

                     {/* Nombres Huéspedes */}                    
                    <div className="md:col-span-2 lg:col-span-4"> 
                       <label className={`block text-sm mb-1 ${isEditing ? 'font-medium text-gray-700' : 'text-gray-600'}`}>Nombre(s) Huésped(es)</label>
                       {isEditing ? (
                         <textarea
                           name="nombreHuespedes"
                           value={hab.nombreHuespedes || ''}
                           onChange={(e) => handleHabitacionInputChange(e, index)}
                           placeholder="Ej: Juan Pérez (Hab 1), María López (Hab 1), Pedro García (Hab 2)... Separar por comas o líneas"
                           rows="3" 
                           className={`w-full px-3 py-2 border bg-white rounded-md shadow-sm transition-colors duration-150 ease-in-out ${isEditing ? 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]' : 'border-transparent bg-gray-50'}`}
                         />
                       ) : (
                         <p className="font-medium mt-1 whitespace-pre-wrap text-gray-900">{hab.nombreHuespedes || 'No especificados'}</p>
                       )}
                     </div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay habitaciones asociadas a esta reserva o no se pudieron cargar.</p>
        )}
      </div>
    </div>
  );
} 