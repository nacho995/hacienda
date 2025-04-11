const express = require('express');
const router = express.Router();

const {
  obtenerTiposHabitacion,
  obtenerTipoHabitacion,
  crearTipoHabitacion,
  actualizarTipoHabitacion,
  eliminarTipoHabitacion
} = require('../controllers/tipoHabitacion.controller.js');

// Asegúrate que la ruta y los nombres de exportación son correctos
const { verifyToken, isAdmin } = require('../middlewares/authJwt.js'); 

// Rutas públicas
router.get('/', obtenerTiposHabitacion);
router.get('/:id', obtenerTipoHabitacion);

// Rutas protegidas (solo admin)
router.post('/', verifyToken, isAdmin, crearTipoHabitacion);
router.put('/:id', verifyToken, isAdmin, actualizarTipoHabitacion);
router.delete('/:id', verifyToken, isAdmin, eliminarTipoHabitacion);

module.exports = router; 