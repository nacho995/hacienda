'use client';

import React, { useState, useEffect } from 'react';
import { FaBed, FaUser, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';

const GestionHabitacionesReserva = ({ reservaId, onSave }) => {
  const [habitaciones, setHabitaciones] = useState(Array(14).fill().map((_, index) => ({
    numero: String.fromCharCode(65 + index), // A, B, C, etc.
    huespedes: [],
    capacidad: 2,
    estado: 'disponible',
    editando: false
  })));

  const handleEditHabitacion = (index) => {
    setHabitaciones(prev => prev.map((hab, i) => 
      i === index ? { ...hab, editando: true } : hab
    ));
  };

  const handleSaveHabitacion = (index) => {
    const habitacion = habitaciones[index];
    if (habitacion.huespedes.some(h => !h.nombre || !h.edad)) {
      toast.error('Datos incompletos', {
        description: 'Por favor, complete todos los datos de los huéspedes.'
      });
      return;
    }

    setHabitaciones(prev => prev.map((hab, i) => 
      i === index ? { ...hab, editando: false } : hab
    ));

    // Aquí se podría llamar a una API para guardar los cambios
    toast.success('Habitación actualizada', {
      description: `Los datos de la habitación ${habitacion.numero} han sido actualizados.`
    });
  };

  const handleAddHuesped = (habitacionIndex) => {
    setHabitaciones(prev => prev.map((hab, i) => {
      if (i === habitacionIndex) {
        if (hab.huespedes.length >= hab.capacidad) {
          toast.error('Capacidad máxima alcanzada', {
            description: `La habitación ${hab.numero} ya ha alcanzado su capacidad máxima.`
          });
          return hab;
        }
        return {
          ...hab,
          huespedes: [...hab.huespedes, { nombre: '', edad: '' }]
        };
      }
      return hab;
    }));
  };

  const handleRemoveHuesped = (habitacionIndex, huespedIndex) => {
    setHabitaciones(prev => prev.map((hab, i) => 
      i === habitacionIndex ? {
        ...hab,
        huespedes: hab.huespedes.filter((_, hi) => hi !== huespedIndex)
      } : hab
    ));
  };

  const handleUpdateHuesped = (habitacionIndex, huespedIndex, campo, valor) => {
    setHabitaciones(prev => prev.map((hab, i) => 
      i === habitacionIndex ? {
        ...hab,
        huespedes: hab.huespedes.map((huesped, hi) => 
          hi === huespedIndex ? { ...huesped, [campo]: valor } : huesped
        )
      } : hab
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-[var(--color-primary)] mb-6">
        Gestión de Habitaciones
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habitaciones.map((habitacion, index) => (
          <div 
            key={habitacion.numero}
            className="border rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FaBed className="text-[var(--color-primary)] mr-2" />
                <h3 className="text-lg font-medium">
                  Habitación {habitacion.numero}
                </h3>
              </div>
              {habitacion.editando ? (
                <button
                  onClick={() => handleSaveHabitacion(index)}
                  className="text-green-600 hover:text-green-700"
                >
                  <FaSave />
                </button>
              ) : (
                <button
                  onClick={() => handleEditHabitacion(index)}
                  className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                >
                  <FaEdit />
                </button>
              )}
            </div>

            {/* Lista de huéspedes */}
            <div className="space-y-3">
              {habitacion.huespedes.map((huesped, huespedIndex) => (
                <div key={huespedIndex} className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  {habitacion.editando ? (
                    <>
                      <input
                        type="text"
                        value={huesped.nombre}
                        onChange={(e) => handleUpdateHuesped(index, huespedIndex, 'nombre', e.target.value)}
                        placeholder="Nombre del huésped"
                        className="flex-1 p-1 border rounded"
                      />
                      <input
                        type="number"
                        value={huesped.edad}
                        onChange={(e) => handleUpdateHuesped(index, huespedIndex, 'edad', e.target.value)}
                        placeholder="Edad"
                        className="w-16 p-1 border rounded"
                      />
                      <button
                        onClick={() => handleRemoveHuesped(index, huespedIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <span className="flex-1">
                      {huesped.nombre || 'Sin asignar'} ({huesped.edad || '?'} años)
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Botón para agregar huésped */}
            {habitacion.editando && (
              <button
                onClick={() => handleAddHuesped(index)}
                className="mt-3 w-full py-2 px-4 text-sm bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-dark)]"
              >
                Agregar Huésped
              </button>
            )}

            {/* Información de capacidad */}
            <div className="mt-3 text-sm text-gray-500">
              Capacidad: {habitacion.huespedes.length}/{habitacion.capacidad} huéspedes
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => onSave(habitaciones)}
          className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)]"
        >
          Guardar Todos los Cambios
        </button>
      </div>
    </div>
  );
};

export default GestionHabitacionesReserva; 