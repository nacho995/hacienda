'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getAllReservationsForDashboard } from '../services/reservationService';
import { toast } from 'sonner';

const ReservationSyncContext = createContext();

export const useReservationSync = () => useContext(ReservationSyncContext);

export const ReservationSyncProvider = ({ children }) => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [habitacionReservations, setHabitacionReservations] = useState([]);
  const [eventoReservations, setEventoReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
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
      
      console.log("Iniciando carga de reservaciones...");
      
      // Obtener todas las reservas con el método unificado
      const allReservations = await getAllReservationsForDashboard();
      
      // Normalizar los IDs para evitar problemas de comparación
      const normalizedReservations = allReservations.map(normalizeId);
      
      // Separar por tipo
      const habitaciones = normalizedReservations.filter(r => r.tipo === 'habitacion');
      const eventos = normalizedReservations.filter(r => r.tipo === 'evento');
      
      console.log('Reservaciones cargadas:', {
        total: normalizedReservations.length,
        habitaciones: habitaciones.length,
        eventos: eventos.length
      });
      
      // Primero, crear un mapa de eventos para acceso rápido
      const eventosMap = new Map();
      eventos.forEach(evento => {
        eventosMap.set(evento.id, evento);
        // Asegurarse de que también podemos buscar por _id
        if (evento._id && evento._id !== evento.id) {
          eventosMap.set(evento._id, evento);
        }
      });
      
      // Procesar las relaciones entre eventos y habitaciones
      const habitacionesProcesadas = habitaciones.map(habitacion => {
        if (habitacion.eventoId || habitacion.reservaEvento) {
          const eventoId = habitacion.eventoId || habitacion.reservaEvento;
          const eventoAsociado = eventosMap.get(eventoId);
          
          if (eventoAsociado) {
            // Sincronizar estado de asignación con el evento
            habitacion.asignadoA = eventoAsociado.asignadoA;
            habitacion.asignadoAMi = eventoAsociado.asignadoA === user?.id;
            
            // También sincronizar estado reserva si el evento tiene uno definido
            if (eventoAsociado.estado) {
              habitacion.estado = eventoAsociado.estado;
            }
            
            // Añadir referencia explícita al evento para facilitar búsquedas futuras
            habitacion.eventoAsociado = {
              id: eventoAsociado.id,
              _id: eventoAsociado._id,
              nombre: eventoAsociado.datosCompletos?.nombreEvento || 'Evento sin nombre'
            };
          }
        }
        
        // Asegurarse de que asignadoAMi está correctamente establecido
        if (habitacion.asignadoA && user) {
          habitacion.asignadoAMi = habitacion.asignadoA === user.id;
        }
        
        return habitacion;
      });
      
      // También procesar eventos para añadir referencias a habitaciones asociadas
      const eventosProcesados = eventos.map(evento => {
        // Encontrar todas las habitaciones asociadas a este evento
        const habitacionesAsociadas = habitacionesProcesadas.filter(h => 
          h.eventoId === evento.id || h.reservaEvento === evento.id ||
          h.eventoId === evento._id || h.reservaEvento === evento._id
        );
        
        // Añadir conteo y referencias
        evento.habitacionesAsociadas = habitacionesAsociadas.length;
        evento.habitacionesIds = habitacionesAsociadas.map(h => h.id);
        
        // Asegurarse de que asignadoAMi está correctamente establecido
        if (evento.asignadoA && user) {
          evento.asignadoAMi = evento.asignadoA === user.id;
        }
        
        return evento;
      });
      
      // Combinar todo manteniendo la correcta asociación
      const allProcessedReservations = [...eventosProcesados, ...habitacionesProcesadas];
      
      console.log("Finalizada la preparación de los datos:", {
        eventosProcesados: eventosProcesados.length,
        habitacionesProcesadas: habitacionesProcesadas.length,
        total: allProcessedReservations.length
      });
      
      // Establecer las reservaciones en el estado
      setReservations(allProcessedReservations);
      setHabitacionReservations(habitacionesProcesadas);
      setEventoReservations(eventosProcesados);
      setLastUpdate(new Date());
      
      if (showToast) {
        toast.success('Reservaciones actualizadas correctamente');
      }
      
      return {
        allReservations: allProcessedReservations,
        habitaciones: habitacionesProcesadas,
        eventos: eventosProcesados
      };
    } catch (error) {
      console.error('Error al cargar reservaciones:', error);
      setError('Error al cargar las reservaciones');
      if (showToast) {
        toast.error('Error al cargar las reservaciones');
      }
      return {
        allReservations: [],
        habitaciones: [],
        eventos: []
      };
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
  
  // Actualizar una reserva en el estado global
  const updateReservation = (id, tipo, updates) => {
    console.log(`Actualizando reserva ${tipo} con ID ${id}:`, updates);
    
    if (!id) {
      console.error('Se intentó actualizar una reserva con ID nulo');
      return;
    }
    
    // Normalizar ID para la búsqueda
    const normalizedId = id.toString();
    
    // Identificar todas las reservas relacionadas que deben actualizarse
    const relacionadas = [];
    
    // Siempre incluir la propia reserva
    relacionadas.push(normalizedId);
    
    // Buscar relaciones entre eventos y habitaciones
    if (tipo === 'evento') {
      // Si es un evento, encontrar todas las habitaciones asociadas
      const habitacionesAsociadas = habitacionReservations
        .filter(h => {
          // Comprobar todos los posibles campos de relación
          const eventoRelacionado = 
            (h.eventoId && h.eventoId.toString() === normalizedId) || 
            (h.reservaEvento && h.reservaEvento.toString() === normalizedId);
          
          return h.tipo === 'habitacion' && eventoRelacionado;
        })
        .map(h => h.id || h._id);
      
      relacionadas.push(...habitacionesAsociadas);
      console.log(`Encontradas ${habitacionesAsociadas.length} habitaciones asociadas al evento ${normalizedId}`);
      
      // Si estamos desvinculando un evento de sus habitaciones (eventoId: null)
      if (updates.eventoId === null || updates.reservaEvento === null) {
        console.log("Desvinculando evento de sus habitaciones asociadas");
        
        // Actualizar cada habitación asociada para desvincularla del evento
        habitacionesAsociadas.forEach(habitacionId => {
          // Añadir la habitación a las relacionadas si no está ya
          if (!relacionadas.includes(habitacionId)) {
            relacionadas.push(habitacionId);
          }
        });
      }
    } else if (tipo === 'habitacion') {
      // Si es una habitación, buscar el evento asociado
      const habitacion = habitacionReservations.find(h => 
        (h.id && h.id.toString() === normalizedId) || 
        (h._id && h._id.toString() === normalizedId)
      );
      
      if (habitacion) {
        // Obtener el eventoId actual (antes de las actualizaciones)
        let eventoIdActual = null;
        if (habitacion.eventoId) eventoIdActual = habitacion.eventoId.toString();
        else if (habitacion.reservaEvento) eventoIdActual = habitacion.reservaEvento.toString();
        
        // Si hay un evento asociado actualmente
        if (eventoIdActual) {
          relacionadas.push(eventoIdActual);
          
          // Añadir también otras habitaciones del mismo evento
          const otrasHabitaciones = habitacionReservations
            .filter(h => {
              const esDelMismoEvento = 
                (h.eventoId && h.eventoId.toString() === eventoIdActual) || 
                (h.reservaEvento && h.reservaEvento.toString() === eventoIdActual);
              
              const esOtraHabitacion = 
                !((h.id && h.id.toString() === normalizedId) || 
                (h._id && h._id.toString() === normalizedId));
                
              return h.tipo === 'habitacion' && esDelMismoEvento && esOtraHabitacion;
            })
            .map(h => h.id || h._id);
          
          relacionadas.push(...otrasHabitaciones);
          console.log(`Encontrado evento ${eventoIdActual} y ${otrasHabitaciones.length} habitaciones adicionales asociadas`);
        }
        
        // Si estamos asignando la habitación a un nuevo evento
        if (updates.eventoId && (!eventoIdActual || updates.eventoId.toString() !== eventoIdActual)) {
          const nuevoEventoId = updates.eventoId.toString();
          console.log(`Asignando habitación a nuevo evento: ${nuevoEventoId}`);
          relacionadas.push(nuevoEventoId);
          
          // Buscar otras habitaciones del nuevo evento
          const habitacionesNuevoEvento = habitacionReservations
            .filter(h => {
              const esDelNuevoEvento = 
                (h.eventoId && h.eventoId.toString() === nuevoEventoId) || 
                (h.reservaEvento && h.reservaEvento.toString() === nuevoEventoId);
              
              return h.tipo === 'habitacion' && esDelNuevoEvento;
            })
            .map(h => h.id || h._id);
          
          relacionadas.push(...habitacionesNuevoEvento);
        }
        
        // Si estamos cambiando el evento (reservaEvento)
        if (updates.reservaEvento && (!eventoIdActual || updates.reservaEvento.toString() !== eventoIdActual)) {
          const nuevoEventoId = updates.reservaEvento.toString();
          console.log(`Asignando habitación a nuevo evento por reservaEvento: ${nuevoEventoId}`);
          relacionadas.push(nuevoEventoId);
          
          // Buscar otras habitaciones del nuevo evento
          const habitacionesNuevoEvento = habitacionReservations
            .filter(h => {
              const esDelNuevoEvento = 
                (h.eventoId && h.eventoId.toString() === nuevoEventoId) || 
                (h.reservaEvento && h.reservaEvento.toString() === nuevoEventoId);
              
              return h.tipo === 'habitacion' && esDelNuevoEvento;
            })
            .map(h => h.id || h._id);
          
          relacionadas.push(...habitacionesNuevoEvento);
        }
      }
    }
    
    // Eliminar duplicados y valores nulos/undefined
    const relacionadasUnicas = [...new Set(relacionadas.filter(Boolean))];
    console.log(`Total ${relacionadasUnicas.length} reservas a actualizar:`, relacionadasUnicas);
    
    // Función común para actualizar un objeto
    const actualizarObjeto = (objeto) => {
      // Normalizar IDs del objeto para comparación
      const objetoId = objeto.id || objeto._id;
      if (!objetoId) return objeto;
      const objetoIdStr = objetoId.toString();
      
      // Comprobar si este objeto está en la lista de relacionadas
      if (relacionadasUnicas.includes(objetoIdStr)) {
        let resultado;
        
        // Si es una habitación y estamos procesando evento
        if (objeto.tipo === 'habitacion' && tipo === 'evento') {
          if (updates.eventoId === null || updates.reservaEvento === null) {
            // Si estamos desvinculando habitaciones, actualizar todas las habitaciones relacionadas
            resultado = { 
              ...objeto,
              eventoId: null,
              reservaEvento: null,
              estado: 'disponible',
              eventoAsociado: null,
              // Asegurar que los IDs se mantienen 
              id: objeto.id || objeto._id,
              _id: objeto._id || objeto.id
            };
          } else {
            // Mantener vinculación y actualizar estado si es necesario
            resultado = { 
              ...objeto,
              // Asegurar que los IDs se mantienen 
              id: objeto.id || objeto._id,
              _id: objeto._id || objeto.id
            };
            
            // Actualizar asignadoA/asignadoAMi si está en las actualizaciones
            if ('asignadoA' in updates) {
              resultado.asignadoA = updates.asignadoA;
              resultado.asignadoAMi = user ? updates.asignadoA === user.id : false;
              
              // Si hay un usuario asignado, añadir también usuarioAsignado
              if (updates.asignadoA) {
                resultado.usuarioAsignado = updates.asignadoA;
              } else {
                resultado.usuarioAsignado = null;
              }
            }
            
            // Actualizar estado si está en las actualizaciones
            if ('estado' in updates) {
              resultado.estado = updates.estado;
            }
          }
        } 
        // Si es el evento y estamos procesando habitación
        else if (objeto.tipo === 'evento' && tipo === 'habitacion') {
          resultado = { 
            ...objeto,
            // Asegurar que los IDs se mantienen 
            id: objeto.id || objeto._id,
            _id: objeto._id || objeto.id
          };
          
          // Si la habitación se desasocia del evento, actualizar conteo
          if (updates.eventoId === null || updates.reservaEvento === null) {
            const habitacionesActuales = objeto.habitacionesAsociadas || 0;
            resultado.habitacionesAsociadas = Math.max(0, habitacionesActuales - 1);
          }
          
          // Si la habitación se asocia a este evento, actualizar conteo
          else if ((updates.eventoId && objetoIdStr === updates.eventoId.toString()) || 
                   (updates.reservaEvento && objetoIdStr === updates.reservaEvento.toString())) {
            const habitacionesActuales = objeto.habitacionesAsociadas || 0;
            resultado.habitacionesAsociadas = habitacionesActuales + 1;
          }
          
          // Actualizar asignadoA/asignadoAMi si está en las actualizaciones
          if ('asignadoA' in updates) {
            resultado.asignadoA = updates.asignadoA;
            resultado.asignadoAMi = user ? updates.asignadoA === user.id : false;
            
            // Si hay un usuario asignado, añadir también usuarioAsignado
            if (updates.asignadoA) {
              resultado.usuarioAsignado = updates.asignadoA;
            } else {
              resultado.usuarioAsignado = null;
            }
          }
          
          // Actualizar estado si está en las actualizaciones
          if ('estado' in updates) {
            resultado.estado = updates.estado;
          }
        }
        // Si es la propia reserva siendo actualizada
        else if (objetoIdStr === normalizedId && objeto.tipo === tipo) {
          resultado = { 
            ...objeto, 
            ...updates,
            // Asegurar que los IDs se mantienen 
            id: objeto.id || objeto._id,
            _id: objeto._id || objeto.id
          };
          
          // Manejar especialmente el campo asignadoAMi
          if ('asignadoA' in updates) {
            resultado.asignadoAMi = user ? updates.asignadoA === user.id : false;
            
            // Si hay un usuario asignado, añadir también usuarioAsignado
            if (updates.asignadoA) {
              resultado.usuarioAsignado = updates.asignadoA;
            } else {
              resultado.usuarioAsignado = null;
            }
          }
        }
        // Para otras reservas relacionadas
        else {
          resultado = { 
            ...objeto,
            // Asegurar que los IDs se mantienen 
            id: objeto.id || objeto._id,
            _id: objeto._id || objeto.id
          };
          
          // Aplicar solo cambios de asignación y estado a otras reservas
          if ('asignadoA' in updates) {
            resultado.asignadoA = updates.asignadoA;
            resultado.asignadoAMi = user ? updates.asignadoA === user.id : false;
            
            // Si hay un usuario asignado, añadir también usuarioAsignado
            if (updates.asignadoA) {
              resultado.usuarioAsignado = updates.asignadoA;
            } else {
              resultado.usuarioAsignado = null;
            }
          }
          
          if ('estado' in updates) {
            resultado.estado = updates.estado;
          }
        }

        return resultado;
      }
      return objeto;
    };
    
    // Actualizar en todas las listas de manera transaccional para evitar inconsistencias
    const reservationsActualizadas = reservations.map(actualizarObjeto);
    const habitacionesActualizadas = habitacionReservations.map(actualizarObjeto);
    const eventosActualizados = eventoReservations.map(actualizarObjeto);
    
    // Actualizar todo el estado a la vez
    setReservations(reservationsActualizadas);
    setHabitacionReservations(habitacionesActualizadas);
    setEventoReservations(eventosActualizados);
    
    // Forzar una actualización en la fecha para notificar a los componentes
    setLastUpdate(new Date());
    
    // Imprimir confirmación detallada
    console.log(`Actualización completada para ${relacionadasUnicas.length} reservas:`, {
      tipo,
      id,
      updates,
      reservasActualizadas: relacionadasUnicas
    });
    
    // Después de actualizar, si es un cambio importante, programar un refetch para sincronizar con el servidor
    if (updates.asignadoA !== undefined || updates.estado !== undefined || 
        updates.eventoId !== undefined || updates.reservaEvento !== undefined) {
      setTimeout(() => {
        loadAllReservations(false);
      }, 1000);
    }
  };
  
  // Eliminar una reserva del estado global
  const removeReservation = (id, tipo) => {
    // Eliminar de la lista general
    setReservations(prevReservations => {
      return prevReservations.filter(reserva => !(reserva._id === id && reserva.tipo === tipo));
    });
    
    // Eliminar de la lista específica según el tipo
    if (tipo === 'habitacion') {
      setHabitacionReservations(prev => {
        return prev.filter(reserva => reserva._id !== id);
      });
    } else if (tipo === 'evento') {
      setEventoReservations(prev => {
        return prev.filter(reserva => reserva._id !== id);
      });
    }
    
    // Actualizar la fecha de última actualización
    setLastUpdate(new Date());
    
    console.log(`Reserva ${tipo} con ID ${id} eliminada`);
  };
  
  // Añadir una nueva reserva al estado global
  const addReservation = (newReservation) => {
    if (!newReservation || !newReservation._id || !newReservation.tipo) {
      console.error('Intento de añadir una reserva inválida:', newReservation);
      return;
    }
    
    // Añadir a la lista general
    setReservations(prevReservations => {
      // Verificar si ya existe
      const existe = prevReservations.some(r => 
        r._id === newReservation._id && r.tipo === newReservation.tipo
      );
      
      if (existe) {
        return prevReservations;
      }
      
      return [...prevReservations, newReservation];
    });
    
    // Añadir a la lista específica según el tipo
    if (newReservation.tipo === 'habitacion') {
      setHabitacionReservations(prev => {
        const existe = prev.some(r => r._id === newReservation._id);
        if (existe) return prev;
        return [...prev, newReservation];
      });
    } else if (newReservation.tipo === 'evento') {
      setEventoReservations(prev => {
        const existe = prev.some(r => r._id === newReservation._id);
        if (existe) return prev;
        return [...prev, newReservation];
      });
    }
    
    // Actualizar la fecha de última actualización
    setLastUpdate(new Date());
    
    console.log(`Nueva reserva ${newReservation.tipo} añadida:`, newReservation);
  };
  
  // Actualizar el estado de una reserva (pendiente, confirmada, cancelada)
  const updateReservationState = async (id, tipo, nuevoEstado) => {
    try {
      // Asegurarse de que el estado esté en minúsculas para consistencia
      const estadoNormalizado = nuevoEstado.toLowerCase();
      
      // Actualizar en el estado local
      updateReservation(id, tipo, { 
        estado: estadoNormalizado,
        estadoReserva: estadoNormalizado 
      });
      
      console.log(`Estado de reserva ${tipo} con ID ${id} actualizado a: ${estadoNormalizado}`);
      
      // Recargar todas las reservas para asegurar sincronización
      await loadAllReservations(false);
      
      return true;
    } catch (error) {
      console.error(`Error al actualizar estado de reserva ${tipo}:`, error);
      return false;
    }
  };
  
  // Hook para depuración - registra cambios en el contexto
  useEffect(() => {
    console.log("=== Contexto de Reservas Actualizado ===");
    console.log(`- Fecha: ${lastUpdate.toLocaleTimeString()}`);
    console.log(`- Total Reservaciones: ${reservations.length}`);
    console.log(`- Habitaciones: ${habitacionReservations.length}`);
    console.log(`- Eventos: ${eventoReservations.length}`);
    
    // Verificar si hay inconsistencias
    const inconsistencias = [];
    
    // Verificar habitaciones asociadas a eventos
    habitacionReservations.forEach(habitacion => {
      if (habitacion.eventoId || habitacion.reservaEvento) {
        const idEvento = habitacion.eventoId || habitacion.reservaEvento;
        const existeEvento = eventoReservations.some(e => 
          (e.id && e.id.toString() === idEvento.toString()) || 
          (e._id && e._id.toString() === idEvento.toString())
        );
        
        if (!existeEvento) {
          inconsistencias.push(`Habitación ${habitacion.id || habitacion._id} asociada a evento inexistente: ${idEvento}`);
        }
      }
    });
    
    // Verificar contadores de habitaciones en eventos
    eventoReservations.forEach(evento => {
      const habitacionesAsociadas = habitacionReservations.filter(h => 
        (h.eventoId && h.eventoId.toString() === (evento.id || evento._id).toString()) || 
        (h.reservaEvento && h.reservaEvento.toString() === (evento.id || evento._id).toString())
      );
      
      if (habitacionesAsociadas.length !== (evento.habitacionesAsociadas || 0)) {
        inconsistencias.push(`Evento ${evento.id || evento._id} tiene conteo erróneo de habitaciones: ${evento.habitacionesAsociadas} vs real: ${habitacionesAsociadas.length}`);
      }
    });
    
    // Mostrar inconsistencias encontradas
    if (inconsistencias.length > 0) {
      console.warn("⚠️ Inconsistencias detectadas en el contexto de reservas:", inconsistencias);
    }
  }, [lastUpdate]);
  
  return (
    <ReservationSyncContext.Provider
      value={{
        reservations,
        habitacionReservations,
        eventoReservations,
        loading,
        error,
        lastUpdate,
        loadAllReservations,
        updateReservation,
        removeReservation,
        addReservation,
        updateReservationState
      }}
    >
      {children}
    </ReservationSyncContext.Provider>
  );
};

export default ReservationSyncContext;
