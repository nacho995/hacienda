'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaSave, FaBed, FaUsers, FaBuilding } from 'react-icons/fa';
import { apiClient } from '@/services/apiClient';
import { toast } from 'sonner';

export default function HabitacionesEventoForm({ eventoId }) {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingRoom, setSavingRoom] = useState(null);
  
  useEffect(() => {
    if (!eventoId) return;
    
    const fetchHabitaciones = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/reservas/eventos/${eventoId}/habitaciones`);
        
        if (response.data?.success && Array.isArray(response.data.data)) {
          // Ordenar por letra de habitación
          const sortedRooms = response.data.data.sort((a, b) => 
            a.letraHabitacion.localeCompare(b.letraHabitacion)
          );
          setHabitaciones(sortedRooms);
        } else {
          throw new Error('Formato de respuesta incorrecto');
        }
      } catch (err) {
        console.error('Error al cargar habitaciones del evento:', err);
        setError('No se pudieron cargar las habitaciones. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHabitaciones();
  }, [eventoId]);
  
  const handleInputChange = (habitacionIndex, field, value) => {
    const updatedHabitaciones = [...habitaciones];
    
    if (field === 'nombres') {
      // Dividir por comas o nuevas líneas
      const nombres = value.split(/[,\n]+/).map(nombre => nombre.trim()).filter(nombre => nombre);
      updatedHabitaciones[habitacionIndex].infoHuespedes = {
        ...updatedHabitaciones[habitacionIndex].infoHuespedes,
        nombres
      };
    } else if (field === 'detalles') {
      updatedHabitaciones[habitacionIndex].infoHuespedes = {
        ...updatedHabitaciones[habitacionIndex].infoHuespedes,
        detalles: value
      };
    }
    
    setHabitaciones(updatedHabitaciones);
  };
  
  const saveHabitacion = async (habitacion, index) => {
    if (!eventoId || !habitacion?.letraHabitacion) return;
    
    setSavingRoom(habitacion.letraHabitacion);
    try {
      const response = await apiClient.put(
        `/reservas/eventos/${eventoId}/habitaciones/${habitacion.letraHabitacion}`, 
        { infoHuespedes: habitacion.infoHuespedes }
      );
      
      if (response.data?.success) {
        toast.success(`Habitación ${habitacion.letraHabitacion} actualizada correctamente`);
        
        // Actualizar el estado con la respuesta del servidor
        const updatedHabitaciones = [...habitaciones];
        updatedHabitaciones[index] = response.data.data;
        setHabitaciones(updatedHabitaciones);
      } else {
        throw new Error('Error al guardar la habitación');
      }
    } catch (err) {
      console.error('Error al guardar la habitación:', err);
      toast.error(`Error al guardar la habitación ${habitacion.letraHabitacion}`);
    } finally {
      setSavingRoom(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)]" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
        {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-cream-light)] p-4 rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-[var(--color-primary)] mb-4">
          Asignación de Habitaciones
        </h2>
        <p className="text-gray-700 mb-4 text-center">
          Complete la siguiente información para indicar qué personas se hospedarán en cada habitación.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 border text-left font-medium text-gray-500">No.</th>
              <th className="py-3 px-4 border text-left font-medium text-gray-500">Habitación</th>
              <th className="py-3 px-4 border text-left font-medium text-gray-500">Adultos</th>
              <th className="py-3 px-4 border text-left font-medium text-gray-500">Letra</th>
              <th className="py-3 px-4 border text-left font-medium text-gray-500">Huéspedes</th>
              <th className="py-3 px-4 border text-left font-medium text-gray-500">Precio / Noche</th>
              <th className="py-3 px-4 border text-left font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habitaciones.map((habitacion, index) => (
              <tr key={habitacion._id || habitacion.letraHabitacion} className="hover:bg-gray-50">
                <td className="py-3 px-4 border">{index + 1}</td>
                <td className="py-3 px-4 border">
                  <div className="flex items-center">
                    <FaBed className="mr-2 text-[var(--color-primary)]" />
                    {habitacion.tipoHabitacion}
                  </div>
                </td>
                <td className="py-3 px-4 border text-center">{habitacion.numHuespedes}</td>
                <td className="py-3 px-4 border text-center font-bold">{habitacion.letraHabitacion}</td>
                <td className="py-3 px-4 border">
                  <div className="space-y-2">
                    <textarea
                      placeholder="Nombres de huéspedes (uno por línea)"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                      value={(habitacion.infoHuespedes?.nombres || []).join('\n')}
                      onChange={(e) => handleInputChange(index, 'nombres', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Detalles adicionales"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      value={habitacion.infoHuespedes?.detalles || ''}
                      onChange={(e) => handleInputChange(index, 'detalles', e.target.value)}
                    />
                  </div>
                </td>
                <td className="py-3 px-4 border text-right">
                  ${habitacion.precioPorNoche || 0}
                </td>
                <td className="py-3 px-4 border">
                  <button
                    className="flex items-center justify-center bg-[var(--color-primary)] text-white p-2 rounded-md hover:bg-[var(--color-primary-dark)] transition-colors w-full"
                    onClick={() => saveHabitacion(habitacion, index)}
                    disabled={savingRoom === habitacion.letraHabitacion}
                  >
                    {savingRoom === habitacion.letraHabitacion ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaSave className="mr-2" />
                    )}
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-6">
        <p className="text-blue-700 text-sm">
          <strong>Nota:</strong> Las habitaciones A, B, K, L, M y O son sencillas con una cama king size.
          Las habitaciones C, D, E, F, G, H, I y J son dobles con dos camas matrimoniales.
        </p>
      </div>
    </div>
  );
} 