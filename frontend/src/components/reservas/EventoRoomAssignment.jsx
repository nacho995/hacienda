"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaPlus, FaTrash, FaUserFriends, FaBed, FaList, FaMapMarkedAlt, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'sonner';

const EventoRoomAssignment = ({ onRoomsChange, eventDate }) => {
  const [rooms, setRooms] = useState([]);
  const [showMap, setShowMap] = useState(true);
  const maxRooms = 14; // Máximo número de habitaciones disponibles
  
  // Letras de habitaciones disponibles
  const habitacionesLetras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'O'];
  
  // Definición de habitaciones en el mapa según la imagen actualizada
  const habitacionesEnMapa = [
    // Habitaciones Sencillas (King Size): A, B, K, L, M, O
    { letra: 'A', tipo: 'Sencilla', ubicacion: 'King Size', disponible: true },
    { letra: 'B', tipo: 'Sencilla', ubicacion: 'King Size', disponible: true },
    { letra: 'K', tipo: 'Sencilla', ubicacion: 'King Size', disponible: true },
    { letra: 'L', tipo: 'Sencilla', ubicacion: 'King Size', disponible: true },
    { letra: 'M', tipo: 'Sencilla', ubicacion: 'King Size', disponible: true },
    { letra: 'O', tipo: 'Sencilla', ubicacion: 'King Size', disponible: true },
    
    // Habitaciones Dobles (Matrimoniales): C, D, E, F, G, H, I, J
    { letra: 'C', tipo: 'Doble', ubicacion: 'Matrimonial', disponible: true },
    { letra: 'D', tipo: 'Doble', ubicacion: 'Matrimonial', disponible: true },
    { letra: 'E', tipo: 'Doble', ubicacion: 'Matrimonial', disponible: true },
    { letra: 'F', tipo: 'Doble', ubicacion: 'Matrimonial', disponible: true },
    { letra: 'G', tipo: 'Doble', ubicacion: 'Matrimonial', disponible: true },
    { letra: 'H', tipo: 'Doble', ubicacion: 'Matrimonial', disponible: true },
    { letra: 'I', tipo: 'Doble', ubicacion: 'Matrimonial', disponible: true },
    { letra: 'J', tipo: 'Doble', ubicacion: 'Matrimonial', disponible: true },
  ];

  // Actualizar disponibilidad de habitaciones según las ya seleccionadas
  useEffect(() => {
    const letrasSeleccionadas = rooms.map(room => room.letra);
    
    // Marcar habitaciones como no disponibles si ya están seleccionadas
    habitacionesEnMapa.forEach(hab => {
      hab.disponible = !letrasSeleccionadas.includes(hab.letra);
    });
  }, [rooms]);

  // Verificar si una habitación está seleccionada
  const isSelected = (letra) => {
    return rooms.some(room => room.letra === letra);
  };

  // Añadir habitación al seleccionar en el mapa
  const handleSelectHabitacion = (habitacion) => {
    if (!habitacion.disponible) {
      toast.error(`La habitación ${habitacion.letra} ya está seleccionada`);
      return;
    }
    
    if (rooms.length >= maxRooms) {
      toast.error('Se ha alcanzado el número máximo de habitaciones');
      return;
    }

    const newRoom = {
      id: Date.now(),
      letra: habitacion.letra,
      tipo: habitacion.tipo,
      guests: [{ name: '', guests: 1 }],
      checkIn: eventDate,
    };
    
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    onRoomsChange(updatedRooms);
    
    toast.success(`Habitación ${habitacion.letra} añadida`);
  };

  // Eliminar habitación
  const removeRoom = (roomIndex) => {
    const newRooms = rooms.filter((_, index) => index !== roomIndex);
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

  // Añadir huésped a una habitación
  const addGuest = (roomIndex) => {
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
  const removeGuest = (roomIndex, guestIndex) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].guests = newRooms[roomIndex].guests.filter(
      (_, index) => index !== guestIndex
    );
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

  // Actualizar información de huésped
  const updateGuest = (roomIndex, guestIndex, field, value) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].guests[guestIndex][field] = value;
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

  // Actualizar fecha de entrada
  const updateCheckIn = (roomIndex, date) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].checkIn = date;
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Asignación de Habitaciones
        </h3>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors"
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

      {/* Mapa de habitaciones */}
      {showMap && (
        <div className="relative w-full max-w-4xl mx-auto mt-4 mb-8">
          <div className="relative">
            {/* Imagen del mapa */}
            <Image 
              src="/plano-Hotel.jpeg" 
              alt="Plano del Hotel" 
              width={1000} 
              height={700} 
              className="w-full h-auto rounded-lg shadow-sm"
              priority
            />
            
            {/* Leyenda */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Tipos de habitaciones:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Habitaciones Sencillas (King Size):</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>A, B, K, L, M, O</li>
                    <li>Capacidad: 2 adultos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Habitaciones Dobles (Matrimoniales):</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>C, D, E, F, G, H, I, J</li>
                    <li>Capacidad: 2 adultos, 2 niños</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Botones de selección de habitaciones */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {habitacionesEnMapa.map((habitacion) => (
                <button
                  key={habitacion.letra}
                  type="button"
                  onClick={() => handleSelectHabitacion(habitacion)}
                  disabled={!habitacion.disponible}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    isSelected(habitacion.letra)
                      ? 'border-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 cursor-not-allowed'
                      : habitacion.disponible
                        ? 'border-gray-200 hover:border-[var(--color-primary)] cursor-pointer'
                        : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      habitacion.tipo === 'Sencilla' 
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-accent)] text-white'
                    }`}>
                      <span className="font-bold">{habitacion.letra}</span>
                    </div>
                    <span className="text-sm">{habitacion.tipo}</span>
                    {isSelected(habitacion.letra) && (
                      <FaCheckCircle className="ml-auto text-[var(--color-primary)]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de habitaciones seleccionadas */}
      <div className="grid grid-cols-1 gap-6">
        {rooms.map((room, roomIndex) => {
          const habitacionInfo = habitacionesEnMapa.find(h => h.letra === room.letra) || {};
          
          return (
            <div
              key={room.id}
              className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    habitacionInfo.tipo === 'Sencilla' 
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-accent)] text-white'
                  }`}>
                    <span className="font-bold">{room.letra}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      Habitación {room.letra}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {habitacionInfo.tipo || 'Estándar'} • {habitacionInfo.ubicacion || 'General'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRoom(roomIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    Fecha de entrada
                  </div>
                </label>
                <input
                  type="date"
                  value={room.checkIn ? room.checkIn.split('T')[0] : ''}
                  onChange={(e) => updateCheckIn(roomIndex, e.target.value)}
                  min={eventDate}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-gray-800 flex items-center">
                  <FaUserFriends className="mr-2" />
                  Huéspedes
                </h5>
                
                {room.guests.map((guest, guestIndex) => (
                  <div key={guestIndex} className="flex gap-4 items-end bg-gray-50 p-3 rounded-md">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del huésped
                      </label>
                      <input
                        type="text"
                        value={guest.name}
                        onChange={(e) =>
                          updateGuest(roomIndex, guestIndex, 'name', e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Nombre del huésped"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Personas
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        value={guest.guests}
                        onChange={(e) =>
                          updateGuest(
                            roomIndex,
                            guestIndex,
                            'guests',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    {room.guests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGuest(roomIndex, guestIndex)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addGuest(roomIndex)}
                className="mt-4 flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
              >
                <FaPlus className="mr-2" />
                Agregar huésped
              </button>
            </div>
          );
        })}
      </div>

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

export default EventoRoomAssignment;
