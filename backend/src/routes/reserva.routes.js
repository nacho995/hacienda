const express = require('express');
const {
  checkHabitacionAvailability,
  getHabitacionOccupiedDates,
  createReservaHabitacion,
  getReservasHabitacion,
  getReservaHabitacion,
  updateReservaHabitacion,
  deleteReservaHabitacion,
  assignReservaHabitacion,
  unassignReservaHabitacion,
  updateReservaHabitacionHuespedes
} = require('../controllers/reservaHabitacionController');

// Importar controladores para eventos
const {
  checkEventoAvailability,
  getEventoOccupiedDates,
  crearReservaEvento,
  obtenerReservasEvento,
  obtenerReservaEvento,
  actualizarReservaEvento,
  eliminarReservaEvento,
  assignReservaEvento,
  unassignReservaEvento,
  obtenerHabitacionesEvento,
  actualizarHabitacionEvento,
  getEventoServicios,
  addEventoServicio,
  removeEventoServicio
} = require('../controllers/reservaEvento.controller');

const { protectRoute, authorize } = require('../middleware/auth');

const router = express.Router();

// ========================
// RUTAS PARA HABITACIONES
// ========================

// Rutas públicas para habitaciones
router.post('/habitaciones/disponibilidad', checkHabitacionAvailability);
router.get('/habitaciones/fechas-ocupadas', getHabitacionOccupiedDates);
router.post('/habitaciones', createReservaHabitacion);

// Rutas protegidas para habitaciones
router.get('/habitaciones', protectRoute, getReservasHabitacion);
router.get('/habitaciones/:id', protectRoute, getReservaHabitacion);
router.put('/habitaciones/:id', protectRoute, updateReservaHabitacion);
router.delete('/habitaciones/:id', protectRoute, deleteReservaHabitacion);

// Asignar/desasignar reserva a un usuario
router.put('/habitaciones/:id/asignar', protectRoute, assignReservaHabitacion);
router.put('/habitaciones/:id/desasignar', protectRoute, unassignReservaHabitacion);

// Nueva ruta para actualizar información de huéspedes (solo Admin)
router.put('/habitaciones/:id/huespedes', protectRoute, authorize('admin'), updateReservaHabitacionHuespedes);

// ==================
// RUTAS PARA EVENTOS
// ==================

// Rutas públicas para eventos
router.post('/eventos/disponibilidad', checkEventoAvailability);
router.get('/eventos/fechas-ocupadas', getEventoOccupiedDates);
router.post('/eventos', crearReservaEvento);

// Rutas protegidas para eventos
router.get('/eventos', protectRoute, obtenerReservasEvento);
router.get('/eventos/:id', protectRoute, obtenerReservaEvento);
router.put('/eventos/:id', protectRoute, actualizarReservaEvento);
router.delete('/eventos/:id', protectRoute, eliminarReservaEvento);

// Asignar/desasignar reserva a un usuario
router.put('/eventos/:id/asignar', protectRoute, assignReservaEvento);
router.put('/eventos/:id/desasignar', protectRoute, unassignReservaEvento);

// Rutas protegidas para eventos (solo admin o cliente autenticado)
router.get('/eventos/:id/habitaciones', protectRoute, obtenerHabitacionesEvento);
router.put('/eventos/:eventoId/habitaciones/:letraHabitacion', protectRoute, actualizarHabitacionEvento);

// Rutas para gestionar habitaciones específicas de un evento
router.get('/eventos/:id/habitaciones', protectRoute, obtenerHabitacionesEvento);
router.put('/eventos/:eventoId/habitaciones/:letraHabitacion', protectRoute, actualizarHabitacionEvento);

// --- NUEVAS RUTAS PARA GESTIONAR SERVICIOS DE UN EVENTO ---
router.get('/eventos/:id/servicios', protectRoute, authorize('admin'), getEventoServicios);
router.post('/eventos/:id/servicios', protectRoute, authorize('admin'), addEventoServicio); 
router.delete('/eventos/:id/servicios/:servicioId', protectRoute, authorize('admin'), removeEventoServicio);

module.exports = router;