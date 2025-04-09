"use client";

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import { getEventoOccupiedDates } from '@/services/reservationService';
import { toast } from 'sonner';

registerLocale('es', es);
setDefaultLocale('es');

export default function EventDateSelector({ selectedDate, onDateSelect }) {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOccupiedDates();
  }, []);

  const loadOccupiedDates = async () => {
    try {
      setLoading(true);
      const occupiedDates = await getEventoOccupiedDates();
      setDates(occupiedDates);
    } catch (error) {
      console.error('Error loading occupied dates:', error);
      toast.error('Error al cargar las fechas ocupadas');
    } finally {
      setLoading(false);
    }
  };

  const esDisponible = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return !dates.includes(dateStr);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-[var(--color-primary)]">
          Seleccione la fecha para su evento
        </h3>
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="text-sm">Fechas ocupadas:</span>
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
        </div>
      </div>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Por favor, seleccione una fecha disponible. Las fechas ocupadas están marcadas en rojo.
        </p>
        <div className="bg-gray-50 rounded-lg p-4">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              if (esDisponible(date)) {
                onDateSelect(date);
              } else {
                toast.error('Esta fecha ya está ocupada. Por favor, seleccione otra fecha.');
              }
            }}
            selectsStart
            startDate={selectedDate}
            endDate={selectedDate}
            minDate={new Date()}
            filterDate={esDisponible}
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleccione una fecha"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-white"
            locale="es"
            inline
          />
        </div>
      </div>
    </div>
  );
}
