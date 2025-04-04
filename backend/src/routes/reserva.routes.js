const express = require('express');
const {
  crearReservaHabitacion,
  obtenerReservasHabitacion,
  obtenerReservaHabitacion,
  actualizarReservaHabitacion,
  eliminarReservaHabitacion,
  comprobarDisponibilidadHabitacion,
  asignarReservaHabitacion
} = require('../controllers/reservaHabitacion.controller');

// Importar controladores para eventos y masajes
const {
  crearReservaEvento,
  obtenerReservasEvento,
  obtenerReservaEvento,
  actualizarReservaEvento,
  eliminarReservaEvento,
  comprobarDisponibilidadEvento,
  asignarReservaEvento,
  desasignarReserva
} = require('../controllers/reservaEvento.controller');

const {
  crearReservaMasaje,
  obtenerReservasMasaje,
  obtenerReservaMasaje,
  actualizarReservaMasaje,
  eliminarReservaMasaje,
  comprobarDisponibilidadMasaje,
  asignarReservaMasaje
} = require('../controllers/reservaMasaje.controller');

const { protectRoute, authorize } = require('../middleware/auth');

const router = express.Router();

// Rutas para reservas de habitaciones
router.post('/habitaciones/disponibilidad', comprobarDisponibilidadHabitacion);

router.route('/habitaciones')
  .post(protectRoute, crearReservaHabitacion)
  .get(protectRoute, obtenerReservasHabitacion);

router.route('/habitaciones/:id')
  .get(protectRoute, obtenerReservaHabitacion)
  .put(protectRoute, actualizarReservaHabitacion)
  .delete(protectRoute, eliminarReservaHabitacion);

// Ruta para asignar reservas de habitaciones
router.put('/habitaciones/:id/asignar', protectRoute, authorize('admin'), asignarReservaHabitacion);

// Rutas para eventos
router.post('/eventos/disponibilidad', comprobarDisponibilidadEvento);

router.route('/eventos')
  .post(protectRoute, crearReservaEvento)
  .get(protectRoute, obtenerReservasEvento);

router.route('/eventos/:id')
  .get(protectRoute, obtenerReservaEvento)
  .put(protectRoute, actualizarReservaEvento)
  .delete(protectRoute, eliminarReservaEvento);

// Nuevas rutas para asignar/desasignar reservas
router.put('/eventos/:id/asignar', protectRoute, authorize('admin'), asignarReservaEvento);
router.put('/eventos/:id/desasignar', protectRoute, desasignarReserva);

// Rutas para masajes
router.post('/masajes/disponibilidad', comprobarDisponibilidadMasaje);

router.route('/masajes')
  .post(protectRoute, crearReservaMasaje)
  .get(protectRoute, obtenerReservasMasaje);

router.route('/masajes/:id')
  .get(protectRoute, obtenerReservaMasaje)
  .put(protectRoute, actualizarReservaMasaje)
  .delete(protectRoute, eliminarReservaMasaje);

// Ruta para asignar reservas de masajes
router.put('/masajes/:id/asignar', protectRoute, authorize('admin'), asignarReservaMasaje);

module.exports = router; 