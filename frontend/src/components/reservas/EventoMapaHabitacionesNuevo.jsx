"use client";

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { FaPlus, FaTrash, FaUserFriends, FaBed, FaList, FaMapMarkedAlt, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { obtenerHabitaciones } from '../../services/habitaciones.service';
import { useReservation } from '@/context/ReservationContext';
import './EventoMapaHabitaciones.css';
import { debounce } from 'lodash';

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

const EventoMapaHabitacionesNuevo = ({ onRoomsChange, eventDate, onHabitacionesLoad }) => {
  const { formData, updateFormSection } = useReservation();
  const [rooms, setRooms] = useState(formData.habitacionesSeleccionadas || []);
  const [showMap, setShowMap] = useState(true);
  const [habitaciones, setHabitaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const imgRef = useRef(null);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const [scaledCoords, setScaledCoords] = useState({});

  const maxHabitaciones = formData.numeroHabitaciones || 7;

  useEffect(() => {
    const cargarHabitaciones = async () => {
      try {
        setIsLoading(true);
        const response = await obtenerHabitaciones();
        console.log('Habitaciones obtenidas de la BD:', response);

        let habitacionesData = [];
        if (response && response.success && Array.isArray(response.data)) {
           habitacionesData = response.data;
        } else if (Array.isArray(response)) {
            console.warn('API devolvió un array directamente, usando ese array.');
            habitacionesData = response;
        } else {
          console.error('No se encontraron habitaciones en la base de datos o el formato es incorrecto:', response);
          setHabitaciones([]);
          setIsLoading(false);
          toast.error('No se encontraron habitaciones disponibles');
          return;
        }

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

        setHabitaciones(habitacionesProcesadas);

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
  }, [onHabitacionesLoad]);

  const isSelected = useCallback((letra) => {
    return rooms.some(room => room.letra === letra);
  }, [rooms]);

  const handleSelectHabitacion = useCallback((habitacion) => {
    if (isSelected(habitacion.letra)) {
      toast.info(`La habitación ${habitacion.letra} ya está seleccionada`);
      return;
    }

    if (rooms.length >= maxHabitaciones) {
      toast.error(`No puede seleccionar más de ${maxHabitaciones} habitaciones`);
      return;
    }
    
    const updatedRooms = [...rooms, habitacion];
    setRooms(updatedRooms);
    
    if (onRoomsChange) {
      onRoomsChange({
        action: 'add',
        habitacion: habitacion,
        allRooms: updatedRooms
      });
    }
    
    toast.success(`Habitación ${habitacion.letra} seleccionada (${updatedRooms.length} de ${maxHabitaciones})`);
  }, [rooms, maxHabitaciones, onRoomsChange, isSelected]);

  const removeRoom = useCallback((letra) => {
    const updatedRooms = rooms.filter(room => room.letra !== letra);
    setRooms(updatedRooms);
    
    updateFormSection('habitacionesSeleccionadas', updatedRooms);
    
    if (onRoomsChange) {
      onRoomsChange({
        action: 'remove',
        letra: letra,
        updatedRooms: updatedRooms
      });
    }
    
    toast.info(`Habitación ${letra} eliminada`);
  }, [rooms, onRoomsChange, updateFormSection]);

  const handleRoomClick = useCallback((habitacion) => {
    if (isSelected(habitacion.letra)) {
      removeRoom(habitacion.letra);
    } else {
      handleSelectHabitacion(habitacion);
    }
  }, [isSelected, removeRoom, handleSelectHabitacion]);

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setOriginalImageSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
      console.log(`[EventoMapa handleImageLoad] Natural dimensions set: ${imgRef.current.naturalWidth}x${imgRef.current.naturalHeight}`);
    }
  }, []);

  const calculateCoords = useCallback((currentImg, originalSize) => {
    if (!currentImg || !originalSize.width || !originalSize.height) {
      console.log("[EventoMapa calculateCoords] Skipping: Missing refs or original size.");
      return null;
    }
    const currentWidth = currentImg.offsetWidth;
    const currentHeight = currentImg.offsetHeight;
    const naturalWidth = originalSize.width;
    const naturalHeight = originalSize.height;

    if (naturalWidth === 0 || naturalHeight === 0 || currentWidth === 0 || currentHeight === 0) {
       console.log("[EventoMapa calculateCoords] Skipping: Zero dimension detected.");
       return null;
    }

    const scaleX = currentWidth / naturalWidth;
    const scaleY = currentHeight / naturalHeight;

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
    }
    return newCoords;
  }, []);

  useLayoutEffect(() => {
    if (originalImageSize.width > 0 && originalImageSize.height > 0 && imgRef.current) {
      console.log("[EventoMapa useLayoutEffect] Calculating initial coords...");
      const initialCoords = calculateCoords(imgRef.current, originalImageSize);
      if (initialCoords) {
        setScaledCoords(initialCoords);
      }

      const handleResize = () => {
        const newCoords = calculateCoords(imgRef.current, originalImageSize);
        if (newCoords) {
          setScaledCoords(newCoords);
        }
      };

      const debouncedResizeHandler = debounce(handleResize, 150);
      window.addEventListener('resize', debouncedResizeHandler);
      console.log("[EventoMapa useLayoutEffect] Resize listener added.");

      return () => {
        window.removeEventListener('resize', debouncedResizeHandler);
        debouncedResizeHandler.cancel();
        console.log("[EventoMapa useLayoutEffect] Resize listener removed.");
      };
    }
  }, [originalImageSize, calculateCoords]);

  const renderAreaSeleccionable = useCallback((habitacion) => {
    const areaOriginal = areasSeleccionables[habitacion.letra] || { coords: '0,0,0,0', shape: 'rect' };
    const areaToUse = scaledCoords[habitacion.letra] || areaOriginal;

    if (!areaToUse || areaToUse.coords === '0,0,0,0') return null;

    return (
      <area
        key={`area-${habitacion.id || habitacion._id || habitacion.letra}`}
        shape={areaToUse.shape || 'rect'}
        coords={areaToUse.coords}
        alt={`Habitación ${habitacion.letra}`}
        title={`Habitación ${habitacion.letra} - ${habitacion.tipo} (${habitacion.capacidad} personas)`}
        onClick={() => handleRoomClick(habitacion)}
        style={{ cursor: 'pointer' }}
      />
    );
  }, [handleRoomClick, scaledCoords]);

  const renderHabitacionMarcador = useCallback((habitacion) => {
    const areaOriginal = areasSeleccionables[habitacion.letra] || { coords: '0,0,0,0', shape: 'rect' };
    const areaToUse = scaledCoords[habitacion.letra] || areaOriginal;

    if (!areaToUse || areaToUse.coords === '0,0,0,0') return null;

    const coords = areaToUse.coords.split(',').map(Number);
    const selected = isSelected(habitacion.letra);

    const x1 = coords[0];
    const y1 = coords[1];
    const x2 = coords[2];
    const y2 = coords[3];
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    const selectedColor = '#E57373';
    const selectedBorderColor = '#D32F2F';
    let floorBaseColor;
    if (['A', 'B'].includes(habitacion.letra)) floorBaseColor = '#A5D6A7';
    else if (['C', 'D', 'E', 'F'].includes(habitacion.letra)) floorBaseColor = '#90CAF9';
    else floorBaseColor = '#FFCC80';
    const finalBackgroundColor = selected ? selectedColor : floorBaseColor;
    const finalBorderColor = selected ? selectedBorderColor : floorBaseColor;

    const getGradientByDirection = (direction, isSelectedParam) => {
      const color = finalBackgroundColor;
      const baseOpacity = isSelectedParam ? 'E6' : 'CC';
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
        key={`marker-${habitacion.id || habitacion._id || habitacion.letra}-${Math.random().toString(36).substr(2, 9)}`}
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
  }, [isSelected, scaledCoords]);

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
                <div className="relative" ref={mapRef} style={{ position: 'relative' }}>
                  <img
                    src="/plano-Hotel.jpeg"
                    alt="Plano del Hotel"
                    className="w-full h-auto rounded-lg shadow-sm"
                    useMap="#mapa-habitaciones"
                    style={{ maxWidth: '100%' }}
                    ref={imgRef}
                    onLoad={handleImageLoad}
                  />
                  
                  {Object.keys(scaledCoords).length > 0 && habitaciones.map(renderHabitacionMarcador)}
                  
                  <map name="mapa-habitaciones">
                    {Object.keys(scaledCoords).length > 0 && habitaciones.map(renderAreaSeleccionable)}
                  </map>
                </div>
                
                <div className="mt-6 space-y-3">
                  <h4 className="text-lg font-semibold text-[var(--color-primary)] mb-3">Leyenda del Mapa</h4>
                  
                  <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                       <div className="flex items-center">
                        <div className="w-6 h-6 rounded bg-[#E57373E6] mr-2 border-2 border-[#D32F2F]"></div>
                        <span className="text-sm font-medium">Seleccionada</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 p-3 rounded-lg shadow-sm space-y-2">
                    <h5 className="font-medium text-gray-700 mb-2">Disponibles por Planta:</h5>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center">
                        <div className="w-6 h-6 rounded bg-[#A5D6A7CC] mr-2 border border-[#A5D6A7]"></div>
                        <span className="text-sm">Primera Planta (A, B)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center">
                        <div className="w-6 h-6 rounded bg-[#90CAF9CC] mr-2 border border-[#90CAF9]"></div>
                        <span className="text-sm">Segunda Planta (C, D, E, F)</span>
                      </div>
                    </div>
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
            
            let planta = 'Desconocida';
            let tipoHab = 'Estándar';
            let categoria = 'Doble';
            
            if (['A', 'B'].includes(habitacion.letra)) {
              planta = 'Primera Planta';
              categoria = 'Sencilla';
            } else if (['C', 'D', 'E', 'F'].includes(habitacion.letra)) {
              planta = 'Segunda Planta';
              categoria = 'Doble';
            } else if (['G', 'H', 'I', 'J'].includes(habitacion.letra)) {
              planta = 'Tercera Planta';
              categoria = 'Doble';
            } else if (['K', 'L', 'M', 'O'].includes(habitacion.letra)) {
              planta = 'Primera/Tercera Planta';
              if (['K', 'L'].includes(habitacion.letra)) planta = 'Primera Planta';
              if (['M', 'O'].includes(habitacion.letra)) planta = 'Tercera Planta';
              categoria = 'Sencilla';
            }
            
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
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gray-200 text-gray-800"> 
                      <span className="font-bold">{habitacion.letra}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Habitación {habitacion.letra}</h4>
                      <p className="text-sm text-gray-600">
                        {planta} • {categoria} 
                      </p>
                      <p className="text-xs text-gray-500">
                        {habitacion.capacidad} personas
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
