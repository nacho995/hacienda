import axios from 'axios';
import apiClient from './apiClient';
import { subDays, addDays, isValid, startOfDay, endOfDay } from 'date-fns';
import { isSameDay } from 'date-fns';
import { toast } from 'sonner';

// Caché para evitar llamadas repetidas
let cacheDisponibilidad = {
  data: null,
  timestamp: 0
};

// *** MODIFICADO PARA USAR ENDPOINTS PÚBLICOS ***
// Intenta obtener TODAS las reservas (o al menos sus fechas) 
// llamando a endpoints públicos si es posible.
export const obtenerTodasLasReservas = async () => {
  console.log('[disponibilidadService] Intentando obtener fechas de reservas (público)... ');
  try {
    // Llamar a los NUEVOS endpoints PÚBLICOS con las rutas correctas
    const [respHabPublic, respEvPublic] = await Promise.all([
      apiClient.get('/api/reservas/habitaciones/public/fechas-ocupadas-habitaciones'), 
      apiClient.get('/api/reservas/eventos/public/fechas-ocupadas-eventos')    
    ]);
    
    // <-- LOG AÑADIDO para ver respuestas crudas
    console.log('[disponibilidadService] Respuesta cruda Habitaciones:', respHabPublic);
    console.log('[disponibilidadService] Respuesta cruda Eventos:', respEvPublic);

    // El formato esperado de los endpoints públicos es directamente el array de rangos.
    // *** CORRECCIÓN: Extraer correctamente los datos de la respuesta ***
    const reservasHabitacion = Array.isArray(respHabPublic) ? respHabPublic : (respHabPublic?.data || []);
    const reservasEvento = Array.isArray(respEvPublic) ? respEvPublic : (respEvPublic?.data || []);
    
    // <-- LOG AÑADIDO para ver datos extraídos
    console.log('[disponibilidadService] Datos extraídos Habitaciones:', reservasHabitacion);
    console.log('[disponibilidadService] Datos extraídos Eventos:', reservasEvento);

    // Devolver en el formato esperado por las funciones que lo llaman
    // (envueltas en un objeto similar al anterior para mantener compatibilidad)
    return { 
      reservasHabitacion: { data: reservasHabitacion }, 
      reservasEvento: { data: reservasEvento } 
    };

  } catch (error) {
    console.error('Error al obtener fechas de reservas (público):', error);
    toast.error('No se pudo cargar la disponibilidad inicial. Es posible que las fechas no se muestren bloqueadas.');
    return { 
      reservasHabitacion: { data: [] }, 
      reservasEvento: { data: [] } 
    }; 
  }
};

export const verificarDisponibilidadHabitacion = async (habitacionLetra, fechaInicio, fechaFin) => {
  try {
    const { reservasHabitacion: respHab, reservasEvento: respEv } = await obtenerTodasLasReservas();

    // Acceder a .data para obtener el array real (asumiendo que la API devuelve { success: true, data: [...] })
    const arrayReservasHab = respHab?.data || [];
    const arrayReservasEv = respEv?.data || [];
    
    // Convertir fechas a objetos Date para comparar
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    // Verificar reservas directas de habitación (comparando por letra)
    const habitacionReservada = arrayReservasHab.some(reserva => 
      (reserva.habitacion === habitacionLetra || reserva.letraHabitacion === habitacionLetra) && // Comparar letra
      hayOverlap(inicio, fin, new Date(reserva.fechaEntrada), new Date(reserva.fechaSalida)) // Usar fechaEntrada/fechaSalida
    );
    
    if (habitacionReservada) return false;
    
    // Verificar reservas de eventos que incluyen esta habitación (usando array poblado y comparando por letra)
    const eventoConHabitacion = arrayReservasEv.some(evento => {
      const eventoInicio = new Date(evento.fecha); // Usar fecha
      const eventoFin = evento.fechaFin ? new Date(evento.fechaFin) : new Date(evento.fecha); // Usar fechaFin o fecha
      // Ajustar fin del evento para incluir el día completo si es necesario (depende de la lógica del calendario)
      // eventoFin.setHours(23, 59, 59, 999); // Considerar si el overlap debe ser inclusivo del día final

      return (
        evento.habitacionesReservadas && 
        evento.habitacionesReservadas.some(h => h.letra === habitacionLetra || h.id === habitacionLetra) && // Comparar por letra/id poblado
        hayOverlap(inicio, fin, eventoInicio, eventoFin) // Usar fechas del evento
      );
    });
        
    return !eventoConHabitacion; // Devuelve true si NO hay evento solapado con esa habitación
    
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    throw error;
  }
};

