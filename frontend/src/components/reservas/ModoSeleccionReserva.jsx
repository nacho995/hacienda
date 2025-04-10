'use client';

import { useState } from 'react';
import { Card, Button, RadioGroup, Label, Radio } from 'flowbite-react';
import { toast } from 'sonner';
import { useReservation } from '@/context/ReservationContext';
import { HiOutlineOfficeBuilding, HiOutlineUser } from 'react-icons/hi';

const ModoSeleccionReserva = ({ onContinue }) => {
  const { reservationData, updateReservationData } = useReservation();
  const [modoSeleccionado, setModoSeleccionado] = useState(reservationData.modoReserva || '');
  const [loading, setLoading] = useState(false);

  const handleContinuar = () => {
    if (!modoSeleccionado) {
      toast.error('Por favor, seleccione un modo de reserva para continuar');
      return;
    }

    setLoading(true);
    try {
      // Actualizar el contexto con el modo seleccionado
      updateReservationData({ modoReserva: modoSeleccionado });
      
      // Informar al componente padre para continuar
      onContinue(modoSeleccionado);
      
      toast.success(`Modo de reserva seleccionado: ${modoSeleccionado === 'cliente' ? 'Gestión Personal' : 'Gestión por Hacienda'}`);
    } catch (error) {
      console.error('Error al seleccionar modo de reserva:', error);
      toast.error('Error al seleccionar el modo de reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">¿Cómo desea gestionar su reserva?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className={`hover:shadow-lg transition-all ${modoSeleccionado === 'cliente' ? 'ring-2 ring-primary' : ''}`}>
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
              onChange={() => setModoSeleccionado('cliente')}
              className="mt-2"
            />
            <Label htmlFor="reserva-cliente" className="mt-2">
              Seleccionar esta opción
            </Label>
          </div>
        </Card>

        <Card className={`hover:shadow-lg transition-all ${modoSeleccionado === 'hacienda' ? 'ring-2 ring-primary' : ''}`}>
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
              onChange={() => setModoSeleccionado('hacienda')}
              className="mt-2"
            />
            <Label htmlFor="reserva-hacienda" className="mt-2">
              Seleccionar esta opción
            </Label>
          </div>
        </Card>
      </div>

      <div className="flex justify-center mt-6">
        <Button 
          onClick={handleContinuar} 
          disabled={loading || !modoSeleccionado}
          isProcessing={loading}
          color="primary"
          className="px-6"
        >
          Continuar
        </Button>
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