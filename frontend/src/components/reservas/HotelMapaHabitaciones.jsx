"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlus, FaTrash, FaUserFriends, FaBed, FaList, FaMapMarkedAlt, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { obtenerHabitaciones } from '../../services/habitaciones.service';
import './EventoMapaHabitaciones.css';

const HotelMapaHabitaciones = ({ selectedRoomIds = [], onToggleRoom, onHabitacionesLoad }) => {
  const [showMap, setShowMap] = useState(true);
  const [habitaciones, setHabitaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);

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
    console.log("[HotelMapa] useEffect for loading rooms running..."); // Log effect start
    const cargarHabitaciones = async () => {
      let loadedHabitaciones = []; // Store loaded rooms temporarily
      try {
        setIsLoading(true);
        const response = await obtenerHabitaciones();
        console.log('[HotelMapa] Habitaciones obtenidas:', response);

        let habitacionesData = [];
        if (response && response.success && Array.isArray(response.data)) {
           habitacionesData = response.data;
        } else if (Array.isArray(response)) {
            console.warn('[HotelMapa] API devolvió un array directamente.');
            habitacionesData = response;
        } else {
          console.error('[HotelMapa] Formato de respuesta inesperado:', response);
          setHabitaciones([]);
          toast.error('Error al obtener formato de habitaciones.');
          // Removed return here, will proceed to finally
        }

        if (habitacionesData.length === 0) {
          console.warn('[HotelMapa] No se encontraron habitaciones en la BD.');
          setHabitaciones([]);
          toast.info('No hay habitaciones disponibles en este momento.');
          // Keep loading false, set by finally block
        } else {
           const habitacionesProcesadas = habitacionesData.map(hab => {
             const letra = hab.letra || hab.id || hab._id; // Use _id as potential fallback
             // Ensure _id is consistently available
             const id = hab._id || hab.id || letra; 
             return {
               ...hab,
               id: id, // Ensure an 'id' field exists for consistency
               letra: letra,
               nombre: hab.nombre || `Habitación ${letra}`,
               tipo: hab.tipo || 'Estándar',
               capacidad: hab.capacidad || 2,
               precioPorNoche: hab.precio || 2450,
               estado: hab.estado || 'disponible',
               area: areasSeleccionables[letra] || { coords: '0,0,0,0', shape: 'rect', direction: 'bottom' }
             };
           });
           console.log('[HotelMapa] Habitaciones procesadas:', habitacionesProcesadas);
           setHabitaciones(habitacionesProcesadas);
           loadedHabitaciones = habitacionesProcesadas; // Update temporary list
        }
      } catch (error) {
        console.error('[HotelMapa] Error al cargar habitaciones:', error);
        setHabitaciones([]);
        toast.error('Error cargando habitaciones. Intente más tarde.');
      } finally {
        setIsLoading(false);
        console.log('[HotelMapa] Carga finalizada.');
        // Call onHabitacionesLoad regardless of success or failure, passing what was loaded
        if (typeof onHabitacionesLoad === 'function') {
          console.log('[HotelMapa] Attempting to call onHabitacionesLoad in finally...'); // Log before calling prop
          console.log('[HotelMapa] Calling onHabitacionesLoad in finally block with:', loadedHabitaciones);
          onHabitacionesLoad(loadedHabitaciones); 
          console.log('[HotelMapa] onHabitacionesLoad called successfully.'); // Log after calling prop
        } else {
           console.warn("[HotelMapa] onHabitacionesLoad is not a function in finally block.");
        }
      }
    };

    cargarHabitaciones();
  // Removed dependencies to ensure it runs only once on mount
  // If onHabitacionesLoad could change, add it here, but it's unlikely needed
  }, []); // Changed dependency to [] to ensure it runs once on mount

  // Verificar si una habitación está seleccionada usando selectedRoomIds
  const isSelected = useCallback((roomId) => {
    // console.log(`[HotelMapa] Checking selection for ${roomId}. Selected IDs:`, selectedRoomIds);
    return selectedRoomIds.includes(roomId);
  }, [selectedRoomIds]);

  // Simplified click handler: Call the parent's toggle function
  const handleRoomClick = useCallback((habitacion) => {
    console.log('[HotelMapa] handleRoomClick for:', habitacion);
    if (!habitacion || !habitacion.id) {
        console.error('[HotelMapa] Invalid habitacion object in handleRoomClick:', habitacion);
        toast.error("Error interno al seleccionar habitación.");
        return;
    }
    if (typeof onToggleRoom === 'function') {
      console.log(`[HotelMapa] Calling onToggleRoom with ID: ${habitacion.id}`);
      onToggleRoom(habitacion.id);
      // Toast messages are now handled by the parent or can be added here based on isSelected status BEFORE toggle
      // Example:
      // if (isSelected(habitacion.id)) {
      //   toast.info(`Habitación ${habitacion.letra} deseleccionada.`);
      // } else {
      //   toast.success(`Habitación ${habitacion.letra} seleccionada.`);
      // }
    } else {
      console.error("[HotelMapa] onToggleRoom prop is not a function!");
      toast.error("Error de configuración: no se puede procesar la selección.");
    }
  }, [onToggleRoom]); // Removed isSelected from dependencies, not needed here

  // Renderizar el área seleccionable para cada habitación
  const renderAreaSeleccionable = useCallback((habitacion) => {
    const area = habitacion.area; // Already includes fallback in processing
    if (!area || area.coords === '0,0,0,0') {
        // console.warn(`[HotelMapa] No area defined for ${habitacion.letra}`);
        return null;
    }
    // console.log(`[HotelMapa] Rendering area for ${habitacion.letra}`); // Can be verbose

    return (
      <area
        // Use habitacion.id which is guaranteed by processing step
        key={`area-${habitacion.id}`} 
        shape={area.shape || 'rect'}
        coords={area.coords}
        alt={`Habitación ${habitacion.letra}`}
        title={`Habitación ${habitacion.letra} (${habitacion.capacidad} pers.)`} // Simplified title
        onClick={(e) => {
            e.preventDefault(); // Prevent potential default browser behavior on image maps
            handleRoomClick(habitacion);
        }}
        style={{ cursor: 'pointer' }}
        // Add href="#" to potentially improve accessibility/discoverability in some browsers
        href="#" 
      />
    );
  }, [handleRoomClick]); // Dependency on handleRoomClick

  // Renderizar un marcador visual para cada habitación
  // Use useCallback if performance becomes an issue with many rooms
  const renderHabitacionMarcador = (habitacion) => {
    const area = habitacion.area;
    if (!area || area.coords === '0,0,0,0') return null;

    const coords = area.coords.split(',').map(Number);
    // Use the isSelected function which depends on props
    const selected = isSelected(habitacion.id); 

    const x1 = coords[0];
    const y1 = coords[1];
    const x2 = coords[2];
    const y2 = coords[3];
    const width = Math.abs(x2 - x1); // Use Math.abs for safety
    const height = Math.abs(y2 - y1);

    // Color logic remains the same, but uses the 'selected' status derived from props
    const selectedColor = '#E57373';
    const selectedBorderColor = '#D32F2F';
    let floorBaseColor;
     if (['A', 'B'].includes(habitacion.letra)) floorBaseColor = '#A5D6A7';
     else if (['C', 'D', 'E', 'F'].includes(habitacion.letra)) floorBaseColor = '#90CAF9';
     else floorBaseColor = '#FFCC80'; // Includes G-O

    const finalBackgroundColor = selected ? selectedColor : floorBaseColor;
    const finalBorderColor = selected ? selectedBorderColor : floorBaseColor;

    const getGradientByDirection = (direction, isSelected) => {
      const color = finalBackgroundColor;
      const baseOpacity = selected ? 'E6' : 'CC';
      const transparent = `${color}00`;
      const semiTransparent = `${color}${baseOpacity}`;
      const gradientStops = `${semiTransparent} 0%, ${transparent} 40%, ${transparent} 100%`;
      switch (direction) {
        case 'top': return `linear-gradient(to top, ${gradientStops})`;
        case 'bottom': return `linear-gradient(to bottom, ${gradientStops})`;
        case 'left': return `linear-gradient(to left, ${gradientStops})`;
        case 'right': return `linear-gradient(to right, ${gradientStops})`;
        default: return `linear-gradient(to bottom, ${gradientStops})`;
      }
    };

    return (
      <div
        key={`marker-${habitacion.id}`} // Use consistent ID
        className={`habitacion-marcador ${selected ? 'seleccionada' : ''}`}
        style={{
          position: 'absolute',
          left: `${x1}px`,
          top: `${y1}px`,
          width: `${width}px`,
          height: `${height}px`,
          background: getGradientByDirection(area.direction, selected),
          border: `2px solid ${finalBorderColor}`,
          zIndex: 1,
          pointerEvents: 'none',
          transition: 'all 0.3s ease'
        }}
      />
    );
  }; // Removed dependency array, relies on isSelected which has its own

  // Renderizar componente de carga
  const renderLoading = () => (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <div>Cargando plano...</div> {/* Adjusted text */}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4"> {/* Added margin-bottom */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Selecciona tus Habitaciones {/* Adjusted Title */}
          </h3>
           {/* Display count based on props */}
          <p className="text-sm text-gray-600 mt-1">
             {selectedRoomIds.length} {selectedRoomIds.length === 1 ? 'habitación seleccionada' : 'habitaciones seleccionadas'}
          </p>
          {/* Removed maxHabitaciones display */}
        </div>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors text-sm" // Made button smaller
        >
          {showMap ? (
            <>
              <FaList /> Ver lista
            </>
          ) : (
            <>
              <FaMapMarkedAlt /> Ver mapa
            </>
          )}
        </button>
      </div>

      {showMap ? (
        // MAP VIEW
        <div className="relative w-full max-w-4xl mx-auto"> {/* Removed margin top/bottom */}
           {isLoading && renderLoading()} {/* Show loading overlay */}
           {!isLoading && habitaciones.length === 0 && (
             <div className="text-center py-10 text-gray-500">
                 No hay habitaciones para mostrar en el mapa.
             </div>
           )}
           {!isLoading && habitaciones.length > 0 && (
              <div className="relative" ref={mapRef} style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                <img
                  src="/plano-Hotel.jpeg"
                  alt="Plano del Hotel"
                  className="w-full h-auto rounded-lg shadow-sm block" // Ensure image is block
                  useMap="#mapa-habitaciones-hotel" // Use a unique map name
                  style={{ maxWidth: '100%' }}
                />

                {/* Render markers only when not loading */}
                {habitaciones.map(renderHabitacionMarcador)}

                {/* Image map with areas */}
                <map name="mapa-habitaciones-hotel"> 
                  {/* Use useCallback version of renderArea */}
                  {habitaciones.map(renderAreaSeleccionable)} 
                </map>

                {/* Updated Legend */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-md font-semibold text-[var(--color-primary)] mb-2">Leyenda</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Selected */}
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div className="w-4 h-4 rounded bg-[#E57373E6] border border-[#D32F2F]"></div>
                          <span>Seleccionada</span>
                      </div>
                       {/* Available Floor 1 */}
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div className="w-4 h-4 rounded bg-[#A5D6A7CC] border border-[#A5D6A7]"></div>
                          <span>Planta 1 (A, B, K, L)</span>
                      </div>
                      {/* Available Floor 2 */}
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div className="w-4 h-4 rounded bg-[#90CAF9CC] border border-[#90CAF9]"></div>
                          <span>Planta 2 (C, D, E, F)</span>
                      </div>
                      {/* Available Floor 3 */}
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div className="w-4 h-4 rounded bg-[#FFCC80CC] border border-[#FFCC80]"></div>
                          <span>Planta 3 (G-J, M, O)</span>
                      </div>
                  </div>
                </div>
              </div>
           )}
        </div>
      ) : (
        // LIST VIEW
        <div className="space-y-3"> {/* Replaced grid with space-y */}
          {isLoading && (
             <div className="text-center py-10"><div className="loading-spinner mx-auto"></div></div>
          )}
          {!isLoading && habitaciones.length === 0 && (
             <div className="text-center py-10 text-gray-500">No hay habitaciones disponibles.</div>
          )}
          {!isLoading && habitaciones.map((habitacion) => {
            // Use the isSelected function based on props
            const isRoomSelected = isSelected(habitacion.id); 

            let planta = 'Desconocida';
            let categoria = 'Estándar';
            // Simplified planta/categoria logic - potentially refine if needed
            if (['A', 'B', 'K', 'L', 'M', 'O'].includes(habitacion.letra)) categoria = 'Sencilla';
            else if (['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(habitacion.letra)) categoria = 'Doble';

            if (['A', 'B', 'K', 'L'].includes(habitacion.letra)) planta = 'Planta 1';
            else if (['C', 'D', 'E', 'F'].includes(habitacion.letra)) planta = 'Planta 2';
            else if (['G', 'H', 'I', 'J', 'M', 'O'].includes(habitacion.letra)) planta = 'Planta 3';

            return (
              <div
                key={habitacion.id} // Use consistent ID
                className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-between ${
                  isRoomSelected
                    ? 'border-[var(--color-primary)] bg-purple-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isRoomSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {habitacion.letra}
                  </div>
                  <div>
                    <h4 className={`font-medium text-sm ${isRoomSelected ? 'text-[var(--color-primary-dark)]' : 'text-gray-800'}`}>
                       Habitación {habitacion.letra}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {planta} • {categoria} • {habitacion.capacidad} pers.
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  // Use the main click handler
                  onClick={() => handleRoomClick(habitacion)} 
                  className={`p-2 rounded-full transition-colors ${
                    isRoomSelected
                      ? 'text-red-500 hover:bg-red-100'
                      : 'text-green-600 hover:bg-green-100'
                  }`}
                  aria-label={isRoomSelected ? `Deseleccionar habitación ${habitacion.letra}` : `Seleccionar habitación ${habitacion.letra}`}
                >
                  {isRoomSelected ? <FaTrash size={14} /> : <FaPlus size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Removed empty state for list view as it's covered by the isLoading/no rooms check */}
    </div>
  );
};

export default HotelMapaHabitaciones;
