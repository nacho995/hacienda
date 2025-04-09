import { useState } from 'react';
import { FaPlus, FaTrash, FaUserFriends } from 'react-icons/fa';
import { toast } from 'sonner';

const RoomAssignment = ({ onRoomsChange, eventDate }) => {
  const [rooms, setRooms] = useState([]);
  const maxRooms = 7; // Máximo número de habitaciones disponibles
  
  // Letras de habitaciones disponibles
  const habitacionesLetras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

  const addRoom = () => {
    if (rooms.length >= maxRooms) {
      toast.error('Se ha alcanzado el número máximo de habitaciones');
      return;
    }

    setRooms([
      ...rooms,
      {
        id: Date.now(),
        letra: habitacionesLetras[rooms.length],
        guests: [{ name: '', guests: 1 }],
        checkIn: eventDate,
      },
    ]);
    onRoomsChange([...rooms, { letra: habitacionesLetras[rooms.length], guests: [{ name: '', guests: 1 }], checkIn: eventDate }]);
  };

  const removeRoom = (roomIndex) => {
    const newRooms = rooms.filter((_, index) => index !== roomIndex);
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

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

  const removeGuest = (roomIndex, guestIndex) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].guests = newRooms[roomIndex].guests.filter(
      (_, index) => index !== guestIndex
    );
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

  const updateGuest = (roomIndex, guestIndex, field, value) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].guests[guestIndex][field] = value;
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

  const updateCheckIn = (roomIndex, date) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].checkIn = date;
    setRooms(newRooms);
    onRoomsChange(newRooms);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Asignación de Habitaciones
        </h3>
        <button
          type="button"
          onClick={addRoom}
          className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <FaPlus className="mr-2" />
          Agregar Habitación
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {rooms.map((room, roomIndex) => (
          <div
            key={room.id}
            className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Habitación {habitacionesLetras[roomIndex]}
              </h4>
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
                Fecha de entrada
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
              {room.guests.map((guest, guestIndex) => (
                <div key={guestIndex} className="flex gap-4 items-end">
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
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaUserFriends className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay habitaciones asignadas
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza agregando una habitación para los huéspedes.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomAssignment;
