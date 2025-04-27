"use client";

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { FaPlus, FaTrash, FaUserFriends, FaBed, FaList, FaMapMarkedAlt, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { obtenerHabitaciones } from '../../services/habitaciones.service';
import { obtenerTodasLasReservas, obtenerFechasOcupadas } from '../../services/disponibilidadService';
import './EventoMapaHabitaciones.css';
import { debounce } from 'lodash';

// *** MOVER areasSeleccionables FUERA del componente ***
const areasSeleccionables = {
  'A': { coords: '597,260,698,358', shape: 'rect', direction: 'bottom' },
  'B': { coords: '723,257,824,355', shape: 'rect', direction: 'bottom' },
  'C': { coords: '830,379,960,461', shape: 'rect', direction: 'left' },
  'D': { coords: '830,485,958,565', shape: 'rect', direction: 'left' },
  'E': { coords: '825,585,959,671', shape: 'rect', direction: 'left' },
  'F': { coords: '825,693,958,775', shape: 'rect', direction: 'left' },
  'G': { coords: '842,886,931,1034', shape: 'rect', direction: 'top' },
  'H': { coords: '949,888,1036,1032', shape: 'rect', direction: 'top' },
  'I': { coords: '1054,890,1143,1033', shape: 'rect', direction: 'top' },
  'J': { coords: '1160,886,1250,1035', shape: 'rect', direction: 'top' },
  'K': { coords: '724,890,819,985', shape: 'rect', direction: 'right' },
  'L': { coords: '727,1025,820,1121', shape: 'rect', direction: 'right' },
  'M': { coords: '1366,632,1458,731', shape: 'rect', direction: 'left' },
  'O': { coords: '1365,793,1461,892', shape: 'rect', direction: 'left' }
};

const HotelMapaHabitaciones = ({ selectedRoomIds = [], onToggleRoom, onHabitacionesLoad }) => {
  const [showMap, setShowMap] = useState(true);
  const [habitaciones, setHabitaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fechasOcupadasPorHabitacion, setFechasOcupadasPorHabitacion] = useState({});
  const mapRef = useRef(null);
  const imgRef = useRef(null);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const [scaledCoords, setScaledCoords] = useState({});

  // // Áreas seleccionables movidas fuera del componente
  // const areasSeleccionables = { ... };

  // Cargar habitaciones desde la API
  useEffect(() => {
    // console.log("[HotelMapa] Mount Effect - Running cargarHabitaciones..."); // <-- Log añadido
    const cargarHabitaciones = async () => {
      let loadedHabitaciones = []; // Store loaded rooms temporarily
      try {
        setIsLoading(true);
        const response = await obtenerHabitaciones();
        // console.log('[HotelMapa] Habitaciones obtenidas:', response);

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
           // console.log('[HotelMapa] Habitaciones procesadas:', habitacionesProcesadas);
           setHabitaciones(habitacionesProcesadas);
           loadedHabitaciones = habitacionesProcesadas; // Update temporary list
           
           // Cargar fechas ocupadas para cada habitación
           cargarFechasOcupadas(habitacionesProcesadas);
        }
      } catch (error) {
        console.error('[HotelMapa] Error al cargar habitaciones:', error);
        setHabitaciones([]);
        toast.error('Error cargando habitaciones. Intente más tarde.');
      } finally {
        setIsLoading(false);
        // console.log('[HotelMapa] Carga finalizada.');
        // Call onHabitacionesLoad regardless of success or failure, passing what was loaded
        if (typeof onHabitacionesLoad === 'function') {
          // console.log('[HotelMapa] Attempting to call onHabitacionesLoad in finally...'); // Log before calling prop
          // console.log('[HotelMapa] Calling onHabitacionesLoad in finally block with:', loadedHabitaciones);
          onHabitacionesLoad(loadedHabitaciones);
          // console.log('[HotelMapa] onHabitacionesLoad called successfully.'); // Log after calling prop
        } else {
           console.warn("[HotelMapa] onHabitacionesLoad is not a function in finally block.");
        }
      }
    };

    cargarHabitaciones();
  // Removed dependencies to ensure it runs only once on mount
  // If onHabitacionesLoad could change, add it here, but it's unlikely needed
  }, []); // Changed dependency to [] to ensure it runs once on mount

  // Nueva función para cargar fechas ocupadas (OPTIMIZADA)
  const cargarFechasOcupadas = async (habitacionesParaCargar) => {
    if (!habitacionesParaCargar || habitacionesParaCargar.length === 0) {
        // console.log('[HotelMapa] No hay habitaciones para cargar fechas ocupadas.');
        return;
    }
    try {
        // console.log('[HotelMapa] Iniciando carga optimizada de fechas ocupadas...');
        // 1. Llamar a la función que obtiene AMBAS reservas
        const todasLasReservas = await obtenerTodasLasReservas();
        // console.log('[HotelMapa] Datos RECIBIDOS del servicio:', todasLasReservas); // <-- LOG AÑADIDO

        // 2. Extraer los datos de la respuesta, accediendo a .data para el array real
        //    y proveyendo fallback a array vacío
        const arrayReservasHabitacion = todasLasReservas?.reservasHabitacion?.data || [];
        const arrayReservasEvento = todasLasReservas?.reservasEvento?.data || [];
        // console.log('[HotelMapa] Arrays EXTRAÍDOS:', { arrayReservasHabitacion, arrayReservasEvento }); // <-- LOG AÑADIDO

        // 3. Filtrar las reservas (ahora sí sobre los arrays)
        const habitacionReservations = arrayReservasHabitacion.filter(r => r.estadoReserva !== 'cancelada');
        const eventoReservations = arrayReservasEvento.filter(r => r.estadoReserva !== 'cancelada');


        const ocupacionPorHabitacion = {};

        // 4. Procesar las reservas para cada habitación
        for (const habitacion of habitacionesParaCargar) {
            if (!habitacion._id) {
                console.warn(`[HotelMapa] Habitación sin _id encontrada: ${habitacion.letra || 'ID Desconocido'}, omitiendo.`);
                continue; // Omitir si no hay ID
            }

            // Filtrar reservas directas para esta habitación (usando los arrays filtrados)
            const reservasDirectas = habitacionReservations
                .filter(r => r.habitacion && r.habitacion._id === habitacion._id) // <-- Asumiendo que `r.habitacion` tiene `._id`
                .map(r => ({
                    inicio: new Date(r.fechaEntrada || r.fechaInicio), // Usar fechaEntrada o fechaInicio si existe
                    fin: new Date(r.fechaSalida || r.fechaFin), // Usar fechaSalida o fechaFin si existe
                    tipo: 'habitacion'
                }));

            // Filtrar reservas por eventos que incluyen esta habitación (usando los arrays filtrados)
            const reservasPorEvento = eventoReservations
                .filter(e => 
                    e.habitacionesReservadas && 
                    e.habitacionesReservadas.some(h => h._id === habitacion._id)
                )
                .map(e => ({
                    inicio: new Date(e.fecha || e.fechaInicio), // Usar fecha o fechaInicio
                    fin: new Date(e.fechaFin || e.fecha), // Usar fechaFin o fecha
                    tipo: 'evento',
                    nombreEvento: e.tipoEvento || 'Evento'
                }));

            // Combinar ambos tipos de reservas para la habitación actual
            ocupacionPorHabitacion[habitacion._id] = [...reservasDirectas, ...reservasPorEvento];
        }

        setFechasOcupadasPorHabitacion(ocupacionPorHabitacion);
        // console.log('[HotelMapa] Estado FINAL fechasOcupadasPorHabitacion:', ocupacionPorHabitacion); // <-- CORREGIDO (quitado el apóstrofe simple)

    } catch (error) {
        console.error('[HotelMapa] Error al cargar fechas ocupadas (optimizado):', error);
        toast.error('Error al verificar ocupación de habitaciones.');
    }
};

  // Verificar si una habitación está seleccionada usando selectedRoomIds
  const isSelected = useCallback((roomId) => {
    // console.log(`[HotelMapa] Checking selection for ${roomId}. Selected IDs:`, selectedRoomIds);
    return selectedRoomIds.includes(roomId);
  }, [selectedRoomIds]);

  // Simplified click handler: Call the parent's toggle function
  const handleRoomClick = useCallback((habitacion) => {
    // console.log('[HotelMapa] handleRoomClick for:', habitacion);
    if (!habitacion || !habitacion.id) {
        console.error('[HotelMapa] Invalid habitacion object in handleRoomClick:', habitacion);
        toast.error("Error interno al seleccionar habitación.");
        return;
    }
    if (typeof onToggleRoom === 'function') {
      // console.log(`[HotelMapa] Calling onToggleRoom with ID: ${habitacion.id}`);
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

  // Función para guardar dimensiones originales al cargar imagen
  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setOriginalImageSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
      // console.log(`[HotelMapa handleImageLoad] Natural dimensions set: ${imgRef.current.naturalWidth}x${imgRef.current.naturalHeight}`);
    }
  }, []); // Dependencia vacía, solo usa ref

  // Función Pura para Calcular Coordenadas (ahora puede quitar dependencia de areasSeleccionables)
  const calculateCoords = useCallback((currentImg, originalSize) => {
    // baseAreas ahora es la constante global areasSeleccionables
    if (!currentImg || !originalSize.width || !originalSize.height) {
      // console.log("[HotelMapa calculateCoords] Skipping: Missing refs or original size.");
      return null; // Devuelve null si no se puede calcular
    }
    const currentWidth = currentImg.offsetWidth;
    const currentHeight = currentImg.offsetHeight;
    const naturalWidth = originalSize.width;
    const naturalHeight = originalSize.height;

    // console.log(`[HotelMapa calculateCoords] Natural W: ${naturalWidth}, Natural H: ${naturalHeight}`);
    // console.log(`[HotelMapa calculateCoords] Offset W: ${currentWidth}, Offset H: ${currentHeight}`);

    if (naturalWidth === 0 || naturalHeight === 0 || currentWidth === 0 || currentHeight === 0) {
       // console.log("[HotelMapa calculateCoords] Skipping: Zero dimension detected.");
       return null;
    }

    const scaleX = currentWidth / naturalWidth;
    const scaleY = currentHeight / naturalHeight;
    // console.log(`[HotelMapa calculateCoords] Scale X: ${scaleX.toFixed(4)}, Scale Y: ${scaleY.toFixed(4)}`);

    const newCoords = {};
    for (const letra in areasSeleccionables) {
      const area = areasSeleccionables[letra];
      const originalCoords = area.coords.split(',').map(Number);
      const scaled = [
        Math.round(originalCoords[0] * scaleX),
        Math.round(originalCoords[1] * scaleY),
        Math.round(originalCoords[2] * scaleX),
        Math.round(originalCoords[3] * scaleY)
      ].join(',');
      newCoords[letra] = { ...area, coords: scaled };

      // if (letra === 'A') {
      //   console.log(`[HotelMapa calculateCoords] Room A - Original: ${area.coords} -> Scaled: ${scaled}`);
      // }
    }
    return newCoords; // Devuelve el objeto calculado
  // Ya no necesita depender de areasSeleccionables aquí explícitamente
  // porque es una constante definida fuera.
  }, []);

  // Efecto para cálculo inicial y listener de resize
  useLayoutEffect(() => {
    // Solo proceder si tenemos las dimensiones originales y el ref
    if (originalImageSize.width > 0 && originalImageSize.height > 0 && imgRef.current) {

      // Cálculo inicial
      // console.log("[HotelMapa useLayoutEffect] Calculating initial coords...");
      const initialCoords = calculateCoords(imgRef.current, originalImageSize);
      if (initialCoords) {
        setScaledCoords(initialCoords);
      }

      // Función que se ejecutará en cada resize (debounced)
      const handleResize = () => {
        // console.log("[HotelMapa handleResize] Fired!");
        const newCoords = calculateCoords(imgRef.current, originalImageSize);
        if (newCoords) {
          setScaledCoords(newCoords);
        }
      };

      // Crear la versión debounced
      const debouncedResizeHandler = debounce(handleResize, 150);

      // Añadir listener
      window.addEventListener('resize', debouncedResizeHandler);
      // console.log("[HotelMapa useLayoutEffect] Resize listener added.");

      // Función de limpieza
      return () => {
        window.removeEventListener('resize', debouncedResizeHandler);
        debouncedResizeHandler.cancel(); // Cancelar ejecuciones pendientes
        // console.log("[HotelMapa useLayoutEffect] Resize listener removed.");
      };
    }
    // Dependencia estricta de originalImageSize para configurar/reconfigurar
  }, [originalImageSize, calculateCoords]); // Incluir calculateCoords como dependencia estable

  // Renderizar el área seleccionable para cada habitación
  const renderAreaSeleccionable = useCallback((habitacion) => {
    // Usa scaledCoords si existe para esa letra, si no, usa el area original como fallback
    const areaOriginal = areasSeleccionables[habitacion.letra] || { coords: '0,0,0,0', shape: 'rect' }; // Obtener de la constante
    const areaToUse = scaledCoords[habitacion.letra] || areaOriginal;

    if (!areaToUse || areaToUse.coords === '0,0,0,0') {
        return null;
    }
    return (
      <area
        key={`area-${habitacion.id}`}
        shape={areaToUse.shape || 'rect'}
        coords={areaToUse.coords}
        alt={`Habitación ${habitacion.letra}`}
        title={`Habitación ${habitacion.letra} (${habitacion.capacidad} pers.)`}
        onClick={(e) => {
            e.preventDefault();
            handleRoomClick(habitacion);
        }}
        style={{ cursor: 'pointer' }}
        href="#"
      />
    );
  }, [handleRoomClick, scaledCoords]);

  // Renderizar un marcador visual para cada habitación
  // Use useCallback if performance becomes an issue with many rooms
  const renderHabitacionMarcador = useCallback((habitacion) => {
    // Usa scaledCoords si existe, si no, el area original como fallback
    const areaOriginal = areasSeleccionables[habitacion.letra] || { coords: '0,0,0,0', shape: 'rect' }; // Obtener de la constante
    const areaToUse = scaledCoords[habitacion.letra] || areaOriginal;

    if (!areaToUse || areaToUse.coords === '0,0,0,0') return null;

    const coords = areaToUse.coords.split(',').map(Number);
    const selected = isSelected(habitacion.id);

    const x1 = coords[0];
    const y1 = coords[1];
    const x2 = coords[2];
    const y2 = coords[3];
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    // Color logic remains the same, but uses the 'selected' status derived from props
    const selectedColor = '#E57373';
    const selectedBorderColor = '#D32F2F';
    let floorBaseColor;
     if (['A', 'B', 'K', 'L'].includes(habitacion.letra)) floorBaseColor = '#A5D6A7';
     else if (['C', 'D', 'E', 'F'].includes(habitacion.letra)) floorBaseColor = '#90CAF9';
     else floorBaseColor = '#FFCC80'; // G-J, M, O

    const finalBackgroundColor = selected ? selectedColor : floorBaseColor;
    const finalBorderColor = selected ? selectedBorderColor : floorBaseColor;

    const getGradientByDirection = (direction, isSel) => {
      const color = finalBackgroundColor;
      const baseOpacity = isSel ? 'E6' : 'CC';
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
        key={`marker-${habitacion.id}`}
        className={`habitacion-marcador ${selected ? 'seleccionada' : ''}`}
        style={{
          position: 'absolute',
          left: `${x1}px`,
          top: `${y1}px`,
          width: `${width}px`,
          height: `${height}px`,
          background: getGradientByDirection(areaToUse.direction, selected),
          border: `2px solid ${finalBorderColor}`,
          zIndex: 1,
          pointerEvents: 'none',
          transition: 'all 0.3s ease'
        }}
      />
    );
  }, [scaledCoords, isSelected]);

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
                  ref={imgRef}
                  onLoad={handleImageLoad}
                />

                {/* Render markers only when not loading */}
                {Object.keys(scaledCoords).length > 0 && habitaciones.map(renderHabitacionMarcador)}

                {/* Image map with areas */}
                <map name="mapa-habitaciones-hotel"> 
                  {/* Use useCallback version of renderArea */}
                  {Object.keys(scaledCoords).length > 0 && habitaciones.map(renderAreaSeleccionable)} 
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
