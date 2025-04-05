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
  asignarReservaMasaje,
  desasignarReservaMasaje,
  getMasajeReservations
} = require('../controllers/reservaMasaje.controller');

const { protectRoute, authorize } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas para habitaciones
router.post('/habitaciones/disponibilidad', comprobarDisponibilidadHabitacion);
router.get('/habitaciones/fechas-ocupadas', obtenerFechasOcupadasHabitacion);
router.get('/habitaciones', obtenerReservasHabitacion);
router.post('/habitaciones', crearReservaHabitacion);
router.get('/habitaciones/:id', obtenerReservaHabitacion);

// Rutas protegidas para habitaciones (solo admin)
router.put('/habitaciones/:id', protectRoute, authorize('admin'), actualizarReservaHabitacion);
router.delete('/habitaciones/:id', protectRoute, authorize('admin'), eliminarReservaHabitacion);
router.put('/habitaciones/:id/asignar', protectRoute, authorize('admin'), asignarReservaHabitacion);

// Rutas públicas para eventos
router.post('/eventos/disponibilidad', comprobarDisponibilidadEvento);
router.get('/eventos/fechas-ocupadas', obtenerFechasOcupadasEvento);
router.post('/eventos', crearReservaEvento);
router.get('/eventos/:id', obtenerReservaEvento);

// Rutas protegidas para eventos (solo admin)
router.get('/eventos', protectRoute, authorize('admin'), obtenerReservasEvento);
router.get('/eventos/masajes/lista', protectRoute, authorize('admin'), getMasajeReservations);
router.put('/eventos/:id', protectRoute, authorize('admin'), actualizarReservaEvento);
router.delete('/eventos/:id', protectRoute, authorize('admin'), eliminarReservaEvento);
router.put('/eventos/:id/asignar', protectRoute, authorize('admin'), asignarReservaEvento);
router.put('/eventos/:id/desasignar', protectRoute, authorize('admin'), desasignarReserva);

// Rutas públicas para masajes
router.post('/masajes/disponibilidad', comprobarDisponibilidadMasaje);
router.post('/masajes', crearReservaMasaje);
router.get('/masajes/:id', obtenerReservaMasaje);

// Rutas protegidas para masajes (solo admin)
router.get('/masajes', protectRoute, authorize('admin'), obtenerReservasMasaje);
router.put('/masajes/:id', protectRoute, authorize('admin'), actualizarReservaMasaje);
router.delete('/masajes/:id', protectRoute, authorize('admin'), eliminarReservaMasaje);
router.put('/masajes/:id/asignar', protectRoute, authorize('admin'), asignarReservaMasaje);
router.put('/masajes/:id/desasignar', protectRoute, authorize('admin'), desasignarReservaMasaje);

module.exports = router; 