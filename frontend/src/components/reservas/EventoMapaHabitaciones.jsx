"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaUserFriends, FaBed, FaList, FaMapMarkedAlt, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { obtenerHabitaciones } from '../../services/habitaciones.service';
import './EventoMapaHabitaciones.css';

const EventoMapaHabitaciones = ({ onRoomsChange, eventDate }) => {
  const [rooms, setRooms] = useState([]);
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

  // Habitaciones predefinidas para asegurar que siempre estén todas
  const habitacionesPredefinidas = [
    { letra: 'A', nombre: 'Habitación A', tipo: 'Sencilla', capacidad: 2, precioPorNoche: 2400 },
    { letra: 'B', nombre: 'Habitación B', tipo: 'Sencilla', capacidad: 2, precioPorNoche: 2400 },
    { letra: 'C', nombre: 'Habitación C', tipo: 'Doble', capacidad: 4, precioPorNoche: 2450 },
    { letra: 'D', nombre: 'Habitación D', tipo: 'Doble', capacidad: 4, precioPorNoche: 2450 },
    { letra: 'E', nombre: 'Habitación E', tipo: 'Doble', capacidad: 4, precioPorNoche: 2450 },
    { letra: 'F', nombre: 'Habitación F', tipo: 'Doble', capacidad: 4, precioPorNoche: 2450 },
    { letra: 'G', nombre: 'Habitación G', tipo: 'Doble', capacidad: 4, precioPorNoche: 2450 },
    { letra: 'H', nombre: 'Habitación H', tipo: 'Doble', capacidad: 4, precioPorNoche: 2450 },
    { letra: 'I', nombre: 'Habitación I', tipo: 'Doble', capacidad: 4, precioPorNoche: 2450 },
    { letra: 'J', nombre: 'Habitación J', tipo: 'Doble', capacidad: 4, precioPorNoche: 2450 },
    { letra: 'K', nombre: 'Habitación K', tipo: 'Sencilla', capacidad: 2, precioPorNoche: 2400 },
    { letra: 'L', nombre: 'Habitación L', tipo: 'Sencilla', capacidad: 2, precioPorNoche: 2400 },
    { letra: 'M', nombre: 'Habitación M', tipo: 'Sencilla', capacidad: 2, precioPorNoche: 2400 },
    { letra: 'O', nombre: 'Habitación O', tipo: 'Sencilla', capacidad: 2, precioPorNoche: 2400 }
  ];

  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        setIsLoading(true);
        // Intentar obtener habitaciones de la base de datos
        let habitacionesData = [];
        try {
          habitacionesData = await obtenerHabitaciones();
          console.log('Habitaciones obtenidas de la BD:', habitacionesData);
        } catch (error) {
          console.error('Error al cargar las habitaciones de la BD:', error);
          // Si falla, usar las predefinidas
          habitacionesData = [];
        }

        // Si no hay suficientes habitaciones, usar las predefinidas
        if (!habitacionesData || habitacionesData.length < 14) {
          console.log('Usando habitaciones predefinidas');
          // Combinar las existentes con las predefinidas para asegurar que estén todas
          const letrasExistentes = habitacionesData.map(h => h.letra);
          const habitacionesFaltantes = habitacionesPredefinidas.filter(h => !letrasExistentes.includes(h.letra));
          
          habitacionesData = [...habitacionesData, ...habitacionesFaltantes];
        }

        // Asignar áreas seleccionables a cada habitación
        const habitacionesConAreas = habitacionesData.map(hab => ({
          ...hab,
          area: areasSeleccionables[hab.letra] || { coords: '0,0,0,0', shape: 'rect' }, // Área por defecto si no hay específica
          estado: 'Disponible' // Todas disponibles para selección
        }));

        setHabitaciones(habitacionesConAreas);
      } catch (error) {
        console.error('Error al cargar las habitaciones:', error);
        // En caso de error, usar las predefinidas con áreas seleccionables
        const habitacionesConAreas = habitacionesPredefinidas.map(hab => ({
          ...hab,
          area: areasSeleccionables[hab.letra] || { coords: '0,0,0,0', shape: 'rect' },
          estado: 'Disponible'
        }));
        setHabitaciones(habitacionesConAreas);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabitaciones();
  }, []);

  // Estado para habitaciones disponibles
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState(habitaciones);

  // Actualizar disponibilidad de habitaciones según las ya seleccionadas
  useEffect(() => {
    const letrasSeleccionadas = rooms.map(room => room.letra);
    
    // Marcar habitaciones como no disponibles si ya están seleccionadas
    const habitacionesActualizadas = habitaciones.map(hab => ({
      ...hab,
      disponible: !letrasSeleccionadas.includes(hab.letra)
    }));
    
    // Actualizar el estado
    setHabitacionesDisponibles(habitacionesActualizadas);
  }, [rooms]);

  // Verificar si una habitación está seleccionada
  const isSelected = (letra) => {
    return rooms.some(room => room.letra === letra);
  };

  // Añadir habitación al seleccionar en el mapa
  const handleSelectHabitacion = (habitacion) => {
    if (isSelected(habitacion.letra)) {
      removeRoom(habitacion.letra);
      return;
    }
    
    // Crear nueva habitación
    const newRoom = {
      id: Date.now(),
      letra: habitacion.letra,
      tipo: habitacion.tipo,
      guests: [{ name: '', guests: 1 }],
      checkIn: eventDate || '',
      checkOut: '', // Añadimos fecha de salida
    };
    
    // Actualizar estado
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    onRoomsChange(updatedRooms);
    
    // Mostrar notificación
    toast.success(`Habitación ${habitacion.letra} añadida`);
  };

  // Eliminar habitación
  const removeRoom = (letra) => {
    const newRooms = rooms.filter(room => room.letra !== letra);
    setRooms(newRooms);
    onRoomsChange(newRooms);
    toast.info(`Habitación ${letra} eliminada`);
  };

  // Añadir huésped a una habitación
  const addGuest = (roomLetra) => {
    const roomIndex = rooms.findIndex(r => r.letra === roomLetra);
    if (roomIndex === -1) return;
    
    const maxGuestsPerRoom = 4;
    const currentRoom = rooms[roomIndex];
    const currentGuests = currentRoom.guests.reduce((total, guest) => total + guest.guests, 0);

    if (currentRoom.guests.length >= maxGuestsPerRoom) {
      toast.error('Máximo 4 grupos de huéspedes por habitación');
      return;
    }

    if (currentGuests >= 4) {
      toast.error('Máximo 4 personas por habitación');
      return;
    }

    const newRooms = [...rooms];
    newRooms[roomIndex].guests.push({ name: '', guests: 1 });
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

  // Eliminar huésped
  const removeGuest = (roomLetra, guestIndex) => {
    const roomIndex = rooms.findIndex(r => r.letra === roomLetra);
    if (roomIndex === -1) return;
    
    const newRooms = [...rooms];
    newRooms[roomIndex].guests = newRooms[roomIndex].guests.filter(
      (_, index) => index !== guestIndex
    );
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

  // Actualizar información de huésped
  const updateGuest = (roomLetra, guestIndex, field, value) => {
    const roomIndex = rooms.findIndex(r => r.letra === roomLetra);
    if (roomIndex === -1) return;
    
    const newRooms = [...rooms];
    newRooms[roomIndex].guests[guestIndex][field] = value;
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

  // Actualizar fecha de entrada
  const updateCheckIn = (roomLetra, date) => {
    const roomIndex = rooms.findIndex(r => r.letra === roomLetra);
    if (roomIndex === -1) return;
    
    const newRooms = [...rooms];
    newRooms[roomIndex].checkIn = date || '';
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };
  
  // Actualizar fecha de salida
  const updateCheckOut = (roomLetra, date) => {
    const roomIndex = rooms.findIndex(r => r.letra === roomLetra);
    if (roomIndex === -1) return;
    
    const newRooms = [...rooms];
    newRooms[roomIndex].checkOut = date || '';
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

  const handleRoomClick = (habitacion) => {
    if (rooms.some(room => room.letra === habitacion.letra)) {
      removeRoom(habitacion.letra);
    } else {
      handleSelectHabitacion(habitacion);
    }
  };

  const getRoomStatus = (habitacion) => {
    if (rooms.some(room => room.letra === habitacion.letra)) {
      return 'selected';
    }
    return habitacion.estado.toLowerCase();
  };

  // Renderizar el área seleccionable para cada habitación
  const renderAreaSeleccionable = (habitacion) => {
    return (
      <area 
        key={habitacion.letra}
        shape={habitacion.area.shape}
        coords={habitacion.area.coords}
        alt={`Habitación ${habitacion.letra}`}
        title={`${habitacion.letra} - ${habitacion.nombre}\n${habitacion.capacidad} personas\n${habitacion.precioPorNoche}€/noche`}
        onClick={(e) => {
          e.preventDefault();
          handleSelectHabitacion(habitacion);
        }}
        style={{ cursor: 'pointer' }}
        href="#"
      />
    );
  };
  
  // Renderizar un marcador visual para todas las habitaciones
  const renderHabitacionMarcador = (habitacion) => {
    // Extraer coordenadas del área
    const coords = habitacion.area.coords.split(',').map(Number);
    const x1 = coords[0];
    const y1 = coords[1];
    const x2 = coords[2];
    const y2 = coords[3];
    const width = x2 - x1;
    const height = y2 - y1;
    const selected = isSelected(habitacion.letra);
    
    // Determinar el gradiente basado en la dirección de la puerta
    let gradientDirection = 'to bottom';
    switch(habitacion.area.direction) {
      case 'top': gradientDirection = 'to top'; break;
      case 'right': gradientDirection = 'to right'; break;
      case 'bottom': gradientDirection = 'to bottom'; break;
      case 'left': gradientDirection = 'to left'; break;
      default: gradientDirection = 'to bottom';
    }
    
    // Colores pastel suaves
    const colorNoSeleccionado = '#F8E8E0'; // Beige pastel suave
    const colorSeleccionado = '#E6B89C'; // Marrón claro pastel
    
    return (
      <div
        key={`marker-${habitacion.letra}`}
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
              <div className="loading-overlay">
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <div>Cargando habitaciones...</div>
                </div>
              </div>
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
              </>
            )}
            
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
            
            {/* Información de todas las habitaciones */}
            <div className="mt-8">
              <h4 className="font-medium text-gray-800 mb-3">Información de habitaciones:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {habitaciones.map((habitacion) => {
                  const isRoomSelected = isSelected(habitacion.letra);
                  return (
                    <div 
                      key={habitacion.letra}
                      className={`p-4 rounded-lg border-2 transition-colors ${isRoomSelected 
                          ? 'border-[#E6B89C] bg-[#F8E8E0]/20'
                          : 'border-gray-200 hover:border-[#F8E8E0]'}`}
                      onClick={() => handleSelectHabitacion(habitacion)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isRoomSelected ? 'bg-[#E6B89C]' : 'bg-[#F8E8E0]'} text-gray-800`}>
                            <span className="font-bold">{habitacion.letra}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">Habitación {habitacion.letra}</h4>
                            <p className="text-sm text-gray-600">
                              {habitacion.tipo || 'Estándar'} • {habitacion.planta || 'Planta principal'}
                            </p>
                          </div>
                        </div>
                        {isRoomSelected && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeRoom(habitacion.letra); }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Capacidad:</span>
                          <span className="font-medium">{habitacion.capacidad || 2} personas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precio:</span>
                          <span className="font-medium">{habitacion.precioPorNoche || 2400}€/noche</span>
                        </div>
                        {habitacion.descripcion && (
                          <div className="mt-2 text-xs text-gray-500">
                            {habitacion.descripcion.substring(0, 100)}{habitacion.descripcion.length > 100 ? '...' : ''}
                          </div>
                        )}
                        {isRoomSelected && (
                          <div className="mt-2 bg-[#E6B89C]/20 p-2 rounded text-xs">
                            <span className="font-medium">Seleccionada para el evento</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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

export default EventoMapaHabitaciones;
