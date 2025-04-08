const express = require('express');
const router = express.Router();

const {
  obtenerTiposHabitacion,
  obtenerTipoHabitacion,
  crearTipoHabitacion,
  actualizarTipoHabitacion,
  eliminarTipoHabitacion
} = require('../controllers/tipoHabitacion.controller');

const { protectRoute, authorize } = require('../middleware/auth');

// Rutas públicas
router.get('/', obtenerTiposHabitacion);
router.get('/:id', obtenerTipoHabitacion);

// Rutas protegidas (solo admin)
router.post('/', protectRoute, authorize('admin'), crearTipoHabitacion);
router.put('/:id', protectRoute, authorize('admin'), actualizarTipoHabitacion);
router.delete('/:id', protectRoute, authorize('admin'), eliminarTipoHabitacion);

module.exports = router; 