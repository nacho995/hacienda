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
router.get('/', obtenerHabitaciones);
router.get('/:id', obtenerHabitacion);

// Rutas protegidas para administradores
router.post('/', protectRoute, authorize('admin'), crearHabitacion);
router.put('/:id', protectRoute, authorize('admin'), actualizarHabitacion);
router.delete('/:id', protectRoute, authorize('admin'), eliminarHabitacion);

module.exports = router; 