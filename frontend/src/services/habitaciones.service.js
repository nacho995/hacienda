'use client';

import axios from 'axios';
import { toast } from 'sonner';
import apiClient from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Función auxiliar para obtener el token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Función auxiliar para configurar headers con autenticación
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Obtener todas las habitaciones
export const obtenerHabitaciones = async () => {
  try {
    const response = await apiClient.get('/habitaciones');
    // console.log('Respuesta de habitaciones:', response);
    return response;
  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    if (error.response?.status === 401) {
      toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    throw error;
  }
};

// Obtener todas las habitaciones por planta
export const obtenerHabitacionesPorPlanta = async (planta) => {
  try {
    const response = await apiClient.get(`/habitaciones/planta/${planta}`);
    return response;
  } catch (error) {
    console.error('Error al obtener las habitaciones por planta:', error);
    throw error;
  }
};

// Obtener habitaciones con sus reservas
export const obtenerHabitacionesConReservas = async () => {
  try {
    console.log('Iniciando obtención de habitaciones con reservas');
    
    // Obtener todas las habitaciones usando el cliente API que maneja automáticamente el token
    const habitacionesResponse = await apiClient.get('/habitaciones');
    console.log('Respuesta de habitaciones:', habitacionesResponse);

    // Asegurarnos de tener un array de habitaciones válido
    let habitaciones = [];
    if (Array.isArray(habitacionesResponse)) {
      habitaciones = habitacionesResponse;
    } else if (habitacionesResponse && habitacionesResponse.data) {
      if (Array.isArray(habitacionesResponse.data.data)) {
        habitaciones = habitacionesResponse.data.data;
      } else if (Array.isArray(habitacionesResponse.data)) {
        habitaciones = habitacionesResponse.data;
      } else {
        console.error('Formato incorrecto en respuesta de habitaciones:', habitacionesResponse);
        return []; // Retornar array vacío si el formato es incorrecto
      }
    } else {
      console.error('Habitaciones: Respuesta inválida', habitacionesResponse);
      return []; // Retornar array vacío si no hay datos válidos
    }

    // Log eliminado
    console.log(`Habitaciones encontradas: ${habitaciones.length}`);
    
    if (habitaciones.length === 0) {
      console.log('No se encontraron habitaciones');
      return []; // Retornar array vacío si no hay habitaciones
    }
    
    // Obtener todas las reservas usando el mismo cliente API
    const reservasResponse = await apiClient.get('/reservas/habitaciones');
    console.log('Respuesta de reservas:', reservasResponse);

    // Verificar la respuesta de reservas
    let reservas = [];
    if (Array.isArray(reservasResponse)) {
      reservas = reservasResponse;
    } else if (reservasResponse && reservasResponse.data) {
      if (Array.isArray(reservasResponse.data.data)) {
        reservas = reservasResponse.data.data;
      } else if (Array.isArray(reservasResponse.data)) {
        reservas = reservasResponse.data;
      } else {
        console.log('Formato incorrecto en respuesta de reservas:', reservasResponse);
        reservas = []; // Continuar con un array vacío de reservas
      }
    } else {
      console.log('No se pudo obtener las reservas:', reservasResponse);
      reservas = []; // Continuar con un array vacío de reservas
    }
    
    // Log eliminado
    console.log(`Reservas encontradas: ${reservas.length}`);

    // Mapear las habitaciones con sus reservas
    console.log('Procesando habitaciones con sus reservas');
    const habitacionesConReservas = habitaciones.map(habitacion => {
      // Asegurarse de que habitacion no sea null o undefined
      if (!habitacion) {
        console.log('Se encontró una habitación inválida en el array');
        return {
          id: 'error',
          letra: 'error',
          reservas: [],
          disponible: false,
          estado: 'Error' // Añadir estado para claridad
        };
      }

      // 1. Filtrar TODAS las reservas relevantes (activas, no canceladas) para esta habitación
      const todasLasReservasHabitacion = reservas.filter(
        reserva => {
          // Asegurarse que la reserva y la habitación tienen los campos necesarios
          if (!reserva || !reserva.habitacion || !habitacion || !habitacion.letra) return false; 
          
          // Comparar la letra de la habitación (asegurando mayúsculas/minúsculas)
          const pertenece = String(reserva.habitacion).trim().toUpperCase() === String(habitacion.letra).trim().toUpperCase();
          
          const activa = reserva.estadoReserva !== 'cancelada'; // Considerar solo reservas no canceladas
          
          return pertenece && activa;
        }
      );
      
      // 2. Determinar si la habitación tiene ALGUNA reserva activa asociada
      const tieneAlgunaReserva = todasLasReservasHabitacion.length > 0;
      
      // 3. Determinar el estado y disponibilidad FINAL basándose en si tiene reservas y estado base
      const estadoHabitacionBase = habitacion.estado || 'Disponible'; // Estado desde la BD
      let disponibleFinal = true; // Por defecto disponible
      
      if (estadoHabitacionBase === 'Disponible') {
          // Si está 'Disponible' por defecto, será no disponible si tiene ALGUNA reserva
          disponibleFinal = !tieneAlgunaReserva; 
      } else {
          // Si está en 'Mantenimiento' o 'No Disponible', siempre es no disponible
          disponibleFinal = false; 
      }
      
      // 4. Añadir logs para depuración si es necesario (opcional)
      // console.log(`Hab: ${habitacion.letra}, Estado Base: ${estadoHabitacionBase}, Tiene Alguna Reserva: ${tieneAlgunaReserva}, Disponible Final: ${disponibleFinal}`);

      return {
        ...habitacion,
        reservas: todasLasReservasHabitacion || [], // Devolvemos todas las reservas asociadas
        disponible: disponibleFinal,
      };
    });

    console.log('Habitaciones procesadas con éxito:', habitacionesConReservas.length);

    return habitacionesConReservas;

  } catch (error) {
    console.error('Error detallado al obtener habitaciones con reservas:', error);
    
    // Si es un error de autenticación, mostrar mensaje específico
    if (error.response?.status === 401) {
      console.error('Error de autenticación 401 detectado');
      toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    } else {
      toast.error('Error al cargar las habitaciones y sus reservas');
    }
    
    // Devolver array vacío para evitar errores al procesar la respuesta
    return [];
  }
};

// Obtener habitaciones disponibles para un evento
export const obtenerHabitacionesDisponibles = async (params) => {
  try {
    const response = await apiClient.get('/habitaciones/disponibles', { params });
    return response.data; // Asumiendo que el backend devuelve { success: true, data: [...] }
  } catch (error) {
    console.error('Error al obtener las habitaciones disponibles:', error);
    throw error;
  }
};

// Obtener una habitación por ID o letra
export const obtenerHabitacion = async (id) => {
  try {
    const response = await apiClient.get(`/habitaciones/${id}`);
    return response;
  } catch (error) {
    console.error('Error al obtener la habitación:', error);
    throw error;
  }
};

// Crear una nueva habitación
export const crearHabitacion = async (datos) => {
  try {
    const response = await apiClient.post('/habitaciones', datos);
    return response;
  } catch (error) {
    console.error('Error al crear habitación:', error);
    if (error.response?.status === 401) {
      toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    throw error;
  }
};

// Actualizar una habitación
export const actualizarHabitacion = async (id, datos) => {
  try {
    const response = await apiClient.put(`/habitaciones/${id}`, datos);
    return response;
  } catch (error) {
    console.error('Error al actualizar habitación:', error);
    if (error.response?.status === 401) {
      toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    throw error;
  }
};

// Eliminar una habitación
export const eliminarHabitacion = async (id) => {
  try {
    const response = await apiClient.delete(`/habitaciones/${id}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar habitación:', error);
    if (error.response?.status === 401) {
      toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    throw error;
  }
};

// Gestionar habitaciones para una reserva en modo hacienda
export const gestionarHabitacionesReserva = async (reservaId, datosHabitaciones) => {
  try {
    const response = await apiClient.put(
      `/reservas/${reservaId}/habitaciones`,
      datosHabitaciones
    );
    
    toast.success('Habitaciones gestionadas correctamente');
    return response;
  } catch (error) {
    console.error('Error al gestionar habitaciones de la reserva:', error);
    
    // Mensaje de error personalizado según el tipo de error
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.response?.status === 401) {
      toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    } else {
      toast.error('Error al gestionar las habitaciones');
    }
    
    throw error;
  }
};
