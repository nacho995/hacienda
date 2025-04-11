'use client';

import { useState } from 'react';
// import { Card, Button, RadioGroup, Label, Radio } from 'flowbite-react';
import { toast } from 'sonner';
import { useReservation } from '@/context/ReservationContext';
import { HiOutlineOfficeBuilding, HiOutlineUser } from 'react-icons/hi';

const ModoSeleccionReserva = () => {
  const { formData, updateFormSection } = useReservation();
  const [modoSeleccionado, setModoSeleccionado] = useState(formData.modoReserva || '');
  // const [loading, setLoading] = useState(false); // Loading no se usa actualmente

  const handleModeChange = (nuevoModo) => {
    setModoSeleccionado(nuevoModo);
    try {
      updateFormSection('modoReserva', nuevoModo);
      toast.success(`Modo seleccionado: ${nuevoModo === 'cliente' ? 'Gestión Personal' : 'Gestión por Hacienda'}`);
    } catch (error) {
      console.error('Error al actualizar modo de reserva en contexto:', error);
      toast.error('Error al guardar la selección del modo');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">¿Cómo desea gestionar su reserva?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Opción Cliente (Reemplazo de Card) */}
        <div 
          onClick={() => handleModeChange('cliente')}
          className={`cursor-pointer bg-white rounded-lg border border-gray-200 p-1 hover:shadow-md transition-all duration-200 ${modoSeleccionado === 'cliente' ? 'ring-2 ring-[var(--color-primary)]' : 'hover:border-gray-300'}`}
          role="button" // Mejorar accesibilidad
          tabIndex={0} // Permitir foco
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleModeChange('cliente')} // Permitir selección con teclado
        >
          <div className="flex flex-col items-center p-5">
            <HiOutlineUser className="w-14 h-14 text-[var(--color-primary)] mb-3" />
            <h3 className="text-lg font-medium mb-2 text-gray-900">Gestión Personal</h3>
            <p className="text-gray-500 text-center text-sm mb-4 h-16">
              Usted selecciona los servicios y habitaciones específicas para su evento.
            </p>
            {/* Reemplazo de Radio y Label */}
            <div className="flex items-center mt-2">
              <input 
                id="reserva-cliente" 
                type="radio"
                name="modo-reserva" 
                value="cliente"
                checked={modoSeleccionado === 'cliente'}
                readOnly 
                onClick={(e) => e.stopPropagation()} // Prevenir doble disparo con el click del div
                className="w-4 h-4 text-[var(--color-primary)] bg-gray-100 border-gray-300 focus:ring-[var(--color-primary)] focus:ring-2"
              />
              <label htmlFor="reserva-cliente" className="ml-2 text-sm font-medium text-gray-700">
                Seleccionar esta opción
              </label>
            </div>
          </div>
        </div>

        {/* Opción Hacienda (Reemplazo de Card) */}
        <div 
          onClick={() => handleModeChange('hacienda')}
          className={`cursor-pointer bg-white rounded-lg border border-gray-200 p-1 hover:shadow-md transition-all duration-200 ${modoSeleccionado === 'hacienda' ? 'ring-2 ring-[var(--color-primary)]' : 'hover:border-gray-300'}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleModeChange('hacienda')}
        >
          <div className="flex flex-col items-center p-5">
            <HiOutlineOfficeBuilding className="w-14 h-14 text-[var(--color-primary)] mb-3" />
            <h3 className="text-lg font-medium mb-2 text-gray-900">Gestión por Hacienda</h3>
            <p className="text-gray-500 text-center text-sm mb-4 h-16">
              La hacienda administrará los detalles de servicios y habitaciones en base a su evento.
            </p>
             {/* Reemplazo de Radio y Label */}
             <div className="flex items-center mt-2">
              <input 
                id="reserva-hacienda" 
                type="radio"
                name="modo-reserva" 
                value="hacienda"
                checked={modoSeleccionado === 'hacienda'}
                readOnly
                onClick={(e) => e.stopPropagation()} // Prevenir doble disparo
                className="w-4 h-4 text-[var(--color-primary)] bg-gray-100 border-gray-300 focus:ring-[var(--color-primary)] focus:ring-2"
              />
              <label htmlFor="reserva-hacienda" className="ml-2 text-sm font-medium text-gray-700">
                Seleccionar esta opción
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">¿Qué significa cada opción?</h4>
        <ul className="list-disc pl-5 text-blue-700 space-y-2">
          <li><span className="font-medium">Gestión Personal:</span> Usted seleccionará exactamente qué servicios desea y qué habitaciones reservar para su evento.</li>
          <li><span className="font-medium">Gestión por Hacienda:</span> Nosotros nos encargamos de gestionar todos los detalles basados en el tipo de evento y fecha seleccionados. Nos comunicaremos con usted para confirmar los detalles.</li>
        </ul>
      </div>
    </div>
  );
};

export default ModoSeleccionReserva; 