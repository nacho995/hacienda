'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getAllReservationsForDashboard } from '../services/reservationService';
import { toast } from 'sonner';

const ReservationContext = createContext();

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation debe usarse dentro de un ReservationProvider');
  }
  return context;
};

export const ReservationProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Estado para todas las reservas del sistema
  const [reservations, setReservations] = useState([]);
  const [habitacionReservations, setHabitacionReservations] = useState([]);
  const [eventoReservations, setEventoReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Estado del formulario de reserva actual
  const [formData, setFormData] = useState({
    tipoEvento: null,
    fechaInicio: null,
    fechaFin: null,
    numeroHabitaciones: 0,
    habitacionesSeleccionadas: [],
    serviciosSeleccionados: [],
    modoReserva: null, // 'cliente' o 'hacienda'
    datosContacto: null,
    pasoActual: 1,
    gestionHacienda: {
      habitacionesAsignadas: [],
      serviciosAsignados: [],
      estadoGestion: 'pendiente'
    }
  });

  // Funciones para el formulario de reserva
  const updateFormSection = useCallback((section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  }, []);

  const updateGestionHacienda = useCallback((data) => {
    setFormData(prev => ({
      ...prev,
      gestionHacienda: {
        ...prev.gestionHacienda,
        ...data
      }
    }));
  }, []);

  const resetForm = useCallback(() => {
    console.log("[ReservationContext] Reseteando formData");
    setFormData({
      tipoEvento: null,
      fechaInicio: null,
      fechaFin: null,
      numeroHabitaciones: 0,
      habitacionesSeleccionadas: [],
      serviciosSeleccionados: [],
      modoReserva: null,
      datosContacto: null,
      pasoActual: 1,
      gestionHacienda: {
        habitacionesAsignadas: [],
        serviciosAsignados: [],
        estadoGestion: 'pendiente'
      }
    });
  }, []);

  // Normalizar IDs para evitar problemas de comparación
  const normalizeId = (obj) => {
    if (!obj) return null;
    if (obj.id && !obj._id) obj._id = obj.id;
    if (obj._id && !obj.id) obj.id = obj._id;
    return obj;
  };

  // Cargar todas las reservaciones
  const loadAllReservations = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const allReservations = await getAllReservationsForDashboard();
      const normalizedReservations = allReservations.map(normalizeId);
      
      const habitaciones = normalizedReservations.filter(r => r.tipo === 'habitacion');
      const eventos = normalizedReservations.filter(r => r.tipo === 'evento');
      
      // Crear mapa de eventos
      const eventosMap = new Map();
      eventos.forEach(evento => {
        eventosMap.set(evento.id, evento);
        if (evento._id && evento._id !== evento.id) {
          eventosMap.set(evento._id, evento);
        }
      });
      
      // Procesar habitaciones
      const habitacionesProcesadas = habitaciones.map(habitacion => {
        if (habitacion.eventoId || habitacion.reservaEvento) {
          const eventoId = habitacion.eventoId || habitacion.reservaEvento;
          const eventoAsociado = eventosMap.get(eventoId);
          
          if (eventoAsociado) {
            habitacion.asignadoA = eventoAsociado.asignadoA;
            habitacion.asignadoAMi = eventoAsociado.asignadoA === user?.id;
            
            if (eventoAsociado.estado) {
              habitacion.estado = eventoAsociado.estado;
            }
            
            habitacion.eventoAsociado = {
              id: eventoAsociado.id,
              _id: eventoAsociado._id,
              nombre: eventoAsociado.datosCompletos?.nombreEvento || 'Evento sin nombre'
            };
          }
        }
        
        if (habitacion.asignadoA && user) {
          habitacion.asignadoAMi = habitacion.asignadoA === user.id;
        }
        
        return habitacion;
      });
      
      // Procesar eventos
      const eventosProcesados = eventos.map(evento => {
        const habitacionesAsociadas = habitacionesProcesadas.filter(h => 
          h.eventoId === evento.id || h.reservaEvento === evento.id ||
          h.eventoId === evento._id || h.reservaEvento === evento._id
        );
        
        evento.habitacionesAsociadas = habitacionesAsociadas.length;
        evento.habitacionesIds = habitacionesAsociadas.map(h => h.id);
        
        if (evento.asignadoA && user) {
          evento.asignadoAMi = evento.asignadoA === user.id;
        }
        
        return evento;
      });
      
      setReservations([...eventosProcesados, ...habitacionesProcesadas]);
      setHabitacionReservations(habitacionesProcesadas);
      setEventoReservations(eventosProcesados);
      setLastUpdate(new Date());
      
      if (showToast) {
        toast.success('Reservaciones actualizadas correctamente');
      }
      
    } catch (error) {
      console.error('Error al cargar reservaciones:', error);
      setError('Error al cargar las reservaciones');
      if (showToast) {
        toast.error('Error al cargar las reservaciones');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar reservaciones al iniciar
  useEffect(() => {
    if (user) {
      loadAllReservations();
    }
  }, [user, loadAllReservations]);

  // Cargar datos del formulario desde localStorage
  useEffect(() => {
    const savedFormData = localStorage.getItem('reservaFormData');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error al parsear los datos guardados:', error);
      }
    }
  }, []);

  // Guardar datos del formulario en localStorage
  useEffect(() => {
    localStorage.setItem('reservaFormData', JSON.stringify(formData));
  }, [formData]);

  // Funciones para gestionar reservas
  const updateReservation = (id, tipo, updates) => {
    // ... (mantener la lógica existente de updateReservation)
  };

  const removeReservation = (id, tipo) => {
    // ... (mantener la lógica existente de removeReservation)
  };

  const addReservation = (newReservation) => {
    // ... (mantener la lógica existente de addReservation)
  };

  const updateReservationState = async (id, tipo, nuevoEstado) => {
    // ... (mantener la lógica existente de updateReservationState)
  };

  return (
    <ReservationContext.Provider
      value={{
        // Estado y funciones del formulario
        formData,
        updateFormSection,
        updateGestionHacienda,
        resetForm,
        
        // Estado y funciones de sincronización
        reservations,
        habitacionReservations,
        eventoReservations,
        loading,
        error,
        lastUpdate,
        
        // Funciones de gestión
        loadAllReservations,
        updateReservation,
        removeReservation,
        addReservation,
        updateReservationState
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export default ReservationContext; 