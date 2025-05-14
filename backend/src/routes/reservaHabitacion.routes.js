const express = require('express');
const router = express.Router();
// Importar el objeto controlador completo
const reservaHabitacionController = require('../controllers/reservaHabitacionController');
const { protectRoute, authorize } = require('../middleware/auth');
// const advancedResults = require('../middleware/advancedResults');
const ReservaHabitacion = require('../models/ReservaHabitacion');

// --- Public Routes --- (Prefixed with /api/reservas/habitaciones in app.js)
router.get('/fechas-ocupadas-global', reservaHabitacionController.getGlobalOccupiedDates);
router.get('/fechas-ocupadas', reservaHabitacionController.getHabitacionOccupiedDates);
router.post('/verificar-disponibilidad', reservaHabitacionController.checkHabitacionAvailability);
router.route('/public/fechas-ocupadas-habitaciones')
    .get(reservaHabitacionController.getPublicOccupiedRoomDates);

// --- User-Specific Protected Routes --- (Prefixed with /api/reservas/habitaciones in app.js)
router.get('/usuario', protectRoute, reservaHabitacionController.getReservasHabitacionUsuario);
router.post('/usuario/:id/cancelar', protectRoute, reservaHabitacionController.cancelarReservaHabitacionUsuario);

// --- Batch Creation Route --- (Mounted at /api/reservas/habitaciones/batch)
router.post('/batch', protectRoute, authorize('admin'), reservaHabitacionController.createMultipleReservacionesHabitacion);

// --- Specific Actions on ID --- (ANTES de la ruta genérica /:id)
router.put('/:id/asignar', protectRoute, authorize('admin'), reservaHabitacionController.asignarReservaHabitacion);
router.put('/:id/desasignar', protectRoute, authorize('admin'), reservaHabitacionController.desasignarReservaHabitacion);
router.patch('/:id/estado', protectRoute, authorize('admin'), reservaHabitacionController.actualizarEstadoReservaHabitacion);
router.put('/:id/huespedes', protectRoute, authorize('admin'), reservaHabitacionController.updateReservaHabitacionHuespedes);
router.post('/:id/create-payment-intent', protectRoute, reservaHabitacionController.createHabitacionPaymentIntent);
router.put('/:id/seleccionar-pago', protectRoute, reservaHabitacionController.seleccionarMetodoPagoHabitacion);
router.get('/:habitacionId/fechas-ocupadas', protectRoute, reservaHabitacionController.getOccupiedDatesForRoomById); // Usamos :habitacionId aquí y separamos el .get

// --- Routes for Specific ID --- (DESPUÉS de las rutas específicas)
router.route('/:id')
  .get(protectRoute, authorize('admin', 'recepcionista', 'cliente'), reservaHabitacionController.getReservaHabitacionById)
  .put(protectRoute, authorize('admin', 'recepcionista'), reservaHabitacionController.updateReservaHabitacion)
  .delete(protectRoute, authorize('admin'), reservaHabitacionController.deleteReservaHabitacion);

// --- Base Routes for / --- (Mounted at /api/reservas/habitaciones)
router.route('/')
  .get(protectRoute, authorize('admin', 'recepcionista'), reservaHabitacionController.getAllReservasHabitacion)
  .post(reservaHabitacionController.createReservaHabitacion);

module.exports = router; 