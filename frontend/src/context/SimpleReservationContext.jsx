'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Crear el contexto
const SimpleReservationContext = createContext();

// Hook personalizado para usar el contexto
export const useSimpleReservation = () => {
  const context = useContext(SimpleReservationContext);
  if (!context) {
    throw new Error('useSimpleReservation debe ser usado dentro de un SimpleReservationProvider');
  }
  return context;
};

// Proveedor del contexto
export function SimpleReservationProvider({ children }) {
  // Estados para los servicios seleccionados
  const [habitacionesSeleccionadas, setHabitacionesSeleccionadas] = useState([]);
  const [eventoData, setEventoData] = useState({
    tipoEvento: '',
    fecha: null,
    invitados: 50,
  });

  // Al montar el componente, intentar recuperar selecciones del localStorage
  useEffect(() => {
    try {
      const storedHabitaciones = localStorage.getItem('habitacionesSeleccionadas');
      const storedEvento = localStorage.getItem('eventoData');
      
      if (storedHabitaciones) {
        setHabitacionesSeleccionadas(JSON.parse(storedHabitaciones));
      }
      
      if (storedEvento) {
        setEventoData(JSON.parse(storedEvento));
      }
    } catch (error) {
      console.error('Error al cargar datos de reserva del localStorage:', error);
      // Limpiar localStorage si hay errores para evitar problemas futuros
      localStorage.removeItem('habitacionesSeleccionadas');
      localStorage.removeItem('eventoData');
    }
  }, []);

  // Guardar cambios en localStorage cada vez que cambian
  useEffect(() => {
    try {
      if (habitacionesSeleccionadas.length > 0) {
        localStorage.setItem('habitacionesSeleccionadas', JSON.stringify(habitacionesSeleccionadas));
      } else {
        localStorage.removeItem('habitacionesSeleccionadas');
      }
    } catch (error) {
      console.error('Error al guardar habitaciones en localStorage:', error);
    }
  }, [habitacionesSeleccionadas]);

  useEffect(() => {
    try {
      if (eventoData.tipoEvento || eventoData.fecha) {
        localStorage.setItem('eventoData', JSON.stringify(eventoData));
      } else {
        localStorage.removeItem('eventoData');
      }
    } catch (error) {
      console.error('Error al guardar datos de evento en localStorage:', error);
    }
  }, [eventoData]);

  // Funciones para manipular habitaciones
  const agregarHabitacion = (habitacion) => {
    if (!habitacion || !habitacion.id) {
      console.error('Intento de agregar una habitación inválida:', habitacion);
      return;
    }
    
    setHabitacionesSeleccionadas(prev => {
      // Verificar si la habitación ya existe
      const index = prev.findIndex(h => h.id === habitacion.id);
      
      // Si ya existe, no hacer nada
      if (index >= 0) {
        return prev;
      }
      
      // Si no existe, agregarla
      return [...prev, habitacion];
    });
  };

  const eliminarHabitacion = (id) => {
    if (!id) {
      console.error('ID de habitación inválido para eliminar');
      return;
    }
    
    setHabitacionesSeleccionadas(prev => {
      const nuevaLista = prev.filter(habitacion => habitacion.id !== id);
      return nuevaLista;
    });
  };

  const agregarHabitaciones = (habitaciones) => {
    if (!Array.isArray(habitaciones) || habitaciones.length === 0) {
      console.error('Lista de habitaciones inválida:', habitaciones);
      return;
    }
    
    setHabitacionesSeleccionadas(prev => {
      const nuevaLista = [...prev];
      
      habitaciones.forEach(nuevaHabitacion => {
        // Verificar si ya existe
        const existe = nuevaLista.some(h => h.id === nuevaHabitacion.id);
        
        // Si no existe, agregarla
        if (!existe && nuevaHabitacion.id) {
          nuevaLista.push(nuevaHabitacion);
        }
      });
      
      return nuevaLista;
    });
  };

  const limpiarHabitaciones = () => {
    setHabitacionesSeleccionadas([]);
    localStorage.removeItem('habitacionesSeleccionadas');
  };

  // Funciones para gestionar datos del evento
  const actualizarEventoData = (data) => {
    setEventoData(prev => ({
      ...prev,
      ...data
    }));
  };

  const limpiarEventoData = () => {
    setEventoData({
      tipoEvento: '',
      fecha: null,
      invitados: 50,
    });
    localStorage.removeItem('eventoData');
  };

  // Calcular totales
  const calcularTotalHabitaciones = () => {
    return habitacionesSeleccionadas.reduce((total, habitacion) => {
      const precio = typeof habitacion.precio === 'number' ? habitacion.precio : parseFloat(habitacion.precio || 0);
      return total + precio;
    }, 0);
  };

  const calcularTotalReserva = () => {
    return calcularTotalHabitaciones();
  };

  // Valor del contexto
  const value = {
    // Estados
    habitacionesSeleccionadas,
    eventoData,
    
    // Funciones para habitaciones
    agregarHabitacion,
    eliminarHabitacion,
    agregarHabitaciones,
    limpiarHabitaciones,
    
    // Funciones para evento
    actualizarEventoData,
    limpiarEventoData,
    
    // Cálculos
    calcularTotalHabitaciones,
    calcularTotalReserva
  };

  return <SimpleReservationContext.Provider value={value}>{children}</SimpleReservationContext.Provider>;
}

export default SimpleReservationContext;
