const express = require('express');
const {
  checkHabitacionAvailability,
  getHabitacionOccupiedDates,
  createReservaHabitacion,
  getReservasHabitacion,
  getReservaHabitacionById,
  updateReservaHabitacion,
  deleteReservaHabitacion,
  asignarReservaHabitacion,
  desasignarReservaHabitacion,
  updateReservaHabitacionHuespedes,
  getAllHabitacionOccupiedDates,
  actualizarEstadoReservaHabitacion,
  verificarDisponibilidadRango,
  createHabitacionPaymentIntent,
  seleccionarMetodoPagoHabitacion,
  createMultipleReservacionesHabitacion
} = require('../controllers/reservaHabitacionController');

// Importar controladores para eventos
const {
  checkEventoAvailability,
  getEventoOccupiedDates,
  createReservaEvento,
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
  asignarEventoAdmin,
  seleccionarMetodoPagoEvento,
  createEventoPaymentIntent,
  getEventoFechasEnRango
} = require('../controllers/reservaEvento.controller');

const { protectRoute, authorize } = require('../middleware/auth');
const reservaEstadoController = require('../controllers/reservaEstado.controller');

const router = express.Router();

// ========================
// RUTAS PARA HABITACIONES
// ========================

// Rutas públicas para habitaciones
router.post('/habitaciones/verificar-disponibilidad-rango', verificarDisponibilidadRango);
router.get('/habitaciones/fechas-ocupadas-todas', getAllHabitacionOccupiedDates);
router.post('/habitaciones/disponibilidad', checkHabitacionAvailability);
router.get('/habitaciones/fechas-ocupadas', getHabitacionOccupiedDates);

// Rutas de Creación
router.post('/habitaciones', protectRoute, createReservaHabitacion);
router.post('/habitaciones/batch', protectRoute, createMultipleReservacionesHabitacion);

// Rutas protegidas para habitaciones
router.get('/habitaciones', protectRoute, getReservasHabitacion);
router.get('/habitaciones/:id', protectRoute, getReservaHabitacionById);
router.patch('/habitaciones/:id', protectRoute, updateReservaHabitacion);
router.delete('/habitaciones/:id', protectRoute, deleteReservaHabitacion);

// Asignar/desasignar reserva a un usuario
router.put('/habitaciones/:id/asignar', protectRoute, authorize('admin'), asignarReservaHabitacion);
router.put('/habitaciones/:id/desasignar', protectRoute, desasignarReservaHabitacion);

// Nueva ruta para actualizar información de huéspedes (solo Admin)
router.put('/habitaciones/:id/huespedes', protectRoute, authorize('admin'), updateReservaHabitacionHuespedes);

// --- RUTA PARA CREAR PAYMENT INTENT (STRIPE) HABITACIÓN --- 
router.post('/habitaciones/:id/create-payment-intent', protectRoute, createHabitacionPaymentIntent);

// --- RUTA PARA SELECCIONAR MÉTODO DE PAGO HABITACIÓN (Transferencia/Efectivo) --- 
router.put('/habitaciones/:id/seleccionar-pago', protectRoute, seleccionarMetodoPagoHabitacion);
// ------------------------------------------------------------------------------

// ==================
// RUTAS PARA EVENTOS
// ==================

// --- Rutas más específicas PRIMERO ---
router.get('/eventos/fechas-ocupadas', getEventoOccupiedDates);
router.get('/eventos/fechas-en-rango', getEventoFechasEnRango);
router.get('/eventos/:id/habitaciones', protectRoute, authorize('admin'), obtenerHabitacionesEvento);
router.get('/eventos/:id/servicios', protectRoute, authorize('admin'), getEventoServicios);

// --- Rutas públicas restantes ---
router.post('/eventos/disponibilidad', checkEventoAvailability);
router.post('/eventos', createReservaEvento);

// --- Rutas protegidas con /:id GENÉRICO --- 
router.get('/eventos', protectRoute, obtenerReservasEvento);
router.get('/eventos/:id', protectRoute, obtenerReservaEvento);
router.put('/eventos/:id', protectRoute, actualizarReservaEvento);
router.delete('/eventos/:id', protectRoute, eliminarReservaEvento);
router.put('/eventos/:id/asignar', protectRoute, authorize('admin'), asignarEventoAdmin);
router.put('/eventos/:id/desasignar', protectRoute, unassignReservaEvento);

// --- Rutas de gestión (con /:id pero más específicas después) ---
router.put('/eventos/:eventoId/habitaciones/:letraHabitacion', protectRoute, actualizarHabitacionEvento);
router.post('/eventos/:eventoId/habitaciones', protectRoute, authorize('admin'), addHabitacionAEvento);
router.delete('/eventos/:eventoId/habitaciones/:habitacionId', protectRoute, authorize('admin'), removeHabitacionDeEvento);
router.post('/eventos/:id/servicios', protectRoute, authorize('admin'), addEventoServicio); 
router.delete('/eventos/:id/servicios/:servicioId', protectRoute, authorize('admin'), removeEventoServicio);

// --- RUTAS DE PAGO (al final de las rutas con /:id) ---
router.put('/eventos/:id/seleccionar-pago', protectRoute, seleccionarMetodoPagoEvento);
router.post('/eventos/:id/create-payment-intent', protectRoute, createEventoPaymentIntent);

// ==========================
// RUTA PARA ACTUALIZAR ESTADO (ADMIN)
// ==========================
router.patch('/habitaciones/:id/estado', 
  protectRoute, 
  authorize('admin'), 
  actualizarEstadoReservaHabitacion
);

module.exports = router;