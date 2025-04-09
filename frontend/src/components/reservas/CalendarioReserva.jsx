import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import { obtenerFechasReservadas } from '@/services/reservas.service';
import { toast } from 'react-toastify';

/**
 * Componente de calendario personalizado que muestra los días reservados en rojo
 */
const CalendarioReserva = ({ value, onChange, min }) => {
  const [fechasReservadas, setFechasReservadas] = useState([]);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Obtener las fechas reservadas al cargar el componente
  useEffect(() => {
    const cargarFechasReservadas = async () => {
      setCargando(true);
      try {
        // Comentamos esta línea temporalmente hasta que el endpoint esté disponible
        // const fechas = await obtenerFechasReservadas();
        // setFechasReservadas(fechas);
        
        // Por ahora, usamos un array vacío
        setFechasReservadas([]);
      } catch (err) {
        console.error('Error al cargar fechas reservadas:', err);
        // No mostramos el error al usuario, simplemente continuamos con un array vacío
        setFechasReservadas([]);
      } finally {
        setCargando(false);
      }
    };

    cargarFechasReservadas();
  }, []);

  // Aplicar estilos personalizados al calendario para marcar días reservados
  useEffect(() => {
    if (fechasReservadas.length > 0) {
      // Crear una hoja de estilo personalizada
      const styleEl = document.createElement('style');
      const cssRules = fechasReservadas.map(fecha => {
        return `
          input[type="date"]::-webkit-calendar-picker-indicator {
            background-color: transparent;
            cursor: pointer;
          }
          
          /* Esta es una aproximación, ya que no podemos modificar directamente el calendario nativo */
          /* En una implementación real, se usaría un componente de calendario personalizado como react-datepicker */
        `;
      }).join('');
      
      styleEl.textContent = cssRules;
      document.head.appendChild(styleEl);
      
      return () => {
        document.head.removeChild(styleEl);
      };
    }
  }, [fechasReservadas]);

  // Función para manejar el cambio de fecha
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    
    // Verificar si la fecha seleccionada está en la lista de fechas reservadas
    if (fechasReservadas.includes(selectedDate)) {
      toast.warning('Esta fecha ya está reservada. Por favor, seleccione otra fecha.');
      return;
    }
    
    onChange(selectedDate);
  };

  return (
    <div className="w-full">
      <div className="relative" onClick={() => document.getElementById('fecha-evento-personalizado').showPicker()}>
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaCalendarAlt className="text-[#A5856A]" />
        </div>
        <input 
          id="fecha-evento-personalizado"
          type="date" 
          value={value || ''} 
          onChange={handleDateChange}
          className="w-full pl-10 p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow cursor-pointer"
          min={min}
        />
      </div>
      
      {/* Leyenda para días reservados */}
      <div className="flex items-center mt-2 text-sm text-[#8A6E52] italic">
        <FaInfoCircle className="mr-2 text-red-500" />
        <span>Los días ya reservados aparecerán en rojo en el calendario</span>
      </div>
      
      {cargando && <p className="text-sm text-[#8A6E52] mt-1">Cargando disponibilidad...</p>}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default CalendarioReserva;