// Función para obtener fechas ocupadas de una habitación específica
export const obtenerFechasOcupadas = async (habitacionLetra) => {
  try {
    const { reservasHabitacion: respHab, reservasEvento: respEv } = await obtenerTodasLasReservas();

    // Acceder a .data para obtener el array real
    const arrayReservasHab = respHab?.data || [];
    const arrayReservasEv = respEv?.data || [];

    // Usar los arrays para filtrar reservas directas (comparando letra)
    const reservasDirectas = arrayReservasHab
      .filter(r => (r.habitacion === habitacionLetra || r.letraHabitacion === habitacionLetra || r.habitacion?._id === habitacionLetra || r.habitacion?.letra === habitacionLetra)) // Comparar letra/ID/letra poblada
      .map(r => ({ 
        inicio: new Date(r.fechaEntrada), 
        fin: new Date(r.fechaSalida),
        tipo: 'habitacion'
      }));
    
    // Usar los arrays para filtrar reservas por evento (comparando letra en array poblado)
    const reservasPorEvento = arrayReservasEv
      .filter(e => 
        e.habitacionesReservadas && 
        e.habitacionesReservadas.some(h => h.letra === habitacionLetra || h._id === habitacionLetra) // Comparar letra/id poblado
      )
      .map(e => {
        // Calcular fechas originales del evento
        const inicioEvento = new Date(e.fecha); 
        const finEvento = e.fechaFin ? new Date(e.fechaFin) : new Date(e.fecha); 
        
        // Asegurar que las fechas son válidas antes de ajustar
        if (isNaN(inicioEvento.getTime()) || isNaN(finEvento.getTime())) {
           console.warn("Fechas de evento inválidas detectadas:", e);
           return null; // Omitir este rango si las fechas son inválidas
        }

        // <<< ELIMINADO: Ya no aplicamos buffer aquí >>>
        // const blockedInicio = subDays(inicioEvento, 1);
        // const blockedFin = addDays(finEvento, 1);
        
        return {
          // Devolver las fechas ORIGINALES del evento
          inicio: startOfDay(inicioEvento), 
          fin: endOfDay(finEvento), 
          tipo: 'evento', // Marcar como evento (sin buffer)
          nombreEvento: e.nombreEvento || e.tipoEvento?.titulo || 'Evento'
        };
      })
      .filter(Boolean); // Filtrar cualquier resultado nulo de fechas inválidas
    
    const combinedRanges = [...reservasDirectas, ...reservasPorEvento];
    
    return combinedRanges;
  } catch (error) {
    console.error('Error al obtener fechas ocupadas:', error);
    return [];
  }
};

// Verifica disponibilidad de habitaciones para un rango de fechas
export const obtenerHabitacionesDisponibles = async (fechaInicio, fechaFin) => {
  try {
    // Obtener todas las habitaciones físicas (usando apiClient)
    const resHabitacionesAPI = await apiClient.get(`/habitaciones`);
    const todasHabitaciones = Array.isArray(resHabitacionesAPI?.data?.data) 
                              ? resHabitacionesAPI.data.data 
                              : []; // Asegurar que sea un array
                              
    const { reservasHabitacion: respHab, reservasEvento: respEv } = await obtenerTodasLasReservas();

    // Acceder a .data para obtener el array real
    const arrayReservasHab = respHab?.data || [];
    const arrayReservasEv = respEv?.data || [];
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    return todasHabitaciones.filter(habitacion => {
      const habitacionLetra = habitacion.letra; // Obtener la letra de la habitación física

      // Verificar si está reservada directamente (comparando letra)
      const reservadaDirectamente = arrayReservasHab.some(reserva => 
        (reserva.habitacion === habitacionLetra || reserva.letraHabitacion === habitacionLetra) && // Comparar letra
        hayOverlap(inicio, fin, new Date(reserva.fechaEntrada), new Date(reserva.fechaSalida))
      );
      
      if (reservadaDirectamente) return false;
      
      // Verificar si está reservada por algún evento (comparando letra en array poblado)
      const reservadaPorEvento = arrayReservasEv.some(evento => {
         const eventoInicio = new Date(evento.fecha); // Usar fecha
         const eventoFin = evento.fechaFin ? new Date(evento.fechaFin) : new Date(evento.fecha); // Usar fechaFin o fecha
         // Ajustar fin del evento
         // eventoFin.setHours(23, 59, 59, 999);

        return (
          evento.habitacionesReservadas && 
          evento.habitacionesReservadas.some(h => h.letra === habitacionLetra || h.id === habitacionLetra) && // Comparar letra/id poblado
          hayOverlap(inicio, fin, eventoInicio, eventoFin) // Usar fechas del evento
        )
      });
      
      return !reservadaPorEvento;
    });
  } catch (error) {
    console.error('Error al obtener habitaciones disponibles:', error);
    return [];
  }
};

// Función auxiliar para verificar si hay solapamiento entre fechas
const hayOverlap = (inicio1, fin1, inicio2, fin2) => {
  return (inicio1 <= fin2 && fin1 >= inicio2);
};

