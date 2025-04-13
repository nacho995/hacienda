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

// Rutas de Creación (PÚBLICAS)
router.post('/habitaciones', createReservaHabitacion);
router.post('/habitaciones/batch', createMultipleReservacionesHabitacion);

// Rutas protegidas para habitaciones (ADMIN)
router.get('/habitaciones', protectRoute, authorize('admin'), getReservasHabitacion);
router.get('/habitaciones/:id', protectRoute, authorize('admin'), getReservaHabitacionById);
router.patch('/habitaciones/:id', protectRoute, authorize('admin'), updateReservaHabitacion);
router.delete('/habitaciones/:id', protectRoute, authorize('admin'), deleteReservaHabitacion);

// Asignar/desasignar reserva a un usuario (ADMIN)
router.put('/habitaciones/:id/asignar', protectRoute, authorize('admin'), asignarReservaHabitacion);
router.put('/habitaciones/:id/desasignar', protectRoute, desasignarReservaHabitacion);

// Nueva ruta para actualizar información de huéspedes (ADMIN)
router.put('/habitaciones/:id/huespedes', protectRoute, authorize('admin'), updateReservaHabitacionHuespedes);

// --- RUTA PARA CREAR PAYMENT INTENT (STRIPE) HABITACIÓN (PÚBLICA) --- 
router.post('/habitaciones/:id/create-payment-intent', createHabitacionPaymentIntent);

// --- RUTA PARA SELECCIONAR MÉTODO DE PAGO HABITACIÓN (Transferencia/Efectivo) (PÚBLICA) --- 
router.put('/habitaciones/:id/seleccionar-pago', seleccionarMetodoPagoHabitacion);
// ------------------------------------------------------------------------------

// ==================
// RUTAS PARA EVENTOS
// ==================

// --- Rutas más específicas PRIMERO ---
router.get('/eventos/fechas-ocupadas', getEventoOccupiedDates); // Pública
router.get('/eventos/fechas-en-rango', getEventoFechasEnRango); // Pública
router.get('/eventos/:id/habitaciones', protectRoute, authorize('admin'), obtenerHabitacionesEvento); // Admin
router.get('/eventos/:id/servicios', protectRoute, authorize('admin'), getEventoServicios); // Admin

// --- Rutas públicas restantes ---
router.post('/eventos/disponibilidad', checkEventoAvailability); // Pública
router.post('/eventos', createReservaEvento); // Pública

// --- Rutas protegidas con /:id GENÉRICO (ADMIN)--- 
router.get('/eventos', protectRoute, authorize('admin'), obtenerReservasEvento);
router.get('/eventos/:id', protectRoute, authorize('admin'), obtenerReservaEvento);
router.put('/eventos/:id', protectRoute, authorize('admin'), actualizarReservaEvento);
router.delete('/eventos/:id', protectRoute, authorize('admin'), eliminarReservaEvento);
router.put('/eventos/:id/asignar', protectRoute, authorize('admin'), asignarEventoAdmin);
router.put('/eventos/:id/desasignar', protectRoute, authorize('admin'), unassignReservaEvento);

// --- Rutas de gestión (ADMIN) ---
router.put('/eventos/:eventoId/habitaciones/:letraHabitacion', protectRoute, authorize('admin'), actualizarHabitacionEvento);
router.post('/eventos/:eventoId/habitaciones', protectRoute, authorize('admin'), addHabitacionAEvento);
router.delete('/eventos/:eventoId/habitaciones/:habitacionId', protectRoute, authorize('admin'), removeHabitacionDeEvento);
router.post('/eventos/:id/servicios', protectRoute, authorize('admin'), addEventoServicio); 
router.delete('/eventos/:id/servicios/:servicioId', protectRoute, authorize('admin'), removeEventoServicio);

// --- RUTAS DE PAGO (PÚBLICAS) ---
router.put('/eventos/:id/seleccionar-pago', seleccionarMetodoPagoEvento); // Pública (ya estaba)
router.post('/eventos/:id/create-payment-intent', createEventoPaymentIntent); // Pública

// ==========================
// RUTA PARA ACTUALIZAR ESTADO (ADMIN)
// ==========================
router.patch('/habitaciones/:id/estado', 
  protectRoute, 
  authorize('admin'), 
  actualizarEstadoReservaHabitacion
);

module.exports = router;