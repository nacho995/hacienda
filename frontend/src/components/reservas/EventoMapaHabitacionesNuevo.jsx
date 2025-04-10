"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaUserFriends, FaBed, FaList, FaMapMarkedAlt, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { obtenerHabitaciones } from '../../services/habitaciones.service';
import { useReservation } from '@/context/ReservationContext';
import './EventoMapaHabitaciones.css';

const EventoMapaHabitacionesNuevo = ({ onRoomsChange, eventDate, onHabitacionesLoad }) => {
  const { formData, updateFormSection } = useReservation();
  const [rooms, setRooms] = useState(formData.habitacionesSeleccionadas || []);
  const [showMap, setShowMap] = useState(true);
  const [habitaciones, setHabitaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);

  // Obtener el número máximo de habitaciones del contexto
  const maxHabitaciones = formData.numeroHabitaciones || 7;

  // Áreas seleccionables para cada habitación basadas en la imagen del plano
  const areasSeleccionables = {
    'A': { coords: '332,143,392,204', shape: 'rect', direction: 'bottom' },
    'B': { coords: '400,143,460,204', shape: 'rect', direction: 'bottom' },
    'C': { coords: '453,205,534,266', shape: 'rect', direction: 'left' },
    'D': { coords: '453,263,534,324', shape: 'rect', direction: 'left' },
    'E': { coords: '453,321,534,382', shape: 'rect', direction: 'left' },
    'F': { coords: '453,379,534,440', shape: 'rect', direction: 'left' },
    'G': { coords: '467,492,528,573', shape: 'rect', direction: 'top' },
    'H': { coords: '523,492,584,573', shape: 'rect', direction: 'top' },
    'I': { coords: '579,492,640,573', shape: 'rect', direction: 'top' },
    'J': { coords: '635,492,696,573', shape: 'rect', direction: 'top' },
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
        const response = await obtenerHabitaciones();
        console.log('Habitaciones obtenidas de la BD:', response);
        
        // Check if response is successful and data is an array
        let habitacionesData = [];
        if (response && response.success && Array.isArray(response.data)) {
           habitacionesData = response.data;
        } else if (Array.isArray(response)) { // Handle cases where API returns array directly
            console.warn('API devolvió un array directamente, usando ese array.');
            habitacionesData = response;
        } else {
          console.error('No se encontraron habitaciones en la base de datos o el formato es incorrecto:', response);
          setHabitaciones([]);
          setIsLoading(false);
          toast.error('No se encontraron habitaciones disponibles');
          return;
        }
        
        // Procesar habitaciones recibidas usando habitacionesData
        const habitacionesProcesadas = habitacionesData.map(hab => {
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

    // Verificar si ya se alcanzó el límite de habitaciones
    if (rooms.length >= maxHabitaciones) {
      toast.error(`No puede seleccionar más de ${maxHabitaciones} habitaciones`);
      return;
    }
    
    // Agregar la habitación a las seleccionadas localmente
    const updatedRooms = [...rooms, habitacion];
    setRooms(updatedRooms);
    
    // Notificar al componente padre de la habitación seleccionada
    if (onRoomsChange) {
      onRoomsChange({
        action: 'add',
        habitacion: habitacion,
        allRooms: updatedRooms
      });
    }
    
    toast.success(`Habitación ${habitacion.letra} seleccionada (${updatedRooms.length} de ${maxHabitaciones})`);
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
    
    // --- NEW COLOR LOGIC ---
    // Unified color for selected rooms
    const selectedColor = '#E57373'; // Reddish-coral
    const selectedBorderColor = '#D32F2F'; // Darker red border for selected

    // Base color per floor (when not selected)
    let floorBaseColor;
    if (['A', 'B'].includes(habitacion.letra)) {
      floorBaseColor = '#A5D6A7'; // Soft Green (Floor 1)
    } else if (['C', 'D', 'E', 'F'].includes(habitacion.letra)) {
      floorBaseColor = '#90CAF9'; // Soft Blue (Floor 2)
    } else {
      floorBaseColor = '#FFCC80'; // Soft Orange/Peach (Floor 3)
    }

    // Determine final colors based on selection status
    const finalBackgroundColor = selected ? selectedColor : floorBaseColor;
    const finalBorderColor = selected ? selectedBorderColor : floorBaseColor; // Border matches base color when not selected
    // --- END NEW COLOR LOGIC ---

    // Determinar el gradiente según la dirección de la puerta (ahora color -> transparente -> transparente)
    const getGradientByDirection = (direction, isSelected) => {
      const color = finalBackgroundColor;
      const baseOpacity = selected ? 'E6' : 'CC'; // 90% or 80% opacity hex
      const transparent = `${color}00`; // Fully transparent version of the color
      const semiTransparent = `${color}${baseOpacity}`; // Semi-transparent version

      // Define the gradient stops: Color -> Transparent (early) -> Transparent
      const gradientStops = `${semiTransparent} 0%, ${transparent} 40%, ${transparent} 100%`;

      // Apply the gradient based on direction
      switch (direction) {
        case 'top':
          return `linear-gradient(to top, ${gradientStops})`;
        case 'bottom':
          return `linear-gradient(to bottom, ${gradientStops})`;
        case 'left':
          return `linear-gradient(to left, ${gradientStops})`;
        case 'right':
          return `linear-gradient(to right, ${gradientStops})`;
        default:
          // Default to bottom if direction is not specified
          return `linear-gradient(to bottom, ${gradientStops})`;
      }
    };

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
          // Use the determined background gradient
          background: getGradientByDirection(area.direction, selected),
           // Use the determined border color
          border: `2px solid ${finalBorderColor}`,
          zIndex: 1,
          pointerEvents: 'none',
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
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Asignación de Habitaciones
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Seleccionadas: {rooms.length} de {maxHabitaciones} habitaciones
          </p>
        </div>
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
                
                {/* Leyenda Actualizada */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-lg font-semibold text-[var(--color-primary)] mb-3">Leyenda del Mapa</h4>
                  
                  {/* Color de Selección Unificado */}
                  <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                       <div className="flex items-center">
                        <div className="w-6 h-6 rounded bg-[#E57373E6] mr-2 border-2 border-[#D32F2F]"></div>
                        <span className="text-sm font-medium">Seleccionada</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Colores Disponibles por Planta */}
                  <div className="bg-white/80 p-3 rounded-lg shadow-sm space-y-2">
                    <h5 className="font-medium text-gray-700 mb-2">Disponibles por Planta:</h5>
                    {/* Primera Planta */}
                    <div className="flex items-center gap-3">
                       <div className="flex items-center">
                        <div className="w-6 h-6 rounded bg-[#A5D6A7CC] mr-2 border border-[#A5D6A7]"></div>
                        <span className="text-sm">Primera Planta (A, B)</span>
                      </div>
                    </div>
                    {/* Segunda Planta */}
                    <div className="flex items-center gap-3">
                       <div className="flex items-center">
                        <div className="w-6 h-6 rounded bg-[#90CAF9CC] mr-2 border border-[#90CAF9]"></div>
                        <span className="text-sm">Segunda Planta (C, D, E, F)</span>
                      </div>
                    </div>
                    {/* Tercera Planta */}
                    <div className="flex items-center gap-3">
                       <div className="flex items-center">
                        <div className="w-6 h-6 rounded bg-[#FFCC80CC] mr-2 border border-[#FFCC80]"></div>
                        <span className="text-sm">Tercera Planta (G-O)</span>
                      </div>
                    </div>
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