// *** FUNCIÓN REVISADA Y CORREGIDA ***
// Obtiene TODOS los rangos de fechas bloqueadas globalmente llamando a UN endpoint público/seguro
export const obtenerFechasBloqueadasGlobales = async () => {
  console.log('[disponibilidadService] Iniciando obtenerFechasBloqueadasGlobales...');
  try {
    const response = await apiClient.get('/api/reservas/habitaciones/fechas-ocupadas-global');
    // console.log('[disponibilidadService] Respuesta de obtenerFechasBloqueadasGlobales:', response);
    if (response && response.success && Array.isArray(response.data)) {
      const allBlockedRanges = response.data;

      const rangesWithDates = allBlockedRanges.map(range => {
        if (!range || !range.inicio || !range.fin) {
          console.warn("[disponibilidadService] Rango inválido recibido del backend:", range);
          return null;
        }
        const inicioDate = new Date(range.inicio);
        const finDate = new Date(range.fin);

        if (!isValid(inicioDate) || !isValid(finDate)) {
           console.warn("[disponibilidadService] Fechas inválidas en rango recibido:", range);
           return null;
        }
        
        return {
          ...range,
          inicio: inicioDate,
          fin: finDate
        };
      }).filter(Boolean);

      console.log('[disponibilidadService] Rangos bloqueados procesados (con Dates):', rangesWithDates);
      return rangesWithDates;
    } else {
      // Si la respuesta no tiene el formato esperado pero no es un error HTTP
      console.warn('[disponibilidadService] Respuesta inesperada de fechas-ocupadas-global:', response);
      return []; // Devolver array vacío
    }
  } catch (error) {
    console.error('[disponibilidadService] Error en obtenerFechasBloqueadasGlobales:', error.message || error);
    return []; // Devolver array vacío en caso de error
  }
  // Por si acaso, aunque la lógica anterior debería cubrirlo.
  return [];
}; 

// *** NUEVA: Obtiene fechas ocupadas GLOBALES solo de Eventos ***
export const obtenerFechasOcupadasEventosGlobales = async () => {
  console.log('[disponibilidadService] Iniciando obtenerFechasOcupadasEventosGlobales...');
  try {
    const response = await apiClient.get('/api/reservas/eventos/public/fechas-ocupadas-eventos');
    // Asumiendo que la respuesta directa es el array de rangos
    const eventRanges = Array.isArray(response) ? response : (response?.data || []);
    
    const rangesWithDates = eventRanges.map(range => {
      if (!range || !range.inicio || !range.fin) {
        console.warn("[disponibilidadService] Rango de evento inválido recibido:", range);
        return null;
      }
      const inicioDate = new Date(range.inicio);
      const finDate = new Date(range.fin);

      if (!isValid(inicioDate) || !isValid(finDate)) {
         console.warn("[disponibilidadService] Fechas inválidas en rango de evento:", range);
         return null;
      }
      
      return {
        ...range,
        inicio: inicioDate,
        fin: finDate,
        tipo: 'evento' // Añadir tipo explícitamente si no viene
      };
    }).filter(Boolean);

    console.log('[disponibilidadService][EventosGlobales] Rangos de fechas de eventos procesados:', rangesWithDates);
    return rangesWithDates;

  } catch (error) {
    console.error('Error al obtener fechas ocupadas globales de eventos:', error);
    toast.error('Error al cargar fechas de eventos.');
    return [];
  }
};

// *** NUEVA: Obtiene fechas ocupadas SOLO para una habitación específica ***
export const obtenerFechasOcupadasParaHabitacionEspecifica = async (habitacionId) => {
  if (!habitacionId) {
    console.warn('[disponibilidadService] Se requiere habitacionId para obtener fechas específicas.');
    return [];
  }
  console.log(`[disponibilidadService] Obteniendo fechas específicas para habitación: ${habitacionId}`);
  try {
    const response = await apiClient.get(`/api/reservas/habitaciones/${habitacionId}/fechas-ocupadas`);
    // Asumiendo que la respuesta directa es el array de rangos
    const rangesRaw = Array.isArray(response) ? response : (response?.data || []);
    
    const rangesTyped = rangesRaw.map(range => {
      if (!range || !range.inicio || !range.fin) {
        console.warn('[disponibilidadService] Rango de habitación inválido:', range);
        return null;
      }
      const inicio = new Date(range.inicio);
      const fin = new Date(range.fin);
      
      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        console.warn('[disponibilidadService] Rango con fechas inválidas para habitación:', range);
        return null;
      }
      
      return {
        inicio,
        fin,
        tipo: 'habitacion', 
        habitacionId 
      };
    }).filter(Boolean); 
    
    console.log(`[disponibilidadService] ${rangesTyped.length} fechas procesadas para Hab. ${habitacionId}`);
    return rangesTyped;
  } catch (error) {
    console.error(`Error al obtener fechas ocupadas para habitación ${habitacionId}:`, error);
    toast.error(`No se pudo cargar la disponibilidad detallada para la habitación ${habitacionId}.`);
    return [];
  }
};