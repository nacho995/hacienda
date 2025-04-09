"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaUserFriends, FaBed, FaList, FaMapMarkedAlt, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { obtenerHabitaciones } from '../../services/habitaciones.service';
import { useReserva } from '@/context/ReservaContext';
import './EventoMapaHabitaciones.css';

const EventoMapaHabitacionesNuevo = ({ onRoomsChange, eventDate, onHabitacionesLoad }) => {
  const { formData, updateFormSection } = useReserva();
  const [rooms, setRooms] = useState(formData.habitacionesSeleccionadas || []);
  const [showMap, setShowMap] = useState(true);
  const [habitaciones, setHabitaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);

  // Áreas seleccionables para cada habitación basadas en la imagen del plano
  const areasSeleccionables = {
    'A': { coords: '332,143,392,204', shape: 'rect', direction: 'bottom' },
    'B': { coords: '400,143,460,204', shape: 'rect', direction: 'bottom' },
    'C': { coords: '453,205,514,266', shape: 'rect', direction: 'left' },
    'D': { coords: '453,263,514,324', shape: 'rect', direction: 'left' },
    'E': { coords: '453,321,514,382', shape: 'rect', direction: 'left' },
    'F': { coords: '453,379,514,440', shape: 'rect', direction: 'left' },
    'G': { coords: '467,492,528,553', shape: 'rect', direction: 'top' },
    'H': { coords: '523,492,584,553', shape: 'rect', direction: 'top' },
    'I': { coords: '579,492,640,553', shape: 'rect', direction: 'top' },
    'J': { coords: '635,492,696,553', shape: 'rect', direction: 'top' },
    'K': { coords: '399,568,460,629', shape: 'rect', direction: 'right' },
    'L': { coords: '399,492,460,553', shape: 'rect', direction: 'right' },
    'M': { coords: '759,353,820,414', shape: 'rect', direction: 'left' },
    'O': { coords: '759,443,820,504', shape: 'rect', direction: 'left' }
  };

  // No usamos habitaciones predefinidas, solo las de la base de datos

  // Cargar habitaciones desde la API
  useEffect(() => {
    const cargarHabitaciones = async () => {
      try {
        setIsLoading(true);
        // Obtener habitaciones exclusivamente de la base de datos
        const data = await obtenerHabitaciones();
        console.log('Habitaciones obtenidas de la BD:', data);
        
        if (!data || data.length === 0) {
          console.error('No se encontraron habitaciones en la base de datos');
          setHabitaciones([]);
          setIsLoading(false);
          toast.error('No se encontraron habitaciones disponibles');
          return;
        }
        
        // Procesar habitaciones recibidas
        const habitacionesProcesadas = data.map(hab => {
          const letra = hab.letra || hab.id;
          return {
            ...hab,
            letra,
            nombre: hab.nombre || `Habitación ${letra}`,
            tipo: hab.tipo || 'Estándar',
            capacidad: hab.capacidad || 2,
            precioPorNoche: hab.precio || 2450,
            estado: hab.estado || 'disponible',
            area: areasSeleccionables[letra] || { coords: '0,0,0,0', shape: 'rect', direction: 'bottom' }
          };
        });
        
        // Establecer las habitaciones procesadas
        setHabitaciones(habitacionesProcesadas);
        
        // Pasar las habitaciones al componente padre (solo una vez después de cargar)
        if (typeof onHabitacionesLoad === 'function') {
          onHabitacionesLoad(habitacionesProcesadas);
        }
      } catch (error) {
        console.error('Error al cargar habitaciones:', error);
        setHabitaciones([]);
        toast.error('Error al cargar las habitaciones. Por favor, intente de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarHabitaciones();
  }, []); // Eliminamos la dependencia para evitar el bucle infinito

  // Verificar si una habitación está seleccionada
  const isSelected = (letra) => {
    return rooms.some(room => room.letra === letra);
  };

  // Seleccionar habitación
  const handleSelectHabitacion = (habitacion) => {
    // Verificar si la habitación ya está seleccionada
    if (isSelected(habitacion.letra)) {
      toast.info(`La habitación ${habitacion.letra} ya está seleccionada`);
      return;
    }
    
    // Agregar la habitación a las seleccionadas localmente
    const updatedRooms = [...rooms, habitacion];
    setRooms(updatedRooms);
    
    // Notificar al componente padre de la habitación seleccionada
    if (onRoomsChange) {
      // Enviamos un objeto especial para indicar que es una adición
      onRoomsChange({
        action: 'add',
        habitacion: habitacion,
        allRooms: updatedRooms
      });
    }
    
    toast.success(`Habitación ${habitacion.letra} seleccionada`);
  };

  // Eliminar habitación
  const removeRoom = (letra) => {
    // Eliminar localmente
    const updatedRooms = rooms.filter(room => room.letra !== letra);
    setRooms(updatedRooms);
    
    // Actualizar el contexto de reserva
    updateFormSection('habitacionesSeleccionadas', updatedRooms);
    
    // Notificar al componente padre de la eliminación
    // Aquí sí enviamos el array completo actualizado para sincronizar
    if (onRoomsChange) {
      // Enviamos un objeto especial para indicar que es una eliminación
      onRoomsChange({
        action: 'remove',
        letra: letra,
        updatedRooms: updatedRooms
      });
    }
    
    toast.info(`Habitación ${letra} eliminada`);
  };

  // Renderizar el área seleccionable para cada habitación
  const renderAreaSeleccionable = (habitacion) => {
    const area = habitacion.area || areasSeleccionables[habitacion.letra];
    if (!area) return null;
    
    return (
      <area 
        key={`area-${habitacion.id || habitacion._id || habitacion.letra}`}
        shape={area.shape || 'rect'} 
        coords={area.coords} 
        alt={`Habitación ${habitacion.letra}`}
        title={`Habitación ${habitacion.letra} - ${habitacion.tipo} (${habitacion.capacidad} personas)`}
        onClick={() => handleRoomClick(habitacion)}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  // Manejar clic en una habitación
  const handleRoomClick = (habitacion) => {
    if (isSelected(habitacion.letra)) {
      removeRoom(habitacion.letra);
    } else {
      handleSelectHabitacion(habitacion);
    }
  };

  // Renderizar un marcador visual para cada habitación
  const renderHabitacionMarcador = (habitacion) => {
    const area = habitacion.area || areasSeleccionables[habitacion.letra];
    if (!area) return null;
    
    const coords = area.coords.split(',').map(Number);
    const selected = isSelected(habitacion.letra);
    
    // Calcular posición y tamaño
    const x1 = coords[0];
    const y1 = coords[1];
    const x2 = coords[2];
    const y2 = coords[3];
    const width = x2 - x1;
    const height = y2 - y1;
    
    // Determinar dirección del gradiente
    let gradientDirection = 'to bottom';
    switch (area.direction) {
      case 'top': gradientDirection = 'to top'; break;
      case 'right': gradientDirection = 'to right'; break;
      case 'left': gradientDirection = 'to left'; break;
      default: gradientDirection = 'to bottom';
    }
    
    // Colores pastel suaves
    const colorNoSeleccionado = '#F8E8E0'; // Beige pastel suave
    const colorSeleccionado = '#E6B89C'; // Marrón claro pastel
    
    return (
      <div
        key={`marker-${habitacion.id || habitacion._id || habitacion.letra}-${Math.random().toString(36).substr(2, 9)}`}
        className={`habitacion-marcador ${selected ? 'seleccionada' : ''}`}
        style={{
          position: 'absolute',
          left: `${x1}px`,
          top: `${y1}px`,
          width: `${width}px`,
          height: `${height}px`,
          background: selected 
            ? `linear-gradient(${gradientDirection}, ${colorSeleccionado} 0%, rgba(230, 184, 156, 0.7) 70%, rgba(230, 184, 156, 0.5) 100%)`
            : `linear-gradient(${gradientDirection}, ${colorNoSeleccionado} 0%, rgba(248, 232, 224, 0.6) 70%, rgba(248, 232, 224, 0.3) 100%)`,
          border: selected ? '2px solid #D4A389' : '1px solid rgba(248, 232, 224, 0.8)',
          zIndex: 1,
          pointerEvents: 'none', // Para que no interfiera con los clics
          transition: 'all 0.3s ease'
        }}
      />
    );
  };

  // Renderizar componente de carga
  const renderLoading = () => (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <div>Cargando habitaciones...</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Asignación de Habitaciones
        </h3>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          {showMap ? (
            <>
              <FaList className="mr-2" /> Ver lista
            </>
          ) : (
            <>
              <FaMapMarkedAlt className="mr-2" /> Ver mapa
            </>
          )}
        </button>
      </div>

      {showMap ? (
        <div className="relative w-full max-w-4xl mx-auto mt-4 mb-8">
          <div className="relative">
            {isLoading ? (
              renderLoading()
            ) : (
              <>
                {/* Imagen del mapa con áreas seleccionables */}
                <div className="relative" ref={mapRef} style={{ position: 'relative' }}>
                  <img
                    src="/plano-Hotel.jpeg"
                    alt="Plano del Hotel"
                    className="w-full h-auto rounded-lg shadow-sm"
                    useMap="#mapa-habitaciones"
                    style={{ maxWidth: '100%' }}
                  />
                  
                  {/* Marcadores visuales para todas las habitaciones */}
                  {habitaciones.map(renderHabitacionMarcador)}
                  
                  {/* Mapa de imagen con áreas seleccionables */}
                  <map name="mapa-habitaciones">
                    {habitaciones.map(renderAreaSeleccionable)}
                  </map>
                </div>
                
                {/* Leyenda */}
                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-b from-[#F8E8E0] to-transparent mr-2"></div>
                    <span className="text-sm">Habitación disponible (haz clic en las letras)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-b from-[#E6B89C] to-transparent mr-2"></div>
                    <span className="text-sm">Habitación seleccionada</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habitaciones.map((habitacion) => {
            const isRoomSelected = isSelected(habitacion.letra);
            
            return (
              <div 
                key={habitacion.letra}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  isRoomSelected
                    ? 'border-[var(--color-primary-dark)] bg-[var(--color-primary)]/10'
                    : 'border-gray-200 hover:border-[var(--color-primary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-[#6366F1] text-white">
                      <span className="font-bold">{habitacion.letra}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Habitación {habitacion.letra}</h4>
                      <p className="text-sm text-gray-600">
                        {habitacion.tipo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {habitacion.capacidad} personas • {habitacion.precioPorNoche}€/noche
                      </p>
                    </div>
                  </div>
                  
                  {isRoomSelected ? (
                    <button
                      onClick={() => removeRoom(habitacion.letra)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectHabitacion(habitacion)}
                      className="ml-auto text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                    >
                      <FaPlus />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rooms.length === 0 && !showMap && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaUserFriends className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay habitaciones asignadas
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Seleccione habitaciones en el mapa para asignarlas al evento.
          </p>
        </div>
      )}
    </div>
  );
};

export default EventoMapaHabitacionesNuevo;
