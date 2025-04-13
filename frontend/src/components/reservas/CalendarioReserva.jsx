"use client";

import React, { useState, useEffect } from 'react';
// AÑADIDO: Imports necesarios para react-datepicker
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
import { FaCalendarAlt, FaSpinner } from 'react-icons/fa';

// Registrar el locale español
registerLocale('es', es);
setDefaultLocale('es');

/**
 * Componente de calendario basado en react-datepicker
 */
// MODIFICADO: Cambiar las props recibidas
const CalendarioReserva = ({ 
  startDate, 
  endDate, 
  onChange, // Espera una función que recibe [start, end]
  occupiedDates = [], 
  loadingOccupiedDates = false, 
  placeholderText = "Seleccione una fecha" 
}) => {

  // Eliminamos el estado interno y la lógica de carga/estilos, 
  // ya que ahora se manejan en el componente padre (ReservaWizard)

  // Función para determinar si una fecha debe estar deshabilitada
  const isDateOccupied = (date) => {
    return occupiedDates.some(occupied => 
      occupied.getDate() === date.getDate() &&
      occupied.getMonth() === date.getMonth() &&
      occupied.getFullYear() === date.getFullYear()
    );
  };

  return (
    <div className="w-full relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
        <FaCalendarAlt className="text-[#A5856A]" />
      </div>
      <DatePicker
        selected={startDate} // Usar startDate como la fecha "seleccionada" inicial
        onChange={onChange} // La función que actualiza [startDate, endDate]
        startDate={startDate}
        endDate={endDate}
        selectsRange={true} // Habilitar selección de rango
        filterDate={date => !isDateOccupied(date)} // Deshabilitar fechas ocupadas
        minDate={new Date()} // No permitir fechas pasadas
        locale="es" // Usar español
        dateFormat="dd/MM/yyyy" // Formato de fecha
        placeholderText={placeholderText} // Texto de ayuda
        className="w-full pl-10 p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow cursor-pointer"
        wrapperClassName="w-full" // Asegurar que el wrapper ocupe todo el ancho
        calendarClassName="border-[#D1B59B] shadow-lg rounded-lg" // Estilos para el popover del calendario
        dayClassName={date => 
          isDateOccupied(date) ? 'react-datepicker__day--disabled occupied-date' : undefined
        } // Clases para días (opcional, filterDate ya deshabilita)
        popperPlacement="bottom-start" // Posición del calendario
      />
      {/* Indicador de carga */} 
      {loadingOccupiedDates && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <FaSpinner className="animate-spin text-[#A5856A]" />
        </div>
      )}
      {/* Eliminamos la leyenda anterior, ya que react-datepicker maneja la deshabilitación visual */}
    </div>
  );
};

export default CalendarioReserva;
