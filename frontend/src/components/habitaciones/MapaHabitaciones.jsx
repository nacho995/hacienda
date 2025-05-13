import React, { useState } from 'react';
import Image from 'next/image';
import { FaBed, FaSwimmingPool, FaUtensils, FaTree, FaList, FaMapMarkedAlt, FaCheckCircle } from 'react-icons/fa';

const MapaHabitaciones = ({ habitacionesSeleccionadas = [], onSelectHabitacion, habitaciones = [] }) => {
  const [showMap, setShowMap] = useState(true);
  
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

  // Verificar si una habitación está seleccionada
  const isSelected = (letra) => {
    return habitacionesSeleccionadas.some(h => h.letra === letra);
  };

  // Manejar el clic en una habitación
  const handleClick = (habitacion) => {
    if (habitacion.disponible) {
      // Buscar la habitación completa en el array de habitaciones recibidas como prop
      const habitacionCompleta = habitaciones.find(h => h.letra === habitacion.letra) || habitacion;
      onSelectHabitacion(habitacionCompleta);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-8 mb-12">
      {/* Botón de alternancia */}
      <div className="flex justify-center mb-6">
        <button 
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-6 py-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          {showMap ? (
            <>
              <FaList /> Ver lista de habitaciones
            </>
          ) : (
            <>
              <FaMapMarkedAlt /> Ver en mapa
            </>
          )}
        </button>
      </div>

      {showMap ? (
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habitacionesEnMapa.map((habitacion) => (
            <div 
              key={habitacion.letra}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                isSelected(habitacion.letra)
                  ? 'border-[var(--color-primary-dark)] bg-[var(--color-primary)]/10'
                  : 'border-gray-200 hover:border-[var(--color-primary)]'
              }`}
              onClick={() => handleClick(habitacion)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  habitacion.tipo === 'Sencilla' 
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-accent)] text-white'
                }`}>
                  <span className="font-bold">{habitacion.letra}</span>
                </div>
                <div>
                  <h4 className="font-semibold">Habitación {habitacion.letra}</h4>
                  <p className="text-sm text-gray-600">
                    {habitacion.tipo} • {habitacion.ubicacion}
                  </p>
                </div>
                {isSelected(habitacion.letra) && (
                  <div className="ml-auto text-[var(--color-primary)]">
                    <FaCheckCircle />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de habitaciones seleccionadas */}
      {habitacionesSeleccionadas.length > 0 && (
        <div className="mt-6 p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-md">
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-primary)]">Habitaciones seleccionadas:</h3>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {habitacionesSeleccionadas.map((habitacion) => {
              const habitacionEnMapa = habitacionesEnMapa.find(h => h.letra === habitacion.letra);
              const tipoHab = habitacionEnMapa?.tipo || 'Estándar';
              const colorClass = tipoHab === 'Sencilla' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-accent)]';
              
              return (
                <li key={habitacion.letra || habitacion._id} className="flex items-center bg-white p-2 rounded-md shadow-sm">
                  <span className={`w-8 h-8 ${colorClass} text-white rounded-full flex items-center justify-center mr-2 font-bold`}>
                    {habitacion.letra || 'X'}
                  </span>
                  <div>
                    <span className="text-gray-700">{tipoHab}</span>
                    <p className="text-xs text-gray-500">
                      Habitación seleccionada
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MapaHabitaciones;