'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Crear el contexto
const ReservationContext = createContext();

// Hook personalizado para usar el contexto
export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation debe ser usado dentro de un ReservationProvider');
  }
  return context;
};

// Proveedor del contexto
export function ReservationProvider({ children }) {
  // Estados para los servicios seleccionados
  const [masajesSeleccionados, setMasajesSeleccionados] = useState([]);
  const [habitacionesSeleccionadas, setHabitacionesSeleccionadas] = useState([]);
  const [eventoData, setEventoData] = useState({
    tipoEvento: '',
    fecha: null,
    invitados: 50,
  });

  // Al montar el componente, intentar recuperar selecciones del localStorage
  useEffect(() => {
    try {
      const storedMasajes = localStorage.getItem('masajesSeleccionados');
      const storedHabitaciones = localStorage.getItem('habitacionesSeleccionadas');
      const storedEvento = localStorage.getItem('eventoData');
      
      if (storedMasajes) {
        setMasajesSeleccionados(JSON.parse(storedMasajes));
      }
      
      if (storedHabitaciones) {
        setHabitacionesSeleccionadas(JSON.parse(storedHabitaciones));
      }
      
      if (storedEvento) {
        setEventoData(JSON.parse(storedEvento));
      }
    } catch (error) {
      console.error('Error al cargar datos de reserva del localStorage:', error);
      // Limpiar localStorage si hay errores para evitar problemas futuros
      localStorage.removeItem('masajesSeleccionados');
      localStorage.removeItem('habitacionesSeleccionadas');
      localStorage.removeItem('eventoData');
    }
  }, []);

  // Guardar cambios en localStorage cada vez que cambian
  useEffect(() => {
    try {
      if (masajesSeleccionados.length > 0) {
        localStorage.setItem('masajesSeleccionados', JSON.stringify(masajesSeleccionados));
      } else {
        localStorage.removeItem('masajesSeleccionados');
      }
    } catch (error) {
      console.error('Error al guardar masajes en localStorage:', error);
    }
  }, [masajesSeleccionados]);

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

  // Funciones para manipular masajes
  const agregarMasaje = (masaje) => {
    if (!masaje || !masaje.id) {
      console.error('Intento de agregar un masaje inválido:', masaje);
      return;
    }
    
    setMasajesSeleccionados(prev => {
      // Verificar si el masaje ya existe
      const index = prev.findIndex(m => m.id === masaje.id);
      
      // Si ya existe, no hacer nada
      if (index >= 0) {
        return prev;
      }
      
      // Si no existe, agregarlo
      return [...prev, masaje];
    });
  };

  const eliminarMasaje = (id) => {
    if (!id) {
      console.error('ID de masaje inválido para eliminar');
      return;
    }
    
    setMasajesSeleccionados(prev => {
      const nuevaLista = prev.filter(masaje => masaje.id !== id);
      return nuevaLista;
    });
    
    toast.success('Masaje eliminado de la selección');
  };

  const agregarMasajes = (masajes) => {
    if (!Array.isArray(masajes) || masajes.length === 0) {
      console.error('Lista de masajes inválida:', masajes);
      return;
    }
    
    setMasajesSeleccionados(prev => {
      const nuevaLista = [...prev];
      
      masajes.forEach(nuevoMasaje => {
        // Verificar si ya existe
        const existe = nuevaLista.some(m => m.id === nuevoMasaje.id);
        
        // Si no existe, agregarlo
        if (!existe && nuevoMasaje.id) {
          nuevaLista.push(nuevoMasaje);
        }
      });
      
      return nuevaLista;
    });
    
    toast.success(`${masajes.length} masaje(s) agregado(s) a la selección`);
  };

  const limpiarMasajes = () => {
    setMasajesSeleccionados([]);
    localStorage.removeItem('masajesSeleccionados');
  };

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
    
    toast.success('Habitación eliminada de la selección');
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
    
    toast.success(`${habitaciones.length} habitación(es) agregada(s) a la selección`);
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

  // Función para limpiar toda la reserva
  const limpiarReserva = () => {
    limpiarMasajes();
    limpiarHabitaciones();
    limpiarEventoData();
    toast.info('Se ha limpiado toda la información de la reserva');
  };

  // Calcular totales
  const calcularTotalMasajes = () => {
    return masajesSeleccionados.reduce((total, masaje) => {
      const precio = typeof masaje.precio === 'number' ? masaje.precio : parseFloat(masaje.precio || 0);
      return total + precio;
    }, 0);
  };

  const calcularTotalHabitaciones = () => {
    return habitacionesSeleccionadas.reduce((total, habitacion) => {
      const precio = typeof habitacion.precio === 'number' ? habitacion.precio : parseFloat(habitacion.precio || 0);
      return total + precio;
    }, 0);
  };

  const calcularTotalReserva = () => {
    return calcularTotalMasajes() + calcularTotalHabitaciones();
  };

  // Valor del contexto
  const value = {
    // Estados
    masajesSeleccionados,
    habitacionesSeleccionadas,
    eventoData,
    
    // Funciones para masajes
    agregarMasaje,
    eliminarMasaje,
    agregarMasajes,
    limpiarMasajes,
    
    // Funciones para habitaciones
    agregarHabitacion,
    eliminarHabitacion,
    agregarHabitaciones,
    limpiarHabitaciones,
    
    // Funciones para evento
    actualizarEventoData,
    limpiarEventoData,
    
    // Funciones generales
    limpiarReserva,
    
    // Cálculos
    calcularTotalMasajes,
    calcularTotalHabitaciones,
    calcularTotalReserva
  };

  return <ReservationContext.Provider value={value}>{children}</ReservationContext.Provider>;
}

export default ReservationContext; 