const express = require('express');
const router = express.Router();
const { protectRoute, authorize } = require('../middleware/auth');
const {
  obtenerHabitaciones,
  obtenerHabitacion,
  crearHabitacion,
  actualizarHabitacion,
  eliminarHabitacion
} = require('../controllers/habitacion.controller');

// Rutas públicas
router.route('/').get(obtenerHabitaciones);
router.route('/:id').get(obtenerHabitacion);

// Rutas protegidas para administradores
router.route('/')
  .post(protectRoute, authorize('admin'), crearHabitacion);

router.route('/:id')
  .put(protectRoute, authorize('admin'), actualizarHabitacion)
  .delete(protectRoute, authorize('admin'), eliminarHabitacion);

module.exports = router; 