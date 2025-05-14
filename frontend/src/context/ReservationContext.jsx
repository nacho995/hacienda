'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getAllReservationsForDashboard } from '../services/reservationService';
import { toast } from 'sonner';
import { obtenerTodasLasReservas } from '@/services/disponibilidadService';

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
    
    // Resetear todos los datos del formulario
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
      selectedTipoEvento: null, // Asegurar que este valor también se resetea
      gestionHacienda: {
        habitacionesAsignadas: [],
        serviciosAsignados: [],
        estadoGestion: 'pendiente'
      }
    });
    
    // Disparar un evento global que informe a todos los componentes del reseteo
    // Esto permite que componentes como ReciboReservaGlobal puedan escucharlo y actuar
    const resetEvent = new Event('formularioResetEvent');
    window.dispatchEvent(resetEvent);
    
    // Eliminar los datos guardados en localStorage para asegurar un reset completo
    localStorage.removeItem('reservaFormData');
  }, []);

  // Normalizar IDs para evitar problemas de comparación
  const normalizeId = (obj) => {
    if (!obj) return null;
    
    // Crear una copia asegurando que 'tipo' se incluye desde el inicio
    const normalizedObj = { 
      ...obj,
      tipo: obj.tipo // Copiar explícitamente el tipo aquí
    }; 
    
    // Normalizar IDs en la copia
    if (normalizedObj.id && !normalizedObj._id) normalizedObj._id = normalizedObj.id;
    if (normalizedObj._id && !normalizedObj.id) normalizedObj.id = normalizedObj._id;
    
    // La condición explícita de 'tipo' ya no es necesaria aquí,
    // porque se incluyó en el spread inicial.
    // if (obj.tipo) {
    //  normalizedObj.tipo = obj.tipo;
    // }

    return normalizedObj; // Devolver la copia normalizada
  };

  // Cargar todas las reservaciones
  const loadAllReservations = useCallback(async (showToast = false) => {
    // <<< LOG 4: Inicio de la carga >>>
    // console.log('[ReservationContext] Iniciando loadAllReservations...');
    try {
      setLoading(true);
      setError(null);
      
      const allReservationsResponse = await getAllReservationsForDashboard();
      // <<< LOG 5: Datos recibidos del backend >>>
      // console.log('[ReservationContext] Datos recibidos de getAllReservationsForDashboard:', JSON.stringify(allReservationsResponse)); // Stringify para ver todo

      // --- CORRECCIÓN: Extraer la lista COMBINADA del backend --- 
      const combinedReservationsFromBackend = allReservationsResponse?.data || [];

      // <<< NUEVO LOG: Verificar datos CRUDOS antes de normalizar >>>
      console.log('[ReservationContext] Datos CRUDOS RECIBIDOS (primeros 5):',
        combinedReservationsFromBackend.slice(0, 5).map(r => ({ 
          _id: r._id, 
          tipo: r.tipo, 
          nombreContacto: r.nombreContacto,
          apellidosContacto: r.apellidosContacto,
          usuario: r.usuario,
          huesped: r.huesped
        }))
      );
      // <<< FIN NUEVO LOG >>>

      // Verificar si combinedReservationsFromBackend es realmente un array antes de mapear
      if (!Array.isArray(combinedReservationsFromBackend)) {
        console.error('[ReservationContext] Error: La respuesta del backend no contiene un array de datos válidos:', combinedReservationsFromBackend);
        setError('Error inesperado al procesar las reservaciones.');
        setLoading(false);
        return; // Detener ejecución si los datos no son válidos
      }

      // Normalizar IDs para todos los elementos
      const normalizedReservations = combinedReservationsFromBackend.map(normalizeId);
      
      // <<< NUEVO LOG: Verificar los primeros elementos ANTES de filtrar (log directo) >>>
      console.log('[ReservationContext] Primeros 5 elementos normalizados ANTES de filtrar por tipo (directo):');
      console.dir(normalizedReservations.slice(0, 5)); // Usar console.dir para intentar mostrar el objeto completo
      // <<< FIN NUEVO LOG >>>

      // --- CORRECCIÓN: Filtrar la lista NORMALIZADA usando el campo 'tipo' --- 
      const habitaciones = normalizedReservations.filter(r => r.tipo === 'habitacion');
      const eventos = normalizedReservations.filter(r => r.tipo === 'evento');
      // -------------------------------------------------------------------------
      
      // <<< NUEVO LOG: Verificar los primeros elementos DESPUÉS de filtrar (log directo) >>>
      console.log('[ReservationContext] Primeros 5 elementos en lista \'habitaciones\' DESPUÉS de filtrar (directo):');
      console.dir(habitaciones.slice(0, 5)); // Usar console.dir
      console.log('[ReservationContext] Primeros 5 elementos en lista \'eventos\' DESPUÉS de filtrar (directo):');
      console.dir(eventos.slice(0, 5)); // Usar console.dir
      // <<< FIN NUEVO LOG >>>

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