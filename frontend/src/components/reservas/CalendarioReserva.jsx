"use client";

import React, { useState, useEffect } from 'react';
// AÑADIDO: Imports necesarios para react-datepicker
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
// AÑADIDO: Funciones de date-fns para manejo de rangos
import { isWithinInterval, startOfDay, endOfDay, isValid } from 'date-fns'; 
import { FaCalendarAlt, FaSpinner } from 'react-icons/fa';

// Registrar el locale español
registerLocale('es', es);
setDefaultLocale('es');

/**
 * Componente de calendario basado en react-datepicker para SELECCIÓN DE RANGO DE FECHAS
 */
const CalendarioReserva = ({ 
  startDate, // Fecha de inicio seleccionada
  endDate,   // Fecha de fin seleccionada
  onChange,  // Espera una función que recibe el array [startDate, endDate]
  occupiedDateRanges = [], // <-- Renombrado para claridad, espera [{inicio, fin, tipo?}]
  loadingOccupiedDates = false, 
  placeholderText = "Seleccione un rango de fechas", // Placeholder actualizado
  onMonthChange // Prop para manejar cambio de mes (pasarla si existe)
}) => {

  // Función para determinar si una fecha debe estar deshabilitada
  const isDateDisabled = (date) => {
    const today = startOfDay(new Date()); // Obtener inicio del día actual
    const currentDate = startOfDay(date); // Normalizar fecha a evaluar

    // Deshabilitar fechas pasadas
    if (currentDate < today) {
      return true;
    }

    // Verificar si la fecha cae dentro de alguno de los rangos ocupados
    return occupiedDateRanges.some(range => {
      // Asegurarse que el rango y sus fechas son válidos
      if (!range || !range.inicio || !range.fin) return false;
      const start = startOfDay(new Date(range.inicio));
      const end = endOfDay(new Date(range.fin)); // Usar fin del día para incluir el último día del rango
      
      if (!isValid(start) || !isValid(end)) {
        console.warn("Rango de fechas ocupadas inválido detectado:", range);
        return false; 
      }
      
      // Verificar si la fecha está dentro del intervalo
      return isWithinInterval(currentDate, { start, end });
    });
  };
  
  // Función interna para manejar el cambio de mes y llamar a la prop si existe
  const handleInternalMonthChange = (date) => {
    if (onMonthChange) {
      // Calcular inicio y fin del mes visible para pasar a la prop
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      onMonthChange(firstDayOfMonth, lastDayOfMonth);
    }
  };

  return (
    <div className="w-full relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
        <FaCalendarAlt className="text-[#A5856A]" />
      </div>
      <DatePicker
        selectsRange={true} // <-- HABILITAR SELECCIÓN DE RANGO
        startDate={startDate} // <-- Pasar fecha de inicio
        endDate={endDate}     // <-- Pasar fecha de fin
        onChange={onChange}   // <-- Pasar la función que recibe el array [start, end]
        filterDate={date => !isDateDisabled(date)} // <-- Usar la nueva lógica de deshabilitación
        // excludeDates={occupiedDates} // <<< ELIMINADO: No funciona bien con rangos
        minDate={new Date()} // No permitir fechas pasadas (redundante con isDateDisabled pero no daña)
        locale="es" // Usar español
        dateFormat="dd/MM/yyyy" // Formato de fecha
        placeholderText={placeholderText} // Texto de ayuda actualizado
        className="w-full pl-10 p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow cursor-pointer"
        wrapperClassName="w-full" 
        calendarClassName="border-[#D1B59B] shadow-lg rounded-lg"
        dayClassName={date => 
          isDateDisabled(date) ? 'react-datepicker__day--disabled occupied-date' : undefined
        } // <-- Usar la nueva lógica para estilizar
        popperPlacement="bottom-start"
        monthsShown={1} // Mostrar un mes a la vez por defecto
        shouldCloseOnSelect={false} // <-- IMPORTANTE: No cerrar al seleccionar la primera fecha del rango
        onMonthChange={handleInternalMonthChange} // <-- Usar handler interno para pasar fechas correctas
        // selected={undefined} // <-- Asegurarse de que 'selected' no esté presente
      />
      {/* Indicador de carga */} 
      {loadingOccupiedDates && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <FaSpinner className="animate-spin text-[#A5856A]" />
        </div>
      )}
    </div>
  );
};

export default CalendarioReserva;
