import apiClient from './apiClient';

// Servicios para reservas de habitaciones
export const getHabitacionReservations = async () => {
  try {
    const response = await apiClient.get('/api/reservas/habitaciones');
    return response.data;
  } catch (error) {
    console.error('Error fetching habitacion reservations:', error);
    throw error;
  }
};

export const getHabitacionReservation = async (id) => {
  try {
    const response = await apiClient.get(`/api/reservas/habitaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching habitacion reservation ${id}:`, error);
    throw error;
  }
};

export const createHabitacionReservation = async (reservationData) => {
  try {
    const response = await apiClient.post('/api/reservas/habitaciones', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error creating habitacion reservation:', error);
    throw error;
  }
};

export const updateHabitacionReservation = async (id, reservationData) => {
  try {
    const response = await apiClient.put(`/api/reservas/habitaciones/${id}`, reservationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating habitacion reservation ${id}:`, error);
    throw error;
  }
};

export const asignarHabitacionReservation = async (id, usuarioId) => {
  try {
    const response = await apiClient.put(`/api/reservas/habitaciones/${id}/asignar`, { usuarioId });
    return response.data;
  } catch (error) {
    console.error(`Error asignando habitacion reservation ${id}:`, error);
    throw error;
  }
};

// Servicios para reservas de eventos
export const getEventoReservations = async () => {
  try {
    const response = await apiClient.get('/api/reservas/eventos');
    return response.data;
  } catch (error) {
    console.error('Error fetching evento reservations:', error);
    throw error;
  }
};

export const getEventoReservation = async (id) => {
  try {
    const response = await apiClient.get(`/api/reservas/eventos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching evento reservation ${id}:`, error);
    throw error;
  }
};

export const createEventoReservation = async (reservationData) => {
  try {
    const response = await apiClient.post('/api/reservas/eventos', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error creating evento reservation:', error);
    throw error;
  }
};

export const updateEventoReservation = async (id, reservationData) => {
  try {
    const response = await apiClient.put(`/api/reservas/eventos/${id}`, reservationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating evento reservation ${id}:`, error);
    throw error;
  }
};

export const asignarEventoReservation = async (id, usuarioId) => {
  try {
    const response = await apiClient.put(`/api/reservas/eventos/${id}/asignar`, { usuarioId });
    return response.data;
  } catch (error) {
    console.error(`Error asignando evento reservation ${id}:`, error);
    throw error;
  }
};

// Servicios para reservas de masajes
export const getMasajeReservations = async () => {
  try {
    const response = await apiClient.get('/api/reservas/masajes');
    return response.data;
  } catch (error) {
    console.error('Error fetching masaje reservations:', error);
    throw error;
  }
};

export const getMasajeReservation = async (id) => {
  try {
    const response = await apiClient.get(`/api/reservas/masajes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching masaje reservation ${id}:`, error);
    throw error;
  }
};

export const createMasajeReservation = async (reservationData) => {
  try {
    const response = await apiClient.post('/api/reservas/masajes', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error creating masaje reservation:', error);
    throw error;
  }
};

export const updateMasajeReservation = async (id, reservationData) => {
  try {
    const response = await apiClient.put(`/api/reservas/masajes/${id}`, reservationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating masaje reservation ${id}:`, error);
    throw error;
  }
};

export const asignarMasajeReservation = async (id, usuarioId) => {
  try {
    const response = await apiClient.put(`/api/reservas/masajes/${id}/asignar`, { usuarioId });
    return response.data;
  } catch (error) {
    console.error(`Error asignando masaje reservation ${id}:`, error);
    throw error;
  }
};

// Verificar disponibilidad
export const checkHabitacionAvailability = async (availabilityData) => {
  try {
    const response = await apiClient.post('/api/reservas/habitaciones/disponibilidad', availabilityData);
    return response.data;
  } catch (error) {
    console.error('Error checking habitacion availability:', error);
    throw error;
  }
};

export const checkEventoAvailability = async (availabilityData) => {
  try {
    const response = await apiClient.post('/api/reservas/eventos/disponibilidad', availabilityData);
    return response.data;
  } catch (error) {
    console.error('Error checking evento availability:', error);
    throw error;
  }
};

export const checkMasajeAvailability = async (availabilityData) => {
  try {
    const response = await apiClient.post('/api/reservas/masajes/disponibilidad', availabilityData);
    return response.data;
  } catch (error) {
    console.error('Error checking masaje availability:', error);
    throw error;
  }
}; 