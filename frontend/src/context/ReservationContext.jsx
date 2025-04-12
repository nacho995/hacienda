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
    // console.log("[ReservationContext] Reseteando formData");
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
    // <<< LOG 4: Inicio de la carga >>>
    // console.log('[ReservationContext] Iniciando loadAllReservations...');
    try {
      setLoading(true);
      setError(null);
      
      const allReservations = await getAllReservationsForDashboard();
      // <<< LOG 5: Datos recibidos del backend >>>
      // console.log('[ReservationContext] Datos recibidos de getAllReservationsForDashboard:', JSON.stringify(allReservations)); // Stringify para ver todo

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
        // Primero, normalizar el asignadoA propio de la habitación si existe
        if (habitacion.asignadoA && typeof habitacion.asignadoA === 'string' && user) {
           habitacion.asignadoAMi = habitacion.asignadoA === user.id;
        } else if (habitacion.asignadoA && typeof habitacion.asignadoA === 'object' && user) {
           habitacion.asignadoAMi = habitacion.asignadoA._id === user.id;
        } else {
           habitacion.asignadoAMi = false;
        }

        // Si está vinculada a un evento, añadir info del evento SIN sobrescribir asignadoA
        if (habitacion.eventoId || habitacion.reservaEvento) {
          const eventoId = habitacion.eventoId || habitacion.reservaEvento;
          const eventoAsociado = eventosMap.get(eventoId);
          
          if (eventoAsociado) {
            // --- NO SOBRESCRIBIR asignadoA --- 
            // habitacion.asignadoA = eventoAsociado.asignadoA; <<-- ELIMINAR/COMENTAR ESTA LÍNEA
            // habitacion.asignadoAMi = eventoAsociado.asignadoA === user?.id; <<-- MOVIDO ARRIBA
            
            // Copiar otras propiedades útiles del evento si es necesario
            if (eventoAsociado.estado && !habitacion.estadoReserva) { // Solo si la habitación no tiene estado propio
              habitacion.estadoReserva = eventoAsociado.estado;
            }
            
            habitacion.eventoAsociado = {
              id: eventoAsociado.id,
              _id: eventoAsociado._id,
              nombre: eventoAsociado.datosCompletos?.nombreEvento || 'Evento sin nombre'
            };
          } else {
              // console.warn(`[ReservationContext] Evento asociado ${eventoId} no encontrado para habitación ${habitacion.id}`);
          }
        }
        
        // Asegurar que asignadoAMi se calcula incluso si no hay evento asociado
        // (Ya se hizo al principio del map)
        // if (habitacion.asignadoA && user && !habitacion.eventoAsociado) {
        //  habitacion.asignadoAMi = habitacion.asignadoA === user.id || habitacion.asignadoA?._id === user.id;
        // }
        
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
      
      // <<< LOG 6: Fin >>>
      // console.log('[ReservationContext] loadAllReservations completado.'); 

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
        // console.error('Error al parsear los datos guardados:', error);
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