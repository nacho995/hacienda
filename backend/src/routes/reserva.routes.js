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
  updateReservaHabitacionHuespedes,
  asignarHabitacionAdmin
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
  removeEventoServicio,
  addHabitacionAEvento,
  removeHabitacionDeEvento,
  asignarEventoAdmin
} = require('../controllers/reservaEvento.controller');

const { protectRoute, authorize } = require('../middleware/auth');
const reservaEstadoController = require('../controllers/reservaEstado.controller');

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
router.patch('/habitaciones/:id', protectRoute, updateReservaHabitacion);
router.delete('/habitaciones/:id', protectRoute, deleteReservaHabitacion);

// Asignar/desasignar reserva a un usuario
router.put('/habitaciones/:id/asignar', protectRoute, authorize('admin'), asignarHabitacionAdmin);
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
router.put('/eventos/:id/asignar', protectRoute, authorize('admin'), asignarEventoAdmin);
router.put('/eventos/:id/desasignar', protectRoute, unassignReservaEvento);

// Rutas protegidas para eventos (solo admin o cliente autenticado)
router.get('/eventos/:id/habitaciones', protectRoute, obtenerHabitacionesEvento);
router.put('/eventos/:eventoId/habitaciones/:letraHabitacion', protectRoute, actualizarHabitacionEvento);

// Rutas para gestionar habitaciones específicas de un evento
router.get('/eventos/:id/habitaciones', protectRoute, obtenerHabitacionesEvento);
router.put('/eventos/:eventoId/habitaciones/:letraHabitacion', protectRoute, actualizarHabitacionEvento);

// --- RUTAS PARA GESTIONAR HABITACIONES DE UN EVENTO (ADMIN) ---
router.get('/eventos/:id/habitaciones', protectRoute, authorize('admin'), obtenerHabitacionesEvento);
// Añadir una habitación a un evento
router.post('/eventos/:eventoId/habitaciones', protectRoute, authorize('admin'), addHabitacionAEvento);
// Eliminar una habitación específica de un evento
router.delete('/eventos/:eventoId/habitaciones/:habitacionId', protectRoute, authorize('admin'), removeHabitacionDeEvento);
// NOTA: La ruta PUT para actualizar una habitación individual ya existe en la sección de habitaciones:
// router.put('/habitaciones/:id', protectRoute, authorize('admin'), updateReservaHabitacion);
// Podemos reutilizarla desde el frontend pasando el ID de la ReservaHabitacion.

// --- RUTAS PARA GESTIONAR SERVICIOS DE UN EVENTO (ADMIN) ---
router.get('/eventos/:id/servicios', protectRoute, authorize('admin'), getEventoServicios);
router.post('/eventos/:id/servicios', protectRoute, authorize('admin'), addEventoServicio); 
router.delete('/eventos/:id/servicios/:servicioId', protectRoute, authorize('admin'), removeEventoServicio);

// ==========================
// RUTA PARA ACTUALIZAR ESTADO (ADMIN)
// ==========================
router.put('/estado', protectRoute, authorize('admin'), reservaEstadoController.actualizarEstado);

module.exports = router;