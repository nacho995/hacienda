'use client';

import { useState } from 'react';
// import { Card, Button, RadioGroup, Label, Radio } from 'flowbite-react';
import { toast } from 'sonner';
import { useReservation } from '@/context/ReservationContext';
import { HiOutlineOfficeBuilding, HiOutlineUser } from 'react-icons/hi';

const ModoSeleccionReserva = () => {
  const { formData, updateFormSection } = useReservation();
  const [modoSeleccionado, setModoSeleccionado] = useState(formData.modoReserva || '');
  const [loading, setLoading] = useState(false);

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
      <h2 className="text-2xl font-semibold mb-4 text-center">¿Cómo desea gestionar su reserva?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card 
          onClick={() => handleModeChange('cliente')}
          className={`cursor-pointer hover:shadow-lg transition-all ${modoSeleccionado === 'cliente' ? 'ring-2 ring-primary' : ''}`}
        >
          <div className="flex flex-col items-center p-4">
            <HiOutlineUser className="w-16 h-16 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Gestión Personal</h3>
            <p className="text-gray-600 text-center mb-4">
              Usted selecciona los servicios y habitaciones específicas para su evento.
            </p>
            <Radio 
              id="reserva-cliente" 
              name="modo-reserva" 
              value="cliente"
              checked={modoSeleccionado === 'cliente'}
              readOnly
              className="mt-2"
            />
            <Label htmlFor="reserva-cliente" className="mt-2">
              Seleccionar esta opción
            </Label>
          </div>
        </Card>

        <Card 
          onClick={() => handleModeChange('hacienda')}
          className={`cursor-pointer hover:shadow-lg transition-all ${modoSeleccionado === 'hacienda' ? 'ring-2 ring-primary' : ''}`}
        >
          <div className="flex flex-col items-center p-4">
            <HiOutlineOfficeBuilding className="w-16 h-16 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Gestión por Hacienda</h3>
            <p className="text-gray-600 text-center mb-4">
              La hacienda administrará los detalles de servicios y habitaciones en base a su evento.
            </p>
            <Radio 
              id="reserva-hacienda" 
              name="modo-reserva" 
              value="hacienda"
              checked={modoSeleccionado === 'hacienda'}
              readOnly
              className="mt-2"
            />
            <Label htmlFor="reserva-hacienda" className="mt-2">
              Seleccionar esta opción
            </Label>
          </div>
        </Card>
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