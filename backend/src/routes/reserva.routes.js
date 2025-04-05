const express = require('express');
const {
  crearReservaHabitacion,
  obtenerReservasHabitacion,
  obtenerReservaHabitacion,
  actualizarReservaHabitacion,
  eliminarReservaHabitacion,
  comprobarDisponibilidadHabitacion,
  asignarReservaHabitacion,
  obtenerFechasOcupadas: obtenerFechasOcupadasHabitacion
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
  desasignarReserva,
  obtenerFechasOcupadas: obtenerFechasOcupadasEvento
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

// Rutas públicas para habitaciones
router.post('/habitaciones/disponibilidad', comprobarDisponibilidadHabitacion);
router.get('/habitaciones/fechas-ocupadas', obtenerFechasOcupadasHabitacion);
router.get('/habitaciones', obtenerReservasHabitacion);
router.post('/habitaciones', crearReservaHabitacion);

// Rutas protegidas para habitaciones
router.route('/habitaciones/:id')
  .get(protectRoute, obtenerReservaHabitacion)
  .put(protectRoute, actualizarReservaHabitacion)
  .delete(protectRoute, eliminarReservaHabitacion);

router.put('/habitaciones/:id/asignar', protectRoute, authorize('admin'), asignarReservaHabitacion);

// Rutas para eventos
router.post('/eventos/disponibilidad', comprobarDisponibilidadEvento);
router.get('/eventos/fechas-ocupadas', obtenerFechasOcupadasEvento);
router.post('/eventos', crearReservaEvento);

router.route('/eventos')
  .get(protectRoute, obtenerReservasEvento);

router.route('/eventos/:id')
  .get(protectRoute, obtenerReservaEvento)
  .put(protectRoute, actualizarReservaEvento)
  .delete(protectRoute, eliminarReservaEvento);

router.put('/eventos/:id/asignar', protectRoute, authorize('admin'), asignarReservaEvento);
router.put('/eventos/:id/desasignar', protectRoute, authorize('admin'), desasignarReserva);

// Rutas para masajes
router.post('/masajes/disponibilidad', comprobarDisponibilidadMasaje);
router.post('/masajes', crearReservaMasaje);

router.route('/masajes')
  .get(protectRoute, obtenerReservasMasaje);

router.route('/masajes/:id')
  .get(protectRoute, obtenerReservaMasaje)
  .put(protectRoute, actualizarReservaMasaje)
  .delete(protectRoute, eliminarReservaMasaje);

router.put('/masajes/:id/asignar', protectRoute, authorize('admin'), asignarReservaMasaje);

module.exports = router; 